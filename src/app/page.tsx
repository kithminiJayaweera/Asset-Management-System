"use client";

import { useState } from 'react';
import { Dashboard } from './components/admin/Dashboard';
import { AssetList } from './components/admin/AssetList';
import { AssetForm } from './components/admin/AssetForm';
import { AssetDetail } from './components/AssetDetail';
import { OrganizationList } from './components/OrganizationList';
import { OrganizationForm } from './components/OrganizationForm';
import { OrganizationDetail } from './components/OrganizationDetail';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeDetail } from './components/EmployeeDetail';
import { AssetRequests, AssetRequest } from './components/AssetRequests';
import { Reports } from './components/admin/Reports';
import { Settings } from './components/admin/Settings';
import { OrganizationAdminList } from './components/OrganizationAdminList';
import { Sidebar } from './components/shared/Sidebar';
import { NavButton } from './components/shared/NavButton';
import { MainLayout } from './components/shared/MainLayout';
import { LayoutDashboard, Package, Building2, BarChart3, Settings as SettingsIcon, UserCircle, FileText } from 'lucide-react';

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
  depreciationRate: number; // Annual depreciation rate as percentage (e.g., 20 for 20%)
  assignedTo?: string;
  description?: string;
  organizationId?: string;
  logs?: AssetLog[];
  // PC/Laptop Specifications
  brand?: string;
  model?: string;
  serialNumber?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  operatingSystem?: string;
  macAddress?: string;
  warrantyEndDate?: string;
  // Furniture Specifications
  material?: string;
  color?: string;
  dimensions?: string;
  // Vehicle Specifications
  vehicleType?: string;
  registrationNumber?: string;
  fuelType?: string;
  mileage?: string;
  // Common Specs
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

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  organizationId: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'on-leave' | 'inactive';
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
}

