import { readFile, writeFile, mkdir } from 'node:fs/promises';

const channelUrl = process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/s/cybershelf';
const output = new URL('../data/telegram-posts.json', import.meta.url);
const decode = value => value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const response = await fetch(channelUrl, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; CyberShelf-feed-cache/1.0)' } });
if (!response.ok) throw new Error(`Channel request failed: ${response.status}`);
const html = await response.text();
const messages = [...html.matchAll(/<div class="tgme_widget_message_wrap[\s\S]*?(?=<div class="tgme_widget_message_wrap|<div class="tgme_footer)/gi)];
let posts = messages.map(([block]) => {
  const postId = block.match(/data-post="([^"]+)"/i)?.[1] || '';
  const rawText = block.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
  const publishedAt = block.match(/datetime="([^"]+)"/i)?.[1] || null;
  const imageUrl = block.match(/background-image\s*:\s*url\(['"]?([^'"\)]+)['"]?\)/i)?.[1]?.replace(/&amp;/g, '&') || null;
  const excerpt = decode(rawText).slice(0, 180);
  return { title: excerpt.slice(0, 80) || 'پست تلگرام', excerpt, url: postId ? `https://t.me/${postId}` : '', imageUrl, publishedAt };
}).filter(post => post.url && post.excerpt).slice(-6).reverse();
if (!posts.length) throw new Error('Channel contained no valid posts; existing cache was preserved.');
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
const imageDirectory = new URL('../assets/images/telegram/', import.meta.url);
await mkdir(imageDirectory, { recursive: true });
posts = await Promise.all(posts.map(async post => {
  if (!post.imageUrl) return post;
  try {
    const imageResponse = await fetch(post.imageUrl, { headers: { referer: channelUrl } });
    if (!imageResponse.ok) return post;
    const contentType = imageResponse.headers.get('content-type') || '';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const postNumber = post.url.split('/').pop().replace(/[^0-9]/g, '');
    const fileName = `cybershelf-${postNumber}.${extension}`;
    await writeFile(new URL(fileName, imageDirectory), Buffer.from(await imageResponse.arrayBuffer()));
    return { ...post, imageUrl: `assets/images/telegram/${fileName}` };
  } catch (_) {
    return post;
  }
}));
await writeFile(output, JSON.stringify({ updatedAt: new Date().toISOString(), source: channelUrl, posts }, null, 2) + '\n', 'utf8');
console.log(`Cached ${posts.length} Telegram posts.`);
