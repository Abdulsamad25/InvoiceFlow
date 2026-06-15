import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, Key } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const pwChecks = {
    length: formData.password.length >= 8,
    lower: /[a-z]/.test(formData.password),
    upper: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;
  const strengthColors = ['bg-[#0f172a]', 'bg-red-800', 'bg-amber-700', 'bg-blue-700', 'bg-blue-500'];

  const validateForm = () => {
    const e = {};
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 8) e.password = 'Minimum 8 characters';
    else if (!pwChecks.lower) e.password = 'Must contain a lowercase letter';
    else if (!pwChecks.upper) e.password = 'Must contain an uppercase letter';
    else if (!pwChecks.number) e.password = 'Must contain a number';
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Invalid reset token'); return; }
    if (!validateForm()) { toast.error('Please fix the errors'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `flex items-center gap-3 bg-[#070e1a] border rounded-xl px-4 py-3 transition-colors ${
      errors[field] ? 'border-red-800' : 'border-[#0f172a] focus-within:border-blue-700'
    }`;

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <div className="hidden md:flex w-80 flex-shrink-0 bg-[#030d1e] border-r border-[#0f172a] flex-col justify-between p-10">
        <div>
          <div className="w-10 h-10 border border-blue-800 rounded-xl flex items-center justify-center mb-10">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[10px] text-blue-800 uppercase tracking-[.15em] mb-3">Account Recovery</p>
          <h2 className="text-white font-bold text-2xl leading-tight tracking-tight">
            New<br /><span className="text-blue-500">Password</span>
          </h2>
          <div className="w-8 h-0.5 bg-blue-800 mt-4 mb-8" />
          <div className="space-y-2 text-[10px] text-slate-700 uppercase tracking-widest">
            <div>Min 8 characters</div>
            <div>One uppercase letter</div>
            <div>One number</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0f172a] border border-slate-800" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <p className="text-[10px] text-blue-600 uppercase tracking-[.15em] mb-2">Set new password</p>
          <h1 className="text-white font-bold text-2xl tracking-tight mb-1">Reset password</h1>
          <p className="text-slate-600 text-sm mb-8">Create a strong new password for your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">New password</label>
              <div className={inputClass('password')}>
                <Lock className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a new password"
                  className="bg-transparent flex-1 text-white text-sm placeholder-slate-700 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-700 hover:text-slate-400 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthColors[pwStrength] : 'bg-[#0f172a]'}`} />
                  ))}
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">Confirm password</label>
              <div className={inputClass('confirmPassword')}>
                <Lock className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className="bg-transparent flex-1 text-white text-sm placeholder-slate-700 outline-none"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:bg-blue-900 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? 'Updating...' : <>Update password <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;