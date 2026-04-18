import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getCustomers = () => apiClient.get('/customers');
export const getCustomerDetail = (id) => apiClient.get(`/customers/${id}`);
export const createCustomer = (data) => apiClient.post('/customers', data);
export const deleteCustomer = (id) => apiClient.delete(`/customers/${id}`);
export const queryAI = (query) => apiClient.post('/ai/query', { query });

export default apiClient;
