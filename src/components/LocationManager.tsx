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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState('#AE040F');
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

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 bg-white rounded-lg border p-4">
          <h3 className="text-lg text-black font-semibold mb-4">Buildings</h3>
          {buildings.length === 0 ? (
            <p className="text-gray-500 text-sm">No buildings</p>
          ) : (
            <div className="space-y-2">
              {buildings.map((building) => (
                <div key={building._id} className={`p-3 rounded ${selectedBuilding?._id === building._id ? 'bg-red-50 border-red-500 border-2' : 'bg-gray-50 border'}`}>
                  <div className="flex items-center justify-between">
                    <div onClick={() => setSelectedBuilding(building)} className="flex-1 cursor-pointer">
                      <div className="text-black font-medium">{building.name}</div>
                      <div className="text-xs text-gray-500">{building.code}</div>
                    </div>
                    <button onClick={() => deleteBuilding(building._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black font-semibold">Floors</h3>
            {selectedBuilding && (
              <button onClick={() => setShowFloorForm(true)} className="p-1 bg-red-100 text-red-700 rounded">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {!selectedBuilding ? (
            <p className="text-gray-500 text-sm">Select a building</p>
          ) : selectedBuilding.floors?.length === 0 ? (
            <p className="text-gray-500 text-sm">No floors</p>
          ) : (
            <div className="space-y-2">
              {selectedBuilding.floors?.map((floor) => (
                <div key={floor._id} className={`p-3 rounded ${selectedFloor?._id === floor._id ? 'bg-red-50 border-red-500 border-2' : 'bg-gray-50 border'}`}>
                  <div className="flex items-center justify-between">
                    <div onClick={() => initializeGrid(floor)} className="flex-1 cursor-pointer">
                      <div className="text-black font-medium">{floor.name}</div>
                      <div className="text-xs text-gray-500">{floor.code}</div>
                    </div>
                    <button onClick={() => deleteFloor(floor._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
            <h3 className="text-lg text-black font-semibold">Floor Plan</h3>
            {selectedFloor && (
              <div className="flex gap-2">
                <button onClick={() => { setPlannerFloorId(selectedFloor._id); setShowFloorPlanner(true); }} className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Layout className="w-4 h-4" />
                  Floor Planner
                </button>
              </div>
            )}
          </div>
          {!selectedFloor ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>Select a floor</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Color:</span>
                {['#AE040F', '#10B981', '#F59E0B', '#EF4444', '#640F07', '#BEBEBE'].map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded border-2 ${selectedColor === color ? 'border-black' : 'border-gray-300'}`} style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="relative inline-block border-2 border-gray-300 bg-gray-100">
                {selectedFloor.floorPlanImage && (
                  <img src={selectedFloor.floorPlanImage} alt="Floor plan" className="absolute inset-0 w-full h-full object-cover opacity-60" style={{ pointerEvents: 'none' }} />
                )}
                <div className="relative">
                  {selectedFloor.grid?.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((cell, x) => (
                        <div
                          key={`${x}-${y}`}
                          className="w-3 h-3 border border-gray-200 cursor-pointer hover:opacity-70"
                          style={{ backgroundColor: cell.color || 'transparent' }}
                          onClick={() => {
                            const newGrid = [...selectedFloor.grid];
                            newGrid[y][x] = cell.color ? { x, y } : { x, y, color: selectedColor };
                            setSelectedFloor({ ...selectedFloor, grid: newGrid });
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
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
