import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import InvoiceTable from '../../components/invoices/InvoiceTable';
import ExportButtons from '../../components/invoices/ExportButtons';
import Loader from '../../components/common/Loader';
import { useInvoices } from '../../hooks/useInvoices';
import { useAuth } from '../../hooks/useAuth';
import invoiceService from '../../services/invoiceService';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { INVOICE_STATUS } from '../../utils/constants';

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { invoices, loading, fetchInvoices, deleteInvoice } = useInvoices();
  
  // Check permissions
  const canCreateInvoice = hasPermission(user?.role, PERMISSIONS.CREATE_INVOICE);
  
  useEffect(() => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter !== 'all') filters.status = statusFilter;
    
    const debounce = setTimeout(() => {
      fetchInvoices(filters);
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter]);
  
  const handleView = (id) => {
    navigate(`/invoices/${id}`);
  };
  
  const handleEdit = (id) => {
    navigate(`/invoices/edit/${id}`);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(id);
        toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };
  
  const handleStatusUpdate = async (id, status) => {
    try {
      await invoiceService.updateStatus(id, status);
      fetchInvoices();
    } catch (error) {
      console.error('Status update error:', error);
    }
  };
  
  const handleDuplicate = async (id) => {
    try {
      const invoice = await invoiceService.getById(id);
      // Navigate to create page with invoice data
      navigate('/invoices/create', { state: { duplicateFrom: invoice } });
      toast.info('Creating duplicate invoice...');
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Failed to duplicate invoice');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="mb-2 font-bold text-gray-900 text-2xl">Invoices</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage and track all your invoices
          </p>
        </div>
        
        {/* Only show Create Invoice button if user has permission (ACCOUNTANT) */}
        {canCreateInvoice && (
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => navigate('/invoices/create')}
          >
            New Invoice
          </Button>
        )}
      </div>
      
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
        <div className="flex md:flex-row flex-col gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search invoices by number, client, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5 text-gray-400" />}
            />
          </div>
          
          <div className="flex sm:flex-row flex-col gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[150px] input-field"
            >
              <option value="all">All Status</option>
              {Object.entries(INVOICE_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            
            <ExportButtons filters={{ search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined }} />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" text="Loading invoices..." />
          </div>
        ) : (
          <InvoiceTable
            invoices={invoices}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusUpdate={handleStatusUpdate}
            onDuplicate={handleDuplicate}
          />
        )}
      </div>
    </div>
  );
};

export default Invoices;