// OrderDetails.jsx
import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrder } from '../../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCheckCircle, faSpinner, faBox, faSearch, faFilePdf, faDownload, faRefresh, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { Tooltip } from 'react-tooltip';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ErrorBoundary ක්ලාස් එක - දෝෂයක් ඇතිවුවහොත් පෙන්වන්න
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-destructive-red text-center font-medium">Something went wrong. Please try again later.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

// Modal එකේ root එක සකසයි
Modal.setAppElement('#root');

export default function OrderDetails() {
  // State variable එකන් - orders, loading, error, tracking, search, filter, sort, modal, expanded orders
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  // Tracking status වල ලැයිස්තුව
  const trackingStatuses = ['Order Placed', 'Approved', 'In Transit', 'Out for Delivery', 'Delivered'];

  // Component එක load වෙද්දී orders load කරන්න
  useEffect(() => {
    loadOrders();
  }, []);

  // Orders, search, filter, sort වෙනස්වූ විට filteredOrders update කරන්න
  useEffect(() => {
    // approved orders පමණක් ගන්නවා
    let filtered = orders.filter(order => order.status === 'approved');
    // Search query එකට අනුව filter කරන්න
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.fruit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Status එකට අනුව filter කරන්න
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.trackingStatus === filterStatus);
    }
    // Sort කිරීම
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'date') {
        aVal = new Date(a.deliveryDate);
        bVal = new Date(b.deliveryDate);
      } else if (sortBy === 'price') {
        aVal = a.totalPrice;
        bVal = b.totalPrice;
      } else if (sortBy === 'supplier') {
        aVal = a.supplier.name;
        bVal = b.supplier.name;
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setFilteredOrders(filtered);
  }, [orders, searchQuery, filterStatus, sortBy, sortOrder]);

  // Orders fetch කිරීම (API එකෙන්)
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Tracking status update කිරීම (API call)
  const updateTracking = async (orderId, newStatus) => {
    try {
      setTracking(prev => ({ ...prev, [orderId]: newStatus }));
      await updateOrder(orderId, { trackingStatus: newStatus });
      await loadOrders();
    } catch (err) {
      console.error('Tracking update failed:', err);
      setError('Failed to update tracking status');
    }
  };

  // Order එකේ tracking status එක ලබාගන්න
  const getTrackingStatus = (orderId) => {
    return tracking[orderId] || orders.find(o => o._id === orderId)?.trackingStatus || 'Order Placed';
  };

  // Tracking timeline එකක් ලබාදෙයි (status එක අනුව)
  const getTrackingTimeline = (orderId) => {
    const currentStatus = getTrackingStatus(orderId);
    return trackingStatuses.map((step, index) => ({
      step,
      completed: trackingStatuses.indexOf(currentStatus) >= index,
    }));
  };

  // Modal එක විවෘත කිරීම
  const openModal = (order) => {
    setSelectedOrder(order);
    setModalIsOpen(true);
  };

  // Modal එක වසාදැමීම
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrder(null);
  };

  // Order එක expand/collapse කිරීම
  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // CSV එකක් export කිරීම
  const exportToCSV = () => {
    const headers = ['Order ID', 'Fruit', 'Quantity', 'Supplier', 'Delivery Date', 'Total Price', 'Status', 'Tracking Status'];
    const csv = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.orderId,
        order.fruit,
        order.quantity,
        order.supplier?.name || 'N/A',
        new Date(order.deliveryDate).toLocaleDateString(),
        order.totalPrice.toFixed(2),
        order.status,
        getTrackingStatus(order._id),
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF එකක් generate කිරීම (jsPDF සහ autoTable භාවිතා කරයි)
  const generatePDF = () => {
  const doc = new jsPDF();
  
  // වර්ණ set කිරීම
  const primaryGreen = [34, 107, 42];
  const lightGreen = [76, 175, 80];
  const darkGray = [64, 64, 64];
  const lightGray = [245, 245, 245];
  const white = [255, 255, 255];
  
  // Header එක, ලාංඡනය සහ මාතෘකාව
  doc.setFillColor(...primaryGreen);
  doc.rect(0, 0, 210, 35, 'F'); // Header background
  
  // සමාගමේ නම/ලාංඡනය
  doc.setTextColor(...white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FruitFlow', 20, 20);
  
  // උප මාතෘකාව
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Order Management System', 20, 28);
  
  // Report මාතෘකාව
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details Report', 105, 50, { align: 'center' });
  
  // දිනය සහ සාරාංශ තොරතුරු
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  doc.text(`Generated on: ${currentDate} at ${currentTime}`, 20, 60);
  doc.text(`Total Orders: ${filteredOrders.length}`, 20, 68);
  
  // සාරාංශය සඳහා මුළු වටිනාකම හා ප්‍රමාණය ගණනය කිරීම
  const totalValue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantity, 0);
  
  doc.text(`Total Value: Rs. ${totalValue.toFixed(2)}`, 105, 60);
  doc.text(`Total Quantity: ${totalQuantity}`, 105, 68);
  
  // රූපලාවණ්‍ය රේඛාවක් ඇඳීම
  doc.setDrawColor(...lightGreen);
  doc.setLineWidth(1);
  doc.line(20, 75, 190, 75);
  
  // Table එකේ තීරු
  const tableColumn = [
    'Order ID', 
    'Fruit', 
    'Qty', 
    'Supplier', 
    'Delivery Date', 
    'Price (Rs.)', 
    'Status', 
    'Tracking'
  ];
  
  // Table එකේ පේළි
  const tableRows = filteredOrders.map(order => [
    order.orderId,
    order.fruit,
    order.quantity.toString(),
    order.supplier?.name || 'N/A',
    new Date(order.deliveryDate).toLocaleDateString(),
    order.totalPrice.toFixed(2),
    order.status.charAt(0).toUpperCase() + order.status.slice(1),
    getTrackingStatus(order._id),
  ]);

  // Table එක autoTable එකෙන් ඇඳීම
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 85,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryGreen,
      textColor: white,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold' }, // Order ID
      1: { halign: 'left' }, // Fruit
      2: { halign: 'center' }, // Quantity
      3: { halign: 'left' }, // Supplier
      4: { halign: 'center' }, // Delivery Date
      5: { halign: 'right', fontStyle: 'bold' }, // Price
      6: { halign: 'center' }, // Status
      7: { halign: 'center' } // Tracking
    },
    styles: {
      lineColor: primaryGreen,
      lineWidth: 0.1,
    },
    margin: { left: 20, right: 20 },
    didDrawPage: function (data) {
      // පිටු අංකය සහ footer එක
      const pageCount = doc.internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height;
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageSize.width / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Footer line
      doc.setDrawColor(...lightGreen);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 15, pageSize.width - 20, pageHeight - 15);
    }
  });
  
  // Table එකෙන් පසුව සාරාංශය
  const finalY = doc.lastAutoTable.finalY + 15;
  
  // සාරාංශ box එක
  doc.setFillColor(...lightGray);
  doc.roundedRect(20, finalY, 170, 35, 3, 3, 'F');
  
  // සාරාංශ මාතෘකාව
  doc.setTextColor(...primaryGreen);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Summary', 25, finalY + 10);
  
  // සාරාංශ විස්තර
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    `Total Orders: ${filteredOrders.length}`,
    `Total Quantity: ${totalQuantity} units`,
    `Total Value: Rs. ${totalValue.toFixed(2)}`,
    `Average Order Value: Rs. ${(totalValue / filteredOrders.length || 0).toFixed(2)}`
  ];
  
  summaryData.forEach((item, index) => {
    doc.text(item, 25 + (index % 2) * 85, finalY + 20 + Math.floor(index / 2) * 8);
  });
  
  // Status breakdown එක
  const statusCounts = {};
  filteredOrders.forEach(order => {
    const status = getTrackingStatus(order._id);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  // Status distribution එක ඇතුළත් කිරීම
  if (finalY + 55 < doc.internal.pageSize.height - 30) {
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Status Distribution:', 25, finalY + 50);
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 60;
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / filteredOrders.length) * 100).toFixed(1);
      doc.text(`${status}: ${count} orders (${percentage}%)`, 25, yPos);
      yPos += 6;
    });
  }
  
  // Timestamp එකක් සහිතව PDF එක save කිරීම
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  doc.save(`order-details-report-${timestamp}.pdf`);
};

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* මාතෘකාව සහ විස්තර */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faBox} className="text-primary-green text-2xl mr-3" />
            <h1 className="text-3xl font-bold text-primary-green">Order Details</h1>
          </div>
          <p className="text-text-secondary">Track and manage your orders efficiently</p>
        </div>

        {/* Loading වෙද්දී පෙන්වන්න */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <FontAwesomeIcon icon={faSpinner} spin className="text-primary-green text-4xl mb-4" />
            <p className="text-text-secondary">Loading orders...</p>
          </div>
        )}

        {/* Error එකක් තිබේ නම් පෙන්වන්න */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading නැත්නම් main UI එක */}
        {!loading && (
          <ErrorBoundary>
            {/* Search, filter, sort, export, refresh */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* සෙවීම */}
                <div className="relative flex-1 min-w-0 w-full lg:w-auto">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by fruit or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  />
                </div>
                {/* Filter, sort, order */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value="all">All Statuses</option>
                    {trackingStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="price">Sort by Price</option>
                    <option value="supplier">Sort by Supplier</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                {/* Export, refresh බොත්තම් */}
                <div className="flex gap-4 w-full lg:w-auto justify-end">
                  <button
                    onClick={generatePDF}
                    className="bg-primary-green text-white px-4 py-2 rounded hover:bg-[#266b2a] flex items-center"
                    data-tooltip-id="pdf-tooltip"
                    data-tooltip-content="Download PDF"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                    PDF
                  </button>
                  <Tooltip id="pdf-tooltip" />
                  <button
                    onClick={exportToCSV}
                    className="bg-primary-green-500 text-white px-4 py-2 rounded hover:bg-[#266b2a]-600 flex items-center"
                    data-tooltip-id="csv-tooltip"
                    data-tooltip-content="Download CSV"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    CSV
                  </button>
                  <Tooltip id="csv-tooltip" />
                  <button
                    onClick={loadOrders}
                    className="bg-gray-300 text-text-primary px-4 py-2 rounded hover:bg-gray-400 flex items-center"
                    data-tooltip-id="refresh-tooltip"
                    data-tooltip-content="Refresh orders"
                  >
                    <FontAwesomeIcon icon={faRefresh} />
                  </button>
                  <Tooltip id="refresh-tooltip" />
                </div>
              </div>
            </div>

            {/* Orders ලැයිස්තුව */}
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                // Orders නැත්නම් පෙන්වන්න
                <div className="text-center py-16">
                  <div className="text-8xl mb-4">📦</div>
                  <h3 className="text-xl font-medium text-text-primary mb-2">No orders found</h3>
                  <p className="text-text-secondary">Try adjusting your search or filters</p>
                </div>
              ) : (
                // Orders තිබේ නම් එකින් එක පෙන්වන්න
                filteredOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-primary-green mb-2">{order.orderId} - {order.fruit}</h2>
                        <p className="text-text-secondary mb-1">Quantity: {order.quantity}</p>
                        <p className="text-text-secondary mb-1">Supplier: {order.supplier?.name || 'N/A'}</p>
                        <p className="text-text-secondary mb-1">Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                        <p className="text-text-secondary mb-1">Price: Rs. {order.totalPrice.toFixed(2)}</p>
                      </div>
                      {/* Expand/collapse බොත්තම */}
                      <button
                        onClick={() => toggleOrder(order._id)}
                        className="text-primary-green hover:text-[#266b2a]"
                        data-tooltip-id={`toggle-${order._id}`}
                        data-tooltip-content={expandedOrders[order._id] ? 'Collapse order' : 'Expand order'}
                      >
                        <FontAwesomeIcon icon={expandedOrders[order._id] ? faChevronUp : faChevronDown} />
                        <Tooltip id={`toggle-${order._id}`} />
                      </button>
                    </div>
                    {/* Expand වෙද්දී tracking විස්තර */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedOrders[order._id] ? 'max-h-[1000px]' : 'max-h-0'
                      }`}
                    >
                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-2 text-primary-green">Tracking Details</h3>
                        <div className="flex items-center mb-2">
                          <FontAwesomeIcon icon={faTruck} className="text-blue-500 mr-2" />
                          <span className="text-text-primary">Status: {getTrackingStatus(order._id)}</span>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Timeline</h4>
                          <div className="space-y-1">
                            {getTrackingTimeline(order._id).map((item, index) => (
                              <div key={index} className={`flex items-center ${item.completed ? 'text-green-600' : 'text-gray-400'}`}>
                                <FontAwesomeIcon icon={faCheckCircle} className={item.completed ? 'mr-2' : 'mr-2 opacity-50'} />
                                {item.step}
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Status update select එක */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-text-primary">Update Status:</label>
                          <select
                            value={getTrackingStatus(order._id)}
                            onChange={(e) => updateTracking(order._id, e.target.value)}
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green w-48" // Adjusted width with w-48 (192px)
                            data-tooltip-id={`update-status-${order._id}`}
                            data-tooltip-content="Update tracking status"
                          >
                            {trackingStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <Tooltip id={`update-status-${order._id}`} />
                        </div>
                        {/* Modal එක විවෘත කිරීම */}
                        <button
                          onClick={() => openModal(order)}
                          className="bg-gray-300 text-text-primary px-4 py-2 rounded hover:bg-gray-400 mt-2 ml-2"
                          data-tooltip-id={`details-${order._id}`}
                          data-tooltip-content="View full details"
                        >
                          View Details
                        </button>
                        <Tooltip id={`details-${order._id}`} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ErrorBoundary>
        )}

        {/* Modal එක - order එකේ සම්පූර්ණ විස්තර */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto mt-20"
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
              <h2 className="text-2xl font-bold mb-4 text-primary-green">Order Details: {selectedOrder.orderId}</h2>
              <p><strong>Fruit:</strong> {selectedOrder.fruit}</p>
              <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
              <p><strong>Supplier:</strong> {selectedOrder.supplier?.name || 'N/A'}</p>
              <p><strong>Delivery Date:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
              <p><strong>Total Price:</strong> Rs. {selectedOrder.totalPrice.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Tracking:</strong> {getTrackingStatus(selectedOrder._id)}</p>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={closeModal} className="bg-gray-300 text-text-primary px-4 py-2 rounded hover:bg-gray-400">
                  Close
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}