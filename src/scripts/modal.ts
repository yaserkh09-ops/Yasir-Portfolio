/**
 * Project modals. Native <dialog> gives focus trap, ESC and top-layer for
 * free; this wires the card anchors (whose no-JS fallback is #contact),
 * backdrop-click close, scroll lock, and focus return. Runs on both the
 * motion and reduced-motion paths — the open animation is CSS and dies
 * under the global reduced-motion kill switch.
 */
export const initModals = () => {
  document.querySelectorAll<HTMLElement>('[data-work-card]').forEach((card) => {
    const anchor = card.querySelector<HTMLAnchorElement>('.card-anchor');
    const dialog = card.querySelector<HTMLDialogElement>('[data-work-modal]');
    if (!anchor || !dialog || typeof dialog.showModal !== 'function') return;

    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
      document.documentElement.dataset.modalOpen = '1';
    });

    // click on the backdrop area (the dialog element itself) closes
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.querySelector('[data-modal-close]')?.addEventListener('click', () => dialog.close());

    dialog.addEventListener('close', () => {
      delete document.documentElement.dataset.modalOpen;
      anchor.focus();
    });
  });
};
