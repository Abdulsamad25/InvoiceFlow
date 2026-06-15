import puppeteer from 'puppeteer';

export const generateInvoicePDF = async (invoice) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const items = invoice.items
      .map(
        (item, index) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description || ''}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.currency} ${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${invoice.currency} ${item.amount.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #000;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-info {
            flex: 1;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #fb7185;
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f3f4f6;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #000;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
          }
          .totals table {
            margin-left: auto;
            width: 300px;
          }
          .totals tr td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals tr:last-child td {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .bank-details {
            background-color: #f9fafb;
            padding: 15px;
            margin-top: 20px;
            border-left: 4px solid #fb7185;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background-color: #e5e7eb;
            color: #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="invoice-title">INVOICE</div>
            <p><strong>From:</strong></p>
            <p>Your Company Name</p>
            <p>Your Company Address</p>
          </div>
          <div class="invoice-info">
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p style="margin-top: 10px;"><span class="status-badge">${invoice.status}</span></p>
          </div>
        </div>

        <div class="section-title">Bill To:</div>
        <p><strong>${invoice.clientId.name}</strong></p>
        ${invoice.clientId.company ? `<p>${invoice.clientId.company}</p>` : ''}
        <p>${invoice.clientId.email}</p>
        ${invoice.clientId.phone ? `<p>${invoice.clientId.phone}</p>` : ''}
        ${invoice.clientId.address ? `<p>${invoice.clientId.address}</p>` : ''}

        <div class="section-title" style="margin-top: 30px;">Invoice Items:</div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">Item</th>
              <th style="width: 30%;">Description</th>
              <th style="width: 10%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 15%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${invoice.currency} ${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (${invoice.taxRate}%):</td>
              <td style="text-align: right;">${invoice.currency} ${invoice.taxAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">- ${invoice.currency} ${invoice.discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total:</td>
              <td style="text-align: right;">${invoice.currency} ${invoice.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="bank-details">
          <div class="section-title" style="margin-top: 0;">Payment Details:</div>
          <p><strong>Bank Name:</strong> ${invoice.bankId.bankName}</p>
          <p><strong>Account Name:</strong> ${invoice.bankId.accountName}</p>
          <p><strong>Account Number:</strong> ${invoice.bankId.accountNumber}</p>
          ${invoice.bankId.swiftCode ? `<p><strong>SWIFT Code:</strong> ${invoice.bankId.swiftCode}</p>` : ''}
        </div>

        ${invoice.notes ? `
          <div class="footer">
            <div class="section-title">Notes:</div>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        ${invoice.terms ? `
          <div class="footer">
            <div class="section-title">Terms & Conditions:</div>
            <p>${invoice.terms}</p>
          </div>
        ` : ''}

        <div class="footer" style="text-align: center; font-size: 12px; color: #6b7280;">
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};