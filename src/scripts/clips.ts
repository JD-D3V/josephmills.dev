// Clips only autoplay when the visitor hasn't asked for reduced motion.
// Without JS (or with reduced motion) the poster frame is shown and nothing plays.
export function initClips(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll<HTMLVideoElement>('video[data-clip]').forEach((v) => {
    v.muted = true;
    v.setAttribute('autoplay', '');
    v.play().catch(() => {});
  });
}
