'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { recordCustomerDebtAction } from '@/lib/actions';

export default function CustomerDebtCard({ customerId, products }: { customerId: number, products: Product[] }) {
  // Map of productId -> quantity
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Increase quantity by 1
  const handleAdd = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Decrease quantity by 1, remove if 0
  const handleSubtract = (productId: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: current - 1
      };
    });
  };

  interface SelectedCartItem {
    productId: number | null;
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }

  // Build items array to submit
  const selectedItems: SelectedCartItem[] = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([idStr, qty]) => {
      const p = products.find(prod => prod.id === Number(idStr));
      const unitPrice = p ? Number(p.price) : 0;
      return {
        productId: Number(idStr),
        name: p ? p.name : 'Món',
        quantity: qty,
        unitPrice,
        amount: unitPrice * qty
      };
    });

  if (Number(customAmount) > 0) {
    selectedItems.push({
      productId: null,
      name: 'Món khác / Tự do',
      quantity: 1,
      unitPrice: Number(customAmount),
      amount: Number(customAmount)
    });
  }

  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(totalAmount);

  const handleReset = () => {
    setQuantities({});
    setCustomAmount('');
    setShowCustomInput(false);
  };

  return (
    <div className="card" style={{ padding: '16px', margin: '0 0 16px', borderRadius: '18px', border: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Ghi nợ hôm nay</h3>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Chọn một hoặc nhiều món để ghi nợ</span>
          </div>
        </div>

        {totalItemCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Xóa chọn
          </button>
        )}
      </div>

      <form action={async (formData) => {
        setIsSubmitting(true);
        try {
          await recordCustomerDebtAction(formData);
          handleReset();
        } finally {
          setIsSubmitting(false);
        }
      }}>
        <input type="hidden" name="customerId" value={customerId} />
        {/* Pass array of items as JSON */}
        <input type="hidden" name="items" value={JSON.stringify(selectedItems.map(i => ({ productId: i.productId, amount: i.amount, quantity: i.quantity })))} />

        {/* 1. Danh sách chọn nhiều món */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563' }}>
              1. Chọn món (chạm để thêm số lượng)
            </label>
            {totalItemCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                Đã chọn {totalItemCount} món
              </span>
            )}
          </div>

          <div className="chip-grid">
            {products.map(p => {
              const qty = quantities[p.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
                    transition: 'all 0.15s',
                    overflow: 'hidden'
                  }}
                >
                  {/* Tap to select/add */}
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: isSelected ? 'var(--primary)' : '#374151',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.825rem'
                    }}
                  >
                    <span>{p.name}</span>
                    <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>
                      {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                    </span>
                  </button>

                  {/* Quantity Stepper buttons when selected */}
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingRight: '8px', borderLeft: '1px solid #BFDBFE' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubtract(p.id);
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'white',
                          color: 'var(--primary)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(p.id);
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'var(--primary)',
                          color: 'white',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom amount chip */}
            <button
              type="button"
              onClick={() => setShowCustomInput(v => !v)}
              className={`chip-btn ${showCustomInput || Number(customAmount) > 0 ? 'selected' : ''}`}
            >
              <span>+ Món khác / Tiền tự do</span>
            </button>
          </div>
        </div>

        {/* 2. Nhập số tiền tuỳ chỉnh nếu bấm Món khác */}
        {showCustomInput && (
          <div style={{ background: '#F9FAFB', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', border: '1px dashed #D1D5DB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563' }}>Nhập số tiền ghi nợ tự do (VND)</label>
              {customAmount && (
                <button
                  type="button"
                  onClick={() => setCustomAmount('')}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              )}
            </div>
            <input
              type="number"
              className="input"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="VD: 30000"
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              autoFocus
            />
          </div>
        )}

        {/* 3. Tóm tắt các món đã chọn */}
        {selectedItems.length > 0 && (
          <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.3px' }}>
              Chi tiết các món ({totalItemCount}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#1F2937' }}>{item.name}</span>
                    {item.quantity > 1 && (
                      <span style={{ background: '#E5E7EB', color: '#4B5563', fontSize: '0.7rem', fontWeight: 700, padding: '1px 5px', borderRadius: '6px' }}>
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {new Intl.NumberFormat('vi-VN').format(item.amount)}đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Thành tiền & Nút Ghi nợ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #E5E7EB', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Tổng cộng:</span>
            {totalItemCount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginLeft: '6px' }}>
                ({totalItemCount} món)
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>
            {formattedTotal} <span style={{ fontSize: '0.9rem' }}>đ</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={isSubmitting || totalAmount <= 0}
          style={{
            padding: '12px',
            fontSize: '0.95rem',
            opacity: totalAmount <= 0 ? 0.6 : 1,
            cursor: totalAmount <= 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting 
            ? 'Đang ghi nợ...' 
            : totalAmount > 0 
              ? `Ghi Nợ (+${formattedTotal}đ)` 
              : 'Chọn món để ghi nợ'}
        </button>
      </form>
    </div>
  );
}
