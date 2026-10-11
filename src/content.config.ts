import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from './content/schema';

const patterns = ['src/content/projects/*.md'];
if (process.env.PORTFOLIO_FIXTURES === '1') patterns.push('tests/fixtures/projects/*.md');

const projects = defineCollection({
  loader: glob({ pattern: patterns, base: '.', generateId: ({ entry }) => entry.replace(/^.*\//, '').replace(/\.md$/, '') }),
  schema: ({ image }) => projectSchema(image),
});

export const collections = { projects };
