'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Plus, MapPin, X, Grid3x3, Layers, Trash2, Save } from 'lucide-react';

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
  grid: GridCell[][];
}

interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'desk' | 'chair' | 'wall';
  assetId?: string;
  assetName?: string;
}

export function LocationManager() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    code: '',
    organizationId: ''
  });
  const [floorForm, setFloorForm] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch organizations
      const orgsRes = await fetch('/api/organizations');
      const orgsData = await orgsRes.json();
      if (orgsData.success) setOrganizations(orgsData.data);

      // Fetch buildings
      const buildingsRes = await fetch('/api/locations');
      const buildingsData = await buildingsRes.json();
      if (buildingsData.success) {
        const buildingsList = buildingsData.data.filter((loc: any) => loc.type === 'building');
        const buildingsWithFloors = await Promise.all(
          buildingsList.map(async (building: any) => {
            const floorsRes = await fetch(`/api/locations?parentId=${building._id}`);
            const floorsData = await floorsRes.json();
            const floors = floorsData.success 
              ? floorsData.data.filter((loc: any) => loc.type === 'floor')
              : [];
            return {
              ...building,
              floors
            };
          })
        );
        setBuildings(buildingsWithFloors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        body: JSON.stringify({
          ...buildingForm,
          type: 'building',
          parentId: null
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Building created successfully!');
        setShowBuildingForm(false);
        setBuildingForm({ name: '', code: '', organizationId: '' });
        fetchData();
      } else {
        toast.error(result.error || 'Failed to create building');
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
        toast.success('Floor created successfully!');
        setShowFloorForm(false);
        setFloorForm({ name: '', code: '' });
        await fetchData();
        // Re-select the building to show updated floors
        const updatedBuilding = buildings.find(b => b._id === selectedBuilding._id);
        if (updatedBuilding) {
          setSelectedBuilding(updatedBuilding);
        }
      } else {
        toast.error(result.error || 'Failed to create floor');
      }
    } catch (error) {
      toast.error('Failed to create floor');
    }
  };

  const deleteBuilding = async (buildingId: string) => {
    if (!confirm('Delete this building and all its floors? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/locations/${buildingId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        toast.success('Building and all floors deleted successfully!');
        setSelectedBuilding(null);
        setSelectedFloor(null);
        fetchData();
      } else {
        toast.error(result.error || 'Failed to delete building');
      }
    } catch (error) {
      toast.error('Failed to delete building');
    }
  };

  const deleteFloor = async (floorId: string) => {
    if (!confirm('Delete this floor? This cannot be undone.')) return;
    try {
      const response = await fetch(`/api/locations/${floorId}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        toast.success('Floor deleted!');
        setSelectedFloor(null);
        await fetchData();
        // Re-select the building to show updated floors
        if (selectedBuilding) {
          const updatedBuilding = buildings.find(b => b._id === selectedBuilding._id);
          if (updatedBuilding) {
            setSelectedBuilding(updatedBuilding);
          }
        }
      } else {
        toast.error(result.error || 'Failed to delete floor');
      }
    } catch (error) {
      toast.error('Failed to delete floor');
    }
  };

  const saveGrid = async () => {
    if (!selectedFloor) return;
    try {
      const response = await fetch(`/api/locations/${selectedFloor._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridData: selectedFloor.grid })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Grid layout saved!');
      } else {
        toast.error(result.error || 'Failed to save grid');
      }
    } catch (error) {
      console.error('Error saving grid:', error);
      toast.error('Failed to save grid');
    }
  };

  const initializeGrid = (floor: Floor) => {
    let grid: GridCell[][] = [];
    // Check if floor has gridData property from database
    const savedGrid = (floor as any).gridData;
    if (savedGrid && Array.isArray(savedGrid) && savedGrid.length > 0) {
      grid = savedGrid;
    } else {
      // Initialize empty 10x10 grid
      for (let y = 0; y < 10; y++) {
        const row: GridCell[] = [];
        for (let x = 0; x < 10; x++) {
          row.push({ x, y, type: 'empty' });
        }
        grid.push(row);
      }
    }
    setSelectedFloor({ ...floor, grid });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-black mb-2">Building & Floor Management</h2>
          <p className="text-gray-700">Create buildings, add floors, and place assets in a grid layout</p>
        </div>
        <button
          onClick={() => setShowBuildingForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Building
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Buildings List */}
        <div className="col-span-3 bg-white rounded-lg border p-4">
          <h3 className="text-lg text-black font-semibold mb-4">Buildings</h3>
          {buildings.length === 0 ? (
            <p className="text-gray-500 text-sm">No buildings yet</p>
          ) : (
            <div className="space-y-2">
              {buildings.map((building) => (
                <div
                  key={building._id}
                  className={`p-3 rounded transition ${
                    selectedBuilding?._id === building._id
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => setSelectedBuilding(building)}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-black font-medium">{building.name}</div>
                        <div className="text-xs text-gray-500">{building.code}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBuilding(building._id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete building"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floors List */}
        <div className="col-span-3 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black font-semibold">Floors</h3>
            {selectedBuilding && (
              <button
                onClick={() => setShowFloorForm(true)}
                className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {!selectedBuilding ? (
            <p className="text-gray-500 text-sm">Select a building</p>
          ) : selectedBuilding.floors?.length === 0 ? (
            <p className="text-gray-500 text-sm">No floors yet</p>
          ) : (
            <div className="space-y-2">
              {selectedBuilding.floors?.map((floor) => (
                <div
                  key={floor._id}
                  className={`p-3 rounded transition ${
                    selectedFloor?._id === floor._id
                      ? 'bg-purple-100 border-purple-500 border-2'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => initializeGrid(floor)}
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-black font-medium">{floor.name}</div>
                        <div className="text-xs text-gray-500">{floor.code}</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFloor(floor._id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete floor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grid Visualization */}
        <div className="col-span-6 bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-black font-semibold">Floor Layout (10x10 Grid)</h3>
            {selectedFloor && (
              <button
                onClick={saveGrid}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </button>
            )}
          </div>
          {!selectedFloor ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <Grid3x3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Select a floor to view layout</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 border"></div>
                  <span className="text-gray-700">Empty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-200 border"></div>
                  <span className="text-gray-700">Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-200 border"></div>
                  <span className="text-gray-700">Chair</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-600 border"></div>
                  <span className="text-gray-700">Wall</span>
                </div>
              </div>
              <div className="inline-block border-2 border-gray-300 p-2 bg-gray-50">
                {selectedFloor.grid?.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-10 h-10 border border-gray-300 cursor-pointer hover:opacity-80 ${
                          cell.type === 'empty' ? 'bg-gray-200' :
                          cell.type === 'desk' ? 'bg-blue-200' :
                          cell.type === 'chair' ? 'bg-green-200' :
                          'bg-gray-600'
                        }`}
                        onClick={() => {
                          const newGrid = [...selectedFloor.grid];
                          const currentType = newGrid[y][x].type;
                          newGrid[y][x].type = 
                            currentType === 'empty' ? 'desk' :
                            currentType === 'desk' ? 'chair' :
                            currentType === 'chair' ? 'wall' : 'empty';
                          setSelectedFloor({ ...selectedFloor, grid: newGrid });
                        }}
                        title={`(${x}, ${y}) - ${cell.type}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">Click cells to cycle: Empty → Desk → Chair → Wall</p>
            </div>
          )}
        </div>
      </div>

      {/* Building Form Modal */}
      {showBuildingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Building</h3>
              <button onClick={() => setShowBuildingForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createBuilding} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Building Code</label>
                <input
                  type="text"
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company/Organization</label>
                <select
                  value={buildingForm.organizationId}
                  onChange={(e) => setBuildingForm({ ...buildingForm, organizationId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  required
                >
                  <option value="">Select Company</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBuildingForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floor Form Modal */}
      {showFloorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Floor to {selectedBuilding?.name}</h3>
              <button onClick={() => setShowFloorForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createFloor} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Floor Name</label>
                <input
                  type="text"
                  value={floorForm.name}
                  onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., Floor 1, Ground Floor"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Floor Code</label>
                <input
                  type="text"
                  value={floorForm.code}
                  onChange={(e) => setFloorForm({ ...floorForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  placeholder="e.g., F1, GF"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowFloorForm(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
