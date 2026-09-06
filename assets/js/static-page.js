(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('pageThemeToggle');

  const applyTheme = theme => {
    root.classList.toggle('dark', theme === 'dark');
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'فعال‌کردن حالت روز' : 'فعال‌کردن حالت شب');
    }
  };

  applyTheme(localStorage.getItem('theme') || 'dark');
  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const host = document.querySelector('[data-partial]');
  if (!host) return;

  const loadPageContent = async () => {
    try {
      const response = await fetch(host.dataset.partial);
      if (!response.ok) throw new Error(`Failed to load ${host.dataset.partial}`);
      host.innerHTML = await response.text();

      const assetBase = host.dataset.assetBase || '';
      host.querySelectorAll('[src^="assets/"], [href^="assets/"]').forEach(element => {
        const attribute = element.hasAttribute('src') ? 'src' : 'href';
        element.setAttribute(attribute, `${assetBase}${element.getAttribute(attribute)}`);
      });
      host.querySelectorAll('a[href^="#/"]').forEach(link => {
        link.href = `${assetBase}${link.getAttribute('href')}`;
      });
      host.querySelectorAll('img').forEach(image => {
        image.loading = 'lazy';
        image.decoding = 'async';
      });

      if (host.id === 'contact') {
        const requestedBook = new URLSearchParams(location.search).get('book');
        const bookSelect = host.querySelector('#contactBook');
        if (requestedBook && bookSelect) {
          const option = Array.from(bookSelect.options).find(item => item.textContent.trim() === requestedBook.trim());
          if (option) bookSelect.value = option.value;
        }
      }

      if (host.dataset.pageType === 'blog') {
        const list = host.querySelector('#blogList');
        const pager = host.querySelector('#blogPager');
        host.querySelector('[data-home-only]')?.remove();
        if (list) {
          list.dataset.pageSize = '6';
          list.dataset.indexUrl = `${assetBase}blog-index.json`;
          list.dataset.detailBase = `${assetBase}#/blog/`;
        }
        pager?.classList.remove('hidden');
        if (typeof initBlogList === 'function') await initBlogList();
      }
    } catch (error) {
      console.error(error);
      host.innerHTML = '<div class="page-load-error"><h1>بارگذاری صفحه کامل نشد</h1><p>لطفاً صفحه را دوباره بارگذاری کنید یا به صفحه اصلی بازگردید.</p></div>';
    }
  };

  loadPageContent();
})();
