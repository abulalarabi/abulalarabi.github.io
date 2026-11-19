'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));

// Exercise the actual event handlers without a browser or external dependencies.
class Element {
  constructor() {
    this.listeners = {};
    this.dataset = {};
    this.attributes = {};
    this.children = [];
    this.scrollTop = 0;
    this.properties = {};
    this.style = { setProperty: (key, value) => { this.properties[key] = value; } };
    const classes = new Set();
    this.classList = {
      contains: (value) => classes.has(value),
      add: (value) => classes.add(value),
      remove: (value) => classes.delete(value),
      toggle(value, enabled = !classes.has(value)) { enabled ? classes.add(value) : classes.delete(value); }
    };
  }
  addEventListener(type, callback) { (this.listeners[type] ??= []).push(callback); }
  dispatchEvent(event) { for (const callback of this.listeners[event.type] || []) callback(event); }
  emit(type, values = {}) { this.dispatchEvent({ type, target: this, ...values }); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  removeAttribute(key) { delete this.attributes[key]; }
  appendChild(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; this.innerHTML = ''; }
  querySelector(selector) { return this.selectors?.[selector] || null; }
  querySelectorAll(selector) {
    if (this.selectorLists?.[selector]) return this.selectorLists[selector];
    const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll('*')]);
    return selector === '*' ? descendants : descendants.filter((child) => selector.startsWith('.') && child.className?.split(' ').includes(selector.slice(1)));
  }
  get childElementCount() { return this.children.length; }
  closest() { return null; }
  focus(options) { this.focusOptions = options; }
  scrollIntoView() { this.scrolled = true; }
  scrollTo(options) { this.scrollTop = options.top; this.scrollOptions = options; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit('close'); }
}

function environment() {
  const document = new Element();
  const window = new Element();
  const root = new Element();
  const elements = {};
  document.documentElement = root;
  document.hidden = false;
  document.selectors = {};
  document.getElementById = (id) => elements[id] || null;
  document.createElement = () => new Element();
  const location = { hash: '' };
  window.scrollY = 0;
  window.scrolls = [];
  window.scrollTo = (options) => { window.scrollY = options.top; window.scrolls.push(options); };
  const motion = { matches: false };
  window.matchMedia = () => motion;
  window.setInterval = (callback) => { window.interval = callback; };
  const context = vm.createContext({
    document, window, location, URL, console,
    history: { scrollRestoration: 'auto', pushState(state, unused, hash) { location.hash = hash; } },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    localStorage: { getItem() { return null; }, setItem() {} }
  });
  return { context, document, window, root, elements, location, motion };
}
function run(env, name) { vm.runInContext(fs.readFileSync(`assets/js/${name}.js`, 'utf8'), env.context); }

function checkTheme(saved, storageBlocked = false) {
  const env = environment();
  const button = new Element();
  button.selectors = { '[data-theme-label]': new Element(), '.theme-icon': new Element() };
  env.document.selectors = { '[data-theme-toggle]': button, 'meta[name="theme-color"]': new Element() };
  let stored;
  env.context.localStorage = {
    getItem() { if (storageBlocked) throw Error('Storage disabled'); return saved; },
    setItem(key, value) { if (storageBlocked) throw Error('Storage disabled'); stored = value; }
  };
  run(env, 'theme');
  const initial = !storageBlocked && saved === 'light' ? 'light' : 'dark';
  assert.equal(env.root.dataset.theme, initial, 'Dark is the default before page rendering');
  env.document.emit('DOMContentLoaded');
  button.emit('click');
  assert.equal(env.root.dataset.theme, initial === 'dark' ? 'light' : 'dark');
  if (!storageBlocked) assert.equal(stored, env.root.dataset.theme);
  assert(button.getAttribute('aria-label').startsWith('Switch to '));
}

