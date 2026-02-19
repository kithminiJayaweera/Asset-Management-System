# Maintenance Workflow Implementation

## Overview
This implementation provides a complete maintenance workflow system for assets with real-world logic and comprehensive tracking.

## Features Implemented

### 1. Maintenance Dialog Component
**Location:** `src/components/admin/MaintenanceDialog.tsx`

**Required Fields:**
- ✅ Issue Title (e.g., "Screen not working")
- ✅ Issue Description (detailed problem)
- ✅ Maintenance Type (Preventive, Corrective, Warranty Repair)
- ✅ Priority (Low, Medium, High, Critical)
- ✅ Expected Return Date
- ✅ Assigned Repair Vendor/Technician (Internal IT Staff, External Service Center, etc.)
- ✅ Estimated Cost
- ✅ Attachments (Photos, Invoices, Warranty Documents)
- ✅ Additional Notes

### 2. Updated Data Models

**Maintenance Model** (`src/models/Maintenance.ts`):
```typescript
{
  assetId: ObjectId (required)
  issueTitle: string (required)
  issueDescription: string (required)
  maintenanceType: 'preventive' | 'corrective' | 'warranty' (required)
  priority: 'low' | 'medium' | 'high' | 'critical' (required)
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  expectedReturnDate: Date
  assignedVendor: string
  estimatedCost: number
  actualCost: number
  attachments: string[]
  performedBy: string
  performedDate: Date
  completionDate: Date
  notes: string
  organizationId: ObjectId (required)
}
```

### 3. API Routes

**POST /api/maintenance**
- Creates a new maintenance record
- Automatically updates asset status to 'maintenance'
- Validates required fields

**GET /api/maintenance**
- Retrieves maintenance records
- Supports filtering by assetId, organizationId, status

### 4. Server Actions

**Location:** `src/actions/maintenance.ts`

- `createMaintenanceRecord()` - Create new maintenance request
- `getMaintenanceRecords()` - Fetch maintenance records with filters
- `updateMaintenanceStatus()` - Update maintenance status and complete workflow

### 5. Updated AssetList Component

**New Features:**
- Added "Send to Maintenance" button (wrench icon)
- Only shows for assets NOT already in maintenance
- Integrated with MaintenanceDialog

## Usage Example

```tsx
import { AssetList } from '@/components/admin/AssetList';
import { MaintenanceDialog } from '@/components/admin/MaintenanceDialog';
import { useState } from 'react';

function YourComponent() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSendToMaintenance = (asset) => {
    setSelectedAsset(asset);
    setShowDialog(true);
  };

  const handleSubmit = async (data) => {
    const response = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      alert('Success!');
      setShowDialog(false);
    }
  };

  return (
    <>
      <AssetList
        assets={assets}
        organizations={organizations}
        onSendToMaintenance={handleSendToMaintenance}
        // ... other props
      />
      
      {showDialog && selectedAsset && (
        <MaintenanceDialog
          asset={selectedAsset}
          onClose={() => setShowDialog(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
```

## Workflow Process

1. **Admin clicks "Send to Maintenance"** on an asset
2. **Dialog opens** with pre-filled asset information
3. **Admin fills required fields:**
   - Issue title and description
   - Maintenance type and priority
   - Expected return date
   - Assigned vendor
   - Estimated cost
   - Attachments (optional)
4. **On submit:**
   - Maintenance record is created
   - Asset status changes to 'maintenance'
   - Record is saved to database
5. **During maintenance:**
   - Status can be updated to 'in-progress'
   - Actual costs can be tracked
6. **On completion:**
   - Status updated to 'completed'
   - Asset status returns to 'active'
   - Completion date recorded

## Database Indexes

The Maintenance model includes optimized indexes:
- `assetId` - Fast lookup by asset
- `status` - Filter by maintenance status
- `organizationId` - Multi-tenant support
- `performedDate` - Chronological sorting

## File Attachments

The system supports file attachments for:
- Photos of damage
- Repair invoices
- Warranty documents
- Service reports

**Note:** File upload implementation requires additional storage setup (e.g., AWS S3, local storage).

## Next Steps

To fully implement file uploads:
1. Set up file storage (AWS S3, Cloudinary, or local)
2. Add file upload handler in API route
3. Store file URLs in `attachments` array
4. Display attachments in maintenance records view

## Testing

Test the workflow:
1. Navigate to asset list
2. Click wrench icon on any active asset
3. Fill in maintenance form
4. Submit and verify:
   - Asset status changes to 'maintenance'
   - Maintenance record is created
   - Asset disappears from active filters
