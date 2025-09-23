import React, { useEffect, useState } from 'react';
import { fetchOrders, fetchSuppliers } from '../../Apis/SupplierApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faTruck, faCheckCircle, faDollarSign, faChartPie, faGauge, faChartLine, faSpinner, faSearch, faBell, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO, startOfMonth, differenceInHours } from 'date-fns';
import Modal from 'react-modal';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Header from '../../components/Supplier/Header';
import Nav from '../../components/Supplier/Nav';
import Footer from '../../components/Supplier/Footer';


Modal.setAppElement('#root');

// Simplified greenish color palette
const COLORS = ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'];

export default function Dashboard() {
  // මෙහිදී state variable එකක් නිර්මාණය කරයි orders, suppliers, loading, error, stats, modalIsOpen, selectedOrder සඳහා
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    fruitDemand: [],
    ordersOverTime: [],
    notifications: [],
    paymentNotifications: [], // Add payment notifications
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Dashboard එක load වෙද්දී සහ 30sකට වරක් data ලබා ගැනීම
  useEffect(() => {
    loadData();
    // සජීවී දත්ත ලබා ගැනීම සඳහා 30sකට වරක් polling
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // API හරහා orders සහ suppliers ලබාගෙන, stats ගණනය කිරීම
  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes] = await Promise.all([fetchOrders(), fetchSuppliers()]);
      const fetchedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const fetchedSuppliers = Array.isArray(suppliersRes.data) ? suppliersRes.data : [];

      setOrders(fetchedOrders);
      setSuppliers(fetchedSuppliers);

      // මුළු orders ගණන, pending, delivered, මුළු ආදායම ගණනය කිරීම
      const totalOrders = fetchedOrders.length;
      const pendingOrders = fetchedOrders.filter(o => o.status === 'pending').length;
      const deliveredOrders = fetchedOrders.filter(o => o.trackingStatus === 'Delivered').length;
      const totalRevenue = fetchedOrders.reduce((sum, o) => sum + o.totalPrice, 0);

      // ප්‍රතිලාභය වැඩිම පළතුරු (Fruit Demand) ගණනය කිරීම
      const fruitDemandMap = fetchedOrders.reduce((acc, o) => {
        acc[o.fruit] = (acc[o.fruit] || 0) + o.quantity;
        return acc;
      }, {});
      const fruitDemand = Object.entries(fruitDemandMap).map(([name, value]) => ({ name, value }));

      // මාසිකව orders ගණන (Orders Over Time) ගණනය කිරීම
      const ordersByMonth = fetchedOrders.reduce((acc, o) => {
        const month = format(startOfMonth(new Date(o.deliveryDate)), 'MMM yyyy');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      const ordersOverTime = Object.entries(ordersByMonth)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));

      // Notifications (දැනුම්දීම්) සකස් කිරීම
      const notifications = fetchedOrders
        .map(order => {
          const deliveryTime = new Date(order.deliveryDate);
          const hoursUntilDelivery = differenceInHours(deliveryTime, new Date());
          const notificationsList = [];

          // Supplier එකක් order එක approve කළා නම්
          if (order.status === 'approved') {
            notificationsList.push({
              id: `${order._id}-approved`,
              type: 'success',
              message: `Order ${order.orderId} approved by ${order.supplier?.name || 'N/A'}`,
              timestamp: new Date(order.updatedAt || Date.now()),
              orderId: order._id,
            });
          }

          // Order එක deny කළා නම්
          if (order.status === 'denied') {
            notificationsList.push({
              id: `${order._id}-denied`,
              type: 'error',
              message: `Order ${order.orderId} denied by ${order.supplier?.name || 'N/A'}`,
              timestamp: new Date(order.updatedAt || Date.now()),
              orderId: order._id,
            });
          }

          // Delivery date එකට පැය 24ක් ඇතුළත නම්
          if (hoursUntilDelivery <= 24 && hoursUntilDelivery > 0 && order.status === 'approved') {
            notificationsList.push({
              id: `${order._id}-urgent`,
              type: 'warning',
              message: `Order ${order.orderId} due in ${Math.round(hoursUntilDelivery)}h`,
              timestamp: new Date(),
              orderId: order._id,
            });
          }

          // Tracking status update එකක් තිබේ නම්
          if (order.trackingStatus && ['In Transit', 'Out for Delivery', 'Delivered'].includes(order.trackingStatus)) {
            notificationsList.push({
              id: `${order._id}-tracking-${order.trackingStatus}`,
              type: 'info',
              message: `Order ${order.orderId}: ${order.trackingStatus}`,
              timestamp: new Date(order.updatedAt || Date.now()),
              orderId: order._id,
            });
          }

          return notificationsList;
        })
        .flat()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // නවතම දැනුම්දීම් මුලින්
        .slice(0, 5); // ඉහළම 5ක් පමණක් පෙන්වයි

      // Payment notifications
      const paymentNotifications = fetchedOrders
        .filter(order => order.paymentStatus === 'Paid')
        .map(order => ({
          id: `${order._id}-payment`,
          type: 'success',
          message: `Payment Success for Order ${order.orderId}`,
          timestamp: new Date(order.updatedAt || Date.now()),
          orderId: order._id,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);

      setStats({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        fruitDemand,
        ordersOverTime,
        notifications,
        paymentNotifications,
      });

      setError(null);
    } catch (err) {
      // දත්ත ලබා ගැනීමේ දෝෂයකි
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modal එක විවෘත කිරීමේ function එක
  const openModal = (order) => {
    setSelectedOrder(order);
    setModalIsOpen(true);
  };

  // Modal එක වසා දැමීමේ function එක
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrder(null);
  };

  // දත්ත load වෙමින් පවතින විට loading spinner එක පෙන්වයි
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FontAwesomeIcon icon={faSpinner} spin className="text-fsd-primary-green text-6xl" />
      </div>
    );
  }

  // දෝෂයක් ඇති විට error message එක පෙන්වයි
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600 text-xl font-medium">{error}</p>
      </div>
    );
  }

  // Approved orders notification box
  const approvedOrders = orders.filter(order => order.status === 'approved');

  // Dashboard UI එක
  return (
    <>
      <Header />
      <Nav />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Dashboard හි ශීර්ෂය */}
          <div className="fsd-dashboard-header mb-8">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faGauge} className="text-fsd-primary-green text-2xl mr-3" />
              <h1 className="fsd-dashboard-title text-3xl font-bold text-fsd-primary-green">Seller Dashboard</h1>
            </div>
            <p className="fsd-dashboard-subtitle text-gray-600 text-base">Everything Under One Finger Tip</p>
          </div>

          {/* Summary Cards - Orders, Revenue වැනි සංක්ෂිප්ත තොරතුරු */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: 'Total Orders', value: stats.totalOrders, icon: faBox, color: 'bg-gradient-to-br from-green-100 to-green-200' },
              { title: 'Pending Orders', value: stats.pendingOrders, icon: faTruck, color: 'bg-gradient-to-br from-green-100 to-green-200' },
              { title: 'Delivered Orders', value: stats.deliveredOrders, icon: faCheckCircle, color: 'bg-gradient-to-br from-green-100 to-green-200' },
              { title: 'Total Cost', value: `Rs. ${stats.totalRevenue.toFixed(2)}`, icon: faDollarSign, color: 'bg-gradient-to-br from-green-100 to-green-200' },
            ].map((card, index) => (
              <div
                key={index}
                className={`${card.color} fsd-card rounded-lg shadow-sm p-4 lg:p-6 transform hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-600 font-medium">{card.title}</p>
                    <h2 className="text-lg lg:text-2xl font-semibold text-gray-800">{card.value}</h2>
                  </div>
                  <FontAwesomeIcon icon={card.icon} className="text-fsd-primary-green text-xl lg:text-2xl opacity-60" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content: Charts and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Notifications Panel - දැනුම්දීම් පෙන්වයි */}
            <div className="fsd-notifications bg-white rounded-lg shadow-sm p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="fsd-notifications-title text-lg font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={loadData}
                  className="text-fsd-primary-green hover:text-fsd-primary-green-hover text-sm lg:text-base transition-colors duration-150"
                  data-tooltip-id="fsd-refresh-notifications"
                  data-tooltip-content="Refresh Notifications"
                >
                  <FontAwesomeIcon icon={faSpinner} />
                  <ReactTooltip id="fsd-refresh-notifications" />
                </button>
              </div>
              <div className="space-y-3 max-h-72 lg:max-h-80 overflow-y-auto">
                {/* Payment notifications */}
                {stats.paymentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="fsd-notification flex items-start justify-between p-3 rounded-md text-sm bg-green-50 border-l-2 border-green-500"
                  >
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faDollarSign} className="mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-800 font-medium truncate">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* ...existing code for other notifications... */}
                {stats.notifications.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center">No new notifications</p>
                ) : (
                  stats.notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`fsd-notification flex items-start justify-between p-3 rounded-md text-sm ${notification.type === 'success'
                        ? 'bg-green-50 border-l-2 border-green-500'
                        : notification.type === 'warning'
                          ? 'bg-yellow-50 border-l-2 border-yellow-500'
                          : notification.type === 'error'
                            ? 'bg-red-50 border-l-2 border-red-500'
                            : 'bg-gray-50 border-l-2 border-gray-500'
                        }`}
                    >
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={
                            notification.type === 'success'
                              ? faCheckCircle
                              : notification.type === 'warning'
                                ? faExclamationTriangle
                                : notification.type === 'error'
                                  ? faTimes
                                  : faBell
                          }
                          className={`mr-2 mt-0.5 flex-shrink-0 ${notification.type === 'success'
                            ? 'text-green-600'
                            : notification.type === 'warning'
                              ? 'text-yellow-600'
                              : notification.type === 'error'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-800 font-medium truncate">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openModal(orders.find(o => o._id === notification.orderId))}
                        className="text-fsd-primary-green hover:text-fsd-primary-green-hover transition-colors duration-150 ml-2 flex-shrink-0"
                        data-tooltip-id={`fsd-view-notification-${notification.id}`}
                        data-tooltip-content="View Order Details"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                        <ReactTooltip id={`fsd-view-notification-${notification.id}`} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Approved Orders Notification Box */}
            <div className="fsd-approved-orders bg-white rounded-lg shadow-sm p-4 lg:p-6 mt-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                Approved Orders
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {approvedOrders.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center">No approved orders</p>
                ) : (
                  approvedOrders.map(order => (
                    <div
                      key={order._id}
                      className="flex items-start justify-between p-3 rounded-md text-sm bg-green-50 border-l-2 border-green-500"
                    >
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-800 font-medium truncate">
                            Order <span className="font-bold">{order.orderId}</span> approved by <span className="font-bold">{order.supplier?.name || 'N/A'}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Delivery: {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openModal(order)}
                        className="text-fsd-primary-green hover:text-fsd-primary-green-hover transition-colors duration-150 ml-2 flex-shrink-0"
                        data-tooltip-id={`fsd-view-approved-${order._id}`}
                        data-tooltip-content="View Order Details"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                        <ReactTooltip id={`fsd-view-approved-${order._id}`} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Charts Section - පළතුරු ඉල්ලුම සහ Orders Over Time */}
            <div className="fsd-charts lg:col-span-2 space-y-6">
              {/* Fruit Demand Pie Chart - පළතුරු ඉල්ලුම පයි චාට් එක */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="fsd-chart-title text-lg font-semibold text-gray-800 mb-4">Fruit Demand</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.fruitDemand}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#4b5563' }}
                    >
                      {stats.fruitDemand.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Orders Over Time Line Chart - මාසික orders ගණන */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <h3 className="fsd-chart-title text-lg font-semibold text-gray-800 mb-4">Orders Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.ordersOverTime}>
                    <XAxis dataKey="month" stroke="#4b5563" />
                    <YAxis stroke="#4b5563" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#22c55e" name="Orders" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Orders Table - නවතම orders පෙන්වයි */}
          <div className="fsd-orders bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="fsd-orders-title text-lg font-semibold text-gray-800">Recent Orders</h3>
              <button
                onClick={loadData}
                className="text-fsd-primary-green hover:text-fsd-primary-green-hover text-sm lg:text-base transition-colors duration-150"
                data-tooltip-id="fsd-refresh-table"
                data-tooltip-content="Refresh Orders"
              >
                <FontAwesomeIcon icon={faSpinner} />
                <ReactTooltip id="fsd-refresh-table" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="fsd-orders-table w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-gray-600 font-semibold">Order ID</th>
                    <th className="p-3 text-gray-600 font-semibold">Fruit</th>
                    <th className="p-3 text-gray-600 font-semibold">Quantity</th>
                    <th className="p-3 text-gray-600 font-semibold">Supplier</th>
                    <th className="p-3 text-gray-600 font-semibold">Delivery Date</th>
                    <th className="p-3 text-gray-600 font-semibold">Status</th>
                    <th className="p-3 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="p-3">{order.orderId}</td>
                      <td className="p-3">{order.fruit}</td>
                      <td className="p-3">{order.quantity}</td>
                      <td className="p-3">{order.supplier?.name || 'N/A'}</td>
                      <td className="p-3">{format(new Date(order.deliveryDate), 'MMM dd, yyyy')}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openModal(order)}
                          className="text-fsd-primary-green hover:text-fsd-primary-green-hover transition-colors duration-150"
                          data-tooltip-id={`fsd-view-${order._id}`}
                          data-tooltip-content="View Details"
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <ReactTooltip id={`fsd-view-${order._id}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Modal - තෝරාගත් order එකේ විස්තර පෙන්වයි */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="fsd-modal bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{
              overlay: { backdropFilter: 'blur(4px)' },
              content: {
                opacity: modalIsOpen ? 1 : 0,
                transform: modalIsOpen ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 300ms ease, transform 300ms ease',
              },
            }}
          >
            {selectedOrder && (
              <>
                <h2 className="fsd-modal-title text-xl font-bold text-gray-800 mb-4">Order Details: {selectedOrder.orderId}</h2>
                <div className="fsd-modal-content space-y-3 text-gray-700 text-sm">
                  <p><strong>Fruit:</strong> {selectedOrder.fruit}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Supplier:</strong> {selectedOrder.supplier?.name || 'N/A'}</p>
                  <p><strong>Delivery Date:</strong> {format(new Date(selectedOrder.deliveryDate), 'MMM dd, yyyy')}</p>
                  <p><strong>Total Price:</strong> Rs. {selectedOrder.totalPrice.toFixed(2)}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Tracking:</strong> {selectedOrder.trackingStatus}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all duration-200 text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </Modal>
        </div>
      </div>
      <Footer />
    </>
  );
}