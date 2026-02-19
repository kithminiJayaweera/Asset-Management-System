# Location System Setup Instructions

## ✅ Completed Steps

1. ✅ Created 3 database models (Location, FloorPlan, AssetLocationHistory)
2. ✅ Created 4 API endpoints (/api/locations, /api/locations/[id], /api/locations/tree, /api/floorplans)
3. ✅ Updated Asset model with locationId field
4. ✅ Added location history tracking to Asset API
5. ✅ Created LocationManager component
6. ✅ Created FloorPlanViewer component
7. ✅ Integrated into main navigation

## 🚀 Action Required: Install Dependencies

Run this command in your terminal:

```bash
npm install react-konva konva @types/react-konva
```

## 📝 What to Do Next

### 1. Test the Basic Setup

After installing dependencies, restart your dev server:
```bash
npm run dev
```

Navigate to the "Locations" menu item in your app sidebar.

### 2. Create Your First Location Hierarchy

Use Postman or the API to create locations:

**Example: Create Office**
```http
POST http://localhost:3000/api/locations
Content-Type: application/json

{
  "name": "Main Office",
  "type": "office",
  "code": "OFF-001",
  "parentId": null,
  "organizationId": "678816d3bf3a9d33c8a6f2b1"
}
```

**Example: Create Building**
```http
POST http://localhost:3000/api/locations
Content-Type: application/json

{
  "name": "Building A",
  "type": "building",
  "code": "BLD-A",
  "parentId": "<office_id_from_above>",
  "organizationId": "678816d3bf3a9d33c8a6f2b1"
}
```

**Example: Create Floor**
```http
POST http://localhost:3000/api/locations
Content-Type: application/json

{
  "name": "Floor 1",
  "type": "floor",
  "code": "FLR-1",
  "parentId": "<building_id_from_above>",
  "organizationId": "678816d3bf3a9d33c8a6f2b1"
}
```

**Example: Create Desk with Coordinates**
```http
POST http://localhost:3000/api/locations
Content-Type: application/json

{
  "name": "Desk 101",
  "type": "desk",
  "code": "DSK-101",
  "parentId": "<floor_id_from_above>",
  "organizationId": "678816d3bf3a9d33c8a6f2b1",
  "x": 0.25,
  "y": 0.30,
  "width": 0.05,
  "height": 0.08
}
```

### 3. View the Hierarchy

Visit the Locations page in your app - you should see the tree structure!

Or use the API:
```http
GET http://localhost:3000/api/locations/tree?organizationId=678816d3bf3a9d33c8a6f2b1
```

### 4. Assign Asset to Location

Update an existing asset:
```http
PUT http://localhost:3000/api/assets/<asset_id>
Content-Type: application/json

{
  "locationId": "<desk_id>"
}
```

This will automatically create a location history record!

### 5. View Location History

Check the database collection `assetlocationhistories` to see the movement tracking.

## 🎨 Next Phase: Interactive Floor Plans

Once basic setup is working, we can add:
- Floor plan image upload
- Interactive canvas with react-konva
- Drag-and-drop desk placement
- Real-time occupancy visualization

## 📚 Reference

- Full documentation: `LOCATION_SYSTEM.md`
- API examples in Postman collection (create one if needed)

## ❓ Troubleshooting

**Issue**: "Cannot find module 'react-konva'"
**Solution**: Make sure you ran `npm install react-konva konva @types/react-konva`

**Issue**: Locations not showing in tree
**Solution**: Check that organizationId matches your actual organization ID in the database

**Issue**: Location history not created
**Solution**: Verify the Asset API update includes locationId in the request body

## ✨ What You Have Now

- ✅ Complete hierarchical location system
- ✅ Database models with proper relationships
- ✅ RESTful APIs for all operations
- ✅ Tree view UI component
- ✅ Automatic movement tracking
- ✅ Integration with existing asset system
- ✅ Foundation for floor plan visualization

Ready for enterprise deployment! 🚀
