'use strict';

const ABOUT_TEXT_URL = 'info/about.txt';
const RECENTS_URL = 'info/recents.txt';
const CV_TEXT_URL = 'info/cv.txt';

function setActivePage(targetPageName, pages, navigationLinks) {
  if (!pages.some((page) => page.dataset.page === targetPageName)) return null;
  let activePage = null;

  pages.forEach((page) => {
    const isActive = page.dataset.page === targetPageName;
    page.classList.toggle('active', isActive);
    page.hidden = !isActive;

    if (isActive) {
      activePage = page;
    }
  });

  navigationLinks.forEach((link) => {
    const isActive = link.textContent.trim().toLowerCase() === targetPageName;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  return activePage;
}

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCvText(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim());
  const cv = { profile: null, summary: '', sections: [] };
  let currentSection = null;
  let currentItem = null;
  let currentBlock = '';

  function getValue(line) {
    const separatorIndex = line.indexOf(':');
    return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : '';
  }

  lines.forEach((line) => {
    if (!line) {
      return;
    }

    if (line === 'PROFILE') {
      cv.profile = {
        name: '',
        role: '',
        affiliation: '',
        location: '',
        email: ''
      };
      currentBlock = 'profile';
      return;
    }

    if (line === 'SUMMARY') {
      currentBlock = 'summary';
      return;
    }

    if (currentBlock === 'profile' && cv.profile) {
      if (line.startsWith('name:')) {
        cv.profile.name = getValue(line);
        return;
      }

      if (line.startsWith('role:')) {
        cv.profile.role = getValue(line);
        return;
      }

      if (line.startsWith('affiliation:')) {
        cv.profile.affiliation = getValue(line);
        return;
      }

      if (line.startsWith('location:')) {
        cv.profile.location = getValue(line);
        return;
      }

      if (line.startsWith('email:')) {
        cv.profile.email = getValue(line);
        return;
      }
    }

    if (currentBlock === 'summary' && !line.startsWith('SECTION:')) {
      cv.summary = cv.summary ? `${cv.summary} ${line}` : line;
      return;
    }

    if (line.startsWith('SECTION:')) {
      currentSection = { title: getValue(line), items: [] };
      cv.sections.push(currentSection);
      currentItem = null;
      currentBlock = 'section';
      return;
    }

    if (line.startsWith('HIDDEN:') && currentSection) {
      currentSection.hidden = getValue(line) === 'true';
      return;
    }

    if (line.startsWith('ITEM:') && currentSection) {
      currentItem = {
        title: getValue(line),
        meta: '',
        details: [],
        bullets: []
      };
      currentSection.items.push(currentItem);
      currentBlock = 'item';
      return;
    }

    if (line.startsWith('META:') && currentItem) {
      currentItem.meta = getValue(line);
      return;
    }

    if (line.startsWith('DETAIL:') && currentItem) {
      currentItem.details.push(getValue(line));
      return;
    }

    if (line.startsWith('BULLET:') && currentItem) {
      currentItem.bullets.push(getValue(line));
    }
  });

  return cv;
}

function renderCvSection(cv) {
  const profile = cv.profile || {};

  return `
    <div class="cv-shell">
      <header class="cv-profile">
        <h3 class="cv-name">${escapeHtml(profile.name || 'Abul Al Arabi')}</h3>
        <p class="cv-role">${escapeHtml(profile.role || '')}</p>
        <p class="cv-affiliation">${escapeHtml(profile.affiliation || '')}</p>
        <p class="cv-contact">${escapeHtml(profile.location || '')} · ${escapeHtml(profile.email || '')}</p>
        <p class="cv-summary">${escapeHtml(cv.summary || '')}</p>
      </header>
      <div class="cv-sections">
        ${cv.sections
          .filter((section) => !section.hidden)
          .map(
            (section) => `
              <section class="cv-section">
                <div class="cv-section-head">
                  <h3 class="h3 cv-section-title">${escapeHtml(section.title)}</h3>
                </div>
                <div class="cv-section-body">
                  ${section.items
                    .map(
                      (item) => `
                        <div class="cv-entry">
                          ${item.title ? `<div class="cv-entry-top"><h4 class="cv-entry-title">${escapeHtml(item.title)}</h4>${item.meta ? `<span class="cv-entry-meta">${escapeHtml(item.meta)}</span>` : ''}</div>` : ''}
                          ${
                            item.details.length
                              ? `<div class="cv-entry-details">
                                  ${item.details
                                    .map((text) => `<p class="cv-entry-detail">${escapeHtml(text)}</p>`)
                                    .join('')}
                                </div>`
                              : ''
                          }
                          ${
                            item.bullets.length
                              ? `<ul class="cv-entry-list">
                                  ${item.bullets
                                    .map((text) => `<li class="cv-entry-text">${escapeHtml(text)}</li>`)
                                    .join('')}
                                </ul>`
                              : ''
                          }
                        </div>
                      `
                    )
                    .join('')}
                </div>
              </section>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

async function loadCvSection() {
  const cvSection = document.getElementById('cv-section');

  if (!cvSection || cvSection.childElementCount > 0) {
    return;
  }

  try {
    const response = await fetch(CV_TEXT_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to load CV content');
    }

    const text = await response.text();
    const cv = parseCvText(text);
    cvSection.innerHTML = renderCvSection(cv);
  } catch (error) {
    console.error(error);
    cvSection.innerHTML = '<p class="timeline-text">CV content could not be loaded.</p>';
  }
}

async function loadAboutSection() {
  const aboutContainer = document.getElementById('about-text-content');

  if (!aboutContainer || aboutContainer.childElementCount > 0) {
    return;
  }

  try {
    const response = await fetch(ABOUT_TEXT_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to load about content');
    }

    const text = await response.text();
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    aboutContainer.innerHTML = paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
  } catch (error) {
    console.error(error);
    aboutContainer.innerHTML = '<p>About content could not be loaded.</p>';
  }
}

async function loadRecentsSection() {
  const recentsContainer = document.getElementById('recents-timeline');

  if (!recentsContainer || recentsContainer.childElementCount > 0) {
    return;
  }

  try {
    const response = await fetch(RECENTS_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to load recents content');
    }

    const text = await response.text();
    const items = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    recentsContainer.innerHTML = items
      .map((item) => {
        const [date = '', description = ''] = item.split('|');
        return `<li><span class="date">${date.trim()}</span>${description.trim()}</li>`;
      })
      .join('');
  } catch (error) {
    console.error(error);
    recentsContainer.innerHTML = '<li>Recent updates could not be loaded.</li>';
  }
}

function initSidebarToggle() {
  const sidebar = document.querySelector('[data-sidebar]');
  const sidebarButton = document.querySelector('[data-sidebar-btn]');

  if (!sidebar || !sidebarButton) {
    return;
  }

  sidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    const expanded = sidebar.classList.contains('active');
    sidebarButton.setAttribute('aria-expanded', String(expanded));
    sidebarButton.setAttribute('aria-label', expanded ? 'Hide contact details' : 'Show contact details');
  });
}

