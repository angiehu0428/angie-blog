// 共用的 JSON-LD 結構化資料(給 Google 與 AI 搜尋引擎看)
export const PERSON = {
	'@type': 'Person',
	'@id': 'https://angiehu.com/#angie',
	name: 'Angie Hu',
	alternateName: '胡珮甄',
	url: 'https://angiehu.com',
	jobTitle: 'Founder, Art & IP Licensing Agent',
	worksFor: {
		'@type': 'Organization',
		name: 'Hu Creates Co., Ltd. 胡創有限公司',
		url: 'https://www.hucreates.com',
	},
	alumniOf: 'Art Center College of Design',
	knowsAbout: [
		'IP licensing',
		'character licensing',
		'concept art',
		'AI tools',
		'角色授權',
		'圖像授權',
	],
	sameAs: [
		'https://www.hucreates.com',
		'https://www.instagram.com/hupaints',
		'https://www.facebook.com/hupaints',
		'https://www.behance.net/angiehu',
	],
};

export function websiteSchema(title: string, description: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: title,
		description,
		url: 'https://angiehu.com',
		inLanguage: 'zh-Hant',
		author: PERSON,
	};
}

export function toolSchema(t: {
	name: string;
	desc: string;
	pageUrl: string;
	href?: string;
	cover?: string;
	keywords?: string[];
	isInternal: boolean;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: t.name,
		description: t.desc,
		url: t.isInternal ? t.pageUrl : t.href || t.pageUrl,
		applicationCategory: 'WebApplication',
		operatingSystem: 'Web',
		...(t.cover ? { image: new URL(t.cover, 'https://angiehu.com').href } : {}),
		...(t.keywords?.length ? { keywords: t.keywords.join(', ') } : {}),
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		author: PERSON,
	};
}

export function blogPostSchema(p: {
	title: string;
	description: string;
	pageUrl: string;
	datePublished: Date;
	dateModified?: Date;
	image?: string;
	keywords?: string[];
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: p.title,
		description: p.description,
		url: p.pageUrl,
		datePublished: p.datePublished.toISOString(),
		...(p.dateModified ? { dateModified: p.dateModified.toISOString() } : {}),
		...(p.image ? { image: new URL(p.image, 'https://angiehu.com').href } : {}),
		...(p.keywords?.length ? { keywords: p.keywords.join(', ') } : {}),
		inLanguage: 'zh-Hant',
		author: PERSON,
		publisher: PERSON,
	};
}

export function personPageSchema() {
	return {
		'@context': 'https://schema.org',
		...PERSON,
	};
}
