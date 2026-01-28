"use client";

import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/admin/Dashboard';
import { AssetList } from '@/components/admin/AssetList';
import { AssetForm } from '@/components/AssetForm';
import { AssetDetail } from '@/components/AssetDetail';
import { OrganizationList } from '@/components/OrganizationList';
import { OrganizationForm } from '@/components/OrganizationForm';
import { OrganizationDetail } from '@/components/OrganizationDetail';
import { AssetRequests, AssetRequest } from '@/components/AssetRequests';
import { Reports } from '@/components/admin/Reports';
import { Settings } from '@/components/admin/Settings';
import { OrganizationAdminList } from '@/components/OrganizationAdminList';
import { Sidebar } from '@/components/shared/Sidebar';
import { NavButton } from '@/components/shared/NavButton';
import { MainLayout } from '@/components/shared/MainLayout';
import { LayoutDashboard, Package, Building2, BarChart3, Settings as SettingsIcon, FileText } from 'lucide-react';

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

type View = 'dashboard' | 'assets' | 'add-asset' | 'asset-detail' | 'organizations' | 'add-organization' | 'organization-detail' | 'reports' | 'settings' | 'asset-requests' | 'organization-admins';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>([]);

  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);

  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);

  // Fetch all data from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assets (returns paginated response with data.data structure)
        const assetsResponse = await fetch('/api/assets');
        const assetsResult = await assetsResponse.json();
        
        if (assetsResult.success && assetsResult.data) {
          const assetsData = assetsResult.data.data || assetsResult.data;
          const dbAssets = (Array.isArray(assetsData) ? assetsData : []).map((asset: { 
            _id: string; 
            name: string; 
            category: string; 
            status: string; 
            location?: string; 
            purchaseDate: string; 
            value?: number;
            currentValue?: number;
            purchasePrice?: number;
            depreciationRate?: number;
            usefulLife?: number;
            assignedTo?: string | { name: string }; 
            description?: string;
            notes?: string;
            organizationId?: string | { _id: string }; 
            serialNumber?: string;
            model?: string;
            manufacturer?: string;
            condition?: string;
            warrantyExpiry?: string;
            [key: string]: unknown 
          }) => ({
            id: asset._id,
            name: asset.name,
            category: asset.category,
            status: (asset.status === 'available' ? 'active' : asset.status) as 'active' | 'maintenance' | 'retired' | 'lost',
            location: asset.location || '',
            purchaseDate: asset.purchaseDate,
            value: (asset.currentValue || asset.purchasePrice || asset.value || 0) as number,
            depreciationRate: asset.usefulLife ? Math.floor(100 / (asset.usefulLife as number)) : (asset.depreciationRate || 10),
            assignedTo: typeof asset.assignedTo === 'object' && asset.assignedTo ? asset.assignedTo.name : (asset.assignedTo || ''),
            description: asset.description || asset.notes || '',
            organizationId: typeof asset.organizationId === 'object' && asset.organizationId ? asset.organizationId._id : (asset.organizationId || ''),
            serialNumber: asset.serialNumber || '',
            model: asset.model || '',
            brand: asset.manufacturer || '',
            condition: asset.condition || 'good',
            warrantyEndDate: asset.warrantyExpiry || '',
            logs: []
          }));
          
          setAssets(dbAssets);
          console.log('Assets loaded:', dbAssets.length);
        } else {
          console.warn('Assets fetch failed or returned empty');
        }

        // Fetch organizations (returns direct array)
        const orgsResponse = await fetch('/api/organizations');
        const orgsResult = await orgsResponse.json();
        
        if (orgsResult.success && Array.isArray(orgsResult.data)) {
          const dbOrgs = orgsResult.data.map((org: { _id: string; name: string; code?: string; address: string; email: string; phone: string; createdAt: string }) => ({
            id: org._id,
            name: org.name,
            code: org.code || '',
            address: org.address,
            contactEmail: org.email,
            contactPhone: org.phone,
            createdDate: org.createdAt
          }));
          
          setOrganizations(dbOrgs);
          console.log('Organizations loaded:', dbOrgs.length);
        } else {
          console.warn('Organizations fetch failed or returned empty');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddAsset = async (asset: Omit<Asset, 'id'>) => {
    try {
      // Map the form data to match the API schema
      const assetData = {
        assetTag: `AST-${Date.now()}`, // Generate unique asset tag
        name: asset.name,
        category: asset.category,
        description: asset.description || '',
        serialNumber: asset.serialNumber || '',
        model: asset.model || '',
        manufacturer: asset.brand || '',
        purchaseDate: asset.purchaseDate,
        purchasePrice: asset.value,
        currentValue: asset.value,
        depreciationMethod: 'straight-line' as const,
        usefulLife: asset.depreciationRate ? Math.floor(100 / asset.depreciationRate) : 5,
        status: asset.status === 'active' ? 'available' : asset.status,
        condition: (asset.condition || 'good').toLowerCase(),
        location: asset.location,
        organizationId: asset.organizationId || '678816d3bf3a9d33c8a6f2b1', // Valid ObjectId format
        warrantyExpiry: asset.warrantyEndDate || null,
        notes: asset.description || ''
      };

      console.log('Sending asset data:', assetData);

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        // Add to local state with the returned data
        const newAsset = {
          ...asset,
          id: result.data._id || Date.now().toString()
        };
        setAssets([...assets, newAsset]);
        setShowAssetModal(false);
        setEditingAsset(null);
        alert('Asset created successfully and saved to database!');
      } else {
        console.error('Failed to create asset:', result.error);
        alert(`Failed to create asset: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Error creating asset. Check console for details.');
    }
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

  const handleUpdateOrganization = (org: Organization) => {
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
            assignedEmployee={undefined}
            employees={[]}
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
        {currentView === 'asset-requests' && (
          <AssetRequests 
            employees={[]}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp border border-gray-500">
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