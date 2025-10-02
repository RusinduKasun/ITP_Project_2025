import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Supplier/Dashboard'
// Home
import Home from './pages/Home/Home/Home.jsx';
import Services from './pages/Home/Services/Services.jsx';
import About from './pages/Home/About/About.jsx';
import Contact from './pages/Home/Contact/Contact.jsx';
// Customer Pages
import Address from './pages/Customer/Address.jsx';
import Payment from './pages/Customer/Payment.jsx';
import OrderSummary from './pages/Customer/OrderSummary.jsx';
import OrderTracking from './pages/Customer/OrderTracking.jsx';
import Cart from './pages/Customer/Cart.jsx';
import Shipping from './pages/Customer/Shipping.jsx';
import Products from './pages/Customer/Products.jsx';
// Supplier Pages
import Suppliers from './pages/Supplier/Suppliers'
import Calendar from './pages/Supplier/Calendar'
import Orders from './pages/Supplier/Orders'
import Reports from './pages/Supplier/Reports'
import SupplierResponse from './pages/Supplier/SupplierResponse';
import OrderDetails from './pages/Supplier/OrderDetails';
import AdminDashbord from './pages/Admin/AdminDashbord';
// Finance Pages
import ReportsFinance from "./pages/Finance/Reports.jsx";
import Expenses from "./pages/Finance/Expenses.jsx";
import Income from "./pages/Finance/Income.jsx";
import Wastage from "./pages/Finance/Wastage.jsx";
import BreakEven from "./pages/Finance/BreakEven.jsx";
import ProfitMargin from "./pages/Finance/ProfitMargin.jsx";
import FinanceDashboard from "./pages/Finance/FinanceDash.jsx";
//Admin Pages
import { AuthProvider } from './Context/AuthContext.jsx';
import Login from './pages/Admin/pages/Login.jsx';
import Register from './pages/Admin/pages/Register.jsx';
import Profile from './pages/Admin/pages/Profile.jsx';
import AdminDashboardUser from './pages/Admin/pages/AdminDashboardUser.jsx';
import ForgotPassword from './pages/Admin/pages/ForgotPassword.jsx';
import ResetPassword from './pages/Admin/pages/ResetPassword.jsx';
import ProtectedRoute from './components/Admin/ProtectedRoute.jsx';
import AdminRoute from './components/Admin/AdminRoute.jsx';
// Inventory Pages
import InventoryDashboard from './pages/Inventory/Dashboard.jsx';
import Inventory from './pages/Inventory/Inventory';
import Production from './pages/Inventory/Production';
import ReportsInventory from './pages/Inventory/Reports';
import FruitInventory from './pages/Inventory/AddFruit';

export default function App() {
  return (
    <div>
      <AuthProvider>
        <Routes>
          {/* Home Route */}
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          {/* Admin Route */}
          <Route path="/adminDashbord" element={<AdminDashbord />} />
          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          {/* Supplier Route */}
          <Route path="/suppliersDash" element={<Dashboard />} />
          {/* Legacy/hyphenated aliases used in Nav/links */}
          <Route path="/supplier-dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/supplier-response" element={<SupplierResponse />} />
          <Route path="/order-details" element={<OrderDetails />} />
          {/* Finance Route */}
          <Route path="/FinanceReports" element={<ReportsFinance />} />
          <Route path="/financeDash" element={<FinanceDashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/wastage" element={<Wastage />} />
          <Route path="/breakeven" element={<BreakEven />} />
          <Route path="/profitmargin" element={<ProfitMargin />} />
          {/* Customer Route */}
          <Route path="/address" element={<Address />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ordersummary" element={<OrderSummary />} />
          <Route path="/ordertracking" element={<OrderTracking />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping" element={<Shipping />} />
          {/* Admin Route */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
                <AdminDashboardUser />
              </AdminRoute>
            }
          />
          {/* Hyphenated Inventory/Finance/Order aliases */}
          <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
          <Route path="/finance-dashboard" element={<FinanceDashboard />} />
          <Route path="/order-dashboard" element={<Orders />} />
          {/* Inventory Route */}
          <Route path="/inventoryDashboard" element={<InventoryDashboard />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/Production" element={<Production />} />
          <Route path="/inventoryReports" element={<ReportsInventory />} />
          <Route path="/Fruits" element={<FruitInventory />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}
//4/0AVGzR1DzsChaUYFygTvK6hOmWkRqkLT7iXO8JDMpI3WsYMp47LwOhc3v9OGP3OGHhUVmJgi