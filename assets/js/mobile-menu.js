function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
    mobileMenu.classList.add('animate-pulse');
    setTimeout(() => mobileMenu.classList.remove('animate-pulse'), 300);
  };

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
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
    if (event.key === 'Escape') closeMenu();
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
}

// ⬆️ دکمه بازگشت به بالا
