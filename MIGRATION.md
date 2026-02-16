# Asset Status Migration Guide

## Problem Fixed

1. **Status Confusion**: `status` field incorrectly contained "assigned" and "available" values
2. **Mixed Concerns**: Assignment state and lifecycle status were conflated
3. **Duplicate Assets**: Missing uniqueness validation allowed duplicate asset tags

## Solution

### New Data Model

**Status (Lifecycle)**: `active` | `maintenance` | `retired` | `lost`
- Represents the physical/operational state of the asset
- Independent of assignment

**Assignment (Derived)**: `assigned` | `unassigned`
- Derived from `assignedTo` field
- `assignedTo = null` → Unassigned
- `assignedTo = userId` → Assigned

### Business Rules

1. ✅ Active assets can be assigned or unassigned
2. ✅ Maintenance assets can remain assigned to their user
3. ❌ Retired assets CANNOT be assigned
4. ❌ Lost assets CANNOT be assigned
5. ✅ Asset tags must be unique per organization

## Migration Steps

### 1. Run Migration Script

```bash
npm run migrate:status
```

This will:
- Convert `status: "assigned"` → `status: "active"`
- Convert `status: "available"` → `status: "active"`
- Remove duplicate asset tags (keeps most recent)
- Create unique index on `assetTag + organizationId`

### 2. Verify Changes

Check your database:

```javascript
// All assets should have valid status
db.assets.find({ status: { $nin: ['active', 'maintenance', 'retired', 'lost'] } })
// Should return 0 documents

// Check assignment logic
db.assets.find({ assignedTo: { $ne: null } }) // Assigned assets
db.assets.find({ assignedTo: null }) // Unassigned assets
```

### 3. Update Frontend Code

The UI now displays:
- **Status Column**: Shows lifecycle state (Active, Maintenance, Retired, Lost)
- **Assignment Column**: Shows assignment state (Employee Name or Unassigned)

## API Changes

### Before
```javascript
// ❌ Old way - mixing concerns
{
  status: "assigned",
  assignedTo: "userId"
}
```

### After
```javascript
// ✅ New way - separation of concerns
{
  status: "active",      // Lifecycle state
  assignedTo: "userId"   // Assignment state
}
```

### Assignment Validation

```javascript
// ❌ Will fail
PUT /api/assets/:id
{
  status: "retired",
  assignedTo: "userId"  // Error: Cannot assign retired assets
}

// ✅ Will succeed
PUT /api/assets/:id
{
  status: "active",
  assignedTo: "userId"
}
```

## Rollback (If Needed)

If you need to rollback, restore from backup:

```bash
mongorestore --db asset-management /path/to/backup
```

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify no assets have "assigned" or "available" status
- [ ] Test assigning active assets
- [ ] Test that retired/lost assets cannot be assigned
- [ ] Verify duplicate asset tags are removed
- [ ] Check UI displays Status and Assignment columns correctly
- [ ] Test unassigning assets (status remains unchanged)

## Support

For issues, contact the development team or create an issue in the repository.
