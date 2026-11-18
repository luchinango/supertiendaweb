/**
 * Totales comerciales alineados al motor SALE_CREATE (PosCashSyncService).
 *
 * Contrato (P2-C1.F3):
 * - unitPrice = customPrice neto (no incluye IVA).
 * - lineSub = unitPrice × quantity
 * - lineTax = lineSub × (taxRate / 100)   // aditivo; default taxRate = 13
 * - lineTotal = lineSub + lineTax − lineDiscount
 * - saleSubtotal = Σ lineSub
 * - saleTax = Σ lineTax
 * - totalAmount = saleSubtotal + saleTax − headerDiscount
 * - change = max(0, cashReceived − totalAmount)
 *
 * El servidor es autoridad del total definitivo al confirmar.
 */

export const DEFAULT_PRODUCT_TAX_RATE = 13;

export type CommercialLineInput = {
  quantity: number;
  unitPrice: number;
  /** Porcentaje IVA del producto; si falta, DEFAULT_PRODUCT_TAX_RATE (igual que BE ?? 13). */
  taxRate?: number | null;
  lineDiscount?: number | null;
  name?: string;
};

export type CommercialLineBreakdown = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineSubtotal: number;
  lineTax: number;
  lineDiscount: number;
  lineTotal: number;
  name?: string;
};

export type CommercialTotals = {
  lines: CommercialLineBreakdown[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
};

/** Redondeo monetario a 2 decimales (half-up vía Math.round). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function resolveTaxRate(taxRate?: number | null): number {
  if (taxRate == null || !Number.isFinite(taxRate) || taxRate < 0) {
    return DEFAULT_PRODUCT_TAX_RATE;
  }
  return taxRate;
}

export function computeCommercialTotals(
  lines: CommercialLineInput[],
  headerDiscount = 0
): CommercialTotals {
  const discountAmount = Math.max(0, Number.isFinite(headerDiscount) ? headerDiscount : 0);
  const breakdown: CommercialLineBreakdown[] = [];
  let subtotal = 0;
  let taxAmount = 0;

  for (const raw of lines) {
    const quantity = Number(raw.quantity);
    const unitPrice = Number(raw.unitPrice);
    const taxRate = resolveTaxRate(raw.taxRate);
    const lineDiscount = Math.max(0, Number(raw.lineDiscount) || 0);
    const lineSubtotal = roundMoney(unitPrice * quantity);
    const lineTax = roundMoney((lineSubtotal * taxRate) / 100);
    const lineTotal = roundMoney(lineSubtotal + lineTax - lineDiscount);
    subtotal = roundMoney(subtotal + lineSubtotal);
    taxAmount = roundMoney(taxAmount + lineTax);
    breakdown.push({
      quantity,
      unitPrice,
      taxRate,
      lineSubtotal,
      lineTax,
      lineDiscount,
      lineTotal,
      name: raw.name,
    });
  }

  const totalAmount = roundMoney(Math.max(0, subtotal + taxAmount - discountAmount));
  return { lines: breakdown, subtotal, taxAmount, discountAmount, totalAmount };
}

export function computeChange(cashReceived: number, totalAmount: number): number {
  return Math.max(0, roundMoney(cashReceived - totalAmount));
}

/** Diferencia absoluta entre provisional y servidor (Bs). */
export function totalsDiffer(a: number, b: number, epsilon = 0.009): boolean {
  return Math.abs(roundMoney(a) - roundMoney(b)) > epsilon;
}
