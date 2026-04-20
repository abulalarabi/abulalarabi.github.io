'use strict';

(function () {
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

  function toYouTubeEmbedUrl(url) {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes('youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      if (parsedUrl.hostname === 'youtu.be') {
        const videoId = parsedUrl.pathname.replace('/', '');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
    } catch (error) {
      return url;
    }

    return url;
  }

  async function appendImageGallery(card, project, index) {
    if (typeof project.images !== 'string' || project.images.trim() === '') {
      return 0;
    }

    const galleryWrapper = createElement('div', { className: 'proj-gallery' });
    galleryWrapper.appendChild(
      createElement('p', {
        className: 'proj-section-label',
        textContent: 'Gallery'
      })
    );
    const galleryStrip = createElement('div', {
      className: 'proj-gallery-strip',
      attributes: { id: `proj-gallery-${index}` }
    });

    galleryWrapper.appendChild(galleryStrip);

    try {
      const basePath = project.images.replace(/\/+$/, '');
      const response = await fetch(`${basePath}/index.json`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Missing image manifest');
      }

      const files = await response.json();

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Empty image manifest');
      }

      files.forEach((file, imageIndex) => {
        const source = /^https?:\/\//.test(file) ? file : `${basePath}/${file}`;
        const anchor = createElement('a', {
          className: 'proj-thumb',
          attributes: {
            href: source,
            'data-sub-html': `${project['project-name'] || 'Project'} • ${imageIndex + 1} / ${files.length}`
          }
        });

        const image = createElement('img', {
          attributes: {
            src: source,
            alt: `${project['project-name'] || 'Project'} image ${imageIndex + 1}`,
            loading: 'lazy'
          }
        });

        anchor.appendChild(image);
        galleryStrip.appendChild(anchor);
      });

      if (typeof lightGallery === 'function') {
        lightGallery(galleryStrip, {
          selector: '.proj-thumb',
          plugins: [lgThumbnail, lgZoom],
          thumbnail: true,
          zoom: true,
          download: false,
          speed: 300,
          licenseKey: '0000-0000-000-0000'
        });
      }
    } catch (error) {
      galleryWrapper.appendChild(
        createElement('div', {
          className: 'proj-gallery-empty',
          textContent: 'No image manifest found for this entry.'
        })
      );
    }

    card.appendChild(galleryWrapper);
    return galleryStrip.querySelectorAll('.proj-thumb').length;
  }

  async function buildProjectCard(project, index) {
    const card = createElement('div', { className: 'proj-card' });
    const hasVideos = Array.isArray(project.videos) && project.videos.length > 0;

    const header = createElement('div', { className: 'proj-card-header' });
    const heading = createElement('div', { className: 'proj-heading' });
    const meta = createElement('div', { className: 'proj-meta' });

    heading.appendChild(
      createElement('h3', {
        className: 'proj-title',
        textContent: project['project-name'] || 'Untitled Project'
      })
    );
    header.appendChild(heading);

    if (hasVideos) {
      meta.appendChild(
        createElement('span', {
          className: 'proj-chip',
          textContent: `${project.videos.length} demo${project.videos.length > 1 ? 's' : ''}`
        })
      );
    }

    header.appendChild(meta);
    card.appendChild(header);

    const layout = createElement('div', { className: 'proj-card-layout' });
    const summary = createElement('div', { className: 'proj-summary' });
    const mediaStack = createElement('div', { className: 'proj-media-stack' });

    if (project.descriptions) {
      summary.appendChild(
        createElement('p', {
          className: 'proj-desc',
          textContent: project.descriptions
        })
      );
    }

    if (hasVideos) {
      mediaStack.appendChild(
        createElement('p', {
          className: 'proj-section-label',
          textContent: 'Demos'
        })
      );

      const videosWrapper = createElement('div', { className: 'proj-videos' });

      project.videos.forEach((videoUrl) => {
        const frame = createElement('iframe', {
          className: 'proj-video-frame',
          attributes: {
            src: toYouTubeEmbedUrl(videoUrl),
            title: 'Project video',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: 'true',
            loading: 'lazy'
          }
        });

        const videoCard = createElement('div', { className: 'proj-video-card' });
        videoCard.appendChild(frame);
        videosWrapper.appendChild(videoCard);
      });

      mediaStack.appendChild(videosWrapper);
    }

    const imageCount = await appendImageGallery(mediaStack, project, index);

    if (imageCount > 0) {
      meta.appendChild(
        createElement('span', {
          className: 'proj-chip',
          textContent: `${imageCount} image${imageCount > 1 ? 's' : ''}`
        })
      );
    }

    if (!mediaStack.childElementCount) {
      mediaStack.appendChild(
        createElement('div', {
          className: 'proj-gallery-empty',
          textContent: 'No media available for this entry yet.'
        })
      );
    }

    layout.appendChild(summary);
    layout.appendChild(mediaStack);
    card.appendChild(layout);

    return card;
  }

  async function renderCardCollection({ rootId, dataUrl, emptyMessage }) {
    const root = document.getElementById(rootId);

    if (!root) {
      return;
    }

    root.innerHTML = '';

    const list = createElement('div', { className: 'proj-list' });
    root.appendChild(list);

    try {
      const response = await fetch(dataUrl, { cache: 'no-store' });
      const items = await response.json();

      if (!response.ok || !Array.isArray(items)) {
        throw new Error('Invalid data source');
      }

      for (const [index, item] of items.entries()) {
        const card = await buildProjectCard(item, index);
        list.appendChild(card);
      }
    } catch (error) {
      root.appendChild(
        createElement('div', {
          className: 'proj-error',
          textContent: emptyMessage
        })
      );
    }
  }

  window.ContentCards = {
    renderCardCollection,
    toYouTubeEmbedUrl
  };
})();
