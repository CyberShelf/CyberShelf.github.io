const init = async () => {
  initAnnouncement();
  initThemeToggle();
  initReaderMode();
  initMobileMenu();
  initSearch();
  await Promise.allSettled([
    loadPartial('home', 'partials/home.html'),
    loadPartial('shop', 'partials/shop.html'),
    loadPartial('telegram', 'partials/telegram.html'),
    loadPartial('books-en', 'partials/books-en.html'),
    loadPartial('tools', 'partials/tools.html'),
    loadPartial('glossary', 'partials/glossary.html'),
    loadPartial('faq', 'partials/faq.html'),
    loadPartial('contact', 'partials/contact.html'),
    loadPartial('about', 'partials/about.html'),
    loadPartial('footer', 'partials/footer.html')
  ]);
  buildSearchIndex();
  initLazyImages();

  // اگر partial telegram دارید و آن را در لیست بالا اضافه کردید،
  // می‌توانید قبل از این خط loadTelegramPosts را اجرا کنید.
  await loadTelegramPosts();
  initLazyImages();

  handleHashChange();
  initBackToTop();
  initScrollProgress();
  initActiveNav();
  initHomeTerminal();
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
