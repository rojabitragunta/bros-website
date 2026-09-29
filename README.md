# BRO'S — Storefront & Admin

Premium activewear store for BRO'S (Hyderabad): storefront, customer accounts, checkout (Cash on Delivery + Razorpay-ready), order tracking, and an admin dashboard for products, photos, inventory and orders.

## Run locally

Requires Node 20.9+ and Docker (for a local PostgreSQL).

```bash
npm install
docker run -d --name bros-db -e POSTGRES_USER=bros -e POSTGRES_PASSWORD=bros_dev_pw -e POSTGRES_DB=bros \
  -p 5433:5432 -v bros-db-data:/var/lib/postgresql/data postgres:17-alpine
cp .env.example .env.local      # then set ADMIN_EMAIL / ADMIN_PASSWORD (12+ chars)
                                # add SEED_DEMO_CATALOG="true" and SEED_DEMO_STOCK="true" for sample products
npm run db:migrate              # create tables
npm run db:seed                 # admin account (+ demo catalogue if enabled)
npm run dev                     # http://localhost:3000   ·   admin: http://localhost:3000/admin
```

| Script | What it does |
|---|---|
| `npm run build` / `start` | Production build (type-checks) / serve it |
| `npm run db:generate` | Create a migration after editing `src/lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Create the admin; optionally import the demo catalogue |
| `npm run db:studio` | Browse the database |
| `npm run test:integration` | Inventory/order/payment tests — needs `TEST_DATABASE_URL` (a throwaway DB) |
| `npm run test:e2e` | Browser checks against a running server (uses local Chrome) |

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · Zod · Vercel Blob · Razorpay · Motion · Zustand.

## How it works

- **Catalogue** lives in PostgreSQL (`products`, `variants`, `product_images`). Storefront reads are cached and refreshed instantly when an admin edits a product, stock changes, or an order is placed.
- **Inventory** is tracked per colour × size (`variants.stock`, never negative — enforced by a DB constraint). Every change is journalled in `inventory_movements` (received, removed, correction, sale, cancellation, return).
- **Orders** re-price every line on the server, decrement stock atomically in the same transaction as the order, and are idempotent per checkout attempt (double clicks/retries can't create duplicates or oversell).
- **Online payments** (when Razorpay keys are set) reserve stock for 30 minutes; unpaid orders are cancelled automatically and stock is released. A payment is only marked paid after its signature is verified *and* Razorpay confirms it as captured for the right amount. Cancelling a paid order flags it as *refund pending*.
- **Accounts**: email + password (scrypt hashes), httpOnly session cookies (30 days customers, 12 hours admins), login lockout after 5 failed attempts. Customers only ever see their own orders and addresses.
- **Admin** (`/admin`): separate sign-in; every admin page, Server Action and upload endpoint checks the admin role on the server.
- **Photos**: uploaded in the admin, resized in the browser (max 2400px), stored in Vercel Blob (local `public/uploads` in dev). The seeded images are generated placeholder renders and are labelled as such on product pages until real photos replace them.

## Structure

```
src/
  app/
    (storefront routes)  / shop products/[slug] bag checkout login register account account/orders/[id] …
    admin/               login, (panel)/ dashboard · orders · products · inventory, actions.ts
    actions/             Server Actions: auth, account, cart, checkout
    api/                 products (public catalogue), admin/images (upload), payments/razorpay/webhook
  components/            ui/ layout/ product/ cart/ account/ admin/ auth/ orders/ …
  lib/
    db/                  schema.ts (tables), index.ts (client)
    auth/                password hashing, sessions & guards
    services/            catalog, inventory, orders, account, admin (server only)
    payments/razorpay.ts pricing.ts validation.ts storage.ts catalog-utils.ts
  proxy.ts               early redirect for signed-out visitors (real checks are server-side)
drizzle/                 SQL migrations
scripts/seed.ts          admin + optional demo catalogue
tests/                   integration + e2e tests
```

## Configuration

- Shipping fee / free-shipping threshold / GST rates → `src/lib/pricing.ts` (prices are GST-inclusive; confirm rates with your accountant).
- Announcement bar, navigation, footer, social links → `src/data/site.ts`.
- Colours available to products → `src/data/colours.ts`.
- Policy & help pages (shipping, returns, refunds, privacy, terms, contact) → `src/data/info-pages.ts` — **review before launch**.

Deployment: see [DEPLOYMENT.md](DEPLOYMENT.md).
