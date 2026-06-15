import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import Button from '../common/Button';
import exportService from '../../services/exportServices';

const ExportButtons = ({ invoiceId, filters = {} }) => {
  const [loading, setLoading] = useState({
    pdf: false,
    csv: false
  });
  
  const handleExportPDF = async () => {
    if (!invoiceId) return;
    setLoading(prev => ({ ...prev, pdf: true }));
    try {
      await exportService.exportToPDF(invoiceId);
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };
  
  const handleExportCSV = async () => {
    setLoading(prev => ({ ...prev, csv: true }));
    try {
      await exportService.exportToCSV(filters);
    } finally {
      setLoading(prev => ({ ...prev, csv: false }));
    }
  };
  
  if (invoiceId) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<FileText className="w-4 h-4" />}
          onClick={handleExportPDF}
          loading={loading.pdf}
        >
          PDF
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        icon={<Download className="w-4 h-4" />}
        onClick={handleExportCSV}
        loading={loading.csv}
      >
        CSV
      </Button>
    </div>
  );
};

export default ExportButtons;