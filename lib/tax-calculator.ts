/**
 * Sinna Dental AI — Ethiopian Ministry of Revenues (MoR) Fiscal Tax Engine
 * 
 * Strict Compliance:
 * - FDRE Proclamation No. 285/2002 & MoR Fiscal Invoicing Regulations
 * - Standard VAT Rate: 15.0% (0.15)
 * - Pricing Model: Tax-Inclusive (Clinical service fees already contain Net Service Value + 15% VAT)
 * 
 * Mathematical Formulation:
 *   Gross Total (T) = Net Service Value (Base) * (1 + VAT_RATE)
 *   Net Service Value = Gross Total / (1 + VAT_RATE) = Gross Total / 1.15
 *   VAT Amount = Gross Total - Net Service Value = Gross Total * (0.15 / 1.15)
 */

export const ETHIOPIAN_MOR_VAT_RATE = 0.15; // 15% Value Added Tax
export const CLINIC_DEFAULT_TIN = '0049283711';

export interface TaxBreakdown {
  grossETB: number;       // Final all-inclusive amount charged/paid (e.g. 1,500.00 ETB)
  netETB: number;         // Base taxable clinical service amount (e.g. 1,304.35 ETB)
  vatETB: number;         // 15% MoR VAT collected (e.g. 195.65 ETB)
  vatRate: number;        // Rate applied (0.15 for 15%)
  vatRatePercent: string; // "15%"
  tinNumber: string;      // MoR TIN (0049283711)
}

/**
 * Calculates the exact tax-inclusive breakdown for any gross Ethiopian Birr amount.
 * Rounds cleanly to 2 decimal places (santims) according to fiscal standards.
 */
export function calculateTaxInclusive(
  grossAmountETB: number,
  vatRate: number = ETHIOPIAN_MOR_VAT_RATE,
  tin: string = CLINIC_DEFAULT_TIN
): TaxBreakdown {
  const gross = Math.max(0, Number(grossAmountETB) || 0);
  const net = Number((gross / (1 + vatRate)).toFixed(2));
  // Deductive VAT guarantees Gross = Net + VAT exact balance without 1-cent rounding drift
  const vat = Number((gross - net).toFixed(2));

  return {
    grossETB: gross,
    netETB: net,
    vatETB: vat,
    vatRate,
    vatRatePercent: `${(vatRate * 100).toFixed(0)}%`,
    tinNumber: tin,
  };
}

/**
 * Aggregates tax breakdown across a collection of transactions or line items.
 */
export function aggregateTaxInclusive(
  grossAmounts: number[],
  vatRate: number = ETHIOPIAN_MOR_VAT_RATE,
  tin: string = CLINIC_DEFAULT_TIN
): TaxBreakdown {
  const totalGross = grossAmounts.reduce((sum, amt) => sum + (Number(amt) || 0), 0);
  return calculateTaxInclusive(totalGross, vatRate, tin);
}

