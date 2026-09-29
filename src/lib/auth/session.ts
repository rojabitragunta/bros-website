/**
 * Session auth (server only).
 *
 * The browser holds a random 256-bit token in an httpOnly cookie; the database
 * stores only its SHA-256, so a leaked DB dump cannot be replayed as sessions.
 * Every protected page, Server Action and Route Handler calls requireUser() /
 * requireAdmin() — the UI hiding links is never the security boundary.
 */
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/lib/db";

const COOKIE = "bros_session";
const CUSTOMER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "customer" | "admin";
  preferences: { newsletter?: boolean; dropAlerts?: boolean };
  createdAt: Date;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, role: SessionUser["role"]) {
  const token = randomBytes(32).toString("base64url");
  const ttl = role === "admin" ? ADMIN_TTL_MS : CUSTOMER_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl);
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of expired sessions.
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  jar.delete(COOKIE);
}

/** Signs the user out everywhere (e.g. after a password change), keeping the current session. */
export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(COOKIE)?.value;
  await db.delete(schema.sessions).where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, token ? hashToken(token) : "")));
}

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      phone: schema.users.phone,
      role: schema.users.role,
      preferences: schema.users.preferences,
      createdAt: schema.users.createdAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date())));
  return row ?? null;
});

/** For pages: redirects to sign-in when signed out. */
export async function requireUser(returnTo = "/account"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** For admin pages: redirects non-admins to the admin sign-in. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/admin/login");
  return user;
}

export class AuthError extends Error {}

/** For Server Actions / Route Handlers: throws instead of redirecting. */
export async function assertUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Please sign in to continue.");
  return user;
}

export async function assertAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new AuthError("Not authorised.");
  return user;
}
