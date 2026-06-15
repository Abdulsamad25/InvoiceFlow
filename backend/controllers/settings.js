import Bank from '../models/bank.js';
import { logAction } from '../utils/logger.js';
import { validationResult } from 'express-validator';

export const createBank = async (req, res) => {
  try {
    const { bankName, accountNumber, accountName, bankAddress, isDefault } = req.body;

    const bank = await Bank.create({
      bankName,
      accountNumber,
      accountName,
      bankAddress,
      isDefault: isDefault || false,
    });

    await logAction(req.user.id, 'bank_created', 'bank', bank._id, `Bank ${bankName} created`, req.ip);

    res.status(201).json({
      success: true,
      bank,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: banks.length,
      banks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDefaultBank = async (req, res) => {
  try {
    const bank = await Bank.findOne({ isDefault: true });

    if (!bank) {
      return res.status(404).json({ message: 'No default bank found' });
    }

    res.json({
      success: true,
      bank,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBank = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    const { bankName, accountNumber, accountName, bankAddress, isDefault } = req.body;

    bank.bankName = bankName || bank.bankName;
    bank.accountNumber = accountNumber || bank.accountNumber;
    bank.accountName = accountName || bank.accountName;
    bank.bankAddress = bankAddress || bank.bankAddress;
    
    bank.isDefault = isDefault !== undefined ? isDefault : bank.isDefault;
    await bank.save();

    await logAction(req.user.id, 'bank_updated', 'bank', bank._id, `Bank ${bank.bankName} updated`, req.ip);
    res.json({
      success: true,
      bank,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

export const setDefaultBank = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    // Remove default from all other banks
    await Bank.updateMany(
      { _id: { $ne: bank._id } },
      { isDefault: false }
    );

    // Set this bank as default
    bank.isDefault = true;
    await bank.save();

    await logAction(
      req.user.id,
      'bank_set_default',
      'bank',
      bank._id,
      `Bank ${bank.bankName} set as default`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Default bank updated successfully',
      bank,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findById(req.params.id);  
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    await bank.deleteOne();

    await logAction(req.user.id, 'bank_deleted', 'bank', bank._id, `Bank ${bank.bankName} deleted`, req.ip);
    res.json({
      success: true,
      message: 'Bank deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};