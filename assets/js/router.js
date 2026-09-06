function handleHashChange() {
  const standaloneRoutes = {
    '#about': 'about/',
    '#contact': 'contact/',
    '#faq': 'faq/',
    '#books-en': 'resources/english-books/',
    '#tools': 'resources/tools/',
    '#glossary': 'resources/glossary/'
  };
  if (standaloneRoutes[location.hash]) {
    location.replace(standaloneRoutes[location.hash]);
    return;
  }
  const sections = ['home', 'learning-paths', 'shop', 'telegram', 'blog'];
  const books = document.getElementById('books');
  const blogPost = document.getElementById('blog-post');
  const readerToggle = document.getElementById('readerToggle');
  const blogVersion = '2026-02-14-1';

  const show = ids => ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  });
  const hide = ids => ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (location.hash.startsWith('#/book/')) {
    hide(sections);
    const bookId = location.hash.split('/')[2];
    loadPartial('books', `book-details/${bookId}.html`).then(() => {
      if (books) books.style.display = 'block';
      initLazyImages();
      initBookDetails(books, bookId);
      initPurchaseFlow(books);
    });
    if (blogPost) blogPost.style.display = 'none';
    clearActiveNav();
    if (readerToggle) readerToggle.classList.remove('hidden');
  } else if (location.hash.startsWith('#/blog/')) {
    hide(sections);
    const rawId = location.hash.split('/')[2] || '';
    const postId = decodeURIComponent(rawId);
    if (!postId) {
      location.hash = '#blog';
      show(sections);
      if (blogPost) blogPost.style.display = 'none';
      return;
    }
    const renderFallbackPost = async () => {
      if (!blogPost) return;
      try {
        const res = await fetch('blog-index.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('index fetch failed');
        const entries = await res.json();
        const path = `blog-details/${postId}.html`;
        const match = Array.isArray(entries)
          ? entries.find(item => (typeof item === 'string' ? item : item?.path) === path)
          : null;
        const meta = typeof match === 'object' ? (match.meta || '') : '';
        const title = typeof match === 'object' ? (match.title || '') : '';
        const excerpt = typeof match === 'object' ? (match.excerpt || '') : '';
        blogPost.innerHTML = `
          <div class="container mx-auto py-12 px-4">
            <div class="max-w-3xl mx-auto space-y-6">
              <header class="space-y-3">
                <p class="text-sm text-slate-400">${meta || 'وبلاگ'}</p>
                <h1 class="text-3xl md:text-4xl font-bold text-emerald-300">${title || 'پست وبلاگ'}</h1>
                <p class="text-slate-300 leading-8">${excerpt || 'این پست در حال آماده‌سازی است.'}</p>
              </header>
            </div>
          </div>
        `;
      } catch (err) {
        blogPost.innerHTML = `
          <div class="container mx-auto py-12 px-4">
            <div class="max-w-3xl mx-auto">
              <p class="text-slate-300">در نمایش پست مشکلی پیش آمده است.</p>
            </div>
          </div>
        `;
      }
    };

    loadPartial('blog-post', `blog-details/${postId}.html?v=${blogVersion}`).then(el => {
      if (blogPost) blogPost.style.display = 'block';
      if (!el || !el.innerHTML || !el.innerHTML.trim()) {
        renderFallbackPost();
      }
      initLazyImages();
      const postTitle = blogPost?.querySelector('h1')?.textContent?.trim();
      if (postTitle) document.title = `${postTitle} | سایبر شلف`;
    });
    if (books) books.style.display = 'none';
    clearActiveNav();
    document.body.classList.remove('reader-mode');
    if (readerToggle) readerToggle.classList.add('hidden');
  } else {
    show(sections);
    if (books) books.style.display = 'none';
    if (blogPost) blogPost.style.display = 'none';
    document.body.classList.remove('reader-mode');
    if (readerToggle) readerToggle.classList.add('hidden');
    document.title = 'سایبر شلف | مسیر یادگیری امنیت سایبری به زبان فارسی';
  }
}


// --------- بارگذاری ۵ پست آخر تلگرام (RSS via AllOrigins proxy) ----------
