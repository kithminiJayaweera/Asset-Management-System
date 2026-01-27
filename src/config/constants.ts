/**
 * Asset Management System - Configuration
 * 
 * This file contains configuration constants for the application
 */

export const APP_CONFIG = {
  name: 'Asset Management System',
  description: 'Comprehensive asset tracking and management solution',
  version: '1.0.0',
} as const;

export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 100,
} as const;

export const ASSET_CATEGORIES = [
  'Computer',
  'Laptop',
  'Monitor',
  'Keyboard',
  'Mouse',
  'Printer',
  'Scanner',
  'Phone',
  'Tablet',
  'Furniture',
  'Vehicle',
  'Other',
] as const;

export const ASSET_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
} as const;

export const ASSET_CONDITIONS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const;

export const REQUEST_TYPES = {
  ASSIGNMENT: 'assignment',
  RETURN: 'return',
  MAINTENANCE: 'maintenance',
  NEW: 'new',
} as const;

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  ORGANIZATION_ADMIN: 'organization_admin',
} as const;

export const DEPRECIATION_METHODS = {
  STRAIGHT_LINE: 'straight-line',
  DECLINING_BALANCE: 'declining-balance',
  NONE: 'none',
} as const;
