'use client';

import { useState } from 'react';
import { PaymentTicket } from '@/lib/types';
import { approvePaymentTicketAction, rejectPaymentTicketAction } from '@/lib/actions';
import Link from 'next/link';

interface PendingTicketsWidgetProps {
  tickets: PaymentTicket[];
}

export default function PendingTicketsWidget({ tickets: initialTickets }: PendingTicketsWidgetProps) {
  const [tickets, setTickets] = useState<PaymentTicket[]>(initialTickets);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  if (!tickets || tickets.length === 0) {
    return null;
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const formatTimeAgo = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const handleApprove = async (ticket: PaymentTicket) => {
    if (loadingId) return;
    setLoadingId(ticket.id);

    const formData = new FormData();
    formData.append('ticketId', String(ticket.id));

    try {
      const res = await approvePaymentTicketAction(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
      }
    } catch {
      alert('Có lỗi xảy ra khi duyệt. Vui lòng thử lại!');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (ticket: PaymentTicket) => {
    if (loadingId) return;
    const confirmed = confirm(`Bạn có chắc muốn bỏ qua yêu cầu thanh toán ${formatMoney(ticket.amount)}đ của ${ticket.customer_name}?`);
    if (!confirmed) return;

    setLoadingId(ticket.id);
    const formData = new FormData();
    formData.append('ticketId', String(ticket.id));
    formData.append('customerId', String(ticket.customer_id));

    try {
      const res = await rejectPaymentTicketAction(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
      }
    } catch {
      alert('Có lỗi xảy ra khi từ chối.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      style={{
        margin: '12px 16px 0',
        background: '#FFFBEB',
        border: '1.5px solid #FCD34D',
        borderRadius: '20px',
        padding: '14px 16px',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400E' }}>
            Khách báo đã chuyển khoản
          </span>
          <span
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '12px',
            }}
          >
            {tickets.length}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600 }}>
          Check bank & duyệt 1 chạm
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickets.map(t => {
          const isLoading = loadingId === t.id;

          return (
            <div
              key={t.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '12px 14px',
                border: '1px solid #FDE68A',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Link
                    href={`/customers/${t.customer_id}`}
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      textDecoration: 'none',
                    }}
                  >
                    {t.customer_name || 'Khách hàng'}
                  </Link>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                    {formatTimeAgo(t.created_at)} {t.customer_phone ? `• ${t.customer_phone}` : ''}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    color: '#059669',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  +{formatMoney(Number(t.amount))}&nbsp;đ
                </div>
              </div>

              {t.note && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#475569',
                    background: '#F8FAFC',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{t.note}&rdquo;
                </div>
              )}

              {/* ACTION BUTTONS: DUYỆT 1-CHẠM HOẶC BỎ QUA */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => handleApprove(t)}
                  disabled={isLoading}
                  style={{
                    flex: 1.6,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{isLoading ? 'Đang duyệt...' : 'Xác nhận xóa nợ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReject(t)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#64748B',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
