# Toast Notifications Fix Guide

## Issue
Asset request popup messages not showing and system not updating in real-time.

## Solution

### 1. Toast Notifications Already Implemented ✅
All toast notifications have been added to:
- `src/components/AssetRequestsList.tsx` - All request actions
- `src/app/page.tsx` - All asset, organization, and admin actions

### 2. Real-time Updates
The AssetRequestsList component already calls `fetchRequests()` after each action to refresh data.

### 3. Verify Toast is Working

**Check browser console for errors:**
```bash
# Open browser DevTools (F12)
# Check Console tab for any errors
```

**Test toast manually:**
```typescript
// In browser console, type:
import { toast } from 'sonner';
toast.success('Test message');
```

### 4. Common Issues & Fixes

**If toasts don't show:**

1. **Check if Toaster component is rendered:**
   - Open `src/app/layout.tsx`
   - Verify `<Toaster position="top-right" richColors />` is present

2. **Check if sonner is installed:**
   ```bash
   npm list sonner
   ```
   If not installed:
   ```bash
   npm install sonner
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

4. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### 5. Test Each Action

**Asset Requests:**
- ✅ Approve request → "Request approved successfully!"
- ✅ Reject request → "Request rejected successfully!"
- ✅ Archive request → "Request archived successfully!"
- ✅ Delete request → "Request deleted successfully!"
- ✅ Assign asset → "Asset assigned successfully!"

**Assets:**
- ✅ Add asset → "Asset created successfully!"
- ✅ Update asset → "Asset updated successfully!" + Navigate to detail
- ✅ Delete asset → "Asset deleted successfully!"

### 6. Real-time Update Flow

```
User Action (e.g., Approve Request)
    ↓
API Call (PUT /api/requests/:id)
    ↓
Success Response
    ↓
toast.success() ← Shows popup
    ↓
fetchRequests() ← Refreshes data
    ↓
UI Updates ← Shows new data
```

### 7. Debug Steps

If still not working:

1. **Check Network tab:**
   - Open DevTools → Network
   - Perform action
   - Check if API call succeeds (Status 200)

2. **Check Response:**
   - Click on API call in Network tab
   - Check Response tab
   - Verify `success: true`

3. **Add console.log:**
   ```typescript
   // In AssetRequestsList.tsx, add:
   console.log('Toast should show now');
   toast.success('Request approved!');
   ```

### 8. Force Refresh After Action

If data doesn't update, add manual refresh:

```typescript
// After successful action:
window.location.reload(); // Force page reload
```

But this shouldn't be necessary as `fetchRequests()` already handles it.

## Expected Behavior

✅ Toast appears at top-right corner
✅ Green for success, Red for errors
✅ Auto-dismisses after 3-4 seconds
✅ Data refreshes automatically
✅ No page reload needed

## Still Not Working?

1. Check browser console for errors
2. Verify sonner package is installed
3. Clear cache and restart server
4. Test with simple toast in console
5. Check if Toaster component is in layout
