window.cyberShelfPurchase = Object.freeze({
  contactUrl: 'https://t.me/cybershelf'
});

window.initPurchaseFlow = function (root) {
  const detail = (root || document).querySelector('.book-detail');
  if (!detail || detail.querySelector('[data-purchase-panel]') || detail.querySelector('a[download]')) return;
  const sidebar = detail.querySelector('.lg\\:col-span-1');
  if (!sidebar) return;
  const panel = document.createElement('aside');
  panel.dataset.purchasePanel = '';
  panel.className = 'purchase-panel';
  panel.innerHTML = '<h2>خرید کتاب</h2><p>برای ثبت سفارش، عنوان کتاب را از طریق کانال رسمی سایبر شلف ارسال کنید. اطلاعات پرداخت در این وب‌سایت دریافت نمی‌شود.</p><a class="cta cta-primary" target="_blank" rel="noopener noreferrer" data-analytics="click_buy_book">ثبت سفارش در تلگرام</a>';
  panel.querySelector('a').href = window.cyberShelfPurchase.contactUrl;
  sidebar.appendChild(panel);
};
