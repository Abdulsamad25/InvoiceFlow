import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'ADMIN'
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    if (name === 'password') {
      if (!value) {
        newErrors.password = 'Password is required';
      } else if (value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        toast.error('You are not authorized as an Admin');
        navigate(ROUTES.SELECT_ROLE);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050810] flex relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-[#1d4ed8]/5 blur-3xl" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#2563eb]/4 blur-3xl" />
      </div>

      <div className="hidden lg:flex flex-col justify-between w-[40%] shrink-0 border-r border-[#0f172a] bg-[#070c1a] px-12 py-12 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-7 bg-[#2563eb] rounded-full" />
          <span className="text-white text-lg font-bold tracking-tight">InvoiceFlow</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-[#0f1b35] border border-[#1e3a5f] rounded-full px-3 py-1.5 mb-8">
            <Shield className="w-3 h-3 text-[#2563eb]" />
            <span className="text-[#2563eb] text-[11px] font-medium tracking-wide">Admin Portal</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4 tracking-tight">
            Admin Control Center
          </h2>
          <p className="text-[#334155] text-sm leading-relaxed">
            Manage users, configure settings, and oversee every operation across your organisation.
          </p>

        </div>

        <p className="text-[#1e293b] text-xs">© 2025 InvoiceFlow. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="text-[#2563eb] text-xs font-semibold tracking-widest uppercase mb-3">Admin Login</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Sign in to your account</h1>
            <p className="text-[#475569] text-sm">Enter your credentials to access the admin console</p>
          </div>

          <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="admin@example.com"
                icon={<Mail className="w-4 h-4 text-[#334155]" />}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4 text-[#334155]" />}
                error={errors.password}
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded accent-[#2563eb] border-[#1e293b]"
                  />
                  <span className="text-[#475569] text-xs">Remember me</span>
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-[#2563eb] hover:text-[#3b82f6] text-xs font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Sign In as Admin
              </Button>
            </form>
          </div>

          <button
            onClick={() => navigate(ROUTES.SELECT_ROLE)}
            className="flex items-center gap-2 text-[#334155] hover:text-[#64748b] text-xs mt-6 mx-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;