(function () {
  const config = window.CYBERSHELF_CONFIG?.analytics || {};
  const isValidGa4Id = /^G-[A-Z0-9]+$/.test(config.ga4MeasurementId || '');

  if (config.provider === 'ga4' && isValidGa4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.ga4MeasurementId, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`;
    document.head.appendChild(script);
  }

  window.cyberShelfAnalytics = {
    track(name, properties = {}) {
      window.dispatchEvent(new CustomEvent('cybershelf:analytics', { detail: { name, properties } }));
      if (config.provider === 'ga4' && isValidGa4Id && window.gtag) window.gtag('event', name, properties);
    }
  };

  window.initAnalyticsEvents = function () {
    document.addEventListener('click', event => {
      const target = event.target.closest('[data-analytics]');
      if (!target) return;
      window.cyberShelfAnalytics.track(target.dataset.analytics, { label: target.textContent.trim(), href: target.getAttribute('href') || '' });
    });
    const search = document.getElementById('searchInput');
    search?.addEventListener('change', () => { if (search.value.trim()) window.cyberShelfAnalytics.track('search', { query: search.value.trim() }); });
  };
})();
