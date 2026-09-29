import { and, eq, max } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/services/catalog";
import { UploadError, deleteStoredImage, storeImage } from "@/lib/storage";

const VIEWS = ["front", "back", "side", "detail", "lifestyle", "model"];

/** Upload a product photo (admin only). multipart: file, productId, colour, width, height, view?, replaceId? */
export async function POST(req: Request) {
  try {
    await assertAdmin();
    const fd = await req.formData();
    const file = fd.get("file");
    const productId = String(fd.get("productId") ?? "");
    const colour = String(fd.get("colour") ?? "");
    const replaceId = String(fd.get("replaceId") ?? "");
    const view = VIEWS.includes(String(fd.get("view"))) ? String(fd.get("view")) : "front";
    const width = Math.max(1, Math.min(10000, Number(fd.get("width")) || 1200));
    const height = Math.max(1, Math.min(10000, Number(fd.get("height")) || 1500));
    if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

    const [p] = await db.select({ id: schema.products.id, name: schema.products.name, colourIds: schema.products.colourIds }).from(schema.products).where(eq(schema.products.id, productId));
    if (!p) return Response.json({ error: "Product not found." }, { status: 404 });
    if (!p.colourIds.includes(colour)) return Response.json({ error: "Colour is not enabled for this product." }, { status: 400 });

    const stored = await storeImage(file, productId);

    if (replaceId) {
      const [old] = await db.select().from(schema.productImages).where(and(eq(schema.productImages.id, replaceId), eq(schema.productImages.productId, productId)));
      if (!old) {
        await deleteStoredImage(stored.storageKey);
        return Response.json({ error: "Image to replace was not found." }, { status: 404 });
      }
      const [row] = await db
        .update(schema.productImages)
        .set({ url: stored.url, storageKey: stored.storageKey, width, height, isPlaceholder: false })
        .where(eq(schema.productImages.id, replaceId))
        .returning();
      await deleteStoredImage(old.storageKey);
      revalidateTag(CATALOG_TAG, { expire: 0 });
      return Response.json(row);
    }

    const [{ pos }] = await db
      .select({ pos: max(schema.productImages.position) })
      .from(schema.productImages)
      .where(and(eq(schema.productImages.productId, productId), eq(schema.productImages.colour, colour)));
    const [row] = await db
      .insert(schema.productImages)
      .values({ productId, colour, url: stored.url, storageKey: stored.storageKey, width, height, view, position: (pos ?? -1) + 1, alt: `${p.name} — ${colour} ${view}`, isPlaceholder: false })
      .returning();
    revalidateTag(CATALOG_TAG, { expire: 0 });
    return Response.json(row);
  } catch (e) {
    if (e instanceof AuthError) return Response.json({ error: e.message }, { status: 403 });
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    console.error("[upload]", e);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
