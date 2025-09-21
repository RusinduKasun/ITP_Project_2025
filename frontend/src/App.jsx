import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import InventoryDashboard from './pages/InventoryDashboard.jsx';
import SupplierDashboard from './suppliremanager/pages/SupplierDashboard.jsx';
import FinanceDashboard from './pages/FinanceDashboard.jsx';
import OrderDashboard from './pages/OrderDashboard.jsx';
import Products from './orderManagement/Order/Products.jsx';
import Cart from './orderManagement/Order/Cart.jsx';
import Contact from './orderManagement/Contact/Contact.jsx';
import Address from './orderManagement/Order/Address.jsx';
import Payment from './orderManagement/Order/Payment.jsx';
import OrderSummary from './orderManagement/Order/OrderSummary.jsx';
import OrderTracking from './orderManagement/Order/OrderTracking.jsx';
import About from './orderManagement/About/About.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import AdminRoute from './Components/AdminRoute.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50 flex flex-col">
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              {/* Case-insensitive aliases for supplier dashboard to avoid blank page due to path casing */}
              <Route path="/SupplierDashboard" element={<Navigate to="/supplier-dashboard" replace />} />
              <Route path="/supplierDashboard" element={<Navigate to="/supplier-dashboard" replace />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/inventory-dashboard" 
                element={
                  <ProtectedRoute>
                    <InventoryDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier-dashboard" 
                element={
                  <ProtectedRoute>
                    <SupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finance-dashboard" 
                element={
                  <ProtectedRoute>
                    <FinanceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/order-dashboard" 
                element={
                  <ProtectedRoute>
                    <OrderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Address />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ordersummary" 
                element={
                  <ProtectedRoute>
                    <OrderSummary />
                  </ProtectedRoute>
                } 
              />
              <Route path="/ordertracking" element={<OrderTracking />} />
              {/* fallback for unmatched routes */}
              <Route path="*" element={<div style={{textAlign:'center', padding:40}}><h2>Page not found</h2><p>Return to the <a href="/">home page</a>.</p></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
