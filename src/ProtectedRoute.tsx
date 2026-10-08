import React from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children, fallback }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-800">У вас нет прав для просмотра этого раздела</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface PermissionButtonProps {
  permission: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({ 
  permission, 
  children, 
  onClick, 
  className = '',
  disabled = false 
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};
