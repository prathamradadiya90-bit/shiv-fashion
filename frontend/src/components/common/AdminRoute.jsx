import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * AdminRoute — wraps routes that require SUPERADMIN privileges.
 * If the user is not logged in or doesn't have the correct role,
 * redirects to /login.
 */
const AdminRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo || userInfo.role !== 'SUPERADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
