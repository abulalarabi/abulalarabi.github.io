'use strict';

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const closing = new WeakMap();

  function animate(element, frames, duration, fill = 'none') {
    if (reducedMotion.matches || !element.animate) return null;
    return element.animate(frames, { duration, fill, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }

  function reveal(element, distance = 8) {
    element.getAnimations?.().forEach((animation) => animation.cancel());
    animate(element, [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ], 280);
  }

  function openDialog(dialog, focusTarget) {
    const content = dialog.querySelector('.modal-content');
    document.documentElement.classList.add('dialog-open');
    dialog.showModal();
    document.dispatchEvent(new CustomEvent('dialogchange', { detail: { open: true } }));
    content.scrollTop = 0;
    focusTarget.focus({ preventScroll: true });
    animate(dialog, [{ opacity: 0 }, { opacity: 1 }], 220);
    animate(content, [
      { opacity: 0, transform: 'translateY(14px) scale(0.97)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], 320);
  }

  function closeDialog(dialog) {
    if (closing.has(dialog)) return closing.get(dialog);
    if (!dialog.open) return Promise.resolve();
    const content = dialog.querySelector('.modal-content');
    const animations = [dialog, content].map((element) => {
      if (reducedMotion.matches || !element.animate) return null;
      const style = getComputedStyle(element);
      const from = { opacity: style.opacity, transform: style.transform };
      element.getAnimations().forEach((animation) => animation.cancel());
      return animate(element, [from, { opacity: 0, transform: element === content ? 'translateY(8px) scale(0.98)' : 'none' }], 160, 'forwards');
    }).filter(Boolean);
    if (!animations.length) {
      dialog.close();
      return Promise.resolve();
    }
    const finished = Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (dialog.open) dialog.close();
    });
    closing.set(dialog, finished);
    return finished;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('dialog.modal').forEach((dialog) => {
      dialog.querySelector('.modal-close').addEventListener('click', () => closeDialog(dialog));
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeDialog(dialog);
      });
      dialog.addEventListener('close', () => {
        closing.delete(dialog);
        [dialog, dialog.querySelector('.modal-content')].forEach((element) => {
          element.getAnimations?.().forEach((animation) => animation.cancel());
        });
        dialog.querySelectorAll('[data-dialog-media]').forEach((media) => media.replaceChildren());
        if (!document.querySelector('dialog[open]')) {
          document.documentElement.classList.remove('dialog-open');
          document.dispatchEvent(new CustomEvent('dialogchange', { detail: { open: false } }));
        }
      });
    });
  });

  window.SiteMotion = { reveal, openDialog, closeDialog };
})();
