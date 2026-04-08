import { Router } from 'express';
import * as mortgagePaymentsService from '../services/mortgagePayments.js';

const router = Router();

// GET / — list payments by mortgage_id or by month
router.get('/', (req, res) => {
  try {
    const { mortgage_id, month } = req.query;

    if (mortgage_id !== undefined) {
      const id = parseInt(mortgage_id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid mortgage_id' });
      }
      const payments = mortgagePaymentsService.getByMortgage(id);
      return res.json(payments);
    }

    if (month !== undefined) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Invalid month format; expected YYYY-MM' });
      }
      const payments = mortgagePaymentsService.getByMonth(month);
      return res.json(payments);
    }

    return res.status(400).json({ error: 'Provide mortgage_id or month query param' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — upsert a mortgage payment record
router.post('/', (req, res) => {
  try {
    const { mortgage_id, month, paid_date, amount_paid } = req.body;

    // Validate mortgage_id
    const mortgageId = parseInt(mortgage_id, 10);
    if (isNaN(mortgageId) || mortgageId <= 0) {
      return res.status(400).json({ error: 'mortgage_id must be a positive integer' });
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
    const amountPaid = Number(amount_paid);
    if (isNaN(amountPaid) || amountPaid < 0) {
      return res.status(400).json({ error: 'amount_paid must be a non-negative number' });
    }

    const saved = mortgagePaymentsService.upsert({
      mortgage_id: mortgageId,
      month,
      paid_date,
      amount_paid: amountPaid,
    });
    return res.status(201).json(saved);
  } catch (err) {
    if (err.message === 'Mortgage not found') {
      return res.status(404).json({ error: 'Mortgage not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — remove a mortgage payment record
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    const result = mortgagePaymentsService.remove(id);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    return res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
