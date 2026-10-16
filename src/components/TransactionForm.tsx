'use client';

import { useState, useRef, useMemo } from 'react';
import { Customer, Product } from '@/lib/types';
import { addTransaction } from '@/lib/actions';

interface SelectedCartItem {
  productId: number | null;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function TransactionForm({ customers, products }: { customers: Customer[], products: Product[] }) {
  // Mặc định là ghi theo món
  const [mode, setMode] = useState<'by_product' | 'by_customer'>('by_product');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // 1. STATE CHO "GHI THEO MÓN" (Mặc định)
  // ─────────────────────────────────────────────────────────────
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
  const [productCustomAmount, setProductCustomAmount] = useState<string>('');
  const [productShowCustom, setProductShowCustom] = useState<boolean>(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [searchCustomer, setSearchCustomer] = useState<string>('');

  const handleProductAdd = (productId: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleProductSubtract = (productId: number) => {
    setProductQuantities(prev => {
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

  const toggleCustomer = (customerId: number) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const filteredCustomers = useMemo(() => {
    const q = searchCustomer.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  }, [customers, searchCustomer]);

  const isAllFilteredSelected = filteredCustomers.length > 0 && filteredCustomers.every(c => selectedCustomerIds.includes(c.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredCustomers.map(c => c.id));
      setSelectedCustomerIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const next = new Set(selectedCustomerIds);
      filteredCustomers.forEach(c => next.add(c.id));
      setSelectedCustomerIds(Array.from(next));
    }
  };

  // Build items for "Ghi theo món"
  const productSelectedItems: SelectedCartItem[] = useMemo(() => {
    const items: SelectedCartItem[] = Object.entries(productQuantities)
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

    if (Number(productCustomAmount) > 0) {
      items.push({
        productId: null,
        name: 'Tiền tự do / Món khác',
        quantity: 1,
        unitPrice: Number(productCustomAmount),
        amount: Number(productCustomAmount)
      });
    }

    return items;
  }, [productQuantities, productCustomAmount, products]);

  const productTotalPerPerson = productSelectedItems.reduce((sum, item) => sum + item.amount, 0);
  const productItemCount = productSelectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const productGrandTotal = productTotalPerPerson * selectedCustomerIds.length;
  const formattedProductPerPerson = new Intl.NumberFormat('vi-VN').format(productTotalPerPerson);
  const formattedProductGrandTotal = new Intl.NumberFormat('vi-VN').format(productGrandTotal);

  // ─────────────────────────────────────────────────────────────
  // 2. STATE CHO "GHI THEO KHÁCH" (Giữ nguyên giao diện cũ)
  // ─────────────────────────────────────────────────────────────
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(customers[0]?.id || null);
  const [customerQuantities, setCustomerQuantities] = useState<Record<number, number>>({});
  const [customerCustomAmount, setCustomerCustomAmount] = useState<string>('');
  const [customerShowCustom, setCustomerShowCustom] = useState<boolean>(false);

  // Horizontal drag-to-scroll support for desktop & smooth touch
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeftState, setScrollLeftState] = useState<number>(0);
  const [hasDragged, setHasDragged] = useState<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleCustomerAdd = (productId: number) => {
    setCustomerQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleCustomerSubtract = (productId: number) => {
    setCustomerQuantities(prev => {
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

  // Build items array for "Ghi theo khách"
  const customerSelectedItems: SelectedCartItem[] = useMemo(() => {
    const items: SelectedCartItem[] = Object.entries(customerQuantities)
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

    if (Number(customerCustomAmount) > 0) {
      items.push({
        productId: null,
        name: 'Tiền tự do / Món khác',
        quantity: 1,
        unitPrice: Number(customerCustomAmount),
        amount: Number(customerCustomAmount)
      });
    }

    return items;
  }, [customerQuantities, customerCustomAmount, products]);

  const customerTotalItemCount = customerSelectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const customerTotalAmount = customerSelectedItems.reduce((sum, item) => sum + item.amount, 0);
  const formattedCustomerTotal = new Intl.NumberFormat('vi-VN').format(customerTotalAmount);

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        try {
          await addTransaction(formData);
        } finally {
          setIsSubmitting(false);
        }
      }}
      className="card"
      style={{ padding: '16px 0', backgroundColor: 'transparent', boxShadow: 'none' }}
    >
      {/* 2 hình thức ghi nợ: Ghi theo món (mặc định) & Ghi theo khách */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            background: '#E2E8F0',
            borderRadius: '16px',
            padding: '4px',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('by_product')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: mode === 'by_product' ? '#FFFFFF' : 'transparent',
              color: mode === 'by_product' ? 'var(--primary)' : '#4B5563',
              fontWeight: mode === 'by_product' ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: mode === 'by_product' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span>Ghi theo món</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('by_customer')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: mode === 'by_customer' ? '#FFFFFF' : 'transparent',
              color: mode === 'by_customer' ? 'var(--primary)' : '#4B5563',
              fontWeight: mode === 'by_customer' ? 700 : 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: mode === 'by_customer' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Ghi theo khách</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* HÌNH THỨC 1: GHI THEO MÓN (Chọn món -> Chọn 1 hoặc nhiều người) */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {mode === 'by_product' && (
        <>
          {/* Hidden inputs to pass data */}
          <input type="hidden" name="customerIds" value={JSON.stringify(selectedCustomerIds)} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              productSelectedItems.map(i => ({ productId: i.productId, amount: i.amount, quantity: i.quantity }))
            )}
          />

          {/* 1. Chọn món */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', margin: '4px 0 12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
              1. Chọn món (chạm để chọn số lượng)
            </h3>
            {productItemCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {productItemCount} món • {formattedProductPerPerson}đ/người
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px 16px' }}>
            {products.map(p => {
              const qty = productQuantities[p.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    transition: 'all 0.15s',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleProductAdd(p.id)}
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

                  {/* Stepper buttons if selected */}
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingRight: '8px', borderLeft: '1px solid #BFDBFE' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductSubtract(p.id);
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
                          handleProductAdd(p.id);
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
              onClick={() => setProductShowCustom(v => !v)}
              className={`chip-btn ${productShowCustom || Number(productCustomAmount) > 0 ? 'selected' : ''}`}
            >
              <span>+ Món khác / Tiền tự do</span>
            </button>
          </div>

          {/* Input số tiền tuỳ chỉnh */}
          {productShowCustom && (
            <div style={{ margin: '0 16px 16px', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563' }}>Nhập số tiền tự do cho mỗi người (VND)</label>
                {productCustomAmount && (
                  <button
                    type="button"
                    onClick={() => setProductCustomAmount('')}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="number"
                className="input"
                value={productCustomAmount}
                onChange={e => setProductCustomAmount(e.target.value)}
                placeholder="VD: 30000"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                autoFocus
              />
            </div>
          )}

          {/* 2. Chọn một hoặc nhiều người để ghi nợ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', margin: '8px 0 10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
              2. Chọn người ghi nợ
            </h3>
            <span style={{ fontSize: '0.75rem', color: selectedCustomerIds.length > 0 ? 'var(--primary)' : '#6B7280', fontWeight: 700 }}>
              {selectedCustomerIds.length > 0 ? `Đã chọn ${selectedCustomerIds.length} người` : `${customers.length} khách`}
            </span>
          </div>

          {/* Search bar & Chọn tất cả */}
          <div style={{ padding: '0 16px 10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchCustomer}
                onChange={e => setSearchCustomer(e.target.value)}
                placeholder="Tìm tên khách..."
                className="input"
                style={{
                  padding: '9px 30px 9px 34px',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF'
                }}
              />
              <svg
                style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {searchCustomer && (
                <button
                  type="button"
                  onClick={() => setSearchCustomer('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#E5E7EB',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#4B5563',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              style={{
                flexShrink: 0,
                padding: '9px 12px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                background: isAllFilteredSelected ? '#EFF6FF' : '#FFFFFF',
                color: isAllFilteredSelected ? 'var(--primary)' : '#374151',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isAllFilteredSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}
            </button>
          </div>

          {/* Tag danh sách người đã chọn (nếu có) */}
          {selectedCustomerIds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 16px 12px' }}>
              {selectedCustomerIds.map(id => {
                const cust = customers.find(c => c.id === id);
                if (!cust) return null;
                return (
                  <span
                    key={id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#EFF6FF',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    <span>{cust.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleCustomer(id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Grid chọn nhiều người */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              padding: '0 16px 16px',
              maxHeight: '340px',
              overflowY: 'auto'
            }}
          >
            {filteredCustomers.map(c => {
              const isSelected = selectedCustomerIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggleCustomer(c.id)}
                  style={{
                    padding: '11px 12px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 2px 8px rgba(26,107,255,0.15)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {/* Checkbox indicator */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                      backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary)' : '#1F2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={c.name}
                  >
                    {c.name}
                  </div>
                </div>
              );
            })}

            {filteredCustomers.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: '#6B7280', fontSize: '0.85rem' }}>
                Không tìm thấy khách hàng phù hợp.
              </div>
            )}
          </div>

          {/* Nút Ghi nợ */}
          <div style={{ padding: '0 16px' }}>

            <button
              type="submit"
              className="btn"
              disabled={selectedCustomerIds.length === 0 || productTotalPerPerson <= 0 || isSubmitting}
              style={{
                opacity: (selectedCustomerIds.length === 0 || productTotalPerPerson <= 0 || isSubmitting) ? 0.5 : 1,
                cursor: (selectedCustomerIds.length === 0 || productTotalPerPerson <= 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                padding: '14px'
              }}
            >
              {isSubmitting
                ? 'Đang ghi nợ...'
                : productTotalPerPerson <= 0
                  ? 'Vui lòng chọn món để ghi nợ'
                  : selectedCustomerIds.length === 0
                    ? 'Chọn ít nhất 1 người để ghi nợ'
                    : selectedCustomerIds.length === 1
                      ? `Xác Nhận Ghi Nợ (+${formattedProductGrandTotal}đ)`
                      : `Xác Nhận Ghi Nợ Cho ${selectedCustomerIds.length} Người (+${formattedProductGrandTotal}đ)`}
            </button>
          </div>
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* HÌNH THỨC 2: GHI THEO KHÁCH (Giữ nguyên 100% giao diện cũ) */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {mode === 'by_customer' && (
        <>
          {/* Hidden inputs to pass data to server action */}
          <input type="hidden" name="customerId" value={selectedCustomerId || ''} />
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(
              customerSelectedItems.map(i => ({ productId: i.productId, amount: i.amount, quantity: i.quantity }))
            )}
          />

          {/* 1. Chọn khách hàng */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
              1. Chọn khách hàng
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{customers.length} khách</span>
              <span>• vuốt ngang →</span>
            </span>
          </div>

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '12px',
              padding: '4px 16px 16px',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            {customers.map(c => {
              const isSelected = selectedCustomerId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (!hasDragged) {
                      setSelectedCustomerId(c.id);
                    }
                  }}
                  style={{
                    flex: '0 0 145px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 4px 12px rgba(26,107,255,0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--primary)' : '#EEF2FF',
                        color: isSelected ? '#FFFFFF' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {c.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div
                      className="font-bold"
                      style={{
                        fontSize: '0.9rem',
                        color: isSelected ? 'var(--primary)' : '#1F2937',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Nợ: <strong style={{ color: Number(c.total_debt) > 0 ? '#E02424' : '#16A34A' }}>
                      {Number(c.total_debt) > 0 ? '- ' : ''}{new Intl.NumberFormat('vi-VN').format(Number(c.total_debt))}đ
                    </strong>
                  </div>
                </div>
              );
            })}
            {customers.length === 0 && <div className="text-muted" style={{ padding: '0 16px' }}>Chưa có khách hàng.</div>}
          </div>

          {/* 2. Chọn một hoặc nhiều món */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', margin: '8px 0 12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>
              2. Chọn món (chạm để chọn nhiều)
            </h3>
            {customerTotalItemCount > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                Đã chọn {customerTotalItemCount} món
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px 16px' }}>
            {products.map(p => {
              const qty = customerQuantities[p.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    transition: 'all 0.15s',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCustomerAdd(p.id)}
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

                  {/* Stepper buttons if selected */}
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingRight: '8px', borderLeft: '1px solid #BFDBFE' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerSubtract(p.id);
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
                          handleCustomerAdd(p.id);
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
              onClick={() => setCustomerShowCustom(v => !v)}
              className={`chip-btn ${customerShowCustom || Number(customerCustomAmount) > 0 ? 'selected' : ''}`}
            >
              <span>+ Món khác / Tiền tự do</span>
            </button>
          </div>

          {/* Input số tiền tuỳ chỉnh */}
          {customerShowCustom && (
            <div style={{ margin: '0 16px 16px', background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4B5563' }}>Nhập số tiền tự do (VND)</label>
                {customerCustomAmount && (
                  <button
                    type="button"
                    onClick={() => setCustomerCustomAmount('')}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                )}
              </div>
              <input
                type="number"
                className="input"
                value={customerCustomAmount}
                onChange={e => setCustomerCustomAmount(e.target.value)}
                placeholder="VD: 30000"
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                autoFocus
              />
            </div>
          )}

          {/* 3. Tóm tắt & Nút Ghi nợ */}
          <div style={{ padding: '0 16px' }}>
            {customerSelectedItems.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Các món ghi nợ ({customerTotalItemCount}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {customerSelectedItems.map((item, idx) => (
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', marginTop: '10px', borderTop: '1px dashed #E5E7EB' }}>
                  <span style={{ fontSize: '0.9rem', color: '#4B5563', fontWeight: 600 }}>Tổng tiền:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>
                    {formattedCustomerTotal} <span style={{ fontSize: '0.9rem' }}>đ</span>
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn"
              disabled={!selectedCustomerId || customerTotalAmount <= 0 || isSubmitting}
              style={{
                opacity: (!selectedCustomerId || customerTotalAmount <= 0 || isSubmitting) ? 0.5 : 1,
                cursor: (!selectedCustomerId || customerTotalAmount <= 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                padding: '14px'
              }}
            >
              {isSubmitting
                ? 'Đang ghi nợ...'
                : customerTotalAmount > 0
                  ? `Xác Nhận Ghi Nợ (+${formattedCustomerTotal}đ)`
                  : 'Chọn khách và món để ghi nợ'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
