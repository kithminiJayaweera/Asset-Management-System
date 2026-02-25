# Sample Data for Multi-Organization Asset Management System

## Organizations

```javascript
[
  {
    _id: ObjectId("org001"),
    name: "BotCalm",
    code: "BOTCALM",
    description: "AI and Automation Solutions Provider",
    address: "123 Tech Street, Colombo 03, Sri Lanka",
    contactEmail: "info@botcalm.com",
    contactPhone: "+94 11 234 5678",
    logo: "https://example.com/logos/botcalm.png",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("org002"),
    name: "Certix",
    code: "CERTIX",
    description: "Certification and Training Services",
    address: "456 Business Ave, Colombo 07, Sri Lanka",
    contactEmail: "contact@certix.lk",
    contactPhone: "+94 11 876 5432",
    logo: "https://example.com/logos/certix.png",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]
```

## Buildings

```javascript
[
  {
    _id: ObjectId("bld001"),
    organizationId: ObjectId("org001"),
    name: "Building 001",
    code: "BLD001",
    address: "123 Tech Street, Colombo 03",
    floors: 3,
    metadata: {
      totalArea: 5000,
      yearBuilt: 2020,
      facilities: ["Parking", "Cafeteria", "Gym"]
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("bld002"),
    organizationId: ObjectId("org001"),
    name: "Building SN",
    code: "BLDSN",
    address: "789 Innovation Road, Colombo 05",
    floors: 2,
    metadata: {
      totalArea: 3000,
      yearBuilt: 2022,
      facilities: ["Parking", "Server Room"]
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("bld003"),
    organizationId: ObjectId("org002"),
    name: "Building 002",
    code: "BLD002",
    address: "456 Business Ave, Colombo 07",
    floors: 4,
    metadata: {
      totalArea: 6000,
      yearBuilt: 2019,
      facilities: ["Parking", "Training Rooms", "Cafeteria"]
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]
```

## Floors

```javascript
[
  {
    _id: ObjectId("flr001"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    name: "Floor 1 - Incubation Area",
    code: "INCY",
    floorNumber: 1,
    floorPlanImage: "https://example.com/floorplans/bld001-floor1.png",
    floorPlanLayout: [
      {
        id: 1,
        icon: "🖥️",
        label: "Desk A1",
        x: 50,
        y: 60,
        w: 90,
        h: 60,
        rotation: 0,
        color: "#1a2f50",
        opacity: 1,
        assetId: ObjectId("ast001"),
        roomId: ObjectId("rm001")
      },
      {
        id: 2,
        icon: "🪑",
        label: "Chair A1",
        x: 66,
        y: 128,
        w: 38,
        h: 38,
        rotation: 0,
        color: "#1a301a",
        opacity: 1,
        assetId: ObjectId("ast002"),
        roomId: ObjectId("rm001")
      }
    ],
    metadata: {
      area: 1500,
      capacity: 50
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: ObjectId("flr002"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    name: "Floor 2 - Operations",
    code: "OPS",
    floorNumber: 2,
    floorPlanImage: "https://example.com/floorplans/bld001-floor2.png",
    floorPlanLayout: [],
    metadata: {
      area: 1500,
      capacity: 60
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]
```

## Rooms

```javascript
[
  {
    _id: ObjectId("rm001"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr001"),
    name: "Development Lab A",
    code: "DEV-A",
    roomType: "office",
    capacity: 20,
    area: 400,
    position: {
      x: 50,
      y: 50,
      width: 300,
      height: 200
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("rm002"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr001"),
    name: "Conference Room Alpha",
    code: "CONF-A",
    roomType: "meeting",
    capacity: 12,
    area: 200,
    position: {
      x: 400,
      y: 50,
      width: 250,
      height: 180
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("rm003"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr002"),
    name: "Server Room 01",
    code: "SRV-01",
    roomType: "server",
    capacity: 5,
    area: 150,
    position: {
      x: 50,
      y: 50,
      width: 200,
      height: 150
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]
```

## Assets

