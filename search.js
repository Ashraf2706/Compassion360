// ─ Site Search using Fuse.js ────────────────────────
(function () {
  const input      = document.getElementById('searchInput');
  const resultsList = document.getElementById('resultsList');
  const statusEl   = document.getElementById('searchStatus');
  const emptyState = document.getElementById('emptyState');

  if (!input || !resultsList) return;

  // Configure Fuse.js
  const fuse = new Fuse(searchData, {
    keys: [
      { name: 'title',       weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'keywords',    weight: 0.2 }
    ],
    threshold: 0.4,   // 0 = exact match only, 1 = match anything
    minMatchCharLength: 2
  });

  function renderResults(query) {
    const trimmed = query.trim();

    // show empty state if nothing typed
    if (!trimmed) {
      resultsList.innerHTML = '';
      resultsList.appendChild(emptyState);
      statusEl.hidden = true;
      return;
    }

    const results = fuse.search(trimmed);

    // update status
    statusEl.hidden = false;
    statusEl.innerHTML = results.length > 0
      ? `Found <strong>${results.length}</strong> result${results.length !== 1 ? 's' : ''} for <strong>"${trimmed}"</strong>`
      : `No results for <strong>"${trimmed}"</strong>`;

    // render result cards or no-results message
    if (results.length === 0) {
      resultsList.innerHTML = `
        <div class="no-results">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <strong>No results found</strong>
          <p>Try a different search term, or browse our pages using the navigation above.</p>
        </div>`;
      return;
    }

    resultsList.innerHTML = results.map(({ item }) => `
      <a href="${item.url}" class="result-card">
        <div class="result-card-title">${item.title}</div>
        <div class="result-card-desc">${item.description}</div>
        <div class="result-card-url">compassion360.net / ${item.url.replace('index.html', '').replace('.html', '') || 'home'}</div>
      </a>
    `).join('');
  }

  // search as user types
  input.addEventListener('input', () => renderResults(input.value));

  // pre-fill if search query comes from URL e.g. search.html?q=nursing
  const params = new URLSearchParams(window.location.search);
  const preQuery = params.get('q');
  if (preQuery) {
    input.value = preQuery;
    renderResults(preQuery);
  }

  // focus the input on load
  input.focus();
})();