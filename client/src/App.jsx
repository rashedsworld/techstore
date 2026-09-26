import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProductCatalogPage } from './pages/ProductCatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const App = () => {
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Admin-only customer and order data */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminOrdersPage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

export default App;