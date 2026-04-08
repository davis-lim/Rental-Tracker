import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navLinks = [
    { to: '/properties', label: 'Properties' },
    { to: '/tenants', label: 'Tenants' },
    { to: '/mortgages', label: 'Mortgages' },
    { to: '/payments', label: 'Payments' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 font-sans">
      <header className="border-b border-border py-4 mb-4">
        <h1 className="text-xl font-semibold mb-2">
          <Link to="/" className="no-underline text-foreground hover:text-foreground">
            Dad's Rental Tracker
          </Link>
        </h1>
        <nav className="flex gap-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm ${
                location.pathname.startsWith(to)
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
