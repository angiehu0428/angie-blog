// angie-blog worker:靜態網站 + /api/contact 表單接收(通知 Angie 的 Telegram)
// secrets:TG_BOT_TOKEN / TG_CHAT_ID(wrangler secret put,值同 uptime-monitor)
//
// 顧問履歷(/consulting-cv):內容與照片都「不在這個 repo 裡」。
// 它們存在 Cloudflare KV(binding CV),由下面的 /api/cv/* 驗證密碼後才吐出來。
// 這樣公開 repo 只看得到版面程式碼,看不到任何履歷資料。
// secrets:CV_PASSWORD(存取密碼)/ CV_SESSION_SECRET(簽 cookie 用的隨機字串)

const MAX = { name: 100, email: 200, subject: 150, message: 4000 };

// 顧問報價:價目只放在這裡(不進網頁原始碼),填表驗證通過才回傳。
// ⚠️ 要改價格改這裡(每組對應顧問頁的方案順序)。
const CONSULTING_PRICES = [
	[
		'個人創作者　NT$1,000–1,500／小時',
		'公司行號(非上市櫃)　NT$2,000–2,500／小時',
		'上市櫃公司　NT$3,000–5,000／小時',
	],
	['NT$50,000／月'],
];

function esc(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json(obj, status = 200) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8' },
	});
}

async function handleContact(request, env) {
	let data;
	try {
		data = await request.json();
	} catch {
		return json({ ok: false, error: 'bad request' }, 400);
	}

	// 蜜罐:機器人會填這個隱藏欄位,人類不會
	if (data.website) return json({ ok: true }); // 假裝成功,騙過機器人

	const name = (data.name || '').trim();
	const email = (data.email || '').trim();
	const subject = (data.subject || '').trim();
	const message = (data.message || '').trim();

	if (!name || !email || !message) return json({ ok: false, error: 'missing fields' }, 400);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'bad email' }, 400);
	if (
		name.length > MAX.name ||
		email.length > MAX.email ||
		subject.length > MAX.subject ||
		message.length > MAX.message
	)
		return json({ ok: false, error: 'too long' }, 400);

	const text =
		`📮 <b>angiehu.com 聯絡表單</b>\n\n` +
		`<b>稱呼:</b>${esc(name)}\n` +
		`<b>Email:</b>${esc(email)}\n` +
		(subject ? `<b>主題:</b>${esc(subject)}\n` : '') +
		`\n${esc(message)}`;

	const resp = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text, parse_mode: 'HTML' }),
	});

	if (!resp.ok) return json({ ok: false, error: 'notify failed' }, 502);
	// 顧問報價表單:驗證通過才回傳價目(價目不在網頁原始碼裡)
	if (data.wantQuote) return json({ ok: true, prices: CONSULTING_PRICES });
	return json({ ok: true });
}

// ─────────────────────────────────────────────────────────────
// 顧問履歷:密碼閘門
// ─────────────────────────────────────────────────────────────

const CV_COOKIE = 'cv_session';
const CV_TTL = 60 * 60 * 12; // 通行證有效 12 小時
const CV_TRY_LIMIT = 8; // 同一個 IP 每小時最多試 8 次密碼
const CV_TRY_WINDOW = 60 * 60;

const enc = new TextEncoder();

function b64url(bytes) {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 定時比較:避免用回應時間一個字一個字猜出密碼
function safeEqual(a, b) {
	if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

async function sign(secret, data) {
	const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
	]);
	return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
}

async function makeToken(env) {
	const exp = String(Math.floor(Date.now() / 1000) + CV_TTL);
	return `${exp}.${await sign(env.CV_SESSION_SECRET, exp)}`;
}

async function tokenValid(env, token) {
	if (!token || !env.CV_SESSION_SECRET) return false;
	const dot = token.indexOf('.');
	if (dot < 1) return false;
	const exp = token.slice(0, dot);
	if (!/^\d+$/.test(exp) || Number(exp) < Math.floor(Date.now() / 1000)) return false;
	return safeEqual(token.slice(dot + 1), await sign(env.CV_SESSION_SECRET, exp));
}

