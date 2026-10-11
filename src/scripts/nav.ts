export function initNavHighlight(): void {
  const links = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]').forEach((a) => links.set(a.hash.slice(1), a));
  const sections = [...links.keys()].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a, id) => {
          if (id === entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
}
