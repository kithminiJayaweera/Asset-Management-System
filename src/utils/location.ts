import Location from '@/models/Location';
import { ILocation } from '@/types';

export async function getLocationPath(locationId: string): Promise<string> {
  const path: string[] = [];
  let currentId: string | null = locationId;
  
  while (currentId) {
    const location = await Location.findById(currentId);
    if (!location) break;
    
    path.unshift(location.name);
    currentId = location.parentId?.toString() || null;
  }
  
  return path.join(' > ');
}

export async function getLocationTree(organizationId: string): Promise<ILocation[]> {
  const locations = await Location.find({ organizationId }).sort({ name: 1 });
  return locations;
}

export async function getChildLocations(parentId: string | null, organizationId: string): Promise<ILocation[]> {
  const locations = await Location.find({ 
    parentId: parentId || null, 
    organizationId 
  }).sort({ name: 1 });
  return locations;
}
