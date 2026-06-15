/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen w-full bg-[#07090f]">
        <div className="hidden md:flex flex-col justify-between w-1/2 border-r border-[#111827] px-12 py-10 relative">
          <div className="absolute top-0 right-0 w-16 h-px bg-[#1e2530]" />
          <div className="absolute top-0 right-0 w-px h-16 bg-[#1e2530]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#3a7bd5] rounded-sm" />
            <span className="text-xs font-semibold tracking-widest text-[#e2e8f0]">INVOICEFLOW</span>
          </div>
          <div>
            <div className="w-9 h-0.5 bg-[#3a7bd5] mb-5" />
            <h1 className="text-5xl font-bold leading-none text-white mb-4">
              Check your<br /><span className="text-[#3a7bd5]">inbox.</span>
            </h1>
            <p className="text-sm text-[#4a5568] leading-relaxed max-w-xs">
              We sent a secure reset link to <span className="text-[#e2e8f0]">{email}</span>. It expires in 15 minutes.
            </p>
          </div>
          <div className="flex gap-10 pt-6 border-t border-[#111827]">
            <div>
              <p className="text-lg font-bold text-white">15min</p>
              <p className="text-[10px] text-[#4a5568] mt-0.5">Link expiry</p>
            </div>
            {/* <div>
              <p className="text-lg font-bold text-white">TLS</p>
              <p className="text-[10px] text-[#4a5568] mt-0.5">Encrypted delivery</p>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-12 py-10 bg-[#0b0f1a]">
          <div className="max-w-sm w-full mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 border border-[#3a7bd5] rounded-2xl mb-6">
              <Mail className="w-6 h-6 text-[#3a7bd5]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email sent</h2>
            <p className="text-xs text-[#4a5568] mb-8 leading-relaxed">
              Reset link delivered to <span className="text-[#e2e8f0]">{email}</span>.<br />
              Check your spam folder if it doesn't arrive.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center justify-center gap-2 bg-[#3a7bd5] hover:bg-[#2d6abf] text-white text-xs font-semibold rounded-lg py-3 w-full transition-colors mb-3"
            >
              Back to login <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSent(false)}
              className="text-[10px] text-[#4a5568] hover:text-[#3a7bd5] transition-colors"
            >
              Didn't get it? Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#07090f]">
      <div className="hidden md:flex flex-col justify-between w-1/2 border-r border-[#111827] px-12 py-10 relative">
        <div className="absolute top-0 right-0 w-16 h-px bg-[#1e2530]" />
        <div className="absolute top-0 right-0 w-px h-16 bg-[#1e2530]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3a7bd5] rounded-sm" />
          <span className="text-xs font-semibold tracking-widest text-[#e2e8f0]">INVOICEFLOW</span>
        </div>
        <div>
          <div className="w-9 h-0.5 bg-[#3a7bd5] mb-5" />
          <h1 className="text-4xl font-bold leading-none text-white mb-4">
            Password <span className="text-[#3a7bd5]">recovery</span> portal.
          </h1>
          <p className="text-sm text-[#4a5568] leading-relaxed max-w-xs">
            A secure reset link will be delivered to your registered inbox within 60 seconds.
          </p>
        </div>
        <div className="flex gap-10 pt-6 border-t border-[#111827]">
          <div>
            <p className="text-lg font-bold text-white">60s</p>
            <p className="text-[10px] text-[#4a5568] mt-0.5">Link delivery</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">15min</p>
            <p className="text-[10px] text-[#4a5568] mt-0.5">Link expiry</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-12 py-10 bg-[#0b0f1a]">
        <div className="max-w-sm w-full mx-auto">
          <span className="inline-block text-[10px] font-semibold tracking-widest text-[#3a7bd5] bg-[#0f1829] border border-[#1e3a5f] rounded-full px-3 py-1 mb-5">
            04 / RECOVERY
          </span>
          <p className="text-xs text-[#4a5568] mb-6">Enter the email tied to your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label
                className={`absolute left-3 transition-all pointer-events-none z-10 ${
                  focused || email ? 'top-2 text-[9px] tracking-wider text-[#3a7bd5]' : 'top-1/2 -translate-y-1/2 text-xs text-[#4a5568]'
                }`}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=""
                className="w-full bg-[#07090f] border border-[#1e2530] focus:border-[#3a7bd5] rounded-lg pt-5 pb-2 pl-3 pr-10 text-xs text-[#e2e8f0] outline-none transition-colors"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a5f]" />
              {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#3a7bd5] hover:bg-[#2d6abf] text-white text-xs font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : <>Send reset link <Send className="w-3.5 h-3.5" /></>}
            </button>

            <Link
              to={ROUTES.SELECT_ROLE}
              className="flex items-center justify-center gap-2 border border-[#1e2530] hover:border-[#3a7bd5] text-[#4a5568] hover:text-[#3a7bd5] text-xs rounded-lg py-2.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;