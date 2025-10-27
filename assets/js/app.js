// 📦 بارگذاری partialها
const loadPartial = async (id, url) => {
  try {
    const el = document.getElementById(id);
    if (!el) return null;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    el.innerHTML = await res.text();

    // اجرای دوباره اسکریپت‌ها
    el.querySelectorAll("script").forEach(script => {
      const newScript = document.createElement("script");
      if (script.src) newScript.src = script.src;
      else newScript.textContent = script.textContent;
      script.replaceWith(newScript);
    });

    return el;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// 📱 منوی موبایل
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      mobileMenu.classList.add('animate-pulse');
      setTimeout(() => mobileMenu.classList.remove('animate-pulse'), 300);
    }
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ⬆️ دکمه بازگشت به بالا
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        btn.classList.toggle('show', window.scrollY > 300);
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 💻 ترمینال صفحه اصلی
function initHomeTerminal() {
  const terminalOutput = document.getElementById('terminal-output');
  if (!terminalOutput) return;

  const commands = [
    { cmd: "whoami", output: "User: Hacker" },
    { cmd: "ls", output: "Windows-API-Introduction.pdf, AVEDR-Evasion-Practical-Techniques.pdf, Malware-Analysis-Introduction.pdf, Offensive-Development-Introduction.pdf" },
    { cmd: "pwd", output: "/home/hacker/CyberShelf" },
    { cmd: "cat Windows-API-Introduction.pdf", output: "مجموعه کتاب‌های امنیت و توسعه آفنسیو برای هکرهای واقعی" },
    { cmd: "echo 'Happy Hacking!'", output: "Happy Hacking!" }
  ];

  let currentCommand = 0;

  function typeCommand(command, callback) {
    let i = 0;
    const line = document.createElement('div');
    line.style.direction = 'ltr';
    terminalOutput.appendChild(line);

    function typeChar() {
      if (i < command.length) {
        line.textContent += command[i];
        i++;
        setTimeout(typeChar, 100);
      } else callback();
    }
    typeChar();
  }

  function executeNextCommand() {
    if (currentCommand >= commands.length) return;
    const { cmd, output } = commands[currentCommand];

    typeCommand(`$ ${cmd}`, () => {
      if (output) {
        const outputLine = document.createElement('div');
        outputLine.style.direction = 'ltr';
        outputLine.textContent = output;
        terminalOutput.appendChild(outputLine);
      }
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      currentCommand++;
      setTimeout(executeNextCommand, 800);
    });
  }

  setTimeout(executeNextCommand, 1000);
}

// 🔄 تغییر hash
function handleHashChange() {
  const sections = ['home', 'shop', 'faq', 'contact', 'about', 'books-en', 'tools', 'telegram'];
  const books = document.getElementById('books');

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
    });
  } else {
    show(sections);
    if (books) books.style.display = 'none';
  }
}


