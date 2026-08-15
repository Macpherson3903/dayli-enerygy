/** Yield so the browser can paint (spinner, styles) before blocking work like print or a server action. */
export function afterNextPaint(task: () => void | Promise<void>): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        void Promise.resolve(task());
      }, 0);
    });
  });
}

export function runSizingPrint(): void {
  const body = document.body;
  const cleanup = () => {
    body.classList.remove("sizing-print-mode");
    window.removeEventListener("afterprint", cleanup);
  };
  body.classList.add("sizing-print-mode");
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1000);
}
