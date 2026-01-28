export interface AssetLog {
  id: string;
  assetId: string;
  action: 'assigned' | 'unassigned' | 'status_change' | 'location_change' | 'created';
  assignedTo?: string;
  assignedFrom?: string;
  newStatus?: string;
  oldStatus?: string;
  newLocation?: string;
  oldLocation?: string;
  performedBy: string;
  performedDate: string;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'maintenance' | 'retired' | 'lost';
  location: string;
  purchaseDate: string;
  value: number;
  depreciationRate: number;
  assignedTo?: string;
  description?: string;
  organizationId?: string;
  logs?: AssetLog[];
  brand?: string;
  model?: string;
  serialNumber?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  operatingSystem?: string;
  macAddress?: string;
  warrantyEndDate?: string;
  material?: string;
  color?: string;
  dimensions?: string;
  vehicleType?: string;
  registrationNumber?: string;
  fuelType?: string;
  mileage?: string;
  condition?: string;
  lastMaintenanceDate?: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdDate: string;
}

export interface SubAdmin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin';
  organizationId: string;
  permissions: string[];
  createdDate: string;
}
