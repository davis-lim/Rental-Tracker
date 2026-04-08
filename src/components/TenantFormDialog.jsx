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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TenantFormDialog({ open, onOpenChange, tenant, propertyId, onSave }) {
  const [name, setName] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('');
  const [gracePeriod, setGracePeriod] = useState('0');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (tenant) {
        setName(tenant.name || '');
        setRentAmount(String(tenant.rent_amount || ''));
        setDeadlineDay(String(tenant.deadline_day || ''));
        setGracePeriod(String(tenant.grace_period_days ?? 0));
        setLeaseStart(tenant.lease_start || '');
        setLeaseEnd(tenant.lease_end || '');
      } else {
        setName('');
        setRentAmount('');
        setDeadlineDay('');
        setGracePeriod('0');
        setLeaseStart('');
        setLeaseEnd('');
      }
      setErrors({});
    }
  }, [open, tenant]);

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Tenant name is required';
    }

    if (!rentAmount) {
      newErrors.rentAmount = 'Rent amount is required';
    } else if (isNaN(parseFloat(rentAmount)) || parseFloat(rentAmount) <= 0) {
      newErrors.rentAmount = 'Enter a valid amount greater than 0';
    }

    if (!deadlineDay) {
      newErrors.deadlineDay = 'Select a due day (1-28)';
    }

    if (gracePeriod !== '' && parseInt(gracePeriod, 10) < 0) {
      newErrors.gracePeriod = 'Grace period cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      property_id: propertyId,
      name: name.trim(),
      rent_amount: parseFloat(rentAmount),
      deadline_day: parseInt(deadlineDay, 10),
      grace_period_days: parseInt(gracePeriod, 10) || 0,
      lease_start: leaseStart || null,
      lease_end: leaseEnd || null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{tenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-name">Tenant name</Label>
            <Input
              id="tenant-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Full name"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-rent">Monthly rent</Label>
            <Input
              id="tenant-rent"
              type="number"
              value={rentAmount}
              onChange={(e) => {
                setRentAmount(e.target.value);
                if (errors.rentAmount) setErrors((prev) => ({ ...prev, rentAmount: undefined }));
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              aria-invalid={!!errors.rentAmount}
            />
            {errors.rentAmount && (
              <p className="text-sm text-destructive mt-1">{errors.rentAmount}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-deadline">Rent due day</Label>
            <Select
              value={deadlineDay}
              onValueChange={(val) => {
                setDeadlineDay(val);
                if (errors.deadlineDay) setErrors((prev) => ({ ...prev, deadlineDay: undefined }));
              }}
            >
              <SelectTrigger id="tenant-deadline" aria-invalid={!!errors.deadlineDay}>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.deadlineDay && (
              <p className="text-sm text-destructive mt-1">{errors.deadlineDay}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-grace">Grace period (days)</Label>
            <Input
              id="tenant-grace"
              type="number"
              value={gracePeriod}
              onChange={(e) => {
                setGracePeriod(e.target.value);
                if (errors.gracePeriod) setErrors((prev) => ({ ...prev, gracePeriod: undefined }));
              }}
              placeholder="0"
              min="0"
              aria-invalid={!!errors.gracePeriod}
            />
            {errors.gracePeriod && (
              <p className="text-sm text-destructive mt-1">{errors.gracePeriod}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-lease-start">Lease start date (optional)</Label>
            <Input
              id="tenant-lease-start"
              type="date"
              value={leaseStart}
              onChange={(e) => setLeaseStart(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-lease-end">Lease end date (optional)</Label>
            <Input
              id="tenant-lease-end"
              type="date"
              value={leaseEnd}
              onChange={(e) => setLeaseEnd(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {tenant ? 'Update tenant' : 'Add tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