function initNavigation() {
  const navigationLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const pages = Array.from(document.querySelectorAll('[data-page]'));
  const title = document.getElementById('page-title');
  const navbar = document.querySelector('.navbar');
  const navbarList = navbar.querySelector('.navbar-list');
  const yearNav = document.getElementById('publication-year-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const positions = new Map();
  let scroller;
  let currentPage = pages.find((page) => page.classList.contains('active'));
  let lastHash;

  pages.forEach((page) => { page.id = page.dataset.page; });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function updateTabIndicator() {
    const activeLink = navbarList?.querySelector('.navbar-link.active');
    if (!activeLink) return;

    const tab = activeLink.getBoundingClientRect();
    const list = navbarList.getBoundingClientRect();
    navbarList.style.setProperty('--tab-x', `${tab.left - list.left}px`);
    navbarList.style.setProperty('--tab-width', `${tab.width}px`);
    navbarList.classList.add('has-indicator');
  }

  function scrollPage(page, top, smooth = false) {
    if (scroller) {
      scroller.scrollTo(top, { immediate: !smooth || reducedMotion.matches, duration: 0.7, force: true });
    } else {
      page.scrollTo({ top, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
    }
  }

  function route({ initial = false, force = false, restoreScroll = false, smooth = false } = {}) {
    const hash = location.hash.slice(1);
    if (hash === lastHash && !force) return;
    lastHash = hash;
    const targetName = hash.startsWith('y-') ? 'publications' : hash || 'about';
    const target = pages.find((page) => page.dataset.page === targetName);
    if (!target || navigationLinks.some((link) => link.textContent.trim().toLowerCase() === targetName && link.dataset.disabled === 'true')) return;

    const changed = target !== currentPage;
    if (changed && currentPage) positions.set(currentPage.dataset.page, currentPage.scrollTop);
    setActivePage(targetName, pages, navigationLinks);
    yearNav.hidden = targetName !== 'publications';
    currentPage = target;
    if (window.Lenis && (changed || !scroller)) {
      scroller?.destroy();
      scroller = new window.Lenis({
        wrapper: target,
        content: target,
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.1,
        allowNestedScroll: true,
        naiveDimensions: true,
        respectReducedMotion: true
      });
    }
    title.textContent = target.dataset.title;
    updateTabIndicator();
    const activeLink = navigationLinks.find((link) => link.classList.contains('active'));
    if (navbar.scrollWidth > navbar.clientWidth) {
      const left = navbar.scrollLeft + activeLink.getBoundingClientRect().left
        - navbar.getBoundingClientRect().left - (navbar.clientWidth - activeLink.offsetWidth) / 2;
      navbar.scrollTo({ left: Math.max(0, left), behavior: 'instant' });
    }

    if (hash.startsWith('y-')) {
      const year = document.getElementById(hash);
      if (year) {
        year.open = true;
        const top = year.getBoundingClientRect().top - target.getBoundingClientRect().top + target.scrollTop - 12;
        scrollPage(target, Math.max(0, top), smooth);
      }
    } else if (!initial && (changed || force)) {
      const top = restoreScroll && positions.has(targetName)
        ? positions.get(targetName)
        : 0;
      scrollPage(target, top);
    }

    if (changed && !initial) {
      window.SiteMotion?.reveal(target);
      window.SiteMotion?.reveal(title, 0);
      title.focus({ preventScroll: true });
    }
  }

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.disabled === 'true') {
        return;
      }

      const hash = `#${link.textContent.trim().toLowerCase()}`;
      if (location.hash !== hash) history.pushState(null, '', hash);
      route({ force: true });
    });
  });

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#y-"]');
    if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const hash = anchor.getAttribute('href');
    if (location.hash !== hash) history.pushState(null, '', hash);
    route({ force: true, smooth: true });
  });
  window.addEventListener('popstate', () => route({ restoreScroll: true }));
  window.addEventListener('hashchange', () => route());
  document.addEventListener('dialogchange', (event) => {
    if (event.detail.open) scroller?.stop();
    else scroller?.start();
  });
  document.addEventListener('publicationsready', () => {
    if (location.hash.startsWith('#y-')) route({ force: true });
  });
  if (navbarList && typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(updateTabIndicator);
    navigationLinks.forEach((link) => observer.observe(link));
  }
  route({ initial: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initNavigation();
  loadAboutSection();
  loadRecentsSection();
  loadCvSection();
});
