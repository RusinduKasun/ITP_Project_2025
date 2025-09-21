import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { FaClipboardList, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaDownload, FaChartBar, FaBox, FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const OrderDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        products: [
          { name: 'Premium Electronics', quantity: 2, price: 299.99 },
          { name: 'Office Supplies', quantity: 1, price: 49.99 }
        ],
        totalAmount: 649.97,
        status: 'pending',
        orderDate: '2024-01-15',
        expectedDelivery: '2024-01-20',
        priority: 'high'
      },
      {
        id: 'ORD002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        products: [
          { name: 'Industrial Equipment', quantity: 1, price: 1299.99 }
        ],
        totalAmount: 1299.99,
        status: 'processing',
        orderDate: '2024-01-14',
        expectedDelivery: '2024-01-18',
        priority: 'medium'
      },
      {
        id: 'ORD003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        products: [
          { name: 'Office Supplies', quantity: 3, price: 49.99 },
          { name: 'Premium Electronics', quantity: 1, price: 299.99 }
        ],
        totalAmount: 449.96,
        status: 'shipped',
        orderDate: '2024-01-13',
        expectedDelivery: '2024-01-16',
        priority: 'low'
      },
      {
        id: 'ORD004',
        customerName: 'Alice Brown',
        customerEmail: 'alice@example.com',
        products: [
          { name: 'Industrial Equipment', quantity: 2, price: 1299.99 }
        ],
        totalAmount: 2599.98,
        status: 'delivered',
        orderDate: '2024-01-10',
        expectedDelivery: '2024-01-15',
        priority: 'high'
      }
    ];
    
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-600" />;
      case 'processing': return <FaBox className="text-blue-600" />;
      case 'shipped': return <FaTruck className="text-purple-600" />;
      case 'delivered': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaExclamationTriangle className="text-red-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Order Management</h1>
            <p className="text-secondary-600 mt-2">Manage and track customer orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn-outline">
              <FaDownload className="mr-2" />
              Export
            </button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <FaPlus className="mr-2" />
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Total Orders</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Pending</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBox className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Processing</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.processing}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaTruck className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Shipped</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.shipped}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-600">Delivered</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search orders by customer name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn-outline">
              <FaFilter className="mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-secondary-900">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-secondary-900">{order.customerName}</div>
                      <div className="text-sm text-secondary-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-secondary-900">
                      {order.products.map((product, index) => (
                        <div key={index} className="mb-1">
                          {product.name} x {product.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-secondary-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-secondary-600 hover:text-secondary-900"
                        title="Edit Order"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-secondary-900">Order Details - {selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-secondary-900 mb-2">Order Information</h4>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                <p><strong>Expected Delivery:</strong> {new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </span>
                </p>
                <p><strong>Priority:</strong> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedOrder.priority)}`}>
                    {selectedOrder.priority}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-secondary-900 mb-2">Products</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-secondary-700">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-secondary-700">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-secondary-700">Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-secondary-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products.map((product, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm text-secondary-900">{product.name}</td>
                        <td className="px-4 py-2 text-sm text-secondary-900">{product.quantity}</td>
                        <td className="px-4 py-2 text-sm text-secondary-900">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-secondary-900">${(product.quantity * product.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <p className="text-lg font-bold text-secondary-900">
                  Total: ${selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-outline"
              >
                Close
              </button>
              <button className="btn-primary">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
