import { IAsset } from '../types';

export interface DepreciationInfo {
  purchaseValue: number;
  currentValue: number;
  depreciatedAmount: number;
  depreciationPercentage: number;
  annualDepreciationRate: number;
  yearsElapsed: number;
  monthsElapsed: number;
}

/**
 * Calculate asset depreciation using straight-line depreciation method
 * @param asset - The asset to calculate depreciation for
 * @returns DepreciationInfo object with all depreciation details
 */
export function calculateDepreciation(asset: IAsset): DepreciationInfo {
  const purchaseDate = new Date(asset.purchaseDate);
  const currentDate = new Date();
  
  // Calculate time elapsed
  const timeElapsedMs = currentDate.getTime() - purchaseDate.getTime();
  const monthsElapsed = Math.floor((timeElapsedMs / (1000 * 60 * 60 * 24 * 30.44)));
  const yearsElapsed = monthsElapsed / 12;
  
  // Use usefulLife for straight-line depreciation, or default rate for other methods
  const usefulLife = asset.usefulLife || 5;
  const depreciationRate = (100 / usefulLife); // Convert useful life to annual rate
  
  // Calculate depreciation using straight-line method
  // Formula: Current Value = Purchase Value - (Purchase Value × Depreciation Rate × Years)
  const annualDepreciation = asset.purchasePrice * (depreciationRate / 100);
  const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, asset.purchasePrice);
  
  const currentValue = Math.max(asset.purchasePrice - totalDepreciation, 0);
  const depreciationPercentage = asset.purchasePrice > 0 ? (totalDepreciation / asset.purchasePrice) * 100 : 0;
  
  // Calculate annual depreciation rate: (currentValue / purchaseValue)^(1/years) - 1
  // This gives the effective annual rate of value retention
  let annualDepreciationRate = 0;
  if (yearsElapsed > 0 && currentValue > 0 && asset.purchasePrice > 0) {
    const remainingValueRatio = currentValue / asset.purchasePrice;
    const annualRetentionFactor = Math.pow(remainingValueRatio, 1 / yearsElapsed);
    annualDepreciationRate = (1 - annualRetentionFactor) * 100;
  }
  
  return {
    purchaseValue: asset.purchasePrice,
    currentValue: Math.round(currentValue * 100) / 100,
    depreciatedAmount: Math.round(totalDepreciation * 100) / 100,
    depreciationPercentage: Math.round(depreciationPercentage * 100) / 100,
    annualDepreciationRate: Math.round(annualDepreciationRate * 100) / 100,
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
