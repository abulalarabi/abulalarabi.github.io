'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('talk-section');

  if (!root) {
    return;
  }

  function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.textContent) {
      element.textContent = options.textContent;
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          element.setAttribute(name, value);
        }
      });
    }

    return element;
  }

  function parseTalkTitle(title) {
    const parts = String(title || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length <= 1) {
      return {
        headline: title || 'Talk',
        context: 'Talk archive'
      };
    }

    return {
      headline: parts[0],
      context: parts.slice(1).join(' • ')
    };
  }

  async function getTalkImages(basePath) {
    if (!basePath) {
      return [];
    }

    try {
      const response = await fetch(`${basePath.replace(/\/+$/, '')}/index.json`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Missing image manifest');
      }

      const files = await response.json();

      if (!Array.isArray(files)) {
        throw new Error('Invalid image manifest');
      }

      return files.map((file) => (/^https?:\/\//.test(file) ? file : `${basePath.replace(/\/+$/, '')}/${file}`));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function initTalkGallery(gallery) {
    if (typeof lightGallery !== 'function' || !gallery) {
      return;
    }

    lightGallery(gallery, {
      selector: '.talks-thumb',
      plugins: [lgThumbnail, lgZoom],
      thumbnail: true,
      zoom: true,
      download: false,
      speed: 300,
      licenseKey: '0000-0000-000-0000'
    });
  }

  async function buildTalkCard(talk, index) {
    const images = await getTalkImages(talk.images);
    const { headline, context } = parseTalkTitle(talk['project-name']);

    const card = createElement('div', { className: 'talks-card' });
    const frame = createElement('div', { className: 'talks-frame' });
    const media = createElement('div', { className: 'talks-media' });
    const galleryAnchors = [];

    if (images.length > 0) {
      const heroLink = createElement('a', {
        className: 'talks-hero-link',
        attributes: {
          href: images[0]
        }
      });
      const heroImage = createElement('img', {
        className: 'talks-hero-image',
        attributes: {
          src: images[0],
          alt: headline,
          loading: 'lazy'
        }
      });
      const mediaBadge = createElement('div', {
        className: 'talks-media-badge',
        textContent: `${images.length} photo${images.length > 1 ? 's' : ''}`
      });
      const indexBadge = createElement('div', {
        className: 'talks-index-badge',
        textContent: `Talk ${String(index + 1).padStart(2, '0')}`
      });

      heroLink.addEventListener('click', (event) => {
        if (!galleryAnchors.length) {
          return;
        }

        event.preventDefault();
        galleryAnchors[0].click();
      });

      heroLink.appendChild(heroImage);
      media.appendChild(heroLink);
      media.appendChild(mediaBadge);
      media.appendChild(indexBadge);
    } else {
      media.appendChild(
        createElement('div', {
          className: 'talks-hero-empty',
          textContent: 'Gallery is being organized for this talk.'
        })
      );
    }

    const body = createElement('div', { className: 'talks-body' });
    const eyebrow = createElement('p', {
      className: 'talks-eyebrow',
      textContent: 'Speaking Highlight'
    });
    const title = createElement('h3', {
      className: 'talks-title',
      textContent: headline
    });
    const metaRow = createElement('div', { className: 'talks-meta-row' });
    const contextPill = createElement('span', {
      className: 'talks-pill',
      textContent: context || 'Featured event'
    });

    metaRow.appendChild(contextPill);

    body.appendChild(eyebrow);
    body.appendChild(title);
    body.appendChild(metaRow);

    if (talk.descriptions) {
      body.appendChild(
        createElement('p', {
          className: 'talks-description',
          textContent: talk.descriptions
        })
      );
    }

    if (images.length > 1) {
      const galleryLabel = createElement('p', {
        className: 'talks-gallery-label',
        textContent: 'Snapshots'
      });
      const gallery = createElement('div', {
        className: 'talks-gallery',
        attributes: { id: `talk-gallery-${index}` }
      });

      images.forEach((imageSrc, imageIndex) => {
        const thumb = createElement('a', {
          className: 'talks-thumb',
          attributes: {
            href: imageSrc,
            'data-sub-html': `${headline} • ${imageIndex + 1} / ${images.length}`
          }
        });
        const thumbImage = createElement('img', {
          attributes: {
            src: imageSrc,
            alt: `${headline} image ${imageIndex + 1}`,
            loading: 'lazy'
          }
        });

        thumb.appendChild(thumbImage);
        gallery.appendChild(thumb);
        galleryAnchors.push(thumb);
      });

      body.appendChild(galleryLabel);
      body.appendChild(gallery);
      queueMicrotask(() => initTalkGallery(gallery));
    } else if (images.length === 1) {
      const singleGallery = createElement('div', {
        className: 'talks-gallery talks-gallery-hidden',
        attributes: { id: `talk-gallery-${index}` }
      });
      const thumb = createElement('a', {
        className: 'talks-thumb',
        attributes: {
          href: images[0],
          'data-sub-html': `${headline} • ${context || 'Talk archive'}`
        }
      });

      singleGallery.appendChild(thumb);
      body.appendChild(singleGallery);
      galleryAnchors.push(thumb);
      queueMicrotask(() => initTalkGallery(singleGallery));
    }

    frame.appendChild(media);
    frame.appendChild(body);
    card.appendChild(frame);

    return card;
  }

  async function renderTalks() {
    root.innerHTML = `
      <section class="talks-shell">
        <div class="talks-grid" id="talks-grid"></div>
      </section>
    `;

    const grid = document.getElementById('talks-grid');

    try {
      const response = await fetch('./info/talks.json', { cache: 'no-store' });
      const items = await response.json();

      if (!response.ok || !Array.isArray(items)) {
        throw new Error('Invalid talks data source');
      }

      for (const [index, item] of items.entries()) {
        const card = await buildTalkCard(item, index);
        grid.appendChild(card);
      }
    } catch (error) {
      console.error(error);
      grid.appendChild(
        createElement('div', {
          className: 'proj-error',
          textContent: 'Failed to load talks. Please check info/talks.json.'
        })
      );
    }
  }

  renderTalks();
});
