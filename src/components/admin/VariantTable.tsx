"use client";

import { useActionState } from "react";
import { updateVariant } from "@/app/admin/actions";
import type { FormState } from "@/app/actions/auth";
import { colourMap } from "@/data/colours";
import { stockStatus } from "@/lib/catalog-utils";
import { cn } from "@/lib/utils";
import { StockAdjustForm } from "./StockAdjustForm";
import { StockPill, Table, inputCls } from "./ui";

export interface AdminVariant {
  id: string;
  colour: string;
  size: string;
  sku: string;
  stock: number;
  active: boolean;
}

function SkuForm({ v }: { v: AdminVariant }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateVariant, {});
  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="variantId" value={v.id} />
      <input name="sku" defaultValue={v.sku} aria-label={`SKU for ${v.colour} ${v.size}`} className={cn(inputCls, "h-8 w-40 px-2 font-mono text-xs uppercase")} />
      <button className="h-8 px-2 text-[0.6875rem] uppercase text-mist hover:text-bone" disabled={pending}>
        Save
      </button>
      {state.error && <span className="text-xs text-red-300">{state.error}</span>}
      {state.ok && <span className="text-xs text-emerald-300">✓</span>}
    </form>
  );
}

export function VariantTable({ variants, lowThreshold }: { variants: AdminVariant[]; lowThreshold: number }) {
  const active = variants.filter((v) => v.active);
  const inactive = variants.length - active.length;
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Colour / size</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Adjust stock</th>
          </tr>
        </thead>
        <tbody>
          {active.map((v) => (
            <tr key={v.id}>
              <td className="whitespace-nowrap">
                <span className="mr-2 inline-block size-3 rounded-full align-middle ring-1 ring-bone/30" style={{ background: colourMap[v.colour as keyof typeof colourMap]?.hex }} />
                {colourMap[v.colour as keyof typeof colourMap]?.name ?? v.colour} / <span className="font-mono">{v.size}</span>
              </td>
              <td>
                <SkuForm v={v} />
              </td>
              <td>
                <StockPill status={stockStatus(v.stock, lowThreshold)} stock={v.stock} />
              </td>
              <td>
                <StockAdjustForm variantId={v.id} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {inactive > 0 && <p className="mt-2 text-xs text-steel">{inactive} hidden variant(s) from removed colours/sizes are kept for order history.</p>}
    </>
  );
}
