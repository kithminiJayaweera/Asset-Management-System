"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeDashboard } from '@/components/employee/EmployeeDashboard';
import { MyAssets } from '@/components/employee/MyAssets';
import { AssetRequestForm } from '@/components/employee/AssetRequestForm';
import { MyRequests } from '@/components/employee/MyRequests';
import { Sidebar } from '@/components/shared/Sidebar';
import { NavButton } from '@/components/shared/NavButton';
import { MainLayout } from '@/components/shared/MainLayout';
import { AuthHeader } from '@/components/shared/AuthHeader';
import { Package, FileText, User, Home } from 'lucide-react';

interface Employee {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  organizationId: string;
  joinDate?: string;
  salary?: number;
  status: 'active' | 'inactive';
}

type View = 'dashboard' | 'my-assets' | 'request-asset' | 'my-requests';

export default function EmployeePage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentEmployee();
  }, []);

  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success && result.data) {
        const user = result.data;
        const employee: Employee = {
          id: user._id || user.id || '1',
          employeeId: user.employeeId || '',
          name: user.name || 'Employee',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || '',
          department: user.department || '',
          organizationId: user.organizationId?._id || user.organizationId || '',
          joinDate: user.createdAt || new Date().toISOString(),
          salary: user.salary || 0,
          status: 'active' as const
        };
        setCurrentEmployee(employee);
      } else {
        // Not authenticated, redirect to login
        if (response.status === 401) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching current employee:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentEmployee) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AuthHeader />
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
