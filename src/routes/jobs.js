import { Router } from 'express';
import { es, INDEX } from '../services/es.js';

const router = Router();

// Create
router.post('/', async (req, res) => {
  const doc = {
    ...req.body,
    skills: Array.isArray(req.body.skills) ? req.body.skills.map(s => String(s).trim().toLowerCase()) : [],
    created_at: new Date()
  };
  const result = await es.index({ index: INDEX.JOBS, document: doc, refresh: 'wait_for' });
  res.status(201).json({ id: result._id, ...doc });
});

// Read by id
router.get('/:id', async (req, res) => {
  try {
    const r = await es.get({ index: INDEX.JOBS, id: req.params.id });
    res.json({ id: r._id, ...r._source });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const patch = {
      ...req.body,
      ...(req.body.skills ? { skills: req.body.skills.map(s => String(s).trim().toLowerCase()) } : {})
    };
    await es.update({ index: INDEX.JOBS, id: req.params.id, doc: patch, refresh: 'wait_for' });
    const r = await es.get({ index: INDEX.JOBS, id: req.params.id });
    res.json({ id: r._id, ...r._source });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await es.delete({ index: INDEX.JOBS, id: req.params.id, refresh: 'wait_for' });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

// Search
router.get('/', async (req, res) => {
  const {
    q,                  
    seniority,          
    type,              
    city,
    uf,
    skill,              
    min_salary,         
    size = 20,
    from = 0
  } = req.query;

  const must = [];
  const filter = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: [
          'title^3',
          'description^1.5',
          'company^2',
          'skills^4' 
        ],
        type: 'best_fields'
      }
    });
  }

  if (seniority) filter.push({ term: { seniority } });
  if (type) filter.push({ term: { type } });
  if (city) filter.push({ term: { 'location.city': city } });
  if (uf) filter.push({ term: { 'location.uf': uf } });
  if (min_salary) filter.push({ range: { salary_min: { gte: Number(min_salary) } } });
  
  const skills = Array.isArray(skill) ? skill : (skill ? [skill] : []);
  const should = skills.map(s => ({ term: { skills: s } }));

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
    }
  };

  const r = await es.search({ index: INDEX.JOBS, body });
  res.json({
    total: r.hits.total?.value || 0,
    hits: r.hits.hits.map(h => ({ id: h._id, score: h._score, ...h._source }))
  });
});

export default router;
