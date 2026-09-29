/**
 * DEMO ACCOUNT STATE — not a real user.
 * Phase 2 replaces this with authenticated data from the backend.
 */
import type { Address, Order, User } from "@/types";

export const demoUser: User = {
  id: "demo-user",
  firstName: "Demo",
  lastName: "Athlete",
  email: "demo@example.com",
  phone: "+91 90000 00000",
  memberSince: "2026-09-01",
  preferences: {
    fit: "athletic",
    newsletter: true,
    dropAlerts: true,
    sizeTop: "M",
    sizeBottom: "M",
  },
};

export const demoAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    name: "Demo Athlete",
    line1: "Sample Address Line 1",
    line2: "Sample Area",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500000",
    phone: "+91 90000 00000",
    isDefault: true,
  },
];

export const demoOrders: Order[] = [
  {
    id: "DEMO-0001",
    placedAt: "2026-09-12",
    status: "delivered",
    total: 3598,
    lines: [
      { productId: "p-001", name: "BRO'S Performance Tee", colourName: "Onyx Black", size: "M", quantity: 1, price: 1799, image: "/images/products/bros-performance-tee/onyx-front.webp" },
      { productId: "p-003", name: "BRO'S Training Shorts 7\"", colourName: "Graphite", size: "M", quantity: 1, price: 1599, image: "/images/products/bros-training-shorts/graphite-front.webp" },
    ],
  },
  {
    id: "DEMO-0002",
    placedAt: "2026-09-24",
    status: "shipped",
    total: 2799,
    lines: [
      { productId: "p-005", name: "BRO'S Everyday Jogger", colourName: "Midnight", size: "M", quantity: 1, price: 2799, image: "/images/products/bros-everyday-jogger/midnight-front.webp" },
    ],
  },
];
