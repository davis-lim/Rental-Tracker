import { Router } from 'express';
import propertiesRouter from './routes/properties.js';
import tenantsRouter from './routes/tenants.js';
import mortgagesRouter from './routes/mortgages.js';
import rentPaymentsRouter from './routes/rentPayments.js';
import mortgagePaymentsRouter from './routes/mortgagePayments.js';
import dashboardRouter from './routes/dashboard.js';

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

// Mortgage payments CRUD
router.use('/mortgage-payments', mortgagePaymentsRouter);

// Dashboard endpoints
router.use('/dashboard', dashboardRouter);

export default router;
