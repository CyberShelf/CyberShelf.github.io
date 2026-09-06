const CYBERSHELF_BOOKS = Object.freeze({
  'AVEDR-Evasion-Practical-Techniques': { title: 'تکنیک‌های عملی فرار از AV/EDR', path: 'Red Team و امنیت ویندوز' },
  'Introduction-to-BugBounty': { title: 'مقدمه‌ای بر Bug Bounty', path: 'Bug Bounty' },
  'Malware-Analysis-Introduction': { title: 'مقدمه‌ای بر تحلیل بدافزار', path: 'Malware Analysis' },
  'Offensive-Development-Introduction': { title: 'مقدمه‌ای بر توسعه تهاجمی', path: 'Red Team و توسعه ویندوز' },
  'RedTeam-Operation-Management': { title: 'مدیریت عملیات تیم قرمز', path: 'Red Team' },
  'Windows-API-Introduction': { title: 'مقدمه‌ای بر Windows API برای تیم قرمز', path: 'امنیت ویندوز و Red Team' }
});

function initBookDetails(root, bookId) {
  const detail = root?.querySelector('.book-detail');
  if (!detail || detail.dataset.enhanced === 'true') return;
  detail.dataset.enhanced = 'true';
  const book = CYBERSHELF_BOOKS[bookId] || { title: bookId.replace(/-/g, ' '), path: 'امنیت سایبری' };
  document.title = `${book.title} | سایبر شلف`;

  const header = document.createElement('header');
  header.className = 'book-detail-header';
  header.innerHTML = '<nav aria-label="مسیر صفحه"><a href="#shop">کتاب‌های فارسی</a><span aria-hidden="true">/</span><span>معرفی کتاب</span></nav><p class="eyebrow"></p><h1></h1><p class="book-detail-lead">مشخصات، مخاطبان، محتوای آموزشی و سرفصل‌ها را پیش از انتخاب بررسی کنید.</p>';
  header.querySelector('.eyebrow').textContent = book.path;
  header.querySelector('h1').textContent = book.title;
  detail.prepend(header);

  const sidebar = detail.querySelector('.lg\\:col-span-1');
  const content = detail.querySelector('.lg\\:col-span-2');
  sidebar?.classList.add('book-sidebar');
  content?.classList.add('book-content');
  const sidebarBoxes = sidebar
    ? Array.from(sidebar.children).filter(el => el.matches('div.w-full') && !el.classList.contains('image-ribbon-container'))
    : [];
  sidebarBoxes[0]?.classList.add('book-price-box');
  const metadata = sidebarBoxes.find(el => el.querySelector('.book-meta-label')) || sidebarBoxes[sidebarBoxes.length - 1];
  if (metadata) {
    metadata.classList.add('book-metadata');
    if (!metadata.querySelector('h2')) metadata.insertAdjacentHTML('afterbegin', '<h2>مشخصات کتاب</h2>');
  }

  const tabList = detail.querySelector('#tabs');
  const buttons = Array.from(detail.querySelectorAll('.tab-btn'));
  const panels = Array.from(detail.querySelectorAll('.tab-content'));
  if (tabList) tabList.setAttribute('role', 'tablist');
  const activate = button => {
    buttons.forEach(item => { const selected = item === button; item.classList.toggle('active-tab', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    panels.forEach(panel => { const visible = panel.id === `tab-${button.dataset.tab}`; panel.classList.toggle('hidden', !visible); panel.hidden = !visible; });
  };
  buttons.forEach((button, index) => {
    const panel = detail.querySelector(`#tab-${button.dataset.tab}`);
    button.type = 'button'; button.setAttribute('role', 'tab'); button.id = `book-tab-${button.dataset.tab}`; button.setAttribute('aria-controls', panel?.id || '');
    if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id); }
    button.addEventListener('click', () => activate(button));
    button.addEventListener('keydown', event => { if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return; event.preventDefault(); const direction = event.key === 'ArrowRight' ? -1 : 1; const next = buttons[(index + direction + buttons.length) % buttons.length]; activate(next); next.focus(); });
  });
  if (buttons[0]) activate(buttons[0]);

  const about = detail.querySelector('#tab-about');
  if (about && !about.querySelector('.panel-title')) about.insertAdjacentHTML('afterbegin', '<h2 class="panel-title">معرفی کتاب</h2>');
  const toc = detail.querySelector('#tab-toc');
  if (toc && !toc.querySelector('.panel-title')) toc.insertAdjacentHTML('afterbegin', '<div class="toc-header"><h2 class="panel-title">فهرست مطالب</h2><p>برای مشاهده ریزموضوعات، هر فصل را باز کنید.</p></div>');
  detail.querySelectorAll('#tab-toc .toc-chapter').forEach((chapter, index) => {
    const list = chapter.querySelector(':scope > ul');
    const title = Array.from(chapter.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).filter(Boolean).join(' ');
    const wrapper = document.createElement('details'); wrapper.className = 'toc-section'; if (index === 0) wrapper.open = true;
    const summary = document.createElement('summary'); summary.innerHTML = `<span class="toc-number">${String(index + 1).padStart(2, '0')}</span><span>${title || `فصل ${index + 1}`}</span><span class="toc-count">${list?.children.length || 0} موضوع</span>`;
    wrapper.appendChild(summary); if (list) wrapper.appendChild(list); chapter.replaceWith(wrapper);
  });
}
