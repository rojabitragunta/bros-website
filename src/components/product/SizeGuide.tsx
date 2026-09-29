"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Ruler } from "lucide-react";
import { useState } from "react";
import { sizeGuide } from "@/data/size-guide";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { Modal } from "@/components/ui/Modal";

export function SizeTable({ className, highlight }: { className?: string; highlight?: string }) {
  return (
    <div className={cn("-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <table className="w-full min-w-[420px] border-collapse text-left">
        <caption className="sr-only">Size guide, body measurements in centimetres</caption>
        <thead>
          <tr className="border-b border-current/20">
            {sizeGuide.columns.map((c) => (
              <th key={c} scope="col" className="eyebrow py-3 pr-4 font-normal opacity-60">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sizeGuide.rows.map((r) => (
            <tr key={r.size} className={cn("border-b border-current/10 transition-colors", highlight === r.size && "bg-current/[0.06]")}>
              <th scope="row" className="py-3.5 pr-4 font-mono text-sm font-medium">
                {r.size}
              </th>
              <td className="py-3.5 pr-4 font-mono text-sm tabular-nums opacity-80">{r.chest}</td>
              <td className="py-3.5 pr-4 font-mono text-sm tabular-nums opacity-80">{r.waist}</td>
              <td className="py-3.5 pr-4 font-mono text-sm tabular-nums opacity-80">{r.hip}</td>
              <td className="py-3.5 font-mono text-sm tabular-nums opacity-80">{r.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-wider opacity-50">Sample data · All measurements in {sizeGuide.unit}</p>
    </div>
  );
}

export function SizeGuideModal() {
  const open = useUI((s) => s.overlay === "size-guide");
  const close = useUI((s) => s.close);
  const [help, setHelp] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => {
        close();
        setHelp(false);
      }}
      eyebrow="Fit / Measurements"
      title={help ? "Find your fit" : "Size Guide"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!help ? (
          <motion.div key="table" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <SizeTable />
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="mt-8 flex min-h-14 w-full items-center justify-between gap-4 border border-line px-5 text-left transition-colors hover:border-bone"
            >
              <span className="flex items-center gap-3">
                <Ruler className="size-4 text-mist" strokeWidth={1.5} aria-hidden />
                <span className="text-sm">Not sure about your size?</span>
              </span>
              <span className="label text-mist">Guide</span>
            </button>
          </motion.div>
        ) : (
          <motion.div key="help" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}>
            <button type="button" onClick={() => setHelp(false)} className="label mb-6 flex min-h-10 items-center gap-2 text-mist hover:text-bone">
              <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden /> Back to table
            </button>
            <h3 className="eyebrow mb-4 text-mist">How to measure</h3>
            <ol className="grid gap-px bg-line sm:grid-cols-2">
              {sizeGuide.howToMeasure.map((m, i) => (
                <li key={m.title} className="bg-onyx p-5">
                  <p className="font-mono text-xs text-steel">0{i + 1}</p>
                  <p className="label mt-2">{m.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{m.body}</p>
                </li>
              ))}
            </ol>
            <h3 className="eyebrow mb-4 mt-8 text-mist">Fit tips</h3>
            <ul className="space-y-3">
              {sizeGuide.fitTips.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-bone/80">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-bone/40" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-line pt-5 text-xs text-steel">Personalised size recommendations are coming in a future update.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
