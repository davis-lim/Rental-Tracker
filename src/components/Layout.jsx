import { Link, Outlet, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/properties', label: 'Properties' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/payments', label: 'Payments' },
];

export default function Layout() {
  const location = useLocation();

  function isActive({ to, exact }) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 font-sans">
      <header className="border-b border-border py-4 mb-4">
        <h1 className="text-xl font-semibold mb-2">
          <Link to="/" className="no-underline text-foreground hover:text-foreground">
            Lim Family's Rental Tracker
          </Link>
        </h1>
        <nav className="flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm ${
                isActive(link)
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
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
