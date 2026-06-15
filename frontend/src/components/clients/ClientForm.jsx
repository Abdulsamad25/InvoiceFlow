import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { Mail, Phone, MapPin, Building } from 'lucide-react';

const ClientForm = ({ initialData, onSubmit, loading, onCancel, asForm = true }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    taxId: initialData?.taxId || ''
  });
  
  const [errors, setErrors] = useState({});
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };
    
    if (name === 'name' && !value.trim()) {
      newErrors.name = 'Client name is required';
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'phone' && value && !validatePhone(value)) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (name === 'phone') {
      delete newErrors.phone;
    }
    
    setErrors(newErrors);
  };
  
  const handleSubmit = (e) => {
    if (asForm) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    onSubmit(formData);
  };
  
  const FormWrapper = asForm ? 'form' : 'div';
  const formProps = asForm ? { onSubmit: handleSubmit } : {};
  
  return (
    <FormWrapper {...formProps} className="space-y-6">
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <Input
          label="Client Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John Doe"
          icon={<Building className="w-5 h-5 text-gray-400" />}
          error={errors.name}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="client@example.com"
          icon={<Mail className="w-5 h-5 text-gray-400" />}
          error={errors.email}
          required
        />
        
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+1 234 567 8900"
          icon={<Phone className="w-5 h-5 text-gray-400" />}
          error={errors.phone}
        />
        
        <Input
          label="Company Name"
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Acme Corp"
          icon={<Building className="w-5 h-5 text-gray-400" />}
        />
        
        <div className="md:col-span-2">
          <Input
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St"
            icon={<MapPin className="w-5 h-5 text-gray-400" />}
          />
        </div>
        
        <Input
          label="City"
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="New York"
        />
        
        <Input
          label="Country"
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="United States"
        />
        
        <div className="md:col-span-2">
          <Input
            label="Tax ID / VAT Number"
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            placeholder="123-456-789"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type={asForm ? "submit" : "button"} 
          variant="primary" 
          loading={loading}
          onClick={asForm ? undefined : handleSubmit}
        >
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </FormWrapper>
  );
};

export default ClientForm;