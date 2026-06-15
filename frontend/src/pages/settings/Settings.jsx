import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import settingsService from '../../services/settingsService';
import authService from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  
  const canManageSettings = hasPermission(user?.role, PERMISSIONS.MANAGE_SETTINGS);
  const canViewSettings = hasPermission(user?.role, PERMISSIONS.VIEW_SETTINGS);
  const canAccessSettings = canManageSettings || canViewSettings;

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getBanks();
      const banksArray = response.banks || response.data || response || [];
      setBanks(banksArray);
    } catch (error) {
      console.error('Fetch banks error:', error);
      toast.error('Failed to load bank accounts');
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBank(null);
    setShowModal(true);
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    try {
      if (editingBank) {
        await settingsService.updateBank(editingBank.id || editingBank._id, formData);
      } else {
        await settingsService.createBank(formData);
      }
      setShowModal(false);
      setEditingBank(null);
      fetchBanks();
    } catch (error) {
      console.error('Submit bank error:', error);
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await settingsService.setDefaultBank(id);
      toast.success('Default bank account updated');
      fetchBanks();
    } catch (error) {
      console.error('Set default error:', error);
      toast.error('Failed to set default bank');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      try {
        await settingsService.deleteBank(id);
        fetchBanks();
      } catch (error) {
        console.error('Delete bank error:', error);
        const message = error.response?.data?.message || 'Failed to delete bank account';
        toast.error(message);
      }
    }
  };

  const handleSignatureFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setSignaturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) {
      toast.error('Please select a signature file');
      return;
    }

    try {
      setSignatureUploading(true);
      const response = await authService.uploadSignature(signatureFile);
      updateUser(response.user);
      setSignatureFile(null);
      setSignaturePreview(null);
      toast.success('Signature uploaded successfully!');
    } catch (error) {
      console.error('Signature upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload signature';
      toast.error(message);
    } finally {
      setSignatureUploading(false);
    }
  };

  const handleRemoveSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  if (!canAccessSettings) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-gray-900 text-2xl">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="mb-2 font-bold text-gray-900 text-2xl">Settings</h1>
          <p className="text-gray-600">
            {canManageSettings 
              ? "Manage company bank accounts and system settings" 
              : "Manage your digital signature for invoices"
            }
          </p>
        </div>
      </div>

      {/* Bank Accounts Section - Admin Only */}
      {canManageSettings && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-900 text-xl">Bank Accounts</h2>
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={handleCreate}
            >
              Add Bank Account
            </Button>
          </div>

        {loading ? (
          <Loader size="lg" text="Loading bank accounts..." />
        ) : banks.length === 0 ? (
          <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
            <p className="mb-4 text-gray-500">No bank accounts configured yet.</p>
            {canManageSettings && (
              <Button
                variant="primary"
                icon={<Plus className="w-5 h-5" />}
                onClick={handleCreate}
              >
                Add Your First Bank Account
              </Button>
            )}
          </div>
        ) : (
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            {banks.map((bank) => (
              <div
                key={bank.id || bank._id}
                className={`bg-white p-6 rounded-lg border-2 transition-all ${
                  bank.isDefault
                    ? 'border-rose-400 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {bank.isDefault && (
                  <div className="inline-flex items-center bg-rose-100 mb-4 px-3 py-1 rounded-full font-medium text-rose-700 text-xs">
                    <Check className="mr-1 w-3 h-3" />
                    Default Account
                  </div>
                )}

                <h3 className="mb-4 font-bold text-gray-900 text-lg">{bank.bankName}</h3>

                <div className="space-y-2 mb-4">
                  <div>
                    <label className="text-gray-600 text-sm">Account Name</label>
                    <p className="font-medium text-gray-900">{bank.accountName}</p>
                  </div>

                  <div>
                    <label className="text-gray-600 text-sm">Account Number</label>
                    <p className="font-medium text-gray-900">{bank.accountNumber}</p>
                  </div>

                  {bank.swiftCode && (
                    <div>
                      <label className="text-gray-600 text-sm">SWIFT Code</label>
                      <p className="font-medium text-gray-900">{bank.swiftCode}</p>
                    </div>
                  )}

                  {bank.bankAddress && (
                    <div>
                      <label className="text-gray-600 text-sm">Bank Address</label>
                      <p className="text-gray-700 text-sm">{bank.bankAddress}</p>
                    </div>
                  )}
                </div>

                {canManageSettings && (
                  <div className="flex gap-2 pt-4 border-gray-200 border-t">
                    {!bank.isDefault && (
                      <button
                        onClick={() => handleSetDefault(bank.id || bank._id)}
                        className="flex-1 hover:bg-rose-50 px-3 py-2 rounded-lg font-medium text-rose-600 text-sm transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(bank)}
                      className="hover:bg-gray-100 px-3 py-2 rounded-lg font-medium text-gray-700 text-sm transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank.id || bank._id)}
                      className="hover:bg-red-50 px-3 py-2 rounded-lg font-medium text-red-600 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Signature Upload Section - Only for Accountants */}
      {user?.role === 'ACCOUNTANT' && (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 text-xl">Digital Signature</h2>
            <p className="text-gray-600 text-sm">Upload your signature for invoices</p>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          {user?.signature ? (
            <div className="text-center">
              <h3 className="mb-4 font-medium text-gray-900 text-lg">Current Signature</h3>
              <div className="inline-block bg-gray-50 mb-4 p-4 rounded-lg">
                <img
                  src={user.signature}
                  alt="Current signature"
                  className="max-w-full h-auto max-h-20 object-contain"
                />
              </div>
              <p className="mb-4 text-green-600 text-sm">✓ Signature uploaded and active</p>
              <p className="text-gray-500 text-sm">Your signature will appear on all invoices you create</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-900 text-lg">No Signature Uploaded</h3>
              <p className="mb-6 text-gray-500 text-sm">Upload your signature to have it automatically appear on invoices you create</p>
            </div>
          )}

          <div className="mt-6">
            <div className="p-6 border-2 border-gray-300 border-dashed rounded-lg">
              {signaturePreview ? (
                <div className="text-center">
                  <h4 className="mb-4 font-medium text-gray-900">Preview</h4>
                  <div className="inline-block bg-gray-50 mb-4 p-4 rounded-lg">
                    <img
                      src={signaturePreview}
                      alt="Signature preview"
                      className="max-w-full h-auto max-h-20 object-contain"
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="primary"
                      onClick={handleSignatureUpload}
                      loading={signatureUploading}
                      disabled={signatureUploading}
                    >
                      {signatureUploading ? 'Uploading...' : 'Upload Signature'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleRemoveSignature}
                      disabled={signatureUploading}
                    >
                      <X className="mr-2 w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileSelect}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 font-medium text-gray-700 text-sm cursor-pointer"
                  >
                    <Upload className="mr-2 w-5 h-5" />
                    Choose Signature File
                  </label>
                  <p className="mt-2 text-gray-500 text-sm">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Bank Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBank(null);
        }}
        title={editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
        size="lg"
      >
        <BankForm
          initialData={editingBank}
          onSubmit={handleSubmit}
          loading={submitLoading}
          onCancel={() => {
            setShowModal(false);
            setEditingBank(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Bank Form Component
const BankForm = ({ initialData, onSubmit, loading, onCancel }) => {
  const [formData, setFormData] = useState({
    bankName: initialData?.bankName || '',
    accountName: initialData?.accountName || '',
    accountNumber: initialData?.accountNumber || '',
    bankAddress: initialData?.bankAddress || '',
    swiftCode: initialData?.swiftCode || '',
    isDefault: initialData?.isDefault || false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Bank Name"
        type="text"
        name="bankName"
        value={formData.bankName}
        onChange={handleChange}
        placeholder="e.g., Access Bank, GTBank, First Bank"
        error={errors.bankName}
        required
      />

      <Input
        label="Account Name"
        type="text"
        name="accountName"
        value={formData.accountName}
        onChange={handleChange}
        placeholder="Company Name"
        error={errors.accountName}
        required
      />

      <Input
        label="Account Number"
        type="text"
        name="accountNumber"
        value={formData.accountNumber}
        onChange={handleChange}
        placeholder="0123456789"
        error={errors.accountNumber}
        required
      />

      <Input
        label="Bank Address (Optional)"
        type="text"
        name="bankAddress"
        value={formData.bankAddress}
        onChange={handleChange}
        placeholder="Bank branch address"
      />

      <Input
        label="SWIFT Code (Optional)"
        type="text"
        name="swiftCode"
        value={formData.swiftCode}
        onChange={handleChange}
        placeholder="For international payments"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="border-gray-300 rounded focus:ring-2 focus:ring-rose-400 focus:ring-offset-0 w-4 h-4 text-rose-400"
        />
        <label htmlFor="isDefault" className="ml-2 font-medium text-gray-700 text-sm">
          Set as default bank account
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-gray-200 border-t">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Bank Account' : 'Add Bank Account'}
        </Button>
      </div>
    </form>
  );
};

export default Settings;