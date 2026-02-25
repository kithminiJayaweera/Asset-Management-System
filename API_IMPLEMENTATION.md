# API Implementation Guide

## Quick Start Implementation

### 1. Buildings API

#### Create Building
```typescript
// src/app/api/buildings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Building from '@/models/Building';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const building = await Building.create(body);
    return NextResponse.json({ success: true, data: building }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    
    const query = organizationId ? { organizationId, isActive: true } : { isActive: true };
    const buildings = await Building.find(query).populate('organizationId', 'name code').sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: buildings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

#### Get Building with Floors
```typescript
// src/app/api/buildings/[id]/floors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const floors = await Location.find({
      buildingId: id,
      type: 'floor',
      isActive: true
    }).sort({ floorNumber: 1 });
    
    return NextResponse.json({ success: true, data: floors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 2. Floors API with Floor Planner

#### Upload Floor Plan Image
```typescript
// src/app/api/floors/[id]/upload-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { imageUrl } = await req.json();
    
    const floor = await Location.findByIdAndUpdate(
      id,
      { floorPlanImage: imageUrl },
      { new: true }
    );
    
    if (!floor) {
      return NextResponse.json({ success: false, error: 'Floor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: floor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

#### Save Floor Plan Layout
```typescript
// src/app/api/floors/[id]/layout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';
import Asset from '@/models/Asset';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const floor = await Location.findById(id);
    
    if (!floor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ layout: floor.floorPlanLayout || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load layout' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { layout } = await req.json();
    
    // Update floor layout
    const floor = await Location.findByIdAndUpdate(
      id,
      { floorPlanLayout: layout },
      { new: true }
    );
    
    if (!floor) {
      return NextResponse.json({ error: 'Floor not found' }, { status: 404 });
    }
    
    // Update asset positions
    for (const item of layout) {
      if (item.assetId) {
        await Asset.findByIdAndUpdate(item.assetId, {
          floorPosition: {
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            icon: item.icon,
            color: item.color
          }
        });
      }
    }
    
    return NextResponse.json({ success: true, layout: floor.floorPlanLayout });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 });
  }
}
```

### 3. Rooms API

```typescript
// src/app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const room = await Location.create({
      ...body,
      type: 'room'
    });
    
    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const floorId = searchParams.get('floorId');
    
    const query: any = { type: 'room', isActive: true };
    if (floorId) query.floorId = floorId;
    
    const rooms = await Location.find(query).sort({ name: 1 });
    
    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 4. Assets API with Hierarchy

#### Create Asset with Full Hierarchy
```typescript
// src/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate hierarchy
    if (!body.organizationId) {
      return NextResponse.json({ error: 'Organization is required' }, { status: 400 });
    }
    
    const asset = await Asset.create(body);
    
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    
    const query: any = {};
    
    // Hierarchy filters
    if (searchParams.get('organizationId')) query.organizationId = searchParams.get('organizationId');
    if (searchParams.get('buildingId')) query.buildingId = searchParams.get('buildingId');
    if (searchParams.get('floorId')) query.floorId = searchParams.get('floorId');
    if (searchParams.get('roomId')) query.roomId = searchParams.get('roomId');
    
    // Status filter
    if (searchParams.get('status')) query.status = searchParams.get('status');
    
    const assets = await Asset.find(query)
      .populate('organizationId', 'name code')
      .populate('buildingId', 'name code')
      .populate('floorId', 'name code')
      .populate('roomId', 'name code')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

#### Change Asset Status (Maintenance Logic)
```typescript
// src/app/api/assets/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import AuditLog from '@/models/AuditLog';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status, userId } = await req.json();
    
    const asset = await Asset.findById(id);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Validation: Only active assets can go to maintenance
    if (status === 'maintenance' && asset.status !== 'active') {
      return NextResponse.json({ 
        error: 'Only active assets can be sent to maintenance' 
      }, { status: 400 });
    }
    
    const previousStatus = asset.status;
    asset.status = status;
    
    // If returning from maintenance, set back to active
    if (previousStatus === 'maintenance' && status === 'active') {
      asset.lastMaintenanceDate = new Date();
    }
    
    await asset.save();
    
    // Create audit log
    await AuditLog.create({
      organizationId: asset.organizationId,
      userId,
      action: 'status_change',
      entityType: 'asset',
      entityId: asset._id,
      changes: {
        before: { status: previousStatus },
        after: { status }
      }
    });
    
    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 5. Maintenance API

```typescript
// src/app/api/maintenance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Get asset and validate
    const asset = await Asset.findById(body.assetId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    if (asset.status !== 'active') {
      return NextResponse.json({ 
        error: 'Only active assets can be sent to maintenance' 
      }, { status: 400 });
    }
    
    // Create maintenance record
    const maintenance = await Maintenance.create({
      ...body,
      previousAssetStatus: asset.status,
      organizationId: asset.organizationId
    });
    
    // Update asset status
    asset.status = 'maintenance';
    await asset.save();
    
    return NextResponse.json({ success: true, data: maintenance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
```

