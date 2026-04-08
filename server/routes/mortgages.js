import { Router } from 'express';
import * as mortgagesService from '../services/mortgages.js';

const router = Router();

// GET / — list all mortgages
router.get('/', (req, res) => {
  try {
    const mortgages = mortgagesService.getAll();
    res.json(mortgages);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id — get single mortgage
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mortgage ID' });
    }
    const mortgage = mortgagesService.getById(id);
    if (!mortgage) {
      return res.status(404).json({ error: 'Mortgage not found' });
    }
    res.json(mortgage);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/dependents — get dependent counts for delete warning
router.get('/:id/dependents', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mortgage ID' });
    }
    const counts = mortgagesService.getDependentCounts(id);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a mortgage
router.post('/', (req, res) => {
  try {
    const { property_id, lender, due_day, amount } = req.body;

    const parsedPropertyId = parseInt(property_id, 10);
    if (!property_id || isNaN(parsedPropertyId) || parsedPropertyId <= 0) {
      return res.status(400).json({ error: 'property_id must be a positive integer' });
    }

    if (!lender || typeof lender !== 'string' || lender.trim() === '') {
      return res.status(400).json({ error: 'lender is required' });
    }

    const parsedDueDay = parseInt(due_day, 10);
    if (due_day === undefined || due_day === null || isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      return res.status(400).json({ error: 'due_day must be an integer between 1 and 31' });
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const mortgage = mortgagesService.create({
      property_id: parsedPropertyId,
      lender: lender.trim(),
      due_day: parsedDueDay,
      amount: parsedAmount,
    });
    res.status(201).json(mortgage);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a mortgage
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mortgage ID' });
    }

    const { property_id, lender, due_day, amount } = req.body;

    const parsedPropertyId = parseInt(property_id, 10);
    if (!property_id || isNaN(parsedPropertyId) || parsedPropertyId <= 0) {
      return res.status(400).json({ error: 'property_id must be a positive integer' });
    }

    if (!lender || typeof lender !== 'string' || lender.trim() === '') {
      return res.status(400).json({ error: 'lender is required' });
    }

    const parsedDueDay = parseInt(due_day, 10);
    if (due_day === undefined || due_day === null || isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      return res.status(400).json({ error: 'due_day must be an integer between 1 and 31' });
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const mortgage = mortgagesService.update(id, {
      property_id: parsedPropertyId,
      lender: lender.trim(),
      due_day: parsedDueDay,
      amount: parsedAmount,
    });
    if (!mortgage) {
      return res.status(404).json({ error: 'Mortgage not found' });
    }
    res.json(mortgage);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a mortgage (with optional cascade via ?confirm=true)
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mortgage ID' });
    }

    const cascade = req.query.confirm === 'true';

    if (!cascade) {
      const counts = mortgagesService.getDependentCounts(id);
      if (counts.mortgage_payments > 0) {
        return res.status(409).json({
          error: 'Mortgage has dependents',
          mortgage_payments: counts.mortgage_payments,
        });
      }
    }

    const result = mortgagesService.remove(id, cascade);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Mortgage not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      const counts = mortgagesService.getDependentCounts(parseInt(req.params.id, 10));
      return res.status(409).json({
        error: 'Mortgage has dependents',
        mortgage_payments: counts.mortgage_payments,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
