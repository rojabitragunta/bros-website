# Deploying BRO'S (GitHub → Vercel)

The site is already connected to Vercel (`bros-website`), so every push to `main` deploys. The store now needs a **database** and **photo storage** first. **Do steps 1–3 before pushing this version**, or the build will fail. The currently live site keeps running until a build succeeds.

On Vercel, the build runs `npm run vercel-build`, which:
1. applies database migrations (`drizzle-kit migrate`),
2. runs the seed (creates the admin account; optionally imports the demo catalogue),
3. builds the site.

## 1. Database — Neon Postgres (free tier)

Vercel dashboard → project **bros-website** → **Storage** → **Create Database** → **Neon (Serverless Postgres)** → Free plan → region **Mumbai (ap-south-1)** if offered → **Connect** it to the project.

- For environments, choose **Production** (and **Preview** only if you enable Neon's preview branching, so previews get their own copy of the data).
- This adds `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) automatically. Nothing to copy by hand.
- **Leave "Custom prefix" empty** when connecting. The app reads `DATABASE_URL` (or `POSTGRES_URL` as a fallback); a prefix like `STORAGE_DATABASE_URL` won't be found.
- If the database already exists (e.g. `neon-cobalt-lens`), don't create another. Open it under **Storage** and check it lists `bros-website` under connected projects; if not, choose **Connect Project**.

## 2. Photo storage — Vercel Blob (free tier)

Project → **Storage** → **Create** → **Blob** → access **Public** (product photos must be publicly viewable) → connect to the project (Production + Preview), with no custom prefix. This adds `BLOB_READ_WRITE_TOKEN`.

Without it, photo uploads in the admin show a clear error in production.

## 3. Environment variables

Project → **Settings** → **Environment Variables** (Production):

| Name | Value | Notes |
|---|---|---|
| `ADMIN_EMAIL` | your admin email | The first admin account is created with it |
| `ADMIN_PASSWORD` | a long unique password (12+ characters) | Only used when the admin is first created. To reset it later, also set `ADMIN_RESET_PASSWORD=true` for one deploy, then remove it |
| `SEED_DEMO_CATALOG` | `true` *(optional)* | Imports the 12 sample products with placeholder images and **zero stock**, so the shop isn't empty. Replace or archive them as real products arrive |

Do **not** set `SEED_DEMO_STOCK` in production. Customers could otherwise order sample products that don't exist.

## 4. Deploy

```bash
git add .
git commit -m "Add backend: accounts, admin, inventory, checkout"
git push
```

Watch the build in Vercel → **Deployments**. When it's ready:

1. Open `https://<your-site>/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. **Products** → open a product → upload real photos per colour → **Remove placeholders**.
3. **Inventory** (or the product's stock table) → **+ Receive** the real quantities per colour and size.
4. Set each product's status to **Active** when it's ready to sell (**Draft** hides it).
5. Place a test Cash on Delivery order with a customer account, then cancel it from **Admin → Orders** and confirm the stock returns.

## 5. Online payments — Razorpay (optional, when ready)

Checkout offers **Cash on Delivery** only until these are set.

1. Create a Razorpay account and start in **Test mode**. Dashboard → **Account & Settings → API Keys** → generate keys.
2. Dashboard → **Webhooks** → Add:
   - URL: `https://<your-site>/api/payments/razorpay/webhook`
   - Events: `payment.captured`, `order.paid`
   - Secret: any long random string
3. In Vercel, add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`, then redeploy.
4. Test with Razorpay's test cards/UPI. After KYC is approved, switch to **Live** keys and a live webhook.
5. Refunds are issued from the Razorpay dashboard. Cancelled paid orders appear as **Refund pending** in the admin; mark them completed there.

Make sure Razorpay **auto-capture** is on (Settings → Payment Capture), so payments are confirmed immediately.

## 6. Custom domain (later)

Project → **Settings → Domains** → add the domain and follow the DNS steps. No code change is needed; links and the sitemap use the production domain automatically.

## Before launch — checklist

- [ ] Review policy pages in `src/data/info-pages.ts` (shipping, returns, refunds, privacy, terms, contact). Razorpay requires these.
- [ ] Confirm GST rates and shipping fees in `src/lib/pricing.ts` with your accountant.
- [ ] Replace placeholder social links in `src/data/site.ts`.
- [ ] Upload real photos; remove placeholders.
- [ ] Enter real stock counts.
- [ ] Order emails are **not** sent yet (customers see status on their account page). Add an email provider (e.g. Resend) when needed.
- [ ] Neon free tier: check its backup/restore window, and upgrade if you need longer history.

## Environment variables (reference)

| Variable | Required | Set by |
|---|---|---|
| `DATABASE_URL` | yes | Neon integration |
| `DATABASE_URL_UNPOOLED` | no (preferred for migrations) | Neon integration |
| `BLOB_READ_WRITE_TOKEN` | yes, for photo uploads | Blob integration |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes (first deploy) | you |
| `ADMIN_RESET_PASSWORD` | no | you (one-off) |
| `SEED_DEMO_CATALOG` | no | you |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | for online payments | you |
| `NEXT_PUBLIC_SITE_URL` | no | defaults to the Vercel production domain |

Never commit `.env.local` or real keys. `.gitignore` already excludes them.
