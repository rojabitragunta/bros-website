# BRO'S — Frontend (Phase 1)

Premium activewear storefront for BRO'S (Hyderabad). **Frontend only**: mock catalogue, local cart/wishlist, demo account, placeholder checkout. No backend, payments, auth or shipping yet.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (type-checks + prerenders)
npm run start
npm run typecheck
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Zustand · Lucide · Geist + Archivo.

## Structure

```
src/
  app/                 routes: / shop products/[slug] about technology lookbook
                       search wishlist account bag checkout info/[slug] + 404
  components/
    ui/                Button, Modal, Drawer, Accordion, Toaster, Marquee, Reveal…
    layout/            Navbar, AnnouncementBar, MobileMenu, Footer, Providers
    home/              Hero, FeaturedDrop, CategorySection, LabSection, Community…
    product/           ProductCard, ProductGrid, ImageGallery, ProductDetail, SizeGuide…
    shop/ cart/ search/ lookbook/ technology/ account/
  data/                ALL editable content: products, colours, site (nav, announcement),
                       media manifest, lookbook, technology specs, size guide, info pages
  lib/services/        catalog.ts — async data API (swap for real API in Phase 2)
  store/               Zustand: cart, wishlist (persisted), UI overlays, toasts
  types/               Product, Cart, Order, User, Address interfaces
  styles/globals.css   design tokens (@theme)
scripts/               placeholder art generator
```

## Editing content

- **Announcement bar / nav / footer / social links** → `src/data/site.ts`
- **Products** → `src/data/products.ts` (demo data — not real products)
- **Campaign imagery** → `src/data/media.ts`

## Imagery

All images in `public/images` are **generated placeholders** (dark-studio garment renders and campaign scenes), produced by:

```bash
npm run assets            # everything (~8 min)
npm run assets -- products
npm run assets -- campaign
```

To use real photography: drop files in at the same paths (`/images/products/{slug}/{colour}-{view}.webp`, views: front, back, model, side, detail, lifestyle) or update `src/data/media.ts`. No component changes needed.

## Phase 2 hooks

- `src/lib/services/catalog.ts` — replace function bodies with API calls (FastAPI).
- `src/store/cart.ts` — keep as optimistic layer; sync with cart API.
- `src/data/account-demo.ts` → authenticated user/orders.
- Checkout (`components/cart/CheckoutView.tsx`) → Razorpay; shipping → Shiprocket.
- Newsletter submit (`components/home/Newsletter.tsx`) → email endpoint.
