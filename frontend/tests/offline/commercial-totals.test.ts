import { describe, expect, it } from 'vitest';
import {
  computeChange,
  computeCommercialTotals,
  DEFAULT_PRODUCT_TAX_RATE,
  roundMoney,
  totalsDiffer,
} from '@/lib/pos/commercialTotals';

describe('P2-C1.F3 commercial totals (alineado a SALE_CREATE)', () => {
  it('precio × cantidad + IVA 13% aditivo', () => {
    const t = computeCommercialTotals([{ quantity: 1, unitPrice: 15, taxRate: 13 }]);
    expect(t.subtotal).toBe(15);
    expect(t.taxAmount).toBe(1.95);
    expect(t.totalAmount).toBe(16.95);
    expect(t.lines[0]!.lineTotal).toBe(16.95);
  });

  it('usa default 13 si taxRate ausente', () => {
    const t = computeCommercialTotals([{ quantity: 2, unitPrice: 10 }]);
    expect(DEFAULT_PRODUCT_TAX_RATE).toBe(13);
    expect(t.subtotal).toBe(20);
    expect(t.taxAmount).toBe(2.6);
    expect(t.totalAmount).toBe(22.6);
  });

  it('redondeo decimal a 2 lugares', () => {
    const t = computeCommercialTotals([{ quantity: 3, unitPrice: 10.1, taxRate: 13 }]);
    // 30.3 + 3.939 → tax round 3.94 → total 34.24
    expect(t.subtotal).toBe(30.3);
    expect(t.taxAmount).toBe(roundMoney(30.3 * 0.13));
    expect(t.totalAmount).toBe(roundMoney(t.subtotal + t.taxAmount));
  });

  it('descuento de cabecera reduce total sin tocar lineTax', () => {
    const t = computeCommercialTotals([{ quantity: 1, unitPrice: 100, taxRate: 13 }], 10);
    expect(t.subtotal).toBe(100);
    expect(t.taxAmount).toBe(13);
    expect(t.discountAmount).toBe(10);
    expect(t.totalAmount).toBe(103);
  });

  it('cambio y diferencia de totales', () => {
    expect(computeChange(20, 16.95)).toBe(3.05);
    expect(totalsDiffer(16.95, 16.95)).toBe(false);
    expect(totalsDiffer(16.95, 17.1)).toBe(true);
  });
});
