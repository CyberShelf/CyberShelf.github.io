import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  if (['.git', 'node_modules'].includes(entry.name)) return [];
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});
const htmlFiles = walk(root).filter(file => file.endsWith('.html'));
const documents = htmlFiles.filter(file => /^<!doctype html>/i.test(fs.readFileSync(file, 'utf8')));
const documentCanonicals = new Set();

const localTarget = (file, value) => {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || /^(?:[a-z]+:|\/\/|#)/i.test(value)) return null;
  let target;
  try { target = path.resolve(path.dirname(file), decodeURIComponent(clean)); }
  catch { failures.push(`${path.relative(root, file)}: URL نامعتبر ${value}`); return null; }
  if (clean.endsWith('/')) target = path.join(target, 'index.html');
  return target;
};

for (const file of documents) {
  const relative = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const titleCount = (html.match(/<title>[^<]+<\/title>/gi) || []).length;
  const descriptionCount = (html.match(/<meta name="description" content="[^"]+">/gi) || []).length;
  const canonicalCount = (html.match(/<link rel="canonical" href="[^"]+">/gi) || []).length;
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  if (titleCount !== 1) failures.push(`${relative}: تعداد title برابر ${titleCount}`);
  if (descriptionCount !== 1) failures.push(`${relative}: تعداد description برابر ${descriptionCount}`);
  if (canonicalCount !== 1) failures.push(`${relative}: تعداد canonical برابر ${canonicalCount}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  if (canonical) documentCanonicals.add(canonical);
  if (h1Count !== 1) failures.push(`${relative}: تعداد H1 برابر ${h1Count}`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicates.length) failures.push(`${relative}: id تکراری ${duplicates.join(', ')}`);

  for (const match of html.matchAll(/\s(?:href|src|action)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !fs.existsSync(target)) failures.push(`${relative}: مسیر شکسته ${match[1]}`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch { failures.push(`${relative}: JSON-LD نامعتبر`); }
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = new Set();
for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  sitemapUrls.add(url);
  const pathname = new URL(url).pathname.replace(/^\//, '');
  const target = path.join(root, pathname || 'index.html', pathname.endsWith('/') ? 'index.html' : '');
  if (!fs.existsSync(target)) failures.push(`sitemap.xml: مسیر شکسته ${url}`);
}
for (const canonical of documentCanonicals) {
  if (!sitemapUrls.has(canonical)) failures.push(`sitemap.xml: canonical ثبت نشده ${canonical}`);
}
for (const url of sitemapUrls) {
  if (!documentCanonicals.has(url)) failures.push(`sitemap.xml: URL بدون canonical متناظر ${url}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Audit passed: ${documents.length} document, no broken internal links or metadata errors.`);
