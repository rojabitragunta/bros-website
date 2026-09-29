import type { Product } from "@/types";
import { Accordion } from "@/components/ui/Accordion";
import { CompositionBar } from "@/components/technology/TechSpecs";

const STRETCH_COPY: Record<Product["stretch"], string> = {
  "4-way": "Stretches lengthwise and crosswise for unrestricted movement.",
  "2-way": "Stretches crosswise for comfort through the body.",
  minimal: "Structured cotton with natural give — holds its shape.",
};

function rows(p: Product) {
  return [
    { id: "fit", title: "Fit", meta: p.fit.split(" —")[0], content: <p>{p.fit}</p> },
    { id: "fabric", title: "Fabric", meta: p.fabric.split(" ").pop(), content: <p>{p.fabric}.</p> },
    { id: "gsm", title: "GSM", meta: `${p.gsm}`, content: <p>{p.gsm} grams per square metre.</p> },
    {
      id: "composition",
      title: "Composition",
      meta: p.composition.map((c) => `${c.percent}%`).join(" / "),
      content: <CompositionBar parts={p.composition} className="max-w-sm" />,
    },
    { id: "stretch", title: "Stretch", meta: p.stretch, content: <p>{STRETCH_COPY[p.stretch]}</p> },
    {
      id: "features",
      title: "Features",
      meta: `${p.features.length}`,
      content: (
        <ul className="space-y-2">
          {p.features.map((f) => (
            <li key={f} className="flex gap-3">
              <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-current opacity-50" />
              {f}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "care",
      title: "Care",
      meta: "Cold wash",
      content: (
        <ul className="space-y-2">
          {p.care.map((c) => (
            <li key={c} className="flex gap-3">
              <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-current opacity-50" />
              {c}
            </li>
          ))}
        </ul>
      ),
    },
  ];
}

/** Accordions on mobile; editorial specification sheet on desktop. */
export function ProductSpecs({ product }: { product: Product }) {
  const items = rows(product);
  return (
    <section aria-labelledby="specs-title" className="bg-ink py-16 text-bone md:py-28">
      <div className="container-x">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="eyebrow mb-4 text-mist">Specification / {product.id.toUpperCase()}</p>
            <h2 id="specs-title" className="display text-[clamp(2.75rem,8vw,6.5rem)]">
              The details.
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs text-steel md:block">Sample specification data for design review.</p>
        </div>

        <div className="md:hidden">
          <Accordion items={items} defaultOpen="fit" />
        </div>

        <dl className="hidden border-t border-line md:block">
          {items.map((row, i) => (
            <div key={row.id} className="grid grid-cols-12 gap-6 border-b border-line py-7 lg:py-9">
              <dt className="col-span-3 flex items-baseline gap-4">
                <span className="font-mono text-xs text-steel">{String(i + 1).padStart(2, "0")}</span>
                <span className="label">{row.title}</span>
              </dt>
              <dd className="col-span-3 display text-3xl lg:text-4xl">{row.meta ?? "—"}</dd>
              <dd className="col-span-6 text-sm leading-relaxed text-bone/75">{row.content}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
