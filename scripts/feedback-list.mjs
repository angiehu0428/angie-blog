#!/usr/bin/env node
// 列出所有心得問卷(從 Cloudflare KV 讀,只印在終端機,不存檔):npm run fb:list
// 通知沒送到 Telegram 的會標「⚠️ 通知失敗」。
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const kv = (...a) => execFileSync('npx', ['wrangler', 'kv', ...a, '--binding', 'FEEDBACK', '--remote'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const keys = JSON.parse(kv('key', 'list', '--prefix', 'fb:')).map((k) => k.name);
const status = { new: '未審', public: '已公開', hidden: '不公開' };
for (const k of keys) {
	const f = JSON.parse(kv('key', 'get', k));
	console.log(`\n${f.createdAt.slice(0, 16)}|${status[f.status] || f.status}|${f.publish}${f.notifyFailed ? '|⚠️ 通知失敗' : ''}`);
	console.log(`${f.name}|${f.title || ''}|${f.company}|${f.email}`);
	console.log(`滿意度 ${f.rating ?? '-'}/5|${f.expect || '-'}|推薦 ${f.nps ?? '-'}/10`);
	console.log(`收穫:${f.gain}`);
	if (f.improve) console.log(`改進:${f.improve}`);
}
console.log(`\n共 ${keys.length} 份`);
