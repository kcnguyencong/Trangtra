'use client';

import { useRef, useState, useMemo } from 'react';
import { Customer } from '@/lib/types';
import { toPng, toBlob } from 'html-to-image';

interface ExportBillModalProps {
  customer: Customer;
  transactions: any[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportBillModal({
  customer,
  transactions,
  isOpen,
  onClose,
}: ExportBillModalProps) {
  const billRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group transactions chronologically by day
  const groupedDays = useMemo(() => {
    const groups: Record<
      string,
      {
        date: Date;
        items: any[];
        dayDebtTotal: number;
        dayPayTotal: number;
      }
    > = {};

    // Sort earliest to latest
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const t of sorted) {
      const d = new Date(t.created_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      if (!groups[key]) {
        groups[key] = {
          date: d,
          items: [],
          dayDebtTotal: 0,
          dayPayTotal: 0,
        };
      }

      groups[key].items.push(t);
      if (t.type === 'debt') {
        groups[key].dayDebtTotal += Number(t.amount);
      } else {
        groups[key].dayPayTotal += Number(t.amount);
      }
    }

    return Object.entries(groups).map(([key, data]) => ({
      key,
      ...data,
    }));
  }, [transactions]);

  const totalDebtTransactions = transactions.filter(t => t.type === 'debt');
  const totalDebtSum = totalDebtTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPaidSum = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const formatDayHeader = (d: Date) => {
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const day = dayNames[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${day}, ${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chia sẻ ảnh qua Zalo / Apps
  const handleShare = async () => {
    if (!billRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await toBlob(billRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#FFFFFF',
      });

      if (!blob) throw new Error('Không thể tạo ảnh');

      const fileName = `Bang_ke_no_${customer.name.trim().replace(/\s+/g, '_')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bảng kê nợ - ${customer.name}`,
          text: `Gửi bạn bảng kê chi tiết công nợ tại Trang Trà:`,
        });
      } else {
        // Fallback tải ảnh
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Đã tải ảnh bill về máy!');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        showToast('Có lỗi khi xuất ảnh. Vui lòng thử lại!');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Tải ảnh trực tiếp
  const handleDownload = async () => {
    if (!billRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(billRef.current, {
        pixelRatio: 2.5,
        backgroundColor: '#FFFFFF',
      });

      const fileName = `Bang_ke_no_${customer.name.trim().replace(/\s+/g, '_')}.png`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      showToast('Đã tải ảnh bill thành công!');
    } catch (err) {
      console.error(err);
      showToast('Không thể tạo file ảnh. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => !isExporting && onClose()}
      style={{ padding: '16px 12px' }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 14px',
          borderRadius: '24px',
          background: '#F8FAFC',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '0 4px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Phiếu đối soát công nợ
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0' }}>
              Khách: <strong>{customer.name}</strong> • {groupedDays.length} ngày phát sinh
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={handleShare}
            disabled={isExporting}
            className="btn"
            style={{
              flex: 1.3,
              padding: '11px 12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '14px',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>{isExporting ? 'Đang tạo...' : 'Gửi qua Zalo / Chia sẻ'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            style={{
              flex: 1,
              padding: '11px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: '#FFFFFF',
              color: '#334155',
              border: '1.5px solid #CBD5E1',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Lưu ảnh</span>
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div
            style={{
              padding: '8px 12px',
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #86EFAC',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            ✓ {toastMessage}
          </div>
        )}

        {/* Scrollable Preview Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#CBD5E1',
            padding: '12px 8px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* VÙNG BILL ĐƯỢC CHỤP LÀM ẢNH (RECEIPT TEMPLATE) */}
          {/* ═════════════════════════════════════════════════════════════ */}
          <div
            ref={billRef}
            style={{
              width: '100%',
              maxWidth: '370px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              padding: '24px 18px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              boxSizing: 'border-box',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Header Bill */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  color: '#0F172A',
                  margin: '0 0 2px',
                  textTransform: 'uppercase',
                }}
              >
                Trang Trà
              </h2>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                BẢNG KÊ ĐỐI SOÁT CÔNG NỢ
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Hotline: 0869.798.292 • Đối soát nội bộ
              </div>
            </div>

            {/* Dashed line */}
            <div style={{ borderTop: '1.5px dashed #CBD5E1', margin: '12px 0' }} />

            {/* Customer info section */}
            <div
              style={{
                fontSize: '0.825rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                color: '#334155',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Khách hàng:</span>
                <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{customer.name}</strong>
              </div>
              {customer.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Số điện thoại:</span>
                  <span>{customer.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Ngày xuất phiếu:</span>
                <span>
                  {new Date().toLocaleDateString('vi-VN')} {formatTime(new Date())}
                </span>
              </div>
            </div>

            {/* Dashed line */}
            <div style={{ borderTop: '1.5px dashed #CBD5E1', margin: '14px 0 10px' }} />

            {/* Grouped by date entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {groupedDays.map(group => (
                <div key={group.key} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Ngày phát sinh Header */}
                  <div
                    style={{
                      background: '#F1F5F9',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#334155',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span>📅 {formatDayHeader(group.date)}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {group.items.length} món
                    </span>
                  </div>

                  {/* Items trong ngày */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 4px' }}>
                    {group.items.map((t, idx) => {
                      const isDebt = t.type === 'debt';
                      const name = isDebt
                        ? t.product_name || 'Ghi nợ tự do'
                        : 'Thanh toán / Trả nợ';

                      return (
                        <div
                          key={t.id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.825rem',
                            padding: '2px 0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: isDebt ? '#94A3B8' : '#16A34A', fontSize: '0.75rem' }}>
                              {isDebt ? '•' : '✓'}
                            </span>
                            <span
                              style={{
                                fontWeight: isDebt ? 600 : 700,
                                color: isDebt ? '#1E293B' : '#16A34A',
                              }}
                            >
                              {name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                              {formatTime(new Date(t.created_at))}
                            </span>
                          </div>

                          <span
                            style={{
                              fontWeight: 700,
                              fontVariantNumeric: 'tabular-nums',
                              color: isDebt ? '#0F172A' : '#16A34A',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isDebt ? '' : '-'}
                            {formatMoney(Number(t.amount))}đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {groupedDays.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748B', fontSize: '0.8rem' }}>
                  Chưa có lịch sử giao dịch phát sinh.
                </div>
              )}
            </div>

            {/* Dashed line */}
            <div style={{ borderTop: '2px dashed #94A3B8', margin: '16px 0 12px' }} />

            {/* Totals Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#64748B',
                }}
              >
                <span>Tổng phát sinh nợ ({totalDebtTransactions.length} lần):</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {formatMoney(totalDebtSum)}đ
                </span>
              </div>

              {totalPaidSum > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#16A34A',
                  }}
                >
                  <span>Đã thanh toán:</span>
                  <span style={{ fontWeight: 600 }}>-{formatMoney(totalPaidSum)}đ</span>
                </div>
              )}

              {/* Chốt nợ hiện tại */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  marginTop: '4px',
                  borderTop: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                    TỔNG CÔNG NỢ HIỆN TẠI
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Số tiền cần thanh toán
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    color: Number(customer.total_debt) > 0 ? '#DC2626' : '#16A34A',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Number(customer.total_debt) > 0 ? '' : ''}
                  {formatMoney(Number(customer.total_debt))} <span style={{ fontSize: '0.9rem' }}>đ</span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #E2E8F0',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '0.72rem',
                lineHeight: '1.4',
              }}
            >
              {customer.share_token && (
                <div
                  style={{
                    background: '#F8FAFC',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '10px',
                    fontSize: '0.72rem',
                    color: '#334155',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    🔗 Tra cứu sổ nợ & báo thanh toán online:
                  </div>
                  <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', marginTop: '2px', color: '#0F172A' }}>
                    trangtra.vn/c/{customer.share_token}
                  </div>
                </div>
              )}
              <div>✨ <em>Cảm ơn bạn đã tin tưởng & ủng hộ Trang Trà!</em> ✨</div>
              <div style={{ marginTop: '2px', color: '#94A3B8' }}>
                Quý khách vui lòng kiểm tra chi tiết các khoản nợ từng ngày bên trên.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
