import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ClientForm from '../../components/clients/ClientForm';
import ClientTable from '../../components/clients/ClientTable';
import Loader from '../../components/common/Loader';
import clientService from '../../services/clientService';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const Clients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  
  const canCreate = hasPermission(user?.role, PERMISSIONS.CREATE_CLIENT);
  
  // Initial load
  useEffect(() => {
    fetchClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchClients();
      } else {
        fetchClients();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll();
      
      // Handle different response formats
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

      setClients(clientsArray);
    } catch (error) {
      console.error('Fetch clients error:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  
  const searchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.search(searchTerm);
      
      // Handle different response formats
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

      setClients(clientsArray);
    } catch (error) {
      console.error('Search clients error:', error);
      toast.error('Search failed');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };
  
  const handleView = async (id) => {
    try {
      const response = await clientService.getById(id);
      setViewingClient(response.client || response.data || response);
      setShowViewModal(true);
    } catch (error) {
      console.error('View client error:', error);
      toast.error('Failed to load client details');
    }
  };
  
  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };
  
  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingClient) {
        await clientService.update(editingClient.id || editingClient._id, formData);
      } else {
        await clientService.create(formData);
      }
      setShowModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Submit client error:', error);
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await clientService.delete(id);
        fetchClients();
      } catch (error) {
        console.error('Delete client error:', error);
        const message = error.response?.data?.message || 'Failed to delete client';
        toast.error(message);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="mb-2 font-bold text-gray-900 text-2xl">Clients</h1>
          <p className="text-gray-600">Manage your client database</p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={handleCreate}
          >
            New Client
          </Button>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search clients by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
          />
        </div>
        
        {loading ? (
          <Loader size="lg" text="Loading clients..." />
        ) : (
          <ClientTable
            clients={clients}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
        title={editingClient ? 'Edit Client' : 'Create New Client'}
        size="lg"
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={handleSubmit}
          loading={submitLoading}
          onCancel={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
        />
      </Modal>
      
      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingClient(null);
        }}
        title="Client Details"
        size="md"
      >
        {viewingClient && (
          <div className="space-y-4">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="font-medium text-gray-700 text-sm">Name</label>
                <p className="mt-1 text-gray-900">{viewingClient.name}</p>
              </div>
              
              {viewingClient.company && (
                <div>
                  <label className="font-medium text-gray-700 text-sm">Company</label>
                  <p className="mt-1 text-gray-900">{viewingClient.company}</p>
                </div>
              )}
              
              <div>
                <label className="font-medium text-gray-700 text-sm">Email</label>
                <p className="mt-1 text-gray-900">{viewingClient.email}</p>
              </div>
              
              {viewingClient.phone && (
                <div>
                  <label className="font-medium text-gray-700 text-sm">Phone</label>
                  <p className="mt-1 text-gray-900">{viewingClient.phone}</p>
                </div>
              )}
              
              {viewingClient.address && (
                <div className="sm:col-span-2">
                  <label className="font-medium text-gray-700 text-sm">Address</label>
                  <p className="mt-1 text-gray-900">{viewingClient.address}</p>
                </div>
              )}
              
              {viewingClient.city && (
                <div>
                  <label className="font-medium text-gray-700 text-sm">City</label>
                  <p className="mt-1 text-gray-900">{viewingClient.city}</p>
                </div>
              )}
              
              {viewingClient.country && (
                <div>
                  <label className="font-medium text-gray-700 text-sm">Country</label>
                  <p className="mt-1 text-gray-900">{viewingClient.country}</p>
                </div>
              )}
              
              {viewingClient.taxId && (
                <div className="sm:col-span-2">
                  <label className="font-medium text-gray-700 text-sm">Tax ID / VAT Number</label>
                  <p className="mt-1 text-gray-900">{viewingClient.taxId}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-gray-200 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingClient(null);
                }}
              >
                Close
              </Button>
              {hasPermission(user?.role, PERMISSIONS.EDIT_CLIENT) && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingClient(null);
                    handleEdit(viewingClient);
                  }}
                >
                  Edit Client
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;