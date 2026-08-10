#!/usr/bin/env node
// Regenerates the featured card + "All posts" grid in blog/index.html from
// the <meta name="post:*"> tags in each blog/*.html post file.
//
// Run it after adding, editing, or deleting a post:
//   node scripts/build-blog-index.js
//
// CI (.github/workflows/sync-gh-pages.yml) runs this automatically on every
// push to main and commits the result, so in practice you rarely need to
// run it by hand — it's here mainly for local preview.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const THUMB_DIR = path.join(ROOT, 'images', 'blog_thumbs');
const INDEX_PATH = path.join(BLOG_DIR, 'index.html');

const KNOWN_TYPES = [
  'Notes', 'Research', 'Field Notes', 'Paper Breakdowns',
  'Tooling & Reproducibility', 'Career Notes', 'Data Diaries',
  'Explainers', 'Commentary',
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DEFAULT_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2 2 7v10l10 5 10-5V7L12 2zm0 2.24L18.5 8 12 11.76 5.5 8 12 4.24zM4 9.5l7 3.7v7.6l-7-3.5v-7.8zm9 11.3v-7.6l7-3.7v7.8l-7 3.5z"/></svg>';

function decodeAttr(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function readMeta(html, name) {
  const match = html.match(new RegExp(`<meta\\s+name="post:${name}"\\s+content="([^"]*)"`, 'i'));
  return match ? decodeAttr(match[1]) : null;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatShortDate(iso) {
  const [year, month] = iso.split('-');
  return `${MONTHS_SHORT[Number(month) - 1]} ${year}`;
}

function formatLongDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${Number(day)} ${MONTHS_LONG[Number(month) - 1]} ${year}`;
}

function thumbFileFor(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year.slice(2)}.webp`;
}

function loadPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html') && f !== 'index.html');
  const posts = [];

  for (const file of files) {
    const html = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const date = readMeta(html, 'date');
    if (!date) continue; // no post: metadata — not a post page, skip it

    const type = readMeta(html, 'type');
    const title = readMeta(html, 'title');
    const excerpt = readMeta(html, 'excerpt');
    const readtime = readMeta(html, 'readtime');

    const missing = ['type', 'title', 'excerpt', 'readtime'].filter((field) => !readMeta(html, field));
    if (missing.length) {
      throw new Error(`${file}: missing post:${missing.join(', post:')} metadata`);
    }
    if (!KNOWN_TYPES.includes(type)) {
      console.warn(`Warning: ${file} has post:type="${type}", which isn't in the Type filter's option list.`);
    }

    posts.push({ slug: file, title, type, date, readtime, excerpt });
  }

  if (posts.length === 0) {
    throw new Error('No post files found (looked for post:date metadata in blog/*.html).');
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

function cardCover(post) {
  const thumbFile = thumbFileFor(post.date);
  const exists = fs.existsSync(path.join(THUMB_DIR, thumbFile));
  return exists
    ? `<img src="../images/blog_thumbs/${thumbFile}" alt="${escapeHtml(post.title)}" loading="lazy">`
    : DEFAULT_ICON;
}

function renderFeatured(post) {
  return [
    '      <a class="blog-card featured-post" href="' + post.slug + '">',
    '        <div class="blog-card-cover">',
    '          ' + cardCover(post),
    '        </div>',
    '        <div class="blog-card-body">',
    `          <div class="blog-meta"><span class="tag">${escapeHtml(post.type)}</span><span>${formatLongDate(post.date)} · ${escapeHtml(post.readtime)}</span></div>`,
    `          <h3>${escapeHtml(post.title)}</h3>`,
    `          <p>${escapeHtml(post.excerpt)}</p>`,
    '          <span class="blog-read-more">Read post →</span>',
    '        </div>',
    '      </a>',
  ].join('\n');
}

function renderGridCard(post) {
  return [
    `        <a class="blog-card" href="${post.slug}" data-type="${escapeHtml(post.type)}" data-date="${post.date}">`,
    '          <div class="blog-card-cover">',
    '            ' + cardCover(post),
    '          </div>',
    '          <div class="blog-card-body">',
    `            <div class="blog-meta"><span class="tag">${escapeHtml(post.type)}</span><span>${formatShortDate(post.date)}</span></div>`,
    `            <h3>${escapeHtml(post.title)}</h3>`,
    `            <p>${escapeHtml(post.excerpt)}</p>`,
    '            <span class="blog-read-more">Read post →</span>',
    '          </div>',
    '        </a>',
  ].join('\n');
}

function replaceBetween(html, marker, content) {
  const pattern = new RegExp(`(<!-- ${marker}:START -->)[\\s\\S]*?(<!-- ${marker}:END -->)`);
  if (!pattern.test(html)) {
    throw new Error(`blog/index.html: couldn't find ${marker}:START/END markers`);
  }
  return html.replace(pattern, `$1\n${content}\n      $2`);
}

function main() {
  const posts = loadPosts();
  const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');

  let updated = replaceBetween(indexHtml, 'BLOG_FEATURED', renderFeatured(posts[0]));
  updated = replaceBetween(updated, 'BLOG_GRID', posts.map(renderGridCard).join('\n\n'));

  if (updated === indexHtml) {
    console.log('blog/index.html already up to date.');
    return;
  }

  fs.writeFileSync(INDEX_PATH, updated);
  console.log(`blog/index.html regenerated (${posts.length} post${posts.length === 1 ? '' : 's'}).`);
}

main();
