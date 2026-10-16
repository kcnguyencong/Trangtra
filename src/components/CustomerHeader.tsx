'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { updateCustomerAction, payCustomerDebtAction, deleteCustomerAction } from '@/lib/actions';
import ExportBillModal from '@/components/ExportBillModal';

export default function CustomerHeader({ customer, transactions = [] }: { customer: Customer; transactions?: any[] }) {
  const [showBalance, setShowBalance] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDeleteBlockedModal, setShowDeleteBlockedModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [payAmount, setPayAmount] = useState<number | string>(customer.total_debt > 0 ? customer.total_debt : '');

  const totalDebt = Number(customer.total_debt);
  const formattedDebt = new Intl.NumberFormat('vi-VN').format(totalDebt);

  const handleDeleteClick = () => {
    if (totalDebt > 0) {
      setShowDeleteBlockedModal(true);
    } else {
      setShowDeleteConfirmModal(true);
    }
  };

  return (
    <>
      <div className="home-header" style={{ position: 'relative', zIndex: showMenu ? 50 : 'auto' }}>
        {/* Top row */}
        <div className="home-header-top" style={{ position: 'relative', zIndex: showMenu ? 50 : 2 }}>
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
                
                {/* Menu ... Tùy chọn (Dropdown Sửa / Xóa) */}
                <div style={{ position: 'relative', display: 'inline-block', zIndex: showMenu ? 100 : 'auto' }}>
                  <button 
                    type="button"
                    onClick={() => setShowMenu(v => !v)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Tùy chọn thao tác"
                    aria-label="Tùy chọn thao tác"
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>

                  {showMenu && (
                    <>
                      <div 
                        onClick={() => setShowMenu(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: '32px',
                          left: 0,
                          background: '#FFFFFF',
                          borderRadius: '14px',
                          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
                          border: '1px solid #E5E7EB',
                          padding: '5px',
                          minWidth: '165px',
                          zIndex: 1000,
                          animation: 'modalFadeIn 0.12s ease-out'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowBillModal(true);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 12px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#1F2937',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '15px', height: '15px', color: '#0284C7' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                          <span>Xuất bill đối soát</span>
                        </button>

                        <div style={{ height: '1px', background: '#F3F4F6', margin: '3px 0' }} />

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowEditModal(true);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 12px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#1F2937',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '15px', height: '15px', color: '#4B5563' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                          <span>Sửa thông tin</span>
                        </button>

                        <div style={{ height: '1px', background: '#F3F4F6', margin: '3px 0' }} />

                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            handleDeleteClick();
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 12px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#DC2626',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '15px', height: '15px', color: '#DC2626' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                          <span>Xóa khách hàng</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.82)', marginTop: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {customer.phone ? customer.phone : 'Chưa có số ĐT'}
              </div>
            </div>
          </div>

          {/* Quick Xuất Bill button on header top */}
          <button
            type="button"
            onClick={() => setShowBillModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.38)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.15s ease'
            }}
            title="Xuất bill đối soát gửi khách"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '15px', height: '15px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>Xuất bill</span>
          </button>
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

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #E5E7EB', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    handleDeleteClick();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Xóa khách hàng này</span>
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

      {/* ─── MODAL KHÔNG CHO PHÉP XÓA VÌ CÒN NỢ ─── */}
      {showDeleteBlockedModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteBlockedModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
                Không thể xóa khách hàng!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.45', margin: 0 }}>
                Khách hàng <strong>{customer.name}</strong> hiện còn khoản nợ chưa trả là <strong style={{ color: '#EF4444' }}>{formattedDebt}đ</strong>.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '6px' }}>
                Hệ thống chỉ cho phép xóa khi khách đã hoàn tất toàn bộ công nợ.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteBlockedModal(false);
                  setPayAmount(totalDebt);
                  setShowPayModal(true);
                }}
                className="btn btn-success"
                style={{ padding: '12px', fontSize: '0.9rem' }}
              >
                Thanh toán nợ ngay ({formattedDebt}đ)
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteBlockedModal(false)}
                style={{
                  background: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  padding: '11px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
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

      {/* ─── MODAL CONFIRM XÁC NHẬN XÓA (KHI HẾT NỢ) ─── */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay" onClick={() => !isDeleting && setShowDeleteConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
                Xác nhận xóa khách hàng?
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.45', margin: 0 }}>
                Bạn có chắc chắn muốn xóa khách hàng <strong>{customer.name}</strong> không?
              </p>
              <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '6px', fontWeight: 500 }}>
                ⚠️ Toàn bộ lịch sử giao dịch liên quan sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác!
              </p>
            </div>

            <form action={async (formData) => {
              setIsDeleting(true);
              try {
                await deleteCustomerAction(formData);
              } finally {
                setIsDeleting(false);
                setShowDeleteConfirmModal(false);
              }
            }}>
              <input type="hidden" name="customerId" value={customer.id} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    color: '#4B5563'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="btn"
                  style={{
                    flex: 1.2,
                    padding: '12px',
                    background: '#DC2626',
                    margin: 0,
                    opacity: isDeleting ? 0.6 : 1,
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL XUẤT BILL ĐỐI SOÁT CÔNG NỢ ─── */}
      <ExportBillModal
        customer={customer}
        transactions={transactions}
        isOpen={showBillModal}
        onClose={() => setShowBillModal(false)}
      />
    </>
  );
}
