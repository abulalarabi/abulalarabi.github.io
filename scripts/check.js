'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
process.chdir(path.resolve(__dirname, '..'));
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const external = (value) => /^(https?:|mailto:|data:|blob:)/.test(value);

function checkAsset(value) {
  if (!value || external(value) || value.startsWith('#')) return;
  const file = value.split(/[?#]/)[0];
  assert(fs.existsSync(file === '/' ? 'index.html' : file.replace(/^\//, '')), `Missing local asset: ${value}`);
}

for (const file of ['index.html', '404.html', 'simplelapse.html', 'oscilloplot.html']) {
  const html = read(file);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${file}`);
  const pages = [...html.matchAll(/data-page="([^"]+)"/g)].map((match) => match[1]);
  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (value.startsWith('#')) assert(ids.includes(value.slice(1)) || pages.includes(value.slice(1)), `Missing anchor in ${file}: ${value}`);
    else checkAsset(value);
  }
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!attributes.includes('src=') && !attributes.includes('type="module"')) new vm.Script(body, { filename: file });
  }
}

const publications = json('info/publication.json');
const projects = json('info/projects.json');
const talks = json('info/talks.json');
for (const collection of [publications, projects, talks]) assert(Array.isArray(collection));
assert.equal(new Set(publications.map((record) => record.title)).size, publications.length, 'Duplicate publication cards');
for (const record of publications) {
  for (const field of ['title', 'image', 'pdf', 'video', 'summary']) assert(record[field], `Missing ${field}: ${record.title}`);
  checkAsset(record.image);
  checkAsset(record.pdf);
  assert(/^https?:$/.test(new URL(record.video).protocol), `Invalid video URL: ${record.title}`);
}
for (const record of [...projects, ...talks]) {
  assert(record['project-name'], 'Missing project/talk title');
  for (const video of record.videos || []) {
    const url = new URL(video);
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
    if (videoId) {
      const posterName = videoId.startsWith('_') ? `video-${videoId}` : videoId;
      checkAsset(`assets/project-video-thumbnails/${posterName}.jpg`);
    }
  }
  if (!record.images) continue;
  const images = json(`${record.images}/index.json`);
  assert(Array.isArray(images) && images.length, `Empty gallery: ${record.images}`);
  images.forEach((image) => checkAsset(external(image) ? image : `${record.images}/${image}`));
}

const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
for (const script of ['script', 'publication']) vm.runInContext(read(`assets/js/${script}.js`), context);
const citations = context.splitBibEntries(read('info/citations.txt'));
const keys = citations.map((entry) => entry.match(/@\w+\s*\{\s*([^,]+)/)?.[1]);
assert(keys.every(Boolean) && new Set(keys).size === keys.length, 'Invalid or duplicate citation keys');
for (const entry of citations) {
  const publication = context.getPublicationParts(entry);
  assert(publication.title && publication.authors && publication.venue, 'Incomplete citation');
}
const cv = context.parseCvText(read('info/cv.txt'));
assert(cv.profile?.name && cv.sections.length, 'Incomplete CV');
const renderedCv = context.renderCvSection(cv);
for (const section of cv.sections.filter((section) => section.hidden)) {
  assert(!renderedCv.includes(context.escapeHtml(section.title)), `Hidden CV section rendered: ${section.title}`);
}
for (const line of read('info/recents.txt').trim().split('\n')) assert(/^\d{2}\/\d{2}\|.+/.test(line), `Invalid news entry: ${line}`);

for (const file of fs.readdirSync('assets/js').filter((file) => file.endsWith('.js'))) {
  new vm.Script(read(`assets/js/${file}`), { filename: file });
}
for (const file of fs.readdirSync('assets/css').filter((file) => file.endsWith('.css'))) {
  const css = read(`assets/css/${file}`).replace(/\/\*[\s\S]*?\*\//g, '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
  const pairs = { '}': '{', ')': '(', ']': '[' };
  const stack = [];
  for (const character of css) {
    if ('{(['.includes(character)) stack.push(character);
    else if ('})]'.includes(character)) assert.equal(stack.pop(), pairs[character], `Unbalanced CSS in ${file}`);
  }
  assert.equal(stack.length, 0, `Unclosed CSS in ${file}`);
}
console.log(`Passed: local links/assets, HTML IDs, ${publications.length} cards, ${citations.length} citations, galleries, hidden CV sections, JavaScript syntax, and CSS delimiters.`);
