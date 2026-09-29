"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { assertUser, destroyOtherSessions } from "@/lib/auth/session";
import { addressSchema, fieldErrors, passwordChangeSchema, profileSchema } from "@/lib/validation";
import type { FormState } from "./auth";

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const parsed = profileSchema.safeParse({
    ...Object.fromEntries(fd),
    newsletter: fd.get("newsletter") === "on",
    dropAlerts: fd.get("dropAlerts") === "on",
  });
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const { newsletter, dropAlerts, ...rest } = parsed.data;
  await db
    .update(schema.users)
    .set({ ...rest, preferences: { newsletter, dropAlerts }, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));
  revalidatePath("/account");
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const [row] = await db.select({ hash: schema.users.passwordHash }).from(schema.users).where(eq(schema.users.id, user.id));
  if (!row || !(await verifyPassword(parsed.data.current, row.hash))) return { fields: { current: "Current password is incorrect." } };
  await db.update(schema.users).set({ passwordHash: await hashPassword(parsed.data.next), updatedAt: new Date() }).where(eq(schema.users.id, user.id));
  await destroyOtherSessions(user.id);
  return { ok: true, message: "Password updated. Other devices have been signed out." };
}

export async function saveAddress(_: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };
  const id = String(fd.get("id") ?? "");
  const makeDefault = fd.get("isDefault") === "on";

  await db.transaction(async (tx) => {
    const existing = await tx.select({ id: schema.addresses.id }).from(schema.addresses).where(eq(schema.addresses.userId, user.id));
    const isDefault = makeDefault || existing.length === 0;
    if (isDefault) await tx.update(schema.addresses).set({ isDefault: false }).where(eq(schema.addresses.userId, user.id));
    if (id) {
      // Ownership enforced in the WHERE clause.
      await tx
        .update(schema.addresses)
        .set({ ...parsed.data, ...(isDefault ? { isDefault: true } : {}) })
        .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)));
    } else {
      await tx.insert(schema.addresses).values({ ...parsed.data, userId: user.id, isDefault });
    }
  });
  revalidatePath("/account");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(id: string) {
  const user = await assertUser();
  await db.transaction(async (tx) => {
    const [gone] = await tx
      .delete(schema.addresses)
      .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)))
      .returning({ isDefault: schema.addresses.isDefault });
    if (gone?.isDefault) {
      const [next] = await tx.select({ id: schema.addresses.id }).from(schema.addresses).where(eq(schema.addresses.userId, user.id)).limit(1);
      if (next) await tx.update(schema.addresses).set({ isDefault: true }).where(eq(schema.addresses.id, next.id));
    }
  });
  revalidatePath("/account");
}

export async function setDefaultAddress(id: string) {
  const user = await assertUser();
  await db.transaction(async (tx) => {
    const [own] = await tx
      .select({ id: schema.addresses.id })
      .from(schema.addresses)
      .where(and(eq(schema.addresses.id, id), eq(schema.addresses.userId, user.id)));
    if (!own) return;
    await tx.update(schema.addresses).set({ isDefault: false }).where(and(eq(schema.addresses.userId, user.id), ne(schema.addresses.id, id)));
    await tx.update(schema.addresses).set({ isDefault: true }).where(eq(schema.addresses.id, id));
  });
  revalidatePath("/account");
}
