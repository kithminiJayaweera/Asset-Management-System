"use client";

import { useState } from 'react';
import { EmployeeDashboard } from '../components/employee/EmployeeDashboard';
import { MyAssets } from '../components/employee/MyAssets';
import { AssetRequestForm } from '../components/employee/AssetRequestForm';
import { MyRequests } from '../components/employee/MyRequests';
import { Sidebar } from '../components/shared/Sidebar';
import { NavButton } from '../components/shared/NavButton';
import { MainLayout } from '../components/shared/MainLayout';
import { Package, FileText, User, Home } from 'lucide-react';

const currentEmployee = {
  id: '1',
  employeeId: 'E001',
  name: 'Saman Perera',
  email: 'saman@company.lk',
  phone: '+94 77 123 4567',
  position: 'Software Engineer',
  department: 'IT',
  organizationId: '1',
  joinDate: '2024-01-01',
  salary: 50000,
  status: 'active' as const
};

type View = 'dashboard' | 'my-assets' | 'request-asset' | 'my-requests';

export default function EmployeePage() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <MainLayout>
      <Sidebar 
        title="Employee Portal" 
        subtitle={currentEmployee.name}
      >
        <NavButton
          onClick={() => setCurrentView('dashboard')}
          isActive={currentView === 'dashboard'}
          icon={<Home className="w-5 h-5" />}
        >
          Dashboard
        </NavButton>
        
        <NavButton
          onClick={() => setCurrentView('my-assets')}
          isActive={currentView === 'my-assets'}
          icon={<Package className="w-5 h-5" />}
        >
          My Assets
        </NavButton>
        
        <NavButton
          onClick={() => setCurrentView('request-asset')}
          isActive={currentView === 'request-asset'}
          icon={<FileText className="w-5 h-5" />}
        >
          Request Asset
        </NavButton>
        
        <NavButton
          onClick={() => setCurrentView('my-requests')}
          isActive={currentView === 'my-requests'}
          icon={<User className="w-5 h-5" />}
        >
          My Requests
        </NavButton>
      </Sidebar>

      <div className="ml-64 p-8">
        {currentView === 'dashboard' && <EmployeeDashboard employee={currentEmployee} />}
        {currentView === 'my-assets' && <MyAssets employee={currentEmployee} />}
        {currentView === 'request-asset' && <AssetRequestForm employee={currentEmployee} />}
        {currentView === 'my-requests' && <MyRequests employee={currentEmployee} />}
      </div>
    </MainLayout>
  );
}
