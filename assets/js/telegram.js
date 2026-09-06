async function loadTelegramPosts() {
  const container = document.getElementById('telegram-posts');
  if (!container) return;

  const escapeText = value => String(value || '');
  const safeUrl = value => {
    try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch (_) { return ''; }
  };

  try {
    const response = await fetch('data/telegram-posts.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Telegram cache unavailable');
    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts.slice(0, 6) : [];
    if (!posts.length) throw new Error('Telegram cache is empty');

    const fragment = document.createDocumentFragment();
    posts.forEach(post => {
      const article = document.createElement('article');
      article.className = 'post-card p-5 border border-slate-700 rounded-2xl bg-slate-900 flex flex-col';
      const title = document.createElement('h3');
      title.className = 'font-bold text-base text-emerald-300 mb-3 line-clamp-2';
      title.textContent = escapeText(post.title) || 'پست تلگرام';
      const excerpt = document.createElement('p');
      excerpt.className = 'text-sm text-slate-400 mb-4 flex-grow line-clamp-3';
      excerpt.textContent = escapeText(post.excerpt);
      const link = document.createElement('a');
      link.className = 'text-teal-400 font-semibold mt-auto';
      link.textContent = 'مشاهده در تلگرام';
      link.href = safeUrl(post.url) || 'https://t.me/cybershelf';
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.dataset.analytics = 'subscribe_or_join_telegram';
      article.append(title, excerpt, link);
      fragment.appendChild(article);
    });
    container.replaceChildren(fragment);
  } catch (error) {
    container.innerHTML = '<div class="telegram-fallback"><h3>آخرین مطالب در کانال سایبر شلف</h3><p>در حال حاضر نمایش خودکار پست‌ها در دسترس نیست؛ محتوای سایت بدون اختلال قابل استفاده است.</p><a href="https://t.me/cybershelf" target="_blank" rel="noopener noreferrer" data-analytics="subscribe_or_join_telegram">مشاهده کانال تلگرام</a></div>';
  }
}
