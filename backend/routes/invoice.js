import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  duplicateInvoice,
  getInvoiceStats,
  getRecentInvoices,
  exportInvoicePDF,
  updateInvoiceStatus,
} from "../controllers/invoice.js";
import { exportInvoices } from "../controllers/export.js";
import { protect, authorize } from "../middlewares/auth.js";
import { createInvoiceValidation } from "../validators/invoice.js";

const router = express.Router();

// Stats and recent - both roles can view
router.get("/stats", protect, getInvoiceStats);
router.get("/recent", protect, getRecentInvoices);

// Create, update, delete 
router.post(
  "/",
  protect,
  authorize("ACCOUNTANT"),
  createInvoiceValidation,
  createInvoice,
);
router.put("/:id", protect, authorize("ACCOUNTANT"), updateInvoice);
router.patch(
  "/:id/status",
  protect,
  authorize("ACCOUNTANT"),
  updateInvoiceStatus,
);
router.delete("/:id", protect, authorize("ACCOUNTANT"), deleteInvoice);
router.post(
  "/:id/duplicate",
  protect,
  authorize("ACCOUNTANT"),
  duplicateInvoice,
);
router.get("/:id/export/pdf", protect, exportInvoicePDF);

// Export routes - both roles can export
router.get(
  "/export/csv",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  exportInvoices,
);

// View operations - both roles can view
router.get("/", protect, getAllInvoices);
router.get("/:id", protect, getInvoiceById);

export default router;
