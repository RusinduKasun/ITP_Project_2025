// Calendar.jsx
import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isBefore, startOfDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPlus, faSpinner, faEdit, faTrash, faRefresh, faSearch } from '@fortawesome/free-solid-svg-icons';
import { fetchOrders, createOrder, fetchSuppliers, updateOrder, deleteOrder } from '../../Apis/SupplierApi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Tooltip } from 'react-tooltip';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Supplier/Header';
import Nav from '../../components/Supplier/Nav';
import Footer from '../../components/Supplier/Footer';
import Nav1 from '../../pages/Home/Nav/Nav';
// Modal එකේ root element එක set කරනවා
Modal.setAppElement('#root');

// date-fns වලින් localizer එකක් හදනවා
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});
// Main Calendar component එක export කරනවා
export default function Calendar() {
  // State variables (ස්ථාවරයන්) නිර්වචනය කරනවා
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [form, setForm] = useState({ fruit: '', quantity: 1, supplier: '', deliveryDate: '' });
  const [totalPrice, setTotalPrice] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fruits, setFruits] = useState([]);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // පළමුව orders සහ suppliers load කරනවා
  useEffect(() => {
    load();
    loadSuppliers();
  }, []);

  // suppliers වලින් fruits ලැයිස්තුව හදනවා
  useEffect(() => {
    const allFruits = suppliers.flatMap(s => s.fruits || []);
    setFruits([...new Set(allFruits)]);
  }, [suppliers]);

  // fruit එක තෝරලා supplier filter කරනවා
  useEffect(() => {
    if (form.fruit) {
      const filtered = suppliers.filter(s => s.fruits.includes(form.fruit));
      setFilteredSuppliers(filtered);
      if (!filtered.some(s => s._id === form.supplier)) {
        setForm(prev => ({ ...prev, supplier: '' }));
      }
    } else {
      setFilteredSuppliers([]);
    }
  }, [form.fruit, suppliers]);

  // fruit, supplier, quantity අනුව total price ගණනය කරනවා
  useEffect(() => {
    if (form.fruit && form.supplier && form.quantity > 0) {
      const selectedSupplier = suppliers.find(s => s._id === form.supplier);
      if (selectedSupplier) {
        const priceEntry = selectedSupplier.priceList.find(p => p.fruit === form.fruit);
        if (priceEntry) {
          setTotalPrice(priceEntry.pricePerUnit * form.quantity);
          return;
        }
      }
    }
    setTotalPrice(0);
  }, [form.fruit, form.supplier, form.quantity, suppliers]);

  // orders load කරන function එක
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchOrders();
      // Delivered orders filter කරනවා
      const filteredOrders = Array.isArray(res.data)
        ? res.data.filter(order => order.trackingStatus !== 'Delivered')
        : [];
      setOrders(filteredOrders);
      setError(null);
      toast.success('Orders loaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      // error එකක් ආවොත් error message එකක් දක්වනවා
      console.error('Error fetching orders:', err);
      setOrders([]);
      setError('Failed to load orders. Please try again.');
      toast.error('Failed to load orders. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // suppliers load කරන function එක
  const loadSuppliers = async () => {
    try {
      const res = await fetchSuppliers();
      setSuppliers(Array.isArray(res.data) ? res.data : []);
      toast.success('Suppliers loaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
      setError('Failed to load suppliers. Please try again.');
      toast.error('Failed to load suppliers. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Form එක validate කරන function එක
  const validateForm = () => {
    const errors = {};
    if (!form.fruit) {
      errors.fruit = 'Fruit is required.';
      toast.error('Fruit is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (!form.quantity || form.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0.';
      toast.error('Quantity must be greater than 0.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (!form.supplier) {
      errors.supplier = 'Supplier is required.';
      toast.error('Supplier is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (!form.deliveryDate) {
      errors.deliveryDate = 'Delivery date is required.';
      toast.error('Delivery date is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (isBefore(new Date(form.deliveryDate), startOfDay(new Date('2025-09-09')))) {
      errors.deliveryDate = 'Delivery date cannot be in the past.';
      toast.error('Delivery date cannot be in the past.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // හොඳම supplier එක සොයන function එක
  const findBestSupplier = () => {
    if (!form.fruit || form.quantity <= 0) {
      setError('Please select a fruit and valid quantity.');
      toast.error('Select a fruit and valid quantity to find the best supplier.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setSearching(true);
    setError(null);

    // Searching messages (පණිවිඩ) පෙළක්
    const messages = [
      'Going through the data...',
      'Finding the cheapest at the moment...',
      'Almost there...',
    ];
    let messageIndex = 0;
    setSearchMessage(messages[0]);
    toast.info(messages[0], {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      toastId: 'search-toast',
    });

    // Message එක interval එකකින් වෙනස් වෙනවා
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setSearchMessage(messages[messageIndex]);
      toast.update('search-toast', {
        render: messages[messageIndex],
        position: 'top-right',
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, 1500);

    // 5 seconds පසුව හොඳම supplier එක සොයනවා
    setTimeout(() => {
      clearInterval(messageInterval);
      toast.dismiss('search-toast');
      const filtered = suppliers.filter(s => s.fruits.includes(form.fruit));
      if (filtered.length === 0) {
        setError('No suppliers available for this fruit.');
        toast.error('No suppliers available for this fruit.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setSearching(false);
        setSearchMessage('');
        return;
      }
      // හොඳම (අඩුම මිල) supplier එක තෝරනවා
      const bestSupplier = filtered.reduce((best, supplier) => {
        const priceEntry = supplier.priceList.find(p => p.fruit === form.fruit);
        if (!priceEntry) return best;
        if (!best || priceEntry.pricePerUnit < best.pricePerUnit) {
          return { ...supplier, pricePerUnit: priceEntry.pricePerUnit };
        }
        return best;
      }, null);
      if (bestSupplier) {
        setForm(prev => ({ ...prev, supplier: bestSupplier._id }));
        setTotalPrice(bestSupplier.pricePerUnit * form.quantity);
        setError(null);
        setSearchMessage('Best supplier found!');
        toast.success(`Best supplier found: ${bestSupplier.name}!`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => setSearchMessage(''), 3000);
      } else {
        setError('No valid pricing found for this fruit.');
        toast.error('No valid pricing found for this fruit.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setSearchMessage('');
      }
      setSearching(false);
    }, 5000);
  };

  // Form එක submit කරන function එක
  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setError(null);
    try {
      const payload = {
        fruit: form.fruit,
        quantity: parseInt(form.quantity),
        supplier: form.supplier,
        deliveryDate: form.deliveryDate,
      };
      if (isEditing) {
        // Edit කරන විට updateOrder call කරනවා
        const updatedOrder = await updateOrder(editingOrderId, payload);
        console.log('Update success:', updatedOrder.data);
        toast.success(`Order ${updatedOrder.data.orderId} updated successfully!`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Console එකට notification එකක් print කරනවා
        console.log(
          `Notification sent to supplier ${updatedOrder.data.supplier.name}: Updated order ${updatedOrder.data.orderId} for ${payload.quantity} of ${payload.fruit} on ${payload.deliveryDate}. ` +
          `Please visit http://localhost:5173/supplier-response to confirm or deny.`
        );
        console.log(`Updated order ${editingOrderId}`);
      } else {
        // නව order එකක් create කරනවා
        const newOrder = await createOrder(payload);
        console.log('Create success:', newOrder.data);
        toast.success('Order created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.log('Created new order');
      }
      // Form එක reset කරනවා
      setForm({ fruit: '', quantity: 1, supplier: '', deliveryDate: '' });
      setTotalPrice(0);
      setFormErrors({});
      setIsEditing(false);
      setEditingOrderId(null);
      setTimeout(async () => {
        setModalIsOpen(false);
        await load();
      }, 1000);
    } catch (err) {
      // Error එකක් ආවොත් error message එකක් දක්වනවා
      console.error('Error submitting order:', err);
      const errorMsg = `Failed to ${isEditing ? 'update' : 'create'} order. Please try again.`;
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Modal එක open කරන function එක
  const openModal = (order = null) => {
    if (modalIsOpen) return;
    if (order) {
      // Edit mode එකට යනවා
      setIsEditing(true);
      setEditingOrderId(order._id);
      setForm({
        fruit: order.fruit,
        quantity: order.quantity,
        supplier: order.supplier._id || order.supplier,
        deliveryDate: new Date(order.deliveryDate).toISOString().split('T')[0],
      });
      toast.info('Opening order form for editing...', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      // නව order එකක් add කරන විට
      setIsEditing(false);
      setEditingOrderId(null);
      setForm({ fruit: '', quantity: 1, supplier: '', deliveryDate: '' });
      toast.info('Opening new order form...', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setError(null);
    setSearchMessage('');
    setFormErrors({});
    setModalIsOpen(true);
  };

  // Modal එක close කරන function එක
  const closeModal = () => {
    setModalIsOpen(false);
    setIsEditing(false);
    setEditingOrderId(null);
    setForm({ fruit: '', quantity: 1, supplier: '', deliveryDate: '' });
    setTotalPrice(0);
    setError(null);
    setSearching(false);
    setSearchMessage('');
    setFormErrors({});
    toast.info('Form closed.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    toast.dismiss('search-toast');
  };

  // Order එක delete කරන function එක
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        toast.success('Order deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.log(`Deleted order ${id}`);
        await load();
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order. Please try again.');
        toast.error('Failed to delete order. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  // Data refresh කරන function එක
  const refreshData = async () => {
    await load();
    toast.info('Calendar refreshed!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Orders වලින් calendar events හදනවා
  const events = orders.map(order => ({
    id: order._id,
    title: `${order.fruit} (${order.quantity}) - Rs. ${order.totalPrice} - ${order.status}`,
    start: new Date(order.deliveryDate),
    end: new Date(order.deliveryDate),
    resource: order,
  }));

  // Status එක අනුව color themes set කරනවා
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return {
          background: 'linear-gradient(145deg, #d1fae5, #a7f3d0)',
          color: '#065f46',
          borderLeftColor: '#10b981',
        };
      case 'denied':
        return {
          background: 'linear-gradient(145deg, #fee2e2, #fecaca)',
          color: '#991b1b',
          borderLeftColor: '#ef4444',
        };
      default:
        return {
          background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
          color: '#1f2937',
          borderLeftColor: '#9ca3af',
        };
    }
  };

  // Loading වෙද්දී spinner එකක් පෙන්වනවා
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-700 text-4xl" />
      </div>
    );
  }

  // Main UI එක render කරනවා
  return (
    <>
    <Nav1/>
      <Nav />
      <div className="min-h-screen bg-white">
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center mb-8">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary-green text-2xl mr-3" />
            <h1 className="text-3xl font-bold text-primary-green">Order Calendar</h1>
          </div>

          {/* Error message එකක් තියෙනවා නම් පෙන්වනවා */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-destructive-red rounded-lg">
              {error}
            </div>
          )}

          {/* Add Order, Refresh buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => openModal()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 flex items-center transition-colors duration-200"
              data-tooltip-id="add-order-tooltip"
              data-tooltip-content="Add a new order"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Order
            </button>
            <button
              onClick={refreshData}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 flex items-center transition-colors duration-200"
              data-tooltip-id="refresh-tooltip"
              data-tooltip-content="Refresh calendar"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Refresh
            </button>
            <Tooltip id="add-order-tooltip" />
            <Tooltip id="refresh-tooltip" />
          </div>

          {/* Calendar එක */}
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={(event) => openModal(event.resource)}
            eventPropGetter={(event) => {
              const style = getStatusColor(event.resource.status);
              return {
                style: {
                  background: style.background,
                  color: style.color,
                  borderLeft: `4px solid ${style.borderLeftColor}`,
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                },
              };
            }}
            components={{
              event: ({ event }) => (
                <div className="flex justify-between items-center">
                  <span>{event.title}</span>
                  <div className="flex gap-2">
                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(event.resource);
                      }}
                      className="text-primary-green hover:text-[#266b2a]"
                      data-tooltip-id={`edit-${event.id}`}
                      data-tooltip-content="Edit order"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      <Tooltip id={`edit-${event.id}`} />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                      className="text-destructive-red hover:text-red-600"
                      data-tooltip-id={`delete-${event.id}`}
                      data-tooltip-content="Delete order"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <Tooltip id={`delete-${event.id}`} />
                    </button>
                  </div>
                </div>
              ),
            }}
          />

          {/* Modal එක */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="bg-white p-10 rounded-xl shadow-2xl max-w-5xl mx-auto mt-24 max-h-[80vh] overflow-y-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]"
            style={{
              overlay: {
                backdropFilter: 'blur(4px)',
              },
              content: {
                opacity: modalIsOpen ? 1 : 0,
                transform: modalIsOpen ? 'scale(1)' : 'scale(0.95)',
                transition: 'opacity 300ms ease, transform 300ms ease',
              },
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-primary-green">{isEditing ? 'Edit Order' : 'Add Order'}</h2>
            {error && <p className="text-destructive-red mb-4">{error}</p>}
            <form onSubmit={submit} className="space-y-6">
              {/* Fruit select */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Fruit *</label>
                <select
                  value={form.fruit}
                  onChange={e => setForm({ ...form, fruit: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green bg-gray-50 transition-all duration-200 ${formErrors.fruit ? 'border-destructive-red' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select Fruit</option>
                  {fruits.map(fruit => (
                    <option key={fruit} value={fruit}>{fruit}</option>
                  ))}
                </select>
                {formErrors.fruit && <p className="text-destructive-red text-sm mt-1">{formErrors.fruit}</p>}
              </div>
              {/* Quantity input */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green bg-gray-50 transition-all duration-200 ${formErrors.quantity ? 'border-destructive-red' : 'border-gray-300'}`}
                  required
                />
                {formErrors.quantity && <p className="text-destructive-red text-sm mt-1">{formErrors.quantity}</p>}
              </div>
              {/* Supplier select සහ Best Fit button */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-2">Supplier *</label>
                  <select
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green bg-gray-50 transition-all duration-200 ${formErrors.supplier ? 'border-destructive-red' : 'border-gray-300'}`}
                    required
                    disabled={!form.fruit || searching}
                  >
                    <option value="">Select Supplier</option>
                    {filteredSuppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  {formErrors.supplier && <p className="text-destructive-red text-sm mt-1">{formErrors.supplier}</p>}
                </div>
                {/* Best Fit button */}
                <button
                  type="button"
                  onClick={findBestSupplier}
                  className={`relative px-4 py-3 rounded-lg inline-flex items-center transition-all duration-200 transform hover:-translate-y-0.5 ${searching ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#257225] text-white hover:bg-[#266b2a] px-4 py-2 rounded'}`}
                  disabled={!form.fruit || form.quantity <= 0 || searching}
                  data-tooltip-id="best-fit-tooltip"
                  data-tooltip-content={searching ? searchMessage : 'Find the cheapest supplier for this fruit'}
                >
                  {searching ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Searching...
                      <span className="absolute inset-0 bg-primary-green opacity-50 rounded-lg animate-pulse" />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="mr-2" />
                      Find the Best Fit
                    </>
                  )}
                </button>
                <Tooltip id="best-fit-tooltip" />
              </div>
              {/* Searching messages */}
              {searching && (
                <p className="text-primary-green font-medium animate-pulse">{searchMessage}</p>
              )}
              {searchMessage && !searching && (
                <p className="text-primary-green font-medium">{searchMessage}</p>
              )}
              {/* Delivery date input */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Delivery Date *</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green bg-gray-50 transition-all duration-200 ${formErrors.deliveryDate ? 'border-destructive-red' : 'border-gray-300'}`}
                  required
                />
                {formErrors.deliveryDate && <p className="text-destructive-red text-sm mt-1">{formErrors.deliveryDate}</p>}
              </div>
              {/* Total price display */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Total Price</label>
                <p className="p-3 bg-gray-100 rounded-lg text-text-primary font-medium">Rs. {totalPrice.toFixed(2)}</p>
              </div>
              {/* Cancel සහ Submit buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                   className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                   className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 flex items-center transition-colors duration-200"
                >
                  {isEditing ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
      <Footer />
    </>
  );
}