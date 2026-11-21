import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL('../public/', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const html = read('index.html');

test('Cloudflare publish directory has the original site and favicon', () => {
  assert.ok(existsSync(new URL('favicon.ico', root)));
  assert.match(html, /<title>Brittney Michelle \| Writer\. Director\. Producer\.<\/title>/);
  assert.match(html, /There's a story/);
});

test('Every internal anchor has a matching section', () => {
  const links = [...html.matchAll(/href="#([a-z-]+)"/g)].map(m => m[1]);
  assert.ok(links.length >= 5);
  for (const id of links) assert.match(html, new RegExp(`id="${id}"`), `Missing #${id}`);
});

test('Original site sections and project content are preserved', () => {
  for (const section of ['home', 'services', 'work', 'about', 'contact']) {
    assert.match(html, new RegExp(`id="${section}"`));
  }
  for (const title of ['FRIENDSGIVING', "USHER'S NEW LOOK", 'DETROIT 313 DAY', 'JOURNEY IN THE DREAM', 'Professional Experience']) {
    assert.ok(html.includes(title), `Missing ${title}`);
  }
  assert.match(html, /@media\(max-width:760px\)/);
  assert.match(html, /aria-label="Main navigation"/);
});

test('Test release marker is visible as a static endpoint', () => {
  const release = JSON.parse(read('release.json'));
  assert.match(release.version, /^starter-v[1-9]\d*$/, 'Release marker must be a starter version');
  assert.equal(release.status, 'test');
});

test('Cloudflare security headers and test-only noindex are present', () => {
  const headers = read('_headers');
  for (const item of ['X-Content-Type-Options: nosniff', 'Referrer-Policy:', 'X-Frame-Options: DENY', 'X-Robots-Tag: noindex, nofollow']) {
    assert.ok(headers.includes(item), `Missing header ${item}`);
  }
  assert.match(read('robots.txt'), /Disallow: \//);
});

test('No broken local external resources in HTML', () => {
  const sources = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  for (const src of sources) {
    if (src.startsWith('#') || src.startsWith('mailto:') || /^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
    const file = src.split(/[?#]/)[0].replace(/^\//, '');
    if (!file) continue;
    assert.ok(existsSync(new URL(file, root)), `Unresolved resource: ${src}`);
  }
});

test('Placeholder contact email is guarded rather than sent', () => {
  assert.match(html, /mailto:hello@example\.com/);
  assert.match(html, /event\.preventDefault\(\)/);
  assert.match(html, /Replace the placeholder email address/);
});

test('Error page returns visitors home', () => {
  const notFound = read('404.html');
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /href="\/"/);
});


test('Wrangler config names Cloudflare Pages project and publish directory', () => {
  const wrangler = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  assert.match(wrangler, /^name\s*=\s*"elite-pipeline-brittney-michelle-test"/m);
  assert.match(wrangler, /^pages_build_output_dir\s*=\s*"\.\/public"/m);
  assert.match(wrangler, /^compatibility_date\s*=\s*"\d{4}-\d{2}-\d{2}"/m);
});
