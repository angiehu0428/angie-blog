#!/usr/bin/env node
// 建立/更新諮詢心得問卷的邀請連結,上傳到 Cloudflare KV(binding: FEEDBACK)。
//
// 用法:npm run fb:invite
//
// 讀 private/feedback/invites.json(已 gitignore,課程名單與公司名稱永遠不進公開 repo)。格式:
// [
//   { "kind": "course", "title": "課程名稱", "date": "2026/10/11", "companies": ["公司 A", "公司 B"] },
//   { "kind": "person", "title": "課程名稱", "date": "", "name": "王小明", "company": "公司 A", "oneDate": "10/15" }
// ]
// 沒有 code 的會自動產生一個隨機邀請碼並寫回檔案;改內容後再跑一次就會更新(連結不變)。

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..');
const FILE = join(ROOT, 'private', 'feedback', 'invites.json');
if (!existsSync(FILE)) {
	console.error(`\n✖ 找不到 ${FILE}(格式見這支腳本最上面的說明)\n`);
	process.exit(1);
}
const list = JSON.parse(readFileSync(FILE, 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'fb-'));
try {
	for (const inv of list) {
		if (!inv.code) inv.code = randomBytes(6).toString('base64url');
		const { code, ...data } = inv;
		const f = join(tmp, code + '.json');
		writeFileSync(f, JSON.stringify(data));
		execFileSync('npx', ['wrangler', 'kv', 'key', 'put', 'invite:' + code, '--path', f, '--binding', 'FEEDBACK', '--remote'], {
			cwd: ROOT,
			stdio: ['ignore', 'ignore', 'inherit'],
		});
		const who = inv.kind === 'person' ? `${inv.name}(${inv.company})` : `${inv.title}(課程共用)`;
		console.log(`✓ ${who}\n  https://angiehu.com/feedback/?c=${code}`);
	}
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
writeFileSync(FILE, JSON.stringify(list, null, '\t') + '\n');
