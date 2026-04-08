import { Router } from 'express';
import * as tenantService from '../services/tenants.js';
import * as propertiesService from '../services/properties.js';

const router = Router();

// GET / — list all tenants globally (with property_address)
router.get('/', (req, res) => {
  try {
    const tenants = tenantService.getAll();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /by-property/:propertyId — list tenants for a specific property
router.get('/by-property/:propertyId', (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (isNaN(propertyId) || propertyId <= 0) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const tenants = tenantService.getByProperty(propertyId);
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/dependents — get dependent counts for delete warning
router.get('/:id/dependents', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    const counts = tenantService.getDependentCounts(id);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id — get single tenant
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
    const tenant = tenantService.getById(id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a tenant
router.post('/', (req, res) => {
  try {
    const { property_id, name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end } = req.body;

    // Validate property_id
    const parsedPropertyId = parseInt(property_id, 10);
    if (!property_id || isNaN(parsedPropertyId) || parsedPropertyId <= 0) {
      return res.status(400).json({ error: 'Valid property_id is required' });
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tenant name is required' });
    }

    // Validate rent_amount
    const parsedRent = Number(rent_amount);
    if (rent_amount === undefined || rent_amount === null || isNaN(parsedRent) || parsedRent <= 0) {
      return res.status(400).json({ error: 'Enter a valid amount greater than 0' });
    }

    // Validate deadline_day (1-28 per UI-SPEC)
    const parsedDeadlineDay = parseInt(deadline_day, 10);
    if (!deadline_day || isNaN(parsedDeadlineDay) || parsedDeadlineDay < 1 || parsedDeadlineDay > 28) {
      return res.status(400).json({ error: 'Select a due day (1-28)' });
    }

    // Validate grace_period_days (optional, defaults to 0, must be >= 0)
    let parsedGracePeriod = 0;
    if (grace_period_days !== undefined && grace_period_days !== null && grace_period_days !== '') {
      parsedGracePeriod = parseInt(grace_period_days, 10);
      if (isNaN(parsedGracePeriod) || parsedGracePeriod < 0) {
        return res.status(400).json({ error: 'Grace period cannot be negative' });
      }
    }

    // Verify property exists
    const property = propertiesService.getById(parsedPropertyId);
    if (!property) {
      return res.status(400).json({ error: 'Property not found' });
    }

    const tenant = tenantService.create({
      property_id: parsedPropertyId,
      name: name.trim(),
      rent_amount: parsedRent,
      deadline_day: parsedDeadlineDay,
      grace_period_days: parsedGracePeriod,
      lease_start: lease_start || null,
      lease_end: lease_end || null,
    });

    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a tenant
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }

    const { name, rent_amount, deadline_day, grace_period_days, lease_start, lease_end } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tenant name is required' });
    }

    // Validate rent_amount
    const parsedRent = Number(rent_amount);
    if (rent_amount === undefined || rent_amount === null || isNaN(parsedRent) || parsedRent <= 0) {
      return res.status(400).json({ error: 'Enter a valid amount greater than 0' });
    }

    // Validate deadline_day (1-28 per UI-SPEC)
    const parsedDeadlineDay = parseInt(deadline_day, 10);
    if (!deadline_day || isNaN(parsedDeadlineDay) || parsedDeadlineDay < 1 || parsedDeadlineDay > 28) {
      return res.status(400).json({ error: 'Select a due day (1-28)' });
    }

    // Validate grace_period_days (optional, defaults to 0, must be >= 0)
    let parsedGracePeriod = 0;
    if (grace_period_days !== undefined && grace_period_days !== null && grace_period_days !== '') {
      parsedGracePeriod = parseInt(grace_period_days, 10);
      if (isNaN(parsedGracePeriod) || parsedGracePeriod < 0) {
        return res.status(400).json({ error: 'Grace period cannot be negative' });
      }
    }

    const tenant = tenantService.update(id, {
      name: name.trim(),
      rent_amount: parsedRent,
      deadline_day: parsedDeadlineDay,
      grace_period_days: parsedGracePeriod,
      lease_start: lease_start || null,
      lease_end: lease_end || null,
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a tenant (with optional cascade via ?confirm=true)
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }

    const cascade = req.query.confirm === 'true';

    if (!cascade) {
      // Check for dependents before attempting delete
      const counts = tenantService.getDependentCounts(id);
      if (counts.rent_payments > 0) {
        return res.status(409).json({
          error: 'Tenant has payment records',
          rent_payments: counts.rent_payments,
        });
      }
    }

    const result = tenantService.remove(id, cascade);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ deleted: true });
  } catch (err) {
    // Also handle FK constraint errors as 409
    if (err && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      const id = parseInt(req.params.id, 10);
      const counts = tenantService.getDependentCounts(id);
      return res.status(409).json({
        error: 'Tenant has payment records',
        rent_payments: counts.rent_payments,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
