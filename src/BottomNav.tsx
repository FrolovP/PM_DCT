import React from 'react';
import { useAuth } from './AuthContext';

interface BottomNavProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ viewMode, onViewModeChange }) => {
  const { hasPermission } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Обзор', icon: '📊', permission: 'view_dashboard' },
    { id: 'projects', label: 'Проекты', icon: '📋', permission: 'view_projects' },
    { id: 'portfolios', label: 'Портфели', icon: '📁', permission: 'view_portfolios' },
    { id: 'global-kb', label: 'База знаний', icon: '📖', permission: 'view_global_kb' },
  ];

  const filteredItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewModeChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              viewMode === item.id
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {viewMode === item.id && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-indigo-600 rounded-b"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
