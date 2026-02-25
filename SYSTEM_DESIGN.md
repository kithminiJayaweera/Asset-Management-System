# Multi-Organization Asset Management & Floor Mapping System

## 📊 Database Schema Design

### 1. Organizations Collection
```javascript
{
  _id: ObjectId,
  name: String,              // "BotCalm", "Certix"
  code: String,              // "BOTCALM", "CERTIX"
  description: String,
  address: String,
  contactEmail: String,
  contactPhone: String,
  logo: String,              // URL
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Buildings Collection
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // ref: Organizations
  name: String,              // "Building 001", "Building SN"
  code: String,              // "BLD001", "BLDSN"
  address: String,
  floors: Number,            // Total floors count
  metadata: {
    totalArea: Number,
    yearBuilt: Number,
    facilities: [String]
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Floors Collection
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // ref: Organizations
  buildingId: ObjectId,      // ref: Buildings
  name: String,              // "Floor 1 - Incubation Area"
  code: String,              // "INCY", "OPS"
  floorNumber: Number,       // 1, 2, 3
  floorPlanImage: String,    // URL to uploaded image
  floorPlanLayout: [{        // Saved floor planner data
    id: Number,
    icon: String,
    label: String,
    x: Number,
    y: Number,
    w: Number,
    h: Number,
    rotation: Number,
    color: String,
    opacity: Number,
    assetId: ObjectId,       // Link to actual asset
    roomId: ObjectId         // Link to room
  }],
  metadata: {
    area: Number,
    capacity: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Rooms Collection
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // ref: Organizations
  buildingId: ObjectId,      // ref: Buildings
  floorId: ObjectId,         // ref: Floors
  name: String,              // "Conference Room A", "Server Room"
  code: String,              // "CONF-A", "SRV-01"
  roomType: String,          // "office", "meeting", "server", "storage"
  capacity: Number,
  area: Number,
  position: {                // Position on floor plan
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Assets Collection (Enhanced)
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // ref: Organizations
  buildingId: ObjectId,      // ref: Buildings
  floorId: ObjectId,         // ref: Floors
  roomId: ObjectId,          // ref: Rooms
  
  // Asset Details
  assetTag: String,          // "AST-001", unique
  name: String,              // "Dell Laptop XPS 15"
  category: String,          // "Computer", "Furniture", "Equipment"
  description: String,
  serialNumber: String,
  model: String,
  manufacturer: String,
  
  // Status
  status: String,            // "active", "maintenance", "retired", "lost"
  condition: String,         // "excellent", "good", "fair", "poor"
  
  // Financial
  purchaseDate: Date,
  purchasePrice: Number,
  currentValue: Number,
  depreciationRate: Number,
  warrantyExpiry: Date,
  
  // Location on Floor Plan
  floorPosition: {
    x: Number,
    y: Number,
    rotation: Number,
    icon: String,
    color: String
  },
  
  // Assignment
  assignedTo: ObjectId,      // ref: Users
  assignedDate: Date,
  
  // Maintenance
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  maintenanceSchedule: String, // "monthly", "quarterly", "yearly"
  
  metadata: Object,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Maintenance Records Collection
```javascript
{
  _id: ObjectId,
  assetId: ObjectId,         // ref: Assets
  organizationId: ObjectId,
  
  type: String,              // "preventive", "corrective", "emergency"
  status: String,            // "scheduled", "in-progress", "completed", "cancelled"
  
  scheduledDate: Date,
  startDate: Date,
  completedDate: Date,
  
  description: String,
  technician: String,
  cost: Number,
  
  notes: String,
  attachments: [String],     // URLs
  
  // Status tracking
  previousAssetStatus: String, // Store original status
  
  createdBy: ObjectId,       // ref: Users
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Users Collection (Enhanced)
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,  // ref: Organizations
  name: String,
  email: String,
  password: String,          // hashed
  role: String,              // "super_admin", "org_admin", "manager", "employee"
  
  // Access Control
  permissions: {
    buildings: [ObjectId],   // Can access these buildings
    floors: [ObjectId],      // Can access these floors
    canManageAssets: Boolean,
    canManageMaintenance: Boolean,
    canViewReports: Boolean
  },
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Audit Logs Collection
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,
  userId: ObjectId,
  action: String,            // "create", "update", "delete", "status_change"
  entityType: String,        // "asset", "building", "floor", "room"
  entityId: ObjectId,
  changes: Object,           // Before/after values
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

## 🏗️ ER Diagram Structure

```
Organizations (1) ──────< (M) Buildings
                │
                └──────< (M) Users
                │
                └──────< (M) Assets

Buildings (1) ──────< (M) Floors
         │
         └──────< (M) Rooms
         │
         └──────< (M) Assets

Floors (1) ──────< (M) Rooms
      │
      └──────< (M) Assets

Rooms (1) ──────< (M) Assets

Assets (1) ──────< (M) Maintenance Records
      │
      └──────< (1) Users (assignedTo)

Users (1) ──────< (M) Audit Logs
```

## 📁 Backend Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── organizations/
│   │   │   ├── route.ts                    # GET, POST /api/organizations
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/organizations/:id
│   │   │       ├── buildings/
│   │   │       │   └── route.ts            # GET /api/organizations/:id/buildings
│   │   │       ├── assets/
│   │   │       │   └── route.ts            # GET /api/organizations/:id/assets
│   │   │       └── stats/
│   │   │           └── route.ts            # GET /api/organizations/:id/stats
│   │   │
│   │   ├── buildings/
│   │   │   ├── route.ts                    # GET, POST /api/buildings
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/buildings/:id
│   │   │       ├── floors/
│   │   │       │   └── route.ts            # GET /api/buildings/:id/floors
│   │   │       └── assets/
│   │   │           └── route.ts            # GET /api/buildings/:id/assets
│   │   │
│   │   ├── floors/
│   │   │   ├── route.ts                    # GET, POST /api/floors
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/floors/:id
│   │   │       ├── layout/
│   │   │       │   └── route.ts            # GET, PUT /api/floors/:id/layout
│   │   │       ├── rooms/
│   │   │       │   └── route.ts            # GET /api/floors/:id/rooms
│   │   │       ├── assets/
│   │   │       │   └── route.ts            # GET /api/floors/:id/assets
│   │   │       └── upload-plan/
│   │   │           └── route.ts            # POST /api/floors/:id/upload-plan
│   │   │
│   │   ├── rooms/
│   │   │   ├── route.ts                    # GET, POST /api/rooms
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/rooms/:id
│   │   │       └── assets/
│   │   │           └── route.ts            # GET /api/rooms/:id/assets
│   │   │
│   │   ├── assets/
│   │   │   ├── route.ts                    # GET, POST /api/assets
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/assets/:id
│   │   │       ├── status/
│   │   │       │   └── route.ts            # PUT /api/assets/:id/status
│   │   │       ├── maintenance/
│   │   │       │   └── route.ts            # POST /api/assets/:id/maintenance
│   │   │       ├── position/
│   │   │       │   └── route.ts            # PUT /api/assets/:id/position
│   │   │       └── assign/
│   │   │           └── route.ts            # PUT /api/assets/:id/assign
│   │   │
│   │   ├── maintenance/
│   │   │   ├── route.ts                    # GET, POST /api/maintenance
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE /api/maintenance/:id
│   │   │       ├── complete/
│   │   │       │   └── route.ts            # PUT /api/maintenance/:id/complete
│   │   │       └── cancel/
│   │   │           └── route.ts            # PUT /api/maintenance/:id/cancel
│   │   │
│   │   └── reports/
│   │       ├── assets-by-status/
│   │       │   └── route.ts                # GET /api/reports/assets-by-status
│   │       ├── maintenance-schedule/
│   │       │   └── route.ts                # GET /api/reports/maintenance-schedule
│   │       └── asset-utilization/
│   │           └── route.ts                # GET /api/reports/asset-utilization
│   │
│   ├── (admin)/
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── buildings/
│   │   │   └── page.tsx
│   │   ├── floors/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── planner/
│   │   │           └── page.tsx            # Floor planner interface
│   │   ├── rooms/
│   │   │   └── page.tsx
│   │   ├── assets/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── maintenance/
│   │       └── page.tsx
│   │
│   └── layout.tsx
│
├── models/
│   ├── Organization.ts
│   ├── Building.ts
│   ├── Floor.ts
│   ├── Room.ts
│   ├── Asset.ts
│   ├── Maintenance.ts
│   ├── User.ts
│   └── AuditLog.ts
│
├── lib/
│   ├── mongodb.ts
│   ├── utils.ts
│   └── validators.ts
│
├── services/
│   ├── organizationService.ts
│   ├── buildingService.ts
│   ├── floorService.ts
│   ├── roomService.ts
│   ├── assetService.ts
│   ├── maintenanceService.ts
│   └── auditService.ts
│
├── components/
│   ├── organizations/
│   │   ├── OrganizationList.tsx
│   │   ├── OrganizationForm.tsx
│   │   └── OrganizationCard.tsx
│   ├── buildings/
│   │   ├── BuildingList.tsx
│   │   ├── BuildingForm.tsx
│   │   └── BuildingCard.tsx
│   ├── floors/
│   │   ├── FloorList.tsx
│   │   ├── FloorForm.tsx
│   │   ├── FloorPlanner.tsx              # Interactive floor planner
│   │   └── FloorPlanUpload.tsx
│   ├── rooms/
│   │   ├── RoomList.tsx
│   │   ├── RoomForm.tsx
│   │   └── RoomCard.tsx
│   ├── assets/
│   │   ├── AssetList.tsx
│   │   ├── AssetForm.tsx
│   │   ├── AssetCard.tsx
│   │   ├── AssetStatusBadge.tsx
│   │   └── AssetPositionEditor.tsx
│   ├── maintenance/
│   │   ├── MaintenanceList.tsx
│   │   ├── MaintenanceForm.tsx
│   │   └── MaintenanceSchedule.tsx
│   └── shared/
│       ├── HierarchyBreadcrumb.tsx
│       ├── LocationSelector.tsx
│       └── StatusFilter.tsx
│
├── hooks/
│   ├── useOrganizations.ts
│   ├── useBuildings.ts
│   ├── useFloors.ts
│   ├── useRooms.ts
│   ├── useAssets.ts
│   └── useMaintenance.ts
│
├── types/
│   └── index.ts
│
└── middleware.ts
```

## 🔌 API Endpoint Design

### Organizations
```
GET    /api/organizations                    # List all organizations
POST   /api/organizations                    # Create organization
GET    /api/organizations/:id                # Get organization details
PUT    /api/organizations/:id                # Update organization
DELETE /api/organizations/:id                # Delete organization
GET    /api/organizations/:id/buildings      # Get all buildings
GET    /api/organizations/:id/assets         # Get all assets
GET    /api/organizations/:id/stats          # Get statistics
```

### Buildings
```
GET    /api/buildings                        # List buildings (filter by org)
POST   /api/buildings                        # Create building
GET    /api/buildings/:id                    # Get building details
PUT    /api/buildings/:id                    # Update building
DELETE /api/buildings/:id                    # Delete building
GET    /api/buildings/:id/floors             # Get all floors
GET    /api/buildings/:id/assets             # Get all assets
```

### Floors
```
GET    /api/floors                           # List floors (filter by building)
POST   /api/floors                           # Create floor
GET    /api/floors/:id                       # Get floor details
PUT    /api/floors/:id                       # Update floor
DELETE /api/floors/:id                       # Delete floor
GET    /api/floors/:id/layout                # Get floor plan layout
PUT    /api/floors/:id/layout                # Save floor plan layout
POST   /api/floors/:id/upload-plan           # Upload floor plan image
GET    /api/floors/:id/rooms                 # Get all rooms
GET    /api/floors/:id/assets                # Get all assets with positions
```

### Rooms
```
GET    /api/rooms                            # List rooms (filter by floor)
POST   /api/rooms                            # Create room
GET    /api/rooms/:id                        # Get room details
PUT    /api/rooms/:id                        # Update room
DELETE /api/rooms/:id                        # Delete room
GET    /api/rooms/:id/assets                 # Get all assets in room
```

### Assets
```
GET    /api/assets                           # List assets (with filters)
POST   /api/assets                           # Create asset
GET    /api/assets/:id                       # Get asset details
PUT    /api/assets/:id                       # Update asset
DELETE /api/assets/:id                       # Delete asset
PUT    /api/assets/:id/status                # Change status
PUT    /api/assets/:id/position              # Update floor position
PUT    /api/assets/:id/assign                # Assign to user
POST   /api/assets/:id/maintenance           # Send to maintenance
```

### Maintenance
```
GET    /api/maintenance                      # List maintenance records
POST   /api/maintenance                      # Create maintenance record
GET    /api/maintenance/:id                  # Get maintenance details
PUT    /api/maintenance/:id                  # Update maintenance
DELETE /api/maintenance/:id                  # Delete maintenance
PUT    /api/maintenance/:id/complete         # Complete maintenance
PUT    /api/maintenance/:id/cancel           # Cancel maintenance
```

### Reports
```
GET    /api/reports/assets-by-status         # Assets grouped by status
GET    /api/reports/maintenance-schedule     # Upcoming maintenance
GET    /api/reports/asset-utilization        # Asset utilization report
GET    /api/reports/hierarchy                # Full hierarchy tree
```

## 📝 Sample Data

See SAMPLE_DATA.md for complete examples.

## 🔐 Security & Best Practices

1. **Authentication**: JWT-based auth with role-based access
2. **Authorization**: Check organizationId in all queries
3. **Validation**: Zod schemas for all inputs
4. **Audit Trail**: Log all changes to AuditLog
5. **Soft Delete**: Use isActive flag instead of hard delete
6. **Indexes**: Add indexes on organizationId, buildingId, floorId, roomId
7. **Pagination**: Implement cursor-based pagination
8. **Caching**: Redis for frequently accessed data
9. **File Upload**: Use AWS S3 or Cloudinary for images
10. **Error Handling**: Consistent error responses

## 🚀 Implementation Priority

1. ✅ Organizations CRUD
2. ✅ Buildings CRUD
3. ✅ Floors CRUD + Image Upload
4. ✅ Rooms CRUD
5. ✅ Assets CRUD with Hierarchy
6. ✅ Floor Planner Integration
7. ✅ Asset Position Tracking
8. ✅ Maintenance System
9. ✅ Status Management
10. ✅ Reports & Analytics
