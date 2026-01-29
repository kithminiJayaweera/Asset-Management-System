import { ReactNode } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  title: string;
  subtitle?: string;
  linkTo?: string;
  linkText?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children: ReactNode;
}

export function Sidebar({ title, subtitle, linkTo, linkText, showBackButton, onBack, children }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-black mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <h1 className="text-xl text-black">{title}</h1>
        {subtitle && <p className="text-sm text-gray-700 mt-1">{subtitle}</p>}
        {linkTo && linkText && (
          <a href={linkTo} className="text-sm text-blue-600 hover:text-blue-700 mt-2 block">
            {linkText}
          </a>
        )}
      </div>
      
      <nav className="px-4 space-y-2 flex-1">
        {children}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}






