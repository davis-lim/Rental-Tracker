import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MortgagePaymentFormDialog({
  open,
  onOpenChange,
  mortgage,
  month,
  existingRecord,
  onSaved,
  onDeleted,
}) {
  const [paidDate, setPaidDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingRecord) {
        setPaidDate(existingRecord.paid_date || '');
        setAmountPaid(existingRecord.amount_paid != null ? String(existingRecord.amount_paid) : '');
      } else {
        setPaidDate(new Date().toISOString().slice(0, 10));
        setAmountPaid('');
      }
      setError(null);
      setShowDuplicateConfirm(false);
    }
  }, [open, existingRecord]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidDate)) {
      setError('Paid date must be in YYYY-MM-DD format.');
      return;
    }

    if (!(parseFloat(amountPaid) > 0)) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (existingRecord && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/mortgage-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mortgage_id: mortgage.id,
          month,
          paid_date: paidDate,
          amount_paid: parseFloat(amountPaid),
        }),
      });

      if (!res.ok) {
        setError('Could not save. Please try again.');
        setSaving(false);
        return;
      }

      const saved = await res.json();
      onSaved(saved);
      onOpenChange(false);
    } catch {
      setError('Could not save. Please try again.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/mortgage-payments/${existingRecord.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onDeleted();
        onOpenChange(false);
      } else {
        setError('Could not clear. Please try again.');
      }
    } catch {
      setError('Could not clear. Please try again.');
    }
  }

  function getSubmitLabel() {
    if (saving) return 'Saving...';
    if (showDuplicateConfirm) return 'Overwrite mortgage payment';
    if (existingRecord) return 'Update mortgage payment';
    return 'Record mortgage payment';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{existingRecord ? 'Edit Mortgage Payment' : 'Record Mortgage Payment'}</DialogTitle>
          {mortgage && (
            <p className="text-sm text-muted-foreground mt-1">
              {mortgage.lender} &mdash; {mortgage.property_address} &mdash; {month}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="paid-date">Paid Date</Label>
            <Input
              id="paid-date"
              type="text"
              value={paidDate}
              onChange={(e) => {
                setPaidDate(e.target.value);
                if (error) setError(null);
              }}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount-paid">Amount Paid</Label>
            <Input
              id="amount-paid"
              type="number"
              min="0"
              step="0.01"
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                if (error) setError(null);
              }}
              placeholder="0.00"
            />
          </div>

          {showDuplicateConfirm && mortgage && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
              A payment for {mortgage.lender} in {month} already exists. Click &apos;Overwrite mortgage payment&apos; to replace it.
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="flex flex-row items-center gap-2">
            {existingRecord && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                Clear payment
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {getSubmitLabel()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
