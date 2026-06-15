import Invoice from '../models/invoice.js';

export const checkOverdueInvoices = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Invoice.updateMany(
      {
        status: { $in: ['Sent', 'Viewed', 'Pending'] },
        dueDate: { $lt: today },
      },
      {
        $set: { status: 'Overdue' },
        $push: {
          auditLog: {
            action: 'Status changed to Overdue',
            userId: null,
            details: 'Automatically marked as overdue',
            timestamp: new Date(),
          },
        },
      }
    );

    console.log(`${result.modifiedCount} invoices marked as overdue`);
    return result;
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
};