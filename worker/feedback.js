// 諮詢心得問卷(/feedback):只有拿到邀請連結的人能填(課程群共用連結、或一對一個人連結)。
//
// 資料都存在 Cloudflare KV(binding FEEDBACK),不進公開 repo:
//   invite:<code>  邀請內容(課程名稱、日期、這堂課的公司清單、一對一的人名公司),用 npm run fb:invite 上傳
//   fb:<id>        每一份心得(含 Email、改進建議,這兩個永遠不公開)
// 送出後通知 Angie 的 Telegram,訊息裡有「公開/不公開」的簽名連結;她按了才會出現在 /api/feedback/public。
// secret:FEEDBACK_SECRET(簽連結用的隨機字串)

const enc = new TextEncoder();
const MAX = { name: 60, title: 60, company: 100, email: 200, gain: 3000, improve: 3000, date: 40 };
const PUBLISH = ['named', 'company', 'anon', 'private'];
const RATE_LIMIT = 20; // 同一個 IP 每小時最多送 20 份(課程教室可能共用網路)

function json(obj, status = 200) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
	});
}
function esc(s) {
	return String(s ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
const clean = (v, n) => String(v ?? '').trim().slice(0, n);
const okCode = (c) => /^[A-Za-z0-9_-]{6,40}$/.test(c);

async function hmac(secret, data) {
	const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
	let s = '';
	for (const b of sig) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function safeEqual(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
	let d = 0;
	for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return d === 0;
}

async function getInvite(env, code) {
	if (!okCode(code)) return null;
	const raw = await env.FEEDBACK.get('invite:' + code);
	return raw ? JSON.parse(raw) : null;
}

// 公開時要顯示的名字那一行(照填寫人自己選的方式)
export function byline(fb) {
	if (fb.publish === 'named') return { who: fb.name, sub: [fb.title, fb.company].filter(Boolean).join('|') };
	if (fb.publish === 'company') return { who: fb.company + ' 的學員', sub: '' };
	return { who: fb.title ? '一位' + fb.title : '一位學員', sub: '' };
}

// GET /api/feedback/invite?c=  → 表單要帶入的資料(沒有這個邀請碼就 404)
async function handleInvite(url, env) {
	const inv = await getInvite(env, url.searchParams.get('c') || '');
	if (!inv) return json({ ok: false, error: 'invalid' }, 404);
	return json({
		ok: true,
		kind: inv.kind === 'person' ? 'person' : 'course',
		title: inv.title || '',
		date: inv.date || '',
		companies: Array.isArray(inv.companies) ? inv.companies.slice(0, 50) : [],
		name: inv.name || '',
		company: inv.company || '',
		oneDate: inv.oneDate || '',
	});
}

// POST /api/feedback  → 存一份心得+通知 Angie
async function handleSubmit(request, env) {
	let d;
	try {
		d = await request.json();
	} catch {
		return json({ ok: false, error: 'bad request' }, 400);
	}
	if (d.website) return json({ ok: true }); // 蜜罐
	const code = clean(d.c, 40);
	const inv = await getInvite(env, code);
	if (!inv) return json({ ok: false, error: 'invalid' }, 403);

	const ip = request.headers.get('cf-connecting-ip') || 'x';
	const rk = 'rate:' + ip;
	const n = Number((await env.FEEDBACK.get(rk)) || 0);
	if (n >= RATE_LIMIT) return json({ ok: false, error: 'too many' }, 429);
	await env.FEEDBACK.put(rk, String(n + 1), { expirationTtl: 3600 });

	const fb = {
		code,
		invite: inv.title || '',
		name: clean(d.name, MAX.name),
		title: clean(d.title, MAX.title),
		company: clean(d.company, MAX.company),
		email: clean(d.email, MAX.email),
		course: inv.kind === 'person' ? !!d.course : true,
		courseDate: inv.date || '',
		one: inv.kind === 'person' ? true : !!d.one,
		oneDate: clean(d.oneDate, MAX.date) || (inv.kind === 'person' ? inv.oneDate || '' : ''),
		rating: [1, 2, 3, 4, 5].includes(Number(d.rating)) ? Number(d.rating) : null,
		gain: clean(d.gain, MAX.gain),
		improve: clean(d.improve, MAX.improve),
		publish: PUBLISH.includes(d.publish) ? d.publish : 'private',
		consent: !!d.consent,
		status: 'new',
		createdAt: new Date().toISOString(),
	};
	if (!fb.name || !fb.company || !fb.email || !fb.gain) return json({ ok: false, error: 'missing fields' }, 400);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fb.email)) return json({ ok: false, error: 'bad email' }, 400);
	if (fb.publish !== 'private' && !fb.consent) return json({ ok: false, error: 'consent' }, 400);

	const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
	fb.id = id;
	await env.FEEDBACK.put('fb:' + id, JSON.stringify(fb));

	await notify(request, env, fb).catch(() => {}); // 通知失敗不擋填寫人(資料已存)
	return json({ ok: true });
}

async function notify(request, env, fb) {
	if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return;
	const base = new URL(request.url).origin;
	const link = async (a) => `${base}/api/feedback/review?id=${fb.id}&a=${a}&s=${await hmac(env.FEEDBACK_SECRET || '', fb.id + ':' + a)}`;
	const b = byline(fb);
	const label = { named: '具名公開', company: '不具名、留公司名', anon: '完全匿名', private: '不公開(只給妳看)' }[fb.publish];
	const went = [fb.course && `課程${fb.courseDate ? ' ' + fb.courseDate : ''}`, fb.one && `一對一${fb.oneDate ? ' ' + fb.oneDate : ''}`]
		.filter(Boolean)
		.join('、');
	let text =
		`💬 <b>新的諮詢心得</b>(${esc(fb.invite)})\n\n` +
		`<b>${esc(fb.name)}</b>${fb.title ? '|' + esc(fb.title) : ''}|${esc(fb.company)}\n` +
		`${esc(fb.email)}\n參加:${esc(went)}${fb.rating ? '|' + '★'.repeat(fb.rating) : ''}\n\n` +
		`<b>收穫</b>\n${esc(fb.gain)}\n` +
		(fb.improve ? `\n<b>想改進的(只有妳看得到)</b>\n${esc(fb.improve)}\n` : '') +
		`\n公開方式:${label}`;
	if (fb.publish !== 'private' && env.FEEDBACK_SECRET) {
		text += `\n網站上會顯示:${esc(b.who)}${b.sub ? '|' + esc(b.sub) : ''}\n\n👉 <a href="${await link('publish')}">公開到網站</a>`;
	}
	await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		// 關掉連結預覽:不然 Telegram 會先去開那個網址
		body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text: text.slice(0, 4000), parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
	});
}

