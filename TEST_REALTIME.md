# Test Real-time Notifications

## How to Test:

### Method 1: Using Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:

```javascript
// Simulate new asset request
if (window.io) {
  window.io.emit('asset_request_created', {
    requestId: '123456',
    requestedBy: 'Test User',
    assetCategory: 'PC/Laptop'
  });
}
```

### Method 2: Create Real Request via API

1. Open Postman or use curl
2. POST to `http://localhost:3000/api/requests`
3. Body:
```json
{
  "requestedBy": "USER_ID_HERE",
  "assetCategory": "PC/Laptop",
  "requestType": "assignment",
  "reason": "Need for work",
  "organizationId": "ORG_ID_HERE"
}
```

### Expected Result:

✅ Toast notification appears at top-right
✅ Message: "New Asset Request - [Name] requested [Category]"
✅ "View" button is clickable
✅ Clicking "View" navigates to Asset Requests page
✅ Request is highlighted with ring effect
✅ Data refreshes automatically

### Troubleshooting:

**If toast doesn't show:**
1. Check browser console for errors
2. Verify Socket.IO is connected (look for "✅ Socket.IO connected" in console)
3. Hard refresh: Ctrl+Shift+R
4. Check if sonner is imported in SocketContext

**If navigation doesn't work:**
1. Check console for "navigateToRequest" event
2. Verify page.tsx has event listener
3. Check selectedRequestId state

**If highlight doesn't work:**
1. Check if highlightRequestId prop is passed
2. Verify request ID matches
3. Check CSS classes are applied

### Files to Check:

1. `src/contexts/SocketContext.tsx` - Socket events
2. `src/app/page.tsx` - Navigation logic
3. `src/components/AssetRequestsList.tsx` - Highlight logic
4. `src/app/api/requests/route.ts` - Socket emission

### Debug Commands:

```javascript
// Check if socket is connected
console.log('Socket:', window.io);

// Check if toast library is available
import { toast } from 'sonner';
toast.success('Test');

// Trigger navigation manually
window.dispatchEvent(new CustomEvent('navigateToRequest', { detail: 'REQUEST_ID' }));

// Trigger refresh manually
window.dispatchEvent(new Event('assetRequestCreated'));
```

## Implementation Status:

✅ Socket.IO setup
✅ Event emission on request creation
✅ Toast notification with action button
✅ Navigation to requests page
✅ Request highlighting
✅ Auto-refresh data
✅ Works on any page

All features implemented and ready to test!
