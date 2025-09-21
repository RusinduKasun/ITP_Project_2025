import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './suppliremanager/pages/Dashboard'
import Suppliers from './suppliremanager/pages/Suppliers'
import Calendar from './suppliremanager/pages/Calendar'
import Orders from './suppliremanager/pages/Orders'
import Reports from './suppliremanager/pages/Reports'
import Header from './suppliremanager/components/Header'
import Footer from './suppliremanager/components/Footer'
import Nav from './suppliremanager/components/Nav'
import SupplierResponse from './suppliremanager/pages/SupplierResponse';
import OrderDetails from './suppliremanager/pages/OrderDetails';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <Nav />
      <main className="flex-grow container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/supplier-response" element={<SupplierResponse />} />
          <Route path="/order-details" element={<OrderDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}