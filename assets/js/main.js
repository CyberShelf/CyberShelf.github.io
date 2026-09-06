const init = async () => {
  initAnnouncement();
  initThemeToggle();
  initReaderMode();
  initMobileMenu();
  initSearch();
  await Promise.allSettled([
    loadPartial('learning-paths', 'partials/learning-paths.html'),
    loadPartial('shop', 'partials/shop.html'),
    loadPartial('telegram', 'partials/telegram.html'),
    loadPartial('blog', 'partials/blog.html'),
    loadPartial('footer', 'partials/footer.html')
  ]);
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
