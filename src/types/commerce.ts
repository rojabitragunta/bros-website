import type { ColourId, SizeCode } from "./product";

/**
 * Commerce domain types. Cart lives in local state for Phase 1; Order and
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
  | "placed"
  | "packed"
  | "shipped"
  | "delivered"
  | "returned";

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
  placedAt: string;
  status: OrderStatus;
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
