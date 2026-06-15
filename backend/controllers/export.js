import Invoice from "../models/invoice.js";
import { exportToCSV } from "../services/export.js";
import { logAction } from "../utils/logger.js";

export const exportInvoices = async (req, res) => {
  try {
    const { status, clientId, startDate, endDate } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate("clientId")
      .populate("bankId")
      .sort({ createdAt: -1 });

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found for export" });
    }

    const exportData = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientId?.name || "N/A",
      clientEmail: invoice.clientId?.email || "N/A",
      issueDate: invoice.issueDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discount: invoice.discount,
      total: invoice.total,
      currency: invoice.currency,
      bankName: invoice.bankId?.bankName || "N/A",
      accountNumber: invoice.bankId?.accountNumber || "N/A",
      accountName: invoice.bankId?.accountName || "N/A",
    }));

    const fileBuffer = await exportToCSV(exportData);
    const filename = `invoices_${Date.now()}.csv`;
    const mimeType = "text/csv";

    await logAction(
      req.user.id,
      "invoices_exported",
      "export",
      null,
      `Exported ${invoices.length} invoices as CSV`,
      req.ip,
    );

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
