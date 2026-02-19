import { Types } from 'mongoose';

// User/Employee Types
export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  password?: string; // Optional since we exclude it from responses
  role: 'admin' | 'employee' | 'organization_admin';
  organizationId: Types.ObjectId | string;
  employeeId?: string;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organization Types
export interface IOrganization {
  _id: Types.ObjectId | string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Types
export type AssetStatus = 'active' | 'maintenance' | 'retired' | 'lost';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface IAsset {
  _id: Types.ObjectId | string;
  assetTag: string;
  name: string;
  category?: string; // DEPRECATED but kept for compatibility
  categoryId?: Types.ObjectId | string; // NEW: Reference to Category
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod?: 'straight-line' | 'declining-balance' | 'none';
  usefulLife?: number; // in years
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  locationId?: Types.ObjectId | string; // NEW: Reference to Location
  deskId?: Types.ObjectId | string; // NEW: Reference to Desk if asset is at a desk
  floorPlanPosition?: ICoordinate; // NEW: Position on floor plan for visualization
  assignedTo?: Types.ObjectId | string; // User ID
  organizationId: Types.ObjectId | string;
  warrantyExpiry?: Date;
  notes?: string;
  imageUrl?: string;
  details?: Record<string, any>; // DEPRECATED: Category-specific fields
  customFields?: Record<string, any>; // NEW: Dynamic custom fields
  maintenance?: {
    condition?: AssetCondition;
    lastMaintenanceDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategoryField {
  name: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'url';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface ICategory {
  _id: Types.ObjectId | string;
  name: string;
  organizationId: Types.ObjectId | string;
  fields: ICategoryField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Request Types
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface IAssetRequest {
  _id: Types.ObjectId | string;
  requestedBy: Types.ObjectId | string; // User ID
  assetId?: Types.ObjectId | string; // For specific asset requests
  assetCategory?: string; // For general requests
  assetName?: string; // Optional: specific asset name user is looking for
  requestType: 'assignment' | 'return' | 'maintenance' | 'new';
  reason: string;
  status: RequestStatus;
  approvedBy?: Types.ObjectId | string; // User ID
  approvalDate?: Date;
  completionDate?: Date;
  notes?: string;
  organizationId: Types.ObjectId | string;
  archived: boolean;
  archivedDate?: Date;
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Maintenance Types
export interface IMaintenance {
  _id: Types.ObjectId | string;
  assetId: Types.ObjectId | string;
  maintenanceType: 'preventive' | 'corrective' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
  performedDate: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface IAuditLog {
  _id: Types.ObjectId | string;
  action: string;
  entityType: 'asset' | 'user' | 'organization' | 'request';
  entityId: Types.ObjectId | string;
  performedBy: Types.ObjectId | string; // User ID
  changes?: Record<string, any>;
  organizationId: Types.ObjectId | string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Location Types
export type LocationType = 'building' | 'floor' | 'room' | 'rack' | 'desk' | 'zone' | 'shelf' | 'other';

export interface ILocation {
  _id: Types.ObjectId | string;
  name: string;
  type: LocationType;
  parentId?: Types.ObjectId | string; // For hierarchical structure
  organizationId: Types.ObjectId | string;
  description?: string;
  floorPlanId?: Types.ObjectId | string; // Link to floor plan if applicable
  coordinates?: {
    x: number;
    y: number;
  };
  capacity?: number; // For rooms/desks
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Floor Plan Types
export interface ICoordinate {
  x: number;
  y: number;
}

export interface IFloorPlan {
  _id: Types.ObjectId | string;
  name: string;
  locationId: Types.ObjectId | string; // Reference to Location (building/floor)
  organizationId: Types.ObjectId | string;
  imageUrl: string; // URL to uploaded floor plan image
  imageWidth: number; // Original image dimensions
  imageHeight: number;
  scale?: number; // Pixels per meter (for real-world measurements)
  metadata?: {
    uploadedBy: Types.ObjectId | string;
    fileType: string;
    fileSize: number;
    originalFileName: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Desk Types
export type DeskStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'unavailable';

export interface IDesk {
  _id: Types.ObjectId | string;
  deskNumber: string;
  name?: string;
  locationId: Types.ObjectId | string; // Reference to Location (room/floor)
  floorPlanId: Types.ObjectId | string; // Reference to FloorPlan
  organizationId: Types.ObjectId | string;
  coordinates: ICoordinate; // Position on floor plan
  width?: number; // Visual dimensions on floor plan
  height?: number;
  rotation?: number; // Rotation angle in degrees
  status: DeskStatus;
  assignedTo?: Types.ObjectId | string; // User ID
  assignedAssets?: Array<Types.ObjectId | string>; // Asset IDs
  capacity?: number; // Max number of assets
  deskType?: 'standard' | 'standing' | 'collaborative' | 'hot-desk' | 'meeting-room';
  amenities?: string[]; // e.g., ['monitor', 'phone', 'charger']
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Floor Plan Item (for interactive visualization)
export interface IFloorPlanItem {
  id: string;
  type: 'desk' | 'asset' | 'zone' | 'room';
  coordinates: ICoordinate;
  width: number;
  height: number;
  rotation?: number;
  label?: string;
  status?: string;
  metadata?: Record<string, any>;
  onClick?: () => void;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
