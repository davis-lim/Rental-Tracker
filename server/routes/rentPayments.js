import { Router } from 'express';
import * as rentPaymentsService from '../services/rentPayments.js';

const router = Router();

// GET / — list payments by tenant_id or by month
router.get('/', (req, res) => {
  try {
    const { tenant_id, month } = req.query;

    if (tenant_id !== undefined) {
      const id = parseInt(tenant_id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid tenant_id' });
      }
      const payments = rentPaymentsService.getByTenant(id);
      return res.json(payments);
    }

    if (month !== undefined) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format; expected YYYY-MM' });
      }
      const payments = rentPaymentsService.getByMonth(month);
      return res.json(payments);
    }

    return res.status(400).json({ error: 'Provide tenant_id or month query param' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /exists?tenant_id=N&month=YYYY-MM — duplicate guard check
router.get('/exists', (req, res) => {
  try {
    const { tenant_id, month } = req.query;

    if (tenant_id === undefined || month === undefined) {
      return res.status(400).json({ error: 'Both tenant_id and month are required' });
    }

    const tenantId = parseInt(tenant_id, 10);
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant_id' });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format; expected YYYY-MM' });
    }

    const row = rentPaymentsService.getOne(tenantId, month);
    return res.json({ exists: !!row });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — upsert a payment record
router.post('/', (req, res) => {
  try {
    const { tenant_id, month, paid_date, amount_paid } = req.body;

    // Validate tenant_id
    if (!Number.isInteger(tenant_id) || tenant_id <= 0) {
      return res.status(400).json({ error: 'tenant_id must be a positive integer' });
    }

    // Validate month
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month must be in YYYY-MM format' });
    }

    // Validate paid_date
    if (!paid_date || !/^\d{4}-\d{2}-\d{2}$/.test(paid_date)) {
      return res.status(400).json({ error: 'paid_date must be in YYYY-MM-DD format' });
    }

    // Validate amount_paid
    if (typeof amount_paid !== 'number' || amount_paid < 0) {
      return res.status(400).json({ error: 'amount_paid must be a non-negative number' });
    }

    const saved = rentPaymentsService.upsert({ tenant_id, month, paid_date, amount_paid });
    return res.status(201).json(saved);
  } catch (err) {
    if (err.message === 'Tenant not found') {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — remove a payment record
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    const result = rentPaymentsService.remove(id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    return res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
