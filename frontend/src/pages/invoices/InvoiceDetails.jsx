import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Download, MoreVertical } from 'lucide-react';
import Button from '../../components/common/Button';
import InvoicePreview from '../../components/invoices/InvoicePreview';
import ExportButtons from '../../components/invoices/ExportButtons';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import invoiceService from '../../services/invoiceService';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { INVOICE_STATUS } from '../../utils/constants';

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const canEdit = hasPermission(user?.role, PERMISSIONS.EDIT_INVOICE);
  const canDelete = hasPermission(user?.role, PERMISSIONS.DELETE_INVOICE);
  
  useEffect(() => {
    fetchInvoice();
  }, [id]);
  
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getById(id);
      setInvoice(data);
    } catch (error) {
      console.error('Fetch invoice error:', error);
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.delete(id);
        navigate('/invoices');
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };
  
  const handleStatusUpdate = async () => {
    try {
      await invoiceService.updateStatus(id, selectedStatus);
      setShowStatusModal(false);
      fetchInvoice();
    } catch (error) {
      console.error('Status update error:', error);
    }
  };
  
  if (loading) {
    return <Loader fullScreen size="lg" text="Loading invoice..." />;
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-screen">
      <div className="space-y-4 sm:space-y-6 mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex sm:flex-row flex-col sm:justify-between gap-4">
          {/* Left side - Title and Back Button */}
          <div className="flex flex-1 items-start gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/invoices')}
              className="flex-shrink-0 self-start hover:bg-gray-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors"
              aria-label="Go back to invoices"
            >
              <ArrowLeft className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="mb-1 font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl truncate leading-tight">
                Invoice #{invoice?.invoiceNumber}
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                View and manage invoice details
              </p>
            </div>
          </div>
          
          {/* Right side - Action Buttons (Desktop) */}
          <div className="hidden lg:flex flex-shrink-0 items-center gap-2">
            <ExportButtons invoiceId={id} />
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => navigate(`/invoices/edit/${id}`)}
              >
                Edit
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>

          {/* Mobile/Tablet Action Buttons */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Primary action buttons visible on mobile */}
            <ExportButtons invoiceId={id} />
            
            {/* More menu for additional actions */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                icon={<MoreVertical className="w-4 h-4" />}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="px-2"
                aria-label="More actions"
              />
              
              {showMobileMenu && (
                <>
                  <div
                    className="z-10 fixed inset-0"
                    onClick={() => setShowMobileMenu(false)}
                  />
                  <div className="top-full right-0 z-20 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-48 overflow-hidden">
                    {canEdit && (
                      <button
                        onClick={() => {
                          navigate(`/invoices/edit/${id}`);
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center gap-3 hover:bg-gray-50 px-4 py-3 border-gray-100 border-b w-full text-left transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900 text-sm">Edit Invoice</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedStatus(invoice?.status);
                        setShowStatusModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center gap-3 hover:bg-gray-50 px-4 py-3 border-gray-100 border-b w-full text-left transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900 text-sm">Change Status</span>
                    </button>
                    
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center gap-3 hover:bg-red-50 px-4 py-3 w-full text-left transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 text-sm">Delete Invoice</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Change Button (Desktop Only) */}
        <div className="hidden lg:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus(invoice?.status);
              setShowStatusModal(true);
            }}
          >
            Change Status
          </Button>
        </div>
        
        {/* Invoice Preview */}
        <InvoicePreview invoice={invoice} />
        
        {/* Status Update Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Invoice Status"
        >
          <div className="space-y-4 p-4 sm:p-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Select New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base"
              >
                {Object.entries(INVOICE_STATUS).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex sm:flex-row flex-col sm:justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowStatusModal(false)}
                className="order-2 sm:order-1 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStatusUpdate}
                className="order-1 sm:order-2 w-full sm:w-auto"
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InvoiceDetails;