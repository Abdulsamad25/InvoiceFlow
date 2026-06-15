/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import invoiceService from "../services/invoiceService";

export const useInvoices = (filters = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchInvoices = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.getAll({ ...filters, ...params });
      // Extract the invoices array from the response
      const invoiceData = response.invoices || response.data?.invoices || [];
      setInvoices(invoiceData);

      if (response.pagination || response.data?.pagination) {
        setPagination(response.pagination || response.data?.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData) => {
    const response = await invoiceService.create(invoiceData);
    const newInvoice = response.invoice || response.data?.invoice || response;
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id, invoiceData) => {
    const response = await invoiceService.update(id, invoiceData);
    const updated = response.invoice || response.data?.invoice || response;
    setInvoices((prev) =>
      prev.map((inv) => ((inv.id || inv._id) === id ? updated : inv)),
    );
    return updated;
  };

  const deleteInvoice = async (id) => {
    await invoiceService.delete(id);
    setInvoices((prev) => prev.filter((inv) => (inv.id || inv._id) !== id));
  };

  const updateStatus = async (id, status) => {
    const response = await invoiceService.updateStatus(id, status);
    const updated = response.invoice || response.data?.invoice || response;
    setInvoices((prev) =>
      prev.map((inv) =>
        (inv.id || inv._id) === id ? { ...inv, status } : inv,
      ),
    );
    return updated;
  };

  useEffect(() => {
    fetchInvoices();
  }, [JSON.stringify(filters)]);

  return {
    invoices,
    loading,
    error,
    pagination,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus,
    refetch: fetchInvoices,
  };
};
