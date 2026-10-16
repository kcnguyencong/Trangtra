'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions';

export default function LoginPage() {
  const [username, setUsername] = useState('Trangtra');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res?.success) {
        window.location.href = '/';
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
      {/* ── BRAND HERO BANNER VỚI ẢNH HEADER-BG ── */}
      <div
        style={{
          position: 'relative',
          padding: '54px 20px 48px',
          backgroundImage:
            'linear-gradient(180deg, rgba(12, 18, 36, 0.5) 0%, rgba(12, 18, 36, 0.28) 40%, rgba(12, 18, 36, 0.82) 100%), url("/header-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 22%',
          backgroundRepeat: 'no-repeat',
          color: '#FFFFFF',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Glassmorphic Brand Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '22px',
            background: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 6px',
            letterSpacing: '-0.4px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
          }}
        >
          Trang Trà
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.88)',
            margin: 0,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          Hệ thống ghi nợ nội bộ dành riêng cho chủ quán
        </p>
      </div>

      {/* ── SHEET FORM ĐĂNG NHẬP (BO TRÒN GỐC TRÊN) ── */}
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: '26px 26px 0 0',
          marginTop: '-22px',
          padding: '28px 20px 40px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)'
              }}
            />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Đăng nhập đi Trang
            </h2>
          </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '18px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Tên đăng nhập */}
          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (Trangtra)"
                className="input"
                required
                style={{
                  paddingLeft: '40px',
                  fontSize: '0.95rem',
                  backgroundColor: '#F9FAFB'
                }}
              />
              <svg
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'block' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="input"
                required
                autoFocus
                style={{
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  fontSize: '0.95rem',
                  backgroundColor: '#F9FAFB'
                }}
              />
              <svg
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>

              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={isLoading || !password}
            style={{
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              opacity: (isLoading || !password) ? 0.6 : 1,
              cursor: (isLoading || !password) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#9CA3AF', fontSize: '0.78rem' }}>
          <span>🔒 Phiên đăng nhập được lưu tự động trên thiết bị này</span>
        </div>
        </div>
      </div>
    </div>
  );
}
