// 心得問卷 worker 測試(記憶體 KV + 假 Telegram):node test/feedback.test.mjs
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { routeFeedback } from '../worker/feedback.js';

const store = new Map();
const KV = {
	get: async (k) => store.get(k) ?? null,
	put: async (k, v) => void store.set(k, v),
	delete: async (k) => void store.delete(k),
	list: async ({ prefix }) => ({ keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }),
};
const sent = [];
let tgOk = true;
globalThis.fetch = async (u, i) => (sent.push(JSON.parse(i.body)), new Response('{}', { status: tgOk ? 200 : 429 }));
const env = { FEEDBACK: KV, TG_BOT_TOKEN: 't', TG_CHAT_ID: '1', FEEDBACK_SECRET: 'sec' };
store.set('invite:course123', JSON.stringify({ kind: 'course', title: '工作坊', date: '', companies: ['A 公司'] }));
const call = async (path, init = {}) => {
	const url = new URL('https://angiehu.com' + path);
	const r = await routeFeedback(new Request(url, init), url, env);
	const t = await r.text();
	try { return { status: r.status, body: JSON.parse(t) }; } catch { return { status: r.status, body: t }; }
};
const post = (b) => call('/api/feedback', { method: 'POST', body: typeof b === 'string' ? b : JSON.stringify(b) });
const base = { c: 'course123', name: '王小明', company: 'A 公司', email: 'a@b.co', gain: '很有收穫', publish: 'named' };

assert.equal((await call('/api/feedback/invite?c=course123')).body.title, '工作坊');
assert.equal((await call('/api/feedback/invite?c=nope000')).status, 404);
assert.equal((await post('null')).status, 400, 'null body');
assert.equal((await post('[1]')).status, 400, 'array body');
assert.equal((await post({ ...base, consent: 'false' })).body.error, 'consent', 'string "false" is not consent');
assert.equal((await post({ ...base, c: 'badcode1', consent: true })).status, 403);
assert.equal((await post({ ...base, name: 123, consent: true })).body.error, 'missing fields', 'non-string name');

// 長文:通知一定帶得到公開連結、不超過 4096
sent.length = 0;
assert.equal((await post({ ...base, gain: '長'.repeat(3000), improve: '改'.repeat(3000), consent: true })).body.ok, true);
assert.ok(sent[0].text.length < 4096 && sent[0].text.includes('公開到網站'), 'link survives long text');

// Telegram 失敗:記下來
tgOk = false;
await post({ ...base, consent: true, gain: '通知失敗這份' });
tgOk = true;
const failed = [...store.entries()].filter(([k]) => k.startsWith('fb:')).map(([, v]) => JSON.parse(v)).find((x) => x.gain === '通知失敗這份');
assert.equal(failed.notifyFailed, true);

// 公開／收回:public 只讀公開版,收回就消失
const id = failed.id;
const sig = (a) => createHmac('sha256', 'sec').update(id + ':' + a).digest('base64url');
assert.equal((await call('/api/feedback/public')).body.items.length, 0);
assert.ok(String((await call(`/api/feedback/review?id=${id}&a=publish&s=${sig('publish')}`)).body).includes('要把這份放到網站上嗎'));
assert.equal((await call('/api/feedback/public')).body.items.length, 0, 'GET does not publish');
await call(`/api/feedback/review?id=${id}&a=publish&s=bad`, { method: 'POST' });
assert.equal((await call('/api/feedback/public')).body.items.length, 0, 'bad sig');
await call(`/api/feedback/review?id=${id}&a=publish&s=${sig('publish')}`, { method: 'POST' });
const pub = (await call('/api/feedback/public')).body.items;
assert.equal(pub.length, 1);
assert.deepEqual(Object.keys(pub[0]).sort(), ['at', 'course', 'quote', 'rating', 'sub', 'who']);
assert.ok(!JSON.stringify(pub).includes('a@b.co'), 'no email in public');
await call(`/api/feedback/review?id=${id}&a=hide&s=${sig('hide')}`, { method: 'POST' });
assert.equal((await call('/api/feedback/public')).body.items.length, 0, 'hidden');

// 不公開的不能被公開
await post({ ...base, publish: 'private', gain: '私人' });
const priv = [...store.values()].map((v) => { try { return JSON.parse(v); } catch { return {}; } }).find((x) => x.gain === '私人');
const ps = createHmac('sha256', 'sec').update(priv.id + ':publish').digest('base64url');
assert.ok(String((await call(`/api/feedback/review?id=${priv.id}&a=publish&s=${ps}`, { method: 'POST' })).body).includes('不能放上網站'));

// 每分鐘限流
env.FB_LIMITER = { limit: async () => ({ success: false }) };
assert.equal((await post({ ...base, consent: true })).status, 429);
console.log('FEEDBACK PASS');
