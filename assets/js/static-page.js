(function () {
  const root = document.documentElement;
  const themeToggles = [
    document.getElementById('pageThemeToggle'),
    document.getElementById('pageThemeToggleMobile')
  ].filter(Boolean);
  const sunIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path></svg>';

  const applyTheme = theme => {
    root.classList.toggle('dark', theme === 'dark');
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('.theme-icon') || toggle;
      icon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      toggle.setAttribute('aria-label', theme === 'dark' ? 'فعال‌کردن حالت روز' : 'فعال‌کردن حالت شب');
    });
  };

  applyTheme(localStorage.getItem('theme') || 'dark');
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
    });
  });

  const menuButton = document.getElementById('pageMenuBtn');
  const mobileMenu = document.getElementById('pageMobileMenu');
  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
    };
    menuButton.addEventListener('click', () => {
      const shouldOpen = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', !shouldOpen);
      menuButton.setAttribute('aria-expanded', String(shouldOpen));
      document.body.classList.toggle('overflow-hidden', shouldOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => {
      if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const updateYear = () => {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  };

  const rebaseLinks = (container, assetBase) => {
    container.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && !href.startsWith('#') && !/^(?:[a-z]+:|\/)/i.test(href)) {
        link.href = `${assetBase}${href}`;
      }
    });
  };

  const footerMount = document.querySelector('[data-site-footer]');
  window.searchBase = footerMount?.dataset.assetBase || '';
  if (typeof initSearch === 'function') {
    buildSearchIndex();
    initSearch();
  }
  if (footerMount) {
    const footerBase = footerMount.dataset.assetBase || '';
    fetch(`${footerBase}partials/footer.html`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load the shared footer');
        return response.text();
      })
      .then(html => {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const footer = template.content.firstElementChild;
        if (!footer) throw new Error('Shared footer markup is empty');
        rebaseLinks(footer, footerBase);
        footerMount.replaceWith(footer);
        updateYear();
      })
      .catch(error => console.error(error));
  } else {
    updateYear();
  }

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
