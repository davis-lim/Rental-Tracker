import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      <header style={{ borderBottom: '1px solid #ccc', padding: '1rem 0', marginBottom: '1rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Dad's Rental Tracker</Link>
        </h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/properties">Properties</Link>
          <Link to="/tenants">Tenants</Link>
          <Link to="/mortgages">Mortgages</Link>
          <Link to="/payments">Payments</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
