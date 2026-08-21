#!/usr/bin/env node
// 把顧問履歷的內容與照片上傳到 Cloudflare KV(binding: CV)。
//
// 用法:npm run cv:push
//
// 讀這兩個地方(都在 private/,已 gitignore,永遠不會進公開 repo):
//   private/cv/cv.json      履歷內容
//   private/cv/photos/*     照片(jpg / png / webp / gif / avif)
//
// 照片檔名就是履歷裡 photos 欄位要寫的名字。檔名只能用英數、底線、減號、點。

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CV_DIR = join(ROOT, 'private', 'cv');
const CV_JSON = join(CV_DIR, 'cv.json');
const PHOTO_DIR = join(CV_DIR, 'photos');
const BINDING = 'CV';

const MIME = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.avif': 'image/avif',
};

function die(msg) {
	console.error(`\n✖ ${msg}\n`);
	process.exit(1);
}

function kvPut(key, filePath, metadata) {
	const args = ['wrangler', 'kv', 'key', 'put', key, '--path', filePath, '--binding', BINDING, '--remote'];
	if (metadata) args.push('--metadata', JSON.stringify(metadata));
	execFileSync('npx', args, { cwd: ROOT, stdio: 'inherit' });
}

// ── 檢查 ──
if (!existsSync(CV_JSON)) {
	die(
		`找不到 ${CV_JSON}\n\n` +
			`  請先建立 private/cv/cv.json(可以複製 scripts/cv.example.json 改),\n` +
			`  照片放 private/cv/photos/。`
	);
}

let cv;
try {
	cv = JSON.parse(readFileSync(CV_JSON, 'utf8'));
} catch (e) {
	die(`private/cv/cv.json 不是合法的 JSON:${e.message}`);
}

const photos = existsSync(PHOTO_DIR)
	? readdirSync(PHOTO_DIR).filter((f) => !f.startsWith('.') && MIME[extname(f).toLowerCase()])
	: [];

const badNames = photos.filter((f) => !/^[A-Za-z0-9._-]{1,120}$/.test(f));
if (badNames.length) {
	die(`這些照片檔名有問題(只能用英數、底線、減號、點,不能有空格或中文):\n  ${badNames.join('\n  ')}`);
}

// 履歷裡點名的照片,檔案要真的在
const referenced = new Set();
for (const s of cv.slides || []) referenced.add(typeof s === 'string' ? s : s.file);
for (const job of cv.experience || []) {
	for (const p of job.photos || []) referenced.add(typeof p === 'string' ? p : p.file);
}
const missing = [...referenced].filter((f) => !photos.includes(f));
if (missing.length) {
	die(`履歷裡寫到這些照片,但 private/cv/photos/ 裡找不到:\n  ${missing.join('\n  ')}`);
}

const unused = photos.filter((f) => !referenced.has(f));

// ── 上傳 ──
console.log(`\n上傳履歷內容 → KV(${BINDING})`);
kvPut('cv.json', CV_JSON);

for (const f of photos) {
	console.log(`上傳照片 ${f}`);
	kvPut(`photo/${f}`, join(PHOTO_DIR, f), { contentType: MIME[extname(f).toLowerCase()] });
}

console.log(`\n✓ 完成:履歷內容 + ${photos.length} 張照片。`);
if (unused.length) {
	console.log(`\n提醒:這些照片上傳了但履歷裡沒用到 —— ${unused.join('、')}`);
}
console.log(`\n看結果:https://angiehu.com/consulting-cv\n`);
