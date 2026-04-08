import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tenants')
      .then((r) => r.json())
      .then((data) => {
        setTenants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-8">
      <h2 className="text-xl font-semibold mb-8">All Tenants</h2>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && tenants.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
          <p className="text-muted-foreground">Add tenants from a property&apos;s detail page.</p>
        </div>
      )}

      {!loading && tenants.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Due Day</TableHead>
              <TableHead>Grace Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  <Link
                    to={`/properties/${tenant.property_id}`}
                    className="text-primary hover:underline"
                  >
                    {tenant.property_address}
                  </Link>
                </TableCell>
                <TableCell>${Number(tenant.rent_amount).toLocaleString()}</TableCell>
                <TableCell>{tenant.deadline_day}</TableCell>
                <TableCell>{tenant.grace_period_days} days</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
