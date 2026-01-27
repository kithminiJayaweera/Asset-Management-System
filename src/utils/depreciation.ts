import { Asset } from '../page';

export interface DepreciationInfo {
  purchaseValue: number;
  currentValue: number;
  depreciatedAmount: number;
  depreciationPercentage: number;
  yearsElapsed: number;
  monthsElapsed: number;
}

/**
 * Calculate asset depreciation using straight-line depreciation method
 * @param asset - The asset to calculate depreciation for
 * @returns DepreciationInfo object with all depreciation details
 */
export function calculateDepreciation(asset: Asset): DepreciationInfo {
  const purchaseDate = new Date(asset.purchaseDate);
  const currentDate = new Date();
  
  // Calculate time elapsed
  const timeElapsedMs = currentDate.getTime() - purchaseDate.getTime();
  const yearsElapsed = timeElapsedMs / (1000 * 60 * 60 * 24 * 365.25);
  const monthsElapsed = Math.floor((timeElapsedMs / (1000 * 60 * 60 * 24 * 30.44)));
  
  // Use default depreciation rate if not specified
  const depreciationRate = asset.depreciationRate || getDefaultDepreciationRate(asset.category);
  
  // Calculate depreciation using straight-line method
  // Formula: Current Value = Purchase Value - (Purchase Value × Depreciation Rate × Years)
  const annualDepreciation = asset.value * (depreciationRate / 100);
  const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, asset.value);
  
  const currentValue = Math.max(asset.value - totalDepreciation, 0);
  const depreciationPercentage = asset.value > 0 ? (totalDepreciation / asset.value) * 100 : 0;
  
  return {
    purchaseValue: asset.value,
    currentValue: Math.round(currentValue * 100) / 100,
    depreciatedAmount: Math.round(totalDepreciation * 100) / 100,
    depreciationPercentage: Math.round(depreciationPercentage * 100) / 100,
    yearsElapsed: Math.round(yearsElapsed * 100) / 100,
    monthsElapsed
  };
}

/**
 * Get default depreciation rate based on asset category
 * @param category - Asset category
 * @returns Default annual depreciation rate as percentage
 */
export function getDefaultDepreciationRate(category: string): number {
  const categoryLower = category.toLowerCase();
  
  // Standard depreciation rates by category
  if (categoryLower.includes('electronics') || categoryLower.includes('computer')) {
    return 20; // 20% per year (5 year lifespan)
  } else if (categoryLower.includes('furniture')) {
    return 10; // 10% per year (10 year lifespan)
  } else if (categoryLower.includes('vehicle') || categoryLower.includes('car')) {
    return 15; // 15% per year
  } else if (categoryLower.includes('machinery') || categoryLower.includes('equipment')) {
    return 12.5; // 12.5% per year (8 year lifespan)
  } else {
    return 10; // Default 10% per year
  }
}

/**
 * Format currency value
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
