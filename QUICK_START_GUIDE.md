# Quick Start Guide - Floor Plans & Locations

## 🎯 How to Access Everything

### Main Dashboard Navigation

Open the app at `http://localhost:3000` and you'll see the left sidebar with these options:

1. **Dashboard** - Overview of all assets
2. **All Assets** - Manage assets
3. **Organizations** - Manage organizations
4. **Organization Admins** - Manage admin users
5. **📍 Locations** ← **NEW!** - Manage office locations
6. **🗺️ Floor Plans** ← **NEW!** - Interactive floor plan visualization  
7. **Asset Requests** - View and manage requests
8. **Reports** - Analytics and reports
9. **Settings** - System settings

---

## 📍 Step 1: Create Locations

**Before creating floor plans, you MUST create locations first!**

### How to Create a Location:

1. Click **"Locations"** in the sidebar
2. Click **"Add Location"** button (top right)
3. Fill in the form:
   - **Location Name**: e.g., "Main Office Building"
   - **Location Type**: Choose from:
     - `building` - For office buildings
     - `floor` - For specific floors
     - `room` - For individual rooms
     - `zone` - For areas within rooms
     - `outdoor` - For outdoor spaces
     - `desk` - For specific desk positions
   - **Organization**: Select which organization owns this location
   - **Parent Location** (optional): Create hierarchy (e.g., Floor 3 → Building A)
   - **Address**: Physical address
   - **Floor Number**: Numeric floor level
   - **Capacity**: How many desks/people it holds

4. Click **"Create Location"**

### Example Location Hierarchy:

```
Organization: TechCorp Inc.
  └── Building: Main Office Building (building)
        ├── Floor: 1st Floor (floor)
        │     └── Room: Conference Room A (room)
        ├── Floor: 2nd Floor (floor)
        └── Floor: 3rd Floor (floor)
              ├── Room: Dev Team Area (room)
              └── Room: Executive Suite (room)
```

---

## 🗺️ Step 2: Create Floor Plans

Once you have locations created:

1. Click **"Floor Plans"** in the sidebar (this navigates to `/floorplans`)
2. Click **"Create Floor Plan"**
3. Fill in the form:
   - **Floor Plan Name**: e.g., "3rd Floor Layout"
   - **Organization**: Select organization
   - **Location**: Select a location you created in Step 1
   - **Upload Image**: Drag & drop or click to upload (PNG, JPEG, PDF)
   - **Scale** (optional): e.g., "1 pixel = 10 cm"
4. Click **"Create"**

---

## 🪑 Step 3: Add Desks to Floor Plan

1. From the floor plans list, click **"Edit"** on a floor plan
2. Click **"Add Desk"** button
3. Position the desk by entering coordinates or dragging
4. Fill in desk details:
   - **Desk Number**: e.g., "DESK-301"
   - **Position (X, Y)**: Coordinates on the floor plan
   - **Size**: Width and height in pixels
   - **Rotation**: Angle in degrees
   - **Status**: Available, Occupied, Reserved, Maintenance, Unavailable
   - **Type**: Standard, Standing, Hot-desk, Meeting, Executive
   - **Amenities**: Monitor, Keyboard, Mouse, Phone, etc.
5. Click **"Create Desk"**

### Drag & Drop Desks:
- Click and drag desks to reposition them on the floor plan
- Changes are saved automatically

---

## 👤 Step 4: Assign Desks to Employees

### Option A: From Floor Plan Editor
1. Open floor plan in edit mode
2. Click on a desk
3. Click **"Edit"** in the desk info panel
4. Select user in the **"Assigned To"** field
5. Desk status automatically changes to "Occupied"

### Option B: Via Server Actions (Programmatic)
```typescript
import { assignDeskToUser, unassignDeskFromUser } from '@/actions/floorplans';

// Assign desk
await assignDeskToUser('deskId', 'userId');

// Unassign desk
await unassignDeskFromUser('deskId');
```

---

## 💻 Step 5: Assign Assets to Desks

```typescript
import { assignAssetToDesk, removeAssetFromDesk } from '@/actions/floorplans';

// Assign asset (e.g., laptop, monitor)
await assignAssetToDesk('deskId', 'assetId');

// Remove asset
await removeAssetFromDesk('deskId', 'assetId');
```

---

## 🎨 Visual Status Indicators

Desks are color-coded by status:

| Status       | Color  | When to Use                    |
|--------------|--------|--------------------------------|
| Available    | 🟢 Green  | Desk is ready for assignment   |
| Occupied     | 🔵 Blue   | Someone is assigned to this desk|
| Reserved     | 🟡 Yellow | Desk is temporarily held       |
| Maintenance  | 🟠 Orange | Desk needs repairs             |
| Unavailable  | ⚫ Gray   | Desk is out of service         |

---

## 📊 Sample Data Setup

Run this command to generate sample floor plan data:

```bash
npm run db:setup-floorplans
```

This creates:
- 1 organization (TechCorp Inc.)
- 2 locations (Building + Floor)
- 1 floor plan
- 24 desks in a grid pattern

---

## 🔧 Troubleshooting

### "I don't see any locations to select"
→ You need to create locations first (Step 1) before creating floor plans

### "Upload failed"
→ Check file size (<10MB) and format (PNG, JPEG, PDF only)

### "Desk status not updating"
→ Re-assign the user to trigger the auto-status update hook

### "Can't find Floor Plans menu"
→ Make sure you're on the main dashboard (`http://localhost:3000`), not a sub-route

### "Navigation not working"
→ Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📚 Additional Resources

- **Full Documentation**: [FLOOR_PLAN_GUIDE.md](FLOOR_PLAN_GUIDE.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **API Documentation**: See FLOOR_PLAN_GUIDE.md → API Endpoints section

---

## 🎯 Quick Navigation URLs

Once your server is running (`npm run dev`):

- **Main Dashboard**: http://localhost:3000
- **Floor Plans**: http://localhost:3000/floorplans
- **Specific Floor Plan**: http://localhost:3000/floorplans/[id]
- **Edit Floor Plan**: http://localhost:3000/floorplans/[id]/edit
- **API Endpoints**:
  - GET Locations: http://localhost:3000/api/locations
  - GET Floor Plans: http://localhost:3000/api/floorplans
  - GET Desks: http://localhost:3000/api/desks

---

**Ready to get started? Follow Step 1 above!** 🚀
