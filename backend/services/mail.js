import { sendEmail } from '../config/mail.js';
import { generateInvoicePDF } from './pdf.js';

export const sendInvoiceEmail = async (invoice) => {
  try {
    const pdfBuffer = await generateInvoicePDF(invoice);

    const subject = `Invoice ${invoice.invoiceNumber} from Your Company`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #fb7185;">New Invoice</h2>
        <p>Dear ${invoice.clientId.name},</p>
        <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> for your review.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; margin: 20px 0; border-left: 4px solid #fb7185;">
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${invoice.currency} ${invoice.total.toFixed(2)}</p>
        </div>

        <h3>Payment Details:</h3>
        <p><strong>Bank Name:</strong> ${invoice.bankId.bankName}</p>
        <p><strong>Account Name:</strong> ${invoice.bankId.accountName}</p>
        <p><strong>Account Number:</strong> ${invoice.bankId.accountNumber}</p>
        ${invoice.bankId.swiftCode ? `<p><strong>SWIFT Code:</strong> ${invoice.bankId.swiftCode}</p>` : ''}

        <p style="margin-top: 30px;">If you have any questions about this invoice, please contact us.</p>
        
        <p style="margin-top: 20px;">Best regards,<br>Your Company Team</p>
      </div>
    `;

    const attachments = [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];

    const result = await sendEmail(invoice.clientId.email, subject, html, attachments);

    return result;
  } catch (error) {
    console.error('Send invoice email error:', error);
    return { success: false, error: error.message };
  }
};