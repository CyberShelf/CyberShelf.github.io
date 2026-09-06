(function () {
  window.cyberShelfAnalytics = window.cyberShelfAnalytics || { track(name, properties) { window.dispatchEvent(new CustomEvent('cybershelf:analytics', { detail: { name, properties: properties || {} } })); } };
  window.initAnalyticsEvents = function () {
    document.addEventListener('click', event => { const target = event.target.closest('[data-analytics]'); if (target) window.cyberShelfAnalytics.track(target.dataset.analytics, { label: target.textContent.trim(), href: target.getAttribute('href') || '' }); });
    const search = document.getElementById('searchInput');
    search?.addEventListener('change', () => { if (search.value.trim()) window.cyberShelfAnalytics.track('search', { query: search.value.trim() }); });
  };
})();
