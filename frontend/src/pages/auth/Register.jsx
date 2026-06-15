/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Shield, Calculator, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, USER_ROLES } from '../../utils/constants';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', password: '', confirmPassword: '', role: '' });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwChecks = {
    length: formData.password.length >= 8,
    lower: /[a-z]/.test(formData.password),
    upper: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(formData.email)) e.email = 'Please enter a valid email address';
    if (!formData.company.trim()) e.company = 'Company name is required';
    if (!formData.role) e.role = 'Please select a role';
    if (!formData.password) e.password = 'Password is required';
    else if (!pwChecks.length) e.password = 'At least 8 characters';
    else if (!pwChecks.lower || !pwChecks.upper || !pwChecks.number) e.password = 'Must include uppercase, lowercase & number';
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
    if (!validateForm()) { toast.error('Please fix the errors in the form'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      if (formData.role === USER_ROLES.ADMIN) navigate(ROUTES.ADMIN_DASHBOARD);
      else if (formData.role === USER_ROLES.ACCOUNTANT) navigate(ROUTES.ACCOUNTANT_DASHBOARD);
      else navigate(ROUTES.SELECT_ROLE);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const FloatField = ({ name, type = 'text', label, icon: Icon }) => {
    const active = focused[name] || formData[name];
    return (
      <div className="relative">
        <label
          className={`absolute left-3 transition-all pointer-events-none z-10 ${
            active ? 'top-2 text-[9px] tracking-wider text-[#3a7bd5]' : 'top-1/2 -translate-y-1/2 text-xs text-[#4a5568]'
          }`}
        >
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => setFocused(p => ({ ...p, [name]: true }))}
          onBlur={() => setFocused(p => ({ ...p, [name]: false }))}
          placeholder=""
          className="w-full bg-[#07090f] border border-[#1e2530] focus:border-[#3a7bd5] rounded-lg pt-5 pb-2 pl-3 pr-10 text-xs text-[#e2e8f0] outline-none transition-colors"
        />
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a5f]" />
        {errors[name] && <p className="mt-1 text-[10px] text-red-500">{errors[name]}</p>}
      </div>
    );
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Excellent'][pwStrength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3a7bd5', '#22c55e'][pwStrength];

  return (
    <div className="h-full w-full bg-[#07090f] flex flex-col">
      <div className="flex items-center justify-between px-8 sm:px-12 py-6 border-b border-[#111827]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3a7bd5] rounded-sm" />
          <span className="text-xs font-semibold tracking-widest text-[#e2e8f0]">INVOICEFLOW</span>
        </div>
        <span className="inline-block text-[10px] font-semibold tracking-widest text-[#3a7bd5] bg-[#0f1829] border border-[#1e3a5f] rounded-full px-3 py-1">
          03 / CREATE ACCOUNT
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
        <div className="max-w-2xl w-full mx-auto">
          <div className="mb-8">
            <div className="w-9 h-0.5 bg-[#3a7bd5] mb-4" />
            <h1 className="text-2xl font-bold text-white leading-none">
              Join <span className="text-[#3a7bd5]">InvoiceFlow</span>
            </h1>
            <p className="text-xs text-[#4a5568] mt-2">Start managing your invoices today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                <FloatField name="name" label="Full name" icon={User} />
                <FloatField name="email" type="email" label="Email address" icon={Mail} />
                <FloatField name="company" label="Company name" icon={Building} />

                <div>
                  <p className="text-[9px] font-semibold tracking-widest text-[#4a5568] mb-2">SELECT ROLE</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: USER_ROLES.ADMIN, label: 'Admin', desc: 'Full system access', Icon: Shield },
                      { role: USER_ROLES.ACCOUNTANT, label: 'Accountant', desc: 'Invoices & reports', Icon: Calculator },
                    ].map(({ role, label, desc, Icon }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => { setFormData(p => ({ ...p, role })); if (errors.role) setErrors(p => ({ ...p, role: '' })); }}
                        className={`rounded-xl p-4 text-center border transition-all ${
                          formData.role === role
                            ? 'border-[#3a7bd5] bg-[#0a1628]'
                            : 'border-[#1e2530] bg-[#07090f] hover:border-[#3a7bd5]/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-2 ${formData.role === role ? 'text-[#3a7bd5]' : 'text-[#1e3a5f]'}`} />
                        <p className={`text-xs font-semibold ${formData.role === role ? 'text-[#e2e8f0]' : 'text-[#2d3748]'}`}>{label}</p>
                        <p className={`text-[10px] mt-0.5 ${formData.role === role ? 'text-[#4a5568]' : 'text-[#1e2530]'}`}>{desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-[10px] text-red-500">{errors.role}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <FloatField name="password" type="password" label="Password" icon={Lock} />

                {formData.password && (
                  <div>
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full transition-all"
                          style={{ background: i <= pwStrength ? strengthColor : '#1e2530' }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px]" style={{ color: strengthColor }}>{strengthLabel}</p>
                      <div className="flex gap-3">
                        {Object.entries({ '8+': pwChecks.length, 'Aa': pwChecks.upper && pwChecks.lower, '0-9': pwChecks.number }).map(([k, v]) => (
                          <span key={k} className={`text-[9px] flex items-center gap-0.5 ${v ? 'text-[#3a7bd5]' : 'text-[#1e2530]'}`}>
                            {v ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <FloatField name="confirmPassword" type="password" label="Confirm password" icon={Lock} />

                <div className="bg-[#07090f] border border-[#111827] rounded-lg p-4">
                  <p className="text-[9px] font-semibold tracking-widest text-[#1e3a5f] mb-3">REQUIREMENTS</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: '8+ characters', met: pwChecks.length },
                      { label: 'Uppercase letter', met: pwChecks.upper },
                      { label: 'Lowercase letter', met: pwChecks.lower },
                      { label: 'One number', met: pwChecks.number },
                    ].map(({ label, met }) => (
                      <div key={label} className={`flex items-center gap-2 text-[10px] transition-colors ${met ? 'text-[#3a7bd5]' : 'text-[#1e2530]'}`}>
                        {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[#3a7bd5] hover:bg-[#2d6abf] text-white text-xs font-semibold rounded-lg py-3 transition-colors disabled:opacity-50 mt-auto"
                >
                  {loading ? 'Creating account...' : <>Create account <ArrowRight className="w-4 h-4" /></>}
                </button>

                <p className="text-[10px] text-[#4a5568] text-center">
                  Already have an account?{' '}
                  <Link to={ROUTES.SELECT_ROLE} className="text-[#3a7bd5] hover:text-[#5b93e0] transition-colors">Sign in</Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;