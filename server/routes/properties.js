import { Router } from 'express';
import * as propertiesService from '../services/properties.js';

const router = Router();

// GET / — list all properties
router.get('/', (req, res) => {
  try {
    const properties = propertiesService.getAll();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id — get single property
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const property = propertiesService.getById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/dependents — get dependent counts for delete warning
router.get('/:id/dependents', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const counts = propertiesService.getDependentCounts(id);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a property
router.post('/', (req, res) => {
  try {
    const { address, notes } = req.body;
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ error: 'Address is required' });
    }
    const property = propertiesService.create({
      address: address.trim(),
      notes: (notes || '').trim(),
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a property
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    const { address, notes } = req.body;
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ error: 'Address is required' });
    }
    const property = propertiesService.update(id, {
      address: address.trim(),
      notes: (notes || '').trim(),
    });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a property (with optional cascade via ?confirm=true)
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const cascade = req.query.confirm === 'true';

    if (!cascade) {
      // Check for dependents before attempting delete
      const counts = propertiesService.getDependentCounts(id);
      if (counts.tenants > 0 || counts.mortgages > 0) {
        return res.status(409).json({
          error: 'Property has dependents',
          tenants: counts.tenants,
          mortgages: counts.mortgages,
        });
      }
    }

    const result = propertiesService.remove(id, cascade);
    if (!result.deleted) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    // Also handle FK constraint errors as 409
    if (err && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      const counts = propertiesService.getDependentCounts(parseInt(req.params.id, 10));
      return res.status(409).json({
        error: 'Property has dependents',
        tenants: counts.tenants,
        mortgages: counts.mortgages,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
