# Floor Plan Management - Organization-First Workflow

## Overview

The floor plan management system follows a **hierarchical, organization-first workflow** to ensure proper data isolation and multi-tenant architecture.

## Data Hierarchy

```
Organization
  └── Location (Building/Floor/Room)
      └── Floor Plan (Image-based layout)
          └── Desk (Individual workspaces)
              └── Asset Assignment
```

## Workflow Steps

### 1. Select Organization
**Why First:** All resources (locations, floor plans, desks, assets) are scoped to an organization for security and data isolation.

**UI Components:**
- Organization dropdown in main navigation
- Stored in app state/context
- Filters all subsequent API calls

### 2. Create/Manage Locations
**Prerequisites:** Organization selected

**Location Types:**
- `building` - Main office building
- `floor` - Specific floor within building
- `room` - Conference room, office, etc.
- `zone` - Open area, workspace zone
- `outdoor` - Parking lot, courtyard

**Files Involved:**
- `src/components/LocationList.tsx` - Location CRUD interface
- `src/app/api/locations/route.ts` - Location API endpoints
- `src/models/Location.ts` - Location schema

**What Happens:**
```typescript
POST /api/locations
{
  "name": "Building A - Floor 3",
  "type": "floor",
  "organizationId": "org123", // FROM STEP 1
  "parentId": "buildingA",     // Optional hierarchy
  "capacity": 50,
  "description": "Engineering department floor"
}
```

### 3. Upload Floor Plan Image
**Prerequisites:** Organization + Location selected

**UI Components:**
- `src/components/floorplan/FloorPlanUploader.tsx` - Image upload
- `src/components/floorplan/FloorPlanManager.tsx` - Floor plan creation dialog

**Files Involved:**
- Upload handled by FloorPlanUploader (converts to base64 or cloud URL)
- Image metadata captured: width, height, file size

**What Happens:**
```typescript
// User uploads PNG/JPG/SVG
// Component processes image:
const imageData = {
  url: "data:image/png;base64,..." or "https://cdn.../floorplan.png",
  imageWidth: 1920,
  imageHeight: 1080,
  fileType: "image/png",
  fileSize: 245000,
  originalFileName: "floor3-layout.png"
}
```

### 4. Create Floor Plan Record
**Prerequisites:** Organization + Location + Uploaded Image

**Files Involved:**
- `src/components/floorplan/FloorPlanManager.tsx` - Form submission
- `src/app/api/floorplans/route.ts` - POST endpoint
- `src/models/FloorPlan.ts` - Floor plan schema

**What Happens:**
```typescript
POST /api/floorplans
{
  "name": "Engineering Floor - West Wing",
  "locationId": "loc456",      // FROM STEP 2
  "organizationId": "org123",  // FROM STEP 1
  "imageUrl": "data:image/png;base64,...",
  "imageWidth": 1920,
  "imageHeight": 1080,
  "scale": 1.0,                // Pixels to meters ratio
  "metadata": {
    "uploadedBy": "user789",
    "fileType": "image/png",
    "fileSize": 245000,
    "originalFileName": "floor3-layout.png"
  }
}

// Database creates record with ID
// Returns: { _id: "fp123", ...floorPlanData }
```

### 5. Design Desk Layout
**Prerequisites:** Floor plan created (with ID)

**UI Components:**
- `src/components/floorplan/FloorPlanCanvas.tsx` - Interactive canvas
- `src/components/floorplan/DeskEditor.tsx` - Desk placement tool
- `src/app/floorplans/[id]/page.tsx` - Floor plan view/edit page

**Files Involved:**
- Canvas renders floor plan image as background
- Click to place desks at (x, y) coordinates
- Desks are positioned relative to image dimensions

**What Happens:**
```typescript
// User clicks on canvas at position (x: 450, y: 300)
POST /api/desks
{
  "floorPlanId": "fp123",      // FROM STEP 4
  "locationId": "loc456",      // FROM STEP 2
  "organizationId": "org123",  // FROM STEP 1
  "deskNumber": "D-301",
  "coordinates": {
    "x": 450,  // Pixel position on image
    "y": 300
  },
  "width": 60,   // Desk dimensions (configurable)
  "height": 120,
  "rotation": 0,
  "status": "available",
  "type": "standard"
}
```

### 6. Assign Desks to Employees
**Prerequisites:** Desks created

