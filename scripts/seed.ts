/**
 * Database seed — safe to run on every deploy (Vercel runs it before `next build`).
 *
 *  - Admin: creates ADMIN_EMAIL with ADMIN_PASSWORD if it does not exist (or promotes it
 *    to admin). An existing password is only replaced when ADMIN_RESET_PASSWORD=true.
 *  - Demo catalogue (src/data/products.ts): only when SEED_DEMO_CATALOG=true.
 *    Demo stock is added only when SEED_DEMO_STOCK=true — keep it off in production so
 *    customers can't order sample products that don't physically exist.
 *    Existing products are never modified.
 *
 *   npm run db:seed
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { productSeeds } from "../src/data/products";
import { hashPassword } from "../src/lib/auth/password";

const VIEWS = ["front", "model", "back", "side", "detail", "lifestyle"] as const;

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle({ client, schema });

  const seedCatalog = process.env.SEED_DEMO_CATALOG === "true";
  const demoStock = process.env.SEED_DEMO_STOCK === "true";
  let createdProducts = 0;
  for (const [i, p] of seedCatalog ? productSeeds.entries() : []) {
    const created = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.products)
        .values({
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          category: p.category,
          gender: p.gender,
          collections: p.collections,
          colourIds: p.colourIds,
          sizes: p.sizes,
          fabric: p.fabric,
          gsm: p.gsm,
          composition: p.composition,
          fit: p.fit,
          stretch: p.stretch,
          features: p.features,
          care: p.care,
          badges: p.badges.filter((b) => b !== "low-stock"),
          garment: p.garment,
          ratingAverage: Math.round(p.rating.average * 10),
          ratingCount: p.rating.count,
          featuredRank: p.featuredRank,
          status: "active",
          releasedAt: new Date(p.releasedAt),
        })
        .onConflictDoNothing()
        .returning({ id: schema.products.id });
      if (!inserted.length) return false;

      const code = p.id.replace(/^p-/, "");
      for (const [ci, colour] of p.colourIds.entries()) {
        await tx.insert(schema.productImages).values(
          VIEWS.map((view, pos) => ({
            productId: p.id,
            colour,
            url: `/images/products/${p.slug}/${colour}-${view}.webp`,
            alt: `${p.name} — ${colour} ${view} (placeholder render)`,
            view,
            position: pos,
            isPlaceholder: true,
          })),
        );
        for (const [si, size] of p.sizes.entries()) {
          // Demo opening stock: sold-out sizes at 0, a few low-stock variants, the rest 8–30.
          const stock = !demoStock || p.soldOutSizes.includes(size) ? 0 : (i + ci + si) % 7 === 0 ? 3 : 8 + ((i * 7 + ci * 5 + si * 3) % 23);
          const [v] = await tx
            .insert(schema.variants)
            .values({ productId: p.id, colour, size, sku: `BR${code}-${colour.slice(0, 3).toUpperCase()}-${size}`, stock })
            .returning({ id: schema.variants.id });
          if (stock > 0) {
            await tx.insert(schema.inventoryMovements).values({ variantId: v.id, delta: stock, stockAfter: stock, reason: "received", note: "Opening stock (demo seed)" });
          }
        }
      }
      return true;
    });
    if (created) createdProducts++;
  }
  console.log(
    seedCatalog
      ? `Demo products created: ${createdProducts} (${demoStock ? "with" : "without"} demo stock; ${productSeeds.length - createdProducts} already existed)`
      : "Demo catalogue skipped (SEED_DEMO_CATALOG is not true).",
  );

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
    if (existing.length) {
      const reset = process.env.ADMIN_RESET_PASSWORD === "true";
      await db
        .update(schema.users)
        .set({ role: "admin", ...(reset ? { passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null } : {}) })
        .where(eq(schema.users.email, email));
      console.log(`Admin exists: ${email}${reset ? " (password reset)" : ""}`);
    } else {
      await db.insert(schema.users).values({ email, passwordHash: await hashPassword(password), firstName: "Admin", role: "admin" });
      console.log(`Admin created: ${email}`);
    }
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — admin account unchanged.");
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
