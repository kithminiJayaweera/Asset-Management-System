import { calculateCurrentValue } from './depreciation';
import Asset from '@/models/Asset';

/**
 * Recalculate and update currentValue for a single asset.
 * Call this when fetching assets to ensure up-to-date values.
 * 
 * @param assetId - Asset ID to update
 * @returns Updated asset or null
 */
export async function updateAssetDepreciation(assetId: string) {
  const asset = await Asset.findById(assetId);
  if (!asset) return null;

  const calculatedValue = calculateCurrentValue({
    purchasePrice: asset.purchasePrice,
    purchaseDate: asset.purchaseDate,
    depreciationMethod: asset.depreciationMethod,
    usefulLife: asset.usefulLife,
    salvageValue: asset.salvageValue,
    depreciationRate: asset.depreciationRate
  });

  asset.currentValue = calculatedValue;
  if (!asset.maintenance) {
    asset.maintenance = {};
  }
  asset.maintenance.currentValue = calculatedValue;
  asset.maintenance.lastDepreciationCalculatedDate = new Date();
  
  await asset.save();
  return asset;
}

/**
 * Recalculate depreciation for all assets in an organization.
 * Run this as a scheduled job or on-demand.
 * 
 * @param organizationId - Organization ID
 * @returns Number of assets updated
 */
export async function recalculateAllDepreciation(organizationId?: string) {
  const filter = organizationId ? { organizationId } : {};
  const assets = await Asset.find(filter);
  
  let updated = 0;
  for (const asset of assets) {
    const calculatedValue = calculateCurrentValue({
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      depreciationMethod: asset.depreciationMethod,
      usefulLife: asset.usefulLife,
      salvageValue: asset.salvageValue,
      depreciationRate: asset.depreciationRate
    });

    asset.currentValue = calculatedValue;
    if (!asset.maintenance) {
      asset.maintenance = {};
    }
    asset.maintenance.currentValue = calculatedValue;
    asset.maintenance.lastDepreciationCalculatedDate = new Date();
    
    await asset.save();
    updated++;
  }
  
  return updated;
}
