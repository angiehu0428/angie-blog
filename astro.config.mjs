// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import remarkMedia from './src/plugins/remark-media.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://angiehu.com',
	// 顧問履歷是密碼保護的私人頁面,不要放進 sitemap 幫搜尋引擎指路
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/consulting-cv') })],
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
