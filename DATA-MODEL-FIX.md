# Asset Status Data Model Fix

## Problem
- `status` field incorrectly contained "assigned" values
- Assignment state and lifecycle status were mixed
- No unique constraint on asset tags causing duplicates

## Solution

### 1. Corrected Schema (`src/models/Asset.ts`)

```typescript
status: {
  type: String,
  enum: ['active', 'maintenance', 'retired', 'lost'],
  default: 'active',
  required: true,
}
```

**Lifecycle Status (status field):**
- `active` - Asset is operational and available
- `maintenance` - Asset is under repair/maintenance
- `retired` - Asset is no longer in service
- `lost` - Asset is missing/stolen

**Assignment State (derived from assignedTo):**
- `assignedTo: null` → Unassigned
- `assignedTo: userId` → Assigned

### 2. Migration Script

**Run once to fix existing data:**
```bash
npm run db:migrate-status
```

This converts:
- `'assigned'` → `'active'`
- `'available'` → `'active'`

### 3. Business Logic API (`src/app/api/assets/[id]/assign/route.ts`)

**Assign Asset:**
```typescript
POST /api/assets/:id/assign
Body: { userId: string }

Rules:
- Cannot assign retired/lost assets
- Cannot assign already assigned assets
- Keeps lifecycle status independent
```

**Unassign Asset:**
```typescript
DELETE /api/assets/:id/assign

Rules:
- Sets assignedTo to null
- Lifecycle status remains unchanged
```

### 4. UI Implementation

**Status Column** - Shows lifecycle (active/maintenance/retired/lost)
**Assignment Column** - Shows badge (Assigned/Unassigned)
**Assigned To Column** - Shows user name or "-"

## Usage

### Creating Assets
```typescript
{
  name: "Laptop",
  status: "active",        // Lifecycle status
  assignedTo: null         // Unassigned
}
```

### Assigning Assets
```typescript
// POST /api/assets/123/assign
{ userId: "user-id" }

// Result: assignedTo = "user-id", status stays "active"
```

### Changing Lifecycle Status
```typescript
// PUT /api/assets/123
{ status: "maintenance" }

// Result: status = "maintenance", assignedTo unchanged
```

## Data Integrity

✅ Unique asset tags enforced
✅ Status enum validation
✅ Assignment business rules
✅ Independent dimensions
✅ Type-safe operations

## Migration Checklist

- [x] Update Asset schema
- [x] Create migration script
- [x] Add assign/unassign API
- [x] Update UI components
- [ ] Run migration: `npm run db:migrate-status`
- [ ] Test assignment workflow
- [ ] Verify status filtering
