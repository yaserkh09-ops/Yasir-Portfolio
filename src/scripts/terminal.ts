import { reducedMotion } from './env';

interface Metrics {
  performance: number | null;
  accessibility: number | null;
  satisfaction: number | null;
}

/** Pass thresholds — a dot springs in only when its value meets target. */
const TARGETS = {
  performance: (v: number) => v >= 95,
  accessibility: (v: number) => v >= 100,
  satisfaction: (v: number) => v >= 100,
};

const display = {
  performance: (v: number | null) => (v === null ? '—' : String(Math.round(v))),
  accessibility: (v: number | null) => (v === null ? '—' : String(Math.round(v))),
  satisfaction: (v: number | null) => (v === null ? '—' : `${Math.round(v)}%`),
};

const TYPE_MS = 14; // per character

const typeInto = (el: HTMLElement, text: string): Promise<void> => {
  const caret = document.createElement('span');
  caret.className = 't-caret';
  el.textContent = '';
  el.append(caret);
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      if (i < text.length) {
        caret.before(text[i] as string);
        i += 1;
        setTimeout(step, TYPE_MS);
      } else {
        caret.remove();
        resolve();
      }
    };
    step();
  });
};

/**
 * Types real metrics from /metrics.json into the glass terminal.
 * Honesty rule: nulls render as em-dash, never as a number, and never
 * earn a pass-dot. Reduced motion: values fill instantly, same content.
 * aria-live: the visual layer is hidden from SR during typing; the final
 * values are announced exactly once via the sr-only live region.
 */
export const initTerminal = async () => {
  const root = document.querySelector<HTMLElement>('[data-terminal]');
  if (!root) return;

  const body = root.querySelector<HTMLElement>('[data-terminal-body]')!;
  const sr = root.querySelector<HTMLElement>('[data-terminal-sr]')!;
  const notMeasured = root.dataset.notMeasured ?? 'not yet measured';

  let metrics: Metrics = { performance: null, accessibility: null, satisfaction: null };
  try {
    const res = await fetch('/metrics.json');
    if (res.ok) metrics = { ...metrics, ...(await res.json()) };
  } catch {
    /* offline — render dashes */
  }

  const values: Record<keyof typeof TARGETS, number | null> = {
    performance: metrics.performance,
    accessibility: metrics.accessibility,
    satisfaction: metrics.satisfaction,
  };

  const rows = [...root.querySelectorAll<HTMLElement>('[data-t-row]')];

  const setRow = (row: HTMLElement) => {
    const valEl = row.querySelector<HTMLElement>('[data-t-val]')!;
    const key = valEl.dataset.tVal as keyof typeof TARGETS;
    const value = values[key];
    valEl.textContent = display[key](value);
    const dot = row.querySelector<HTMLElement>('[data-t-dot]')!;
    if (value !== null && TARGETS[key](value)) {
      dot.hidden = false;
      dot.classList.add('is-pass');
    }
  };

  const announce = () => {
    const parts = rows.map((row) => {
      const key = row.querySelector('[data-t-key]')!.textContent!.trim();
      const valEl = row.querySelector<HTMLElement>('[data-t-val]')!;
      const value = values[valEl.dataset.tVal as keyof typeof TARGETS];
      return `${key}: ${value === null ? notMeasured : valEl.textContent}`;
    });
    sr.textContent = parts.join('. ') + '.';
  };

  if (reducedMotion()) {
    rows.forEach(setRow);
    announce();
    return;
  }

  // typed sequence — visual only, SR sees the one-shot summary at the end
  body.setAttribute('aria-hidden', 'true');
  const cmd = body.querySelector<HTMLElement>('[data-t-cmd]')!;
  const cmdText = cmd.textContent!.trim();
  const keyTexts = rows.map((r) => r.querySelector('[data-t-key]')!.textContent!.trim());
  rows.forEach((r) => (r.style.visibility = 'hidden'));

  await typeInto(cmd, cmdText);
  for (const [i, row] of rows.entries()) {
    row.style.visibility = '';
    await typeInto(row.querySelector<HTMLElement>('[data-t-key]')!, keyTexts[i] as string);
    setRow(row);
  }
  body.removeAttribute('aria-hidden');
  announce();
};
