/**
 * Project modals. Native <dialog> gives focus trap, ESC and top-layer for
 * free; this wires the card anchors (whose no-JS fallback is #contact),
 * backdrop-click close, scroll lock, and focus return. Runs on both the
 * motion and reduced-motion paths — the open animation is CSS and dies
 * under the global reduced-motion kill switch.
 */
export const initModals = () => {
  // input-modality tracker: focus restored after a POINTER close must not
  // paint a focus ring on the card; keyboard (ESC/Tab) closes keep it
  let keyboardIntent = false;
  addEventListener('keydown', () => (keyboardIntent = true), true);
  addEventListener('pointerdown', () => (keyboardIntent = false), true);

  document.querySelectorAll<HTMLElement>('[data-work-card]').forEach((card) => {
    const anchor = card.querySelector<HTMLAnchorElement>('.card-anchor');
    const dialog = card.querySelector<HTMLDialogElement>('[data-work-modal]');
    if (!anchor || !dialog || typeof dialog.showModal !== 'function') return;

    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
      // focus the dialog itself, not its first button — otherwise mobile
      // browsers paint a focus ring on the close button after every tap
      dialog.focus();
      document.documentElement.dataset.modalOpen = '1';
    });

    // click on the backdrop area (the dialog element itself) closes
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.querySelector('[data-modal-close]')?.addEventListener('click', () => dialog.close());

    // secondary CTA: close first so the #contact jump lands on the page
    dialog.querySelector('[data-modal-contact]')?.addEventListener('click', () => dialog.close());

    dialog.addEventListener('close', () => {
      delete document.documentElement.dataset.modalOpen;
      if (!keyboardIntent) {
        anchor.classList.add('no-focus-ring');
        anchor.addEventListener('blur', () => anchor.classList.remove('no-focus-ring'), {
          once: true,
        });
      }
      anchor.focus({ preventScroll: true });
    });
  });

  // ---- contact popup: any [data-contact-open] CTA opens the centered
  //      dialog; the WhatsApp/Call links inside are plain anchors ----
  const contact = document.querySelector<HTMLDialogElement>('[data-contact-modal]');
  if (contact && typeof contact.showModal === 'function') {
    let opener: HTMLElement | null = null;
    document.querySelectorAll<HTMLElement>('[data-contact-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); // suppress the no-JS fallback (#contact / mailto)
        opener = btn;
        contact.showModal();
        contact.focus();
        document.documentElement.dataset.modalOpen = '1';
      });
    });
    contact.addEventListener('click', (e) => {
      if (e.target === contact) contact.close(); // backdrop click
    });
    contact.querySelector('[data-modal-close]')?.addEventListener('click', () => contact.close());
    contact.addEventListener('close', () => {
      delete document.documentElement.dataset.modalOpen;
      opener?.focus({ preventScroll: true });
    });
  }
};
