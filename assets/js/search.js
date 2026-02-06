let searchIndex = [];

function normalizeText(text) {
  return (text || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
}

function buildSearchIndex() {
  const items = Array.from(document.querySelectorAll('[data-search-item]'));
  searchIndex = items.map(el => {
    const titleEl = el.querySelector('[data-search-title]') || el.querySelector('h3, summary');
    const descEl = el.querySelector('[data-search-desc]') || el.querySelector('p');
    const linkEl = el.querySelector('[data-search-link]') || el.querySelector('a[href]');
    const sectionEl = el.closest('section');
    const sectionTitle = sectionEl?.querySelector('h2')?.textContent?.trim();
    const sectionId = sectionEl?.id ? `#${sectionEl.id}` : '';

    const title = titleEl ? titleEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : '';
    const link = el.dataset.searchLink || linkEl?.getAttribute('href') || sectionId || '#';
    const section = el.dataset.searchSection || sectionTitle || sectionId.replace('#', '') || '';
    const haystack = normalizeText(`${title} ${desc} ${section}`);

    return { title, desc, link, section, haystack };
  });
}

function initSearch() {
  const modal = document.getElementById('searchModal');
  const openBtn = document.getElementById('searchOpen');
  const openBtnMobile = document.getElementById('searchOpenMobile');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  if (!modal || !input || !results) return;

  const open = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    input.focus();
    renderResults('');
  };

  const close = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  const renderResults = query => {
    results.innerHTML = '';
    if (!query) {
      const hint = document.createElement('div');
      hint.className = 'text-slate-400 text-sm';
      hint.textContent = 'کلمه مورد نظر را تایپ کنید.';
      results.appendChild(hint);
      return;
    }

    const normalized = normalizeText(query);
    const matches = searchIndex.filter(item => item.haystack.includes(normalized)).slice(0, 20);

    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'text-slate-400 text-sm';
      empty.textContent = 'نتیجه‌ای پیدا نشد.';
      results.appendChild(empty);
      return;
    }

    matches.forEach(item => {
      const card = document.createElement('a');
      card.href = item.link || '#';
      card.className = 'block rounded-xl border border-slate-700 bg-slate-950/70 p-3 hover:border-emerald-400 hover:shadow-lg transition';

      const title = document.createElement('div');
      title.className = 'font-bold text-emerald-300';
      title.textContent = item.title || item.section || 'نتیجه';

      const desc = document.createElement('div');
      desc.className = 'text-sm text-slate-400 mt-1 line-clamp-2';
      desc.textContent = item.desc;

      const meta = document.createElement('div');
      meta.className = 'text-xs text-slate-500 mt-2';
      meta.textContent = item.section ? `بخش: ${item.section}` : '';

      card.appendChild(title);
      if (item.desc) card.appendChild(desc);
      if (item.section) card.appendChild(meta);

      results.appendChild(card);
    });
  };

  openBtn?.addEventListener('click', open);
  openBtnMobile?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);

  modal.addEventListener('click', event => {
    if (event.target === modal.firstElementChild) close();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });

  input.addEventListener('input', () => renderResults(input.value));
}
