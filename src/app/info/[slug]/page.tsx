import Link from "next/link";
import { notFound } from "next/navigation";
import { infoPages } from "@/data/info-pages";
import { sizeGuide } from "@/data/size-guide";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { SizeTable } from "@/components/product/SizeGuide";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return infoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const page = infoPages.find((p) => p.slug === slug);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.intro, path: `/info/${page.slug}`, noIndex: page.group === "Legal" });
}

export default async function InfoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = infoPages.find((p) => p.slug === slug);
  if (!page) notFound();
  const groups = ["Help", "Company", "Legal"] as const;

  return (
    <div className="bg-ink pb-24 text-bone">
      <div className="container-x grid gap-12 pt-10 md:grid-cols-12 md:pt-16">
        <aside className="min-w-0 md:col-span-3">
          <nav aria-label="Information pages" className="md:sticky md:top-[calc(var(--nav-h)+2rem)]">
            {groups.map((g) => (
              <div key={g} className="mb-8 hidden md:block">
                <p className="eyebrow mb-3 text-steel">{g}</p>
                <ul>
                  {infoPages
                    .filter((p) => p.group === g)
                    .map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/info/${p.slug}`}
                          aria-current={p.slug === slug ? "page" : undefined}
                          className={cn("flex min-h-9 items-center text-sm transition-colors", p.slug === slug ? "text-bone" : "text-bone/55 hover:text-bone")}
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <p className="eyebrow md:hidden text-steel">
              <Link href="/">Home</Link> / {page.group}
            </p>
          </nav>
        </aside>

        <article className="min-w-0 md:col-span-8 md:col-start-5">
          <p className="eyebrow mb-4 text-mist">{page.group}</p>
          <h1 className="display text-[clamp(3rem,10vw,7rem)]">{page.title}</h1>
          <p className="mt-6 max-w-xl text-base text-bone/75">{page.intro}</p>

          {page.slug === "size-guide" && (
            <div className="mt-12 space-y-12">
              <SizeTable />
              <div>
                <h2 className="label mb-5">How to measure</h2>
                <dl className="grid gap-px bg-line sm:grid-cols-2">
                  {sizeGuide.howToMeasure.map((m) => (
                    <div key={m.title} className="bg-ink p-5">
                      <dt className="label">{m.title}</dt>
                      <dd className="mt-2 text-sm text-mist">{m.body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          <div className="mt-12 space-y-10">
            {page.sections.map((s) => (
              <section key={s.heading} className="border-t border-line pt-6">
                <h2 className="label mb-4">{s.heading}</h2>
                {s.body.map((b) => (
                  <p key={b} className="mb-3 max-w-2xl text-sm leading-relaxed text-bone/70">
                    {b}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <p className="mt-16 border-t border-dashed border-line pt-5 font-mono text-[0.625rem] uppercase tracking-wider text-steel">
            Draft placeholder content · Phase 1 preview
          </p>
        </article>
      </div>
    </div>
  );
}
