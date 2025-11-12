import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import type { UserRole } from '../types';
import { Alert, Result } from 'antd';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Alert
            message="Access Denied"
            description={`This page is only accessible to ${allowedRoles.join(', ')} users.`}
            type="warning"
            showIcon
          />
        }
      />
    );
  }

  return <>{children}</>;
};