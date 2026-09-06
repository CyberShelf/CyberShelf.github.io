window.cyberShelfPurchase = Object.freeze({
  contactUrl: 'contact/'
});

window.initPurchaseFlow = function (root) {
  const detail = (root || document).querySelector('.book-detail');
  if (!detail || detail.querySelector('[data-purchase-panel]') || detail.querySelector('a[download]')) return;
  const sidebar = detail.querySelector('.lg\\:col-span-1');
  if (!sidebar) return;
  const panel = document.createElement('aside');
  panel.dataset.purchasePanel = '';
  panel.className = 'purchase-panel';
  panel.innerHTML = '<h2>مشاوره و ثبت سفارش</h2><p>درخواست خود را ارسال کنید تا برای انتخاب کتاب و هماهنگی ارسال با شما در ارتباط باشیم.</p><a class="cta cta-primary" data-analytics="click_buy_book">ثبت درخواست خرید</a>';
  const bookTitle = detail.querySelector('h1')?.textContent?.trim() || '';
  panel.querySelector('a').href = `${window.cyberShelfPurchase.contactUrl}?book=${encodeURIComponent(bookTitle)}`;
  sidebar.appendChild(panel);
};
