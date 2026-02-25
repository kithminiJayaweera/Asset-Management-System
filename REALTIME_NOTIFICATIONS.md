# Real-time Asset Request Notifications

## Implementation Complete ✅

### Features:
1. **Real-time Toast Notifications** - User කෙනෙක් මොන page එකේ හිටියත් asset request එකක් ආවම popup message එකක් පෙන්වනවා
2. **Auto Navigation** - Toast එකේ "View" button එක click කරනකොට Asset Requests page එකට යනවා
3. **Auto Highlight** - Request එක automatically highlight වෙනවා
4. **Auto Refresh** - Data automatically refresh වෙනවා

### How It Works:

```
Employee creates request
    ↓
POST /api/requests
    ↓
Socket.IO emits 'asset_request_created'
    ↓
All connected clients receive event
    ↓
Toast notification shows (any page)
    ↓
Click "View" → Navigate to requests page
    ↓
Request is highlighted
```

### Files Modified:

1. **src/contexts/SocketContext.tsx**
   - Added `asset_request_created` event listener
   - Shows toast with "View" button
   - Triggers navigation event

2. **src/app/page.tsx**
   - Listens for `assetRequestCreated` event
   - Listens for `navigateToRequest` event
   - Auto-navigates to requests page
   - Sets selected request ID for highlighting

3. **src/app/api/requests/route.ts**
   - Emits socket event when request is created
   - Sends request details (ID, requester, category)

### Toast Notification Features:

- 🔵 **Info style** - Blue color for new requests
- ⏱️ **5 second duration** - Auto-dismisses after 5 seconds
- 👁️ **View button** - Click to navigate to request
- 📱 **Works on any page** - Dashboard, Assets, Organizations, etc.

### Testing:

1. **Open two browser windows:**
   - Window 1: Admin dashboard (any page)
   - Window 2: Employee page or API testing tool

2. **Create a request:**
   - Use POST /api/requests endpoint
   - Or create from employee interface

3. **Expected behavior:**
   - Window 1 shows toast: "New Asset Request"
   - Message: "[Employee Name] requested [Category]"
   - Click "View" button
   - Navigates to Asset Requests page
   - Request is highlighted with ring effect

### Example Toast:

```
┌─────────────────────────────────┐
│ ℹ️ New Asset Request            │
│                                 │
│ John Doe requested PC/Laptop    │
│                                 │
│                    [View] [×]   │
└─────────────────────────────────┘
```

### Socket Events:

- `asset_request_created` - New request created
- `asset_updated` - Asset updated
- `notification` - General notification

### Browser Notifications:

If user grants permission, also shows browser notification:
- Desktop notification
- Works even when tab is not active
- Requires user permission

### Real-time Updates:

✅ New requests appear immediately
✅ No page refresh needed
✅ Works across all pages
✅ Highlights the new request
✅ Auto-scrolls to request

## Usage:

User කෙනෙක් Dashboard එකේ හිටියත්, Assets page එකේ හිටියත්, Reports එකේ හිටියත්:
1. Asset request එකක් ආවම toast එක පෙන්වනවා
2. "View" click කරනකොට requests page එකට යනවා
3. Request එක highlight වෙලා පෙන්වනවා
4. Data automatically refresh වෙනවා

## Test Command:

```javascript
// In browser console:
global.io.emit('asset_request_created', {
  requestId: '123',
  requestedBy: 'Test User',
  assetCategory: 'PC/Laptop'
});
```

සියල්ල හරියටම implement කරලා තියෙනවා! 🎉
