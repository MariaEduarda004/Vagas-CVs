function escapeHtml(s) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHitList(hits = [], label='Resultados') {
  if (!hits.length) return `<div class="alert alert-warning mb-0">Nenhum resultado</div>`;
  const items = hits.map(h => `
    <li class="list-group-item">
      <div class="d-flex justify-content-between">
        <div>
          <div class="fw-semibold">${escapeHtml(h.title || h.name || '(sem título)')}</div>
          <div class="text-muted small">${escapeHtml(h.company || h.headline || '')}</div>
          <div class="small">ID: <code>${escapeHtml(h.id)}</code> — Score: ${h.score?.toFixed?.(2) ?? h.score}</div>
          ${h.skills?.length ? `<div class="small">Skills: <em>${h.skills.map(escapeHtml).join(', ')}</em></div>` : ''}
        </div>
      </div>
    </li>
  `).join('');
  return `
    <div class="mb-2"><span class="badge text-bg-secondary">${label}: ${hits.length}</span></div>
    <ul class="list-group">${items}</ul>
  `;
}
