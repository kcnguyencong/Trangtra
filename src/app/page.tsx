import { getCustomers, getPendingPaymentTickets } from '@/lib/db';
import ToggleBalance from '@/components/ToggleBalance';
import PendingTicketsWidget from '@/components/PendingTicketsWidget';
import CustomerSearchList from '@/components/CustomerSearchList';

export const instant = false;

export default async function Home() {
  const [customers, pendingTickets] = await Promise.all([
    getCustomers(),
    getPendingPaymentTickets(),
  ]);
  const totalDebt = customers.reduce((sum, c) => sum + Number(c.total_debt), 0);

  return (
    <>
      {/* ── HEADER ── */}
      <div className="home-header">
        <div className="home-header-top">
          <div className="home-title">
            <h1>Trang Trà</h1>
            <div className="home-title-arrow">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="home-header-actions">
            <button className="icon-btn" aria-label="Cài đặt" disabled title="Chưa khả dụng">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button className="icon-btn" aria-label="Thêm" disabled title="Chưa khả dụng">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </button>
          </div>
        </div>

        <ToggleBalance balance={totalDebt} />
      </div>

      {/* ── THÔNG BÁO TICKET CHỜ DUYỆT (NẾU CÓ) ── */}
      <PendingTicketsWidget tickets={pendingTickets} />

      {/* ── WHITE SHEET (TÌM KIẾM & DANH SÁCH KHÁCH) ── */}
      <div className="main-sheet">
        <CustomerSearchList customers={customers} />
      </div>
    </>
  );
}
