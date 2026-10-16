export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 8, marginBottom: 20 }} />
      {/* Customer header card skeleton */}
      <div className="skeleton" style={{ width: '100%', height: 140, borderRadius: 20, marginBottom: 20 }} />
      {/* Transaction list skeleton */}
      <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, marginBottom: 12 }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div>
              <div className="skeleton" style={{ width: 140, height: 15, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: 70, height: 16, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}
