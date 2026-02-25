import { useState, useEffect } from 'react';
import { Package, MapPin, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Employee {
  id: string;
  name: string;
}

interface Asset {
  _id: string;
  name: string;
  category: string;
  status: string;
  location: string;
  purchaseDate: string;
  value: number;
  description?: string;
  specifications?: Record<string, string | number | boolean>;
}

interface MyAssetsProps {
  employee: Employee;
}

export function MyAssets({ employee }: MyAssetsProps) {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnConfirm, setReturnConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAssets();
  }, [employee.id]);

  const fetchMyAssets = async () => {
    try {
      const response = await fetch(`/api/assets?assignedTo=${employee.id}`);
      const result = await response.json();
      if (result.success) {
        setMyAssets(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    toast.info(`Edit functionality for ${asset.name} - Contact admin for changes`);
  };

  const handleDelete = async (assetId: string) => {
    try {
      // Create a return request instead of direct deletion
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'return',
          assetId,
          requestedBy: employee.id,
          reason: 'Asset return request',
          priority: 'medium'
        })
      });
      
      if (response.ok) {
        toast.success('Return request submitted successfully');
      }
    } catch (error) {
      console.error('Error creating return request:', error);
      toast.error('Failed to submit return request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-800">Loading assets...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = myAssets.reduce((sum, asset) => sum + asset.value, 0);
  const activeAssets = myAssets.filter(a => a.status === 'active').length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-black mb-2">My Assets</h2>
        <p className="text-gray-800">Assets assigned to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Total Assets</p>
              <p className="text-2xl text-black">{myAssets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Active Assets</p>
              <p className="text-2xl text-black">{activeAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-gray-700">Total Value</p>
              <p className="text-2xl text-black">Rs. {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {myAssets.map(asset => (
          <div key={asset._id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg text-black mb-2">{asset.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(asset)}
                  className="p-2 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Request Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReturnConfirm(asset._id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Request Return"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Package className="w-4 h-4" />
                <span className="text-sm">{asset.category}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{asset.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Rs. {asset.value.toLocaleString()}</span>
              </div>

              {/* Display category-specific specifications */}
              {asset.specifications && Object.keys(asset.specifications).length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-700 mb-2">Specifications:</p>
                  <div className="space-y-1">
                    {Object.entries(asset.specifications).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-gray-700">{String(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {asset.description && (
                <p className="text-sm text-gray-700 pt-2">{asset.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {myAssets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-800">No assets assigned to you</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!returnConfirm}
        title="Request Asset Return"
        message="Are you sure you want to request removal of this asset?"
        onConfirm={() => {
          if (returnConfirm) {
            handleDelete(returnConfirm);
            setReturnConfirm(null);
          }
        }}
        onCancel={() => setReturnConfirm(null)}
        confirmText="Request Return"
        cancelText="Cancel"
      />
    </div>
  );
}






