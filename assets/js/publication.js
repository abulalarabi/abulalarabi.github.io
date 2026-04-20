'use strict';

const PUBLICATION_CARDS_URL = 'info/publication.json';
const CITATIONS_URL = 'info/citations.txt';
const PUBLICATION_SECTION_ID = 'publication-section';

function cleanCitationText(value = '') {
  return value
    .replace(/[{}]/g, '')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBibField(block, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*(\\{([\\s\\S]*?)\\}|\"([\\s\\S]*?)\")`, 'i');
  const match = block.match(pattern);

  if (!match) {
    return '';
  }

  return cleanCitationText(match[2] || match[3] || '');
}

function splitBibEntries(text) {
  return text
    .split(/\n}\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (entry.endsWith('}') ? entry : `${entry}\n}`));
}

function parseAuthors(authors) {
  if (!authors) {
    return [];
  }

  return authors
    .split(/\s+and\s+/i)
    .map((author) => author.trim())
    .filter(Boolean)
    .map((author) => {
      if (author.includes(',')) {
        return author.replace(/\s+/g, ' ').trim();
      }

      const parts = author.split(/\s+/);

      if (parts.length === 1) {
        return parts[0];
      }

      const lastName = parts.pop();
      return `${lastName}, ${parts.join(' ')}`;
    });
}

function formatAuthors(authors) {
  return authors.join(', ');
}

function getPublicationParts(entry) {
  const authors = formatAuthors(parseAuthors(getBibField(entry, 'author')));
  const title = getBibField(entry, 'title');
  const journal = getBibField(entry, 'journal');
  const booktitle = getBibField(entry, 'booktitle');
  const publisher = getBibField(entry, 'publisher');
  const organization = getBibField(entry, 'organization');
  const volume = getBibField(entry, 'volume');
  const number = getBibField(entry, 'number');
  const pages = getBibField(entry, 'pages');
  const year = getBibField(entry, 'year') || 'Forthcoming';

  const venue = journal || booktitle;
  const source = publisher || organization;
  const metaParts = [];

  if (venue) {
    metaParts.push(venue);
  }

  if (source) {
    metaParts.push(source);
  }

  if (volume) {
    metaParts.push(`Vol ${volume}${number ? `(${number})` : ''}`);
  }

  if (pages) {
    metaParts.push(`pp. ${pages}`);
  }

  return {
    authors,
    title,
    venue,
    source,
    year,
    meta: metaParts.join(' • ')
  };
}

function formatCitation(entry) {
  const publication = getPublicationParts(entry);
  const parts = [];

  if (publication.authors) {
    parts.push(`${publication.authors}.`);
  }

  if (publication.title) {
    parts.push(`“${publication.title}.”`);
  }

  if (publication.meta) {
    parts.push(`${publication.meta},`);
  }

  parts.push(`(${publication.year}).`);

  return parts.join(' ').replace(/\s+,/g, ',');
}

function extractYouTubeEmbedUrl(url) {
  return window.ContentCards ? window.ContentCards.toYouTubeEmbedUrl(url) : url;
}

function showPublicationModal(publication) {
  const modal = document.getElementById('publication-modal');
  const modalContent = modal.querySelector('.modal-content');
  const modalMedia = modal.querySelector('.modal-media');
  const modalImage = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalPdf = document.getElementById('modal-pdf');
  const modalVideo = document.getElementById('modal-video');
  const modalSummary = document.getElementById('modal-summary');
  const embedContainer = document.getElementById('modal-embed');

  modalImage.src = publication.image;
  modalImage.alt = publication.title;
  modalTitle.textContent = publication.title;
  modalPdf.href = publication.pdf;
  modalVideo.href = publication.video;
  modalSummary.textContent = publication.summary;

  const embedUrl = extractYouTubeEmbedUrl(publication.video);
  const isYouTubeEmbed = embedUrl.includes('youtube.com/embed/');

  embedContainer.innerHTML = isYouTubeEmbed
    ? `<iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe>`
    : '';
  embedContainer.style.display = isYouTubeEmbed ? 'block' : 'none';
  modalMedia.style.display = isYouTubeEmbed ? 'none' : '';
  modalContent.classList.toggle('video-mode', isYouTubeEmbed);

  modal.style.display = 'flex';
}

async function renderPublicationCards() {
  const container = document.getElementById('publication-container');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  try {
    const response = await fetch(PUBLICATION_CARDS_URL, { cache: 'no-store' });
    const publications = await response.json();

    if (!response.ok || !Array.isArray(publications)) {
      throw new Error('Invalid publication card data');
    }

    publications.forEach((publication) => {
      const card = document.createElement('div');
      card.className = 'publication-card';
      card.innerHTML = `
        <div class="publication-card-media">
          <div class="card-buttons card-buttons-overlay">
            <a href="${publication.pdf}" target="_blank" rel="noopener noreferrer">PDF</a>
            <a href="${publication.video}" target="_blank" rel="noopener noreferrer">Demo</a>
          </div>
          <img src="${publication.image}" alt="${publication.title}">
        </div>
        <div class="card-body">
          <h4>${publication.title}</h4>
          <p class="card-summary">${publication.summary}</p>
        </div>
      `;

      card.addEventListener('click', () => showPublicationModal(publication));
      card.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (event) => {
          event.stopPropagation();
        });
      });
      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="timeline-text">Publications could not be loaded.</p>';
  }
}

