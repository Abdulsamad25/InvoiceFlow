import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import InvoiceStatus from '../invoices/InvoiceStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const RecentInvoices = ({ invoices }) => {
  const navigate = useNavigate();
  
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Recent Invoices</h3>
        <p className="py-8 text-gray-500 text-center">No recent invoices</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 text-lg">Recent Invoices</h3>
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-rose-400 hover:text-rose-500 text-sm"
        >
          View All
          <ArrowRight className="ml-1 w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {invoices.map(invoice => (
          <div
            key={invoice.id || invoice._id}
            onClick={() => navigate(`/invoices/${invoice.id || invoice._id}`)}
            className="bg-white hover:shadow-md p-4 rounded-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                #{invoice.invoiceNumber}
              </span>
              <InvoiceStatus status={invoice.status} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{invoice.client?.name}</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              Due: {formatDate(invoice.dueDate)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInvoices;