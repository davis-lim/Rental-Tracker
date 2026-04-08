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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PropertyFormDialog({ open, onOpenChange, property, onSave }) {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      if (property) {
        setAddress(property.address || '');
        setNotes(property.notes || '');
      } else {
        setAddress('');
        setNotes('');
      }
      setError(null);
    }
  }, [open, property]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setError('Address is required');
      return;
    }
    onSave({ address: trimmedAddress, notes: notes.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add Property'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="property-address">Address</Label>
            <Input
              id="property-address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError(null);
              }}
              placeholder="123 Main St, City, State"
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="property-notes">Notes (optional)</Label>
            <Textarea
              id="property-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this property"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {property ? 'Update property' : 'Add property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
