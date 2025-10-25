import { Router } from 'express';
import { es, INDEX } from '../services/es.js';

const router = Router();
router.get('/cvs', async (req, res) => {
  const {
    skills = '', uf, city, seniority, desired_type,
    min_skills = 1, size = 20, from = 0, q
  } = req.query;

  const skillList = String(skills)
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const filter = [];
  if (uf) filter.push({ term: { 'location.uf': uf } });
  if (city) filter.push({ term: { 'location.city': city } });
  if (seniority) filter.push({ term: { seniority } });
  if (desired_type) filter.push({ term: { desired_type } });

  const perSkillGroups = skillList.map(s => ({
    bool: {
      should: [
        { term: { 'skills': s } },               
        { term: { 'skills.keyword': s } },        
        { match_phrase: { 'skills': s } },        
        { match: { 'skills': { query: s, operator: 'AND' } } }
      ],
      minimum_should_match: 1
    }
  }));

  const textShould = q ? [{
    multi_match: {
      query: q,
      fields: ['headline^2', 'summary', 'name'],
      type: 'best_fields'
    }
  }] : [];

  const groupsNeeded = skillList.length ? Math.min(skillList.length, Number(min_skills) || 1) : 0;

  if (!skillList.length && !q && !uf && !city && !seniority && !desired_type) {
    return res.status(400).json({ error: 'provide_at_least_one_filter', hint: 'skills, q, uf, city, seniority ou desired_type' });
  }

  const body = {
    from: Number(from),
    size: Number(size),
    query: {
      bool: {
        filter,
        should: [...perSkillGroups, ...textShould],
        minimum_should_match: groupsNeeded || (textShould.length ? 1 : 0)
      }
    },
    sort: ['_score', { created_at: 'desc' }]
  };

  const r = await es.search({ index: INDEX.CVS, body });
  res.json({
    total: r.hits.total?.value || 0,
    hits: r.hits.hits.map(h => ({ id: h._id, score: h._score, ...h._source }))
  });
});


export default router;
