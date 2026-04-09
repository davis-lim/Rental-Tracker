import { Router } from 'express';
import { getSummary, getUpcoming, getOverdue } from '../services/dashboard.js';

const router = Router();

// Validate month param (YYYY-MM) — T-05-01 mitigation
function isValidMonth(val) {
  return typeof val === 'string' && /^\d{4}-\d{2}$/.test(val);
}

// Validate today param (YYYY-MM-DD) — T-05-01 mitigation
function isValidDate(val) {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val);
}

// GET /api/dashboard/summary?month=YYYY-MM
router.get('/summary', (req, res) => {
  const rawMonth = req.query.month;
  const month = isValidMonth(rawMonth) ? rawMonth : new Date().toISOString().slice(0, 7);
  try {
    res.json(getSummary(month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/upcoming?month=YYYY-MM&today=YYYY-MM-DD
router.get('/upcoming', (req, res) => {
  const rawMonth = req.query.month;
  const rawToday = req.query.today;
  const month = isValidMonth(rawMonth) ? rawMonth : new Date().toISOString().slice(0, 7);
  const today = isValidDate(rawToday) ? rawToday : new Date().toISOString().slice(0, 10);
  try {
    res.json(getUpcoming(month, today));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/overdue?month=YYYY-MM&today=YYYY-MM-DD
router.get('/overdue', (req, res) => {
  const rawMonth = req.query.month;
  const rawToday = req.query.today;
  const month = isValidMonth(rawMonth) ? rawMonth : new Date().toISOString().slice(0, 7);
  const today = isValidDate(rawToday) ? rawToday : new Date().toISOString().slice(0, 10);
  try {
    res.json(getOverdue(month, today));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
