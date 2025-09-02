import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import Navbar from './Components/Navbar.jsx';
import Home from './Components/Home.jsx';
import Login from './Components/Login.jsx';
import Register from './Components/Register.jsx';
import Profile from './Components/Profile.jsx';
import AdminDashboard from './Components/AdminDashboard.jsx';
import InventoryDashboard from './Components/InventoryDashboard.jsx';
import SupplierDashboard from './Components/SupplierDashboard.jsx';
import FinanceDashboard from './Components/FinanceDashboard.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import AdminRoute from './Components/AdminRoute.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
