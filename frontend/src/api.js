import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const client = axios.create({
	baseURL: API_BASE,
	headers: { 'Content-Type': 'application/json' },
});

// Orders
export const fetchOrders = () => client.get('/api/orders');
export const createOrder = (payload) => client.post('/api/orders', payload);
export const updateOrder = (id, payload) => client.put(`/api/orders/${id}`, payload);
export const deleteOrder = (id) => client.delete(`/api/orders/${id}`);

// Suppliers
export const fetchSuppliers = () => client.get('/api/suppliers');
export const createSupplier = (payload) => client.post('/api/suppliers', payload);
export const updateSupplier = (id, payload) => client.put(`/api/suppliers/${id}`, payload);
export const deleteSupplier = (id) => client.delete(`/api/suppliers/${id}`);

// Users / Auth (basic placeholders — expand as needed)
export const fetchUsers = () => client.get('/api/users');

export default client;
