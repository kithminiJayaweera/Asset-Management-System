import { ReactNode } from 'react';

interface NavButtonProps {
  onClick: () => void;
  isActive: boolean;
  icon: ReactNode;
  children: ReactNode;
}

export function NavButton({ onClick, isActive, icon, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}