// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from 'react';
// import { Package, MapPin, Calendar, DollarSign } from 'lucide-react';

// interface Employee {
//   id: string;
//   name: string;
// }

// interface MyAssetsProps {
//   employee: Employee;
// }

// interface Asset {
//   id: string;
//   name: string;
//   category: string;
//   status: string;
//   location: string;
//   purchaseDate: string;
//   value: number;
//   description?: string;
//   brand?: string;
//   model?: string;
//   processor?: string;
//   ram?: string;
//   storage?: string;
//   operatingSystem?: string;
//   macAddress?: string;
//   material?: string;
//   color?: string;
//   dimensions?: string;
//   vehicleType?: string;
//   registrationNumber?: string;
//   fuelType?: string;
//   mileage?: string;
//   assignedTo?: string;
// }

// export function MyAssets({ employee }: MyAssetsProps) {
//   const [myAssets, setMyAssets] = useState<Asset[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMyAssets = async () => {
//       try {
//         const response = await fetch('/api/assets');
//         const result = await response.json();
        
//         if (result.success && result.data) {
//           const assetsData = result.data.data || result.data;
//           const allAssets = (Array.isArray(assetsData) ? assetsData : []).map((asset: any) => ({
//             id: asset._id,
//             name: asset.name,
//             category: asset.category,
//             status: asset.status === 'available' ? 'active' : asset.status,
//             location: asset.location || '',
//             purchaseDate: asset.purchaseDate,
//             value: asset.currentValue || asset.purchasePrice || 0,
//             description: asset.description || asset.notes || '',
//             assignedTo: typeof asset.assignedTo === 'object' && asset.assignedTo ? asset.assignedTo.name : (asset.assignedTo || ''),
//             brand: asset.manufacturer || '',
//             model: asset.model || '',
//             serialNumber: asset.serialNumber || '',
//             processor: asset.processor || '',
//             ram: asset.ram || '',
//             storage: asset.storage || '',
//             operatingSystem: asset.operatingSystem || '',
//             macAddress: asset.macAddress || '',
//             material: asset.material || '',
//             color: asset.color || '',
//             dimensions: asset.dimensions || '',
//             vehicleType: asset.vehicleType || '',
//             registrationNumber: asset.registrationNumber || '',
//             fuelType: asset.fuelType || '',
//             mileage: asset.mileage || ''
//           }));
          
//           // Filter assets assigned to current employee
//           const employeeAssets = allAssets.filter((asset: Asset) => 
//             asset.assignedTo === employee.name
//           );
          
//           setMyAssets(employeeAssets);
//         }
//       } catch (error) {
//         console.error('Error fetching assets:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyAssets();
//   }, [employee.name]);

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'maintenance': return 'bg-yellow-100 text-yellow-800';
//       case 'retired': return 'bg-gray-100 text-gray-800';
//       case 'lost': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const totalValue = myAssets.reduce((sum, asset) => sum + asset.value, 0);
//   const activeAssets = myAssets.filter(a => a.status === 'active').length;

//   if (loading) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-800">Loading your assets...</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-8">
//         <h2 className="text-2xl text-black mb-2">My Assets</h2>
//         <p className="text-gray-800">Assets assigned to you</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <Package className="w-6 h-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Total Assets</p>
//               <p className="text-2xl text-black">{myAssets.length}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <Package className="w-6 h-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Active Assets</p>
//               <p className="text-2xl text-black">{activeAssets}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-purple-100 rounded-lg">
//               <DollarSign className="w-6 h-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Total Value</p>
//               <p className="text-2xl text-black">Rs. {totalValue.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//         {myAssets.map(asset => (
//           <div key={asset.id} className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex-1">
//                 <h3 className="text-lg text-black mb-2">{asset.name}</h3>
//                 <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(asset.status)}`}>
//                   {asset.status}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center gap-2 text-gray-700">
//                 <Package className="w-4 h-4" />
//                 <span className="text-sm">{asset.category}</span>
//               </div>

//               <div className="flex items-center gap-2 text-gray-700">
//                 <MapPin className="w-4 h-4" />
//                 <span className="text-sm">{asset.location}</span>
//               </div>

//               <div className="flex items-center gap-2 text-gray-700">
//                 <Calendar className="w-4 h-4" />
//                 <span className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
//               </div>

//               <div className="flex items-center gap-2 text-gray-700">
//                 <DollarSign className="w-4 h-4" />
//                 <span className="text-sm">Rs. {asset.value.toLocaleString()}</span>
//               </div>

//               {asset.description && (
//                 <p className="text-sm text-gray-700 pt-2">{asset.description}</p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {myAssets.length === 0 && (
//         <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
//           <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
//           <p className="text-gray-800">No assets assigned to you</p>
//         </div>
//       )}
//     </div>
//   );
// }






