'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Plus, X, Trash2, Package } from 'lucide-react';

interface Organization {
  _id: string;
  name: string;
  code: string;
}

interface Area {
  _id: string;
  name: string;
  code: string;
  type: string;
  organizationId: string;
}

interface Asset {
  _id: string;
  assetTag: string;
  name: string;
  category: string;
  organizationId: string;
  roomId?: string;
  floorPosition?: { x: number; y: number; rotation: number; icon: string; color: string };
}

export function AreaManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [unmappedAssets, setUnmappedAssets] = useState<Asset[]>([]);
  const [floorLayout, setFloorLayout] = useState<any[]>([]);
  
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: '', code: '', type: 'lab' });
  const [loading, setLoading] = useState(true);

  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchAreas(selectedOrg);
      fetchAssets(selectedOrg);
    } else {
      setAreas([]);
      setAssets([]);
      setUnmappedAssets([]);
    }
    setSelectedArea(null);
  }, [selectedOrg]);

  useEffect(() => {
    if (selectedArea) {
      loadFloorLayout(selectedArea._id);
    } else {
      setFloorLayout([]);
    }
  }, [selectedArea]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (data.success) setOrganizations(data.data);
    } catch (error) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (orgId: string) => {
    try {
      const res = await fetch(`/api/locations?organizationId=${orgId}&type=room`);
      const data = await res.json();
      if (data.success) setAreas(data.data);
    } catch (error) {
      toast.error('Failed to load areas');
    }
  };

  const fetchAssets = async (orgId: string) => {
    try {
      const res = await fetch(`/api/assets?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success) {
        const all = data.data;
        setAssets(all.filter((a: Asset) => a.roomId));
        setUnmappedAssets(all.filter((a: Asset) => !a.roomId));
      }
    } catch (error) {
      toast.error('Failed to load assets');
    }
  };

  const loadFloorLayout = async (areaId: string) => {
    try {
      console.log('Loading floor layout for area:', areaId);
      const res = await fetch(`/api/locations/${areaId}/layout`);
      const data = await res.json();
      console.log('Floor layout response:', data);
      if (data.layout && Array.isArray(data.layout)) {
        setFloorLayout(data.layout);
        console.log('Floor layout loaded:', data.layout.length, 'items');
      } else {
        setFloorLayout([]);
        console.log('No floor layout found');
      }
    } catch (error) {
      console.error('Failed to load floor layout:', error);
      setFloorLayout([]);
    }
  };

  const createArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    
    const newArea = {
      ...areaForm,
      type: 'room',
      organizationId: selectedOrg,
      parentId: null
    };

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArea)
      });
      if (res.ok) {
        toast.success('Area created!');
        setShowAreaForm(false);
        setAreaForm({ name: '', code: '', type: 'lab' });
        fetchAreas(selectedOrg);
      }
    } catch (error) {
      toast.error('Failed to create area');
    }
  };

  const deleteArea = async (areaId: string) => {
    if (!confirm('Delete this area?')) return;
    try {
      const res = await fetch(`/api/locations/${areaId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Area deleted!');
        setSelectedArea(null);
        fetchAreas(selectedOrg);
      }
    } catch (error) {
      toast.error('Failed to delete area');
    }
  };

  const handleAssetDragStart = (asset: Asset, e: React.MouseEvent) => {
    if (!selectedArea) {
      toast.error('Please select an area first');
      return;
    }
    setDraggedAsset(asset);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedAsset) return;
    const canvas = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvas.left - dragOffset.x;
    const y = e.clientY - canvas.top - dragOffset.y;
    
    const el = document.getElementById(`dragging-asset`);
    if (el) {
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }
  };

  const handleCanvasDrop = async (e: React.MouseEvent) => {
    if (!draggedAsset || !selectedArea) return;
    
    const canvas = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - canvas.left - dragOffset.x, 740));
    const y = Math.max(0, Math.min(e.clientY - canvas.top - dragOffset.y, 540));

    try {
      const res = await fetch(`/api/assets/${draggedAsset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedArea._id,
          floorPosition: { x, y, rotation: 0, icon: '📦', color: '#FBBF24' }
        })
      });

      if (res.ok) {
        toast.success('Asset placed!');
        fetchAssets(selectedOrg);
      }
    } catch (error) {
      toast.error('Failed to place asset');
    }
    
    setDraggedAsset(null);
  };

  const removeAssetFromArea = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: null, floorPosition: null })
      });
      if (res.ok) {
        toast.success('Asset removed!');
        fetchAssets(selectedOrg);
      }
    } catch (error) {
      toast.error('Failed to remove asset');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const areaAssets = selectedArea ? assets.filter(a => a.roomId === selectedArea._id) : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Area & Asset Management</h2>
          <p className="text-gray-600">Manage areas and place assets on floor plans</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="w-4 h-4 inline mr-1" />
          Select Organization
        </label>
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-lg text-black"
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>{org.name}</option>
          ))}
        </select>
      </div>

      {selectedOrg && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Areas</h3>
              <button
                onClick={() => setShowAreaForm(true)}
                className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {areas.length === 0 ? (
              <p className="text-gray-500 text-sm">No areas yet</p>
            ) : (
              <div className="space-y-2">
                {areas.map((area) => (
                  <div
                    key={area._id}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedArea?._id === area._id
                        ? 'bg-purple-100 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedArea(area)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-black">{area.name}</div>
                        <div className="text-xs text-gray-500">{area.code}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteArea(area._id); }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-6 bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">
                {selectedArea ? selectedArea.name : 'Select an Area'}
              </h3>
              {selectedArea && (
                <button
                  onClick={() => window.open('/room-floor-planner.html', '_blank', 'width=1400,height=900')}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Open Floor Planner
                </button>
              )}
            </div>
            {!selectedArea ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <p>Select an area to view floor plan</p>
              </div>
            ) : (
              <div
                className="relative border-2 border-gray-300 bg-[#12151f]"
                style={{ width: 800, height: 600 }}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasDrop}
              >
                {/* Debug info */}
                <div className="absolute top-2 left-2 text-xs text-white bg-black/50 p-2 rounded z-50">
                  Floor Items: {floorLayout.length} | Assets: {areaAssets.length}
                </div>
                
                {/* Floor Plan Layout */}
                {floorLayout.length > 0 ? (
                  floorLayout.map((item) => (
                    <div
                      key={item.id}
                      className="absolute rounded flex flex-col items-center justify-center"
                      style={{
                        left: item.x,
                        top: item.y,
                        width: item.w,
                        height: item.h,
                        background: item.color,
                        transform: `rotate(${item.rotation || 0}deg)`,
                        opacity: item.opacity || 1
                      }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[9px] text-white/70">{item.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                    No floor plan layout. Click "Open Floor Planner" to design.
                  </div>
                )}
                
                {areaAssets.map((asset) => {
                  const pos = asset.floorPosition || { x: 0, y: 0 };
                  return (
                    <div
                      key={asset._id}
                      className="absolute rounded p-2 text-xs cursor-move shadow-lg border-2 border-yellow-400"
                      style={{
                        left: pos.x,
                        top: pos.y,
                        width: 60,
                        height: 60,
                        background: asset.floorPosition?.color || '#FBBF24',
                        color: 'white',
                        transform: `rotate(${asset.floorPosition?.rotation || 0}deg)`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg">{asset.floorPosition?.icon || '📦'}</div>
                        <div className="truncate text-[8px]">{asset.name}</div>
                      </div>
                      <button
                        onClick={() => removeAssetFromArea(asset._id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                
                {draggedAsset && (
                  <div
                    id="dragging-asset"
                    className="absolute bg-yellow-400 text-white rounded p-2 text-xs opacity-70 pointer-events-none"
                    style={{ width: 60, height: 60 }}
                  >
                    <div className="text-center">
                      <div className="text-lg">📦</div>
                      <div className="truncate">{draggedAsset.name}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-3 bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-black mb-4">
              <Package className="w-5 h-5 inline mr-2" />
              Available Assets ({unmappedAssets.length})
            </h3>
            {unmappedAssets.length === 0 ? (
              <p className="text-gray-500 text-sm">All assets placed</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {unmappedAssets.map((asset) => (
                  <div
                    key={asset._id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => handleAssetDragStart(asset, e)}
                  >
                    <div className="font-medium text-black text-sm">{asset.name}</div>
                    <div className="text-xs text-gray-500">{asset.assetTag}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showAreaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Area</h3>
              <button onClick={() => setShowAreaForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createArea} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., Computer Lab A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={areaForm.code}
                  onChange={(e) => setAreaForm({ ...areaForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., LAB-A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  value={areaForm.type}
                  onChange={(e) => setAreaForm({ ...areaForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                >
                  <option value="lab">Lab</option>
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="office">Office</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAreaForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
