"use client";

import { useActionState, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import type { FormState } from "@/app/actions/auth";
import { colours } from "@/data/colours";
import { FormError, FormSuccess } from "@/components/ui/Field";
import { keepValues } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { btnCls, inputCls, labelCls, selectCls } from "./ui";

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number | "";
  compareAtPrice: number | "";
  category: string;
  gender: string[];
  collections: string[];
  colourIds: string[];
  sizes: string[];
  fabric: string;
  gsm: number;
  composition: string;
  fit: string;
  stretch: string;
  features: string;
  care: string;
  badges: string[];
  featuredRank: number;
  lowStockThreshold: number;
  status: string;
}

const CATEGORIES = [
  ["tees", "Tees"],
  ["tanks", "Tanks"],
  ["long-sleeves", "Long sleeves"],
  ["shorts", "Shorts"],
  ["joggers", "Joggers"],
  ["leggings", "Leggings"],
  ["bras", "Sports bras"],
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Text({ label, name, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  return (
    <div className={className}>
      <label className={labelCls} htmlFor={`f-${name}`}>
        {label}
      </label>
      <input id={`f-${name}`} name={name} aria-invalid={error ? true : undefined} className={cn(inputCls, error && "border-red-400/70")} {...props} />
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

function Area({ label, name, hint, error, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; hint?: string; error?: string }) {
  return (
    <div className={className}>
      <label className={labelCls} htmlFor={`f-${name}`}>
        {label}
      </label>
      <textarea id={`f-${name}`} name={name} className={cn(inputCls, "h-auto min-h-24 py-2 leading-relaxed", error && "border-red-400/70")} {...props} />
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
    </div>
  );
}

function Checks({ label, name, options, values, error }: { label: string; name: string; options: [string, string][]; values: string[]; error?: string }) {
  return (
    <fieldset>
      <legend className={labelCls}>{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([v, l]) => (
          <label key={v} className="flex h-9 cursor-pointer items-center gap-2 border border-line px-3 text-xs has-[:checked]:border-bone has-[:checked]:bg-bone has-[:checked]:text-ink">
            <input type="checkbox" name={name} value={v} defaultChecked={values.includes(v)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </fieldset>
  );
}

export function ProductForm({ initial }: { initial: ProductFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const f = state.fields ?? {};

  return (
    <form onSubmit={keepValues(action)} className="grid gap-8" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.ok ? state.message : undefined}</FormSuccess>

      <section className="grid gap-4 sm:grid-cols-2">
        <Text
          label="Name"
          name="name"
          defaultValue={initial.name}
          error={f.name}
          required
          onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
          className="sm:col-span-2"
        />
        <Text
          label="URL slug"
          name="slug"
          value={slug}
          error={f.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
        <div>
          <label className={labelCls} htmlFor="f-status">
            Status
          </label>
          <select id="f-status" name="status" defaultValue={initial.status} className={selectCls}>
            <option value="draft">Draft — hidden from store</option>
            <option value="active">Active — visible in store</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Text label="Tagline" name="tagline" defaultValue={initial.tagline} error={f.tagline} className="sm:col-span-2" />
        <Area label="Description" name="description" defaultValue={initial.description} error={f.description} rows={4} className="sm:col-span-2" />
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <Text label="Price (₹, incl. GST)" name="price" type="number" inputMode="numeric" min={1} defaultValue={initial.price} error={f.price} />
        <Text label="Compare-at price (₹)" name="compareAtPrice" type="number" inputMode="numeric" min={1} defaultValue={initial.compareAtPrice} error={f.compareAtPrice} />
        <Text label="Low-stock alert at" name="lowStockThreshold" type="number" min={0} defaultValue={initial.lowStockThreshold} error={f.lowStockThreshold} />
        <Text label="Sort rank (lower = first)" name="featuredRank" type="number" min={0} defaultValue={initial.featuredRank} error={f.featuredRank} />
      </section>

      <section className="grid gap-5">
        <div className="max-w-xs">
          <label className={labelCls} htmlFor="f-category">
            Category
          </label>
          <select id="f-category" name="category" defaultValue={initial.category} className={selectCls}>
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <Checks label="Gender" name="gender" options={[["men", "Men"], ["women", "Women"]]} values={initial.gender} error={f.gender} />
        <Checks label="Collections" name="collections" options={[["drop-001", "Drop 001"], ["essentials", "Essentials"]]} values={initial.collections} />
        <Checks label="Colours" name="colourIds" options={colours.map((c) => [c.id, c.name])} values={initial.colourIds} error={f.colourIds} />
        <Checks label="Sizes" name="sizes" options={SIZES.map((s) => [s, s])} values={initial.sizes} error={f.sizes} />
        <Checks label="Badges" name="badges" options={[["new", "New"], ["bestseller", "Bestseller"], ["limited", "Limited"]]} values={initial.badges} />
        <p className="text-xs text-steel">Saving creates a stock line (SKU) for every colour × size. Removing a colour or size hides its SKUs but keeps their history.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Text label="Fabric" name="fabric" defaultValue={initial.fabric} error={f.fabric} />
        <div className="grid grid-cols-2 gap-4">
          <Text label="GSM" name="gsm" type="number" min={0} defaultValue={initial.gsm} error={f.gsm} />
          <div>
            <label className={labelCls} htmlFor="f-stretch">
              Stretch
            </label>
            <select id="f-stretch" name="stretch" defaultValue={initial.stretch} className={selectCls}>
              <option value="4-way">4-way</option>
              <option value="2-way">2-way</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
        <Text label="Composition" name="composition" defaultValue={initial.composition} placeholder="Polyester 88, Elastane 12" error={f.composition} />
        <Text label="Fit" name="fit" defaultValue={initial.fit} error={f.fit} />
        <Area label="Features" name="features" defaultValue={initial.features} hint="One per line." />
        <Area label="Care" name="care" defaultValue={initial.care} hint="One per line." />
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <button className={btnCls} disabled={pending}>
          {pending ? "Saving…" : initial.id ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
