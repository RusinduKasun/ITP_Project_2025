import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, updateOrder } from '../../Apis/SupplierApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faSpinner, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Supplier/Header';
import Nav from '../../components/Supplier/Nav';
import Footer from '../../components/Supplier/Footer';

export default function SupplierResponse() {
  const navigate = useNavigate();
  // orders, loading, refreshLoading, error කියන state වලින් තොරතුරු තබාගන්නවා
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState(null);

  // pending orders ලබාගන්න function එක
  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders();
      // pending orders පමණක් filter කරනවා
      const pendingOrders = Array.isArray(res?.data) ? res.data.filter(order => order?.status === 'pending') : [];
      setOrders(pendingOrders);
      setError(null);
      // pending orders නැත්නම් info toast එකක් පෙන්වයි
      if (pendingOrders.length === 0) {
        toast.info('No pending orders found.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err) {
      // error එකක් ආවොත් error message එකක් set කරනවා සහ toast එකක් පෙන්වයි
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      toast.error('Failed to fetch orders.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // component එක load වෙද්දී pending orders load කරනවා
  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // order එක approve/deny කරන function එක
  const handleResponse = async (orderId, status) => {
    try {
      await updateOrder(orderId, { status });
      await fetchPendingOrders();
      // success toast එකක් පෙන්වයි
      toast.success(`Order ${status} successfully`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      // error එකක් ආවොත් error message එකක් set කරනවා සහ toast එකක් පෙන්වයි
      console.error('Error updating order:', err);
      setError('Failed to update order status');
      toast.error('Failed to update order status.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // orders refresh කරන function එක
  const refreshOrders = async () => {
    try {
      setRefreshLoading(true);
      await fetchPendingOrders();
      toast.success('Orders refreshed successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Error refreshing orders:', err);
      toast.error('Failed to refresh orders.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setRefreshLoading(false);
    }
  };

  // loading වෙද්දී spinner එකක් පෙන්වයි
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-700 text-4xl" />
      </div>
    );
  }

  // error එකක් තියෙනවා නම් error message එකක් පෙන්වයි
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-destructive-red">{error}</p>
      </div>
    );
  }

  // main UI එක render කරනවා
  return (
    <>
     
      <Nav />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ToastContainer />
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary-green">Pending Order Notifications</h2>
            {/* Refresh button එක */}
            <button
              onClick={refreshOrders}
              disabled={refreshLoading}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 inline-flex items-center transition-colors duration-150 ${refreshLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              data-tooltip-id="refresh-tooltip"
              data-tooltip-content="Refresh pending orders"
            >
              <FontAwesomeIcon
                icon={refreshLoading ? faSpinner : faRotate}
                spin={refreshLoading}
                className="mr-2"
              />
              {refreshLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Tooltip id="refresh-tooltip" />
          </div>
          {/* pending orders නැත්නම් message එකක්, නැත්නම් orders list එකක් පෙන්වයි */}
          {orders.length === 0 ? (
            <p className="text-text-secondary">No pending orders to display</p>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="border p-4 rounded-lg bg-gray-50">
                  <p><strong>Order ID:</strong> {order.orderId || 'N/A'}</p>
                  <p><strong>Fruit:</strong> {order.fruit || 'N/A'}</p>
                  <p><strong>Quantity:</strong> {order.quantity || 0}</p>
                  <p><strong>Delivery Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Total Price:</strong> Rs. {(order.totalPrice || 0).toFixed(2)}</p>
                  <p><strong>Supplier:</strong> {order.supplier?.name || 'N/A'}</p>
                  <p><strong>Status:</strong> {order.status || 'N/A'}</p>
                  {/* Approve සහ Deny buttons */}
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => handleResponse(order._id, 'approved')}
                      className="bg-primary-green text-white p-2 rounded hover:bg-[#266b2a] flex items-center transition-colors duration-150"
                      data-tooltip-id={`approve-${order._id}`}
                      data-tooltip-content="Approve order"
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleResponse(order._id, 'denied')}
                      className="bg-destructive-red text-white p-2 rounded hover:bg-red-600 flex items-center transition-colors duration-150"
                      data-tooltip-id={`deny-${order._id}`}
                      data-tooltip-content="Deny order"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Deny
                    </button>
                    <Tooltip id={`approve-${order._id}`} />
                    <Tooltip id={`deny-${order._id}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}