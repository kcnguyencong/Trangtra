export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton" style={{ width: 140, height: 28, borderRadius: 8, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 16, marginBottom: 12 }} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div>
              <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 6, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6 }} />
            </div>
          </div>
          <div className="skeleton" style={{ width: 70, height: 16, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}
