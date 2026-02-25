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
          ? 'bg-red-900/30' 
          : 'hover:bg-white/10'
      }`}
      style={{ color: isActive ? '#ffffff' : '#D0CEC1' }}
    >
      {icon}
      {children}
    </button>
  );
}