**Files Involved:**
- `src/app/api/desks/[id]/route.ts` - PATCH endpoint
- Desk assignment updates both Desk and User models

**What Happens:**
```typescript
PATCH /api/desks/desk789
{
  "assignedTo": "user456",
  "status": "occupied"
}

// Also creates audit log and notification
```

### 7. Assign Assets to Desks
**Prerequisites:** Desk assigned to employee

**Files Involved:**
- `src/app/api/assets/[id]/route.ts` - Asset assignment
- Assets get linked to both desk and user

**What Happens:**
```typescript
PATCH /api/assets/asset101
{
  "assignedTo": "user456",
  "deskId": "desk789",
  "locationId": "loc456",
  "status": "active"
}
```

## File Structure Reference

### Components Updated
```
src/components/
├── LocationList.tsx              # Step 2: Location management
├── floorplan/
│   ├── FloorPlanManager.tsx      # Step 3-4: Create floor plan
│   ├── FloorPlanUploader.tsx     # Step 3: Image upload
│   ├── FloorPlanCanvas.tsx       # Step 5: Interactive design
│   ├── FloorPlanEditor.tsx       # Step 5: Edit mode
│   └── DeskEditor.tsx            # Step 5: Desk placement
└── OrganizationList.tsx          # Step 1: Organization selection
```

### API Routes
```
src/app/api/
├── organizations/route.ts        # Step 1: List organizations
├── locations/
│   ├── route.ts                  # Step 2: CRUD locations
│   └── [id]/route.ts
├── floorplans/
│   ├── route.ts                  # Step 4: CRUD floor plans
│   └── [id]/route.ts
├── desks/
│   ├── route.ts                  # Step 5: CRUD desks
│   └── [id]/route.ts
└── assets/
    └── [id]/route.ts             # Step 7: Asset assignment
```

### Models (Database Schemas)
```
src/models/
├── Organization.ts               # Top-level tenant
├── Location.ts                   # Hierarchical locations
├── FloorPlan.ts                  # Image-based layouts
├── Desk.ts                       # Workspaces within floor plans
├── Asset.ts                      # Equipment/inventory
└── User.ts                       # Employees
```

## Security & Data Isolation

### Organization Scoping
All API queries automatically filter by organizationId:

```typescript
// GET /api/floorplans?organizationId=org123
const floorPlans = await FloorPlan.find({ 
  organizationId: req.organizationId // From auth middleware
});
```

### Validation Rules
1. **Organization must exist** before creating locations
2. **Location must belong to organization** before creating floor plans
3. **Floor plan must belong to organization** before adding desks
4. **Cross-organization references blocked** at database level

### Mongoose Indexes
```typescript
// FloorPlan.ts
FloorPlanSchema.index({ organizationId: 1, locationId: 1 });
FloorPlanSchema.index({ organizationId: 1, isActive: 1 });

// Desk.ts
DeskSchema.index({ organizationId: 1, floorPlanId: 1 });
DeskSchema.index({ organizationId: 1, assignedTo: 1 });
```

## State Management

### Organization Context
The selected organization should be stored in React Context and persisted to localStorage:

```typescript
// src/contexts/OrganizationContext.tsx
const OrganizationContext = createContext({
  selectedOrg: null,
  setSelectedOrg: (org) => {
    localStorage.setItem('selectedOrg', org._id);
    setOrg(org);
  }
});
```

### Navigation Flow
```
Main Dashboard
  ↓ (Select Organization)
Locations View
  ↓ (Create/Select Location)
Floor Plans View
  ↓ (Upload Image + Create)
Floor Plan Editor
  ↓ (Place Desks)
Desk Management
  ↓ (Assign Employees + Assets)
Complete Setup
```

## Common Issues & Solutions

### Issue: "Location not found"
**Cause:** Location belongs to different organization
**Solution:** Ensure `organizationId` matches in both location and floor plan

### Issue: "Coordinates out of bounds"
**Cause:** Desk coordinates exceed image dimensions
**Solution:** Validate `x < imageWidth` and `y < imageHeight`

### Issue: "Cannot delete floor plan with desks"
**Cause:** Foreign key constraint (desks reference floor plan)
**Solution:** Delete all desks first, or implement cascade delete

### Issue: "Image not displaying"
**Cause:** Invalid base64 or broken URL
**Solution:** Validate image data before saving to database

## Next Steps for Implementation

See [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) for user-facing instructions on using the floor plan features.
