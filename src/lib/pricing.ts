/**
 * Order pricing — shared by the storefront (display) and the server (authoritative).
 * Prices are GST-inclusive, so tax is shown as "included", never added on top.
 */

export const pricingConfig = {
  /** Flat shipping fee (₹) below the free-shipping threshold. 0 = always free. */
  shippingFee: 0,
  freeShippingFrom: 0,
  /**
   * GST on apparel (India): 5% up to ₹2,500 per piece, 18% above (rates from Sept 2025).
   * Confirm current rates with your accountant before launch.
   */
  gst: { threshold: 2500, lowRate: 5, highRate: 18 },
};

export interface PriceLine {
  price: number;
  quantity: number;
}

export function gstRate(unitPrice: number) {
  const { threshold, lowRate, highRate } = pricingConfig.gst;
  return unitPrice <= threshold ? lowRate : highRate;
}

/** GST contained in a tax-inclusive amount, rounded to the rupee. */
export function includedGst(unitPrice: number, quantity: number) {
  const rate = gstRate(unitPrice);
  return Math.round((unitPrice * quantity * rate) / (100 + rate));
}

export function computeTotals(lines: PriceLine[]) {
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const shipping =
    subtotal === 0 || pricingConfig.shippingFee === 0 || subtotal >= pricingConfig.freeShippingFrom ? 0 : pricingConfig.shippingFee;
  const taxIncluded = lines.reduce((n, l) => n + includedGst(l.price, l.quantity), 0);
  return { subtotal, shipping, taxIncluded, total: subtotal + shipping };
}