function navigationEnvironment(hash = '', library = false) {
  const env = environment();
  env.elements['page-title'] = new Element();
  env.elements['publication-year-nav'] = new Element();
  env.document.selectors['.navbar'] = new Element();
  env.location.hash = hash;
  const names = ['about', 'projects', 'publications', 'cv', 'talks', 'awards/media'];
  const pages = names.map((name) => {
    const page = new Element();
    page.dataset.page = name;
    page.dataset.title = name === 'about' ? 'About me' : name;
    page.getBoundingClientRect = () => ({ top: 100 });
    if (name === 'about') page.classList.add('active');
    return page;
  });
  const links = names.map((name) => {
    const link = new Element();
    link.textContent = name;
    if (name === 'awards/media') link.dataset.disabled = 'true';
    return link;
  });
  env.document.querySelectorAll = (selector) => selector === '[data-nav-link]' ? links : pages;
  env.scrollers = [];
  if (library) env.window.Lenis = class {
    constructor(options) { this.options = options; this.calls = []; env.scrollers.push(this); }
    scrollTo(top, options) { this.calls.push({ top, ...options }); this.options.wrapper.scrollTop = top; }
    stop() { this.stopped = true; }
    start() { this.stopped = false; }
    destroy() { this.destroyed = true; }
  };
  run(env, 'script');
  env.context.initNavigation();
  return { ...env, pages, links };
}

function checkNavigation() {
  const env = navigationEnvironment();
  env.pages[0].scrollTop = 480;
  env.links[1].emit('click');
  assert.equal(env.location.hash, '#projects');
  assert.equal(env.elements['page-title'].textContent, 'projects', 'The persistent heading follows the active tab');
  assert(env.elements['publication-year-nav'].hidden, 'The year selector is hidden outside Publications');
  assert.equal(env.elements['page-title'].focusOptions.preventScroll, true, 'Heading focus keeps the content stationary');
  assert.equal(env.pages[1].scrollTop, 0, 'Navigation opens at the top of the selected content pane');
  env.pages[1].scrollTop = 900;
  env.links[3].emit('click');
  env.pages[3].scrollTop = 2200;
  env.links[1].emit('click');
  assert.equal(env.pages[1].scrollTop, 0, 'Clicking Projects does not restore a previous halfway-down position');
  env.pages[1].scrollTop = 650;
  env.links[1].emit('click');
  assert.equal(env.pages[1].scrollTop, 0, 'Reselecting Projects consistently returns to its beginning');
  env.links[5].emit('click');
  assert.equal(env.location.hash, '#projects', 'Disabled navigation is ignored');
  env.location.hash = '#cv';
  env.window.emit('popstate');
  assert(env.pages[3].classList.contains('active'), 'Browser history selects the right page');
  assert.equal(env.pages[3].scrollTop, 2200, 'Browser history restores the saved inner reading position');
  assert.equal(env.window.scrolls.length, 0, 'Tab navigation never scrolls the document');
  assert.equal(env.pages.filter((page) => !page.hidden).length, 1);
  assert.equal(env.context.setActivePage('missing', env.pages, env.links), null);
  assert(!env.pages[3].hidden, 'Unknown routes preserve the active page');

  const mobile = navigationEnvironment();
  mobile.pages[0].scrollTop = 1500;
  mobile.links[1].emit('click');
  assert.equal(mobile.pages[1].scrollTop, 0, 'Mobile navigation resets only the active content');
  mobile.pages[1].scrollTop = 900;
  mobile.links[3].emit('click');
  mobile.links[1].emit('click');
  assert.equal(mobile.pages[1].scrollTop, 0, 'Mobile Projects clicks use the section start, not a saved position');
  assert.equal(mobile.window.scrolls.length, 0, 'Mobile tab changes leave the outer page stationary');

  const direct = navigationEnvironment('#y-2026');
  assert(direct.pages[2].classList.contains('active'), 'Year deep links select publications before data loads');
  assert.equal(direct.elements['publication-year-nav'].hidden, false, 'Publication year links keep the fixed selector visible');
  const year = new Element();
  year.getBoundingClientRect = () => ({ top: 1000 - direct.pages[2].scrollTop });
  direct.elements['y-2026'] = year;
  direct.document.emit('publicationsready');
  assert(year.open, 'Delayed year content opens');
  assert.equal(direct.pages[2].scrollTop, 888, 'Year links scroll within Publications with a 12px inset');
  year.open = false;
  const anchor = new Element();
  anchor.setAttribute('href', '#y-2026');
  const target = new Element();
  target.closest = () => anchor;
  let prevented = false;
  direct.document.emit('click', { target, button: 0, preventDefault() { prevented = true; } });
  assert(prevented && year.open, 'Selecting the same year reopens a collapsed section');
  assert.equal(direct.pages[2].scrollTop, 888);
  assert.equal(direct.pages[2].scrollOptions.behavior, 'smooth', 'Year clicks animate with native scrolling when the library is unavailable');
  direct.motion.matches = true;
  direct.document.emit('click', { target, button: 0, preventDefault() {} });
  assert.equal(direct.pages[2].scrollOptions.behavior, 'instant', 'Reduced motion disables native year animation');
  assert.equal(direct.window.scrolls.length, 0, 'Year links never move the outer page');
}

