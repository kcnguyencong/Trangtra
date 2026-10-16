import { getCustomers } from '@/lib/db';
import { addCustomer } from '@/lib/actions';
import Link from 'next/link';

export const instant = false;

// Each customer gets a consistent pastel avatar color based on their name
const AVATAR_COLORS = [
  { bg: '#FFE4E1', text: '#E05252' }, // red-ish
  { bg: '#E1EDFF', text: '#3B6FE8' }, // blue
  { bg: '#E1F7EE', text: '#2E9E6A' }, // green
  { bg: '#FFF3DC', text: '#D4870A' }, // amber
  { bg: '#F0E4FF', text: '#8A52D4' }, // purple
  { bg: '#FFE8F5', text: '#D45298' }, // pink
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="page-wrap">
      <h2 className="page-title">Khách Hàng</h2>
      
      {/* Form thêm mới */}
      <div className="card" style={{ padding: '16px', borderRadius: '18px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#111827' }}>
          Thêm khách hàng mới
        </h3>
        <form action={addCustomer}>
          <div className="input-group">
            <label>Tên khách hàng</label>
            <input type="text" name="name" className="input" placeholder="VD: Anh Tuấn" required />
          </div>
          <div className="input-group">
            <label>Số điện thoại (Tuỳ chọn)</label>
            <input type="tel" name="phone" className="input" placeholder="0912..." />
          </div>
          <button type="submit" className="btn">Thêm Khách Hàng</button>
        </form>
      </div>

      {/* Danh sách khách hàng đồng bộ phong cách Homepage */}
      <div className="card" style={{ padding: '12px 16px', borderRadius: '20px', marginTop: '16px' }}>
        <div className="list-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
          <div className="list-header-left">
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Danh sách khách hàng</h2>
            <span className="count-badge">{customers.length}</span>
          </div>
        </div>

        <div>
          {customers.map(c => {
            const color = getAvatarColor(c.name);
            const initial = c.name.trim().charAt(0).toUpperCase();
            const hasDebt = Number(c.total_debt) > 0;
            return (
              <Link key={c.id} href={`/customers/${c.id}`} className="customer-row">
                <div className="customer-avatar" style={{ background: color.bg, color: color.text }}>
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="customer-name" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1px' }}>
                    {c.phone || 'Không sđt'}
                  </div>
                </div>
                <span className={`customer-debt ${hasDebt ? 'has-debt' : 'no-debt'}`}>
                  {hasDebt ? '- ' : ''}{new Intl.NumberFormat('vi-VN').format(Number(c.total_debt))}&nbsp;đ
                </span>
                <svg className="customer-chevron" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}

          {customers.length === 0 && (
            <div className="text-center text-muted" style={{ padding: '32px 0', fontSize: '0.875rem' }}>
              Chưa có khách hàng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
