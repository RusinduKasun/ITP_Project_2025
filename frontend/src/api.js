import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Suppliers
export const fetchSuppliers = () => API.get('/suppliers');
export const createSupplier = (data) => API.post('/suppliers', data);
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// Orders
export const fetchOrders = () => API.get('/orders');
export const createOrder = (data) => API.post('/orders', data);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const getOrder = (id) => API.get(`/orders/${id}`);