export default function MenuLoading() {
  return <div aria-busy="true" aria-label="Menü yükleniyor" className="site-container menu-loading"><div className="skeleton-wordmark" /><div className="skeleton-title" /><div className="skeleton-search" /><div className="product-grid">{[1, 2, 3, 4, 5, 6].map((k) => <div key={k} className="skeleton-card"><div /><span /><span /></div>)}</div></div>;
}
