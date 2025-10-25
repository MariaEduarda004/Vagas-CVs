import { Router } from 'express';
import { es, INDEX } from '../services/es.js';

const router = Router();
// Search CVs
router.get('/', async (req, res) => {
  const { 
    q,
    seniority,
    desired_type,
    city,
    uf,
    skill,
    size = 20,
    from = 0
  } = req.query;

  const must = [];
  const filter = [];
  const should = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['name^2', 'headline^2', 'summary', 'skills^3'],
        type: 'best_fields'
      }
    });
  }

  if (seniority) filter.push({ term: { seniority } });
  if (desired_type) filter.push({ term: { desired_type } });
  if (city) filter.push({ term: { 'location.city': city } });
  if (uf) filter.push({ term: { 'location.uf': uf } });

  const skills = Array.isArray(skill) ? skill : (skill ? [skill] : []);
  skills.forEach(s => should.push({ term: { skills: s } }));

  const body = {
    from: Number(from),
    size: Number(size),
    query: {
      bool: {
        must,
        filter,
        should,
        minimum_should_match: should.length ? 1 : 0
      }
    },
    sort: [{ created_at: 'desc' }]
  };

  const r = await es.search({ index: INDEX.CVS, body });
  res.json({
    total: r.hits.total?.value || 0,
    hits: r.hits.hits.map(h => ({ id: h._id, score: h._score, ...h._source }))
  });
});

// Create CV
router.post('/', async (req, res) => {
  const doc = {
    ...req.body,
    skills: Array.isArray(req.body.skills) ? req.body.skills.map(s => String(s).trim().toLowerCase()) : [],
    created_at: new Date()
  };
  const result = await es.index({ index: INDEX.CVS, document: doc, refresh: 'wait_for' });
  res.status(201).json({ id: result._id, ...doc });
});

// Read CV by id
router.get('/:id', async (req, res) => {
  try {
    const r = await es.get({ index: INDEX.CVS, id: req.params.id });
    res.json({ id: r._id, ...r._source });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

// Update CV
router.put('/:id', async (req, res) => {
    try {
    const patch = {
      ...req.body,
      ...(req.body.skills ? { skills: req.body.skills.map(s => String(s).trim().toLowerCase()) } : {})
    };
    await es.update({ index: INDEX.CVS, id: req.params.id, doc: patch, refresh: 'wait_for' });
    const r = await es.get({ index: INDEX.CVS, id: req.params.id });
    res.json({ id: r._id, ...r._source });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

// Delete CV
router.delete('/:id', async (req, res) => {
  try {
    await es.delete({ index: INDEX.CVS, id: req.params.id, refresh: 'wait_for' });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