```javascript
[
  {
    _id: ObjectId("ast001"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr001"),
    roomId: ObjectId("rm001"),
    
    assetTag: "AST-001",
    name: "Dell Laptop XPS 15",
    category: "Computer",
    description: "High-performance laptop for development",
    serialNumber: "DL-XPS15-2024-001",
    model: "XPS 15 9530",
    manufacturer: "Dell",
    
    status: "active",
    condition: "excellent",
    
    purchaseDate: "2024-01-15T00:00:00Z",
    purchasePrice: 250000,
    currentValue: 225000,
    depreciationRate: 20,
    warrantyExpiry: "2027-01-15T00:00:00Z",
    
    floorPosition: {
      x: 50,
      y: 60,
      rotation: 0,
      icon: "🖥️",
      color: "#1a2f50"
    },
    
    assignedTo: ObjectId("usr001"),
    assignedDate: "2024-01-20T00:00:00Z",
    
    lastMaintenanceDate: null,
    nextMaintenanceDate: "2024-07-15T00:00:00Z",
    maintenanceSchedule: "quarterly",
    
    metadata: {
      specs: {
        processor: "Intel Core i7-13700H",
        ram: "32GB DDR5",
        storage: "1TB NVMe SSD",
        display: "15.6\" 4K OLED"
      }
    },
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    _id: ObjectId("ast002"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr001"),
    roomId: ObjectId("rm001"),
    
    assetTag: "AST-002",
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    description: "Ergonomic office chair",
    serialNumber: "HM-AERON-2024-001",
    model: "Aeron Remastered",
    manufacturer: "Herman Miller",
    
    status: "active",
    condition: "good",
    
    purchaseDate: "2024-01-10T00:00:00Z",
    purchasePrice: 85000,
    currentValue: 80000,
    depreciationRate: 10,
    warrantyExpiry: "2036-01-10T00:00:00Z",
    
    floorPosition: {
      x: 66,
      y: 128,
      rotation: 0,
      icon: "🪑",
      color: "#1a301a"
    },
    
    assignedTo: ObjectId("usr001"),
    assignedDate: "2024-01-20T00:00:00Z",
    
    lastMaintenanceDate: null,
    nextMaintenanceDate: "2024-12-10T00:00:00Z",
    maintenanceSchedule: "yearly",
    
    metadata: {
      size: "B",
      color: "Graphite"
    },
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    _id: ObjectId("ast003"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr002"),
    roomId: ObjectId("rm003"),
    
    assetTag: "AST-003",
    name: "Dell PowerEdge R750",
    category: "Server",
    description: "Production server for web applications",
    serialNumber: "DL-R750-2024-001",
    model: "PowerEdge R750",
    manufacturer: "Dell",
    
    status: "maintenance",
    condition: "good",
    
    purchaseDate: "2023-06-01T00:00:00Z",
    purchasePrice: 850000,
    currentValue: 680000,
    depreciationRate: 20,
    warrantyExpiry: "2026-06-01T00:00:00Z",
    
    floorPosition: {
      x: 100,
      y: 80,
      rotation: 0,
      icon: "🔌",
      color: "#2a2a2a"
    },
    
    assignedTo: null,
    assignedDate: null,
    
    lastMaintenanceDate: "2024-01-10T00:00:00Z",
    nextMaintenanceDate: "2024-04-10T00:00:00Z",
    maintenanceSchedule: "quarterly",
    
    metadata: {
      specs: {
        processor: "2x Intel Xeon Gold 6338",
        ram: "256GB DDR4",
        storage: "4x 2TB NVMe SSD",
        network: "4x 10GbE"
      }
    },
    isActive: true,
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  },
  {
    _id: ObjectId("ast004"),
    organizationId: ObjectId("org001"),
    buildingId: ObjectId("bld001"),
    floorId: ObjectId("flr001"),
    roomId: ObjectId("rm002"),
    
    assetTag: "AST-004",
    name: "Samsung 65\" 4K Display",
    category: "Display",
    description: "Conference room display",
    serialNumber: "SM-65-2024-001",
    model: "QN65Q80C",
    manufacturer: "Samsung",
    
    status: "active",
    condition: "excellent",
    
    purchaseDate: "2024-01-05T00:00:00Z",
    purchasePrice: 180000,
    currentValue: 170000,
    depreciationRate: 15,
    warrantyExpiry: "2027-01-05T00:00:00Z",
    
    floorPosition: {
      x: 450,
      y: 80,
      rotation: 0,
      icon: "📺",
      color: "#0f1a2a"
    },
    
    assignedTo: null,
    assignedDate: null,
    
    lastMaintenanceDate: null,
    nextMaintenanceDate: "2024-07-05T00:00:00Z",
    maintenanceSchedule: "yearly",
    
    metadata: {
      resolution: "3840x2160",
      mountType: "wall"
    },
    isActive: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z"
  }
]
```

## Maintenance Records

