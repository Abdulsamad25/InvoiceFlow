import express from 'express';
import { exportInvoices } from '../controllers/export.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Both ADMIN and ACCOUNTANT can export
router.get('/invoices', protect, authorize('ADMIN', 'ACCOUNTANT'), exportInvoices);

export default router;