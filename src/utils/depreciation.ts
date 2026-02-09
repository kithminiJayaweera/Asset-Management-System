import { IAsset } from '@/types';

/**
 * Normalized depreciation info used across UI & reports
 */
export interface DepreciationInfo {
  purchaseValue: number;
  currentValue: number;
  depreciatedAmount: number;
  totalDepreciationPercentage: number;
  effectiveAnnualDepreciationRate: number;
  yearsElapsed: number;
  monthsElapsed: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365.25;
const DAYS_PER_MONTH = 30.44;

/**
 * Safely round to 2 decimal places
 */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate straight-line depreciation based on exact days elapsed.
 * Formula:
 *   annualDepreciation = (purchasePrice - salvageValue) / usefulLife
 *   accumulated = annualDepreciation * (daysElapsed / 365.25)
 *
 * Current Value = purchasePrice - accumulatedDepreciation
 */
export function calculateStraightLineDepreciation(
  purchasePrice: number,
  salvageValue: number,
  usefulLife: number,
  purchaseDate: Date,
  currentDate: Date = new Date()
): number {
  if (purchasePrice <= 0 || usefulLife <= 0) return purchasePrice;

  const purchase = new Date(purchaseDate);
  const current = new Date(currentDate);

  if (purchase >= current) return purchasePrice;

  const daysElapsed = Math.floor((current.getTime() - purchase.getTime()) / MS_PER_DAY);
  if (daysElapsed <= 0) return purchasePrice;

  const depreciableAmount = Math.max(0, purchasePrice - salvageValue);
  const annualDepreciation = depreciableAmount / usefulLife;
  const accumulatedDepreciation = annualDepreciation * (daysElapsed / DAYS_PER_YEAR);

  const currentValue = purchasePrice - accumulatedDepreciation;
  return round2(Math.max(salvageValue, currentValue));
}

/**
 * Calculate declining-balance depreciation using fractional years.
 */
function calculateDecliningBalanceDepreciation(
  purchasePrice: number,
  salvageValue: number,
  depreciationRate: number,
  purchaseDate: Date,
  currentDate: Date = new Date()
): number {
  if (purchasePrice <= 0 || depreciationRate <= 0) return purchasePrice;

  const purchase = new Date(purchaseDate);
  const current = new Date(currentDate);

  if (purchase >= current) return purchasePrice;

  const yearsElapsed = (current.getTime() - purchase.getTime()) / (MS_PER_DAY * DAYS_PER_YEAR);
  if (yearsElapsed <= 0) return purchasePrice;

  const rate = Math.max(0.001, Math.min(0.5, depreciationRate));
  const depreciatedValue = purchasePrice * Math.pow(1 - rate, yearsElapsed);

  return round2(Math.max(salvageValue, depreciatedValue));
}

/**
 * SINGLE SOURCE OF TRUTH
 * Backend-only current value calculation
 */
export function calculateCurrentValue(asset: Partial<IAsset>): number {
  if (!asset.purchasePrice || !asset.purchaseDate) {
    return asset.purchasePrice || 0;
  }

  const purchasePrice = asset.purchasePrice;
  const salvageValue = Math.max(0, asset.salvageValue || 0);

  switch (asset.depreciationMethod) {
    case 'straight-line': {
      const usefulLife = asset.usefulLife || 5;
      return calculateStraightLineDepreciation(
        purchasePrice,
        salvageValue,
        usefulLife,
        asset.purchaseDate
      );
    }

    case 'declining-balance': {
      const rate = (asset.depreciationRate || 10) / 100;
      return calculateDecliningBalanceDepreciation(
        purchasePrice,
        salvageValue,
        rate,
        asset.purchaseDate
      );
    }

    default:
      return purchasePrice;
  }
}

/**
 * Determine whether valuation should be recalculated
 */
export function isValuationStale(asset: Partial<IAsset>, daysThreshold = 30): boolean {
  if (!asset.lastValuationDate) return true;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysThreshold);

  return new Date(asset.lastValuationDate) < cutoff;
}

/**
 * Full depreciation breakdown for UI / reports
 */
export function getDepreciationInfo(asset: Partial<IAsset>): DepreciationInfo {
  if (!asset.purchasePrice || !asset.purchaseDate) {
    return {
      purchaseValue: asset.purchasePrice || 0,
      currentValue: asset.purchasePrice || 0,
      depreciatedAmount: 0,
      totalDepreciationPercentage: 0,
      effectiveAnnualDepreciationRate: 0,
      yearsElapsed: 0,
      monthsElapsed: 0,
    };
  }

  const purchaseDate = new Date(asset.purchaseDate);
  const now = new Date();

  const timeElapsedMs = Math.max(0, now.getTime() - purchaseDate.getTime());
  const yearsElapsed = timeElapsedMs / (MS_PER_DAY * DAYS_PER_YEAR);
  const monthsElapsed = Math.floor(timeElapsedMs / (MS_PER_DAY * DAYS_PER_MONTH));

  const currentValue = calculateCurrentValue(asset);
  const depreciatedAmount = Math.max(0, asset.purchasePrice - currentValue);

  const totalDepreciationPercentage = asset.purchasePrice > 0
    ? (depreciatedAmount / asset.purchasePrice) * 100
    : 0;

  const effectiveAnnualDepreciationRate =
    yearsElapsed > 0 && asset.purchasePrice > 0
      ? (depreciatedAmount / asset.purchasePrice / yearsElapsed) * 100
      : 0;

  return {
    purchaseValue: round2(asset.purchasePrice),
    currentValue: round2(currentValue),
    depreciatedAmount: round2(depreciatedAmount),
    totalDepreciationPercentage: round2(Math.min(100, totalDepreciationPercentage)),
    effectiveAnnualDepreciationRate: round2(effectiveAnnualDepreciationRate),
    yearsElapsed: round2(yearsElapsed),
    monthsElapsed,
  };
}

/**
 * Currency formatter (LKR)
 */
export function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
