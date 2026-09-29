/**
 * Product photo storage (server only).
 * Production: Vercel Blob (BLOB_READ_WRITE_TOKEN). Local dev without a token:
 * files are written to public/uploads (git-ignored).
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB; photos are resized in the browser first.
const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  "image/avif": { ext: "avif", magic: (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi") },
};

export class UploadError extends Error {}

export async function storeImage(file: File, folder: string): Promise<{ url: string; storageKey: string }> {
  const type = TYPES[file.type];
  if (!type) throw new UploadError("Unsupported file type. Use JPEG, PNG, WebP or AVIF.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Image is too large (max 4 MB after resizing).");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!type.magic(buf)) throw new UploadError("File contents don't match an image type.");
  const name = `${folder}/${randomUUID()}.${type.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, buf, { access: "public", contentType: file.type, cacheControlMaxAge: 31536000 });
    return { url: blob.url, storageKey: blob.url };
  }
  if (process.env.VERCEL) throw new UploadError("Image storage is not configured. Connect Vercel Blob to this project (BLOB_READ_WRITE_TOKEN).");

  const file_ = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(file_), { recursive: true });
  await writeFile(file_, buf);
  return { url: `/uploads/${name}`, storageKey: `local:${name}` };
}

export async function deleteStoredImage(storageKey: string | null) {
  if (!storageKey) return; // seeded placeholder renders live in the repo; nothing to delete
  try {
    if (storageKey.startsWith("local:")) {
      await unlink(path.join(process.cwd(), "public", "uploads", storageKey.slice(6)));
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(storageKey);
    }
  } catch (e) {
    console.warn("[storage] delete failed", e);
  }
}
