// 讓文章內文支援更多媒體:
// - ![](xxx.mp4/.webm/.mov) → <video> 播放器
// - ![](xxx.mp3/.m4a/.wav/.ogg) → <audio> 播放器
// - 單獨一行的 YouTube 連結 → 自動嵌入影片
// - GIF 本來就是圖片,原生支援
import { visit } from 'unist-util-visit';

const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
const AUDIO_RE = /\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i;
const YT_RE =
	/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,20})/i;

function ytEmbed(id) {
	return (
		`<div class="yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}" ` +
		`title="YouTube video" frameborder="0" loading="lazy" ` +
		`allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
		`allowfullscreen></iframe></div>`
	);
}

export default function remarkMedia() {
	return (tree) => {
		// 圖片語法但副檔名是影片/音檔 → 換成播放器
		visit(tree, 'image', (node) => {
			if (VIDEO_RE.test(node.url)) {
				node.type = 'html';
				node.value = `<video controls playsinline preload="metadata" src="${node.url}"></video>`;
			} else if (AUDIO_RE.test(node.url)) {
				node.type = 'html';
				node.value = `<audio controls preload="metadata" src="${node.url}"></audio>`;
			}
		});

		// 單獨一行的 YouTube 連結 → 嵌入
		visit(tree, 'paragraph', (node) => {
			if (!node.children || node.children.length !== 1) return;
			const child = node.children[0];
			const url =
				child.type === 'link' && child.children?.length <= 1
					? child.url
					: child.type === 'text'
						? child.value.trim()
						: null;
			if (!url) return;
			const m = url.match(YT_RE);
			if (!m) return;
			node.type = 'html';
			node.children = undefined;
			node.value = ytEmbed(m[1]);
		});
	};
}
