import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import TenantsPage from './pages/TenantsPage.jsx';
import MortgagesPage from './pages/MortgagesPage.jsx';
import RentPaymentsPage from './pages/RentPaymentsPage.jsx';
import MortgagePaymentsPage from './pages/MortgagePaymentsPage.jsx';
import AccessGate from './components/AccessGate.jsx';

// Inject access code header for all /api requests
const _fetch = window.fetch.bind(window);
window.fetch = (url, opts = {}) => {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const code = localStorage.getItem('accessCode') || '';
    opts = { ...opts, headers: { ...opts.headers, 'x-access-code': code } };
  }
  return _fetch(url, opts);
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'mortgages', element: <MortgagesPage /> },
      { path: 'payments/rent', element: <RentPaymentsPage /> },
      { path: 'payments/mortgage', element: <MortgagePaymentsPage /> },
      { path: 'payments', element: <RentPaymentsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessGate>
      <RouterProvider router={router} />
    </AccessGate>
  </React.StrictMode>
);