async function renderPublicationList() {
  const root = document.getElementById(PUBLICATION_SECTION_ID);

  if (!root) {
    return;
  }

  try {
    const response = await fetch(CITATIONS_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to load ${CITATIONS_URL}`);
    }

    const text = await response.text();
    const entries = splitBibEntries(text).filter((entry) => /@\w+\s*\{/.test(entry));
    const groups = new Map();

    entries.forEach((entry) => {
      const year = getBibField(entry, 'year') || 'Forthcoming';
      const yearEntries = groups.get(year) || [];
      yearEntries.push(entry);
      groups.set(year, yearEntries);
    });

    const years = Array.from(groups.keys()).sort((a, b) => {
      const parsedA = a === 'Forthcoming' ? Number.MAX_SAFE_INTEGER : Number.parseInt(a, 10);
      const parsedB = b === 'Forthcoming' ? Number.MAX_SAFE_INTEGER : Number.parseInt(b, 10);
      return parsedB - parsedA;
    });

    root.classList.add('pubs');
    root.innerHTML = `
      <nav class="pubs-year-nav" aria-label="Jump to publication year">
        ${years.map((year) => `<a href="#y-${year}">${year}</a>`).join('')}
      </nav>
      ${years
        .map((year) => {
          const yearEntries = groups.get(year) || [];
          return `
            <details class="pubs-year" id="y-${year}" open>
              <summary>
                <span class="year">${year}</span>
                <span class="count">${yearEntries.length}</span>
              </summary>
              <ol class="pubs-list">
                ${yearEntries
                  .map(
                    (entry) => {
                      const publication = getPublicationParts(entry);
                      return `
                      <li class="pub">
                        <div class="pub-card">
                          <p class="pub-title">${publication.title || 'Untitled publication'}</p>
                          <p class="pub-authors">${publication.authors || 'Authors unavailable'}</p>
                          <div class="pub-meta-row">
                            <span class="pub-meta">${publication.meta || 'Publication details unavailable'}</span>
                            <span class="pub-year-pill">${publication.year}</span>
                          </div>
                          <p class="pub-citation">${formatCitation(entry)}</p>
                        </div>
                      </li>
                    `
                    }
                  )
                  .join('')}
              </ol>
            </details>
          `;
        })
        .join('')}
    `;
  } catch (error) {
    console.error(error);
    root.innerHTML = `<p class="timeline-text">Could not load publications from <code>${CITATIONS_URL}</code>.</p>`;
  }
}

function initPublicationModal() {
  const modal = document.getElementById('publication-modal');
  const closeButton = document.querySelector('.modal-close');

  if (!modal || !closeButton) {
    return;
  }

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPublicationModal();
  renderPublicationCards();
  renderPublicationList();
});
