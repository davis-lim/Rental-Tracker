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
      { path: 'payments', element: <div>Payments — coming in Phase 4</div> },
      { path: 'dashboard', element: <div>Dashboard — coming in Phase 5</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
