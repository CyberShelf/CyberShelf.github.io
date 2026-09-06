let searchIndex = [];
let activeSearchType = 'همه';

const staticSearchItems = [
  { title: 'همه مسیرهای یادگیری', desc: 'مسیرهای مرحله‌ای امنیت سایبری', link: 'learning-paths/', section: 'مسیر یادگیری' },
  { title: 'وبلاگ سایبر شلف', desc: 'مقاله‌های امنیت وب، عملیات و آگاهی', link: 'blog/', section: 'وبلاگ' },
  { title: 'ابزارهای امنیت سایبری', desc: 'ابزارهای شبکه، تست نفوذ و تحلیل امنیتی', link: 'resources/tools/', section: 'ابزار' },
  { title: 'واژه‌نامه امنیت سایبری', desc: 'تعریف اصطلاحات تخصصی امنیت و مهندسی معکوس', link: 'resources/glossary/', section: 'واژه‌نامه' },
  { title: 'کتاب‌های تخصصی انگلیسی', desc: 'معرفی منابع زبان اصلی و صفحات رسمی ناشران', link: 'resources/english-books/', section: 'منبع انگلیسی' },
  { title: 'سؤالات متداول', desc: 'پاسخ پرسش‌های رایج درباره کتاب‌ها و ثبت درخواست', link: 'faq/', section: 'راهنما' },
  { title: 'تماس با سایبر شلف', desc: 'مشاوره انتخاب کتاب و ثبت درخواست سفارش', link: 'contact/', section: 'راهنما' }
];

function normalizeText(text) {
  return (text || '').toString().toLowerCase()
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[أإ]/g, 'ا').replace(/ؤ/g, 'و').replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[ـ‌-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSearchIndex() {
  const items = Array.from(document.querySelectorAll('[data-search-item], .path-card'));
  const domItems = items.map((el, order) => {
    const titleEl = el.querySelector('[data-search-title]') || el.querySelector('h3, summary');
    const descEl = el.querySelector('[data-search-desc]') || el.querySelector('p');
    const linkEl = el.querySelector('[data-search-link]') || el.querySelector('a[href]');
    const sectionEl = el.closest('section');
    const sectionTitle = sectionEl?.querySelector('h2')?.textContent?.trim();
    const sectionId = sectionEl?.id ? `#${sectionEl.id}` : '';
    const title = titleEl?.textContent.trim() || '';
    const desc = descEl?.textContent.trim() || '';
    const link = el.dataset.searchLink || linkEl?.getAttribute('href') || sectionId || '#';
    const section = el.classList.contains('path-card') ? 'مسیر یادگیری' : (el.dataset.searchSection || sectionTitle || sectionId.replace('#', '') || 'منبع');
    const fullText = el.textContent || '';
    return { title, desc, link, section, order, haystack: normalizeText(`${title} ${desc} ${section} ${fullText}`), normalizedTitle: normalizeText(title) };
  }).filter(item => item.title && item.link);
  const searchBase = window.searchBase || '';
  const pageItems = staticSearchItems.map((item, index) => ({
    ...item,
    link: `${searchBase}${item.link}`,
    order: domItems.length + index,
    haystack: normalizeText(`${item.title} ${item.desc} ${item.section}`),
    normalizedTitle: normalizeText(item.title)
  }));
  searchIndex = [...domItems, ...pageItems];
}

function initSearch() {
  const modal = document.getElementById('searchModal');
  const openButtons = [document.getElementById('searchOpen'), document.getElementById('searchOpenMobile')].filter(Boolean);
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const filters = document.getElementById('searchFilters');
  const summary = document.getElementById('searchSummary');
  if (!modal || !input || !results || !filters || !summary) return;
  let lastFocusedElement = null;

  const availableTypes = () => ['همه', ...new Set(searchIndex.map(item => item.section))];
  const renderFilters = renderResults => {
    filters.replaceChildren();
    availableTypes().forEach(type => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'search-filter'; button.textContent = type;
      button.setAttribute('aria-pressed', String(type === activeSearchType));
      button.addEventListener('click', () => { activeSearchType = type; renderFilters(renderResults); renderResults(input.value); });
      filters.appendChild(button);
    });
  };

  const scoreItem = (item, query) => {
    const tokens = query.split(' ').filter(Boolean);
    if (!tokens.every(token => item.haystack.includes(token))) return -1;
    let score = item.section === 'کتاب' ? 2 : 0;
    if (item.normalizedTitle === query) score += 20;
    else if (item.normalizedTitle.startsWith(query)) score += 12;
    else if (item.normalizedTitle.includes(query)) score += 8;
    tokens.forEach(token => { if (item.normalizedTitle.includes(token)) score += 3; });
    return score;
  };

  const renderCard = item => {
    const card = document.createElement('a');
    card.href = item.link; card.className = 'search-result';
    const badge = document.createElement('span'); badge.className = 'search-result-type'; badge.textContent = item.section;
    const title = document.createElement('strong'); title.textContent = item.title;
    const desc = document.createElement('p'); desc.textContent = item.desc || 'برای مشاهده جزئیات این نتیجه وارد شوید.';
    card.append(badge, title, desc);
    card.addEventListener('click', close);
    return card;
  };

  const renderResults = value => {
    const query = normalizeText(value);
    let matches;
    if (query) {
      matches = searchIndex.map(item => ({ item, score: scoreItem(item, query) })).filter(result => result.score >= 0).sort((a, b) => b.score - a.score || a.item.order - b.item.order).map(result => result.item);
    } else {
      matches = searchIndex.filter(item => item.section === 'کتاب').slice(0, 6);
    }
    if (activeSearchType !== 'همه') matches = matches.filter(item => item.section === activeSearchType);
    matches = matches.slice(0, 20);
    results.replaceChildren();
    summary.textContent = query ? `${matches.length} نتیجه برای «${value.trim()}»` : 'کتاب‌های فارسی پیشنهادی';
    if (!matches.length) {
      const empty = document.createElement('div'); empty.className = 'search-empty'; empty.innerHTML = '<strong>نتیجه‌ای پیدا نشد</strong><p>عبارت کوتاه‌تر یا نوع محتوای دیگری را امتحان کنید.</p>'; results.appendChild(empty); return;
    }
    matches.forEach(item => results.appendChild(renderCard(item)));
  };

  function open() {
    lastFocusedElement = document.activeElement; buildSearchIndex(); activeSearchType = 'همه'; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('search-open'); renderFilters(renderResults); renderResults(input.value); input.focus();
  }
  function close() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('search-open'); lastFocusedElement?.focus?.(); }

  openButtons.forEach(button => button.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal.firstElementChild) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); } });
  input.addEventListener('input', () => renderResults(input.value));
}
