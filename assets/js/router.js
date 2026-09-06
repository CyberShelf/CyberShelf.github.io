function handleHashChange() {
  const standaloneRoutes = {
    '#about': 'about/',
    '#contact': 'contact/',
    '#faq': 'faq/',
    '#books-en': 'resources/english-books/',
    '#tools': 'resources/tools/',
    '#glossary': 'resources/glossary/'
  };

  if (standaloneRoutes[location.hash]) {
    location.replace(standaloneRoutes[location.hash]);
    return;
  }

  const legacyMatch = location.hash.match(/^#\/(book|blog)\/([^/?#]+)/);
  if (legacyMatch) {
    const [, type, rawId] = legacyMatch;
    const directory = type === 'book' ? 'book-details' : 'blog-details';
    const safeId = decodeURIComponent(rawId).replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeId) location.replace(`${directory}/${encodeURIComponent(safeId)}.html`);
    return;
  }

  const sections = ['home', 'learning-paths', 'shop', 'telegram', 'blog'];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.style.display = 'block';
  });

  document.title = 'سایبر شلف | مسیر یادگیری امنیت سایبری به زبان فارسی';
}
