// Reveals the "Copy" buttons (hidden without JS) and copies their data-copy value.
export function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((btn) => {
    if (!navigator.clipboard) return;
    btn.hidden = false;
    let timer: number | undefined;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      } catch {
        return; // blocked clipboard: leave the button as is
      }
      btn.textContent = 'Copied';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (btn.textContent = 'Copy'), 1500);
    });
  });
}
