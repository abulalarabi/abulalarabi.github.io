'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!window.ContentCards) {
    return;
  }

  window.ContentCards.renderCardCollection({
    rootId: 'projects-section',
    dataUrl: './info/projects.json',
    emptyMessage: 'Failed to load projects. Please check info/projects.json.'
  });
});