type View = 'dashboard' | 'assets' | 'add-asset' | 'asset-detail' | 'organizations' | 'add-organization' | 'organization-detail' | 'employees' | 'add-employee' | 'employee-detail' | 'reports' | 'settings' | 'asset-requests' | 'organization-admins';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'assets' | 'add-asset' | 'asset-detail' | 'organizations' | 'add-organization' | 'organization-detail' | 'employees' | 'add-employee' | 'employee-detail' | 'reports' | 'settings' | 'asset-requests' | 'organization-admins'>('dashboard');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Dell Laptop XPS 15',
      category: 'Electronics',
      status: 'active',
      location: 'Office - Floor 2',
      purchaseDate: '2024-01-15',
      value: 150000,
      depreciationRate: 20,
      assignedTo: 'Saman Perera',
      description: 'High-performance laptop for development',
      organizationId: '1',
      logs: [
        {
          id: '1',
          assetId: '1',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2024-01-15',
          notes: 'Asset purchased and added to inventory'
        },
        {
          id: '2',
          assetId: '1',
          action: 'assigned',
          assignedTo: 'Kamal Fernando',
          performedBy: 'Admin',
          performedDate: '2024-02-01',
          notes: 'Initial assignment to IT department'
        },
        {
          id: '3',
          assetId: '1',
          action: 'unassigned',
          assignedFrom: 'Kamal Fernando',
          performedBy: 'Admin',
          performedDate: '2024-06-15',
          notes: 'Employee transferred to different department'
        },
        {
          id: '4',
          assetId: '1',
          action: 'assigned',
          assignedTo: 'Saman Perera',
          performedBy: 'Admin',
          performedDate: '2024-06-20',
          notes: 'Reassigned to new software engineer'
        }
      ]
    },
    {
      id: '2',
      name: 'Office Desk',
      category: 'Furniture',
      status: 'active',
      location: 'Office - Floor 1',
      purchaseDate: '2023-06-20',
      value: 35000,
      depreciationRate: 10,
      assignedTo: 'Saman Perera',
      organizationId: '1',
      logs: [
        {
          id: '5',
          assetId: '2',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2023-06-20',
          notes: 'Furniture purchased for new office space'
        },
        {
          id: '6',
          assetId: '2',
          action: 'assigned',
          assignedTo: 'Saman Perera',
          performedBy: 'Admin',
          performedDate: '2024-01-01',
          notes: 'Assigned to employee workstation'
        }
      ]
    },
    {
      id: '3',
      name: 'HP Printer LaserJet',
      category: 'Electronics',
      status: 'maintenance',
      location: 'Office - Floor 3',
      purchaseDate: '2023-03-10',
      value: 55000,
      depreciationRate: 10,
      description: 'Color laser printer',
      organizationId: '1',
      logs: [
        {
          id: '7',
          assetId: '3',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2023-03-10',
          notes: 'Printer purchased for shared use'
        },
        {
          id: '8',
          assetId: '3',
          action: 'status_change',
          oldStatus: 'active',
          newStatus: 'maintenance',
          performedBy: 'IT Support',
          performedDate: '2024-12-01',
          notes: 'Paper jam issue - sent for repair'
        }
      ]
    },
    {
      id: '4',
      name: 'Conference Table',
      category: 'Furniture',
      status: 'active',
      location: 'Meeting Room A',
      purchaseDate: '2023-05-15',
      value: 60000,
      depreciationRate: 8,
      organizationId: '2',
      logs: [
        {
          id: '9',
          assetId: '4',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2023-05-15',
          notes: 'Conference table for meeting room'
        }
      ]
    },
    {
      id: '5',
      name: 'MacBook Pro 16"',
      category: 'Electronics',
      status: 'active',
      location: 'Office - Floor 2',
      purchaseDate: '2024-02-01',
      value: 250000,
      depreciationRate: 20,
      assignedTo: 'Amal Silva',
      organizationId: '2',
      logs: [
        {
          id: '10',
          assetId: '5',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2024-02-01',
          notes: 'High-end laptop for project manager'
        },
        {
          id: '11',
          assetId: '5',
          action: 'assigned',
          assignedTo: 'Amal Silva',
          performedBy: 'Admin',
          performedDate: '2024-02-20',
          notes: 'Assigned to new project manager'
        }
      ]
    },
    {
      id: '6',
      name: 'Old Server Rack',
      category: 'Electronics',
      status: 'retired',
      location: 'Storage',
      purchaseDate: '2020-01-10',
      value: 30000,
      depreciationRate: 20,
      description: 'Replaced with cloud infrastructure',
      organizationId: '1',
      logs: [
        {
          id: '12',
          assetId: '6',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2020-01-10',
          notes: 'Server rack for on-premise infrastructure'
        },
        {
          id: '13',
          assetId: '6',
          action: 'status_change',
          oldStatus: 'active',
          newStatus: 'retired',
          performedBy: 'IT Manager',
          performedDate: '2024-11-01',
          notes: 'Migrated to cloud services - hardware no longer needed'
        },
        {
          id: '14',
          assetId: '6',
          action: 'location_change',
          oldLocation: 'Server Room',
          newLocation: 'Storage',
          performedBy: 'IT Support',
          performedDate: '2024-11-05',
          notes: 'Moved to storage for disposal'
        }
      ]
    },
    {
      id: '7',
      name: 'Logitech Wireless Mouse',
      category: 'Electronics',
      status: 'lost',
      location: 'Unknown',
      purchaseDate: '2023-08-15',
      value: 5500,
      depreciationRate: 20,
      assignedTo: 'Saman Perera',
      description: 'Wireless mouse - reported missing',
      logs: [
        {
          id: '15',
          assetId: '7',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2023-08-15',
          notes: 'Computer peripherals purchase'
        },
        {
          id: '16',
          assetId: '7',
          action: 'assigned',
          assignedTo: 'Saman Perera',
          performedBy: 'IT Support',
          performedDate: '2023-08-20',
          notes: 'Assigned to employee workstation'
        },
        {
          id: '17',
          assetId: '7',
          action: 'status_change',
          oldStatus: 'active',
          newStatus: 'lost',
          performedBy: 'Admin',
          performedDate: '2024-11-15',
          notes: 'Employee reported item missing - unable to locate'
        }
      ]
    },
    {
      id: '8',
      name: 'Samsung Monitor 27"',
      category: 'Electronics',
      status: 'lost',
      location: 'Unknown',
      purchaseDate: '2023-05-10',
      value: 65000,
      depreciationRate: 20,
      description: 'Monitor lost during office relocation',
      logs: [
        {
          id: '18',
          assetId: '8',
          action: 'created',
          performedBy: 'Admin',
          performedDate: '2023-05-10',
          notes: 'Monitor for new workstation'
        },
        {
          id: '19',
          assetId: '8',
          action: 'status_change',
          oldStatus: 'active',
          newStatus: 'lost',
          performedBy: 'Facility Manager',
          performedDate: '2024-10-20',
          notes: 'Lost during office relocation - not found in inventory check'
        }
      ]
    }
  ]);

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Head Office',
      code: 'HO-001',
      address: '123 Main Street, Colombo 01',
      contactEmail: 'headoffice@company.lk',
      contactPhone: '+94 11 234 5678',
      createdDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Kandy Branch',
      code: 'KB-002',
      address: '456 Peradeniya Road, Kandy',
      contactEmail: 'kandy@company.lk',
      contactPhone: '+94 81 234 5678',
      createdDate: '2024-02-15'
    }
  ]);

  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([
    {
      id: '1',
      name: 'Kamal Perera',
      email: 'kamal@company.lk',
      role: 'admin',
      organizationId: '1',
      permissions: ['all'],
      createdDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Nimal Silva',
      email: 'nimal@company.lk',
      role: 'sub-admin',
      organizationId: '2',
      permissions: ['view_assets', 'add_assets', 'edit_assets'],
      createdDate: '2024-02-20'
    }
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      employeeId: 'E001',
      name: 'Saman Perera',
      email: 'saman@company.lk',
      phone: '+94 77 123 4567',
      position: 'Software Engineer',
      department: 'IT',
      organizationId: '1',
      joinDate: '2024-01-01',
      salary: 50000,
      status: 'active',
      address: '123 Main Street, Colombo 01',
      emergencyContact: 'John Doe',
      emergencyContactPhone: '+94 77 765 4321'
    },
    {
      id: '2',
      employeeId: 'E002',
      name: 'Amal Silva',
      email: 'amal@company.lk',
      phone: '+94 77 234 5678',
      position: 'Project Manager',
      department: 'IT',
      organizationId: '2',
      joinDate: '2024-02-20',
      salary: 60000,
      status: 'active',
      address: '456 Peradeniya Road, Kandy',
      emergencyContact: 'Jane Smith',
      emergencyContactPhone: '+94 77 876 5432'
    }
  ]);

  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([
    {
      id: '1',
      employeeId: '1',
      assetName: 'iPad Pro 12.9"',
      category: 'Electronics',
      quantity: 1,
      reason: 'Need for presentations and client meetings',
      priority: 'high',
      status: 'pending',
      requestDate: '2024-12-10'
    },
    {
      id: '2',
      employeeId: '2',
      assetName: 'Standing Desk',
      category: 'Furniture',
      quantity: 1,
      reason: 'Health and ergonomic improvements',
      priority: 'medium',
      status: 'approved',
      requestDate: '2024-12-08'
    }
  ]);

  const handleAddAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset = {
      ...asset,
      id: Date.now().toString()
    };
    setAssets([...assets, newAsset]);
    setShowAssetModal(false);
    setEditingAsset(null);
  };

  const handleUpdateAsset = (asset: Asset) => {
    setAssets(assets.map(a => a.id === asset.id ? asset : a));
    setEditingAsset(null);
    setShowAssetModal(false);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setCurrentView('add-asset');
  };

  const handleReassignAsset = (assetId: string, newEmployeeName: string | undefined, oldEmployeeName: string | undefined) => {
    setAssets(assets.map(asset => {
      if (asset.id === assetId) {
        const updatedAsset = {
          ...asset,
          assignedTo: newEmployeeName,
          logs: [
            ...(asset.logs || []),
            {
              id: Date.now().toString(),
              assetId: asset.id,
              action: newEmployeeName ? 'assigned' : 'unassigned',
              assignedTo: newEmployeeName,
              assignedFrom: oldEmployeeName,
              performedBy: 'Admin',
              performedDate: new Date().toISOString(),
              notes: newEmployeeName 
                ? `Asset reassigned from ${oldEmployeeName || 'unassigned'} to ${newEmployeeName}`
                : `Asset unassigned from ${oldEmployeeName}`
            } as AssetLog
          ]
        };
        // Update the editing asset if it's the one being reassigned
        setEditingAsset(updatedAsset);
        return updatedAsset;
      }
      return asset;
    }));
  };

  const handleAddOrganization = (org: Omit<Organization, 'id'>, admin?: Omit<SubAdmin, 'id' | 'organizationId' | 'createdDate'>) => {
    const newOrg = {
      ...org,
      id: Date.now().toString()
    };
    setOrganizations([...organizations, newOrg]);
    
    // Create admin if provided
    if (admin) {
      const newAdmin = {
        ...admin,
        id: (Date.now() + 1).toString(),
        organizationId: newOrg.id,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setSubAdmins([...subAdmins, newAdmin]);
    }
    
    setShowOrganizationModal(false);
    setEditingOrganization(null);
  };

  const handleUpdateOrganization = (org: Organization, admin?: Omit<SubAdmin, 'id' | 'organizationId' | 'createdDate'>) => {
    setOrganizations(organizations.map(o => o.id === org.id ? org : o));
    setEditingOrganization(null);
    if (selectedOrganization && selectedOrganization.id === org.id) {
      setSelectedOrganization(org);
    }
    setShowOrganizationModal(false);
  };

  const handleDeleteOrganization = (id: string) => {
    setOrganizations(organizations.filter(o => o.id !== id));
  };

  const handleEditOrganization = (org: Organization) => {
    setEditingOrganization(org);
    setCurrentView('add-organization');
  };

  const handleAddSubAdmin = (admin: Omit<SubAdmin, 'id'>) => {
    const newAdmin = {
      ...admin,
      id: Date.now().toString()
    };
    setSubAdmins([...subAdmins, newAdmin]);
  };

  const handleUpdateSubAdmin = (admin: SubAdmin) => {
    setSubAdmins(subAdmins.map(a => a.id === admin.id ? admin : a));
  };

  const handleDeleteSubAdmin = (id: string) => {
    setSubAdmins(subAdmins.filter(a => a.id !== id));
  };

  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString()
    };
    setEmployees([...employees, newEmployee]);
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  const handleUpdateEmployee = (employee: Employee) => {
    setEmployees(employees.map(e => e.id === employee.id ? employee : e));
    setEditingEmployee(null);
    setShowEmployeeModal(false);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setCurrentView('add-employee');
  };

  const handleViewEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentView('employee-detail');
  };

  const handleAddAssetRequest = (request: Omit<AssetRequest, 'id'>) => {
    const newRequest = {
      ...request,
      id: Date.now().toString()
    };
    setAssetRequests([...assetRequests, newRequest]);
  };

  const handleUpdateAssetRequest = (request: AssetRequest) => {
    setAssetRequests(assetRequests.map(r => r.id === request.id ? request : r));
  };

  // Get assets assigned to an employee
  const getEmployeeAssets = (employeeName: string) => {
    return assets.filter(asset => asset.assignedTo === employeeName);
  };

  return (
    <MainLayout>
      <Sidebar 
        title="Asset Manager"
      >
        <NavButton
          onClick={() => {
            setCurrentView('dashboard');
            setEditingAsset(null);
          }}
          isActive={currentView === 'dashboard'}
          icon={<LayoutDashboard className="w-5 h-5" />}
        >
          Dashboard
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('assets');
            setEditingAsset(null);
          }}
          isActive={currentView === 'assets'}
          icon={<Package className="w-5 h-5" />}
        >
          All Assets
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('organizations');
            setEditingAsset(null);
          }}
          isActive={currentView === 'organizations' || currentView === 'organization-detail'}
          icon={<Building2 className="w-5 h-5" />}
        >
          Organizations
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('employees');
            setEditingAsset(null);
          }}
          isActive={currentView === 'employees' || currentView === 'employee-detail'}
          icon={<UserCircle className="w-5 h-5" />}
        >
          Employees
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('organization-admins');
            setEditingAsset(null);
          }}
          isActive={currentView === 'organization-admins'}
          icon={<Building2 className="w-5 h-5" />}
        >
          Organization Admins
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('asset-requests');
            setEditingAsset(null);
          }}
          isActive={currentView === 'asset-requests'}
          icon={<FileText className="w-5 h-5" />}
        >
          Asset Requests
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('reports');
            setEditingAsset(null);
          }}
          isActive={currentView === 'reports'}
          icon={<BarChart3 className="w-5 h-5" />}
        >
          Reports
        </NavButton>
        
        <NavButton
          onClick={() => {
            setCurrentView('settings');
            setEditingAsset(null);
          }}
          isActive={currentView === 'settings'}
          icon={<SettingsIcon className="w-5 h-5" />}
        >
          Settings
        </NavButton>
      </Sidebar>

      <div className="ml-64 p-8">
        {currentView === 'dashboard' && <Dashboard assets={assets} />}
        {currentView === 'assets' && (
          <AssetList 
            assets={assets}
            organizations={organizations}
            onEdit={handleEdit}
            onDelete={handleDeleteAsset}
            onAddNew={() => {
              setEditingAsset(null);
              setShowAssetModal(true);
            }}
            onViewDetails={(asset) => {
              setEditingAsset(asset);
              setCurrentView('asset-detail');
            }}
          />
        )}
        {currentView === 'add-asset' && (
          <AssetForm 
            onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
            initialData={editingAsset}
            organizations={organizations}
            onCancel={() => {
              setCurrentView('assets');
              setEditingAsset(null);
            }}
          />
        )}
        {currentView === 'asset-detail' && editingAsset && (
          <AssetDetail 
            asset={editingAsset}
            organization={organizations.find(o => o.id === editingAsset.organizationId)}
            assignedEmployee={employees.find(e => e.name === editingAsset.assignedTo)}
            employees={employees}
            onBack={() => {
              setCurrentView('assets');
              setEditingAsset(null);
            }}
            onEdit={() => {
              setCurrentView('add-asset');
            }}
            onReassign={handleReassignAsset}
          />
        )}
        {currentView === 'organizations' && (
          <OrganizationList 
            organizations={organizations}
            onEdit={handleEditOrganization}
            onDelete={handleDeleteOrganization}
            onAddNew={() => {
              setEditingOrganization(null);
              setShowOrganizationModal(true);
            }}
            onViewDetails={(org) => {
              setSelectedOrganization(org);
              setCurrentView('organization-detail');
            }}
          />
        )}
        {currentView === 'add-organization' && (
          <OrganizationForm 
            onSubmit={editingOrganization ? handleUpdateOrganization : handleAddOrganization}
            initialData={editingOrganization}
            onCancel={() => {
              if (editingOrganization && selectedOrganization) {
                setCurrentView('organization-detail');
              } else {
                setCurrentView('organizations');
              }
              setEditingOrganization(null);
            }}
          />
        )}
        {currentView === 'organization-detail' && selectedOrganization && (
          <OrganizationDetail 
            organization={selectedOrganization}
            subAdmins={subAdmins}
            onBack={() => {
              setCurrentView('organizations');
              setSelectedOrganization(null);
            }}
            onAddAdmin={handleAddSubAdmin}
            onUpdateAdmin={handleUpdateSubAdmin}
            onDeleteAdmin={handleDeleteSubAdmin}
            onEditOrganization={() => {
              setEditingOrganization(selectedOrganization);
              setCurrentView('add-organization');
            }}
          />
        )}
        {currentView === 'employees' && (
          <EmployeeList 
            employees={employees}
            organizations={organizations}
            onViewDetails={handleViewEmployeeDetails}
          />
        )}

        {currentView === 'employee-detail' && selectedEmployee && (
          <EmployeeDetail 
            employee={selectedEmployee}
            organization={organizations.find(o => o.id === selectedEmployee.organizationId)}
            assignedAssets={getEmployeeAssets(selectedEmployee.name)}
            onBack={() => {
              setCurrentView('employees');
              setSelectedEmployee(null);
            }}
          />
        )}
        {currentView === 'asset-requests' && (
          <AssetRequests 
            employees={employees}
            organizations={organizations}
            assetRequests={assetRequests}
            onAddRequest={handleAddAssetRequest}
            onUpdateRequest={handleUpdateAssetRequest}
          />
        )}
        {currentView === 'organization-admins' && (
          <OrganizationAdminList 
            subAdmins={subAdmins}
            organizations={organizations}
            onAdd={handleAddSubAdmin}
            onUpdate={handleUpdateSubAdmin}
            onDelete={handleDeleteSubAdmin}
          />
        )}
        {currentView === 'reports' && <Reports assets={assets} organizations={organizations} />}
        {currentView === 'settings' && <Settings />}
      </div>

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-200">
            <AssetForm 
              onSubmit={editingAsset ? handleUpdateAsset : handleAddAsset}
              initialData={editingAsset}
              organizations={organizations}
              onCancel={() => {
                setShowAssetModal(false);
                setEditingAsset(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Organization Modal */}
      {showOrganizationModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-200">
            <OrganizationForm 
              onSubmit={editingOrganization ? handleUpdateOrganization : handleAddOrganization}
              initialData={editingOrganization}
              onCancel={() => {
                setShowOrganizationModal(false);
                setEditingOrganization(null);
              }}
            />
          </div>
        </div>
      )}


    </MainLayout>
  );
}