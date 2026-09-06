function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        btn.classList.toggle('show', window.scrollY > 300);
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
// 💻 ترمینال صفحه اصلی
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });

  update();
}

function clearActiveNav() {
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    link.removeAttribute('aria-current');
  });
}

function initActiveNav() {
  const links = Array.from(document.querySelectorAll('[data-nav-link]'));
  if (!links.length) return;

  const groupedLinks = new Map();
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#') || href.startsWith('#/')) return;
    const id = href.slice(1);
    if (!groupedLinks.has(id)) groupedLinks.set(id, []);
    groupedLinks.get(id).push(link);
  });

  const sections = Array.from(groupedLinks.keys())
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const setActive = id => {
    groupedLinks.forEach((group, key) => {
      group.forEach(link => {
        if (key === id) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  };

  const updateFromHash = () => {
    const hashId = location.hash.replace('#', '');
    if (groupedLinks.has(hashId)) setActive(hashId);
  };

  if (sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      setActive(visible[0].target.id);
    }, { rootMargin: '0px 0px -45% 0px', threshold: [0.2, 0.4, 0.6] });

    sections.forEach(section => observer.observe(section));
  }

  updateFromHash();
  window.addEventListener('hashchange', updateFromHash);
}

function initThemeToggle() {
  const root = document.documentElement;
  const toggles = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggleMobile')
  ].filter(Boolean);

  const sunIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path></svg>';

  const applyTheme = theme => {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    toggles.forEach(btn => {
      const icon = btn.querySelector('.theme-icon') || btn;
      icon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    });
  };

  const stored = localStorage.getItem('theme');
  const initial = stored || 'dark';
  applyTheme(initial);

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  });
}

function initAnnouncement() {
  const bar = document.getElementById('announcementBar');
  const closeBtn = document.getElementById('announcementClose');
  if (!bar || !closeBtn) return;

  const dismissed = localStorage.getItem('announcementDismissed') === '1';
  if (!dismissed) bar.classList.remove('hidden');

  closeBtn.addEventListener('click', () => {
    bar.classList.add('hidden');
    localStorage.setItem('announcementDismissed', '1');
  });
}

function initLazyImages() {
  const images = document.querySelectorAll('img[data-lazy]');
  images.forEach(img => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.classList.add('lazy-img', 'img-skeleton');

    const clear = () => img.classList.remove('img-skeleton');
    if (img.complete) {
      clear();
    } else {
      img.addEventListener('load', clear, { once: true });
      img.addEventListener('error', clear, { once: true });
    }
  });
}
