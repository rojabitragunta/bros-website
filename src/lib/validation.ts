import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));
export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(128, "Use at most 128 characters.");
export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, "").replace(/^\+?91/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."));

export const registerSchema = z.object({
  firstName: trimmed(60).min(1, "Enter your first name."),
  lastName: trimmed(60),
  email: emailSchema,
  phone: z.union([z.literal(""), phoneSchema]),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
});

export const profileSchema = z.object({
  firstName: trimmed(60).min(1, "Enter your first name."),
  lastName: trimmed(60),
  phone: z.union([z.literal(""), phoneSchema]),
  newsletter: z.boolean(),
  dropAlerts: z.boolean(),
});

export const passwordChangeSchema = z.object({
  current: z.string().min(1, "Enter your current password."),
  next: passwordSchema,
});

export const addressSchema = z.object({
  label: trimmed(30).default("Home"),
  name: trimmed(80).min(1, "Enter the recipient's name."),
  line1: trimmed(160).min(3, "Enter the street address."),
  line2: trimmed(160).default(""),
  city: trimmed(60).min(2, "Enter the city."),
  state: trimmed(60).min(2, "Enter the state."),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  phone: phoneSchema,
});

export const cartLineSchema = z.object({
  productId: trimmed(64).min(1),
  colour: trimmed(32).min(1),
  size: trimmed(8).min(1),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  idempotencyKey: z.string().regex(/^[a-zA-Z0-9-]{16,64}$/),
  items: z.array(cartLineSchema).min(1, "Your bag is empty.").max(50),
  address: addressSchema.omit({ label: true }),
  saveAddress: z.boolean().default(false),
  paymentMethod: z.enum(["cod", "razorpay"]),
  expectedTotal: z.number().int().nonnegative(),
});

/** Flattens zod issues into { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = "/account") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
