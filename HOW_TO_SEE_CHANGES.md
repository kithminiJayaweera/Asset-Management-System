# How to See the Maintenance Workflow Changes

## 🎯 What Changed

### 1. **New Wrench Icon Button** 
In the Asset List, each asset now has a wrench (🔧) icon button next to Edit and Delete buttons.

**Location:** Asset List → Actions Column

### 2. **Maintenance Dialog**
When you click the wrench icon, a modal dialog opens with all maintenance fields.

## 📍 Where to See Changes

### Step 1: Start Your Development Server
```bash
npm run dev
```

### Step 2: Navigate to Assets Page
1. Open your browser: `http://localhost:3000`
2. Click on **"All Assets"** in the sidebar
3. You'll see the asset list with all your assets

### Step 3: Look for the Wrench Icon
In the **Actions** column (rightmost), you'll see:
- 👁️ Eye icon (View Details)
- 🔧 **Wrench icon (NEW - Send to Maintenance)** ← This is new!
- ✏️ Edit icon
- 🗑️ Delete icon

### Step 4: Click the Wrench Icon
1. Click the wrench icon on any **active** asset
2. A maintenance dialog will pop up

### Step 5: Fill the Maintenance Form
The dialog includes:
- ✅ Issue Title (e.g., "Screen not working")
- ✅ Issue Description (detailed problem)
- ✅ Maintenance Type dropdown (Preventive/Corrective/Warranty)
- ✅ Priority dropdown (Low/Medium/High/Critical)
- ✅ Expected Return Date picker
- ✅ Assigned Vendor dropdown
- ✅ Estimated Cost input
- ✅ File attachments
- ✅ Additional Notes

### Step 6: Submit
1. Fill in required fields (marked with *)
2. Click "Send to Maintenance"
3. Asset status will change to "maintenance"
4. Page will reload showing updated status

## 🔍 Visual Changes Summary

### Before:
```
Actions Column:
[👁️] [✏️] [🗑️]
```

### After:
```
Actions Column:
[👁️] [🔧] [✏️] [🗑️]
       ↑
    NEW!
```

## 🧪 Testing the Feature

### Test Case 1: Send Asset to Maintenance
1. Go to "All Assets"
2. Find an asset with status "active"
3. Click wrench icon
4. Fill form:
   - Issue Title: "Screen flickering"
   - Description: "Display shows intermittent flickering"
   - Type: Corrective
   - Priority: High
   - Vendor: Internal IT Staff
   - Cost: 5000
5. Click "Send to Maintenance"
6. ✅ Asset status changes to "maintenance"
7. ✅ Wrench icon disappears (only shows for non-maintenance assets)

### Test Case 2: View Maintenance Records
Check the database or create an API call:
```javascript
fetch('/api/maintenance?organizationId=YOUR_ORG_ID')
  .then(r => r.json())
  .then(data => console.log(data))
```

## 📂 Files Modified/Created

### Created:
1. `src/components/admin/MaintenanceDialog.tsx` - The maintenance form dialog
2. `src/app/api/maintenance/route.ts` - API endpoint
3. `src/actions/maintenance.ts` - Server actions
4. `MAINTENANCE_WORKFLOW.md` - Documentation

### Modified:
1. `src/components/admin/AssetList.tsx` - Added wrench button
2. `src/app/page.tsx` - Integrated maintenance dialog
3. `src/types/index.ts` - Updated maintenance types
4. `src/models/Maintenance.ts` - Enhanced schema

## 🎨 UI Preview

When you click the wrench icon, you'll see:

```
┌─────────────────────────────────────────┐
│  Send Asset to Maintenance          [X] │
├─────────────────────────────────────────┤
│  Asset: Dell Laptop XPS 15              │
│  Location: Office Floor 2               │
│                                         │
│  Issue Title *                          │
│  [Screen not working____________]       │
│                                         │
│  Issue Description *                    │
│  [Detailed problem...________]          │
│                                         │
│  Maintenance Type *    Priority *       │
│  [Corrective ▼]       [High ▼]         │
│                                         │
│  Expected Return Date                   │
│  [📅 2024-02-15]                        │
│                                         │
│  Assigned Vendor                        │
│  [Internal IT Staff ▼]                 │
│                                         │
│  Estimated Cost                         │
│  [5000.00___________]                   │
│                                         │
│  Attachments                            │
│  [Choose Files]                         │
│                                         │
│  Additional Notes                       │
│  [Optional notes...________]            │
│                                         │
│  [Cancel]  [Send to Maintenance]        │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# 1. Start the server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Click "All Assets" in sidebar

# 4. Click wrench icon (🔧) on any asset

# 5. Fill the form and submit!
```

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Wrench icon appears in asset list
2. ✅ Dialog opens when clicked
3. ✅ Form validates required fields
4. ✅ Success message appears after submit
5. ✅ Asset status changes to "maintenance"
6. ✅ Wrench icon disappears for maintenance assets

## 🐛 Troubleshooting

**Issue:** Wrench icon not showing
- **Solution:** Make sure asset status is not "maintenance"

**Issue:** Dialog not opening
- **Solution:** Check browser console for errors

**Issue:** Submit fails
- **Solution:** Ensure MongoDB is running and connected

**Issue:** Asset status not updating
- **Solution:** Check API route `/api/maintenance` is accessible

## 📞 Need Help?

Check the detailed documentation in `MAINTENANCE_WORKFLOW.md`
