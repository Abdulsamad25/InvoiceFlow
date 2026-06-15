import { validationResult } from 'express-validator';
import Client from '../models/client.js';
import Invoice from '../models/invoice.js';
import { logAction } from '../utils/logger.js';

export const createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, company, city, country, taxId } = req.body;

    const clientExists = await Client.findOne({ email });
    if (clientExists) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      company,
      city,
      country,
      taxId,
      createdBy: req.user.id,
    });

    await logAction(req.user.id, 'client_created', 'client', client._id, `Client ${name} created`, req.ip);

    // Normalize client ID for frontend consistency
    const normalizedClient = {
      ...client.toObject(),
      id: client._id.toString(),
    };

    res.status(201).json({
      success: true,
      client: normalizedClient,
      data: normalizedClient, // Also include in data for consistency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().populate('createdBy', 'name email').sort({ createdAt: -1 });

    // Normalize client IDs for frontend consistency
    const normalizedClients = clients.map(client => ({
      ...client.toObject(),
      id: client._id.toString(),
    }));

    res.json({
      success: true,
      count: normalizedClients.length,
      data: normalizedClients,
      clients: normalizedClients, // Keep both for backward compatibility
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoices = await Invoice.find({ clientId: client._id })
      .populate('bankId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      client,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const { name, email, phone, address, company, city, country, taxId } = req.body;

    if (email && email !== client.email) {
      const emailExists = await Client.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another client' });
      }
    }

    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone !== undefined ? phone : client.phone;
    client.address = address !== undefined ? address : client.address;
    client.company = company !== undefined ? company : client.company;
    client.city = city !== undefined ? city : client.city;
    client.country = country !== undefined ? country : client.country;
    client.taxId = taxId !== undefined ? taxId : client.taxId;

    await client.save();

    await logAction(req.user.id, 'client_updated', 'client', client._id, `Client ${client.name} updated`, req.ip);

    // Normalize client ID for frontend consistency
    const normalizedClient = {
      ...client.toObject(),
      id: client._id.toString(),
    };

    res.json({
      success: true,
      client: normalizedClient,
      data: normalizedClient, // Also include in data for consistency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchClients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        count: 0,
        clients: [],
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const clients = await Client.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
      ],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Normalize client IDs for frontend consistency
    const normalizedClients = clients.map(client => ({
      ...client.toObject(),
      id: client._id.toString(),
    }));

    res.json({
      success: true,
      count: normalizedClients.length,
      data: normalizedClients,
      clients: normalizedClients, // Keep both for backward compatibility
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const invoiceCount = await Invoice.countDocuments({ clientId: client._id });
    if (invoiceCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete client with existing invoices. Archive or reassign invoices first.' 
      });
    }

    await client.deleteOne();

    await logAction(req.user.id, 'client_deleted', 'client', client._id, `Client ${client.name} deleted`, req.ip);

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};