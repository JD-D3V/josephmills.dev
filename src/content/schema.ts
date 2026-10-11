import { z } from 'astro/zod';
import type { ZodType } from 'astro/zod';
import type { ImageMetadata } from 'astro';

export function projectSchema<T extends ZodType>(image: () => T) {
  const mediaItem = z.discriminatedUnion('type', [
    z.object({ type: z.literal('image'), src: image(), alt: z.string() }),
    z.object({
      type: z.literal('clip'),
      src: z.string().startsWith('/media/'),
      poster: z.string(),
      alt: z.string(),
    }),
    z.object({ type: z.literal('youtube'), id: z.string().regex(/^[\w-]{11}$/), alt: z.string() }),
  ]);

  return z.object({
    title: z.string(),
    order: z.number(),
    category: z.string(),
    tech: z.string(),
    stats: z.array(z.string()).default([]),
    links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
    media: z.array(mediaItem).default([]),
  });
}

export type Project = z.infer<ReturnType<typeof projectSchema<ZodType<ImageMetadata>>>>;
export type MediaItem = Project['media'][number];
