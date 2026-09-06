const init = async () => {
  initAnnouncement();
  initThemeToggle();
  initMobileMenu();
  initSearch();
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  await initBlogList();
  buildSearchIndex();
  initLazyImages();

  loadTelegramPosts().then(initLazyImages).catch(() => {});

  handleHashChange();
  initBackToTop();
  initScrollProgress();
  initActiveNav();
  initAnalyticsEvents();
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