function checkSmoothScrolling() {
  const env = navigationEnvironment('', true);
  assert.equal(env.scrollers[0].options.wrapper, env.pages[0], 'Lenis smooths the active content pane');
  assert.equal(env.scrollers[0].options.syncTouch, false, 'Touch scrolling stays native');
  assert.equal(env.scrollers[0].options.allowNestedScroll, true, 'Nested galleries and recents retain native scrolling');
  env.links[2].emit('click');
  assert(env.scrollers[0].destroyed, 'Switching tabs removes the previous scroll controller');
  const scroller = env.scrollers[1];
  assert.equal(scroller.calls.at(-1).immediate, true, 'Tab navigation resets without animation');
  const year = new Element();
  year.getBoundingClientRect = () => ({ top: 1000 - env.pages[2].scrollTop });
  env.elements['y-2026'] = year;
  const anchor = new Element();
  anchor.setAttribute('href', '#y-2026');
  const target = new Element();
  target.closest = () => anchor;
  env.document.emit('click', { target, button: 0, preventDefault() {} });
  assert.equal(scroller.calls.at(-1).immediate, false, 'Year selection animates through Lenis');
  assert.equal(scroller.calls.at(-1).duration, 0.7);
  env.motion.matches = true;
  env.document.emit('click', { target, button: 0, preventDefault() {} });
  assert.equal(scroller.calls.at(-1).immediate, true, 'Reduced motion disables library animations');
  assert.equal(env.scrollers.length, 2, 'Year selection reuses the active controller');
  env.document.emit('dialogchange', { detail: { open: true } });
  assert(scroller.stopped, 'Opening a popup stops background scroll inertia');
  env.document.emit('dialogchange', { detail: { open: false } });
  assert.equal(scroller.stopped, false, 'Closing the popup resumes content scrolling');
}

async function checkDialogAndCards() {
  const env = environment();
  for (const id of ['publication-modal', 'modal-img', 'modal-title', 'modal-pdf', 'modal-video', 'modal-summary', 'modal-embed', 'publication-container']) env.elements[id] = new Element();
  const modal = env.elements['publication-modal'];
  const content = new Element();
  const close = new Element();
  modal.selectors = { '.modal-content': content, '.modal-media': new Element(), '.modal-close': close };
  modal.selectorLists = { '[data-dialog-media]': [env.elements['modal-embed']] };
  env.document.selectorLists = { 'dialog.modal': [modal] };
  run(env, 'ui-motion');
  env.document.emit('DOMContentLoaded');
  env.context.fetch = async () => ({ ok: true, json: async () => JSON.parse(fs.readFileSync('info/publication.json', 'utf8')) });
  run(env, 'script');
  run(env, 'content-cards');
  run(env, 'publication');
  await env.context.renderPublicationCards();
  const cards = env.elements['publication-container'].children;
  assert.equal(cards.length, 5);
  assert(cards[0].innerHTML.includes('dk5QPW2xS1M'));
  cards[0].emit('pointerdown', { clientX: 200, clientY: 20 });
  cards[0].emit('pointerup', { clientX: 50, clientY: 20 });
  cards[0].emit('click', { detail: 1 });
  assert(!modal.open, 'Dragging the carousel does not open a dialog');
  cards[0].emit('click', { detail: 0 });
  assert(modal.open, 'Keyboard activation opens publication details');
  assert(env.root.classList.contains('dialog-open'), 'The background is scroll-locked');
  assert.equal(content.scrollTop, 0);
  const play = env.elements['modal-embed'].children[0];
  assert.equal(play.className, 'modal-play', 'The dialog initially shows a preview and play control');
  play.emit('click');
  assert(env.elements['modal-embed'].children[0].src.includes('youtube.com/embed/dk5QPW2xS1M?autoplay=1'));
  close.emit('click');
  assert(!modal.open && !env.root.classList.contains('dialog-open'));
  assert.equal(env.elements['modal-embed'].innerHTML, '', 'Closing the dialog stops its video');
  assert.equal(env.elements['modal-embed'].children.length, 0);
}

