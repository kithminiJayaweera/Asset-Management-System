# Asset Management System - AI Development Guide

## Architecture Overview

This is a **Next.js 15+ full-stack asset management system** with MongoDB backend. The application is organized into distinct layers:

- **Frontend**: React 19 components with Tailwind CSS + shadcn/ui (in `src/components/`)
- **Backend**: Server Actions (`src/actions/`) and API Routes (`src/app/api/`)
- **Database**: MongoDB + Mongoose models (`src/models/`)
- **Shared Types**: TypeScript interfaces (`src/types/index.ts`)

### Key Data Flow Pattern

1. **Components** call **Server Actions** or API Routes
2. **Actions/Routes** connect to MongoDB via `dbConnect()` utility
3. **Mongoose models** handle queries with validation
4. **Results** are serialized (via `JSON.parse(JSON.stringify())`) for client safety
5. **Cache** is invalidated with `revalidatePath()` to trigger re-renders

## Development Workflow

```bash
npm run dev          # Start development server on :3000
npm run build        # Build production bundle
npm run lint         # Run ESLint
```

**Prerequisites**: Node.js 18+, MongoDB (local or Atlas). See `.env.local` setup in README.md.

## Project Conventions

### File Organization Pattern
- **Components**: Organize by role (`admin/`, `employee/`, `shared/`) and domain (e.g., `AssetList.tsx`, `AssetForm.tsx`)
- **Server Actions**: Group by domain in `src/actions/` (one file per entity: `assets.ts`, `users.ts`, `organizations.ts`, `requests.ts`)
- **API Routes**: Mirror action structure under `src/app/api/` with nested `[id]/` folders

### Type Safety
- All database schemas defined as Mongoose models in `src/models/`
- Matching TypeScript interfaces in `src/types/index.ts` (e.g., `IAsset`, `IUser`, `IAssetRequest`)
- Always destructure from `IAsset | IUser | IOrganization` types—never use `any`

### Authentication & Authorization
- **Roles**: `admin`, `employee`, `organization_admin` (stored in User model)
- **Multi-org support**: Assets/Users scoped to `organizationId` via refs in Mongoose schemas
- Password hashing with bcryptjs; JWT-ready infrastructure
- **Current limitation**: Auth middleware in [src/middleware.ts](../src/middleware.ts) is minimal—add role-based protection for new routes

### Component Patterns

**Client-Side Component**:
```tsx
'use client';
import { SomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MyComponent({ data }: { data: IAsset }) {
  return <Button onClick={() => console.log(data)}>Action</Button>;
}
```

**Server Action Usage**:
```tsx
'use client';
import { createAsset } from '@/actions/assets';

export function AssetForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createAsset(assetData);
  }
}
```

**API Route Pattern** (see [src/app/api/assets/route.ts](../src/app/api/assets/route.ts)):
- Accept query params for pagination (`page`, `limit`)
- Build MongoDB `query` object with filters
- Return `PaginatedResponse<T>` type for consistency
- Populate related fields (e.g., `assignedTo`, `organizationId`) before responding

### Database Connection
Always call `dbConnect()` before any query—utility cached in global state (see [src/lib/mongodb.ts](../src/lib/mongodb.ts)):
```typescript
await dbConnect(); // Safe to call multiple times; reuses connection
const assets = await Asset.find({ organizationId });
```

## Domain-Specific Knowledge

### Asset Depreciation
- **Multiple methods**: `straight-line` (default), `declining-balance`, `none`
- **Calculation**: Computes `currentValue` based on `purchaseDate` + `usefulLife`
- **When adding features**: Use depreciation utility for value calculations; store `depreciationMethod` + `usefulLife` in Asset model

### Asset Lifecycle
- **Status**: `available`, `assigned`, `maintenance`, `retired`
- **Condition**: `excellent`, `good`, `fair`, `poor`
- **Assigned**: Tracked via `assignedTo` field (User ref) and maintenance logs
- Asset Request flow: `pending` → `approved`/`rejected` → `completed`

### Constants & Enums
Use [src/config/constants.ts](../src/config/constants.ts) for all hardcoded values:
```typescript
import { ASSET_CATEGORIES, ASSET_STATUS, REQUEST_TYPES } from '@/config/constants';
```
When adding new fields/types: update constants first, then models.

## Common Patterns to Reuse

### Form Components
Existing pattern: `AssetForm.tsx`, `EmployeeForm.tsx` accept `initialData?: IAsset` and handle create/update.
- Use Tailwind's `border rounded-lg p-4` for styling
- Use shadcn/ui components (Button, Input, Select, Dialog)

### List Components  
Pattern: `AssetList.tsx`, `EmployeeList.tsx` implement client-side filtering + UI wrapping Server Actions.
- Search bar with `useState`
- Category/status dropdowns from constants
- Table from shadcn/ui; handle delete/edit via callbacks

### Role-Based Rendering
Check `user.role` to show/hide admin vs. employee sections:
```tsx
{user?.role === 'admin' && <AdminPanel />}
{user?.role === 'employee' && <EmployeeDashboard />}
```

## Integration Points & External Dependencies

- **Next.js 15**: App Router, Server Actions, API Routes, Middleware
- **MongoDB/Mongoose 8**: ORM with schema validation + hooks
- **bcryptjs**: Password hashing (applied in User model pre-save hook)
- **QRCode.react**: Generate asset QR codes (not yet integrated—ready for feature)
- **Tailwind CSS 4**: Utility-first styling framework

## Critical Gotchas

1. **Serialization**: Always `JSON.parse(JSON.stringify(object))` before returning from Server Actions—required for client/server boundary
2. **Role Checks**: Currently not enforced in middleware—add guards in actions/routes if accessing sensitive data
3. **Lean Queries**: Use `.lean()` in API routes for read-only queries to skip Mongoose overhead
4. **Populate Safety**: Reference fields require `.populate()` or explicit joins; unset refs cause `null` values
5. **Env Variables**: `MONGODB_URI` required; `NEXT_PUBLIC_APP_URL` optional but used in some configs

## Recommended Reading Order

1. [src/types/index.ts](../src/types/index.ts) — Understand core domain types
2. [src/models/Asset.ts](../src/models/Asset.ts) — Core domain model structure
3. [src/actions/assets.ts](../src/actions/assets.ts) — Server Action patterns
4. [src/app/api/assets/route.ts](../src/app/api/assets/route.ts) — API endpoint design
5. [src/components/admin/AssetList.tsx](../src/components/admin/AssetList.tsx) — UI component composition

---

**Last updated**: January 28, 2025 | **Next.js 16** | **React 19** | **MongoDB 8.21.1**
