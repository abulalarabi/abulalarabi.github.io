'use strict';

const ABOUT_TEXT_URL = 'info/about.txt';
const RECENTS_URL = 'info/recents.txt';
const CV_TEXT_URL = 'info/cv.txt';

function setActivePage(targetPageName, pages, navigationLinks) {
  let activePage = null;

  pages.forEach((page) => {
    const isActive = page.dataset.page === targetPageName;
    page.classList.toggle('active', isActive);

    if (isActive) {
      activePage = page;
    }
  });

  navigationLinks.forEach((link) => {
    const isActive = link.textContent.trim().toLowerCase() === targetPageName;
    link.classList.toggle('active', isActive);
  });

  if (activePage) {
    activePage.scrollTo({ top: 0, behavior: 'auto' });
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
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
      <section class="cv-hero">
        <div class="cv-hero-main">
          <p class="cv-kicker">Curriculum Vitae</p>
          <h3 class="cv-name">${escapeHtml(profile.name || 'Abul Al Arabi')}</h3>
          <p class="cv-role">${escapeHtml(profile.role || '')}</p>
          <p class="cv-affiliation">${escapeHtml(profile.affiliation || '')}</p>
          <p class="cv-summary">${escapeHtml(cv.summary || '')}</p>
        </div>
        <div class="cv-hero-side">
          <div class="cv-contact-card">
            <p class="cv-contact-label">Location</p>
            <p>${escapeHtml(profile.location || '')}</p>
          </div>
          <div class="cv-contact-card">
            <p class="cv-contact-label">Email</p>
            <p>${escapeHtml(profile.email || '')}</p>
          </div>
        </div>
      </section>
      <div class="cv-grid">
        ${cv.sections
          .map(
            (section) => `
              <section class="cv-section-card">
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
  });
}

function initNavigation() {
  const navigationLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const pages = Array.from(document.querySelectorAll('[data-page]'));

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.disabled === 'true') {
        return;
      }

      setActivePage(link.textContent.trim().toLowerCase(), pages, navigationLinks);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initNavigation();
  loadAboutSection();
  loadRecentsSection();
  loadCvSection();
});