async function checkProjectDemos() {
  const env = environment();
  env.elements['projects-section'] = new Element();
  for (const id of ['project-video-modal', 'project-video-title', 'project-video-embed']) env.elements[id] = new Element();
  const modal = env.elements['project-video-modal'];
  const close = new Element();
  modal.selectors = { '.modal-content': new Element(), '.modal-close': close };
  modal.selectorLists = { '[data-dialog-media]': [env.elements['project-video-embed']] };
  env.document.selectorLists = { 'dialog.modal': [modal] };
  run(env, 'ui-motion');
  env.document.emit('DOMContentLoaded');
  env.context.fetch = async () => ({ ok: true, json: async () => [{
    'project-name': 'Demo project', videos: ['https://youtu.be/N9JJxs4UElc', 'https://youtu.be/ndf2YhFQPJ4']
  }] });
  run(env, 'content-cards');
  await env.window.ContentCards.renderCardCollection({ rootId: 'projects-section', dataUrl: 'test', emptyMessage: 'Unavailable' });
  const descendants = (element) => [element, ...element.children.flatMap(descendants)];
  const elements = () => descendants(env.elements['projects-section']);
  const triggers = elements().filter((element) => element.className === 'proj-video-trigger');
  assert.equal(triggers.length, 2);
  const posters = elements().filter((element) => element.className === 'proj-video-poster');
  assert.equal(posters.length, 2, 'Each project demo has a thumbnail before its player loads');
  assert.equal(posters[0].getAttribute('src'), 'assets/project-video-thumbnails/N9JJxs4UElc.jpg');
  assert(!elements().some((element) => element.className === 'proj-chip' || element.className === 'proj-meta'), 'Project media counts are omitted');
  assert(!elements().some((element) => element.className === 'proj-video-frame'), 'Players do not load before selection');
  triggers[0].emit('click');
  const frames = env.elements['project-video-embed'].children;
  assert.equal(frames.length, 1, 'Selecting a demo loads only its player');
  assert(modal.open, 'Project videos open in a dialog');
  assert.equal(elements().filter((element) => element.className === 'proj-video-trigger').length, 2, 'Opening a popup preserves the project thumbnails');
  assert.equal(frames[0].getAttribute('src'), 'https://www.youtube.com/embed/N9JJxs4UElc?autoplay=1');
  assert.equal(env.elements['project-video-title'].focusOptions.preventScroll, true, 'Opening a demo does not steal the scroll position');
  modal.emit('cancel', { preventDefault() {} });
  assert(!modal.open, 'Escape dismisses the video popup');
  assert.equal(env.elements['project-video-embed'].children.length, 0, 'Closing the popup stops its video');
  triggers[1].emit('click');
  assert.equal(env.elements['project-video-embed'].children[0].getAttribute('src'), 'https://www.youtube.com/embed/ndf2YhFQPJ4?autoplay=1');
  close.emit('click');
  assert(!modal.open && !env.root.classList.contains('dialog-open'));
}

