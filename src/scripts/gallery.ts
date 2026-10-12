export interface GalleryItem {
  type: 'image' | 'clip' | 'youtube';
  src?: string;
  alt: string;
  poster?: string;
  id?: string;
}

export function stepIndex(current: number, delta: number, length: number): number {
  return (((current + delta) % length) + length) % length;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
}

const SWIPE_THRESHOLD = 50;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] {
  return Object.assign(document.createElement(tag), props);
}

function readItems(projectId: string): GalleryItem[] {
  const node = document.querySelector(`script[data-gallery-items="${projectId}"]`);
  try {
    return node?.textContent ? (JSON.parse(node.textContent) as GalleryItem[]) : [];
  } catch {
    return [];
  }
}

function buildSlide(item: GalleryItem): HTMLElement {
  const slide = el('div', { className: 'gallery__slide' });
  if (item.type === 'image') {
    slide.append(el('img', { src: item.src, alt: item.alt, decoding: 'async' }));
  } else if (item.type === 'clip') {
    const video = el('video', { src: item.src, poster: item.poster, controls: true, loop: true, muted: true, playsInline: true });
    video.setAttribute('aria-label', item.alt);
    slide.append(video);
  } else {
    const play = el('button', { type: 'button', className: 'gallery__yt' });
    play.setAttribute('aria-label', `Play video: ${item.alt}`);
    play.append(
      el('img', { src: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`, alt: '' }),
      el('span', { className: 'gallery__yt-glyph', textContent: '▶' }),
    );
    play.addEventListener('click', () => {
      const frame = el('iframe', { src: youtubeEmbedUrl(item.id ?? ''), title: item.alt, allowFullscreen: true });
      frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      slide.replaceChildren(frame);
    });
    slide.append(play);
  }
  return slide;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const preloaded = new Set<string>();

function preload(item: GalleryItem | undefined): void {
  if (item?.type !== 'image' || !item.src || preloaded.has(item.src)) return;
  preloaded.add(item.src);
  const img = new Image();
  img.decoding = 'async';
  img.src = item.src;
  img.decode().catch(() => {});
}

function stopMedia(dialog: HTMLDialogElement): void {
  dialog.querySelectorAll('video').forEach((v) => v.pause());
  dialog.querySelectorAll('iframe').forEach((f) => f.remove());
}

function bind(dialog: HTMLDialogElement): { open: (index: number, opener: HTMLElement) => void; warm: (index: number) => void } {
  const projectId = dialog.dataset.galleryDialog ?? '';
  const items = readItems(projectId);
  const stage = dialog.querySelector<HTMLElement>('.gallery__stage')!;
  const counter = dialog.querySelector<HTMLElement>('.gallery__counter')!;
  const caption = dialog.querySelector<HTMLElement>('.gallery__caption')!;
  const prev = dialog.querySelector<HTMLButtonElement>('.gallery__prev')!;
  const next = dialog.querySelector<HTMLButtonElement>('.gallery__next')!;
  let index = 0;
  let opener: HTMLElement | null = null;
  let token = 0;

  const retire = (slide: Element, dir: number) => {
    slide.classList.remove('is-active');
    slide.setAttribute('inert', '');
    slide.setAttribute('aria-hidden', 'true');
    (slide as HTMLElement).style.setProperty('--dx', `${-dir * 24}px`);
    slide.querySelectorAll('video').forEach((v) => v.pause());
    setTimeout(() => slide.remove(), reducedMotion() ? 0 : 260);
  };

  const preloadAround = (i: number) => {
    preload(items[i]);
    preload(items[stepIndex(i, 1, items.length)]);
    preload(items[stepIndex(i, -1, items.length)]);
  };

  // swap: 'open' replaces everything, 'instant' (keyboard) swaps with no motion, 'slide' crossfades and slides.
  const show = (i: number, dir = 0, swap: 'open' | 'instant' | 'slide' = 'slide') => {
    const mine = ++token;
    index = i;
    counter.textContent = `${index + 1} / ${items.length}`;
    caption.textContent = items[index].alt;
    if (swap === 'open') stage.replaceChildren();
    const slide = buildSlide(items[index]);
    slide.style.setProperty('--dx', `${dir * 24}px`);
    if (swap === 'instant') slide.classList.add('is-instant');
    stage.append(slide);
    const img = slide.querySelector('img');
    const ready = img ? img.decode().catch(() => {}) : Promise.resolve();
    void ready.then(() => {
      if (mine !== token) return slide.remove();
      stage.querySelectorAll('.gallery__slide.is-active').forEach((old) => (swap === 'instant' ? old.remove() : retire(old, dir)));
      requestAnimationFrame(() => {
        if (mine !== token || !dialog.open) return slide.remove(); // superseded or closed before its first frame
        slide.classList.add('is-active');
        const video = slide.querySelector('video');
        if (video && !reducedMotion()) video.play().catch(() => {});
      });
      preloadAround(index);
    });
  };
  // Keyboard stepping repeats a lot, so it never animates; buttons and swipes crossfade and slide.
  const step = (delta: number, animate = true) =>
    show(stepIndex(index, delta, items.length), animate ? delta : 0, animate ? 'slide' : 'instant');

  if (items.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  dialog.querySelector('.gallery__close')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (items.length < 2) return;
    if (e.key === 'ArrowRight') step(1, false);
    else if (e.key === 'ArrowLeft') step(-1, false);
  });
  dialog.addEventListener('close', () => {
    token++; // cancel any slide that is still decoding or waiting for its first frame
    stopMedia(dialog);
    opener?.focus();
  });

  let startX = 0;
  dialog.addEventListener('touchstart', (e) => (startX = e.changedTouches[0].clientX), { passive: true });
  dialog.addEventListener(
    'touchend',
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (items.length > 1 && Math.abs(dx) >= SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );

  const warm = (i: number) => preloadAround(Math.min(i, items.length - 1));
  const open = (i: number, from: HTMLElement) => {
    if (!items.length) return;
    opener = from;
    show(Math.min(i, items.length - 1), 0, 'open');
    dialog.showModal();
  };
  return { open, warm };
}

export function initGallery(): void {
  const openers = new Map<string, (index: number, opener: HTMLElement) => void>();
  const warmUp = new Map<string, (index: number) => void>();
  document.querySelectorAll<HTMLDialogElement>('dialog[data-gallery-dialog]').forEach((d) => {
    const api = bind(d);
    openers.set(d.dataset.galleryDialog ?? '', api.open);
    warmUp.set(d.dataset.galleryDialog ?? '', api.warm);
  });

  const warm = (e: Event) => {
    const trigger = (e.target as Element).closest<HTMLElement>('[data-gallery]');
    if (trigger) warmUp.get(trigger.dataset.gallery ?? '')?.(Number(trigger.dataset.index ?? 0));
  };
  document.addEventListener('pointerover', warm);
  document.addEventListener('focusin', warm);

  document.addEventListener('click', (e) => {
    const trigger = (e.target as Element).closest<HTMLElement>('[data-gallery]');
    if (!trigger) return;
    openers.get(trigger.dataset.gallery ?? '')?.(Number(trigger.dataset.index ?? 0), trigger);
  });
}
