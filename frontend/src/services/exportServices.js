import api from "./api";
import { toast } from "react-toastify";

const exportService = {
  exportToPDF: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/export/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice exported as PDF!");
      return response.data;
    } catch (error) {
      toast.error("Failed to export PDF");
      throw error;
    }
  },

  exportToCSV: async (filters = {}) => {
    try {
      const response = await api.get("/invoices/export/csv", {
        params: filters,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoices-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoices exported to CSV!");
      return response.data;
    } catch (error) {
      toast.error("Failed to export to CSV");
      throw error;
    }
  },
};

export default exportService;
