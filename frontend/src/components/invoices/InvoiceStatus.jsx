import React from 'react';
import Badge from '../common/Badge';
import { INVOICE_STATUS_LABELS } from '../../utils/constants';

const InvoiceStatus = ({ status }) => {
  const statusVariants = {
    Draft: 'default',
    Sent: 'info',
    Viewed: 'info',
    Pending: 'warning',
    Paid: 'success',
    Overdue: 'danger',
    Cancelled: 'default'
  };
  
  return (
    <Badge variant={statusVariants[status]}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
};

export default InvoiceStatus;