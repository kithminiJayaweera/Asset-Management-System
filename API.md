# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not implement authentication. This will be added in a future version using NextAuth.js or JWT.

---

## Assets

### Get All Assets
```http
GET /api/assets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| status | string | Filter by status: available, assigned, maintenance, retired |
| category | string | Filter by category |
| organizationId | string | Filter by organization ID |
| search | string | Search in name, assetTag, description |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "assetTag": "AST-001",
        "name": "Dell Laptop",
        "category": "Laptop",
        "status": "available",
        "purchasePrice": 1200,
        "currentValue": 1000,
        ...
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### Create Asset
```http
POST /api/assets
```

**Request Body:**
```json
{
  "assetTag": "AST-001",
  "name": "Dell Laptop",
  "category": "Laptop",
  "purchaseDate": "2024-01-01",
  "purchasePrice": 1200,
  "organizationId": "...",
  "status": "available",
  "condition": "excellent"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Asset created successfully"
}
```

### Get Single Asset
```http
GET /api/assets/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "assetTag": "AST-001",
    "assignedTo": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    ...
  }
}
```

### Update Asset
```http
PUT /api/assets/:id
```

**Request Body:** (partial update)
```json
{
  "status": "assigned",
  "assignedTo": "user_id",
  "currentValue": 1000
}
```

### Delete Asset
```http
DELETE /api/assets/:id
```

---

## Organizations

### Get All Organizations
```http
GET /api/organizations
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search in name, email |

### Create Organization
```http
POST /api/organizations
```

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "address": "123 Main St, City",
  "phone": "+1234567890",
  "email": "contact@acme.com",
  "website": "https://acme.com"
}
```

### Get Single Organization
```http
GET /api/organizations/:id
```

### Update Organization
```http
PUT /api/organizations/:id
```

### Delete Organization
```http
DELETE /api/organizations/:id
```

---

## Users

### Get All Users
```http
GET /api/users
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | string | Filter by organization |
| role | string | Filter by role: admin, employee, organization_admin |
| search | string | Search in name, email, employeeId |

### Create User
```http
POST /api/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "employee",
  "organizationId": "...",
  "employeeId": "EMP-001",
  "department": "IT",
  "position": "Software Engineer"
}
```

**Note:** Password is automatically hashed before storage.

### Get Single User
```http
GET /api/users/:id
```

**Note:** Password field is excluded from response.

### Update User
```http
PUT /api/users/:id
```

**Note:** Password cannot be updated through this endpoint.

### Delete User
```http
DELETE /api/users/:id
```

---

## Asset Requests

### Get All Requests
```http
GET /api/requests
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| organizationId | string | Filter by organization |
| status | string | Filter by status: pending, approved, rejected, completed |
| requestedBy | string | Filter by requester user ID |

### Create Request
```http
POST /api/requests
```

**Request Body:**
```json
{
  "requestedBy": "user_id",
  "assetId": "asset_id",
  "requestType": "assignment",
  "reason": "Need for project work",
  "organizationId": "..."
}
```

**Request Types:**
- `assignment` - Request to assign an asset
- `return` - Return an assigned asset
- `maintenance` - Request maintenance for an asset
- `new` - Request a new asset

### Get Single Request
```http
GET /api/requests/:id
```

### Update Request (Approve/Reject)
```http
PUT /api/requests/:id
```

**Request Body:**
```json
{
  "status": "approved",
  "approvedBy": "admin_user_id",
  "notes": "Approved for Q1 project"
}
```

**Note:** When a request is approved with `requestType: 'assignment'`, the associated asset is automatically updated with `status: 'assigned'`.

### Delete Request
```http
DELETE /api/requests/:id
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Duplicate key error"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Common Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

All error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Data Validation

### Asset
- `assetTag`: Required, unique, uppercase
- `name`: Required
- `category`: Required
- `purchaseDate`: Required, valid date
- `purchasePrice`: Required, positive number
- `organizationId`: Required, valid ObjectId

### User
- `name`: Required
- `email`: Required, unique, valid email format
- `password`: Required, min 6 characters
- `role`: Required, one of: admin, employee, organization_admin
- `organizationId`: Required, valid ObjectId

### Organization
- `name`: Required, unique
- `email`: Required, unique, valid email format
- `phone`: Required
- `address`: Required

### Asset Request
- `requestedBy`: Required, valid user ObjectId
- `requestType`: Required, one of: assignment, return, maintenance, new
- `reason`: Required
- `organizationId`: Required, valid ObjectId
- `assetId` or `assetCategory`: One required based on request type

---

## Example Usage with JavaScript/Fetch

### Creating an Asset
```javascript
const createAsset = async () => {
  const response = await fetch('http://localhost:3000/api/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assetTag: 'AST-001',
      name: 'Dell Laptop',
      category: 'Laptop',
      purchaseDate: '2024-01-01',
      purchasePrice: 1200,
      currentValue: 1200,
      organizationId: '...',
      status: 'available',
      condition: 'excellent'
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

### Fetching Assets with Filters
```javascript
const getAssets = async () => {
  const params = new URLSearchParams({
    page: '1',
    limit: '20',
    status: 'available',
    organizationId: '...'
  });
  
  const response = await fetch(`http://localhost:3000/api/assets?${params}`);
  const result = await response.json();
  
  console.log(result.data.data); // Array of assets
  console.log(result.data.pagination); // Pagination info
};
```

### Approving a Request
```javascript
const approveRequest = async (requestId, adminId) => {
  const response = await fetch(`http://localhost:3000/api/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'approved',
      approvedBy: adminId,
      notes: 'Approved'
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

---

## Rate Limiting

*To be implemented*

Planned rate limits:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Versioning

Current version: v1 (implicit)

Future versions will be available at:
- `/api/v2/...`
- `/api/v3/...`

The current endpoints will remain available for backward compatibility.
