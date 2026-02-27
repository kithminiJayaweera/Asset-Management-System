'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Plus, X, Layers, Trash2, Save, Upload, Layout } from 'lucide-react';
import FloorPlanner from './FloorPlanner';

interface Building {
  _id: string;
  name: string;
  type: 'building';
  code: string;
  organizationId: string;
  floors?: Floor[];
}

interface Floor {
  _id: string;
  name: string;
  type: 'floor';
  code: string;
  parentId: string;
  floorPlanImage?: string;
  grid: GridCell[][];
  gridData?: any;
  metadata?: any;
  floorPlanLayout?: any[];
}

interface GridCell {
  x: number;
  y: number;
  assetId?: string;
  assetName?: string;
  color?: string;
}

export function LocationManager() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [buildingForm, setBuildingForm] = useState({ name: '', code: '', organizationId: '' });
  const [floorForm, setFloorForm] = useState({ name: '', code: '' });
  const [showFloorPlanner, setShowFloorPlanner] = useState(false);
  const [plannerFloorId, setPlannerFloorId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const orgsRes = await fetch('/api/organizations');
      const orgsData = await orgsRes.json();
      if (orgsData.success) setOrganizations(orgsData.data);

      const buildingsRes = await fetch('/api/locations');
      const buildingsData = await buildingsRes.json();
      if (buildingsData.success) {
        const buildingsList = buildingsData.data.filter((loc: any) => loc.type === 'building');
        const buildingsWithFloors = await Promise.all(
          buildingsList.map(async (building: any) => {
            const floorsRes = await fetch(`/api/locations?parent=${building._id}`);
            const floorsData = await floorsRes.json();
            return { ...building, floors: floorsData.success ? floorsData.data : [] };
          })
        );
        setBuildings(buildingsWithFloors);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildingForm, type: 'building', parentId: null })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Building created!');
        setShowBuildingForm(false);
        setBuildingForm({ name: '', code: '', organizationId: '' });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to create building');
    }
  };

  const createFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...floorForm,
          type: 'floor',
          parentId: selectedBuilding._id,
          organizationId: selectedBuilding.organizationId
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Floor created!');
        setShowFloorForm(false);
        setFloorForm({ name: '', code: '' });
        await fetchData();
      }
    } catch (error) {
      toast.error('Failed to create floor');
    }
  };

  const deleteBuilding = async (buildingId: string) => {
    if (!confirm('Delete building and all floors?')) return;
    try {
      const response = await fetch(`/api/locations/${buildingId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Building deleted!');
        setSelectedBuilding(null);
        setSelectedFloor(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const deleteFloor = async (floorId: string) => {
    if (!confirm('Delete floor?')) return;
    try {
      const response = await fetch(`/api/locations/${floorId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Floor deleted!');
        setSelectedFloor(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const initializeGrid = async (floor: Floor) => {
    try {
      const res = await fetch(`/api/locations/${floor._id}/layout`);
      const data = await res.json();
      console.log('Floor layout loaded:', data);
      console.log('Layout items count:', data.layout?.length || 0);
      setSelectedFloor({ ...floor, floorPlanLayout: data.layout || [] });
    } catch (error) {
      console.error('Failed to load floor layout:', error);
      setSelectedFloor(floor);
    }
  };



  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-black mb-2">Building & Floor Plans</h2>
          <p className="text-gray-700">Upload floor plans and mark asset locations</p>
        </div>
        <button onClick={() => setShowBuildingForm(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#AE040F' }}>
          <Plus className="w-4 h-4" />
          Add Building
        </button>
      </div>

      <div className="space-y-6">
        {/* Filters Row */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-2">Building</label>
              <select 
                value={selectedBuilding?._id || ''} 
                onChange={(e) => {
                  const building = buildings.find(b => b._id === e.target.value);
                  setSelectedBuilding(building || null);
                  setSelectedFloor(null);
                }}
                className="w-full px-3 py-2 border rounded-lg text-black"
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>{building.name} ({building.code})</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-2">Floor</label>
              <select 
                value={selectedFloor?._id || ''} 
                onChange={(e) => {
                  const floor = selectedBuilding?.floors?.find(f => f._id === e.target.value);
                  if (floor) initializeGrid(floor);
                }}
                className="w-full px-3 py-2 border rounded-lg text-black"
                disabled={!selectedBuilding}
              >
                <option value="">Select Floor</option>
                {selectedBuilding?.floors?.map((floor) => (
                  <option key={floor._id} value={floor._id}>{floor.name} ({floor.code})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <button onClick={() => setShowBuildingForm(true)} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#AE040F' }}>
                <Plus className="w-4 h-4" />
              </button>
              {selectedBuilding && (
                <button onClick={() => setShowFloorForm(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <Layers className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floor Plan Display */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black font-semibold">Floor Plan</h3>
            {selectedFloor && (
              <button onClick={() => { setPlannerFloorId(selectedFloor._id); setShowFloorPlanner(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Layout className="w-4 h-4" />
                Floor Planner
              </button>
            )}
          </div>
          {!selectedFloor ? (
            <div className="flex items-center justify-center h-[600px] text-gray-500">
              <p>Select a building and floor to view plan</p>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="relative inline-block border-2 border-gray-300 bg-[#12151f]" style={{ width: 800, height: 600 }}>
                {console.log('Rendering floor plan, layout:', selectedFloor.floorPlanLayout)}
                {selectedFloor.floorPlanLayout && selectedFloor.floorPlanLayout.length > 0 ? (
                  selectedFloor.floorPlanLayout.map((item: any, idx: number) => (
                    <div
                      key={idx}
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
                      <span className="text-lg" style={{ fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif' }}>{item.icon}</span>
                      <span className="text-[9px] text-white/70">{item.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                    No floor plan layout. Click "Floor Planner" to design.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showBuildingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Building</h3>
              <button onClick={() => setShowBuildingForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createBuilding} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input type="text" value={buildingForm.name} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-black" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Code</label>
                <input type="text" value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-black" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company</label>
                <select value={buildingForm.organizationId} onChange={(e) => setBuildingForm({ ...buildingForm, organizationId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-black" required>
                  <option value="">Select</option>
                  {organizations.map((org) => (<option key={org._id} value={org._id}>{org.name}</option>))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBuildingForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white rounded-lg" style={{ backgroundColor: '#AE040F' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFloorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Floor</h3>
              <button onClick={() => setShowFloorForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createFloor} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input type="text" value={floorForm.name} onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-black" required />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Code</label>
                <input type="text" value={floorForm.code} onChange={(e) => setFloorForm({ ...floorForm, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-black" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowFloorForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white rounded-lg" style={{ backgroundColor: '#AE040F' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

{showFloorPlanner && plannerFloorId && (
        <FloorPlanner 
          locationId={plannerFloorId} 
          onClose={() => {
            setShowFloorPlanner(false);
            if (selectedFloor) {
              initializeGrid(selectedFloor);
            }
          }} 
        />
      )}
    </div>
  );
}
