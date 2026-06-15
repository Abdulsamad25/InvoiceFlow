/* eslint-disable no-useless-catch */
import api from "./api";
import { toast } from "react-toastify";

const invoiceService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/invoices", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data.invoice;
    } catch (error) {
      throw error;
    }
  },

  create: async (invoiceData) => {
    try {
      const response = await api.post("/invoices", invoiceData);
      toast.success("Invoice created successfully!");
      return response.data.invoice;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      toast.success("Invoice updated successfully!");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted successfully!");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/invoices/${id}/status`, { status });
      toast.success(`Invoice status updated to ${status}!`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/invoices/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRecent: async (limit = 5) => {
    try {
      const response = await api.get("/invoices/recent", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default invoiceService;
