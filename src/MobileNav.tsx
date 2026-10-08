import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface MobileNavProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onLogout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ viewMode, onViewModeChange, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth, hasPermission } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Обзор', icon: '📊', permission: 'view_dashboard' },
    { id: 'offices', label: 'Офисы', icon: '🏢', permission: 'view_offices' },
    { id: 'portfolios', label: 'Портфели', icon: '📁', permission: 'view_portfolios' },
    { id: 'projects', label: 'Проекты', icon: '📋', permission: 'view_projects' },
    { id: 'global-kb', label: 'База знаний', icon: '📖', permission: 'view_global_kb' },
    { id: 'users', label: 'Пользователи', icon: '👥', permission: 'manage_users' },
    { id: 'settings', label: 'Настройки', icon: '⚙️', permission: 'manage_settings' },
    { id: 'api', label: 'API', icon: '🔑', permission: 'manage_api_keys' },
    { id: 'integrations', label: 'Интеграции', icon: '🔌', permission: 'manage_integrations' },
  ];

  const filteredItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Открыть меню"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Проектный офис</h2>
                    <p className="text-white text-opacity-80 text-xs">{auth.user?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  aria-label="Закрыть меню"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-2">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewModeChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    viewMode === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
