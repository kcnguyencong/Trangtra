import { getCustomerByToken, getCustomerTransactions, getPendingTicketForCustomer } from '@/lib/db';
import CustomerPortalView from '@/components/CustomerPortalView';
import Link from 'next/link';

export const instant = false;

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const customer = await getCustomerByToken(token);

  if (!customer) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px',
          }}
        >
          ✕
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
          Liên kết không hợp lệ
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '300px', lineHeight: 1.5, margin: '0 0 20px' }}>
          Không tìm thấy thông tin sổ nợ tương ứng với đường link này hoặc liên kết đã thay đổi.
        </p>
        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
          Vui lòng liên hệ Trang (Hotline: 0869.798.292) để nhận link mới nhất.
        </div>
      </div>
    );
  }

  const [transactions, pendingTicket] = await Promise.all([
    getCustomerTransactions(customer.id),
    getPendingTicketForCustomer(customer.id),
  ]);

  return (
    <CustomerPortalView
      customer={customer}
      transactions={transactions}
      pendingTicket={pendingTicket}
    />
  );
}
