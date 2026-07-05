// Global site data — edit via the CMS (全站設定) which writes src/data/site.json.
import site from './data/site.json';

export const SITE_TITLE = site.title;
export const SITE_DESCRIPTION = site.description;
export const SITE_NAV = site.nav;
export const SITE_CTA = { label: site.ctaLabel, href: site.ctaHref };
export const SITE_FOOTER_TEXT = site.footerText;
export const SITE_SOCIALS = site.socials;
