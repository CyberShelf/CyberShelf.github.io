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
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
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
