'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';

interface CustomerSearchListProps {
  customers: Customer[];
}

// Modern, professional masculine avatar color palette
const AVATAR_COLORS = [
  { bg: '#E2E8F0', text: '#334155' }, // Slate steel
  { bg: '#DBEAFE', text: '#1D4ED8' }, // Ocean blue
  { bg: '#D1FAE5', text: '#065F46' }, // Deep emerald
  { bg: '#E0E7FF', text: '#3730A3' }, // Royal indigo
  { bg: '#FEF3C7', text: '#92400E' }, // Warm amber tobacco
  { bg: '#CFFAFE', text: '#0E7490' }, // Steel cyan
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// Bỏ dấu tiếng Việt để tìm kiếm không dấu siêu mượt
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export default function CustomerSearchList({ customers }: CustomerSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    if (filterDebtOnly) {
      result = result.filter(c => Number(c.total_debt) > 0);
    }

    const query = removeVietnameseTones(searchQuery);
    if (query) {
      result = result.filter(c => {
        const nameNorm = removeVietnameseTones(c.name || '');
        const phoneNorm = (c.phone || '').replace(/\s+/g, '');
        return nameNorm.includes(query) || phoneNorm.includes(query);
      });
    }

    return result;
  }, [customers, searchQuery, filterDebtOnly]);

  const debtCustomersCount = useMemo(() => {
    return customers.filter(c => Number(c.total_debt) > 0).length;
  }, [customers]);

  return (
    <div>
      {/* ── LIST HEADER ── */}
      <div className="list-header" style={{ marginBottom: '14px' }}>
        <div className="list-header-left">
          <h2>Danh sách khách hàng</h2>
          <span className="count-badge">
            {searchQuery || filterDebtOnly
              ? `${filteredCustomers.length}/${customers.length}`
              : customers.length}
          </span>
        </div>

        <div className="list-header-right" style={{ display: 'flex', gap: '8px' }}>
          {/* Nút Tìm kiếm */}
          <button
            type="button"
            className="list-icon-btn"
            onClick={() => {
              setIsSearchOpen(prev => !prev);
              if (isSearchOpen && searchQuery) {
                setSearchQuery('');
              }
            }}
            aria-label="Tìm kiếm khách hàng"
            title="Tìm kiếm"
            style={{
              cursor: 'pointer',
              opacity: 1,
              pointerEvents: 'auto',
              color: isSearchOpen || searchQuery ? 'var(--primary)' : '#4B5563',
              background: isSearchOpen || searchQuery ? '#EFF6FF' : 'transparent',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '19px', height: '19px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>

          {/* Nút Lọc khách nợ */}
          <button
            type="button"
            className="list-icon-btn"
            onClick={() => setFilterDebtOnly(prev => !prev)}
            aria-label="Lọc khách đang nợ"
            title={filterDebtOnly ? 'Hiện tất cả khách' : 'Chỉ hiện khách đang nợ'}
            style={{
              cursor: 'pointer',
              opacity: 1,
              pointerEvents: 'auto',
              color: filterDebtOnly ? '#DC2626' : '#4B5563',
              background: filterDebtOnly ? '#FEF2F2' : 'transparent',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '19px', height: '19px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.539.092.917.57.917 1.115v1.258a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.56c0-.546.378-1.023.917-1.115A48.887 48.887 0 0 1 12 3Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── THANH TÌM KIẾM THEO TÊN (HIỆN KHI BẤM HOẶC LUÔN TIỆN DỤNG) ── */}
      {isSearchOpen && (
        <div style={{ marginBottom: '14px', animation: 'modalFadeIn 0.15s ease-out' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F1F5F9',
              borderRadius: '14px',
              padding: '8px 12px',
              border: '1.5px solid #CBD5E1',
              gap: '8px',
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '18px', height: '18px', color: '#64748B', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên khách hàng (VD: Tuấn, Dũng...)"
              autoFocus
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.9rem',
                color: '#0F172A',
                width: '100%',
              }}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: '#CBD5E1',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#475569',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                aria-label="Xóa nội dung tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── FILTER CHIPS NHANH (TẤT CẢ / ĐANG NỢ) ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setFilterDebtOnly(false)}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            border: !filterDebtOnly ? '1px solid var(--primary)' : '1px solid #E2E8F0',
            background: !filterDebtOnly ? '#EFF6FF' : '#F8FAFC',
            color: !filterDebtOnly ? 'var(--primary)' : '#64748B',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Tất cả ({customers.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterDebtOnly(true)}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            border: filterDebtOnly ? '1px solid #EF4444' : '1px solid #E2E8F0',
            background: filterDebtOnly ? '#FEF2F2' : '#F8FAFC',
            color: filterDebtOnly ? '#DC2626' : '#64748B',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Đang nợ ({debtCustomersCount})</span>
        </button>
      </div>

      {/* ── DANH SÁCH KHÁCH HÀNG ── */}
      <div>
        {filteredCustomers.map(c => {
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
                {c.phone && (
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '1px' }}>
                    {c.phone}
                  </div>
                )}
              </div>
              <span className={`customer-debt ${hasDebt ? 'has-debt' : 'no-debt'}`}>
                {hasDebt ? '- ' : ''}{formatMoney(Number(c.total_debt))}&nbsp;đ
              </span>
              <svg className="customer-chevron" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          );
        })}

        {/* Trạng thái không tìm thấy */}
        {filteredCustomers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
              Không tìm thấy khách hàng nào
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 12px' }}>
              {searchQuery
                ? `Không có khách nào khớp với "${searchQuery}"`
                : 'Không có khách hàng nào đang nợ'}
            </p>
            {(searchQuery || filterDebtOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterDebtOnly(false);
                }}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                }}
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
