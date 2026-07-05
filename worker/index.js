// angie-blog worker:靜態網站 + /api/contact 表單接收(通知 Angie 的 Telegram)
// secrets:TG_BOT_TOKEN / TG_CHAT_ID(wrangler secret put,值同 uptime-monitor)

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

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname === '/api/contact') {
			if (request.method === 'POST') return handleContact(request, env);
			return json({ ok: false, error: 'method not allowed' }, 405);
		}
		return env.ASSETS.fetch(request);
	},
};
