// بارگذاری partial ها
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

// منوی موبایل
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      mobileMenu.classList.add('backdrop-blur-md', 'border-green-500', 'animate-pulse');
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

// دکمه Back to Top (با throttle ساده)
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

// ترمینال
function initHomeTerminal() {
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  if (!terminalOutput || !terminalInput) return;

  const commands = [
    { cmd: "whoami", output: "User: Hacker" },
    { cmd: "ls", output: "Windows-API-Introduction.pdf, AVEDR-Evasion-Practical-Techniques.pdf, Malware-Analysis-Introduction.pdf, Offensive-Development-Introduction.pdf" },
    { cmd: "pwd", output: "/home/hacker/CyberShelf" },
    { cmd: "cat Windows-API-Introduction.pdf", output: "مجموعه کتاب های هک و امنیت برای هکرهای واقعی" },
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
      } else {
        callback();
      }
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

// مدیریت hash
function handleHashChange() {
  const sections = ['home', 'shop', 'faq', 'contact', 'about', 'books-en'];
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

// شروع
const init = async () => {
  await loadPartial('header', 'partials/header.html');
  initMobileMenu();

  await Promise.allSettled([
    loadPartial('home', 'partials/home.html'),
    loadPartial('shop', 'partials/shop.html'),
    loadPartial('books-en', 'partials/books-en.html'),
    loadPartial('faq', 'partials/faq.html'),
    loadPartial('contact', 'partials/contact.html'),
    loadPartial('about', 'partials/about.html'), // 🔥 اضافه شد
    loadPartial('footer', 'partials/footer.html')
  ]);

  handleHashChange();
  initBackToTop();
  initHomeTerminal();
};

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
