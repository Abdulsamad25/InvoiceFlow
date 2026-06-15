import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
} from '../controllers/client.js';
import { protect, authorize } from '../middlewares/auth.js';
import { createClientValidation, updateClientValidation } from '../validators/client.js';

const router = express.Router();

// Create, update, delete - ONLY ACCOUNTANT
router.post('/', protect, authorize('ACCOUNTANT'), createClientValidation, createClient);
router.put('/:id', protect, authorize('ACCOUNTANT'), updateClientValidation, updateClient);
router.delete('/:id', protect, authorize('ACCOUNTANT'), deleteClient);

// Search and view - both roles can access
router.get('/search', protect, searchClients);
router.get('/', protect, getAllClients);
router.get('/:id', protect, getClientById);

export default router;