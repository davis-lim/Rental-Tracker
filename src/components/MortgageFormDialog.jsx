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

export default function MortgageFormDialog({ open, onOpenChange, mortgage, properties, onSave }) {
  const [lender, setLender] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [errorField, setErrorField] = useState(null);

  useEffect(() => {
    if (open) {
      if (mortgage) {
        setLender(mortgage.lender || '');
        setPropertyId(String(mortgage.property_id || ''));
        setDueDay(String(mortgage.due_day || ''));
        setAmount(String(mortgage.amount || ''));
      } else {
        setLender('');
        setPropertyId('');
        setDueDay('');
        setAmount('');
      }
      setError(null);
      setErrorField(null);
    }
  }, [open, mortgage]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!lender.trim()) {
      setError('Lender is required');
      setErrorField('lender');
      return;
    }
    if (!propertyId) {
      setError('Property is required');
      setErrorField('property');
      return;
    }
    const parsedDueDay = parseInt(dueDay, 10);
    if (isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      setError('Due day must be between 1 and 31');
      setErrorField('dueDay');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number');
      setErrorField('amount');
      return;
    }

    onSave({
      property_id: parseInt(propertyId, 10),
      lender: lender.trim(),
      due_day: parsedDueDay,
      amount: parsedAmount,
    });
  }

  function clearError() {
    if (error) {
      setError(null);
      setErrorField(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{mortgage ? 'Edit Mortgage' : 'Add Mortgage'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgage-lender">Lender</Label>
            <Input
              id="mortgage-lender"
              value={lender}
              onChange={(e) => { setLender(e.target.value); clearError(); }}
              placeholder="e.g. First National Bank"
              aria-invalid={errorField === 'lender'}
            />
            {errorField === 'lender' && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgage-property">Property</Label>
            <select
              id="mortgage-property"
              value={propertyId}
              onChange={(e) => { setPropertyId(e.target.value); clearError(); }}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.address}
                </option>
              ))}
            </select>
            {errorField === 'property' && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgage-due-day">Due Day</Label>
            <Input
              id="mortgage-due-day"
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => { setDueDay(e.target.value); clearError(); }}
              placeholder="e.g. 1"
              aria-invalid={errorField === 'dueDay'}
            />
            {errorField === 'dueDay' && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mortgage-amount">Monthly Amount</Label>
            <Input
              id="mortgage-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); clearError(); }}
              placeholder="e.g. 1500.00"
              aria-invalid={errorField === 'amount'}
            />
            {errorField === 'amount' && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {mortgage ? 'Update mortgage' : 'Add mortgage'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
