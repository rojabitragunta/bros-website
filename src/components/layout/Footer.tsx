import Link from "next/link";
import { footerNav, legalNav, site } from "@/data/site";
import { InstagramIcon, YouTubeIcon } from "@/components/ui/Icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink text-bone">
      <div className="container-x grid gap-12 pb-12 pt-16 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-4">
          <p className="eyebrow text-mist">BRO&rsquo;S / {site.city}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone/70">
            Performance activewear, engineered for movement. Born in {site.city}, built for every session.
          </p>
          <div className="mt-6 flex gap-1">
            <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="BRO'S on Instagram" className="-ml-3 grid size-11 place-items-center text-bone/70 transition-colors hover:text-bone">
              <InstagramIcon className="size-5" />
            </a>
            <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="BRO'S on YouTube" className="grid size-11 place-items-center text-bone/70 transition-colors hover:text-bone">
              <YouTubeIcon className="size-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-8">
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow mb-4 text-mist">{col.title}</h2>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-bone/80 transition-colors hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Social">
            <h2 className="eyebrow mb-4 text-mist">Social</h2>
            <ul className="space-y-1">
              <li>
                <a href={site.social.instagram} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center text-sm text-bone/80 hover:text-bone">
                  Instagram
                </a>
              </li>
              <li>
                <a href={site.social.youtube} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center text-sm text-bone/80 hover:text-bone">
                  YouTube
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="container-x">
        <p
          aria-hidden
          className="display-wide select-none text-center text-[21.5vw] leading-[0.78] tracking-[-0.04em] text-bone/[0.06] sm:text-[22vw] 2xl:text-[20.5rem]"
        >
          BRO&rsquo;S
        </p>
      </div>

      <div className="container-x flex flex-col gap-4 border-t border-line py-6 text-xs text-mist md:flex-row md:items-center md:justify-between">
        <p className="font-mono uppercase tracking-[0.16em]">© 2026 BRO&rsquo;S</p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-8 items-center transition-colors hover:text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-mono uppercase tracking-[0.16em] text-steel">Phase 1 preview · Demo data</p>
      </div>
    </footer>
  );
}
