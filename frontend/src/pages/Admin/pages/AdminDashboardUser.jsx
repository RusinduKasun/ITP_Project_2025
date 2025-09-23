import React, { useState, useEffect } from 'react';
import Nav from '../../../pages/Home/Nav/Nav';
import { useAuth } from '../../../Context/AuthContext';
import axios from 'axios';
import { 
  FaUsers, FaUserCheck, FaUserTimes, FaUserShield, 
  FaSearch, FaEdit, FaTrash, FaEye, FaCog, FaChartLine, FaUser,
  FaChevronLeft, FaChevronRight, FaDownload
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchOrders, fetchSuppliers } from '../../../Apis/SupplierApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartTooltip, Legend as RechartLegend } from 'recharts';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('users');
  const [supplierStats, setSupplierStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    fruitDemand: [],
  });
  const [supplierLoading, setSupplierLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    
    // fetch supplier aggregated stats for admin view
    if (activeTab === 'supplier-stats') {
      fetchSupplierStats();
    }
  }, []);

  // Debounce search input to avoid too many requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 200);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    // when debounced search term changes, refetch users
    fetchUsers(1);
  }, [debouncedTerm, roleFilter, statusFilter]);

  useEffect(() => {
    // when switching to supplier stats tab, load data
    if (activeTab === 'supplier-stats') fetchSupplierStats();
  }, [activeTab]);

  const fetchSupplierStats = async () => {
    setSupplierLoading(true);
    try {
      const [ordersRes, suppliersRes] = await Promise.all([fetchOrders(), fetchSuppliers()]);
      const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      // compute basic aggregates
      const totalOrders = fetchedOrders.length;
      const pendingOrders = fetchedOrders.filter(o => o.status === 'pending').length;
      const deliveredOrders = fetchedOrders.filter(o => o.trackingStatus === 'Delivered').length;
      const totalRevenue = fetchedOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
      const fruitDemandMap = fetchedOrders.reduce((acc, o) => {
        acc[o.fruit] = (acc[o.fruit] || 0) + (o.quantity || 0);
        return acc;
      }, {});
      const fruitDemand = Object.entries(fruitDemandMap).map(([name, value]) => ({ name, value }));

      setSupplierStats({ totalOrders, pendingOrders, deliveredOrders, totalRevenue, fruitDemand });
    } catch (err) {
      console.error('Error fetching supplier stats:', err);
    } finally {
      setSupplierLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        params: {
          page,
          limit: pageSize,
          search: debouncedTerm || '',
          role: roleFilter !== 'all' ? roleFilter : '',
          status: statusFilter !== 'all' ? statusFilter : ''
        }
      });
  setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Keep selectedUsers in sync with current page results (remove missing ids)
  useEffect(() => {
    if (!users || users.length === 0) return;
    setSelectedUsers(prev => {
      const next = new Set();
      for (const id of prev) if (users.find(u => u._id === id)) next.add(id);
      return next;
    });
  }, [users]);


  const handleSearch = () => fetchUsers(1);
  const handleFilterChange = () => fetchUsers(1);
  const handlePageChange = (page) => fetchUsers(page);

  // allow pressing Enter to trigger search
  const onSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Render user table rows (separate helper to avoid complex inline JSX ternary)
  const renderUserRows = () => {
    if (usersLoading) {
      return (
        <tr>
          <td colSpan="6" className="px-4 py-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto" />
          </td>
        </tr>
      );
    }

    if (!users || users.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-4 py-4 text-center text-gray-500">No users found</td>
        </tr>
      );
    }

    return users.map((userItem) => (
      <tr key={userItem._id}>
        <td className="px-4 py-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <FaUser className="text-emerald-600 text-sm" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {userItem.firstName} {userItem.lastName}
              </div>
              <div className="text-sm text-gray-500 break-words">@{userItem.username}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {userItem.role}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            userItem.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
          }`}>
            {userItem.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-4 text-sm text-secondary-500">{new Date(userItem.createdAt).toLocaleDateString()}</td>
        <td className="px-4 py-4 text-sm font-medium">
          <div className="flex items-center gap-2 overflow-visible relative z-10 justify-end">
            <button onClick={() => viewUserDetails(userItem._id)} className="bg-white border border-gray-200 p-2 rounded-md text-emerald-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" title="View Details" aria-label={`View details for ${userItem.username}`} tabIndex={0}>
              <FaEye />
            </button>
            <select value={userItem.role} onChange={(e) => handleRoleChange(userItem._id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 w-24" disabled={userItem._id === user._id} aria-label={`Change role for ${userItem.username}`}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={() => handleStatusToggle(userItem._id)} className={`bg-white border border-gray-200 p-2 rounded-md ${userItem.isActive ? 'text-orange-600' : 'text-emerald-600'} hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`} title={userItem.isActive ? 'Deactivate' : 'Activate'} disabled={userItem._id === user._id} aria-label={userItem.isActive ? `Deactivate ${userItem.username}` : `Activate ${userItem.username}`}>
              {userItem.isActive ? <FaUserTimes /> : <FaUserCheck />}
            </button>
            <button onClick={() => handleDeleteUser(userItem._id)} className="bg-white border border-gray-200 p-2 rounded-md text-red-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400" title="Delete User" disabled={userItem._id === user._id} aria-label={`Delete ${userItem.username}`}>
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole });
      setMessage(`User role updated to ${newRole}`);
      fetchUsers(pagination.currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error updating user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStatusToggle = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`);
      setMessage(`User ${response.data.user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers(pagination.currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Error toggling user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        setMessage('User deleted successfully');
        fetchUsers(pagination.currentPage);
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setError('Error deleting user');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`);
      setSelectedUser(response.data.user);
      setShowUserModal(true);
    } catch (error) {
      setError('Error fetching user details');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Download Users PDF
  const downloadUsersPDF = (onlySelected = false) => {
    const source = onlySelected ? users.filter(u => selectedUsers.has(u._id)) : users;
    if (!source.length) return alert("No users to download");

    const doc = new jsPDF();
    const tableColumn = ["Name", "Username", "Email", "Role", "Status", "Joined"];
    const tableRows = source.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.username,
      u.email,
      u.role,
      u.isActive ? "Active" : "Inactive",
      new Date(u.createdAt).toLocaleDateString()
    ]);

    doc.text(onlySelected ? "Selected Users Report" : "User Report", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(onlySelected ? "selected_user_report.pdf" : "user_report.pdf");
  };


  // Download Supplier Stats PDF
  const downloadSupplierStatsPDF = () => {
    // Use current supplierStats state to build a report
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Supplier Stats Report', 14, 18);

    const summaryStartY = 28;
    doc.setFontSize(11);
    doc.text(`Total Orders: ${supplierStats.totalOrders || 0}`, 14, summaryStartY);
    doc.text(`Pending Orders: ${supplierStats.pendingOrders || 0}`, 14, summaryStartY + 8);
    doc.text(`Delivered Orders: ${supplierStats.deliveredOrders || 0}`, 14, summaryStartY + 16);
    doc.text(`Total Revenue: Rs. ${(supplierStats.totalRevenue ?? 0).toFixed(2)}`, 14, summaryStartY + 24);

    // Fruit demand table
    const tableColumn = ['Fruit', 'Quantity'];
    const tableRows = (supplierStats.fruitDemand || []).map(f => [f.name, f.value]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: summaryStartY + 36,
    });

    doc.save('supplier_stats_report.pdf');
  };

  if (loading) {
    return (
      <>
      <Nav />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading admin dashboard...</p>
        </div>
      </div>
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <>
      <Nav />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-secondary-600">You don't have permission to access this page.</p>
        </div>
      </div>
      </>
    );
  }

  

  return (
    <>
      <Nav />
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Tabs */}
      <div className="mb-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Admin Dashboard </h1>
          <p className="text-secondary-600">Welcome back, {user.firstName}! Manage your user management system.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
          <div className="flex space-x-2" role="tablist" aria-label="Admin sections">
            <button
              role="tab"
              aria-pressed={activeTab === 'users'}
              className={`px-4 py-2 font-medium rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${activeTab === 'users' ? 'bg-white border border-b-0 border-secondary-200 text-primary-700' : 'text-secondary-600 bg-transparent'}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>

            <button
              role="tab"
              aria-pressed={activeTab === 'supplier-stats'}
              className={`px-4 py-2 font-medium rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${activeTab === 'supplier-stats' ? 'bg-white border border-b-0 border-secondary-200 text-primary-700' : 'text-secondary-600 bg-transparent'}`}
              onClick={() => setActiveTab('supplier-stats')}
            >
              Supplier Stats
            </button>
          </div>

          {/* Quick Actions toolbar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setActiveTab('users'); fetchUsers(1); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
              title="Go to Users"
            >
              <FaUsers /> <span>Users</span>
            </button>
            <button
              onClick={() => { setActiveTab('supplier-stats'); fetchSupplierStats(); }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
              title="Supplier Stats"
            >
              <FaChartLine /> <span>Supplier</span>
            </button>
            <button
              onClick={() => downloadUsersPDF()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
              title="Export Users"
            >
              <FaDownload /> <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Download Buttons (placed below tabs) */}
        <div className="mb-6 flex space-x-4 items-center">
        {activeTab === 'users' && (
          <button onClick={downloadUsersPDF} className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm">
            <FaDownload /> <span>Download Users PDF</span>
          </button>
        )}
        
        {activeTab === 'supplier-stats' && (
          <button onClick={downloadSupplierStatsPDF} className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm">
            <FaDownload /> <span>Download Supplier Report</span>
          </button>
        )}
        {/* Bulk action buttons removed as requested. Per-row actions and selection remain. */}
      </div>

      {/* Messages */}
  {message && <div role="status" aria-live="polite" className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">{message}</div>}
    {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      {/* Stats Cards (only visible in User Management tab) */}
      {activeTab === 'users' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-secondary-100 p-6 flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
          <div className="bg-white] rounded-xl shadow-md border border-secondary-100 p-6 flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUserCheck className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeUsers || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-secondary-100 p-6 flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaUserShield className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Admin Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.adminUsers || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-secondary-100 p-6 flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FaUserTimes className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Inactive Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.inactiveUsers || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'supplier-stats' ? (
  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150 mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Supplier Aggregated Stats</h2>
          {supplierLoading ? (
            <p>Loading supplier stats...</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <p className="text-sm text-secondary-600">Total Orders</p>
                  <p className="text-2xl font-bold text-secondary-900">{supplierStats.totalOrders}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <p className="text-sm text-secondary-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-secondary-900">{supplierStats.pendingOrders}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <p className="text-sm text-secondary-600">Delivered Orders</p>
                  <p className="text-2xl font-bold text-secondary-900">{supplierStats.deliveredOrders}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md">
                  <p className="text-sm text-secondary-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-secondary-900">Rs. {(supplierStats.totalRevenue ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Fruit Demand</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={supplierStats.fruitDemand} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                        {supplierStats.fruitDemand.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={["#22c55e", "#16a34a", "#15803d", "#4ade80", "#86efac"][idx % 5]} />
                        ))}
                      </Pie>
                      <RechartTooltip />
                      <RechartLegend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* User Management Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-150">

            {/* Search and Filters */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-secondary-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 bg-white pl-10"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(''); setDebouncedTerm(''); }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-500"
                      aria-label="Clear search"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handleSearch}
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
              >
                Search
              </button>
              <button
                onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); setDebouncedTerm(''); }}
                className="border border-secondary-300 text-secondary-700 px-3 py-2 rounded-lg"
              >
                Reset Filters
              </button>
              <div className="ml-2">
                <label htmlFor="pageSize" className="sr-only">Page size</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); fetchUsers(1); }}
                  className="border border-secondary-300 rounded px-2 py-1 text-sm bg-white"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
                <div className="overflow-visible">
              <table className="min-w-full divide-y divide-secondary-200 table-fixed">
                <thead className="bg-secondary-50 sticky top-0 z-20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-1/12">
                      <input
                        type="checkbox"
                        aria-label="Select all users"
                        checked={users.length > 0 && selectedUsers.size === users.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(users.map(u => u._id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-5/12">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-2/12">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-2/12">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-1/12">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider w-2/12">
                      Actions
                    </th>
                  </tr>
                </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {usersLoading ? (
                            renderUserRows()
                          ) : (
                            users.length === 0 ? renderUserRows() : users.map((userItem) => (
                              <tr key={userItem._id} className={`hover:bg-secondary-50 ${selectedUsers.has(userItem._id) ? 'bg-secondary-100' : ''}`}>
                                <td className="px-4 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.has(userItem._id)}
                                    onChange={(e) => {
                                      const next = new Set(selectedUsers);
                                      if (e.target.checked) next.add(userItem._id); else next.delete(userItem._id);
                                      setSelectedUsers(next);
                                    }}
                                    aria-label={`Select ${userItem.username}`}
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                      <FaUser className="text-primary-600 text-sm" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-secondary-900">
                                        {userItem.firstName} {userItem.lastName}
                                      </div>
                                      <div className="text-sm text-secondary-500 break-words">@{userItem.username}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {userItem.role}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    userItem.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {userItem.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-secondary-500">{new Date(userItem.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4 text-sm font-medium">
                                  <div className="flex items-center gap-2 overflow-visible relative z-30 justify-end" style={{ position: 'relative' }}>
                                    <button onClick={() => viewUserDetails(userItem._id)} className="bg-white border border-secondary-200 p-2 rounded-md text-primary-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400" title="View Details" aria-label={`View details for ${userItem.username}`} tabIndex={0}>
                                      <FaEye />
                                    </button>
                                    <select value={userItem.role} onChange={(e) => handleRoleChange(userItem._id, e.target.value)} className="text-xs border border-secondary-300 rounded px-2 py-1 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 w-24" disabled={userItem._id === user._id} aria-label={`Change role for ${userItem.username}`}>
                                      <option value="user">User</option>
                                      <option value="admin">Admin</option>
                                    </select>
                                    <button onClick={() => handleStatusToggle(userItem._id)} className={`bg-white border border-secondary-200 p-2 rounded-md ${userItem.isActive ? 'text-orange-600' : 'text-blue-600'} hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400`} title={userItem.isActive ? 'Deactivate' : 'Activate'} disabled={userItem._id === user._id} aria-label={userItem.isActive ? `Deactivate ${userItem.username}` : `Activate ${userItem.username}`}>
                                      {userItem.isActive ? <FaUserTimes /> : <FaUserCheck />}
                                    </button>
                                    <button onClick={() => handleDeleteUser(userItem._id)} className="bg-white border border-secondary-200 p-2 rounded-md text-red-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400" title="Delete User" disabled={userItem._id === user._id} aria-label={`Delete ${userItem.username}`}>
                                      <FaTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
              </table>
            </div>

            {/* Friendly empty state when no users */}
            {(!usersLoading && users.length === 0) && (
              <div className="py-8 text-center">
                <p className="text-secondary-600 mb-4">No users match your search or filters.</p>
                <div className="flex items-center justify-center space-x-3">
                  <button onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); setDebouncedTerm(''); }} className="border border-secondary-300 text-secondary-700 px-4 py-2 rounded-lg">Reset Filters</button>
                  <button onClick={() => fetchUsers(1)} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">Reload</button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-secondary-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="border border-primary-500 text-primary-600 px-3 py-1 text-sm rounded disabled:opacity-50"
                  >
                    <FaChevronLeft className="inline mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="border border-primary-500 text-primary-600 px-3 py-1 text-sm rounded disabled:opacity-50"
                  >
                    Next
                    <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Details Modal */}
          {showUserModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Name:</label>
                    <p className="text-secondary-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Username:</label>
                    <p className="text-secondary-900">@{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Email:</label>
                    <p className="text-secondary-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Role:</label>
                    <p className="text-secondary-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Status:</label>
                    <p className="text-secondary-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Joined:</label>
                    <p className="text-secondary-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default AdminDashboard;
