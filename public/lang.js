// 全站語言切換:同一份原始碼裡中英並存,依 data-lang 屬性用 hidden 顯示/隱藏
// （跟塔羅站同一套精神:不開分開的 /en 路徑,更新時中英一起改,不用兩邊維護）
(function () {
	function getLang() {
		var saved = localStorage.getItem('site_lang');
		if (saved === 'zh' || saved === 'en') return saved;
		return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
	}

	function apply(lang) {
		document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
		document.documentElement.dataset.lang = lang;
		document.querySelectorAll('.i18n-zh').forEach(function (el) {
			el.hidden = lang === 'en';
		});
		document.querySelectorAll('.i18n-en').forEach(function (el) {
			el.hidden = lang === 'zh';
		});
		document.querySelectorAll('[data-ph-zh][data-ph-en]').forEach(function (el) {
			el.setAttribute('placeholder', lang === 'zh' ? el.dataset.phZh : el.dataset.phEn);
		});
		document.querySelectorAll('[data-label-zh][data-label-en]').forEach(function (el) {
			el.setAttribute('aria-label', lang === 'zh' ? el.dataset.labelZh : el.dataset.labelEn);
		});
		document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
			btn.textContent = lang === 'zh' ? 'EN' : '中';
			btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換成中文');
		});
	}

	window.__setLang = function (lang) {
		localStorage.setItem('site_lang', lang);
		apply(lang);
	};
	window.__toggleLang = function () {
		window.__setLang(document.documentElement.dataset.lang === 'zh' ? 'en' : 'zh');
	};
	window.__initLang = function () {
		apply(getLang());
	};

	window.__initLang();
	document.addEventListener('DOMContentLoaded', window.__initLang);
})();
