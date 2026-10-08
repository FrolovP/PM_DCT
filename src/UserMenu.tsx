import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from './auth';

export const UserMenu: React.FC = () => {
  const { auth, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!auth.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {auth.user.name.charAt(0)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[auth.user.role]}</p>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {auth.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{auth.user.name}</p>
                  <p className="text-xs text-gray-500">{auth.user.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${ROLE_COLORS[auth.user.role]}`}>
                    {ROLE_LABELS[auth.user.role]}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти из системы
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
