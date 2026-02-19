'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Building2, Plus, MapPin, X } from 'lucide-react';

interface Location {
  _id: string;
  name: string;
  type: string;
  code: string;
  parentId?: string;
  organizationId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: Location[];
}

export function LocationManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'office',
    code: '',
    parentId: '',
    organizationId: '678816d3bf3a9d33c8a6f2b1'
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations/tree');
      const result = await response.json();
      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Location created successfully!');
        setShowForm(false);
        setFormData({ name: '', type: 'office', code: '', parentId: '', organizationId: '678816d3bf3a9d33c8a6f2b1' });
        fetchLocations();
      } else {
        toast.error(result.error || 'Failed to create location');
      }
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error('Error creating location');
    }
  };

  const renderTree = (nodes: Location[], level = 0) => {
    return nodes.map((node) => (
      <div key={node._id} style={{ marginLeft: `${level * 20}px` }} className="mb-2">
        <div className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-gray-50">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-black">{node.name}</span>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{node.type}</span>
          <span className="text-xs text-gray-500">{node.code}</span>
        </div>
        {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return <div className="p-8">Loading locations...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl text-black mb-2">Location Hierarchy</h2>
          <p className="text-gray-700">Manage organizational locations and spatial structure</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6">
        {locations.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No locations found. Create your first location.</p>
          </div>
        ) : (
          renderTree(locations)
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-black font-semibold">Add Location</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                >
                  <option value="organization">Organization</option>
                  <option value="company">Company</option>
                  <option value="office">Office</option>
                  <option value="building">Building</option>
                  <option value="floor">Floor</option>
                  <option value="room">Room</option>
                  <option value="desk">Desk</option>
                  <option value="rack">Rack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
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
