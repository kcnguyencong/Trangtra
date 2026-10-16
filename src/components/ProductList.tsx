'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { updateProductAction, deleteProductAction } from '@/lib/actions';

const CATEGORY_COLORS = {
  1: { bg: '#E0F2FE', text: '#0284C7', label: 'Đồ uống', icon: '🍹' },
  2: { bg: '#FEF3C7', text: '#D97706', label: 'Đồ ăn', icon: '🍜' },
};

export default function ProductList({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');

  const filteredProducts = filterCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === filterCategory);

  return (
    <>
      <div className="card" style={{ padding: '14px 16px', borderRadius: '20px', marginTop: '16px', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div className="list-header-left" style={{ margin: 0 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Danh sách món</h2>
            <span className="count-badge">{filteredProducts.length}</span>
          </div>

          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterCategory('all')}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: filterCategory === 'all' ? 'var(--primary)' : '#F3F4F6',
                color: filterCategory === 'all' ? 'white' : '#6B7280'
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterCategory(1)}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: filterCategory === 1 ? 'var(--primary)' : '#F3F4F6',
                color: filterCategory === 1 ? 'white' : '#6B7280'
              }}
            >
              Đồ uống
            </button>
            <button
              onClick={() => setFilterCategory(2)}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: filterCategory === 2 ? 'var(--primary)' : '#F3F4F6',
                color: filterCategory === 2 ? 'white' : '#6B7280'
              }}
            >
              Đồ ăn
            </button>
          </div>
        </div>

        <div>
          {filteredProducts.map(p => {
            const cat = CATEGORY_COLORS[p.category_id as keyof typeof CATEGORY_COLORS] || {
              bg: '#F3F4F6',
              text: '#4B5563',
              label: 'Món',
              icon: '🍽️'
            };

            return (
              <div 
                key={p.id} 
                className="customer-row"
                style={{ cursor: 'pointer', boxSizing: 'border-box' }}
                onClick={() => setEditingProduct(p)}
              >
                <div className="customer-avatar" style={{ background: cat.bg, color: cat.text, fontSize: '1.25rem', flexShrink: 0 }}>
                  {cat.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="customer-name" style={{ fontSize: '0.9375rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: cat.text, marginTop: '1px', fontWeight: 500 }}>
                    {cat.label}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1A1A2E', whiteSpace: 'nowrap' }}>
                    {new Intl.NumberFormat('vi-VN').format(Number(p.price))}&nbsp;đ
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(p);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#EFF6FF',
                      color: 'var(--primary)',
                      border: '1px solid #BFDBFE',
                      borderRadius: '10px',
                      padding: '4px 9px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Chỉnh sửa món"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '13px', height: '13px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    <span>Sửa</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="text-center text-muted" style={{ padding: '32px 0', fontSize: '0.875rem' }}>
              Chưa có món nào trong danh mục này.
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL CHỈNH SỬA MÓN ─── */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#111827' }}>Chỉnh sửa món</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF' }}
              >
                ✕
              </button>
            </div>

            <form action={async (formData) => {
              await updateProductAction(formData);
              setEditingProduct(null);
            }}>
              <input type="hidden" name="productId" value={editingProduct.id} />

              <div className="input-group">
                <label>Tên món</label>
                <input 
                  type="text" 
                  name="name" 
                  className="input" 
                  defaultValue={editingProduct.name} 
                  required 
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Giá tiền (VND)</label>
                <input 
                  type="number" 
                  name="price" 
                  className="input" 
                  defaultValue={editingProduct.price} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Loại món</label>
                <select name="categoryId" className="input" defaultValue={editingProduct.category_id || 1} required>
                  <option value="1">Đồ uống (Drink)</option>
                  <option value="2">Đồ ăn (Food)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#4B5563'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ flex: 1.5, padding: '12px', margin: 0 }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>

            {/* Nút xóa món */}
            <form 
              action={async (formData) => {
                if (confirm(`Bạn có chắc muốn xoá món "${editingProduct.name}"?`)) {
                  await deleteProductAction(formData);
                  setEditingProduct(null);
                }
              }}
              style={{ marginTop: '12px', textAlign: 'center' }}
            >
              <input type="hidden" name="productId" value={editingProduct.id} />
              <button 
                type="submit" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--danger)', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                Xóa món này khỏi thực đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
