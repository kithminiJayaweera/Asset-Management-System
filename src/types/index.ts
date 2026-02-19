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
export type MaintenanceType = 'preventive' | 'corrective' | 'warranty';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface IMaintenance {
  _id: Types.ObjectId | string;
  assetId: Types.ObjectId | string;
  issueTitle: string;
  issueDescription: string;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  expectedReturnDate?: Date;
  assignedVendor?: string;
  estimatedCost?: number;
  actualCost?: number;
  attachments?: string[];
  performedBy?: string;
  performedDate?: Date;
  completionDate?: Date;
  notes?: string;
  organizationId: Types.ObjectId | string;
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
