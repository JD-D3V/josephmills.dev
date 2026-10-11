import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://josephmills.dev',
  output: 'static',
  integrations: [sitemap()],
});
