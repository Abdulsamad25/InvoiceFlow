import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import invoiceService from '../../services/invoiceService';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const invoice = await invoiceService.create(formData);
      navigate(`/invoices/${invoice._id}`);
    } catch (error) {
      console.error('Create invoice error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="mb-1 font-bold text-gray-900 text-2xl">Create New Invoice</h1>
          <p className="text-gray-600">Fill in the details to create a new invoice</p>
        </div>
      </div>
      
      <InvoiceForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateInvoice;