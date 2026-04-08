import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MortgageFormDialog from '@/components/MortgageFormDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

export default function MortgagesPage() {
  const [mortgages, setMortgages] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDescription, setDeleteDescription] = useState('');
  const [apiError, setApiError] = useState(null);

  async function fetchMortgages() {
    try {
      const res = await fetch('/api/mortgages');
      const data = await res.json();
      setMortgages(data);
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch {
      // non-fatal — form dropdown will just be empty
    }
  }

  useEffect(() => {
    Promise.all([fetchMortgages(), fetchProperties()]);
  }, []);

  async function handleSave({ property_id, lender, due_day, amount }) {
    try {
      const url = editingMortgage
        ? `/api/mortgages/${editingMortgage.id}`
        : '/api/mortgages';
      const method = editingMortgage ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id, lender, due_day, amount }),
      });
      if (!res.ok) {
        setApiError('Something went wrong. Please try again.');
        return;
      }
      setFormOpen(false);
      setEditingMortgage(null);
      fetchMortgages();
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleDeleteClick(mortgage) {
    try {
      const res = await fetch(`/api/mortgages/${mortgage.id}/dependents`);
      const counts = await res.json();
      const n = counts.mortgage_payments || 0;
      const description =
        n > 0
          ? `This mortgage has ${n} payment record(s). Deleting it will remove all associated payment records. This cannot be undone.`
          : 'This will permanently delete the mortgage and all payment records. This cannot be undone.';
      setDeleteTarget(mortgage);
      setDeleteDescription(description);
    } catch {
      setApiError('Something went wrong. Please try again.');
    }
  }

  async function handleDeleteConfirm() {
    try {
      const res = await fetch(`/api/mortgages/${deleteTarget.id}?confirm=true`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setApiError('Could not delete. Please try again.');
        return;
      }
      setDeleteTarget(null);
      fetchMortgages();
    } catch {
      setApiError('Could not delete. Please try again.');
    }
  }

  function handleEditClick(mortgage) {
    setEditingMortgage(mortgage);
    setFormOpen(true);
  }

  function handleAddClick() {
    setEditingMortgage(null);
    setFormOpen(true);
  }

  return (
    <div className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Mortgages</h2>
        <Button onClick={handleAddClick}>Add Mortgage</Button>
      </div>

      {apiError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">
          {apiError}
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && mortgages.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No mortgages yet</h3>
          <p className="text-muted-foreground">
            Add your first mortgage to start tracking payments.
          </p>
        </div>
      )}

      {!loading && mortgages.length > 0 && (
        <div className="flex flex-col gap-4">
          {mortgages.map((mortgage) => (
            <Card key={mortgage.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8 flex-1">
                  <div>
                    <p className="font-semibold">{mortgage.lender}</p>
                    <p className="text-sm text-muted-foreground">{mortgage.property_address}</p>
                  </div>
                  <div className="ml-auto mr-4 text-right">
                    <p className="font-semibold">
                      {Number(mortgage.amount).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">Due day {mortgage.due_day}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit mortgage"
                    onClick={() => handleEditClick(mortgage)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete mortgage"
                    onClick={() => handleDeleteClick(mortgage)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MortgageFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMortgage(null);
        }}
        mortgage={editingMortgage}
        properties={properties}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete mortgage?"
        description={deleteDescription}
        cancelLabel="Keep mortgage"
        confirmLabel="Delete mortgage"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
