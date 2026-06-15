import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import InvoiceStatus from './InvoiceStatus';

const InvoicePreview = ({ invoice }) => {
  if (!invoice) return null;

  const formatSerialNumbers = (serialNumber) => {
    if (!serialNumber) return '';
    return serialNumber.split(',').map(sn => sn.trim()).filter(sn => sn).join(', ');
  };
  
  return (
    <div className="bg-white shadow-sm mx-auto p-4 sm:p-6 lg:p-8 border border-gray-200 rounded-lg max-w-4xl">
      {/* Header Section */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="mb-1 sm:mb-2 font-bold text-gray-900 text-xl sm:text-2xl lg:text-3xl leading-tight">
            INVOICE
          </h1>
          <p className="text-gray-600 text-sm sm:text-base break-all">#{invoice.invoiceNumber}</p>
        </div>
        <div className="self-start sm:self-auto shrink-0">
          <InvoiceStatus status={invoice.status} />
        </div>
      </div>
      
      {/* From/To Section */}
      <div className="gap-4 sm:gap-6 lg:gap-8 grid grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-8">
        <div className="bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-md">
          <h3 className="mb-2 font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
            From:
          </h3>
          <p className="font-medium text-gray-900 text-sm sm:text-base">
            {invoice.createdBy?.name || 'Company Name'}
          </p>
          <p className="text-gray-600 text-xs sm:text-sm break-all">
            {invoice.createdBy?.email || 'company@email.com'}
          </p>
        </div>
        
        <div className="bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-md">
          <h3 className="mb-2 font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
            To:
          </h3>
          <p className="font-medium text-gray-900 text-sm sm:text-base">
            {invoice.clientId?.name}
          </p>
          <p className="text-gray-600 text-xs sm:text-sm break-all">
            {invoice.clientId?.email}
          </p>
          {invoice.clientId?.address && (
            <p className="mt-1 text-gray-600 text-xs sm:text-sm">
              {invoice.clientId.address}
            </p>
          )}
          {invoice.clientId?.phone && (
            <p className="text-gray-600 text-xs sm:text-sm">
              {invoice.clientId.phone}
            </p>
          )}
        </div>
      </div>
      
      {/* Date Information */}
      <div className="gap-3 sm:gap-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 bg-gray-50 mb-6 sm:mb-8 p-3 sm:p-4 rounded-md">
        <div>
          <p className="mb-1 text-gray-600 text-xs uppercase tracking-wide">Issue Date</p>
          <p className="font-medium text-gray-900 text-sm sm:text-base">
            {formatDate(invoice.issueDate)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-gray-600 text-xs uppercase tracking-wide">Due Date</p>
          <p className="font-medium text-gray-900 text-sm sm:text-base">
            {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-gray-600 text-xs uppercase tracking-wide">Payment Terms</p>
          <p className="font-medium text-gray-900 text-sm sm:text-base">Net 30</p>
        </div>
        <div>
          <p className="mb-1 text-gray-600 text-xs uppercase tracking-wide">Type</p>
          <p className="font-medium text-gray-900 text-sm sm:text-base capitalize">
            {invoice.invoiceType === 'repair' ? 'Terminal Repair' : 'Terminal Purchase'}
          </p>
        </div>
      </div>
      
      {/* Items Table - Desktop View */}
      <div className="hidden sm:block mb-6 sm:mb-8 overflow-x-auto">
        <table className="w-full min-w-150">
          <thead>
            <tr className="border-gray-300 border-b-2">
              <th className="py-3 pr-4 font-semibold text-gray-700 text-sm text-left">
                Description
              </th>
              {invoice.invoiceType === 'repair' && (
                <th className="px-2 py-3 font-semibold text-gray-700 text-sm text-center">
                  Serial Numbers
                </th>
              )}
              <th className="px-2 py-3 font-semibold text-gray-700 text-sm text-center">
                Qty
              </th>
              <th className="px-2 py-3 font-semibold text-gray-700 text-sm text-right">
                Rate
              </th>
              <th className="py-3 pl-2 font-semibold text-gray-700 text-sm text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={index} className="border-gray-200 last:border-0 border-b">
                <td className="py-3 pr-4 text-gray-900">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-gray-600 text-sm">{item.description}</div>
                    )}
                  </div>
                </td>
                {invoice.invoiceType === 'repair' && (
                  <td className="px-2 py-3 font-mono text-gray-900 text-sm text-center">
                    {formatSerialNumbers(item.serialNumber)}
                  </td>
                )}
                <td className="px-2 py-3 text-gray-900 text-center">{item.quantity}</td>
                <td className="px-2 py-3 text-gray-900 text-right">
                  {formatCurrency(item.price, invoice.currency)}
                </td>
                <td className="py-3 pl-2 font-medium text-gray-900 text-right">
                  {formatCurrency(item.amount, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Items List - Mobile View */}
      <div className="sm:hidden space-y-3 mb-6">
        <h3 className="mb-3 font-semibold text-gray-700 text-sm uppercase tracking-wide">
          Items
        </h3>
        {invoice.items?.map((item, index) => (
          <div 
            key={index} 
            className="bg-gray-50 p-3 border border-gray-200 rounded-md"
          >
            <div className="mb-2">
              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
              {item.description && (
                <p className="mt-1 text-gray-600 text-xs">{item.description}</p>
              )}
              {item.serialNumber && invoice.invoiceType === 'repair' && (
                <p className="mt-1 font-mono text-gray-700 text-xs">
                  Serial: {formatSerialNumbers(item.serialNumber)}
                </p>
              )}
            </div>
            <div className="gap-2 grid grid-cols-3 text-xs">
              <div>
                <p className="text-gray-500 uppercase">Qty</p>
                <p className="font-medium text-gray-900">{item.quantity}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase">Rate</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.price, invoice.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 uppercase">Amount</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.amount, invoice.currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Totals Section */}
      <div className="flex justify-end mb-6 sm:mb-8">
        <div className="space-y-2 w-full sm:w-72 lg:w-80">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(invoice.taxAmount, invoice.currency)}
            </span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-gray-900">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-gray-300 border-t-2 font-bold text-sm sm:text-base lg:text-lg">
            <span className="text-gray-900">Total:</span>
            <span className="text-rose-400">
              {formatCurrency(invoice.total, invoice.currency)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Notes Section */}
      {invoice.notes && (
        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
            Notes:
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {invoice.notes}
          </p>
        </div>
      )}
      
      {/* Terms & Conditions Section */}
      {invoice.terms && (
        <div className="mb-4 sm:mb-6">
          <h3 className="mb-2 font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
            Terms & Conditions:
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            {invoice.terms}
          </p>
        </div>
      )}

      {/* Payment Details Section */}
      {invoice.bankId && (
        <div className="mt-6 pt-4 sm:pt-6 border-gray-200 border-t">
          <h3 className="mb-3 font-semibold text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
            Payment Details:
          </h3>
          <div className="bg-gray-50 p-3 sm:p-4 border border-gray-200 rounded-md">
            <p className="mb-2 font-medium text-gray-900 text-sm sm:text-base">
              {invoice.bankId.bankName}
            </p>
            <div className="space-y-1">
              <p className="text-gray-600 text-xs sm:text-sm">
                <span className="font-medium">Account Name:</span> {invoice.bankId.accountName}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                <span className="font-medium">Account Number:</span> {invoice.bankId.accountNumber}
              </p>
              {invoice.bankId.bankAddress && (
                <p className="text-gray-600 text-xs sm:text-sm">
                  <span className="font-medium">Bank Address:</span> {invoice.bankId.bankAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;