let searchIndex = [];
let activeSearchType = 'همه';

const staticSearchItems = [
  { title: 'مقدمه‌ای بر Windows API برای تیم قرمز', desc: 'کتاب فارسی امنیت ویندوز و Red Team، ۱۹۸ صفحه', link: 'book-details/Windows-API-Introduction.html', section: 'کتاب' },
  { title: 'مدیریت عملیات تیم قرمز', desc: 'کتاب فارسی مدیریت عملیات Red Team، ۱۰۳ صفحه', link: 'book-details/RedTeam-Operation-Management.html', section: 'کتاب' },
  { title: 'مقدمه‌ای بر تحلیل بدافزار', desc: 'کتاب فارسی تحلیل بدافزار، ۲۲۹ صفحه', link: 'book-details/Malware-Analysis-Introduction.html', section: 'کتاب' },
  { title: 'تکنیک‌های عملی فرار از AV/EDR', desc: 'کتاب فارسی Red Team و امنیت ویندوز، ۳۳۶ صفحه', link: 'book-details/AVEDR-Evasion-Practical-Techniques.html', section: 'کتاب' },
  { title: 'مقدمه‌ای بر Bug Bounty', desc: 'کتاب فارسی امنیت وب و شکار باگ، ۲۴۶ صفحه', link: 'book-details/Introduction-to-BugBounty.html', section: 'کتاب' },
  { title: 'مقدمه‌ای بر توسعه تهاجمی', desc: 'کتاب فارسی توسعه تهاجمی ویندوز، ۲۲۱ صفحه', link: 'book-details/Offensive-Development-Introduction.html', section: 'کتاب' },
  { title: 'امنیت سایبری چیست؟ راهنمای ۲۰۲۶', desc: 'تعریف امنیت سایبری و مسیرهای شروع', link: 'blog-details/cybersecurity-what-is-2026.html', section: 'وبلاگ' },
  { title: '۱۰ اشتباه رایج در امنیت سایبری', desc: 'خطاهای پرتکرار و راه‌های پیشگیری', link: 'blog-details/common-cybersecurity-mistakes.html', section: 'وبلاگ' },
  { title: 'امنیت حساب‌های شبکه‌های اجتماعی', desc: 'چک‌لیست ایمن‌سازی حساب‌ها', link: 'blog-details/social-media-account-security.html', section: 'وبلاگ' },
  { title: 'سخت‌سازی ویندوز و لینوکس', desc: 'کاهش سطح حمله سیستم‌عامل‌ها', link: 'blog-details/windows-linux-hardening-best-practices.html', section: 'وبلاگ' },
  { title: 'تشخیص ایمیل‌های فیشینگ', desc: 'نشانه‌ها و روش‌های تشخیص فیشینگ', link: 'blog-details/phishing-email-detection.html', section: 'وبلاگ' },
  { title: 'امنیت سایبری برای کسب‌وکارهای کوچک', desc: 'اقدام‌های ضروری برای حفاظت از داده‌ها', link: 'blog-details/cybersecurity-for-small-business.html', section: 'وبلاگ' },
  { title: 'انواع بدافزار و روش‌های دفاع', desc: 'شناخت گونه‌های بدافزار و دفاع اولیه', link: 'blog-details/malware-types-and-defense.html', section: 'وبلاگ' },
  { title: 'راهنمای ساخت رمز عبور قوی', desc: 'ساخت و مدیریت رمزهای امن', link: 'blog-details/strong-passwords-guide.html', section: 'وبلاگ' },
  { title: 'حملات سایبری رایج در ایران', desc: 'الگوهای پرتکرار حمله و پیشگیری', link: 'blog-details/common-cyber-attacks-iran.html', section: 'وبلاگ' },
  { title: 'آینده امنیت سایبری', desc: 'روندهای آینده و مهارت‌های مهم', link: 'blog-details/future-of-cybersecurity.html', section: 'وبلاگ' },
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
  const seenLinks = new Set();
  searchIndex = [...domItems, ...pageItems].filter(item => {
    if (seenLinks.has(item.link)) return false;
    seenLinks.add(item.link);
    return true;
  });
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

  const appendHighlighted = (element, value, query) => {
    if (!query) { element.textContent = value; return; }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = value.split(new RegExp(`(${escaped})`, 'gi'));
    parts.forEach(part => {
      if (part.toLocaleLowerCase('fa') === query.toLocaleLowerCase('fa')) {
        const mark = document.createElement('mark'); mark.textContent = part; element.appendChild(mark);
      } else {
        element.appendChild(document.createTextNode(part));
      }
    });
  };

  const renderCard = (item, query) => {
    const card = document.createElement('a');
    card.href = item.link; card.className = 'search-result';
    const badge = document.createElement('span'); badge.className = 'search-result-type'; badge.textContent = item.section;
    const title = document.createElement('strong'); appendHighlighted(title, item.title, query);
    const desc = document.createElement('p'); appendHighlighted(desc, item.desc || 'برای مشاهده جزئیات این نتیجه وارد شوید.', query);
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
    matches.forEach(item => results.appendChild(renderCard(item, value.trim())));
  };

  function open() {
    lastFocusedElement = document.activeElement; buildSearchIndex(); activeSearchType = 'همه'; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('search-open'); renderFilters(renderResults); renderResults(input.value); input.focus();
  }
  function close() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('search-open'); lastFocusedElement?.focus?.(); }

  openButtons.forEach(button => button.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal.firstElementChild) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); return; }
    if (event.key !== 'Tab' || modal.classList.contains('hidden')) return;
    const focusable = Array.from(modal.querySelectorAll('button:not([disabled]), input, a[href]')).filter(element => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  input.addEventListener('input', () => renderResults(input.value));
}
