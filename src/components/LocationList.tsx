'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit, Trash2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LOCATION_TYPES } from '@/config/constants';
import type { ILocation, LocationType } from '@/types';

interface PopulatedLocation {
  _id: string;
  name: string;
}

interface LocationListProps {
  organizations: { id: string; name: string }[];
}

const LOCATION_TYPE_VALUES = Object.values(LOCATION_TYPES) as LocationType[];

export function LocationList({ organizations }: LocationListProps) {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(''); // CHANGED: Primary organization selector
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ILocation | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'building' as LocationType,
    organizationId: '',
    parentId: '',
    description: '',
    capacity: '',
    coordinates: { x: 0, y: 0 },
  });

  const fetchLocations = useCallback(async () => {
    if (!selectedOrgId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/locations?organizationId=${selectedOrgId}&limit=1000`);
      const result = await response.json();
      if (result.success) {
        setLocations(result.data.data || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchLocations();
    }
  }, [selectedOrgId, fetchLocations]);

  // Auto-select organization from form data when available
  useEffect(() => {
    if (formData.organizationId && !selectedOrgId) {
      setSelectedOrgId(formData.organizationId);
    }
  }, [formData.organizationId, selectedOrgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const locationData = {
      name: formData.name,
      type: formData.type,
      organizationId: formData.organizationId,
      parentId: formData.parentId || undefined,
      description: formData.description || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      coordinates: formData.coordinates,
    };

    try {
      const url = editingLocation 
        ? `/api/locations/${String(editingLocation._id)}`
        : '/api/locations';
      
      const response = await fetch(url, {
        method: editingLocation ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchLocations();
        handleCloseDialog();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location');
    }
  };

  const handleEdit = (location: ILocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      type: location.type,
      organizationId: typeof location.organizationId === 'object' 
        ? String((location.organizationId as unknown as PopulatedLocation)._id)
        : String(location.organizationId),
      parentId: typeof location.parentId === 'object' && location.parentId 
        ? String((location.parentId as unknown as PopulatedLocation)._id)
        : String(location.parentId || ''),
      description: location.description || '',
      capacity: location.capacity?.toString() || '',
      coordinates: location.coordinates || { x: 0, y: 0 },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchLocations();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      type: 'building',
      organizationId: '',
      parentId: '',
      description: '',
      capacity: '',
      coordinates: { x: 0, y: 0 },
    });
  };

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || location.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get available parent locations for current organization
  const availableParents = locations.filter((loc) => {
    if (!formData.organizationId) return false;
    const locOrgId = typeof loc.organizationId === 'object' 
      ? String((loc.organizationId as unknown as PopulatedLocation)._id)
      : String(loc.organizationId);
    return locOrgId === formData.organizationId && 
      (!editingLocation || String(loc._id) !== String(editingLocation._id));
  });

  if (loading) {
    return <div className="p-8">Loading locations...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage office locations, buildings, floors, and rooms</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingLocation(null); handleCloseDialog(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Create New Location'}
              </DialogTitle>
              <DialogDescription>
                Define a new location in your organization hierarchy
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Building A, Floor 3, Room 301"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Location Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) => setFormData({ ...formData, type: value as LocationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPE_VALUES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationId">Organization *</Label>
                  <Input
                    id="organizationId"
                    value={organizations.find(o => String(o.id) === formData.organizationId)?.name || ''}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Location will be created for the selected organization
                  </p>
                </div>

                <div>
                  <Label htmlFor="parentId">Parent Location</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value: string) => setFormData({ ...formData, parentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (top-level)</SelectItem>
                      {availableParents.map((loc) => (
                        <SelectItem key={String(loc._id)} value={String(loc._id)}>
                          {loc.name} ({loc.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this location"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity (desks/people)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLocation ? 'Update' : 'Create'} Location
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LOCATION_TYPE_VALUES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => (
          <div
            key={String(location._id)}
            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {location.type === 'building' ? (
                  <Building className="w-5 h-5 text-purple-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-purple-600" />
                )}
                <h3 className="font-semibold text-lg">{location.name}</h3>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(location)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(String(location._id))}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Type:</span>{' '}
                {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
              </p>
              {location.description && (
                <p>
                  <span className="font-medium">Description:</span> {location.description}
                </p>
              )}
              {location.capacity && (
                <p>
                  <span className="font-medium">Capacity:</span> {location.capacity}
                </p>
              )}
              <p>
                <span className="font-medium">Organization:</span>{' '}
                {typeof location.organizationId === 'object'
                  ? (location.organizationId as unknown as PopulatedLocation).name
                  : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No locations found for this organization.</p>
          <p className="text-sm">Create your first location to get started with floor plans.</p>
        </div>
      )}
    </div>
  );
}
