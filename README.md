# Asset Management System

A comprehensive asset tracking and management solution built with Next.js 15+, MongoDB, and TypeScript.

## 📋 Features

- **Multi-Organization Support**: Track assets across different companies/organizations
- **Asset Management**: Complete CRUD operations for assets with detailed tracking
- **User Management**: Role-based access control (Admin, Organization Admin, Employee)
- **Asset Requests**: Employee request system for asset assignment, returns, and maintenance
- **Depreciation Tracking**: Automated asset value calculations with multiple depreciation methods
- **Audit Logs**: Complete history of all asset-related activities
- **Maintenance Records**: Track preventive and corrective maintenance
- **Real-time Updates**: Server-side rendering with Next.js App Router
- **🗺️ Interactive Floor Plans**: Visual asset and desk tracking with interactive floor plan visualization
  - Upload floor plan images (PNG, JPEG, PDF)
  - Drag-and-drop desk placement
  - Real-time desk availability tracking
  - Color-coded status indicators
  - Multi-location support (buildings, floors, rooms)
  - Asset location visualization

## 🏗️ Project Structure

```
asset-management-next/
├── src/
│   ├── actions/              # Server Actions
│   │   ├── assets.ts         # Asset-related server actions
│   │   ├── users.ts          # User management actions
│   │   ├── organizations.ts  # Organization actions
│   │   └── requests.ts       # Asset request actions
│   │
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── assets/       # Asset endpoints
│   │   │   │   ├── route.ts  # GET, POST /api/assets
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts  # GET, PUT, DELETE /api/assets/:id
│   │   │   ├── organizations/    # Organization endpoints
│   │   │   ├── users/            # User endpoints
│   │   │   └── requests/         # Asset request endpoints
│   │   │
│   │   ├── components/       # React Components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── employee/     # Employee-specific components
│   │   │   ├── shared/       # Shared layout components
│   │   │   └── ui/           # UI components (shadcn/ui)
│   │   │
│   │   ├── employee/         # Employee dashboard pages
│   │   ├── utils/            # Utility functions
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   │
│   ├── config/               # Configuration
│   │   └── constants.ts      # App constants and enums
│   │
│   ├── lib/                  # Core utilities
│   │   ├── mongodb.ts        # MongoDB connection handler
│   │   └── utils.ts          # Utility functions
│   │
│   ├── models/               # MongoDB Models (Mongoose)
│   │   ├── Asset.ts          # Asset schema
│   │   ├── User.ts           # User schema
│   │   ├── Organization.ts   # Organization schema
│   │   ├── AssetRequest.ts   # Asset request schema
│   │   ├── Maintenance.ts    # Maintenance records schema
│   │   └── AuditLog.ts       # Audit log schema
│   │
│   ├── types/                # TypeScript Types
│   │   └── index.ts          # Shared type definitions
│   │
│   └── middleware.ts         # Next.js middleware
│
├── public/                   # Static files
├── .env.local               # Environment variables (not in git)
├── .env.local.example       # Environment variables template
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd asset-management-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and configure your MongoDB connection:
   ```env
   MONGODB_URI=mongodb://localhost:27017/asset-management
   # For MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/asset-management
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **(Optional) Setup Floor Plans**
   ```bash
   # Create sample floor plans and desks
   npm run db:setup-floorplans
   ```
   
   For detailed floor plan setup and usage, see [FLOOR_PLAN_GUIDE.md](./FLOOR_PLAN_GUIDE.md)

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Endpoints

### Assets
- `GET /api/assets` - Get all assets (with pagination and filters)
- `POST /api/assets` - Create a new asset
- `GET /api/assets/:id` - Get a specific asset
- `PUT /api/assets/:id` - Update an asset
- `DELETE /api/assets/:id` - Delete an asset

### Organizations
- `GET /api/organizations` - Get all organizations
- `POST /api/organizations` - Create a new organization
- `GET /api/organizations/:id` - Get a specific organization
- `PUT /api/organizations/:id` - Update an organization
- `DELETE /api/organizations/:id` - Delete an organization

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Asset Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create a new request
- `GET /api/requests/:id` - Get a specific request
- `PUT /api/requests/:id` - Update a request (approve/reject)
- `DELETE /api/requests/:id` - Delete a request

### Floor Plans (New! 🗺️)
- `GET /api/floorplans` - Get all floor plans
- `POST /api/floorplans` - Create a new floor plan
- `GET /api/floorplans/:id` - Get a specific floor plan with desks
- `PATCH /api/floorplans/:id` - Update a floor plan
- `DELETE /api/floorplans/:id` - Delete a floor plan
- `POST /api/upload/floorplan` - Upload floor plan image

### Desks
- `GET /api/desks` - Get all desks (with filters)
- `POST /api/desks` - Create a new desk
- `GET /api/desks/:id` - Get a specific desk
- `PATCH /api/desks/:id` - Update a desk
- `DELETE /api/desks/:id` - Delete a desk

## 🗄️ Database Schema

### Collections

1. **Organizations** - Company/organization information
2. **Users** - System users (admins and employees)
3. **Assets** - Asset inventory with tracking details
4. **AssetRequests** - Employee requests for assets
5. **Maintenance** - Maintenance records for assets
6. **AuditLogs** - System activity logs
7. **Locations** - Hierarchical location structure (buildings, floors, rooms)
8. **FloorPlans** - Floor plan images and metadata
9. **Desks** - Desk positions and assignments on floor plans
10. **Categories** - Custom asset categories with dynamic fields

## 🔐 Security Features

- Password hashing with bcryptjs
- MongoDB injection protection with Mongoose
- Input validation with Zod (ready to implement)
- Role-based access control
- Secure environment variable handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 15+** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful API
- **Server Actions** - Server-side mutations
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📦 Key Dependencies

```json
{
  "mongoose": "^8.8.4",           // MongoDB ODM
  "bcryptjs": "^2.4.3",           // Password hashing
  "clsx": "^2.1.0",               // Utility for className
  "tailwind-merge": "^2.5.5",    // Merge Tailwind classes
  "zod": "^3.24.1"                // Schema validation
}
```

## 🎯 Development Workflow

### Backend Development

1. **Creating a new model**: Add schema in `src/models/`
2. **Creating API routes**: Add routes in `src/app/api/`
3. **Creating server actions**: Add actions in `src/actions/`
4. **Adding types**: Update `src/types/index.ts`

### Frontend Development

1. **UI Components**: Use/customize components from `src/app/components/ui/`
2. **Feature Components**: Add to `src/app/components/admin/` or `src/app/components/employee/`
3. **Pages**: Add to `src/app/` following Next.js App Router conventions

## 🔄 Data Flow

```
User Action
    ↓
React Component (Client)
    ↓
Server Action / API Route
    ↓
MongoDB via Mongoose
    ↓
Response to Client
    ↓
UI Update
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚧 Future Enhancements

- [ ] Authentication with NextAuth.js
- [ ] File upload for asset images
- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] Export data to CSV/PDF
- [ ] Mobile app with React Native
- [ ] Real-time notifications with WebSockets
- [ ] Integration with barcode/QR code scanners

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is an internal project. For contribution guidelines, please contact the development team.

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📞 Support

For support, please contact the development team or create an issue in the repository.
