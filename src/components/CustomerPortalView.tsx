'use client';

import { useState } from 'react';
import { Customer, PaymentTicket } from '@/lib/types';
import { createPaymentTicketAction } from '@/lib/actions';

interface CustomerPortalViewProps {
  customer: Customer;
  transactions: any[];
  pendingTicket: PaymentTicket | null;
}

export default function CustomerPortalView({
  customer,
  transactions,
  pendingTicket: initialPendingTicket,
}: CustomerPortalViewProps) {
  const [pendingTicket, setPendingTicket] = useState<PaymentTicket | null>(initialPendingTicket);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payAmount, setPayAmount] = useState<number | string>(
    customer.total_debt > 0 ? customer.total_debt : ''
  );
  const [note, setNote] = useState('');
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const totalDebt = Number(customer.total_debt);
  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  // Group transactions by date
  const groupedDays: { date: Date; items: any[] }[] = [];
  const groups: Record<string, { date: Date; items: any[] }> = {};

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const t of sortedTransactions) {
    const d = new Date(t.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    if (!groups[key]) {
      groups[key] = { date: d, items: [] };
      groupedDays.push(groups[key]);
    }
    groups[key].items.push(t);
  }

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}!`);
  };

  // Bank Info for Trang Tra
  const bankId = 'MB'; // MB Bank
  const bankAccount = '0869798292';
  const bankAccountName = 'NGUYEN THI TRANG';
  const transferContent = `TT ${customer.name.trim()}`;
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${Math.max(
    0,
    totalDebt
  )}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(
    bankAccountName
  )}`;

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('customerId', String(customer.id));
    formData.append('amount', String(amountNum));
    formData.append('note', note);
    formData.append('token', customer.share_token || '');

    try {
      const res = await createPaymentTicketAction(formData);
      if (res?.error) {
        alert(res.error);
      } else {
        setShowConfirmModal(false);
        setPendingTicket({
          id: Date.now(),
          customer_id: customer.id,
          amount: amountNum,
          note,
          status: 'pending',
          created_at: new Date(),
        });
        showToast('✓ Đã gửi thông báo cho Trang thành công!');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '60px', background: '#F8FAFC' }}>
      {/* Toast Alert */}
      {copyToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            animation: 'modalFadeIn 0.2s ease-out',
          }}
        >
          {copyToast}
        </div>
      )}

      {/* ─── HEADER ─── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '28px 20px 24px',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38BDF8',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
              }}
            >
              Trang Trà
            </div>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '2px 0 0',
                letterSpacing: '-0.3px',
              }}
            >
              Sổ Nợ Cá Nhân
            </h1>
          </div>

          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              fontSize: '0.75rem',
              color: '#E2E8F0',
              fontWeight: 600,
            }}
          >
            Đối soát trực tiếp
          </div>
        </div>

        {/* Customer Info Badge */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#38BDF8',
                color: '#0F172A',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              {customer.name.trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                {customer.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {customer.phone || 'Khách quen'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>
            Cập nhật liên tục
          </span>
        </div>
      </div>

      {/* ─── NỘI DUNG CHÍNH ─── */}
      <div style={{ padding: '16px', marginTop: '-8px' }}>
        {/* CARD TỔNG CÔNG NỢ */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '22px',
            padding: '20px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tổng tiền nợ hiện tại
          </div>

          <div
            style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              color: totalDebt > 0 ? '#DC2626' : '#16A34A',
              margin: '8px 0 4px',
              letterSpacing: '-0.5px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {totalDebt > 0 ? `- ${formatMoney(totalDebt)}` : '0'} <span style={{ fontSize: '1.25rem' }}>đ</span>
          </div>

          {totalDebt <= 0 ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#16A34A',
                fontSize: '0.825rem',
                fontWeight: 600,
                background: '#DCFCE7',
                padding: '4px 12px',
                borderRadius: '16px',
                marginTop: '4px',
              }}
            >
              ✓ Bạn không còn khoản nợ nào tại Trang Trà!
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Quý khách vui lòng kiểm tra chi tiết các món bên dưới.
            </div>
          )}
        </div>

        {/* ─── BANNER TRẠNG THÁI: NẾU ĐANG CÓ TICKET CHỜ DUYỆT ─── */}
        {pendingTicket && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                ⏳
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400E' }}>
                  Đã báo chuyển khoản: {formatMoney(Number(pendingTicket.amount))}đ
                </div>
                <p style={{ fontSize: '0.8rem', color: '#B45309', margin: '4px 0 0', lineHeight: 1.4 }}>
                  Trang đã nhận được thông báo của bạn. Sau khi kiểm tra tài khoản, Trang sẽ bấm xác nhận để trừ nợ ngay nhé!
                </p>
                <div style={{ fontSize: '0.72rem', color: '#92400E', marginTop: '6px', opacity: 0.8 }}>
                  Thời gian gửi: {new Date(pendingTicket.created_at).toLocaleTimeString('vi-VN')} {new Date(pendingTicket.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── KHU VỰC THANH TOÁN (NẾU CÒN NỢ VÀ CHƯA GỬI TICKET) ─── */}
        {totalDebt > 0 && !pendingTicket && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '22px',
              padding: '18px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Thanh toán qua chuyển khoản
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, background: '#DCFCE7', padding: '3px 8px', borderRadius: '10px' }}>
                VietQR 24/7
              </span>
            </div>

            {/* QR Code Center */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={qrUrl}
                  alt="Mã VietQR Chuyển Khoản"
                  style={{
                    width: '190px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '10px',
                  }}
                  onError={(e) => {
                    // Fallback hide image if network error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                Mở app Ngân hàng để quét mã thanh toán đúng <strong>{formatMoney(totalDebt)}đ</strong>
              </div>
            </div>

            {/* Bank details copy row */}
            <div
              style={{
                background: '#F1F5F9',
                borderRadius: '14px',
                padding: '10px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                color: '#334155',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Ngân hàng:</span>
                <strong>MB Bank (Quân Đội)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Chủ tài khoản:</span>
                <strong>{bankAccountName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A', letterSpacing: '0.5px' }}>{bankAccount}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankAccount, 'số tài khoản')}
                    style={{
                      background: '#E2E8F0',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Nội dung CK:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: 'var(--primary)' }}>{transferContent}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'nội dung chuyển khoản')}
                    style={{
                      background: '#E2E8F0',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 7px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* ONE-TAP ACTION BUTTON */}
            <button
              type="button"
              onClick={() => {
                setPayAmount(totalDebt);
                setShowConfirmModal(true);
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00B96B 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 185, 107, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Tôi đã chuyển khoản ({formatMoney(totalDebt)}đ)</span>
            </button>
          </div>
        )}

        {/* ─── LỊCH SỬ GIAO DỊCH CHI TIẾT ─── */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '22px',
            padding: '18px 16px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Chi tiết các lần nợ & thanh toán
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              {transactions.length} giao dịch
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {groupedDays.map((group, gIdx) => {
              const d = group.date;
              const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
              const dateStr = `${dayNames[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(
                d.getMonth() + 1
              ).padStart(2, '0')}/${d.getFullYear()}`;

              return (
                <div key={gIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Ngày Header */}
                  <div
                    style={{
                      background: '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#475569',
                      marginBottom: '6px',
                    }}
                  >
                    📅 {dateStr}
                  </div>

                  {/* Danh sách món trong ngày */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 4px' }}>
                    {group.items.map((t: any) => {
                      const isDebt = t.type === 'debt';
                      const itemDate = new Date(t.created_at);
                      const timeStr = `${String(itemDate.getHours()).padStart(2, '0')}:${String(
                        itemDate.getMinutes()
                      ).padStart(2, '0')}`;
                      const name = isDebt
                        ? t.product_name || 'Ghi nợ tự do'
                        : 'Thanh toán nợ';

                      return (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: '1px dashed #F1F5F9',
                            fontSize: '0.825rem',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: isDebt ? '#1E293B' : '#16A34A' }}>
                              {isDebt ? '• ' : '✓ '}
                              {name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{timeStr}</div>
                          </div>

                          <div
                            style={{
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              color: isDebt ? '#DC2626' : '#16A34A',
                            }}
                          >
                            {isDebt ? '+ ' : '- '}
                            {formatMoney(Number(t.amount))}&nbsp;đ
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                Chưa có lịch sử nợ nào được ghi nhận.
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER LIÊN HỆ & MẸO ─── */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '0 12px', color: '#64748B', fontSize: '0.75rem', lineHeight: 1.5 }}>
          <div>✨ <strong>Trang Trà</strong> cảm ơn quý khách đã tin tưởng và ủng hộ! ✨</div>
          <div style={{ marginTop: '4px' }}>
            Hotline hỗ trợ: <strong style={{ color: '#0F172A' }}>0869.798.292</strong>
          </div>
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: '#F1F5F9',
              borderRadius: '12px',
              color: '#475569',
              fontSize: '0.72rem',
            }}
          >
            💡 <strong>Mẹo nhỏ:</strong> Bạn có thể lưu lại link trang này hoặc ghim vào Zalo để tra cứu số nợ bất cứ lúc nào!
          </div>
        </div>
      </div>

      {/* ─── MODAL XÁC NHẬN BÁO ĐÃ CHUYỂN KHOẢN (ZERO UPLOAD) ─── */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => !isSubmitting && setShowConfirmModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Xác nhận đã chuyển khoản
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số tiền bạn đã chuyển (VNĐ)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Nút trả hết nhanh */}
                {totalDebt > 0 && Number(payAmount) !== totalDebt && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(totalDebt)}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ↺ Đổi lại số tiền nợ đầy đủ ({formatMoney(totalDebt)}đ)
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Lời nhắn cho Trang <span style={{ fontWeight: 400, color: '#94A3B8' }}>(không bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Em gửi tiền trà hôm nay nha..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1.5,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#00B96B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi xác nhận ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
