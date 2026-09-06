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
    loadPartial('books-en', 'partials/books-en.html?v=20260906-2'),
    loadPartial('tools', 'partials/tools.html'),
    loadPartial('glossary', 'partials/glossary.html'),
    loadPartial('faq', 'partials/faq.html'),
    loadPartial('contact', 'partials/contact.html'),
    loadPartial('about', 'partials/about.html'),
    loadPartial('footer', 'partials/footer.html')
  ]);
  await initBlogList();
  buildSearchIndex();
  initLazyImages();

  // اگر partial telegram دارید و آن را در لیست بالا اضافه کردید،
  // می‌توانید قبل از این خط loadTelegramPosts را اجرا کنید.
  loadTelegramPosts().then(initLazyImages).catch(() => {});

  handleHashChange();
  initBackToTop();
  initScrollProgress();
  initActiveNav();
  initAnalyticsEvents();
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
