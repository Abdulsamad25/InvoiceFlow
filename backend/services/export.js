import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

export const exportToCSV = (data) => {
  try {
    const fields = [
      { label: 'Invoice Number', value: 'invoiceNumber' },
      { label: 'Client Name', value: 'clientName' },
      { label: 'Client Email', value: 'clientEmail' },
      { label: 'Issue Date', value: 'issueDate' },
      { label: 'Due Date', value: 'dueDate' },
      { label: 'Status', value: 'status' },
      { label: 'Subtotal', value: 'subtotal' },
      { label: 'Tax Rate (%)', value: 'taxRate' },
      { label: 'Tax Amount', value: 'taxAmount' },
      { label: 'Discount', value: 'discount' },
      { label: 'Total', value: 'total' },
      { label: 'Currency', value: 'currency' },
      { label: 'Bank Name', value: 'bankName' },
      { label: 'Account Number', value: 'accountNumber' },
      { label: 'Account Name', value: 'accountName' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    return Buffer.from(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
};

export const exportToExcel = async (data) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    worksheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
      { header: 'Client Name', key: 'clientName', width: 25 },
      { header: 'Client Email', key: 'clientEmail', width: 30 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax Rate (%)', key: 'taxRate', width: 15 },
      { header: 'Tax Amount', key: 'taxAmount', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Bank Name', key: 'bankName', width: 25 },
      { header: 'Account Number', key: 'accountNumber', width: 20 },
      { header: 'Account Name', key: 'accountName', width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach(item => {
      worksheet.addRow(item);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Excel export error:', error);
    throw error;
  }
};