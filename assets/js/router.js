function handleHashChange() {
  const sections = ['home', 'shop', 'faq', 'contact', 'about', 'books-en', 'tools', 'telegram', 'glossary'];
  const books = document.getElementById('books');
  const readerToggle = document.getElementById('readerToggle');

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
    });
    clearActiveNav();
    if (readerToggle) readerToggle.classList.remove('hidden');
  } else {
    show(sections);
    if (books) books.style.display = 'none';
    document.body.classList.remove('reader-mode');
    if (readerToggle) readerToggle.classList.add('hidden');
  }
}


// --------- بارگذاری ۵ پست آخر تلگرام (RSS via AllOrigins proxy) ----------
