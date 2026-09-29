"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { fieldErrors, loginSchema, registerSchema, safeNext } from "@/lib/validation";

export interface FormState {
  error?: string;
  fields?: Record<string, string>;
  ok?: boolean;
  message?: string;
  /** Where the client should navigate after success (full reload so the bag re-syncs). */
  next?: string;
}

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// Verified against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = hashPassword("not-a-real-password");

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const { email, password, firstName, lastName, phone } = parsed.data;

  const [exists] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists) return { fields: { email: "An account with this email already exists. Try signing in." } };

  const [user] = await db
    .insert(schema.users)
    .values({ email, passwordHash: await hashPassword(password), firstName, lastName, phone })
    .onConflictDoNothing()
    .returning({ id: schema.users.id });
  if (!user) return { fields: { email: "An account with this email already exists. Try signing in." } };

  await createSession(user.id, "customer");
  return { ok: true, next: safeNext(fd.get("next")) };
}

async function authenticate(fd: FormData, requireAdmin: boolean): Promise<FormState | { userId: string; role: "customer" | "admin" }> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const { email, password } = parsed.data;

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user) {
    await verifyPassword(password, await DUMMY_HASH);
    return { error: "Incorrect email or password." };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: `Too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.` };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1;
    await db
      .update(schema.users)
      .set({
        failedLogins: failed >= MAX_FAILED ? 0 : sql`${schema.users.failedLogins} + 1`,
        lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      })
      .where(eq(schema.users.id, user.id));
    return { error: "Incorrect email or password." };
  }
  if (requireAdmin && user.role !== "admin") return { error: "This account does not have admin access." };

  if (user.failedLogins || user.lockedUntil) {
    await db.update(schema.users).set({ failedLogins: 0, lockedUntil: null }).where(eq(schema.users.id, user.id));
  }
  return { userId: user.id, role: user.role };
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const r = await authenticate(fd, false);
  if (!("userId" in r)) return r;
  await createSession(r.userId, r.role);
  return { ok: true, next: safeNext(fd.get("next"), r.role === "admin" ? "/admin" : "/account") };
}

export async function adminLogin(_: FormState, fd: FormData): Promise<FormState> {
  const r = await authenticate(fd, true);
  if (!("userId" in r)) return r;
  await createSession(r.userId, r.role);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
