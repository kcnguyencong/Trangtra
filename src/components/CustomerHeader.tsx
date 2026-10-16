'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { updateCustomerAction, payCustomerDebtAction } from '@/lib/actions';

export default function CustomerHeader({ customer }: { customer: Customer }) {
  const [showBalance, setShowBalance] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | string>(customer.total_debt > 0 ? customer.total_debt : '');

  const totalDebt = Number(customer.total_debt);
  const formattedDebt = new Intl.NumberFormat('vi-VN').format(totalDebt);

  return (
    <>
      <div className="home-header">
        {/* Top row */}
        <div className="home-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link 
              href="/customers" 
              className="icon-btn" 
              style={{ 
                textDecoration: 'none', 
                color: '#FFFFFF', 
                cursor: 'pointer', 
                opacity: 1, 
                pointerEvents: 'auto'
              }}
              aria-label="Quay lại danh sách"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {customer.name}
                </h1>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="customer-edit-btn"
                  title="Sửa tên & Số điện thoại"
                  aria-label="Sửa thông tin khách hàng"
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '12px', height: '12px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                  <span>Sửa</span>
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.82)', marginTop: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {customer.phone ? customer.phone : 'Chưa có số ĐT'}
              </div>
            </div>
          </div>
        </div>

        {/* Balance Display Card */}
        <div className="home-balance-card">
          <div className="home-balance-card-left">
            <div className="home-balance-label">
              <span>Tổng Nợ Hiện Tại</span>
              <button
                onClick={() => setShowBalance(v => !v)}
                className="eye-toggle-btn"
                aria-label="Ẩn / Hiện số nợ"
              >
                {showBalance ? (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            <div className="home-balance-amount" style={{ color: totalDebt > 0 ? '#FFA39E' : '#FFFFFF' }}>
              {showBalance ? `${totalDebt > 0 ? '- ' : ''}${formattedDebt}` : '••••••'}
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>đ</span>
            </div>
          </div>

          <div className="home-balance-card-right">
            <button
              onClick={() => {
                setPayAmount(totalDebt > 0 ? totalDebt : '');
                setShowPayModal(true);
              }}
              disabled={totalDebt <= 0}
              className="customer-pay-btn"
              style={{
                opacity: totalDebt <= 0 ? 0.5 : 1,
                cursor: totalDebt <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6H2.25m0 0v8.25m0-8.25a60.073 60.073 0 0 1 15.797-2.101c.727-.198 1.453.342 1.453 1.096V6m0 0v12m0-12a59.83 59.83 0 0 1 2.25.042m0 0a.75.75 0 0 1 .75.75v10.416a.75.75 0 0 1-.75.75m0 0a59.83 59.83 0 0 1-2.25.042" />
              </svg>
              <span>Thanh toán nợ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAL CHỈNH SỬA THÔNG TIN KHÁCH ─── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#111827' }}>Sửa thông tin khách hàng</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            <form action={async (formData) => {
              await updateCustomerAction(formData);
              setShowEditModal(false);
            }}>
              <input type="hidden" name="customerId" value={customer.id} />
              
              <div className="input-group">
                <label>Tên khách hàng</label>
                <input 
                  type="text" 
                  name="name" 
                  className="input" 
                  defaultValue={customer.name} 
                  required 
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Số điện thoại</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="input" 
                  defaultValue={customer.phone || ''} 
                  placeholder="0912..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#4B5563'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ flex: 1, padding: '12px', margin: 0 }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL THANH TOÁN NỢ ─── */}
      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#111827' }}>Thanh toán nợ</h3>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                  Khách: <strong>{customer.name}</strong> • Đang nợ: <strong style={{ color: '#E02424' }}>{formattedDebt} đ</strong>
                </div>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            <form action={async (formData) => {
              await payCustomerDebtAction(formData);
              setShowPayModal(false);
            }}>
              <input type="hidden" name="customerId" value={customer.id} />
              
              <div className="input-group">
                <label>Số tiền trả (VND)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="input" 
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="Nhập số tiền" 
                  required 
                  autoFocus
                  style={{ fontSize: '1.25rem', fontWeight: 700 }}
                />
              </div>

              {/* Quick Amount Suggestion Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPayAmount(totalDebt)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #93C5FD',
                    background: '#EFF6FF',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Trả hết ({formattedDebt}đ)
                </button>
                {[20000, 50000, 100000, 200000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPayAmount(val)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: '#4B5563',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {new Intl.NumberFormat('vi-VN').format(val)}đ
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#4B5563'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  style={{ flex: 1.3, padding: '12px', margin: 0 }}
                >
                  Xác nhận trả nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
