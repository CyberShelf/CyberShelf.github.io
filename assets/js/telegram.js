async function loadTelegramPosts() {
  const container = document.getElementById('telegram-posts');
  if (!container) return;

  const rssUrl = 'https://rsshub.app/telegram/channel/cybershelf?limit=6';
  const rssPath = rssUrl.replace(/^https?:\/\//, '');
  const sources = [
    rssUrl,
    'https://r.jina.ai/http://' + rssPath,
    'https://corsproxy.io/?' + encodeURIComponent(rssUrl),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl),
    'https://thingproxy.freeboard.io/fetch/' + rssUrl, // fallback proxy
  ];
  const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
  const allowedProtocols = new Set(['http:', 'https:']);

  const safeUrl = raw => {
    if (!raw) return null;
    try {
      const url = new URL(raw, window.location.origin);
      if (!allowedProtocols.has(url.protocol)) return null;
      return url.href;
    } catch (e) {
      return null;
    }
  };

  try {
    // fetch with multiple sources (prefer direct, then proxies)
    let res = null;
    for (const src of sources) {
      try {
        res = await fetch(src);
        if (res && res.ok) break;
      } catch (e) {
        // next source
      }
    }
    if (!res || !res.ok) throw new Error('Failed to load Telegram posts.');

    const text = await res.text();
    const parser = new DOMParser();
    let xml = parser.parseFromString(text, 'application/xml');
    if (xml.querySelector('parsererror')) {
      xml = parser.parseFromString(text, 'text/html');
    }

    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
    if (items.length === 0) {
      container.innerHTML = '<div class="col-span-full min-h-[200px] flex items-center justify-center text-center text-slate-400">پستی یافت نشد.</div>';
      return;
    }

    function extractImageFromItem(item) {
      // 1) try media:content (common in some feeds)
      const media = item.querySelector('media\\:content, content, media\\:thumbnail, thumbnail');
      if (media) {
        const url = media.getAttribute?.('url') || media.getAttribute?.('src') || media.textContent || null;
        if (url) return url;
      }

      // 2) try enclosure tag (often used for attachments)
      const enclosure = item.querySelector('enclosure');
      if (enclosure) {
        const url = enclosure.getAttribute('url');
        if (url) return url;
      }

      // 3) parse description HTML and look for <img> or data-src
      const descNode = item.querySelector('description') || item.querySelector('content\\:encoded');
      const rawDesc = descNode ? descNode.textContent || descNode.innerHTML || '' : '';

      if (rawDesc) {
        const htmlDesc = new DOMParser().parseFromString(rawDesc, 'text/html');
        const img = htmlDesc.querySelector('img');
        if (img) {
          return img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || null;
        }

        const aWithImgUrl = htmlDesc.querySelector('a[href]');
        if (aWithImgUrl) {
          const href = aWithImgUrl.getAttribute('href');
          if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) return href;
        }

        const regex = /https?:\/\/[^\s"'<>]+?\.(?:jpe?g|png|gif|webp|svg)(\?[^"'<>]*)?/i;
        const m = rawDesc.match(regex);
        if (m) return m[0];
      }

      return null;
    }

    const frag = document.createDocumentFragment();
    items.forEach(item => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Untitled post';
      const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('guid')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      const descNode = item.querySelector('description') || item.querySelector('content\\:encoded');
      const rawDesc = descNode ? (descNode.textContent || descNode.innerHTML || '') : '';
      const parsed = new DOMParser().parseFromString(rawDesc, 'text/html');
      const cleanText = (parsed.body && parsed.body.textContent) ? parsed.body.textContent.trim() : rawDesc.replace(/<[^>]*>/g, '').trim();
      const shortText = cleanText.length > 150 ? cleanText.slice(0, 150) + '...' : cleanText;

      const imgCandidate = extractImageFromItem(item);
      const imgSrc = safeUrl(imgCandidate) || fallbackImage;
      const linkHref = safeUrl(link);

      const article = document.createElement('article');
      article.className = 'post-card p-5 border border-slate-700 rounded-2xl bg-slate-900 hover:shadow-lg hover:shadow-cyan-500/40 hover:border-cyan-500 transform transition duration-300';

      const img = document.createElement('img');
      img.setAttribute('data-lazy', '');
      img.src = imgSrc;
      img.alt = title;
      img.className = 'w-full h-52 object-cover rounded-xl mb-4 border border-slate-700';
      img.onerror = () => { img.onerror = null; img.src = fallbackImage; };

      const h3 = document.createElement('h3');
      h3.className = 'font-bold text-base text-emerald-300 mb-3 line-clamp-2';
      h3.textContent = title;

      const p = document.createElement('p');
      p.className = 'text-sm text-slate-400 mb-4 flex-grow line-clamp-3';
      p.textContent = shortText;

      const footer = document.createElement('div');
      footer.className = 'flex justify-between items-center mt-auto pt-4 border-t border-slate-700';

      const a = document.createElement('a');
      a.className = 'text-teal-400 font-semibold hover:text-cyan-400 transition text-sm';
      a.textContent = 'Open in Telegram';
      if (linkHref) {
        a.href = linkHref;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.href = '#';
      }

      const dateSpan = document.createElement('span');
      dateSpan.className = 'text-xs text-slate-500';
      if (pubDate) {
        dateSpan.textContent = new Date(pubDate).toLocaleDateString('fa-IR');
      }

      footer.appendChild(a);
      if (pubDate) footer.appendChild(dateSpan);

      article.appendChild(img);
      article.appendChild(h3);
      article.appendChild(p);
      article.appendChild(footer);
      frag.appendChild(article);
    });

    container.innerHTML = '';
    container.appendChild(frag);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="col-span-full min-h-[200px] flex items-center justify-center text-center text-slate-400">❌ خطا در بارگذاری پست‌ها</div>';
  }
}
