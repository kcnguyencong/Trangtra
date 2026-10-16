'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/lib/actions';

export default function BottomNav() {
  const pathname = usePathname();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ẩn thanh bottom nav trên trang đăng nhập
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <>
      <nav className="bottom-nav">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
          <svg fill={pathname === '/' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>Trang chủ</span>
        </Link>
        
        <Link href="/customers" className={`nav-item ${pathname === '/customers' ? 'active' : ''}`}>
          <svg fill={pathname === '/customers' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <span>Khách</span>
        </Link>

        <Link href="/products" className={`nav-item ${pathname === '/products' ? 'active' : ''}`}>
          <svg fill={pathname === '/products' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          <span>Thực đơn</span>
        </Link>

        {/* Tài khoản chủ quán & Đăng xuất */}
        <button
          type="button"
          onClick={() => setShowAccountModal(true)}
          className="nav-item"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span>Tài khoản</span>
        </button>
      </nav>

      {/* Modal Tài khoản / Đăng xuất */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#EFF6FF',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
                Tài khoản chủ quán
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                Đang đăng nhập: <strong>Trangtra</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn"
                style={{
                  background: '#EF4444',
                  padding: '12px',
                  fontSize: '0.95rem'
                }}
              >
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất khỏi thiết bị'}
              </button>

              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                style={{
                  background: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
