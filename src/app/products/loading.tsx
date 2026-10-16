export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton" style={{ width: 140, height: 28, borderRadius: 8, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 16, marginBottom: 16 }} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 80, height: 16, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}
