/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ClientForm from '../clients/ClientForm';
import { PAYMENT_TERMS } from '../../utils/constants';
import { formatDateForInput, getDateDaysFromNow } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import clientService from '../../services/clientService';
import settingsService from '../../services/settingsService';

const InvoiceForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    bankId: initialData?.bankId || '',
    invoiceType: initialData?.invoiceType || 'purchase',
    issueDate: initialData?.issueDate || formatDateForInput(new Date()),
    dueDate: initialData?.dueDate || formatDateForInput(getDateDaysFromNow(30)),
    paymentTerms: initialData?.paymentTerms || 30,
    currency: initialData?.currency || 'NGN',
    taxRate: initialData?.taxRate || 0,
    discount: initialData?.discount || 0,
    items: initialData?.items || [
      { 
        name: '', 
        description: '', 
        quantity: 1, 
        price: 0, 
        amount: 0, 
        serialNumber: '',
        serialEntries: [] // For repair invoices: array of {serialNumber, description, amount}
      }
    ],
    notes: initialData?.notes || '',
    terms: initialData?.terms || ''
  });
  
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientFormLoading, setClientFormLoading] = useState(false);
  
  const fetchClients = async () => {
    try {
      const response = await clientService.getAll();
      let clientsArray = [];
      if (Array.isArray(response)) {
        clientsArray = response;
      } else if (Array.isArray(response.data)) {
        clientsArray = response.data;
      } else if (Array.isArray(response.clients)) {
        clientsArray = response.clients;
      } else if (response.data?.clients && Array.isArray(response.data.clients)) {
        clientsArray = response.data.clients;
      }

      clientsArray = clientsArray.map(client => ({
        ...client,
        id: client.id || client._id,
      }));

      setClients(clientsArray);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await settingsService.getBanks();
      let banksArray = [];
      if (Array.isArray(response)) {
        banksArray = response;
      } else if (Array.isArray(response.data)) {
        banksArray = response.data;
      } else if (Array.isArray(response.banks)) {
        banksArray = response.banks;
      } else if (response.data?.banks && Array.isArray(response.data.banks)) {
        banksArray = response.data.banks;
      }

      banksArray = banksArray.map(bank => ({
        ...bank,
        id: bank.id || bank._id,
      }));

      setBanks(banksArray);
      
      const defaultBank = banksArray.find(b => b.isDefault);
      if (defaultBank && !formData.bankId) {
        setFormData(prev => ({ ...prev, bankId: defaultBank.id }));
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks([]);
    }
  };

  const searchClients = async (query) => {
    if (!query.trim()) {
      fetchClients();
      return;
    }

    try {
      const response = await clientService.search(query);
      let clientsArray = [];
      if (Array.isArray(response)) {
        clientsArray = response;
      } else if (Array.isArray(response.data)) {
        clientsArray = response.data;
      } else if (Array.isArray(response.clients)) {
        clientsArray = response.clients;
      } else if (response.data?.clients && Array.isArray(response.data.clients)) {
        clientsArray = response.data.clients;
      }

      clientsArray = clientsArray.map(client => ({
        ...client,
        id: client.id || client._id,
      }));

      setClients(clientsArray);
    } catch (error) {
      console.error('Error searching clients:', error);
      setClients([]);
    }
  };

  const handleCreateClient = async (clientData) => {
    setClientFormLoading(true);
    try {
      const response = await clientService.create(clientData);
      const newClient = response.client || response;
      const normalizedClient = {
        ...newClient,
        id: newClient.id || newClient._id,
      };
      
      setClients(prev => [normalizedClient, ...prev]);
      setFormData(prev => ({ ...prev, clientId: normalizedClient.id }));
      setShowClientModal(false);
      setSearchTerm('');
      if (errors.clientId) {
        setErrors(prev => ({ ...prev, clientId: '' }));
      }
      toast.success('Client created and selected!');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
    } finally {
      setClientFormLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchBanks();
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    
    if (formData.invoiceType === 'repair') {
      // For repair invoices, calculate from serial entries
      formData.items.forEach(item => {
        if (item.serialEntries) {
          item.serialEntries.forEach(entry => {
            subtotal += parseFloat(entry.amount) || 0;
          });
        }
      });
    } else {
      // For purchase invoices, calculate from item amounts
      subtotal = formData.items.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    }
    
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount - (formData.discount || 0);
    
    return {
      subtotal,
      taxAmount,
      total
    };
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate, formData.discount]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].amount = quantity * price;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        name: '', 
        description: '', 
        quantity: 1, 
        price: 0, 
        amount: 0, 
        serialNumber: '',
        serialEntries: []
      }]
    }));
  };
  
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addSerialEntry = (itemIndex) => {
    const newItems = [...formData.items];
    if (!newItems[itemIndex].serialEntries) {
      newItems[itemIndex].serialEntries = [];
    }
    newItems[itemIndex].serialEntries.push({
      serialNumber: '',
      description: '',
      amount: 0
    });
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeSerialEntry = (itemIndex, serialIndex) => {
    const newItems = [...formData.items];
    newItems[itemIndex].serialEntries.splice(serialIndex, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSerialEntryChange = (itemIndex, serialIndex, field, value) => {
    const newItems = [...formData.items];
    newItems[itemIndex].serialEntries[serialIndex][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  const handlePaymentTermsChange = (days) => {
    const dueDate = getDateDaysFromNow(days);
    setFormData(prev => ({
      ...prev,
      paymentTerms: days,
      dueDate: formatDateForInput(dueDate)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    console.log('Validating form with data:', formData);
    
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    
    if (!formData.bankId) {
      newErrors.bankId = 'Please select bank details';
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (formData.issueDate && formData.dueDate) {
      const issueDate = new Date(formData.issueDate);
      const dueDate = new Date(formData.dueDate);
      
      if (!isNaN(issueDate.getTime()) && !isNaN(dueDate.getTime()) && dueDate <= issueDate) {
        newErrors.dueDate = 'Due date must be after issue date';
      }
    }
    
    formData.items.forEach((item, index) => {
      console.log(`Validating item ${index}:`, item);
      
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = 'Item name is required';
      }
      
      if (formData.invoiceType === 'repair') {
        // For repair invoices, validate serial entries
        console.log(`Item ${index} serialEntries:`, item.serialEntries);
        if (!item.serialEntries || item.serialEntries.length === 0) {
          newErrors[`item_${index}_serial`] = 'At least one serial number is required for repair invoices';
        } else {
          item.serialEntries.forEach((entry, serialIndex) => {
            console.log(`Validating serial entry ${serialIndex}:`, entry);
            if (!entry.serialNumber.trim()) {
              newErrors[`item_${index}_serial_${serialIndex}_number`] = 'Serial number is required';
            }
            if (entry.amount === undefined || entry.amount === null || entry.amount < 0) {
              newErrors[`item_${index}_serial_${serialIndex}_amount`] = 'Amount cannot be negative (use 0 for end-of-life terminals)';
            }
          });
        }
      } else {
        // For purchase invoices, validate quantity and price
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (!item.price || item.price < 0) {
          newErrors[`item_${index}_price`] = 'Price must be a positive number';
        }
      }
    });
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    const totals = calculateTotals();
    
    // Process items based on invoice type
    let processedItems = [];
    
    if (formData.invoiceType === 'repair') {
      // For repair invoices, create separate items for each serial entry
      formData.items.forEach(item => {
        if (item.serialEntries && item.serialEntries.length > 0) {
          item.serialEntries.forEach(entry => {
            processedItems.push({
              name: item.name,
              description: entry.description,
              quantity: 1,
              price: entry.amount,
              amount: entry.amount,
              serialNumber: entry.serialNumber
            });
          });
        } else {
          // Fallback for items without serial entries
          processedItems.push({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            serialNumber: item.serialNumber
          });
        }
      });
    } else {
      // For purchase invoices, use items as-is
      processedItems = formData.items.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
        serialNumber: item.serialNumber
      }));
    }
    
    onSubmit({
      clientId: formData.clientId,
      bankId: formData.bankId,
      invoiceType: formData.invoiceType,
      items: processedItems,
      taxRate: formData.taxRate,
      discount: formData.discount,
      currency: formData.currency,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      terms: formData.terms,
    });
  };
  
  const selectedClient = Array.isArray(clients)
    ? clients.find(c => c.id === formData.clientId)
    : null;

  const totals = calculateTotals();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Client Information Section */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">
          Client Information
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Select Client <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedClient?.name || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchClients(e.target.value);
                  setShowClientSearch(true);
                }}
                onFocus={() => setShowClientSearch(true)}
                placeholder="Search for a client..."
                className="px-3 sm:px-4 py-2 pr-10 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base"
              />
              <Search className="top-1/2 right-3 absolute w-4 sm:w-5 h-4 sm:h-5 text-gray-400 -translate-y-1/2 transform" />
            </div>
            
            {showClientSearch && (
              <>
                <div
                  className="z-10 fixed inset-0"
                  onClick={() => setShowClientSearch(false)}
                />
                <div className="z-20 absolute bg-white shadow-lg mt-1 border border-gray-300 rounded-md w-full max-h-60 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="px-3 sm:px-4 py-3">
                      <p className="mb-2 text-gray-500 text-sm">
                        No clients found
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientSearch(false);
                          setShowClientModal(true);
                        }}
                        className="font-medium text-rose-400 hover:text-rose-500 text-sm"
                      >
                        + Create New Client
                      </button>
                    </div>
                  ) : (
                    <>
                      {clients.map(client => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, clientId: client.id }));
                            setSearchTerm('');
                            setShowClientSearch(false);
                            if (errors.clientId) {
                              setErrors(prev => ({ ...prev, clientId: '' }));
                            }
                          }}
                          className="hover:bg-gray-50 px-3 sm:px-4 py-2 w-full text-left transition-colors"
                        >
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {client.name}
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">{client.email}</p>
                        </button>
                      ))}
                      <div className="px-3 sm:px-4 py-2 border-gray-200 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setShowClientSearch(false);
                            setShowClientModal(true);
                          }}
                          className="font-medium text-rose-400 hover:text-rose-500 text-sm"
                        >
                          + Create New Client
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            
            {errors.clientId && (
              <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.clientId}</p>
            )}
          </div>
          
          {selectedClient && (
            <div className="bg-white p-3 sm:p-4 border border-gray-200 rounded-md">
              <p className="font-medium text-gray-900 text-sm sm:text-base">
                {selectedClient.name}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">{selectedClient.email}</p>
              {selectedClient.phone && (
                <p className="text-gray-600 text-xs sm:text-sm">{selectedClient.phone}</p>
              )}
              {selectedClient.address && (
                <p className="text-gray-600 text-xs sm:text-sm">{selectedClient.address}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">
          Bank Details
        </h3>
        
        <div>
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Select Bank Account <span className="text-rose-400">*</span>
          </label>
          <select
            value={formData.bankId}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, bankId: e.target.value }));
              if (errors.bankId) {
                setErrors(prev => ({ ...prev, bankId: '' }));
              }
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base"
          >
            <option value="">Select bank account</option>
            {banks.map(bank => (
              <option key={bank.id} value={bank.id}>
                {bank.bankName} - {bank.accountNumber} {bank.isDefault && '(Default)'}
              </option>
            ))}
          </select>
          {errors.bankId && (
            <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.bankId}</p>
          )}
        </div>
      </div>
      
      {/* Invoice Details Section */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">
          Invoice Details
        </h3>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700 text-sm">
            Invoice Type <span className="text-rose-400">*</span>
          </label>
          <select
            value={formData.invoiceType}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, invoiceType: e.target.value }));
              if (errors.invoiceType) {
                setErrors(prev => ({ ...prev, invoiceType: '' }));
              }
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base"
          >
            <option value="purchase">Terminal Purchase</option>
            <option value="repair">Terminal Repair</option>
          </select>
          {errors.invoiceType && (
            <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.invoiceType}</p>
          )}
        </div>
        
        <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Issue Date"
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
            error={errors.issueDate}
            required
          />
          
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            error={errors.dueDate}
            required
          />
          
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => handlePaymentTermsChange(Number(e.target.value))}
              className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base"
            >
              {PAYMENT_TERMS.map(term => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Items Section */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={addItem}
            className="w-full sm:w-auto"
          >
            Add Item
          </Button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="bg-white p-3 sm:p-4 border border-gray-200 rounded-md">
              <div className="gap-3 grid grid-cols-1">
                {/* Item Name - Full Width on Mobile */}
                <div className="col-span-1">
                  <Input
                    label="Item Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Item name"
                    error={errors[`item_${index}_name`]}
                    required
                  />
                </div>

                {/* Description - Full Width on Mobile */}
                <div className="col-span-1">
                  <Input
                    label="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                {formData.invoiceType === 'repair' ? (
                  /* Repair Invoice: Serial Entries */
                  <div className="col-span-1">
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block font-medium text-gray-700 text-sm">
                          Serial Numbers & Details
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSerialEntry(index)}
                          className="text-xs"
                        >
                          + Add Serial
                        </Button>
                      </div>
                      
                      {(!item.serialEntries || item.serialEntries.length === 0) && (
                        <p className="mb-3 text-gray-500 text-sm">No serial numbers added yet</p>
                      )}
                      
                      {errors[`item_${index}_serial`] && (
                        <div className="flex items-center mb-3 text-red-500 text-sm">
                          <AlertCircle className="mr-1 w-4 h-4" />
                          <span>{errors[`item_${index}_serial`]}</span>
                        </div>
                      )}
                      
                      {item.serialEntries && item.serialEntries.map((entry, serialIndex) => (
                        <div key={serialIndex} className="bg-gray-50 mb-3 p-3 border rounded-md">
                          <div className="gap-3 grid grid-cols-1">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  label="Serial Number"
                                  value={entry.serialNumber}
                                  onChange={(e) => handleSerialEntryChange(index, serialIndex, 'serialNumber', e.target.value)}
                                  placeholder="e.g. SN001"
                                  error={errors[`item_${index}_serial_${serialIndex}_number`]}
                                  required
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  label="Amount"
                                  type="number"
                                  value={entry.amount}
                                  onChange={(e) => handleSerialEntryChange(index, serialIndex, 'amount', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  error={errors[`item_${index}_serial_${serialIndex}_amount`]}
                                  required
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSerialEntry(index, serialIndex)}
                                className="hover:bg-red-50 mt-6 p-2 rounded-md text-red-500 transition-colors"
                                aria-label="Remove serial entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <Input
                              label="Issue Description"
                              value={entry.description}
                              onChange={(e) => handleSerialEntryChange(index, serialIndex, 'description', e.target.value)}
                              placeholder="Describe the repair issue"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Purchase Invoice: Simple Quantity/Price */
                  <>
                    {/* Quantity and Price - Side by Side on Mobile */}
                    <div className="gap-3 grid grid-cols-2">
                      <div>
                        <Input
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          error={errors[`item_${index}_quantity`]}
                          required
                        />
                      </div>
                      
                      <div>
                        <Input
                          label="Price"
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          error={errors[`item_${index}_price`]}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Amount and Delete Button - Full Width Bottom Row */}
                    <div className="flex justify-between items-end gap-3">
                      <div className="flex-1">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Amount
                        </label>
                        <div className="flex items-center bg-gray-50 px-3 border border-gray-300 rounded-md h-10">
                          <span className="font-medium text-gray-900 text-sm">
                            {formatCurrency(item.amount, formData.currency)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="hover:bg-red-50 disabled:opacity-50 p-2 rounded-md text-red-500 transition-colors disabled:cursor-not-allowed"
                        disabled={formData.items.length === 1}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Totals Section */}
        <div className="space-y-3 bg-white mt-4 sm:mt-6 p-4 sm:p-5 border border-gray-200 rounded-md">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(totals.subtotal, formData.currency)}
            </span>
          </div>
          
          <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              min="0"
              max="100"
              step="0.01"
            />
            <Input
              label="Discount"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(totals.taxAmount, formData.currency)}
            </span>
          </div>
          
          {formData.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-gray-900">
                - {formatCurrency(formData.discount, formData.currency)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between pt-3 border-gray-200 border-t font-bold text-base sm:text-lg">
            <span className="text-gray-900">Total:</span>
            <span className="text-rose-400">
              {formatCurrency(totals.total, formData.currency)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Additional Information Section */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <h3 className="mb-3 sm:mb-4 font-semibold text-gray-900 text-base sm:text-lg">
          Additional Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base resize-none"
              placeholder="Any additional notes..."
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows="3"
              className="px-3 sm:px-4 py-2 border border-gray-300 focus:border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 w-full text-sm sm:text-base resize-none"
              placeholder="Payment terms and conditions..."
            />
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex sm:flex-row flex-col sm:justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="secondary"
          className="order-2 sm:order-1 w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={loading}
          className="order-1 sm:order-2 w-full sm:w-auto"
        >
          {initialData ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>

      {/* Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Create New Client"
        size="lg"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          loading={clientFormLoading}
          onCancel={() => setShowClientModal(false)}
          asForm={false}
        />
      </Modal>
    </form>
  );
};

export default InvoiceForm;