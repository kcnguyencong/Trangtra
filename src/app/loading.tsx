export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="home-header">
        <div className="home-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="skeleton" style={{ width: 100, height: 28, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          </div>
        </div>
        <div className="home-balance-card" style={{ opacity: 0.85 }}>
          <div>
            <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 6, marginBottom: 8, background: 'rgba(255,255,255,0.25)' }} />
            <div className="skeleton" style={{ width: 150, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.25)' }} />
          </div>
          <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 14, background: 'rgba(255,255,255,0.25)' }} />
        </div>
      </div>

      {/* Sheet skeleton */}
      <div className="main-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 180, height: 20, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
            <div className="skeleton" style={{ flex: 1, height: 18, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 70, height: 18, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </>
  );
}
