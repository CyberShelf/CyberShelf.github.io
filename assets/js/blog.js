async function initBlogList() {
  const list = document.getElementById('blogList');
  const status = document.getElementById('blogStatus');
  const pager = document.getElementById('blogPager');
  const prevBtn = document.getElementById('blogPrev');
  const nextBtn = document.getElementById('blogNext');
  const pageInfo = document.getElementById('blogPageInfo');
  if (!list) return;

  const setStatus = text => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('hidden', !text);
  };


  const pageSize = Math.max(1, Number.parseInt(list.dataset.pageSize || '6', 10));
  let currentPage = 1;
  let totalPages = 1;

  const updatePager = () => {
    if (!pager || !prevBtn || !nextBtn || !pageInfo) return;
    pageInfo.textContent = `صفحه ${currentPage} از ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
    prevBtn.classList.toggle('pointer-events-none', prevBtn.disabled);
    nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
    nextBtn.classList.toggle('pointer-events-none', nextBtn.disabled);
  };

  const showPage = page => {
    const items = Array.from(list.children);
    totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    currentPage = Math.min(Math.max(1, page), totalPages);
    items.forEach((item, index) => {
      const visible = index >= (currentPage - 1) * pageSize && index < currentPage * pageSize;
      item.classList.toggle('hidden', !visible);
    });
    updatePager();
  };

  try {
    setStatus('در حال بارگذاری...');
    const res = await fetch(list.dataset.indexUrl || 'blog-index.json');
    if (!res.ok) throw new Error('index fetch failed');
    const entries = await res.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      setStatus('فعلا پستی برای نمایش نداریم.');
      return;
    }
    const fragment = document.createDocumentFragment();
    let counter = 1;
    for (const entry of entries) {
      const path = typeof entry === 'string' ? entry : entry?.path;
      if (!path) continue;

      const title = typeof entry === 'object' && entry.title ? entry.title : 'پست وبلاگ';
      const meta = typeof entry === 'object' ? (entry.meta || '') : '';
      const excerpt = typeof entry === 'object' ? (entry.excerpt || '') : '';

      const id = path.split('/').pop().replace(/\.html$/i, '');
      const item = document.createElement('li');
      item.className = 'py-4';
      item.setAttribute('data-search-item', '');
      item.setAttribute('data-search-section', 'وبلاگ');

      const link = document.createElement('a');
      const detailBase = list.dataset.detailBase || '#/blog/';
      const blogHref = `${detailBase}${encodeURIComponent(id)}`;
      link.href = blogHref;
      link.dataset.analytics = 'open_article';
      link.className = 'group flex items-start gap-3';
      if (blogHref.startsWith('#/')) {
        link.addEventListener('click', event => {
          if (event.defaultPrevented) return;
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          if (location.hash !== blogHref) {
            location.hash = blogHref;
          } else if (typeof handleHashChange === 'function') {
            handleHashChange();
          }
        });
      }

      const badge = document.createElement('div');
      badge.className = 'mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 text-[11px] font-bold transition group-hover:border-emerald-400 group-hover:text-emerald-300';
      badge.textContent = String(counter).padStart(2, '0');

      const content = document.createElement('div');
      content.className = 'flex-1';

      const titleEl = document.createElement('div');
      titleEl.className = 'text-sm md:text-base font-bold text-slate-200 transition group-hover:text-emerald-300';
      titleEl.setAttribute('data-search-title', '');
      titleEl.textContent = title;

      const metaEl = document.createElement('div');
      metaEl.className = 'text-xs text-slate-500 mt-1';
      metaEl.textContent = meta;

      const excerptEl = document.createElement('div');
      excerptEl.className = 'text-xs text-slate-400 mt-2 line-clamp-2';
      excerptEl.setAttribute('data-search-desc', '');
      excerptEl.textContent = excerpt;

      content.appendChild(titleEl);
      if (meta) content.appendChild(metaEl);
      if (excerpt) content.appendChild(excerptEl);

      link.appendChild(badge);
      link.appendChild(content);

      item.appendChild(link);
      fragment.appendChild(item);
      counter += 1;
    }

    list.innerHTML = '';
    list.appendChild(fragment);
    setStatus(list.children.length ? '' : 'فعلا پستی برای نمایش نداریم.');
    showPage(1);
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => showPage(currentPage - 1));
      nextBtn.addEventListener('click', () => showPage(currentPage + 1));
    }
  } catch (err) {
    console.error(err);
    setStatus('بارگذاری وبلاگ با خطا روبه‌رو شد.');
  }
}