async function checkProjectMediaLayouts() {
  const env = environment();
  env.elements['projects-section'] = new Element();
  env.context.fetch = async (url) => ({ ok: true, json: async () => url === 'projects' ? [
    { 'project-name': 'Gallery only', images: 'images/gallery' },
    { 'project-name': 'Demo only', videos: ['https://youtu.be/N9JJxs4UElc'] },
    { 'project-name': 'Both media types', images: 'images/gallery', videos: ['https://youtu.be/N9JJxs4UElc'] }
  ] : ['1.jpg', '2.jpg', '3.jpg'] });
  run(env, 'content-cards');
  await env.window.ContentCards.renderCardCollection({ rootId: 'projects-section', dataUrl: 'projects', emptyMessage: 'Unavailable' });
  const cards = env.elements['projects-section'].querySelectorAll('.proj-card');
  assert.equal(cards.length, 3);
  assert(cards[0].classList.contains('gallery-only'), 'Gallery-only projects use the enlarged gallery layout');
  assert(cards[1].classList.contains('demo-only'), 'Demo-only projects use the enlarged demo layout');
  assert(!cards[2].classList.contains('gallery-only') && !cards[2].classList.contains('demo-only'), 'Projects with both media types keep the balanced layout');
  assert.equal(cards[0].querySelectorAll('.proj-thumb').length, 3, 'The gallery retains all images');
}

function backgroundEnvironment(hour, theme = 'dark', particles = false) {
  const env = environment();
  env.root.dataset.theme = theme;
  env.context.Date = class { getHours() { return Math.floor(hour); } getMinutes() { return (hour % 1) * 60; } };
  if (particles) {
    const motion = new Element();
    motion.matches = false;
    env.motion = motion;
    env.window.matchMedia = () => motion;
    env.window.cancelRequestAnimFrame = () => {};
    env.context.particlesJS = (id, config) => {
      const scene = {
        ...config, canvas: { pxratio: 1 },
        fn: { vendors: { draw() {} }, particlesDraw() {}, modes: {
          pushParticles(count) { for (let i = 0; i < count; i++) scene.particles.array.push({ color: {} }); }
        } }
      };
      scene.particles.array = Array.from({ length: 80 }, () => ({ color: {} }));
      env.scene = scene;
      env.window.pJSDom = [{ pJS: scene }];
    };
  }
  run(env, 'bg');
  return env;
}

function checkBackground() {
  const color = (env) => env.root.properties['--sky-color'].match(/\d+/g).map(Number);
  const midnight = color(backgroundEnvironment(0));
  const noon = color(backgroundEnvironment(12));
  assert(noon.every((channel, index) => channel > midnight[index]), 'Daytime is lighter than nighttime');
  assert(color(backgroundEnvironment(23.99)).every((channel, index) => Math.abs(channel - midnight[index]) <= 1), 'Midnight has no color jump');
  assert(color(backgroundEnvironment(12, 'light')).every((channel, index) => channel > noon[index]));
  const env = backgroundEnvironment(12, 'dark', true);
  for (let i = 0; i < 100; i++) env.document.emit('click', { clientX: 50, clientY: 50 });
  assert.equal(env.scene.particles.array.length, 140, 'Background clicks cannot grow particles indefinitely');
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  assert.equal(env.scene.particles.move.enable, false, 'Hidden tabs pause animation');
  env.document.hidden = false;
  env.document.emit('visibilitychange');
  assert.equal(env.scene.particles.move.enable, true);
  env.motion.matches = true;
  env.motion.emit('change');
  assert.equal(env.scene.particles.move.enable, false, 'Reduced motion disables animation');
  env.root.dataset.theme = 'light';
  env.document.emit('themechange');
  assert.equal(env.scene.particles.color.value, '#536b91', 'Particles remain visible in light mode');
}

(async () => {
  for (const name of ['bg', 'theme', 'script', 'publication', 'content-cards', 'projects', 'talks', 'ui-motion']) new vm.Script(fs.readFileSync(`assets/js/${name}.js`, 'utf8'));
  checkTheme(null);
  checkTheme('light');
  checkTheme(null, true);
  checkNavigation();
  checkSmoothScrolling();
  await checkDialogAndCards();
  await checkProjectDemos();
  await checkProjectMediaLayouts();
  checkBackground();
  console.log('Passed: theme persistence/storage fallback; navigation, history, scroll restoration and year links; dialog cleanup and carousel drag; project previews and adaptive media layouts; local-time background, particle limits and reduced motion.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