function readCookie(request, name) {
	const raw = request.headers.get('cookie');
	if (!raw) return null;
	for (const part of raw.split(';')) {
		const eq = part.indexOf('=');
		if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
	}
	return null;
}

async function cvAuthed(request, env) {
	return tokenValid(env, readCookie(request, CV_COOKIE));
}

// 設定沒做完就講清楚,不要讓訪客看到一個壞掉的頁面
function cvNotReady(env) {
	if (!env.CV) return json({ ok: false, error: 'not_configured', detail: 'KV binding CV 尚未設定' }, 503);
	if (!env.CV_PASSWORD || !env.CV_SESSION_SECRET)
		return json({ ok: false, error: 'not_configured', detail: 'CV_PASSWORD / CV_SESSION_SECRET 尚未設定' }, 503);
	return null;
}

async function handleCvLogin(request, env) {
	const notReady = cvNotReady(env);
	if (notReady) return notReady;

	let data;
	try {
		data = await request.json();
	} catch {
		return json({ ok: false, error: 'bad request' }, 400);
	}

	const password = String(data.password || '');
	if (!password || password.length > 100) return json({ ok: false, error: 'bad_password' }, 401);

	// 擋暴力破解:純數字密碼不擋的話是可以硬試出來的
	const ip = request.headers.get('cf-connecting-ip') || 'unknown';
	const tryKey = `try/${ip}`;
	const tries = Number((await env.CV.get(tryKey)) || 0);
	if (tries >= CV_TRY_LIMIT) return json({ ok: false, error: 'too_many_tries' }, 429);

	if (!safeEqual(password, env.CV_PASSWORD)) {
		await env.CV.put(tryKey, String(tries + 1), { expirationTtl: CV_TRY_WINDOW });
		return json({ ok: false, error: 'bad_password' }, 401);
	}

	await env.CV.delete(tryKey);
	const token = await makeToken(env);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'set-cookie': `${CV_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${CV_TTL}`,
		},
	});
}

async function handleCvData(request, env) {
	const notReady = cvNotReady(env);
	if (notReady) return notReady;
	if (!(await cvAuthed(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);

	const body = await env.CV.get('cv.json');
	if (!body) return json({ ok: false, error: 'empty', detail: '履歷內容尚未上傳到 KV' }, 404);
	return new Response(body, {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
		},
	});
}

async function handleCvPhoto(request, env, name) {
	const notReady = cvNotReady(env);
	if (notReady) return notReady;
	if (!(await cvAuthed(request, env))) return new Response('unauthorized', { status: 401 });

	// 只允許單純檔名,擋掉 ../ 之類的路徑穿越
	if (!/^[A-Za-z0-9._-]{1,120}$/.test(name) || name.includes('..')) return new Response('bad name', { status: 400 });

	const obj = await env.CV.getWithMetadata(`photo/${name}`, { type: 'arrayBuffer' });
	if (!obj || !obj.value) return new Response('not found', { status: 404 });

	return new Response(obj.value, {
		headers: {
			'content-type': (obj.metadata && obj.metadata.contentType) || 'application/octet-stream',
			// private:只給這位訪客的瀏覽器快取,不進 CDN 共用快取
			'cache-control': 'private, max-age=3600',
		},
	});
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/api/contact') {
			if (request.method === 'POST') return handleContact(request, env);
			return json({ ok: false, error: 'method not allowed' }, 405);
		}

		if (url.pathname === '/api/cv/login') {
			if (request.method === 'POST') return handleCvLogin(request, env);
			return json({ ok: false, error: 'method not allowed' }, 405);
		}

		if (url.pathname === '/api/cv/data') {
			if (request.method === 'GET') return handleCvData(request, env);
			return json({ ok: false, error: 'method not allowed' }, 405);
		}

		if (url.pathname.startsWith('/api/cv/photo/')) {
			if (request.method === 'GET')
				return handleCvPhoto(request, env, decodeURIComponent(url.pathname.slice('/api/cv/photo/'.length)));
			return json({ ok: false, error: 'method not allowed' }, 405);
		}

		return env.ASSETS.fetch(request);
	},
};