```javascript
[
  {
    _id: ObjectId("mnt001"),
    assetId: ObjectId("ast003"),
    organizationId: ObjectId("org001"),
    
    type: "preventive",
    status: "in-progress",
    
    scheduledDate: "2024-01-25T09:00:00Z",
    startDate: "2024-01-25T09:15:00Z",
    completedDate: null,
    
    description: "Quarterly server maintenance - firmware updates, disk checks, cooling system inspection",
    technician: "John Silva",
    cost: 15000,
    
    notes: "Started maintenance. Firmware update in progress.",
    attachments: [],
    
    previousAssetStatus: "active",
    
    createdBy: ObjectId("usr002"),
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-25T09:15:00Z"
  },
  {
    _id: ObjectId("mnt002"),
    assetId: ObjectId("ast001"),
    organizationId: ObjectId("org001"),
    
    type: "corrective",
    status: "completed",
    
    scheduledDate: "2024-01-10T14:00:00Z",
    startDate: "2024-01-10T14:05:00Z",
    completedDate: "2024-01-10T15:30:00Z",
    
    description: "Battery replacement and thermal paste reapplication",
    technician: "Sarah Fernando",
    cost: 25000,
    
    notes: "Battery replaced successfully. Thermal paste reapplied. System running optimally.",
    attachments: [
      "https://example.com/maintenance/mnt002-before.jpg",
      "https://example.com/maintenance/mnt002-after.jpg"
    ],
    
    previousAssetStatus: "active",
    
    createdBy: ObjectId("usr001"),
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-10T15:30:00Z"
  }
]
```

## Users

```javascript
[
  {
    _id: ObjectId("usr001"),
    organizationId: ObjectId("org001"),
    name: "Kamal Perera",
    email: "kamal@botcalm.com",
    password: "$2a$10$...", // hashed
    role: "employee",
    
    permissions: {
      buildings: [ObjectId("bld001")],
      floors: [ObjectId("flr001")],
      canManageAssets: false,
      canManageMaintenance: false,
      canViewReports: true
    },
    
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("usr002"),
    organizationId: ObjectId("org001"),
    name: "Nimal Silva",
    email: "nimal@botcalm.com",
    password: "$2a$10$...", // hashed
    role: "org_admin",
    
    permissions: {
      buildings: [ObjectId("bld001"), ObjectId("bld002")],
      floors: [],
      canManageAssets: true,
      canManageMaintenance: true,
      canViewReports: true
    },
    
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    _id: ObjectId("usr003"),
    organizationId: null,
    name: "Admin User",
    email: "admin@system.com",
    password: "$2a$10$...", // hashed
    role: "super_admin",
    
    permissions: {
      buildings: [],
      floors: [],
      canManageAssets: true,
      canManageMaintenance: true,
      canViewReports: true
    },
    
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]
```

## Audit Logs

```javascript
[
  {
    _id: ObjectId("aud001"),
    organizationId: ObjectId("org001"),
    userId: ObjectId("usr002"),
    action: "status_change",
    entityType: "asset",
    entityId: ObjectId("ast003"),
    changes: {
      before: { status: "active" },
      after: { status: "maintenance" }
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    createdAt: "2024-01-25T09:15:00Z"
  },
  {
    _id: ObjectId("aud002"),
    organizationId: ObjectId("org001"),
    userId: ObjectId("usr002"),
    action: "create",
    entityType: "maintenance",
    entityId: ObjectId("mnt001"),
    changes: {
      before: null,
      after: {
        assetId: ObjectId("ast003"),
        type: "preventive",
        status: "scheduled"
      }
    },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    createdAt: "2024-01-20T00:00:00Z"
  }
]
```

## MongoDB Indexes

```javascript
// Organizations
db.organizations.createIndex({ code: 1 }, { unique: true });
db.organizations.createIndex({ isActive: 1 });

// Buildings
db.buildings.createIndex({ organizationId: 1 });
db.buildings.createIndex({ code: 1 }, { unique: true });
db.buildings.createIndex({ isActive: 1 });

// Floors
db.floors.createIndex({ organizationId: 1 });
db.floors.createIndex({ buildingId: 1 });
db.floors.createIndex({ code: 1 });
db.floors.createIndex({ isActive: 1 });

// Rooms
db.rooms.createIndex({ organizationId: 1 });
db.rooms.createIndex({ buildingId: 1 });
db.rooms.createIndex({ floorId: 1 });
db.rooms.createIndex({ code: 1 });
db.rooms.createIndex({ isActive: 1 });

// Assets
db.assets.createIndex({ organizationId: 1 });
db.assets.createIndex({ buildingId: 1 });
db.assets.createIndex({ floorId: 1 });
db.assets.createIndex({ roomId: 1 });
db.assets.createIndex({ assetTag: 1 }, { unique: true });
db.assets.createIndex({ status: 1 });
db.assets.createIndex({ assignedTo: 1 });
db.assets.createIndex({ isActive: 1 });
db.assets.createIndex({ nextMaintenanceDate: 1 });

// Maintenance
db.maintenance.createIndex({ assetId: 1 });
db.maintenance.createIndex({ organizationId: 1 });
db.maintenance.createIndex({ status: 1 });
db.maintenance.createIndex({ scheduledDate: 1 });

// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ organizationId: 1 });
db.users.createIndex({ isActive: 1 });

// Audit Logs
db.auditLogs.createIndex({ organizationId: 1 });
db.auditLogs.createIndex({ userId: 1 });
db.auditLogs.createIndex({ entityType: 1, entityId: 1 });
db.auditLogs.createIndex({ createdAt: -1 });
```
