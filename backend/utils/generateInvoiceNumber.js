import Invoice from '../models/invoice.js';

export const generateInvoiceNumber = async () => {
  const prefix = process.env.INVOICE_PREFIX || 'INV';
  const year = new Date().getFullYear();
  
  const lastInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}-${year}-`),
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
    nextNumber = lastNumber + 1;
  }

  const invoiceNumber = `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
  
  return invoiceNumber;
};