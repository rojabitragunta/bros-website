import type { ColourId, SizeCode } from "./product";

/**
 * Commerce domain types shared by the storefront and server. Order and
 * Address are defined now so the account/checkout UI already speaks the
 * shape the backend will return.
 */

export interface CartItem {
  /** Stable line key: `${productId}:${colour}:${size}` */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  colour: ColourId;
  colourName: string;
  size: SizeCode;
  quantity: number;
  image: string;
  /** Purchasable quantity when added (server re-validates at checkout). */
  max?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentMethod = "cod" | "razorpay";
export type PaymentStatus = "pending" | "paid" | "failed" | "cod_pending" | "refund_pending" | "refunded";

export interface OrderLine {
  productId: string;
  name: string;
  colourName: string;
  size: SizeCode;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  lines: OrderLine[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  preferences: {
    fit: "athletic" | "regular" | "oversized";
    newsletter: boolean;
    dropAlerts: boolean;
    sizeTop: SizeCode;
    sizeBottom: SizeCode;
  };
}