// --------- بارگذاری ۵ پست آخر تلگرام (RSS via AllOrigins proxy) ----------
async function loadTelegramPosts() {
  const container = document.getElementById('telegram-posts');
  if (!container) return;

  const rssUrl = 'https://rsshub.app/telegram/channel/cybershelf?limit=6';
  const proxies = [
    'https://corsproxy.io/?' + encodeURIComponent(rssUrl),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl),
    'https://thingproxy.freeboard.io/fetch/' + rssUrl, // fallback proxy
  ];

  try {
    // fetch with multiple proxies
    let res = null;
    for (const proxy of proxies) {
      try {
        res = await fetch(proxy);
        if (res && res.ok) break;
      } catch (e) {
        // next proxy
      }
    }
    if (!res || !res.ok) throw new Error('نتوانستم داده‌ها را دریافت کنم');

    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('خطا در پارس XML');

    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
    if (items.length === 0) {
      container.innerHTML = `<p class="text-slate-400 col-span-full text-center">هیچ پستی یافت نشد.</p>`;
      return;
    }

    function extractImageFromItem(item) {
      // 1) try media:content (common in some feeds)
      const media = item.querySelector('media\\:content, content, media\\:thumbnail, thumbnail');
      if (media) {
        // many media tags use 'url' or 'src' or have a child <url>
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
        // prefer <img> with src
        const img = htmlDesc.querySelector('img');
        if (img) {
          // data-src fallback for lazy images
          return img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original') || null;
        }

        // sometimes image is inside <a href="...">
        const aWithImgUrl = htmlDesc.querySelector('a[href]');
        if (aWithImgUrl) {
          const href = aWithImgUrl.getAttribute('href');
          if (/\.(jpe?g|png|gif|webp|svg)$/i.test(href)) return href;
        }

        // fallback: search for any http(s) link that ends with image ext
        const regex = /https?:\/\/[^\s"'<>]+?\.(?:jpe?g|png|gif|webp|svg)(\?[^"'<>]*)?/i;
        const m = rawDesc.match(regex);
        if (m) return m[0];
      }

      // 4) last fallback: try to find <link> or guid that points to telegram post (no direct image) -> return default
      return null;
    }

    container.innerHTML = items.map(item => {
      const title = item.querySelector('title')?.textContent?.trim() || 'بدون عنوان';
      const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('guid')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || '';

      // description raw and parsed text (keep emojis)
      const descNode = item.querySelector('description') || item.querySelector('content\\:encoded');
      const rawDesc = descNode ? (descNode.textContent || descNode.innerHTML || '') : '';
      const parsed = new DOMParser().parseFromString(rawDesc, 'text/html');
      const cleanText = (parsed.body && parsed.body.textContent) ? parsed.body.textContent.trim() : rawDesc.replace(/<[^>]*>/g, '').trim();
      const shortText = cleanText.length > 150 ? cleanText.slice(0, 150) + '...' : cleanText;

      // extract image
      let imgSrc = extractImageFromItem(item) || 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';

      // ensure absolute URL if needed (optional): if imgSrc is relative, try to prepend protocol+host from rssUrl
      try {
        // validate url
        new URL(imgSrc);
      } catch (e) {
        // not a valid absolute URL -> fallback to default
        imgSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
      }

      const dateHtml = pubDate ? `<span class="text-xs text-slate-500">${new Date(pubDate).toLocaleDateString('fa-IR')}</span>` : '';

      return `
        <article class="post-card p-5 border border-slate-700 rounded-2xl bg-slate-900 hover:shadow-lg hover:shadow-cyan-500/40 hover:border-cyan-500 transform transition duration-300">
          <img src="${imgSrc}" alt="${title}" class="w-full h-52 object-cover rounded-xl mb-4 border border-slate-700" onerror="this.onerror=null;this.src='https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'">
          <h3 class="font-bold text-base text-emerald-300 mb-3 line-clamp-2">${title}</h3>
          <p class="text-sm text-slate-400 mb-4 flex-grow line-clamp-3">${shortText}</p>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-slate-700">
            <a href="${link}" target="_blank" rel="noopener" class="text-teal-400 font-semibold hover:text-cyan-400 transition text-sm">مشاهده در تلگرام </a>
            ${dateHtml}
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-red-400 col-span-full text-center">❌ خطا در بارگذاری پست‌ها<br><small>${err.message}</small></p>`;
  }
}

// 🚀 شروع برنامه
const init = async () => {
   initMobileMenu();
  await Promise.allSettled([
    loadPartial('home', 'partials/home.html'),
    loadPartial('shop', 'partials/shop.html'),
    loadPartial('telegram', 'partials/telegram.html'),
    loadPartial('books-en', 'partials/books-en.html'),
    loadPartial('tools', 'partials/tools.html'),
    loadPartial('faq', 'partials/faq.html'),
    loadPartial('contact', 'partials/contact.html'),
    loadPartial('about', 'partials/about.html'),
    loadPartial('footer', 'partials/footer.html')
  ]);

  // اگر partial telegram دارید و آن را در لیست بالا اضافه کردید،
  // می‌توانید قبل از این خط loadTelegramPosts را اجرا کنید.
  await loadTelegramPosts();

  handleHashChange();
  initBackToTop();
  initHomeTerminal();
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
