/**
 * Database schema (PostgreSQL via Drizzle ORM).
 *
 * Money is stored in whole rupees (INR) as integers, matching the catalogue.
 * Stock lives on `variants` (one row per product × colour × size) and every
 * change is journalled in `inventory_movements`.
 */
import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/* ── Users & sessions ─────────────────────────────────────────────────────── */

export const roleEnum = pgEnum("role", ["customer", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  role: roleEnum("role").notNull().default("customer"),
  failedLogins: integer("failed_logins").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  preferences: jsonb("preferences").$type<{ newsletter?: boolean; dropAlerts?: boolean }>().notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the cookie token — the raw token is never stored. */
    id: text("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    name: text("name").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2").notNull().default(""),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    phone: text("phone").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

/* ── Catalogue ────────────────────────────────────────────────────────────── */

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    category: text("category").notNull(),
    gender: text("gender").array().notNull().default(sql`'{}'`),
    collections: text("collections").array().notNull().default(sql`'{}'`),
    /** Ordered colourways; the first is the default. */
    colourIds: text("colour_ids").array().notNull().default(sql`'{}'`),
    sizes: text("sizes").array().notNull().default(sql`'{}'`),
    fabric: text("fabric").notNull().default(""),
    gsm: integer("gsm").notNull().default(0),
    composition: jsonb("composition").$type<{ material: string; percent: number }[]>().notNull().default([]),
    fit: text("fit").notNull().default(""),
    stretch: text("stretch").notNull().default("4-way"),
    features: text("features").array().notNull().default(sql`'{}'`),
    care: text("care").array().notNull().default(sql`'{}'`),
    badges: text("badges").array().notNull().default(sql`'{}'`),
    garment: text("garment"),
    ratingAverage: integer("rating_average_x10"),
    ratingCount: integer("rating_count"),
    featuredRank: integer("featured_rank").notNull().default(100),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    status: productStatusEnum("status").notNull().default("draft"),
    releasedAt: timestamp("released_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_status_idx").on(t.status)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    colour: text("colour").notNull(),
    url: text("url").notNull(),
    /** Storage key (Vercel Blob pathname or local file) so deletes can clean up. */
    storageKey: text("storage_key"),
    alt: text("alt").notNull().default(""),
    view: text("view").notNull().default("front"),
    width: integer("width").notNull().default(1200),
    height: integer("height").notNull().default(1500),
    position: integer("position").notNull().default(0),
    /** True for generated placeholder renders; false for real product photography. */
    isPlaceholder: boolean("is_placeholder").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.colour, t.position)],
);

export const variants = pgTable(
  "variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    colour: text("colour").notNull(),
    size: text("size").notNull(),
    sku: text("sku").notNull().unique(),
    stock: integer("stock").notNull().default(0),
    active: boolean("active").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("variants_product_colour_size_idx").on(t.productId, t.colour, t.size),
    check("variants_stock_non_negative", sql`${t.stock} >= 0`),
  ],
);

export const movementReasonEnum = pgEnum("movement_reason", [
  "received",
  "adjustment",
  "correction",
  "sale",
  "cancellation",
  "return",
]);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    variantId: uuid("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    stockAfter: integer("stock_after").notNull(),
    reason: movementReasonEnum("reason").notNull(),
    note: text("note").notNull().default(""),
    orderId: uuid("order_id"),
    actorId: uuid("actor_id"),
    createdAt: createdAt(),
  },
  (t) => [index("movements_variant_idx").on(t.variantId, t.createdAt), index("movements_created_idx").on(t.createdAt)],
);

/* ── Cart ─────────────────────────────────────────────────────────────────── */

export const cartItems = pgTable(
  "cart_items",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.variantId] })],
);

/* ── Orders & payments ────────────────────────────────────────────────────── */

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "placed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["cod", "razorpay"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "cod_pending",
  "refund_pending",
  "refunded",
]);

export const orderNumberSeq = pgSequence("order_number_seq", { startWith: 100001 });

export interface AddressSnapshot {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull().unique(),
    userId: uuid("user_id").notNull().references(() => users.id),
    /** Client-generated per checkout attempt; makes order placement idempotent. */
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: orderStatusEnum("status").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull(),
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull(),
    /** GST included in the prices (informational — prices are tax-inclusive). */
    taxIncluded: integer("tax_included").notNull(),
    total: integer("total").notNull(),
    email: text("email").notNull(),
    shippingAddress: jsonb("shipping_address").$type<AddressSnapshot>().notNull(),
    courier: text("courier").notNull().default(""),
    trackingNumber: text("tracking_number").notNull().default(""),
    /** Online-payment orders hold stock until this time, then are released. */
    reservationExpiresAt: timestamp("reservation_expires_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_user_idx").on(t.userId, t.createdAt), index("orders_status_idx").on(t.status)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => variants.id),
    productId: text("product_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    colour: text("colour").notNull(),
    colourName: text("colour_name").notNull(),
    size: text("size").notNull(),
    sku: text("sku").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
    image: text("image").notNull().default(""),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note").notNull().default(""),
    actorId: uuid("actor_id"),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId, t.createdAt)],
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerOrderId: text("provider_order_id").notNull().unique(),
  providerPaymentId: text("provider_payment_id").unique(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("created"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type UserRow = typeof users.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type VariantRow = typeof variants.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
