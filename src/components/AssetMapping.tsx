'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Layers, DoorOpen, Package, MapPin, Save } from 'lucide-react';

interface Organization {
  _id: string;
  name: string;
  code: string;
}

interface Building {
  _id: string;
  name: string;
  code: string;
  organizationId: string;
}

interface Floor {
  _id: string;
  name: string;
  code: string;
  buildingId: string;
  floorPlanImage?: string;
  floorPlanLayout?: any[];
}

interface Room {
  _id: string;
  name: string;
  code: string;
  floorId: string;
}

interface Asset {
  _id: string;
  assetTag: string;
  name: string;
  category: string;
  status: string;
  organizationId: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  floorPosition?: {
    x: number;
    y: number;
    rotation: number;
    icon: string;
    color: string;
  };
}

export default function AssetMapping() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [unmappedAssets, setUnmappedAssets] = useState<Asset[]>([]);

  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const [loading, setLoading] = useState(true);

  // Load organizations
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Load buildings when org changes
  useEffect(() => {
    if (selectedOrg) {
      fetchBuildings(selectedOrg);
      fetchUnmappedAssets(selectedOrg);
    } else {
      setBuildings([]);
      setUnmappedAssets([]);
    }
    setSelectedBuilding('');
  }, [selectedOrg]);

  // Load floors when building changes
  useEffect(() => {
    if (selectedBuilding) {
      fetchFloors(selectedBuilding);
    } else {
      setFloors([]);
    }
    setSelectedFloor('');
  }, [selectedBuilding]);

  // Load rooms when floor changes
  useEffect(() => {
    if (selectedFloor) {
      fetchRooms(selectedFloor);
      fetchMappedAssets();
    } else {
      setRooms([]);
      setAssets([]);
    }
    setSelectedRoom('');
  }, [selectedFloor]);

  // Load assets when room changes
  useEffect(() => {
    if (selectedRoom) {
      fetchMappedAssets();
    }
  }, [selectedRoom]);

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

  const fetchBuildings = async (orgId: string) => {
    try {
      const res = await fetch(`/api/buildings?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success) setBuildings(data.data);
    } catch (error) {
      toast.error('Failed to load buildings');
    }
  };

  const fetchFloors = async (buildingId: string) => {
    try {
      const res = await fetch(`/api/locations?parent=${buildingId}&type=floor`);
      const data = await res.json();
      if (data.success) setFloors(data.data);
    } catch (error) {
      toast.error('Failed to load floors');
    }
  };

  const fetchRooms = async (floorId: string) => {
    try {
      const res = await fetch(`/api/locations?parent=${floorId}&type=room`);
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    }
  };

  const fetchUnmappedAssets = async (orgId: string) => {
    try {
      const res = await fetch(`/api/assets?organizationId=${orgId}`);
      const data = await res.json();
      if (data.success) {
        // Filter assets without room mapping
        const unmapped = data.data.filter((a: Asset) => !a.roomId);
        setUnmappedAssets(unmapped);
      }
    } catch (error) {
      toast.error('Failed to load assets');
    }
  };

  const fetchMappedAssets = async () => {
    try {
      let url = `/api/assets?organizationId=${selectedOrg}`;
      if (selectedBuilding) url += `&buildingId=${selectedBuilding}`;
      if (selectedFloor) url += `&floorId=${selectedFloor}`;
      if (selectedRoom) url += `&roomId=${selectedRoom}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.filter((a: Asset) => a.roomId));
      }
    } catch (error) {
      toast.error('Failed to load mapped assets');
    }
  };

  const mapAssetToRoom = async (assetId: string) => {
    if (!selectedRoom) {
      toast.error('Please select a room first');
      return;
    }

    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: selectedBuilding,
          floorId: selectedFloor,
          roomId: selectedRoom
        })
      });

      if (res.ok) {
        toast.success('Asset mapped successfully');
        fetchUnmappedAssets(selectedOrg);
        fetchMappedAssets();
      } else {
        toast.error('Failed to map asset');
      }
    } catch (error) {
      toast.error('Failed to map asset');
    }
  };

  const unmapAsset = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: null,
          floorId: null,
          roomId: null
        })
      });

      if (res.ok) {
        toast.success('Asset unmapped');
        fetchUnmappedAssets(selectedOrg);
        fetchMappedAssets();
      }
    } catch (error) {
      toast.error('Failed to unmap asset');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Asset Location Mapping</h2>
        <p className="text-gray-600">Map assets to specific rooms in your organization</p>
      </div>

      {/* Hierarchy Selector */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold text-black mb-4">Select Location</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Organization
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black"
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Building
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black"
              disabled={!selectedOrg}
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building._id} value={building._id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Layers className="w-4 h-4 inline mr-1" />
              Floor
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black"
              disabled={!selectedBuilding}
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor._id} value={floor._id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DoorOpen className="w-4 h-4 inline mr-1" />
              Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black"
              disabled={!selectedFloor}
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Unmapped Assets */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">
              <Package className="w-5 h-5 inline mr-2" />
              Unmapped Assets ({unmappedAssets.length})
            </h3>
          </div>

          {!selectedOrg ? (
            <p className="text-gray-500 text-sm">Select an organization to view assets</p>
          ) : unmappedAssets.length === 0 ? (
            <p className="text-gray-500 text-sm">All assets are mapped</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {unmappedAssets.map((asset) => (
                <div
                  key={asset._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-black">{asset.name}</div>
                    <div className="text-xs text-gray-500">
                      {asset.assetTag} • {asset.category}
                    </div>
                  </div>
                  <button
                    onClick={() => mapAssetToRoom(asset._id)}
                    disabled={!selectedRoom}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Map
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Assets */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">
              <MapPin className="w-5 h-5 inline mr-2" />
              Mapped Assets ({assets.length})
            </h3>
          </div>

          {!selectedFloor ? (
            <p className="text-gray-500 text-sm">Select a floor to view mapped assets</p>
          ) : assets.length === 0 ? (
            <p className="text-gray-500 text-sm">No assets mapped yet</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-black">{asset.name}</div>
                      <div className="text-xs text-gray-500">
                        {asset.assetTag} • {asset.category}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Mapped to room
                      </div>
                    </div>
                    <button
                      onClick={() => unmapAsset(asset._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                    >
                      Unmap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedOrg && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Mapping Summary</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600">Organization</div>
              <div className="font-medium text-blue-900">
                {organizations.find(o => o._id === selectedOrg)?.name || '-'}
              </div>
            </div>
            <div>
              <div className="text-blue-600">Building</div>
              <div className="font-medium text-blue-900">
                {buildings.find(b => b._id === selectedBuilding)?.name || '-'}
              </div>
            </div>
            <div>
              <div className="text-blue-600">Floor</div>
              <div className="font-medium text-blue-900">
                {floors.find(f => f._id === selectedFloor)?.name || '-'}
              </div>
            </div>
            <div>
              <div className="text-blue-600">Room</div>
              <div className="font-medium text-blue-900">
                {rooms.find(r => r._id === selectedRoom)?.name || '-'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
