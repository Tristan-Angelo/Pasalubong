import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/common/HomePage';
import AllProductsPage from './pages/common/AllProductsPage';
import BuyerLogin from './pages/buyer/BuyerLogin';
import BuyerRegister from './pages/buyer/BuyerRegister';
import BuyerForgotPassword from './pages/buyer/BuyerForgotPassword';
import BuyerResetPassword from './pages/buyer/BuyerResetPassword';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import SellerLogin from './pages/seller/SellerLogin';
import SellerRegister from './pages/seller/SellerRegister';
import SellerForgotPassword from './pages/seller/SellerForgotPassword';
import SellerResetPassword from './pages/seller/SellerResetPassword';
import SellerDashboard from './pages/seller/SellerDashboard';
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryRegister from './pages/delivery/DeliveryRegister';
import DeliveryForgotPassword from './pages/delivery/DeliveryForgotPassword';
import DeliveryResetPassword from './pages/delivery/DeliveryResetPassword';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import VerifyEmail from './pages/common/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="font-inter text-gray-800 bg-gradient-to-br from-white via-rose-50 to-amber-50 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<AllProductsPage />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/login" element={<BuyerLogin />} />
          <Route path="/buyer/register" element={<BuyerRegister />} />
          <Route path="/buyer/forgot-password" element={<BuyerForgotPassword />} />
          <Route path="/buyer/reset-password" element={<BuyerResetPassword />} />
          <Route path="/buyer/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/buyer/dashboard" 
            element={
              <ProtectedRoute userType="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Seller Routes */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />
          <Route path="/seller/reset-password" element={<SellerResetPassword />} />
          <Route path="/seller/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute userType="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Delivery Routes */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/register" element={<DeliveryRegister />} />
          <Route path="/delivery/forgot-password" element={<DeliveryForgotPassword />} />
          <Route path="/delivery/reset-password" element={<DeliveryResetPassword />} />
          <Route path="/delivery/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/delivery/dashboard" 
            element={
              <ProtectedRoute userType="delivery">
                <DeliveryDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
