import { IAsset } from '@/types';

export interface AssetSearchCriteria {
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  category?: string;
}

export interface AIAssetInfo {
  manufacturer: string;
  model: string;
  category: string;
  estimatedPrice: number;
  description: string;
  specs?: Record<string, string>;
  usefulLife?: number;
  depreciationRate?: number;
}

export interface AssetDetectionResult {
  found: boolean;
  asset?: Partial<IAsset>;
  aiInfo?: AIAssetInfo;
  suggestions?: Partial<IAsset>[];
  message: string;
  source?: 'database' | 'ai';
}

/**
 * Search for existing assets by serial number, model, or manufacturer
 * If not found in database, use AI to detect product information
 * @param criteria - Search criteria
 * @returns Detection result with found assets or AI-detected info
 */
export async function detectAsset(
  criteria: AssetSearchCriteria
): Promise<AssetDetectionResult> {
  try {
    // First, search local database
    const params = new URLSearchParams();
    
    if (criteria.serialNumber) params.append('serialNumber', criteria.serialNumber);
    if (criteria.model) params.append('model', criteria.model);
    if (criteria.manufacturer) params.append('manufacturer', criteria.manufacturer);
    if (criteria.category) params.append('category', criteria.category);
    
    const response = await fetch(`/api/assets/detect?${params.toString()}`);
    const result = await response.json();
    
    if (!result.success) {
      return {
        found: false,
        message: result.error || 'Failed to search for assets'
      };
    }
    
    const assets = result.data || [];
    
    // If found in database, return immediately
    if (assets.length === 1) {
      return {
        found: true,
        asset: assets[0],
        message: 'Exact match found in database! Asset details have been auto-filled.',
        source: 'database'
      };
    }
    
    if (assets.length > 1) {
      return {
        found: true,
        suggestions: assets,
        message: `Found ${assets.length} similar assets in database. Please select one or search with AI for new product.`,
        source: 'database'
      };
    }
    
    // No local matches - try AI detection
    const searchQuery = criteria.model || criteria.serialNumber || '';
    
    if (searchQuery.length < 3) {
      return {
        found: false,
        message: 'No matching assets found. Please provide more details or enter manually.'
      };
    }
    
    // Call AI detection API
    const aiResponse = await fetch('/api/assets/ai-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery }),
    });
    
    const aiResult = await aiResponse.json();
    
    if (!aiResult.success) {
      return {
        found: false,
        message: 'No matches in database. AI detection unavailable - please enter details manually.'
      };
    }
    
    // AI found product information
    return {
      found: true,
      aiInfo: aiResult.data,
      message: 'Automatically detected product information! Review and confirm details below.',
      source: 'ai'
    };
    
  } catch (error) {
    console.error('Asset detection error:', error);
    return {
      found: false,
      message: 'Error searching for assets. Please try again.'
    };
  }
}

/**
 * Validate if serial number is unique
 * @param serialNumber - Serial number to check
 * @param excludeAssetId - Optional asset ID to exclude from check (for updates)
 * @returns True if unique, false if duplicate exists
 */
export async function validateUniqueSerial(
  serialNumber: string,
  excludeAssetId?: string
): Promise<{ isUnique: boolean; existingAsset?: Partial<IAsset> }> {
  try {
    const params = new URLSearchParams({ serialNumber });
    if (excludeAssetId) params.append('excludeId', excludeAssetId);
    
    const response = await fetch(`/api/assets/validate-serial?${params.toString()}`);
    const result = await response.json();
    
    return {
      isUnique: result.success && !result.data?.exists,
      existingAsset: result.data?.asset
    };
  } catch (error) {
    console.error('Serial validation error:', error);
    return { isUnique: true }; // Assume unique on error to not block creation
  }
}

/**
 * Extract asset information from a model string
 * @param modelString - Model string (e.g., "Dell Latitude 5520")
 * @returns Parsed manufacturer and model
 */
export function parseModelString(modelString: string): {
  manufacturer?: string;
  model?: string;
} {
  const parts = modelString.trim().split(/\s+/);
  
  if (parts.length === 0) {
    return {};
  }
  
  if (parts.length === 1) {
    return { model: parts[0] };
  }
  
  // Common manufacturer names
  const manufacturers = ['dell', 'hp', 'lenovo', 'apple', 'asus', 'acer', 'microsoft', 'samsung', 'lg'];
  const firstWord = parts[0].toLowerCase();
  
  if (manufacturers.includes(firstWord)) {
    return {
      manufacturer: parts[0],
      model: parts.slice(1).join(' ')
    };
  }
  
  // Default: treat whole string as model
  return { model: modelString };
}
