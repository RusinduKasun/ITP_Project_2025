import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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

function RootLayout() {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password", element: <ResetPassword /> },
        { path: "/register", element: <Register /> },
        { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: "/admin-dashboard", element: <AdminRoute><AdminDashboard /></AdminRoute> },
        { path: "/inventory-dashboard", element: <ProtectedRoute><InventoryDashboard /></ProtectedRoute> },
        { path: "/supplier-dashboard", element: <ProtectedRoute><SupplierDashboard /></ProtectedRoute> },
        { path: "/finance-dashboard", element: <ProtectedRoute><FinanceDashboard /></ProtectedRoute> },
        { path: "/order-dashboard", element: <ProtectedRoute><OrderDashboard /></ProtectedRoute> },
        { path: "/products", element: <Products /> },
        { path: "/cart", element: <Cart /> },
        { path: "/contact", element: <Contact /> },
        { path: "/about", element: <About /> },
        { path: "/checkout", element: <ProtectedRoute><Address /></ProtectedRoute> },
        { path: "/payment", element: <ProtectedRoute><Payment /></ProtectedRoute> },
        { path: "/ordersummary", element: <ProtectedRoute><OrderSummary /></ProtectedRoute> },
        { path: "/ordertracking", element: <OrderTracking /> },
        { path: "*", element: <div style={{textAlign:'center', padding:40}}><h2>Page not found</h2><p>Return to the <a href="/">home page</a>.</p></div> },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
