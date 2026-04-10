import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TenantFormDialog from '@/components/TenantFormDialog';
import MortgageFormDialog from '@/components/MortgageFormDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mortgages, setMortgages] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [mortgageFormOpen, setMortgageFormOpen] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('tenant');
  const [dependentCounts, setDependentCounts] = useState({ rent_payments: 0 });
  const [apiError, setApiError] = useState(null);

  async function fetchData() {
    try {
      const [propRes, tenantsRes, mortRes] = await Promise.all([
        fetch(`/api/properties/${id}`),
        fetch(`/api/tenants/by-property/${id}`),
        fetch(`/api/mortgages`),
      ]);
      const propData = await propRes.json();
      const tenantsData = await tenantsRes.json();
      const mortData = await mortRes.json();
      setProperty(propData);
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      setMortgages(Array.isArray(mortData) ? mortData.filter((m) => m.property_id === parseInt(id, 10)) : []);
    } catch {
      // silently fail on initial load; error state handled inline
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave(data) {
    try {
      let res;
      if (editingTenant) {
        const { property_id: _pid, ...updateData } = data;
        res = await fetch(`/api/tenants/${editingTenant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      } else {
        res = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) throw new Error('Save failed');
      setFormOpen(false);
      setEditingTenant(null);
      setApiError(null);
      await fetchData();
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleSaveMortgage(data) {
    try {
      const url = editingMortgage ? `/api/mortgages/${editingMortgage.id}` : '/api/mortgages';
      const method = editingMortgage ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      setMortgageFormOpen(false);
      setEditingMortgage(null);
      setApiError(null);
      await fetchData();
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleDeleteClick(tenant) {
    try {
      const res = await fetch(`/api/tenants/${tenant.id}/dependents`);
      const counts = await res.json();
      setDependentCounts(counts);
      setDeleteType('tenant');
      setDeleteTarget(tenant);
    } catch {
      setDependentCounts({ rent_payments: 0 });
      setDeleteType('tenant');
      setDeleteTarget(tenant);
    }
  }

  async function handleDeleteMortgageClick(mortgage) {
    setDeleteType('mortgage');
    setDeleteTarget(mortgage);
  }

  async function handleDeleteConfirm() {
    try {
      const url = deleteType === 'mortgage'
        ? `/api/mortgages/${deleteTarget.id}?confirm=true`
        : `/api/tenants/${deleteTarget.id}?confirm=true`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteTarget(null);
      setApiError(null);
      await fetchData();
    } catch {
      setApiError('Could not delete. Please try again.');
      setDeleteTarget(null);
    }
  }

  function handleEditClick(tenant) {
    setEditingTenant(tenant);
    setFormOpen(true);
  }

  function handleAddClick() {
    setEditingTenant(null);
    setFormOpen(true);
  }

  function buildDeleteDescription() {
    if (dependentCounts.rent_payments > 0) {
      return `This tenant has ${dependentCounts.rent_payments} payment record(s). Deleting will also remove them. This cannot be undone.`;
    }
    return 'This will permanently delete the tenant and all their payment records. This cannot be undone.';
  }

  if (loading) return <p className="pt-8 text-muted-foreground">Loading...</p>;

  if (!property) {
    return (
      <div className="pt-8">
        <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Properties
        </Link>
        <p className="mt-4 text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Properties
      </Link>

      <h2 className="text-xl font-semibold mt-4">{property.address}</h2>
      {property.notes && <p className="text-muted-foreground mt-1">{property.notes}</p>}

      <Separator className="my-6" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tenants</h3>
        <Button onClick={handleAddClick}>Add Tenant</Button>
      </div>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {tenants.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tenants for this property</h3>
          <p className="text-muted-foreground">Add a tenant to begin recording rent payments.</p>
        </div>
      )}

      {tenants.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Due Day</TableHead>
              <TableHead>Grace Period</TableHead>
              <TableHead>Lease Dates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>${Number(tenant.rent_amount).toLocaleString()}</TableCell>
                <TableCell>{tenant.deadline_day}</TableCell>
                <TableCell>{tenant.grace_period_days} days</TableCell>
                <TableCell>
                  {tenant.lease_start && tenant.lease_end ? (
                    `${tenant.lease_start} to ${tenant.lease_end}`
                  ) : tenant.lease_start ? (
                    `From ${tenant.lease_start}`
                  ) : (
                    <Badge variant="secondary">No lease dates set</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit tenant"
                    onClick={() => handleEditClick(tenant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete tenant"
                    onClick={() => handleDeleteClick(tenant)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Separator className="my-6" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mortgages</h3>
        <Button onClick={() => { setEditingMortgage(null); setMortgageFormOpen(true); }}>Add Mortgage</Button>
      </div>

      {mortgages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No mortgages for this property.</p>
        </div>
      )}

      {mortgages.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lender</TableHead>
              <TableHead>Monthly Amount</TableHead>
              <TableHead>Due Day</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mortgages.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.lender}</TableCell>
                <TableCell>${Number(m.amount).toLocaleString()}</TableCell>
                <TableCell>Day {m.due_day}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" aria-label="Edit mortgage"
                    onClick={() => { setEditingMortgage(m); setMortgageFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete mortgage"
                    onClick={() => handleDeleteMortgageClick(m)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TenantFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTenant(null);
        }}
        tenant={editingTenant}
        propertyId={parseInt(id, 10)}
        onSave={handleSave}
      />

      <MortgageFormDialog
        open={mortgageFormOpen}
        onOpenChange={(open) => { setMortgageFormOpen(open); if (!open) setEditingMortgage(null); }}
        mortgage={editingMortgage}
        properties={property ? [property] : []}
        onSave={handleSaveMortgage}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={deleteType === 'mortgage' ? 'Delete mortgage?' : 'Delete tenant?'}
        description={
          deleteType === 'mortgage'
            ? 'This will permanently delete the mortgage and all its payment records. This cannot be undone.'
            : buildDeleteDescription()
        }
        cancelLabel={deleteType === 'mortgage' ? 'Keep mortgage' : 'Keep tenant'}
        confirmLabel={deleteType === 'mortgage' ? 'Delete mortgage' : 'Delete tenant'}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
