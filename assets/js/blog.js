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

  const extractTitle = html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h1 = doc.querySelector('h1');
    const title = (h1?.textContent || doc.title || '').trim();
    return title;
  };

  const extractMeta = html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const header = doc.querySelector('header');
    const meta = header?.querySelector('p')?.textContent?.trim();
    return meta || '';
  };

  const extractExcerpt = html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const header = doc.querySelector('header');
    const paragraphs = header ? Array.from(header.querySelectorAll('p')) : [];
    const excerpt = paragraphs.length > 1 ? paragraphs[1].textContent.trim() : '';
    return excerpt;
  };

  const pageSize = 6;
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
    const res = await fetch('blog-index.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('index fetch failed');
    const entries = await res.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      setStatus('فعلا پستی برای نمایش نداریم.');
      return;
    }

    const fallbackMeta = {
      'blog-details/cybersecurity-what-is-2026.html': {
        title: 'امنیت سایبری چیست؟ راهنمای ۲۰۲۶',
        excerpt: 'تعریف ساده امنیت سایبری، چرایی اهمیت آن و مسیرهای ورود برای کسب‌وکارها و کاربران عادی.',
        meta: 'راهنمای پایه · مفاهیم'
      },
      'blog-details/common-cybersecurity-mistakes.html': {
        title: '۱۰ اشتباه رایج در امنیت سایبری',
        excerpt: 'اشتباهاتی که بیشترین ریسک را ایجاد می‌کنند و راه‌حل‌های سریع برای پیشگیری از آن‌ها.',
        meta: 'مدیریت ریسک · کسب‌وکار'
      },
      'blog-details/social-media-account-security.html': {
        title: 'امنیت حساب‌های شبکه‌های اجتماعی',
        excerpt: 'چک‌لیست کوتاه برای ایمن‌سازی حساب‌ها، جلوگیری از سرقت و بازیابی سریع.',
        meta: 'اکانت‌سکیوریتی · کاربری عمومی'
      },
      'blog-details/windows-linux-hardening-best-practices.html': {
        title: 'سخت‌سازی ویندوز و لینوکس',
        excerpt: 'اقدام‌های کلیدی برای کاهش سطح حمله و افزایش تاب‌آوری سیستم‌ها.',
        meta: 'هاردنینگ · عملیات'
      },
      'blog-details/phishing-email-detection.html': {
        title: 'تشخیص ایمیل‌های فیشینگ',
        excerpt: 'نشانه‌های رایج فیشینگ و روش‌های عملی برای تشخیص و گزارش سریع.',
        meta: 'فیشینگ · آگاهی'
      },
      'blog-details/cybersecurity-for-small-business.html': {
        title: 'امنیت سایبری برای کسب‌وکارهای کوچک',
        excerpt: 'حداقل اقدام‌های ضروری با کمترین هزینه برای حفاظت از داده‌ها.',
        meta: 'SMB · راهنمای عملی'
      },
      'blog-details/malware-types-and-defense.html': {
        title: 'انواع بدافزار و روش‌های دفاع',
        excerpt: 'آشنایی با گونه‌های بدافزار و گام‌های اولیه برای مقابله مؤثر.',
        meta: 'بدافزار · دفاع'
      },
      'blog-details/strong-passwords-guide.html': {
        title: 'راهنمای ساخت رمز عبور قوی',
        excerpt: 'قواعد ساده برای ساخت رمزهای امن و مدیریت درست آن‌ها.',
        meta: 'رمز عبور · بهداشت دیجیتال'
      },
      'blog-details/common-cyber-attacks-iran.html': {
        title: 'حملات سایبری رایج در ایران',
        excerpt: 'الگوهای پرتکرار حمله و توصیه‌های پیشگیرانه برای کاربران و سازمان‌ها.',
        meta: 'تهدیدشناسی · منطقه‌ای'
      },
      'blog-details/future-of-cybersecurity.html': {
        title: 'آینده امنیت سایبری',
        excerpt: 'روندهای مهم سال‌های پیش‌رو و مهارت‌هایی که باید روی آن‌ها سرمایه‌گذاری کرد.',
        meta: 'ترندها · چشم‌انداز'
      }
    };

    const fragment = document.createDocumentFragment();
    let counter = 1;
    for (const entry of entries) {
      const path = typeof entry === 'string' ? entry : entry?.path;
      if (!path) continue;

      const fallback = fallbackMeta[path] || {};
      let title = typeof entry === 'object' ? (entry.title || '') : '';
      let meta = typeof entry === 'object' ? (entry.meta || '') : '';
      let excerpt = typeof entry === 'object' ? (entry.excerpt || '') : '';

      if (!title && fallback.title) title = fallback.title;
      if (!meta && fallback.meta) meta = fallback.meta;
      if (!excerpt && fallback.excerpt) excerpt = fallback.excerpt;

      try {
        const postRes = await fetch(path);
        if (postRes.ok) {
          const html = await postRes.text();
          const fetchedTitle = extractTitle(html);
          const fetchedMeta = extractMeta(html);
          const fetchedExcerpt = extractExcerpt(html);
          if (!title && fetchedTitle) title = fetchedTitle;
          if (!meta && fetchedMeta) meta = fetchedMeta;
          if (!excerpt && fetchedExcerpt) excerpt = fetchedExcerpt;
        }
      } catch (e) {
        // fallback to index metadata
      }

      if (!title) title = 'پست وبلاگ';

      const id = path.split('/').pop().replace(/\.html$/i, '');
      const item = document.createElement('li');
      item.className = 'py-4';
      item.setAttribute('data-search-item', '');
      item.setAttribute('data-search-section', 'وبلاگ');

      const link = document.createElement('a');
      const blogHash = `#/blog/${encodeURIComponent(id)}`;
      link.href = blogHash;
      link.className = 'group flex items-start gap-3';
      link.addEventListener('click', event => {
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== blogHash) {
          location.hash = blogHash;
        } else if (typeof handleHashChange === 'function') {
          handleHashChange();
        }
      });

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
