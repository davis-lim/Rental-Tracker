import { Router } from 'express';
import propertiesRouter from './routes/properties.js';
import tenantsRouter from './routes/tenants.js';
import mortgagesRouter from './routes/mortgages.js';
import rentPaymentsRouter from './routes/rentPayments.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Properties CRUD
router.use('/properties', propertiesRouter);

// Tenants CRUD
router.use('/tenants', tenantsRouter);

// Mortgages CRUD
router.use('/mortgages', mortgagesRouter);

// Rent payments CRUD
router.use('/rent-payments', rentPaymentsRouter);

// Placeholder route groups — will be filled in Phase 4
// router.use('/mortgage-payments', mortgagePaymentsRouter);

export default router;
