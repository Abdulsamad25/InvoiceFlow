import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import Loader from '../../components/common/Loader';
import invoiceService from '../../services/invoiceService';

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  
  useEffect(() => {
    fetchInvoice();
  }, [id]);
  
  const fetchInvoice = async () => {
    try {
      setFetchLoading(true);
      const data = await invoiceService.getById(id);
      setInvoice(data);
    } catch (error) {
      console.error('Fetch invoice error:', error);
      navigate('/invoices');
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await invoiceService.update(id, formData);
      navigate(`/invoices/${id}`);
    } catch (error) {
      console.error('Update invoice error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return <Loader fullScreen size="lg" text="Loading invoice..." />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="mb-1 font-bold text-gray-900 text-2xl">Edit Invoice</h1>
          <p className="text-gray-600">Update invoice #{invoice?.invoiceNumber}</p>
        </div>
      </div>
      
      {invoice && (
        <InvoiceForm
          initialData={invoice}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditInvoice;