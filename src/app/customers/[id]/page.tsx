import { getCustomer, getCustomerTransactions, getProducts, getPendingTicketForCustomer } from '@/lib/db';
import CustomerHeader from '@/components/CustomerHeader';
import CustomerDebtCard from '@/components/CustomerDebtCard';
import PendingTicketsWidget from '@/components/PendingTicketsWidget';
import Link from 'next/link';

export const instant = false;

function getTransactionIcon(isDebt: boolean, productName?: string) {
  if (!isDebt) return { icon: '✓', bg: '#DCFCE7', text: '#16A34A' };
  if (!productName) return { icon: '📝', bg: '#FEE2E2', text: '#DC2626' };
  const name = productName.toLowerCase();
  if (name.includes('trà') || name.includes('cafe') || name.includes('cà phê') || name.includes('nước') || name.includes('sữa') || name.includes('cam')) {
    return { icon: '🍹', bg: '#E0F2FE', text: '#0284C7' };
  }
  return { icon: '🍜', bg: '#FEF3C7', text: '#D97706' };
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customerId = Number(id);
  const customer = await getCustomer(customerId);
  
  if (!customer) {
    return (
      <div className="page-wrap text-center" style={{ paddingTop: '80px' }}>
        <p className="text-muted" style={{ marginBottom: '16px' }}>Không tìm thấy khách hàng.</p>
        <Link href="/customers" className="btn" style={{ display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const [transactions, products, pendingTicket] = await Promise.all([
    getCustomerTransactions(customerId),
    getProducts(),
    getPendingTicketForCustomer(customerId),
  ]);

  return (
    <>
      {/* ── HEADER HIỆN ĐẠI NHƯ HOMEPAGE ── */}
      <CustomerHeader customer={customer} transactions={transactions} />

      {/* ── THÔNG BÁO TICKET THANH TOÁN (NẾU CÓ) ── */}
      {pendingTicket && (
        <PendingTicketsWidget
          tickets={[{
            ...pendingTicket,
            customer_name: customer.name,
            customer_phone: customer.phone,
          }]}
        />
      )}

      {/* ── WHITE SHEET NỘI DUNG ── */}
      <div className="main-sheet">
        {/* Card Ghi nợ hôm nay */}
        <CustomerDebtCard customerId={customer.id} products={products} />

        {/* Lịch sử giao dịch đồng bộ style Homepage */}
        <div className="card" style={{ padding: '12px 16px', borderRadius: '20px', marginTop: '16px' }}>
          <div className="list-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
            <div className="list-header-left">
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Lịch sử giao dịch</h2>
              <span className="count-badge">{transactions.length}</span>
            </div>
          </div>

          <div>
            {transactions.map(t => {
              // @ts-ignore
              const isDebt = t.type === 'debt';
              // @ts-ignore
              const iconInfo = getTransactionIcon(isDebt, t.product_name);

              return (
                <div key={t.id} className="customer-row">
                  <div 
                    className="customer-avatar" 
                    style={{ 
                      background: iconInfo.bg, 
                      color: iconInfo.text,
                      fontSize: '1.15rem'
                    }}
                  >
                    {iconInfo.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="customer-name" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {/* @ts-ignore */}
                      {isDebt ? (t.product_name || 'Ghi nợ tự do') : 'Thanh toán nợ'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1px' }}>
                      {new Date(t.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <span className={`customer-debt ${isDebt ? 'has-debt' : 'no-debt'}`}>
                    {isDebt ? '- ' : '+ '}{new Intl.NumberFormat('vi-VN').format(Number(t.amount))}&nbsp;đ
                  </span>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <div className="text-center text-muted" style={{ padding: '32px 0', fontSize: '0.875rem' }}>
                Chưa có lịch sử giao dịch nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
