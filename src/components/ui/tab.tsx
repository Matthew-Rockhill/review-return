// src/components/ui/tab.tsx
import { ReactNode } from 'react';

interface TabProps {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  badge?: number;
}

export function Tab({ active, onClick, icon, label, badge }: TabProps) {
  return (
    <button
      className={`py-4 font-medium text-sm flex items-center border-b-2 ${
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
          {badge}
        </span>
      )}
    </button>
  );
}