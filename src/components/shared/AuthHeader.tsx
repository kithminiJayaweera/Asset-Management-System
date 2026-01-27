"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: {
    name: string;
  };
}

export function AuthHeader() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
      } else {
        // Not authenticated, redirect to login
        if (response.status === 401) {
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { text: 'Super Admin', color: 'bg-purple-100 text-purple-700' };
      case 'admin':
        return { text: 'Admin', color: 'bg-blue-100 text-blue-700' };
      default:
        return { text: 'Employee', color: 'bg-green-100 text-green-700' };
    }
  };

  if (!mounted || loading || !user) {
    return null; // Or show a loading skeleton
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end">
      <div className="relative">
        {/* User Info Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>
              {roleBadge.text}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                {user.organizationId && (
                  <p className="text-xs text-gray-500 mt-1">
                    {user.organizationId.name}
                  </p>
                )}
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
