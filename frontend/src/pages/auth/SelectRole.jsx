import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Calculator, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { ROUTES } from '../../utils/constants';

const SelectRole = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'ADMIN') {
      navigate(ROUTES.ADMIN_LOGIN);
    } else if (role === 'ACCOUNTANT') {
      navigate(ROUTES.ACCOUNTANT_LOGIN);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050810] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/20 to-transparent" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-[400px] h-[400px] rounded-full bg-[#1d4ed8]/5 blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-[300px] h-[300px] rounded-full bg-[#2563eb]/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-1.5 h-8 bg-[#2563eb] rounded-full" />
            <span className="text-white text-xl font-bold tracking-tight">InvoiceFlow</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[#475569] text-sm">Select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div
            onClick={() => handleRoleSelect('ADMIN')}
            className="group relative bg-[#0a0f1e] border border-[#1e293b] hover:border-[#2563eb] rounded-2xl p-7 cursor-pointer transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#2563eb]/0 group-hover:bg-[#2563eb]/5 transition-all duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/0 group-hover:via-[#2563eb]/60 to-transparent transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#1e293b] group-hover:border-[#2563eb]/40 flex items-center justify-center mb-5 transition-all duration-300">
                <Shield className="w-5 h-5 text-[#475569] group-hover:text-[#2563eb] transition-colors duration-300" />
              </div>
              <h2 className="text-white font-semibold text-base mb-1.5 tracking-tight">Admin</h2>
              <p className="text-[#475569] text-xs leading-relaxed mb-5">Full system access. Manage users, settings, invoices, and clients.</p>
              <div className="flex items-center gap-1.5 text-[#2563eb] text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span>Admin Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div
            onClick={() => handleRoleSelect('ACCOUNTANT')}
            className="group relative bg-[#0a0f1e] border border-[#1e293b] hover:border-[#2563eb] rounded-2xl p-7 cursor-pointer transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#2563eb]/0 group-hover:bg-[#2563eb]/5 transition-all duration-300" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/0 group-hover:via-[#2563eb]/60 to-transparent transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#1e293b] group-hover:border-[#2563eb]/40 flex items-center justify-center mb-5 transition-all duration-300">
                <Calculator className="w-5 h-5 text-[#475569] group-hover:text-[#2563eb] transition-colors duration-300" />
              </div>
              <h2 className="text-white font-semibold text-base mb-1.5 tracking-tight">Accountant</h2>
              <p className="text-[#475569] text-xs leading-relaxed mb-5">Create and manage invoices, clients, and generate reports.</p>
              <div className="flex items-center gap-1.5 text-[#2563eb] text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span>Accountant Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[#334155] text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="text-[#2563eb] hover:text-[#3b82f6] font-medium transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;