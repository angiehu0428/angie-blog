// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import remarkMedia from './src/plugins/remark-media.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://angiehu.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [remarkMedia],
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-grotesk',
			weights: [500, 700],
			fallbacks: ['sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'DM Sans',
			cssVariable: '--font-dmsans',
			weights: [400, 500, 700],
			fallbacks: ['sans-serif'],
		},
	],
});
