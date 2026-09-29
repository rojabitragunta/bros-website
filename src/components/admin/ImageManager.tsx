"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteImage, deletePlaceholderImages, moveImage, updateImageMeta } from "@/app/admin/actions";
import { colourMap } from "@/data/colours";
import { cn } from "@/lib/utils";
import { btnOutlineCls, inputCls, labelCls, selectCls } from "./ui";

export interface AdminImage {
  id: string;
  colour: string;
  url: string;
  alt: string;
  view: string;
  isPlaceholder: boolean;
}

const VIEWS = ["front", "back", "side", "detail", "model", "lifestyle"];
const MAX_EDGE = 2400;
const MAX_BYTES = 4 * 1024 * 1024;

/** Downscale DSLR photos in the browser (keeps EXIF orientation) so uploads stay small and fast. */
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  for (const q of [0.9, 0.82, 0.72]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", q));
    if (blob && blob.size <= MAX_BYTES) return { blob, width, height };
  }
  throw new Error("Image is still too large after compression.");
}

interface Upload {
  key: string;
  name: string;
  preview: string;
  status: "working" | "done" | "error";
  error?: string;
}

async function send(productId: string, colour: string, file: File, view: string, replaceId?: string) {
  const { blob, width, height } = await prepare(file);
  const fd = new FormData();
  fd.append("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }));
  fd.append("productId", productId);
  fd.append("colour", colour);
  fd.append("view", view);
  fd.append("width", String(width));
  fd.append("height", String(height));
  if (replaceId) fd.append("replaceId", replaceId);
  const res = await fetch("/api/admin/images", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
}

export function ImageManager({ productId, colours, images }: { productId: string; colours: string[]; images: AdminImage[] }) {
  const router = useRouter();
  const [picked, setColour] = useState(colours[0]);
  const colour = colours.includes(picked) ? picked : colours[0];
  const [view, setView] = useState("front");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replacing = useRef<string | null>(null);

  if (!colours.length) return <p className="text-sm text-mist">Choose at least one colour and save the product to add photos.</p>;
  const list = images.filter((i) => i.colour === colour);
  const hasPlaceholders = list.some((i) => i.isPlaceholder);

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = [...files].filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    const batch = arr.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, preview: URL.createObjectURL(f), status: "working" as const }));
    setUploads((u) => [...batch, ...u]);
    await Promise.all(
      arr.map(async (f, i) => {
        const key = batch[i].key;
        try {
          await send(productId, colour, f, view);
          setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: "done" } : x)));
        } catch (e) {
          setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: "error", error: e instanceof Error ? e.message : "Upload failed" } : x)));
        }
      }),
    );
    router.refresh();
  };

  const onReplace = async (files: FileList | null) => {
    const id = replacing.current;
    const f = files?.[0];
    if (!id || !f) return;
    const img = images.find((x) => x.id === id);
    const key = `r-${Date.now()}`;
    setUploads((u) => [{ key, name: `Replace: ${f.name}`, preview: URL.createObjectURL(f), status: "working" }, ...u]);
    try {
      await send(productId, colour, f, img?.view ?? view, id);
      setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: "done" } : x)));
    } catch (e) {
      setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: "error", error: e instanceof Error ? e.message : "Upload failed" } : x)));
    }
    router.refresh();
  };

  return (
    <div className="grid gap-5">
      <div role="tablist" aria-label="Colour" className="flex flex-wrap gap-1.5">
        {colours.map((c) => {
          const n = images.filter((i) => i.colour === c && !i.isPlaceholder).length;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={c === colour}
              onClick={() => setColour(c)}
              className={cn("flex h-9 items-center gap-2 border px-3 text-xs", c === colour ? "border-bone" : "border-line text-mist hover:text-bone")}
            >
              <span className="size-3 rounded-full ring-1 ring-bone/30" style={{ background: colourMap[c as keyof typeof colourMap]?.hex }} />
              {colourMap[c as keyof typeof colourMap]?.name ?? c}
              <span className="font-mono text-mist">{n}</span>
            </button>
          );
        })}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn("grid gap-3 border border-dashed p-5 sm:grid-cols-[1fr_auto] sm:items-end", drag ? "border-bone bg-graphite" : "border-line")}
      >
        <div>
          <p className="text-sm">
            <ImagePlus className="mr-2 inline size-4 align-[-3px]" strokeWidth={1.5} aria-hidden />
            Drop real product photos here for <strong>{colourMap[colour as keyof typeof colourMap]?.name ?? colour}</strong>, or choose files.
          </p>
          <p className="mt-1 text-xs text-steel">JPEG, PNG, WebP or AVIF. Large DSLR files are resized to 2400px in your browser before upload.</p>
        </div>
        <div className="flex gap-2">
          <div>
            <label className={labelCls} htmlFor="upload-view">
              Shot type
            </label>
            <select id="upload-view" value={view} onChange={(e) => setView(e.target.value)} className={cn(selectCls, "h-10 w-32")}>
              {VIEWS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <button type="button" className={cn(btnOutlineCls, "self-end")} onClick={() => input.current?.click()}>
            Choose files
          </button>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={replaceInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={(e) => {
            onReplace(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2" aria-live="polite">
          {uploads.slice(0, 8).map((u) => (
            <li key={u.key} className="flex items-center gap-3 border border-line p-2 text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.preview} alt="" className="h-12 w-10 object-cover" />
              <span className="min-w-0 flex-1 truncate">{u.name}</span>
              <span className={cn(u.status === "done" && "text-emerald-300", u.status === "error" && "text-red-300")}>
                {u.status === "working" ? "Uploading…" : u.status === "done" ? "Uploaded" : u.error}
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasPlaceholders && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-amber-300/30 bg-amber-300/5 p-3 text-xs text-amber-100">
          <span>This colour still shows placeholder renders, not real photography.</span>
          <button
            type="button"
            className={btnOutlineCls}
            disabled={pending}
            onClick={() => confirm("Remove all placeholder renders for this colour?") && start(() => deletePlaceholderImages(productId, colour))}
          >
            Remove placeholders
          </button>
        </div>
      )}

      {list.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((img, i) => (
            <li key={img.id} className="border border-line">
              <div className="relative aspect-[4/5] bg-[#e4e2dd]">
                <Image src={img.url} alt={img.alt} fill sizes="240px" className="object-cover" />
                <span className="absolute left-1 top-1 bg-ink/80 px-1.5 py-0.5 font-mono text-[0.625rem] uppercase">{i === 0 ? "Main" : `#${i + 1}`}</span>
                {img.isPlaceholder && <span className="absolute right-1 top-1 bg-amber-300 px-1.5 py-0.5 font-mono text-[0.625rem] uppercase text-ink">Placeholder</span>}
              </div>
              <div className="grid gap-2 p-2">
                <input
                  defaultValue={img.alt}
                  aria-label="Alt text"
                  placeholder="Alt text (describe the photo)"
                  className={cn(inputCls, "h-8 px-2 text-xs")}
                  onBlur={(e) => e.target.value !== img.alt && start(() => updateImageMeta(img.id, e.target.value, img.view))}
                />
                <select
                  defaultValue={img.view}
                  aria-label="Shot type"
                  className={cn(selectCls, "h-8 px-2 text-xs")}
                  onChange={(e) => start(() => updateImageMeta(img.id, img.alt, e.target.value))}
                >
                  {VIEWS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <button type="button" aria-label="Move earlier" disabled={pending || i === 0} onClick={() => start(() => moveImage(img.id, -1))} className="grid size-8 place-items-center hover:bg-graphite disabled:opacity-30">
                      <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Move later" disabled={pending || i === list.length - 1} onClick={() => start(() => moveImage(img.id, 1))} className="grid size-8 place-items-center hover:bg-graphite disabled:opacity-30">
                      <ArrowRight className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      aria-label="Replace photo"
                      title="Replace"
                      onClick={() => {
                        replacing.current = img.id;
                        replaceInput.current?.click();
                      }}
                      className="grid size-8 place-items-center hover:bg-graphite"
                    >
                      <RefreshCw className="size-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete photo"
                      title="Delete"
                      disabled={pending}
                      onClick={() => confirm("Delete this photo?") && start(() => deleteImage(img.id))}
                      className="grid size-8 place-items-center text-red-300 hover:bg-graphite"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-line px-4 py-10 text-center text-sm text-mist">No photos for this colour yet. The store shows a “Photo coming soon” placeholder.</p>
      )}
    </div>
  );
}
