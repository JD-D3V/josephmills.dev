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

function renderItem(item: GalleryItem, stage: HTMLElement): void {
  stage.replaceChildren();
  if (item.type === 'image') {
    stage.append(el('img', { src: item.src, alt: item.alt }));
  } else if (item.type === 'clip') {
    const video = el('video', { src: item.src, poster: item.poster, controls: true, loop: true, muted: true, playsInline: true });
    video.setAttribute('aria-label', item.alt);
    stage.append(video);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
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
      stage.replaceChildren(frame);
    });
    stage.append(play);
  }
}

function stopMedia(dialog: HTMLDialogElement): void {
  dialog.querySelectorAll('video').forEach((v) => v.pause());
  dialog.querySelectorAll('iframe').forEach((f) => f.remove());
}

function bind(dialog: HTMLDialogElement): (index: number, opener: HTMLElement) => void {
  const projectId = dialog.dataset.galleryDialog ?? '';
  const items = readItems(projectId);
  const stage = dialog.querySelector<HTMLElement>('.gallery__stage')!;
  const counter = dialog.querySelector<HTMLElement>('.gallery__counter')!;
  const caption = dialog.querySelector<HTMLElement>('.gallery__caption')!;
  const prev = dialog.querySelector<HTMLButtonElement>('.gallery__prev')!;
  const next = dialog.querySelector<HTMLButtonElement>('.gallery__next')!;
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = i;
    renderItem(items[index], stage);
    counter.textContent = `${index + 1} / ${items.length}`;
    caption.textContent = items[index].alt;
  };
  const step = (delta: number) => show(stepIndex(index, delta, items.length));

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
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  dialog.addEventListener('close', () => {
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

  return (i, from) => {
    if (!items.length) return;
    opener = from;
    show(Math.min(i, items.length - 1));
    dialog.showModal();
  };
}

export function initGallery(): void {
  const openers = new Map<string, (index: number, opener: HTMLElement) => void>();
  document.querySelectorAll<HTMLDialogElement>('dialog[data-gallery-dialog]').forEach((d) => openers.set(d.dataset.galleryDialog ?? '', bind(d)));

  document.addEventListener('click', (e) => {
    const trigger = (e.target as Element).closest<HTMLElement>('[data-gallery]');
    if (!trigger) return;
    openers.get(trigger.dataset.gallery ?? '')?.(Number(trigger.dataset.index ?? 0), trigger);
  });
}
