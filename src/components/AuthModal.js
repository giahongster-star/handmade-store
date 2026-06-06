'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let res;
    if (isLoginMode) {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    setSubmitting(false);

    if (res.success) {
      // Clear forms
      setName('');
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError(res.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1918]/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#EAE6DF] rounded-3xl shadow-2xl p-8 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A373]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C2410C]/5 rounded-full blur-3xl -z-10" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8C867E] hover:text-[#1A1918] transition-colors rounded-full hover:bg-[#F2EFE9]"
          aria-label="Close Auth Modal"
          data-testid="auth-close-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <span className="font-serif text-3xl font-bold tracking-widest text-[#1A1918]">AURACRAFT</span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#8C867E] mt-1">Artisanal Handcrafted</span>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#EAE6DF] mb-6">
          <button
            type="button"
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 border-b-2 text-center ${
              isLoginMode 
                ? 'border-[#D4A373] text-[#1A1918]' 
                : 'border-transparent text-[#8C867E] hover:text-[#1A1918]'
            }`}
            onClick={() => {
              setIsLoginMode(true);
              setError('');
            }}
            data-testid="auth-tab-login"
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 border-b-2 text-center ${
              !isLoginMode 
                ? 'border-[#D4A373] text-[#1A1918]' 
                : 'border-transparent text-[#8C867E] hover:text-[#1A1918]'
            }`}
            onClick={() => {
              setIsLoginMode(false);
              setError('');
            }}
            data-testid="auth-tab-register"
          >
            Đăng Ký
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-semibold text-[#5C5752] mb-1.5">Họ và Tên</label>
              <input
                type="text"
                required
                id="auth-name"
                data-testid="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all duration-300"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5C5752] mb-1.5">Email</label>
            <input
              type="email"
              required
              id="auth-email"
              data-testid="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5C5752] mb-1.5">Mật Khẩu</label>
            <input
              type="password"
              required
              id="auth-password"
              data-testid="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            data-testid="auth-submit-btn"
            disabled={submitting}
            className="w-full mt-6 py-3.5 bg-[#1A1918] hover:bg-[#D4A373] text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span>{isLoginMode ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</span>
            )}
          </button>
        </form>

        {/* Mode switcher footer */}
        <div className="mt-6 text-center text-xs text-[#8C867E]">
          {isLoginMode ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="font-semibold text-[#D4A373] hover:underline"
                onClick={() => {
                  setIsLoginMode(false);
                  setError('');
                }}
                data-testid="auth-toggle-mode"
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                className="font-semibold text-[#D4A373] hover:underline"
                onClick={() => {
                  setIsLoginMode(true);
                  setError('');
                }}
                data-testid="auth-toggle-mode"
              >
                Đăng nhập ngay
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
