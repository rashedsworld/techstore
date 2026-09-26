import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && userInfo.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};