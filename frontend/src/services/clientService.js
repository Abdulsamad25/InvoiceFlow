/* eslint-disable no-useless-catch */
import api from './api';
import { toast } from 'react-toastify';

const clientService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      toast.success('Client created successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      toast.success('Client updated successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      toast.success('Client deleted successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  search: async (query) => {
    try {
      const response = await api.get('/clients/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default clientService;