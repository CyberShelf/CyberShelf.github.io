// تابع بارگذاری partial ها
const loadPartial = async (id, url) => {
  const el = document.getElementById(id);
  const res = await fetch(url);
  el.innerHTML = await res.text();

  // اجرای script های داخل partial
  el.querySelectorAll("script").forEach(oldScript => {
    const newScript = document.createElement("script");
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    document.body.appendChild(newScript);
    oldScript.remove();
  });

  return el;
};

// فعال‌سازی منوی موبایل
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');

      // افکت هکری/نئونی با transition
      if (!isOpen) {
        mobileMenu.classList.add('backdrop-blur-md', 'border-green-500', 'animate-pulse');
        setTimeout(() => mobileMenu.classList.remove('animate-pulse'), 300);
      }

      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// دکمه Back to Top
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ترمینال hero با تایپ خودکار
function initHeroTerminal() {
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

// مدیریت نمایش بخش‌ها بر اساس hash
function handleHashChange() {
  const hash = window.location.hash;
  // const sectionsToHide = ['hero', 'shop', 'articles', 'faq', 'contact'];

  const sectionsToHide = ['hero', 'shop', 'faq', 'contact'];


  if (hash.startsWith('#/book/')) {
    sectionsToHide.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });

    const bookId = hash.split('/')[2];
    loadPartial('chapters', `book-details/${bookId}.html`).then(() => {
      const chapters = document.getElementById('chapters');
      if(chapters) chapters.style.display = 'block';
    });

    document.getElementById('header').style.display = 'block';
    document.getElementById('footer').style.display = 'block';
  } else {
    sectionsToHide.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.display = 'block';
    });

    const chapters = document.getElementById('chapters');
    if(chapters) chapters.style.display = 'none';
  }
}

// تابع اصلی لود همه partial ها و init
const init = async () => {
  await loadPartial('header', 'partials/header.html');
  initMobileMenu();

  await Promise.all([
    loadPartial('hero', 'partials/hero.html'),
    // loadPartial('articles', 'partials/articles.html'),
    loadPartial('shop', 'partials/shop.html'),
    loadPartial('faq', 'partials/faq.html'),
    loadPartial('contact', 'partials/contact.html'),
    loadPartial('footer', 'partials/footer.html')
  ]);

  handleHashChange();
  initBackToTop();
  initHeroTerminal();
};

// Event listener
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', init);