// /api/feedback/review:GET 只顯示確認頁(預覽機器人開了也不會改到),按按鈕 POST 才真的公開/收回
async function handleReview(request, url, env) {
	const id = url.searchParams.get('id') || '';
	const a = url.searchParams.get('a') || '';
	const s = url.searchParams.get('s') || '';
	const page = (msg, extra = '') =>
		new Response(
			`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">` +
				`<title>諮詢心得</title><body style="font-family:-apple-system,'PingFang TC',sans-serif;background:#f7f5f0;color:#262a3f;max-width:560px;margin:40px auto;padding:0 16px;line-height:1.7">${msg}${extra}</body>`,
			{ headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
		);
	if (!/^[a-z0-9]{6,20}$/.test(id) || !['publish', 'hide'].includes(a) || !env.FEEDBACK_SECRET) return page('連結不對');
	if (!safeEqual(s, await hmac(env.FEEDBACK_SECRET, id + ':' + a))) return page('連結不對');
	const raw = await env.FEEDBACK.get('fb:' + id);
	if (!raw) return page('找不到這份心得');
	const fb = JSON.parse(raw);
	const b = byline(fb);
	const card =
		`<div style="background:#fff;border-radius:18px;padding:16px;margin:16px 0;box-shadow:0 6px 20px rgba(38,42,63,.08)">` +
		`<p style="margin:0 0 10px">「${esc(fb.gain)}」</p><b>${esc(b.who)}</b>${b.sub ? `<br><span style="color:#6e7288">${esc(b.sub)}</span>` : ''}</div>`;
	if (request.method === 'POST') {
		if (a === 'publish' && (fb.publish === 'private' || !fb.consent)) return page('這份對方選了不公開,不能放上網站');
		fb.status = a === 'publish' ? 'public' : 'hidden';
		fb.reviewedAt = new Date().toISOString();
		await env.FEEDBACK.put('fb:' + id, JSON.stringify(fb));
		await env.FEEDBACK.delete('public-cache');
		const undo = a === 'publish' ? 'hide' : 'publish';
		const undoUrl = `/api/feedback/review?id=${id}&a=${undo}&s=${await hmac(env.FEEDBACK_SECRET, id + ':' + undo)}`;
		return page(
			a === 'publish' ? '<h2>✅ 已公開</h2>' : '<h2>已收回,網站上不會顯示</h2>',
			card + `<p><a href="${esc(undoUrl)}">${a === 'publish' ? '改成不公開' : '改回公開'}</a></p>`,
		);
	}
	return page(
		`<h2>${a === 'publish' ? '要把這份放到網站上嗎?' : '要從網站收回這份嗎?'}</h2>`,
		card + `<form method="post"><button style="font:inherit;font-size:17px;padding:12px 22px;border:0;border-radius:12px;background:#262a3f;color:#fff">${a === 'publish' ? '公開' : '收回'}</button></form>`,
	);
}

// GET /api/feedback/public → 已公開的心得(只給公開欄位:感想、名字那行、課程)
async function handlePublic(env) {
	const cached = await env.FEEDBACK.get('public-cache');
	if (cached) return new Response(cached, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
	const out = [];
	let cursor;
	do {
		const l = await env.FEEDBACK.list({ prefix: 'fb:', cursor });
		for (const k of l.keys) {
			const raw = await env.FEEDBACK.get(k.name);
			if (!raw) continue;
			const fb = JSON.parse(raw);
			if (fb.status !== 'public' || fb.publish === 'private' || !fb.consent) continue;
			out.push({ quote: fb.gain, ...byline(fb), course: fb.invite, rating: fb.rating, at: fb.createdAt });
		}
		cursor = l.list_complete ? undefined : l.cursor;
	} while (cursor);
	out.sort((x, y) => (x.at < y.at ? 1 : -1));
	const body = JSON.stringify({ ok: true, items: out });
	await env.FEEDBACK.put('public-cache', body, { expirationTtl: 3600 });
	return new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}

// 沒設定 KV 時回「設定中」,不影響其他頁
export async function routeFeedback(request, url, env) {
	if (!url.pathname.startsWith('/api/feedback')) return null;
	if (!env.FEEDBACK) return json({ ok: false, error: 'not configured' }, 503);
	const p = url.pathname;
	if (p === '/api/feedback/invite' && request.method === 'GET') return handleInvite(url, env);
	if (p === '/api/feedback' && request.method === 'POST') return handleSubmit(request, env);
	if (p === '/api/feedback/review' && (request.method === 'GET' || request.method === 'POST')) return handleReview(request, url, env);
	if (p === '/api/feedback/public' && request.method === 'GET') return handlePublic(env);
	return json({ ok: false, error: 'not found' }, 404);
}