#### Complete Maintenance
```typescript
// src/app/api/maintenance/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Maintenance from '@/models/Maintenance';
import Asset from '@/models/Asset';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { notes, cost } = await req.json();
    
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }
    
    // Update maintenance record
    maintenance.status = 'completed';
    maintenance.completedDate = new Date();
    if (notes) maintenance.notes = notes;
    if (cost) maintenance.cost = cost;
    await maintenance.save();
    
    // Restore asset to active status
    const asset = await Asset.findById(maintenance.assetId);
    if (asset) {
      asset.status = 'active';
      asset.lastMaintenanceDate = new Date();
      await asset.save();
    }
    
    return NextResponse.json({ success: true, data: maintenance });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 6. Reports API

```typescript
// src/app/api/reports/hierarchy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import Building from '@/models/Building';
import Location from '@/models/Location';
import Asset from '@/models/Asset';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    // Get full hierarchy
    const organization = await Organization.findById(organizationId);
    const buildings = await Building.find({ organizationId, isActive: true });
    
    const hierarchy = await Promise.all(
      buildings.map(async (building) => {
        const floors = await Location.find({ 
          buildingId: building._id, 
          type: 'floor',
          isActive: true 
        }).sort({ floorNumber: 1 });
        
        const floorsWithRooms = await Promise.all(
          floors.map(async (floor) => {
            const rooms = await Location.find({ 
              floorId: floor._id, 
              type: 'room',
              isActive: true 
            });
            
            const roomsWithAssets = await Promise.all(
              rooms.map(async (room) => {
                const assets = await Asset.find({ roomId: room._id });
                return { ...room.toObject(), assets };
              })
            );
            
            return { ...floor.toObject(), rooms: roomsWithAssets };
          })
        );
        
        return { ...building.toObject(), floors: floorsWithRooms };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      data: {
        organization,
        buildings: hierarchy
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## Frontend Components

### Hierarchy Selector Component
```typescript
// src/components/shared/HierarchySelector.tsx
'use client';

import { useState, useEffect } from 'react';

interface HierarchySelectorProps {
  organizationId: string;
  onSelect: (data: {
    buildingId?: string;
    floorId?: string;
    roomId?: string;
  }) => void;
}

export function HierarchySelector({ organizationId, onSelect }: HierarchySelectorProps) {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  
  useEffect(() => {
    if (organizationId) {
      fetch(`/api/buildings?organizationId=${organizationId}`)
        .then(res => res.json())
        .then(data => setBuildings(data.data));
    }
  }, [organizationId]);
  
  useEffect(() => {
    if (selectedBuilding) {
      fetch(`/api/buildings/${selectedBuilding}/floors`)
        .then(res => res.json())
        .then(data => setFloors(data.data));
      setSelectedFloor('');
      setSelectedRoom('');
    }
  }, [selectedBuilding]);
  
  useEffect(() => {
    if (selectedFloor) {
      fetch(`/api/rooms?floorId=${selectedFloor}`)
        .then(res => res.json())
        .then(data => setRooms(data.data));
      setSelectedRoom('');
    }
  }, [selectedFloor]);
  
  useEffect(() => {
    onSelect({
      buildingId: selectedBuilding || undefined,
      floorId: selectedFloor || undefined,
      roomId: selectedRoom || undefined
    });
  }, [selectedBuilding, selectedFloor, selectedRoom]);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Building</label>
        <select 
          value={selectedBuilding} 
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Building</option>
          {buildings.map((b: any) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Floor</label>
        <select 
          value={selectedFloor} 
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={!selectedBuilding}
        >
          <option value="">Select Floor</option>
          {floors.map((f: any) => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Room</label>
        <select 
          value={selectedRoom} 
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={!selectedFloor}
        >
          <option value="">Select Room</option>
          {rooms.map((r: any) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

## Testing the System

### 1. Create Organization
```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BotCalm",
    "code": "BOTCALM",
    "description": "AI Solutions",
    "address": "123 Tech Street",
    "contactEmail": "info@botcalm.com"
  }'
```

### 2. Create Building
```bash
curl -X POST http://localhost:3000/api/buildings \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID_HERE",
    "name": "Building 001",
    "code": "BLD001",
    "address": "123 Tech Street",
    "floors": 3
  }'
```

### 3. Create Floor
```bash
curl -X POST http://localhost:3000/api/floors \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID_HERE",
    "buildingId": "BUILDING_ID_HERE",
    "name": "Floor 1 - Incubation Area",
    "code": "INCY",
    "floorNumber": 1,
    "type": "floor"
  }'
```

### 4. Create Room
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID_HERE",
    "buildingId": "BUILDING_ID_HERE",
    "floorId": "FLOOR_ID_HERE",
    "name": "Development Lab A",
    "code": "DEV-A",
    "roomType": "office",
    "capacity": 20
  }'
```

### 5. Create Asset with Full Hierarchy
```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID_HERE",
    "buildingId": "BUILDING_ID_HERE",
    "floorId": "FLOOR_ID_HERE",
    "roomId": "ROOM_ID_HERE",
    "assetTag": "AST-001",
    "name": "Dell Laptop XPS 15",
    "category": "Computer",
    "status": "active",
    "purchaseDate": "2024-01-15",
    "purchasePrice": 250000,
    "currentValue": 250000
  }'
```

This implementation provides a complete, scalable multi-organization asset management system with floor mapping capabilities!
