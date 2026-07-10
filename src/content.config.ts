import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Banner image path (e.g. /uploads/xxx.jpg) — uploadable from the CMS.
			heroImage: z.string().optional(),
			tags: z.array(z.string()).default([]),
			keywords: z.array(z.string()).default([]), // SEO 關鍵字
		}),
});

const tools = defineCollection({
	loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		name: z.string(),
		icon: z.string().default('🛠️'),
		tag: z.string().optional(),
		desc: z.string(),
		cover: z.string().optional(), // 封面截圖 (/uploads/...)
		features: z.array(z.string()).default([]),
		href: z.string().optional(),
		status: z.enum(['live', 'internal', 'soon']).default('live'),
		badge: z.enum(['new', 'update']).optional(), // 卡片右上角斜紅貼紙:new=新工具 / update=有更新
		order: z.number().default(99),
		keywords: z.array(z.string()).default([]), // SEO 關鍵字(中英文都放)
		tags: z.array(z.string()).default([]), // 分類(首頁篩選用)
	}),
});

export const collections = { blog, tools };
