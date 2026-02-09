# Straight-Line Depreciation Implementation

## Overview
This system implements **exact day-based straight-line depreciation** for asset management.

## Formula
```
Annual Depreciation = (Purchase Price - Salvage Value) / Useful Life
Accumulated Depreciation = Annual Depreciation × (Days Elapsed / 365.25)
Current Value = Purchase Price - Accumulated Depreciation
```

**Constraint**: `Current Value >= Salvage Value`

## Key Changes

### 1. Types Updated (`src/types/index.ts`)
- Added `currentValue` to `maintenance` object
- `depreciationRate` is now ignored for straight-line method

### 2. Depreciation Utility (`src/utils/depreciation.ts`)
- **New Function**: `calculateStraightLineDepreciation()` - Pure calculation based on exact days
- **Updated**: `calculateCurrentValue()` - Uses new straight-line logic
- Ignores `depreciationRate` when `depreciationMethod === 'straight-line'`

### 3. Asset Model (`src/models/Asset.ts`)
- Added `currentValue` field to `maintenance` schema
- **Pre-save Hook**: Automatically calculates and stores `currentValue` in both:
  - `asset.currentValue`
  - `asset.maintenance.currentValue`

### 4. Update Utilities (`src/utils/updateDepreciation.ts`)
- `updateAssetDepreciation(assetId)` - Update single asset
- `recalculateAllDepreciation(organizationId?)` - Batch update all assets

## When Depreciation is Calculated

### 1. **On Create** (Automatic)
When a new asset is created, the pre-save hook calculates `currentValue`:
```typescript
const newAsset = await Asset.create({
  assetTag: 'AST-001',
  purchasePrice: 10000,
  purchaseDate: new Date('2020-01-01'),
  usefulLife: 5,
  salvageValue: 1000,
  depreciationMethod: 'straight-line',
  // currentValue is auto-calculated
});
```

### 2. **On Update** (Automatic)
When depreciation-related fields are modified:
```typescript
asset.purchasePrice = 12000;
asset.usefulLife = 7;
await asset.save(); // Pre-save hook recalculates
```

### 3. **On Fetch** (Manual - Recommended)
For real-time accuracy when fetching assets:
```typescript
import { updateAssetDepreciation } from '@/utils/updateDepreciation';

// Single asset
const asset = await updateAssetDepreciation(assetId);

// Or in API route
const asset = await Asset.findById(id);
const currentValue = calculateCurrentValue(asset);
// Use currentValue for display
```

### 4. **Scheduled Job** (Recommended)
Run nightly to keep all assets up-to-date:
```typescript
import { recalculateAllDepreciation } from '@/utils/updateDepreciation';

// In a cron job or scheduled task
const updated = await recalculateAllDepreciation();
console.log(`Updated ${updated} assets`);
```

## Usage Examples

### Example 1: Create Asset with Straight-Line Depreciation
```typescript
const asset = await Asset.create({
  assetTag: 'LAPTOP-001',
  name: 'Dell Laptop',
  category: 'Electronics',
  purchasePrice: 50000,
  purchaseDate: new Date('2023-01-01'),
  usefulLife: 5,
  salvageValue: 5000,
  depreciationMethod: 'straight-line',
  organizationId: orgId,
});

// After 1 year (365 days):
// Annual Depreciation = (50000 - 5000) / 5 = 9000
// Current Value = 50000 - 9000 = 41000
```

### Example 2: Calculate Current Value On-Demand
```typescript
import { calculateCurrentValue } from '@/utils/depreciation';

const asset = await Asset.findById(assetId);
const currentValue = calculateCurrentValue(asset);

console.log(`Current Value: Rs. ${currentValue}`);
// Stored in: asset.maintenance.currentValue
```

### Example 3: Batch Update All Assets
```typescript
import { recalculateAllDepreciation } from '@/utils/updateDepreciation';

// Update all assets in organization
const count = await recalculateAllDepreciation(organizationId);
console.log(`Recalculated ${count} assets`);
```

## API Integration

### GET /api/assets/:id
```typescript
import { calculateCurrentValue } from '@/utils/depreciation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const asset = await Asset.findById(params.id);
  
  // Calculate real-time value
  const currentValue = calculateCurrentValue(asset);
  
  return Response.json({
    ...asset.toObject(),
    currentValue, // Real-time calculated value
    maintenance: {
      ...asset.maintenance,
      currentValue // Also in maintenance object
    }
  });
}
```

### POST /api/assets
```typescript
export async function POST(req: Request) {
  const data = await req.json();
  
  // Pre-save hook automatically calculates currentValue
  const asset = await Asset.create(data);
  
  return Response.json(asset);
}
```

## Field Requirements

### For Straight-Line Depreciation
**Required:**
- `purchasePrice` (number)
- `purchaseDate` (Date)
- `usefulLife` (number, in years)
- `depreciationMethod: 'straight-line'`

**Optional:**
- `salvageValue` (number, default: 0)

**Ignored:**
- `depreciationRate` (not used for straight-line)

## Migration Script (Optional)

To update existing assets:
```typescript
// scripts/migrate-depreciation.ts
import { recalculateAllDepreciation } from '@/utils/updateDepreciation';
import dbConnect from '@/lib/mongodb';

async function migrate() {
  await dbConnect();
  const count = await recalculateAllDepreciation();
  console.log(`✅ Updated ${count} assets`);
  process.exit(0);
}

migrate();
```

Run with:
```bash
npx tsx scripts/migrate-depreciation.ts
```

## Best Practices

1. **On Create/Update**: Let pre-save hook handle it automatically
2. **On Fetch**: Calculate real-time value using `calculateCurrentValue()`
3. **Scheduled Jobs**: Run `recalculateAllDepreciation()` nightly
4. **Display**: Always use `asset.maintenance.currentValue` or calculate on-demand
5. **Validation**: Ensure `usefulLife > 0` and `salvageValue < purchasePrice`

## Testing

```typescript
import { calculateStraightLineDepreciation } from '@/utils/depreciation';

// Test: 1 year depreciation
const value = calculateStraightLineDepreciation(
  10000, // purchasePrice
  1000,  // salvageValue
  5,     // usefulLife
  new Date('2023-01-01'),
  new Date('2024-01-01')
);
// Expected: 10000 - ((10000-1000)/5 * 1) = 8200
console.assert(value === 8200, 'Depreciation calculation failed');
```
