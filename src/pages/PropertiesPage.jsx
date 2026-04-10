import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PropertyFormDialog from '@/components/PropertyFormDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [mortgagesByProperty, setMortgagesByProperty] = useState({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dependentCounts, setDependentCounts] = useState({ tenants: 0, mortgages: 0 });
  const [apiError, setApiError] = useState(null);

  async function fetchProperties() {
    try {
      const [propRes, mortRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/mortgages'),
      ]);
      const [props, morts] = await Promise.all([propRes.json(), mortRes.json()]);
      setProperties(props);
      const grouped = {};
      for (const m of morts) {
        if (!grouped[m.property_id]) grouped[m.property_id] = [];
        grouped[m.property_id].push(m);
      }
      setMortgagesByProperty(grouped);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  async function handleSave({ address, notes }) {
    try {
      const url = editingProperty
        ? `/api/properties/${editingProperty.id}`
        : '/api/properties';
      const method = editingProperty ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, notes }),
      });
      if (!res.ok) {
        setApiError('Something went wrong. Please try again.');
        return;
      }
      setFormOpen(false);
      setEditingProperty(null);
      fetchProperties();
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleDeleteClick(property) {
    try {
      const res = await fetch(`/api/properties/${property.id}/dependents`);
      const counts = await res.json();
      setDependentCounts(counts);
      setDeleteTarget(property);
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleDeleteConfirm() {
    try {
      const res = await fetch(`/api/properties/${deleteTarget.id}?confirm=true`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setApiError('Could not delete. Please try again.');
        return;
      }
      setDeleteTarget(null);
      fetchProperties();
    } catch {
      setApiError('Could not delete. Please try again.');
    }
  }

  function handleEditClick(property) {
    setEditingProperty(property);
    setFormOpen(true);
  }

  function handleAddClick() {
    setEditingProperty(null);
    setFormOpen(true);
  }

  function buildDeleteDescription() {
    if (dependentCounts.tenants > 0 || dependentCounts.mortgages > 0) {
      return `This property has ${dependentCounts.tenants} tenant(s) and ${dependentCounts.mortgages} mortgage(s). Deleting it will also remove them and all associated payment records. This cannot be undone.`;
    }
    return 'This will permanently delete the property and all associated tenants and payment records. This cannot be undone.';
  }

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Properties</h2>
        <Button onClick={handleAddClick}>Add Property</Button>
      </div>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && properties.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
          <p className="text-muted-foreground">
            Add your first rental property to start tracking tenants and payments.
          </p>
        </div>
      )}

      {!loading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {properties.map((property) => (
            <Card key={property.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/properties/${property.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {property.address}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {property.tenant_count}{' '}
                      {property.tenant_count === 1 ? 'tenant' : 'tenants'}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Total rent collected:{' '}
                      <span className="text-foreground font-medium">
                        ${Number(property.total_rent_collected).toFixed(2)}
                      </span>
                    </p>
                    {(mortgagesByProperty[property.id] || []).map((m) => (
                      <p key={m.id} className="text-muted-foreground">
                        Mortgage ({m.lender}):{' '}
                        <span className="text-foreground font-medium">
                          ${Number(m.amount).toFixed(2)}/mo
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit property"
                    onClick={() => handleEditClick(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete property"
                    onClick={() => handleDeleteClick(property)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PropertyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete property?"
        description={buildDeleteDescription()}
        cancelLabel="Keep property"
        confirmLabel="Delete property"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
