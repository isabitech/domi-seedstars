import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Result } from 'antd';
import { useGetMe } from '../hooks/Auth/useGetMe';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('HO' | 'BR' | 'admin')[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { data: currentUser, isLoading, isError } = useGetMe();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.data.role)) {
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