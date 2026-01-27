import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

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
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <h1 className="text-xl text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {linkTo && linkText && (
          <a href={linkTo} className="text-sm text-blue-600 hover:text-blue-700 mt-2 block">
            {linkText}
          </a>
        )}
      </div>
      
      <nav className="px-4 space-y-2">
        {children}
      </nav>
    </div>
  );
}