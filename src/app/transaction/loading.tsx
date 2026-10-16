export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton" style={{ width: 100, height: 28, borderRadius: 8, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 16, marginBottom: 16 }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 12 }} />
      ))}
    </div>
  );
}
