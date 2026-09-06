const loadPartial = async (id, url) => {
  try {
    const el = document.getElementById(id);
    if (!el) return null;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    el.innerHTML = await res.text();
    return el;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// 📱 منوی موبایل
