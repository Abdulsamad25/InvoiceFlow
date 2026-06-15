/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreVertical, Copy } from 'lucide-react';
import Table from '../common/Table';
import InvoiceStatus from './InvoiceStatus';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const InvoiceTable = ({ 
  invoices, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  onDuplicate 
}) => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  
  const canEdit = hasPermission(user?.role, PERMISSIONS.EDIT_INVOICE);
  const canDelete = hasPermission(user?.role, PERMISSIONS.DELETE_INVOICE);
  
  // Ensure invoices is always an array
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  
  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
      width: '15%',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.invoiceNumber || `#${row.id?.slice(-6) || 'N/A'}`}
        </span>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.clientId?.name || 'N/A'}</p>
          <p className="text-gray-500 text-xs">{row.clientId?.email || ''}</p>
        </div>
      )
    },
    {
      key: 'invoiceType',
      label: 'Type',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 text-sm capitalize">
          {row.invoiceType === 'repair' ? 'Repair' : 'Purchase'}
        </span>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 text-sm">
          {formatDate(row.issueDate)}
        </span>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 text-sm">
          {formatDate(row.dueDate)}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.total, row.currency)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <InvoiceStatus status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* View - everyone can view */}
          {onView && (
            <button
              onClick={() => onView(row.id || row._id)}
              className="hover:bg-gray-100 p-2 rounded-md transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {/* Edit - only if user has permission */}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(row.id || row._id)}
              className="hover:bg-gray-100 p-2 rounded-md transition-colors"
              title="Edit Invoice"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          )}
          
          {/* More actions menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
              className="hover:bg-gray-100 p-2 rounded-md transition-colors"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            
            {activeMenu === row.id && (
              <>
                <div
                  className="z-10 fixed inset-0"
                  onClick={() => setActiveMenu(null)}
                />
                <div className="right-0 z-20 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-md w-48">
                  <div className="py-1">
                    {/* Duplicate */}
                    {onDuplicate && (
                      <button
                        onClick={() => {
                          onDuplicate(row.id || row._id);
                          setActiveMenu(null);
                        }}
                        className="flex items-center hover:bg-gray-100 px-4 py-2 w-full text-gray-700 text-sm transition-colors"
                      >
                        <Copy className="mr-2 w-4 h-4" />
                        Duplicate
                      </button>
                    )}
                    
                    {/* Delete - only if user has permission */}
                    {canDelete && onDelete && (
                      <>
                        <div className="my-1 border-gray-200 border-t" />
                        <button
                          onClick={() => {
                            onDelete(row.id || row._id);
                            setActiveMenu(null);
                          }}
                          className="flex items-center hover:bg-red-50 px-4 py-2 w-full text-red-600 text-sm transition-colors"
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
  ];
  
  return (
    <Table 
      columns={columns} 
      data={safeInvoices}
      emptyMessage="No invoices found. Create your first invoice to get started."
    />
  );
};

export default InvoiceTable;