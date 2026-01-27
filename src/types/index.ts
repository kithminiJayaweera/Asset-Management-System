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
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface IAsset {
  _id: Types.ObjectId | string;
  assetTag: string;
  name: string;
  category: string;
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
  requestType: 'assignment' | 'return' | 'maintenance' | 'new';
  reason: string;
  status: RequestStatus;
  approvedBy?: Types.ObjectId | string; // User ID
  approvalDate?: Date;
  completionDate?: Date;
  notes?: string;
  organizationId: Types.ObjectId | string;
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
