import express from 'express';
import {
  createBank,
  getAllBanks,
  getDefaultBank,
  updateBank,
  deleteBank,
  setDefaultBank,
} from '../controllers/settings.js';
import { protect, authorize } from '../middlewares/auth.js';
import { createBankValidation, updateBankValidation } from '../validators/settings.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();


// Bank management
router.post('/banks', protect, authorize('ADMIN'), ...createBankValidation, validate, createBank);
router.put('/banks/:id', protect, authorize('ADMIN'), ...updateBankValidation, validate, updateBank);
router.delete('/banks/:id', protect, authorize('ADMIN'), deleteBank);
router.put('/banks/:id/set-default', protect, authorize('ADMIN'), setDefaultBank);

// View operations - both roles can view
router.get('/banks', protect, getAllBanks);
router.get('/banks/default', protect, getDefaultBank);

export default router;