// import { useState } from 'react';
// import { Package, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react';
// import { Organization } from '@/types/shared';

// interface Employee {
//   id: string;
//   employeeId: string;
//   name: string;
//   email: string;
//   phone: string;
//   position: string;
//   department: string;
//   organizationId: string;
//   joinDate: string;
//   salary: number;
//   status: 'active' | 'on-leave' | 'inactive';
// }

// export interface AssetRequest {
//   id: string;
//   employeeId: string;
//   assetName: string;
//   category: string;
//   quantity: number;
//   reason: string;
//   priority: 'low' | 'medium' | 'high';
//   status: 'pending' | 'approved' | 'rejected';
//   requestDate: string;
//   notes?: string;
// }

// interface AssetRequestsProps {
//   employees: Employee[];
//   organizations: Organization[];
//   assetRequests: AssetRequest[];
//   onAddRequest: (request: Omit<AssetRequest, 'id'>) => void;
//   onUpdateRequest: (request: AssetRequest) => void;
// }

// export function AssetRequests({ employees, organizations, assetRequests, onAddRequest, onUpdateRequest }: AssetRequestsProps) {
//   const [showForm, setShowForm] = useState(false);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterPriority, setFilterPriority] = useState('all');

//   const [formData, setFormData] = useState({
//     employeeId: '',
//     assetName: '',
//     category: '',
//     quantity: 1,
//     reason: '',
//     priority: 'medium' as AssetRequest['priority']
//   });

//   const filteredRequests = assetRequests.filter(req => {
//     const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
//     const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
//     return matchesStatus && matchesPriority;
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const newRequest: Omit<AssetRequest, 'id'> = {
//       employeeId: formData.employeeId,
//       assetName: formData.assetName,
//       category: formData.category,
//       quantity: formData.quantity,
//       reason: formData.reason,
//       priority: formData.priority,
//       status: 'pending',
//       requestDate: new Date().toISOString().split('T')[0]
//     };

//     onAddRequest(newRequest);
//     setShowForm(false);
//     setFormData({
//       employeeId: '',
//       assetName: '',
//       category: '',
//       quantity: 1,
//       reason: '',
//       priority: 'medium'
//     });
//   };

//   const updateStatus = (id: string, status: 'approved' | 'rejected') => {
//     const request = assetRequests.find(r => r.id === id);
//     if (request) {
//       onUpdateRequest({ ...request, status });
//     }
//   };

//   const getEmployee = (employeeId: string) => {
//     return employees.find(e => e.id === employeeId);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved': return 'bg-green-100 text-green-800';
//       case 'rejected': return 'bg-red-100 text-red-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'high': return 'bg-red-50 text-red-700 border-red-200';
//       case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
//       case 'low': return 'bg-purple-50 text-purple-700 border-purple-200';
//       default: return 'bg-gray-50 text-gray-700 border-gray-200';
//     }
//   };

//   // Calculate statistics
//   const pendingCount = assetRequests.filter(r => r.status === 'pending').length;
//   const approvedCount = assetRequests.filter(r => r.status === 'approved').length;
//   const rejectedCount = assetRequests.filter(r => r.status === 'rejected').length;

//   return (
//     <div>
//       <div className="mb-8 flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl text-black mb-2">Asset Requests</h2>
//           <p className="text-gray-800">Manage employee asset requests</p>
//         </div>
//         {!showForm && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//           >
//             <Package className="w-5 h-5" />
//             New Request
//           </button>
//         )}
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-yellow-100 rounded-lg">
//               <Clock className="w-6 h-6 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Pending</p>
//               <p className="text-2xl text-black">{pendingCount}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-green-100 rounded-lg">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Approved</p>
//               <p className="text-2xl text-black">{approvedCount}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-red-100 rounded-lg">
//               <XCircle className="w-6 h-6 text-red-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-700">Rejected</p>
//               <p className="text-2xl text-black">{rejectedCount}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* New Request Form */}
//       {showForm && (
//         <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
//           <h3 className="text-lg text-black mb-4">New Asset Request</h3>
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Employee *
//                 </label>
//                 <select
//                   value={formData.employeeId}
//                   onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">Select Employee</option>
//                   {employees.map(emp => (
//                     <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Asset Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.assetName}
//                   onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="e.g., Dell Laptop XPS 15"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Category *
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">Select Category</option>
//                   <option value="Electronics">Electronics</option>
//                   <option value="Furniture">Furniture</option>
//                   <option value="Office Supplies">Office Supplies</option>
//                   <option value="Equipment">Equipment</option>
//                   <option value="Vehicles">Vehicles</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Quantity *
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={formData.quantity}
//                   onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Priority *
//                 </label>
//                 <select
//                   value={formData.priority}
//                   onChange={(e) => setFormData({ ...formData, priority: e.target.value as AssetRequest['priority'] })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                 </select>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm text-gray-700 mb-2">
//                   Reason *
//                 </label>
//                 <textarea
//                   value={formData.reason}
//                   onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
//                   required
//                   rows={3}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   placeholder="Enter reason for asset request"
//                 />
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//               >
//                 Submit Request
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm text-gray-700 mb-2">
//               Filter by Status
//             </label>
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm text-gray-700 mb-2">
//               Filter by Priority
//             </label>
//             <select
//               value={filterPriority}
//               onChange={(e) => setFilterPriority(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               <option value="all">All Priorities</option>
//               <option value="high">High</option>
//               <option value="medium">Medium</option>
//               <option value="low">Low</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Requests List */}
//       <div className="space-y-4">
//         {filteredRequests.map(request => {
//           const employee = getEmployee(request.employeeId);
//           if (!employee) return null;

//           return (
//             <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-start gap-4">
//                   <div className="p-3 bg-purple-100 rounded-full">
//                     <User className="w-6 h-6 text-purple-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg text-black">{employee.name}</h3>
//                     <p className="text-sm text-gray-700">{employee.position} • {employee.department}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
//                     {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                   </span>
//                   <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(request.priority)}`}>
//                     {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//                 <div>
//                   <p className="text-xs text-gray-700 mb-1">Asset Name</p>
//                   <p className="text-sm text-black">{request.assetName}</p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-700 mb-1">Category</p>
//                   <p className="text-sm text-black">{request.category}</p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-700 mb-1">Quantity</p>
//                   <p className="text-sm text-black">{request.quantity}</p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-700 mb-1">Request Date</p>
//                   <p className="text-sm text-black">{new Date(request.requestDate).toLocaleDateString()}</p>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <p className="text-xs text-gray-700 mb-1">Reason</p>
//                 <p className="text-sm text-black">{request.reason}</p>
//               </div>

//               {request.status === 'pending' && (
//                 <div className="flex gap-3 pt-4 border-t border-gray-200">
//                   <button
//                     onClick={() => updateStatus(request.id, 'approved')}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                   >
//                     <CheckCircle className="w-4 h-4" />
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => updateStatus(request.id, 'rejected')}
//                     className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     <XCircle className="w-4 h-4" />
//                     Reject
//                   </button>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {filteredRequests.length === 0 && (
//         <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
//           <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
//           <p className="text-gray-800">No asset requests found</p>
//         </div>
//       )}
//     </div>
//   );
// }







