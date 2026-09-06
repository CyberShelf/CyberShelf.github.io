function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;
  let previouslyFocused = null;
  mobileMenu.setAttribute('aria-hidden', 'true');

  const openMenu = () => {
    previouslyFocused = document.activeElement;
    mobileMenu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    mobileMenu.classList.add('animate-pulse');
    setTimeout(() => mobileMenu.classList.remove('animate-pulse'), 300);
    mobileMenu.querySelector('button, a[href]')?.focus();
  };

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
    previouslyFocused?.focus?.();
  };

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', event => {
    if (mobileMenu.classList.contains('hidden')) return;
    if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); return; }
    if (event.key !== 'Tab' || mobileMenu.classList.contains('hidden')) return;
    const focusable = Array.from(mobileMenu.querySelectorAll('button:not([disabled]), a[href]'));
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
}

// ⬆️ دکمه بازگشت به بالا
