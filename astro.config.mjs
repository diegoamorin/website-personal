import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://diegoamorin.com',
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/real-estate': 'https://realestate.diegoamorin.com',
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
});
