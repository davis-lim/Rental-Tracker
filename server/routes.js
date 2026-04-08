import { Router } from 'express';
import propertiesRouter from './routes/properties.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Properties CRUD
router.use('/properties', propertiesRouter);

// Placeholder route groups — will be filled in Phases 2-4
// router.use('/tenants', tenantsRouter);
// router.use('/mortgages', mortgagesRouter);
// router.use('/rent-payments', rentPaymentsRouter);
// router.use('/mortgage-payments', mortgagePaymentsRouter);

export default router;
