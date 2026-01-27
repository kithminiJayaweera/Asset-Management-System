import { Package, MapPin, Calendar, DollarSign } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
}

interface MyAssetsProps {
  employee: Employee;
}

export function MyAssets({ employee }: MyAssetsProps) {
  const myAssets = [
    {
      id: '1',
      name: 'Dell Latitude 5540',
      category: 'PC/Laptop',
      status: 'active',
      location: 'Office - Floor 2',
      purchaseDate: '2024-01-15',
      value: 150000,
      description: 'High-performance laptop for development',
      brand: 'Dell',
      model: 'Latitude 5540',
      processor: 'Intel Core i7-13700H',
      ram: '16GB DDR5',
      storage: 'SSD 512GB NVMe',
      operatingSystem: 'Windows 11 Pro',
      macAddress: '00:1A:2B:3C:4D:5E'
    },
    {
      id: '2',
      name: 'Ergonomic Office Chair',
      category: 'Office Furniture',
      status: 'active',
      location: 'Office - Floor 1',
      purchaseDate: '2023-06-20',
      value: 25000,
      material: 'Leather',
      color: 'Black',
      dimensions: '65cm x 65cm x 120cm'
    },
    {
      id: '3',
      name: 'Company Van',
      category: 'Vehicle',
      status: 'active',
      location: 'Parking - Building A',
      purchaseDate: '2022-11-10',
      value: 2500000,
      vehicleType: 'Van',
      registrationNumber: 'WP-ABC-1234',
      fuelType: 'Diesel',
      mileage: '45000'
    },
    {
      id: '4',
      name: 'Dell U2723DE Monitor',
      category: 'Office Equipment',
      status: 'active',
      location: 'Office - Floor 2',
      purchaseDate: '2024-03-20',
      value: 85000,
      description: 'Dual monitors for enhanced productivity'
    }
  ];

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
        <h2 className="text-2xl text-gray-900 mb-2">My Assets</h2>
        <p className="text-gray-600">Assets assigned to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl text-gray-900">{myAssets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Assets</p>
              <p className="text-2xl text-gray-900">{activeAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl text-gray-900">Rs. {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {myAssets.map(asset => (
          <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-2">{asset.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-4 h-4" />
                <span className="text-sm">{asset.category}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{asset.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Rs. {asset.value.toLocaleString()}</span>
              </div>

              {asset.description && (
                <p className="text-sm text-gray-600 pt-2">{asset.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {myAssets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No assets assigned to you</p>
        </div>
      )}
    </div>
  );
}