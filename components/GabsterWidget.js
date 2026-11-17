'use client';

import { useEffect } from 'react';

/**
 * Loads the Gabster chat widget (gabster.ai) configured from the Super Admin panel.
 * When no script is configured we render a friendly local helper card instead,
 * so the assistant slot is always visible and never breaks the page.
 */
export default function GabsterWidget({ script }) {
  useEffect(() => {
    if (!script) return undefined;
    const container = document.createElement('div');
    container.id = 'gabster-widget-root';
    container.innerHTML = script;
    document.body.appendChild(container);
    // Re-inserting via innerHTML does not execute <script> tags; do it manually.
    Array.from(container.querySelectorAll('script')).forEach((old) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((attr) => s.setAttribute(attr.name, attr.value));
      s.text = old.textContent || '';
      old.parentNode.replaceChild(s, old);
    });
    return () => {
      container.remove();
    };
  }, [script]);

  if (script) return null;

  return (
    <a
      href="https://gabster.ai"
      target="_blank"
      rel="noreferrer noopener"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-white shadow-2xl transition hover:bg-ink-800"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg">
        💬
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold">Gabster Assistant</span>
        <span className="block text-[11px] text-ink-300">Need help? Ask me anything</span>
      </span>
    </a>
  );
}
