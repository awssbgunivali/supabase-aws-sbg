// GERADO pelo repositório do Studio (studio-aws-sbg): scripts/build-mcp.mjs a partir de src/mcp/function.js.
// Não edite aqui: mude lá e rode `npm run build:mcp`.
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region src/utils/id.js
function generateId() {
	return "slide_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
//#endregion
//#region src/data/compositions.js
const COMPOSITIONS = {
	open: {
		label: "Grade aberta",
		hint: "Só a grade, sem painel"
	},
	"panel-top": {
		label: "Painel em cima",
		hint: "Painel do topo até o conteúdo"
	},
	"panel-bottom": {
		label: "Painel embaixo",
		hint: "Painel do conteúdo até a base"
	},
	"panel-left": {
		label: "Painel à esquerda",
		hint: "Coluna de grade livre à direita"
	},
	"panel-right": {
		label: "Painel à direita",
		hint: "Coluna de grade livre à esquerda"
	},
	band: {
		label: "Faixa",
		hint: "Faixa de ponta a ponta atrás do texto"
	},
	card: {
		label: "Cartão",
		hint: "Painel só em volta do texto"
	},
	inset: {
		label: "Moldura",
		hint: "Painel com a grade em volta"
	},
	solid: {
		label: "Liso",
		hint: "Card inteiro sem grade"
	}
};
const GRID_LINES = {
	lines: { label: "Linhas" },
	fine: { label: "Linhas finas" },
	dots: { label: "Pontos" },
	cross: { label: "Cruzes" },
	none: { label: "Sem grade" }
};
const PHOTO_LAYOUTS = {
	full: { label: "Fundo inteiro" },
	frame: { label: "Dentro da grade" },
	right: { label: "À direita" },
	left: { label: "À esquerda" },
	top: { label: "Faixa em cima" },
	bottom: { label: "Faixa embaixo" }
};
const PHOTO_SIZES = {
	third: {
		label: "1/3",
		f: 1 / 3
	},
	half: {
		label: "1/2",
		f: 1 / 2
	},
	"two-thirds": {
		label: "2/3",
		f: 2 / 3
	}
};
const PHOTO_FILTERS = {
	none: { label: "Original" },
	mono: { label: "P&B" },
	tint: { label: "Tingida" },
	contrast: { label: "Vívida" },
	pixel: { label: "Pixel" }
};
//#endregion
//#region src/data/brand.js
const SUPABASE_URL = "".replace(/\/$/, "");
const BASE = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/brand` : "";
const brandUrl = (path) => BASE ? `${BASE}/${path}` : "";
/** Os 11 ícones oficiais (pixel art do kit). `slug` é o nome do arquivo no bucket. */
const BRAND_ICONS = [
	{
		id: "bolt",
		label: "Raio"
	},
	{
		id: "clock",
		label: "Relógio"
	},
	{
		id: "teams",
		label: "Pessoas"
	},
	{
		id: "speaker",
		label: "Palestra"
	},
	{
		id: "trophy",
		label: "Troféu"
	},
	{
		id: "key",
		label: "Chave"
	},
	{
		id: "wrench",
		label: "Ferramenta"
	},
	{
		id: "drop",
		label: "Gota"
	},
	{
		id: "ladder",
		label: "Escada"
	},
	{
		id: "bracket-smile",
		label: "Sorriso (colchetes)"
	},
	{
		id: "bracket-smile-double",
		label: "Sorriso (duplo)"
	}
];
/** As 7 cores oficiais dos ícones. "grey-850" é o escuro, para fundos claros e células coloridas. */
const ICON_COLORS = [
	{
		id: "mint",
		label: "Verde",
		hex: "#00E582"
	},
	{
		id: "purple",
		label: "Roxo",
		hex: "#AD5CFF"
	},
	{
		id: "amber",
		label: "Laranja",
		hex: "#FF9900"
	},
	{
		id: "blue",
		label: "Azul",
		hex: "#42B4FF"
	},
	{
		id: "magenta",
		label: "Rosa",
		hex: "#FF57E9"
	},
	{
		id: "white",
		label: "Branco",
		hex: "#FFFFFF"
	},
	{
		id: "grey-850",
		label: "Escuro",
		hex: "#232F3E"
	}
];
[
	1,
	2,
	3,
	4,
	5,
	6
].map((n) => ({
	id: `endcard-${n}`,
	label: `Degradê ${n}`,
	path: `fundos/endcard-${n}.jpg`
}));
[
	1,
	2,
	3,
	4,
	5,
	6
].map((n) => ({
	id: `endcard-${n}`,
	label: `Encerramento ${n}`,
	path: `video/endcard-${n}.mp4`
}));
//#endregion
//#region src/data/theme.js
const KIT = {
	ink: "#161D26",
	gray: "#656871",
	white: "#FFFFFF",
	mist: "#DEDEE3",
	magenta: "#FF57E9",
	magentaStrong: "#D600BA",
	mint: "#00E582",
	mintStrong: "#008559",
	purple: "#AD5CFF",
	purpleStrong: "#7300E5",
	sky: "#42B4FF",
	skyStrong: "#006CE0",
	orange: "#FF9900",
	orangeStrong: "#D14600"
};
KIT.purple, KIT.purpleStrong, KIT.magenta, KIT.magentaStrong, KIT.sky, KIT.skyStrong, KIT.mint, KIT.mintStrong, KIT.orange, KIT.orangeStrong, KIT.ink, KIT.gray, KIT.mist, KIT.white;
const GRADIENTS = {
	aurora: {
		label: "Aurora (roxo → azul → branco)",
		css: "linear-gradient(135deg, #AD5CFF 0%, #42B4FF 50%, #FFFFFF 100%)"
	},
	sunset: {
		label: "Pôr do sol (magenta → laranja)",
		css: "linear-gradient(90deg, #FF57E9 0%, #FF9900 100%)"
	},
	candy: {
		label: "Candy (lilás → rosa → laranja)",
		css: "linear-gradient(135deg, #CE8FFE 0%, #FF74EC 50%, #FF9320 100%)"
	},
	lime: {
		label: "Lima (lavanda → lima)",
		css: "linear-gradient(135deg, #C2BFF5 0%, #B7D8A0 50%, #AAF63F 100%)"
	},
	"purple-magenta": {
		label: "Roxo → magenta",
		css: "linear-gradient(180deg, #AD5CFF 0%, #FF57E9 100%)"
	},
	"magenta-fade": {
		label: "Magenta → branco",
		css: "linear-gradient(180deg, #FF57E9 0%, #FFFFFF 100%)"
	},
	"mint-fade": {
		label: "Verde → branco",
		css: "linear-gradient(180deg, #00E582 0%, #FFFFFF 100%)"
	},
	"purple-fade": {
		label: "Roxo → branco",
		css: "linear-gradient(180deg, #AD5CFF 0%, #FFFFFF 100%)"
	},
	"orange-fade": {
		label: "Laranja → branco",
		css: "linear-gradient(180deg, #FF9900 0%, #FFFFFF 100%)"
	},
	"deep-blue": {
		label: "Azul profundo",
		css: "linear-gradient(180deg, #006CE0 0%, #006CE0 100%)"
	}
};
const ON_GRADIENT = {
	fg: KIT.ink,
	muted: "rgba(22,29,38,0.72)",
	line: "rgba(22,29,38,0.12)",
	panel: KIT.white,
	alt: "#f6f6f8",
	dark: false,
	colored: true
};
const THEMES = {
	"sbg-dark": {
		label: "Escuro",
		bg: "#161d26",
		panel: "#161d26",
		alt: "#1d2631",
		dark: true,
		fg: "#ffffff",
		muted: "#a3a8b3",
		line: "#2f3742"
	},
	"sbg-light": {
		label: "Claro",
		bg: "#ffffff",
		panel: "#ffffff",
		alt: "#f6f6f8",
		dark: false,
		fg: "#161d26",
		muted: "#656871",
		line: "#dedee3"
	},
	"sbg-pink": {
		label: "Rosa",
		bg: "#ff57e9",
		panel: "#ff57e9",
		alt: "#ff6fec",
		dark: false,
		colored: true,
		fg: "#161d26",
		muted: "#3b2440",
		line: "#e04ecd"
	},
	"sbg-green": {
		label: "Verde",
		bg: "#00e582",
		panel: "#00e582",
		alt: "#1aea90",
		dark: false,
		colored: true,
		fg: "#161d26",
		muted: "#17402f",
		line: "#00c872"
	},
	"sbg-sky": {
		label: "Azul",
		bg: "#42b4ff",
		panel: "#42b4ff",
		alt: "#5bbeff",
		dark: false,
		colored: true,
		fg: "#161d26",
		muted: "#183a55",
		line: "#3a9fe2"
	},
	"sbg-orange": {
		label: "Laranja",
		bg: "#ff9900",
		panel: "#ff9900",
		alt: "#ffa71a",
		dark: false,
		colored: true,
		fg: "#161d26",
		muted: "#4a3310",
		line: "#e08a00"
	},
	"sbg-purple": {
		label: "Roxo",
		bg: "#ad5cff",
		panel: "#ad5cff",
		alt: "#b870ff",
		dark: false,
		colored: true,
		fg: "#161d26",
		muted: "#2e1747",
		line: "#9a4ee6"
	},
	"sbg-deep-blue": {
		label: "Azul profundo",
		bg: "#006ce0",
		panel: "#006ce0",
		alt: "#1a7ce6",
		dark: true,
		colored: true,
		fg: "#ffffff",
		muted: "#cfe3ff",
		line: "#2a84e8"
	},
	"grad-aurora": {
		label: "Degradê · Aurora",
		bg: "#AD5CFF",
		bgImage: GRADIENTS.aurora.css,
		...ON_GRADIENT
	},
	"grad-sunset": {
		label: "Degradê · Pôr do sol",
		bg: "#FF57E9",
		bgImage: GRADIENTS.sunset.css,
		...ON_GRADIENT
	},
	"grad-candy": {
		label: "Degradê · Candy",
		bg: "#FF74EC",
		bgImage: GRADIENTS.candy.css,
		...ON_GRADIENT
	},
	"grad-lime": {
		label: "Degradê · Lima",
		bg: "#B7D8A0",
		bgImage: GRADIENTS.lime.css,
		...ON_GRADIENT
	},
	"grad-purple-magenta": {
		label: "Degradê · Roxo → magenta",
		bg: "#AD5CFF",
		bgImage: GRADIENTS["purple-magenta"].css,
		...ON_GRADIENT
	},
	"grad-magenta-fade": {
		label: "Degradê · Magenta → branco",
		bg: "#FF57E9",
		bgImage: GRADIENTS["magenta-fade"].css,
		...ON_GRADIENT
	},
	"grad-mint-fade": {
		label: "Degradê · Verde → branco",
		bg: "#00E582",
		bgImage: GRADIENTS["mint-fade"].css,
		...ON_GRADIENT
	},
	"grad-purple-fade": {
		label: "Degradê · Roxo → branco",
		bg: "#AD5CFF",
		bgImage: GRADIENTS["purple-fade"].css,
		...ON_GRADIENT
	},
	"grad-orange-fade": {
		label: "Degradê · Laranja → branco",
		bg: "#FF9900",
		bgImage: GRADIENTS["orange-fade"].css,
		...ON_GRADIENT
	}
};
const DEFAULT_THEME = "sbg-dark";
const GRID_SIZES = {
	compact: {
		label: "Compacta (12 colunas)",
		cols: 12
	},
	kit: {
		label: "Kit (9 colunas, células grandes)",
		cols: 9
	}
};
const GOOGLE_FONTS = [
	{
		value: "'Amazon Ember Display', sans-serif",
		label: "Amazon Ember Display (kit AWS)"
	},
	{
		value: "'Inter', sans-serif",
		label: "Inter (alternativa sem a Amazon Ember)"
	},
	{
		value: "custom",
		label: "Upload de Fonte Personalizada..."
	}
];
const AWS_LOGO_URL = brandUrl("logos/aws-preta.png");
const DEFAULT_GLOBAL_SETTINGS = {
	freeComponents: true,
	projectTitle: "",
	fontFamily: "'Amazon Ember Display', sans-serif",
	customFontBase64: null,
	theme: DEFAULT_THEME,
	pattern: "auto",
	blockGradient: "auto",
	composition: "open",
	gridLines: "lines",
	gridSize: "compact",
	caption: "",
	instagramHandle: ""
};
function getDefaultGlobalSettings() {
	return JSON.parse(JSON.stringify(DEFAULT_GLOBAL_SETTINGS));
}
/**
* Projetos salvos antes da mudança para o design único usavam layouts/temas antigos
* (neon, corporativo, "dark", "cream"...): troca o que não existe mais pelos padrões atuais.
*/
function sanitizeGlobalSettings(settings) {
	const next = {
		...getDefaultGlobalSettings(),
		...settings ?? {}
	};
	delete next.layout;
	if (!THEMES[next.theme]) next.theme = DEFAULT_THEME;
	if (!COMPOSITIONS[next.composition]) next.composition = "open";
	if (!GRID_LINES[next.gridLines]) next.gridLines = "lines";
	if (!GRID_SIZES[next.gridSize]) next.gridSize = "compact";
	if (next.blockGradient !== "auto" && !GRADIENTS[next.blockGradient]) next.blockGradient = "auto";
	if (next.fontFamily !== "custom" && !GOOGLE_FONTS.some((f) => f.value === next.fontFamily)) next.fontFamily = DEFAULT_GLOBAL_SETTINGS.fontFamily;
	return next;
}
//#endregion
//#region src/data/gridPatterns.js
const GRID_PATTERNS = {
	auto: { label: "Automático (varia por slide)" },
	stairs: { label: "Escadinha" },
	"stairs-double": { label: "Escadinha dupla" },
	"stairs-gradient": { label: "Escadinha com degradê" },
	gradient: { label: "Bloco degradê" },
	pixels: { label: "Blocos espalhados" },
	corners: { label: "Cantos" },
	strip: { label: "Faixa lateral" },
	constellation: { label: "Constelação (células acesas)" },
	none: { label: "Nenhum" }
};
const GRID_COLS = {
	club: 10,
	waiting: 16,
	presentation: 20,
	certificate: 16,
	meetup: 16
};
//#endregion
//#region src/data/canvas.js
const CANVAS_SIZES = {
	event: {
		width: 1080,
		height: 1350
	},
	content: {
		width: 1080,
		height: 1350
	},
	club: {
		width: 1240,
		height: 1754
	},
	waiting: {
		width: 1920,
		height: 1080
	},
	presentation: {
		width: 1920,
		height: 1080
	},
	certificate: {
		width: 1760,
		height: 1245
	},
	meetup: {
		width: 1200,
		height: 685
	}
};
//#endregion
//#region src/lib/group.js
let current = null;
function setCurrentGroup(group) {
	current = group || null;
}
const currentGroup = () => current;
({}).VITE_PLATFORM_NAME;
const SITE_URL = ({}.VITE_SITE_URL || "").replace(/\/$/, "");
//#endregion
//#region src/lib/groupBrand.js
const clean$1 = (v) => String(v ?? "").trim();
/** Último trecho do caminho de uma URL (https://instagram.com/x/ -> x) */
const lastSegment = (url) => {
	try {
		return decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() || "");
	} catch {
		return "";
	}
};
/** Só letras e números, sem acento: "Univali Itajaí" -> "UnivaliItajai" */
const compact = (text) => clean$1(text).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "");
const stripProtocol = (url) => clean$1(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
/** Endereço público do site do grupo (domínio próprio ou <site>/<grupo>); vazio se não houver como saber */
function siteOf(group) {
	if (group.siteUrl !== void 0) return clean$1(group.siteUrl).replace(/\/$/, "");
	if (group.domain) return `https://${group.domain}`;
	return SITE_URL && group.slug ? `${SITE_URL}/${group.slug}` : "";
}
/** Tokens do grupo em uso. Campos que o grupo não tem ficam vazios (o slide simplesmente não mostra). */
function groupBrand(group = currentGroup()) {
	const g = group || {};
	const socials = g.socials || {};
	const name = clean$1(g.name) || "AWS Student Builder Group";
	const short = clean$1(g.short_name) || name;
	const site = siteOf(g);
	const insta = lastSegment(socials.instagram);
	const linkedin = (() => {
		try {
			const parts = new URL(socials.linkedin).pathname.split("/").filter(Boolean);
			return parts.length ? `/${parts.slice(0, 2).join("/")}` : "";
		} catch {
			return "";
		}
	})();
	const youtube = lastSegment(socials.youtube);
	return {
		name,
		short,
		/** #AWSSBGUnivali: hashtag do grupo */
		tag: `#AWSSBG${compact(short)}`,
		/** "Univali · Itajaí" */
		place: [clean$1(g.institution), clean$1(g.city)].filter(Boolean).join(" · "),
		instagram: insta ? `@${insta.replace(/^@/, "")}` : "",
		linkedin,
		youtube: youtube ? youtube.startsWith("@") ? youtube : `@${youtube}` : "",
		meetup: lastSegment(socials.meetup),
		site: stripProtocol(site),
		siteUrl: site,
		/** Página de links do grupo (alvo dos QR codes) */
		linksUrl: site ? `${site}/links` : "",
		/** Mesma página, sem o https:// (para escrever no card) */
		links: site ? stripProtocol(`${site}/links`) : "",
		mascotName: clean$1(g.mascot?.name),
		mascotImage: clean$1(g.mascot?.image)
	};
}
/** Imagem do mascote do grupo ('' se ele não tem): os slides só mostram o mascote quando existe */
const mascotUrl = () => groupBrand().mascotImage;
//#endregion
//#region src/data/freeElements.js
const STEP = .5;
const MIN_SIZE = .5;
/**
* Componentes do card que também são elementos livres (antes ficavam nos cantos, fixos): o conteúdo vem do
* slide (número, hashtags, "Deslize"), a pessoa só escolhe onde ficam. `fixedW`: largura travada.
* A altura é sempre 1 célula.
*/
const COMPONENTS = {
	counter: {
		label: "Contador",
		w: 2,
		h: 1,
		fixedW: true
	},
	tags: {
		label: "Hashtags",
		w: 6,
		h: 1
	},
	swipe: {
		label: "Deslize / Salvar",
		w: 3,
		h: 1
	}
};
/** Sempre de 1 célula de altura (como as hashtags): só dá para esticar pelos lados */
const ONE_ROW = /* @__PURE__ */ new Set(["chip", "badge"]);
/** Ícones do chip de data/local */
const CHIP_ICONS = {
	calendar: "Data",
	pin: "Local",
	clock: "Hora",
	people: "Pessoas",
	none: "Sem ícone"
};
const ARROW_DIRS = {
	right: "Direita",
	left: "Esquerda",
	up: "Cima",
	down: "Baixo",
	"up-right": "Cima-direita",
	"down-right": "Baixo-direita",
	"up-left": "Cima-esquerda",
	"down-left": "Baixo-esquerda"
};
const snap = (v) => Math.round(v / STEP) * STEP;
const num = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const subCell = (size) => size % 1 !== 0;
/** Mantém o elemento dentro do card, com tamanho mínimo, tudo em múltiplos de meia célula */
function clampElement(el, { cols, R }) {
	const comp = COMPONENTS[el.kind];
	const oneRow = ONE_ROW.has(el.kind);
	const w = comp?.fixedW ? comp.w : Math.min(Math.max(snap(num(el.w, comp?.w ?? 2)), comp || oneRow ? 2 : MIN_SIZE), cols);
	const h = comp ? comp.h : oneRow ? 1 : Math.min(Math.max(snap(num(el.h, 2)), MIN_SIZE), R);
	const place = (pos, size, max) => subCell(size) ? Math.min(Math.max(Math.round(num(pos, 0)), 0), max - Math.ceil(size)) : Math.min(Math.max(snap(num(pos, 0)), 0), max - size);
	return {
		...el,
		x: place(el.x, w, cols),
		y: place(el.y, h, R),
		w,
		h
	};
}
/** Elemento novo, no meio do card (ou onde o `at` mandar) */
function createElement(kind, metrics, { at, ...overrides } = {}) {
	const base = kind in COMPONENTS ? {
		kind,
		w: COMPONENTS[kind].w,
		h: COMPONENTS[kind].h
	} : kind === "icon" ? {
		kind: "icon",
		icon: "bolt",
		color: "",
		w: 2,
		h: 2
	} : kind === "text" ? {
		kind: "text",
		text: "Seu texto aqui",
		size: "m",
		weight: "normal",
		align: "left",
		font: "mono",
		color: "",
		w: 6,
		h: 1
	} : kind === "shape" ? {
		kind: "shape",
		color: "purple",
		style: "solid",
		w: 2,
		h: 2
	} : kind === "qr" ? {
		kind: "qr",
		url: `https://${groupBrand().site}`,
		w: 3,
		h: 3
	} : kind === "chip" ? {
		kind: "chip",
		icon: "calendar",
		text: "15 OUT · 19h",
		color: "",
		w: 5,
		h: 1
	} : kind === "badge" ? {
		kind: "badge",
		text: "NOVO",
		color: "magenta",
		w: 3,
		h: 1
	} : kind === "arrow" ? {
		kind: "arrow",
		dir: "right",
		color: "",
		w: 2,
		h: 2
	} : kind === "line" ? {
		kind: "line",
		color: "",
		w: 6,
		h: 1
	} : {
		kind: "image",
		src: "",
		fit: "contain",
		w: 4,
		h: 4
	};
	const w = Math.min(overrides.w ?? base.w, metrics.cols);
	const h = Math.min(overrides.h ?? base.h, metrics.R);
	return clampElement({
		id: generateId(),
		...base,
		...overrides,
		w,
		h,
		x: at?.x ?? (metrics.cols - w) / 2,
		y: at?.y ?? (metrics.R - h) / 2
	}, metrics);
}
//#endregion
//#region src/data/components.js
const isCoverType = (type) => type === "cover" || type === "deck-title";
const isBannerType = (type) => type === "club" || type === "waiting" || type === "certificate" || type === "meetup";
/**
* Quais componentes o tipo de slide leva por padrão (mesmas regras de quando eram fixos). O logo da AWS não vem mais
* por padrão (atrapalhava o layout e às vezes não carregava): quem quiser coloca pelo painel Elementos > Marca, e o
* certificado tem um lugar próprio para ele (campo Logo).
*/
function componentsFor(type, mode) {
	const deck = mode === "presentation";
	const list = [];
	if (type !== "club" && type !== "certificate" && type !== "meetup") list.push("tags");
	if (!isCoverType(type) && !isBannerType(type)) {
		if (type === "content" || deck) list.push("counter");
		if (!deck) list.push("swipe");
	}
	return list;
}
/** Grade de um formato com o tamanho padrão (compacta): colunas e linhas inteiras */
function baseGrid(mode, gridSize = "compact") {
	const { width, height } = CANVAS_SIZES[mode] || CANVAS_SIZES.event;
	const cols = GRID_COLS[mode] ?? GRID_SIZES[gridSize]?.cols ?? 12;
	const cell = width / cols;
	return {
		cols,
		cell,
		rows: Math.floor(height / cell + .001),
		R: Math.ceil(height / cell - .001)
	};
}
const SIZE = {
	logo: {
		w: 2,
		h: 1
	},
	...COMPONENTS
};
/** Canto -> posição (em células) de um elemento w×h, a 1 célula das bordas, como nos cantos antigos */
function atCorner(corner, w, h, { cols, rows }) {
	return {
		x: corner.endsWith("left") ? 1 : corner.endsWith("right") ? cols - 1 - w : (cols - w) / 2,
		y: corner.startsWith("top") ? 1 : rows - 1 - h
	};
}
const logoElement = (extra = {}) => ({
	id: generateId(),
	kind: "image",
	src: AWS_LOGO_URL,
	fit: "contain",
	invert: true,
	w: 2,
	h: 1,
	x: 1,
	y: 1,
	...extra
});
/** Os componentes padrão de um slide novo */
function defaultComponents(type, mode, gridSize) {
	const grid = baseGrid(mode, gridSize);
	const spots = {
		logo: mode === "club" ? "top-right" : "top-left",
		counter: "top-right",
		tags: "bottom-left",
		swipe: "bottom-right"
	};
	return componentsFor(type, mode).map((key) => {
		const { w, h } = SIZE[key];
		const at = atCorner(spots[key], w, h, grid);
		return key === "logo" ? logoElement(at) : {
			id: generateId(),
			kind: key,
			w,
			h,
			...at
		};
	});
}
//#endregion
//#region src/data/slideTypes.js
const SLIDE_TYPES = {
	cover: {
		label: "Capa",
		icon: "flag",
		defaultData: (mode) => mode === "content" ? {
			title: "Título do post",
			content: "Resuma em uma frase o que o leitor vai aprender.",
			date: "",
			location: "",
			tags: `#AWS ${groupBrand().tag}`,
			color: "#AD5CFF"
		} : {
			title: `Meetup ${groupBrand().name}`,
			content: "Palestras sobre nuvem, IA e carreira, networking e sorteios. Gratuito e aberto a todos os cursos.",
			date: "DATA • 19:00",
			location: groupBrand().place,
			tags: `${groupBrand().tag} #Meetup`,
			color: "#AD5CFF"
		}
	},
	content: {
		label: "Conteúdo AWS",
		icon: "layout-template",
		defaultData: () => ({
			title: "Título do Tópico",
			content: "Explique o conceito de forma clara e objetiva para o seu público.",
			tags: "#AWS",
			color: "#00E582",
			imageUrl: "",
			variant: "vertical",
			imageScale: 100,
			imageAlign: "center"
		})
	},
	speaker: {
		label: "Palestrante",
		icon: "user",
		defaultData: () => ({
			title: "Tema da palestra",
			speakerName: "Nome do Palestrante",
			speakerRole: "Cargo / Empresa",
			speakerImg: "",
			speakerImgScale: 100,
			speakerLinkedin: "",
			tags: "#Palestrante",
			color: "#AD5CFF"
		})
	},
	agenda: {
		label: "Agenda",
		icon: "list-checks",
		defaultData: () => ({
			title: "Programação",
			agendaText: "19:00 - Recepção e Networking\n19:30 - Palestra Principal\n21:00 - Encerramento",
			tags: "#Agenda",
			color: "#FF9900"
		})
	},
	sponsors: {
		label: "Apoiadores",
		icon: "handshake",
		defaultData: () => ({
			title: "Apoio e Realização",
			content: "Empresas e pessoas que apoiam este evento:",
			sponsors: [],
			sponsorsFromSite: true,
			tags: "#Apoiadores",
			color: "#42B4FF"
		})
	},
	club: {
		label: "Banner do Clube",
		icon: "qr-code",
		defaultData: () => ({
			mascotUrl: mascotUrl(),
			mascotScale: 100,
			communityLabel: "Comunidade Oficial",
			organizationName: "AWS Student Builder Group",
			organizationUnit: groupBrand().short.toUpperCase(),
			title: `Participe do ${groupBrand().name}`,
			content: "Comunidade pra aprender cloud, construir projetos e evoluir com networking real.",
			highlights: "Conteúdo prático\nNetworking\nProjetos reais",
			siteUrl: groupBrand().links,
			qrCodeImage: "",
			qrCodeScale: 100,
			website: groupBrand().site,
			instagram: groupBrand().instagram,
			linkedin: groupBrand().linkedin,
			youtube: groupBrand().youtube,
			meetup: groupBrand().meetup,
			email: "",
			tags: "#JunteSe",
			color: "#AD5CFF"
		})
	},
	waiting: {
		label: "Tela de Espera",
		icon: "hourglass",
		defaultData: () => ({
			mascotUrl: mascotUrl(),
			mascotScale: 100,
			title: `Meetup ${groupBrand().name}`,
			content: "Nosso evento começará em breve...\nPrepare-se! Estamos quase lá.\nAcomode-se, já vamos iniciar.",
			date: "DATA • 19:00",
			location: groupBrand().place,
			tags: groupBrand().tag,
			color: "#00E582"
		})
	},
	backcover: {
		label: "Chamada Final",
		icon: "megaphone",
		defaultData: (mode) => mode === "event" ? {
			title: "Garanta sua vaga!",
			content: "Confirme sua presença no Meetup — link na bio.\n\nChama quem também vai curtir!",
			tags: groupBrand().tag,
			color: "#AD5CFF",
			mascotUrl: mascotUrl(),
			mascotScale: 150
		} : {
			title: "Gostou deste conteúdo?",
			content: `Salve este post e compartilhe com quem está estudando nuvem.\n\nSiga ${groupBrand().instagram} para mais conteúdos.`,
			tags: groupBrand().tag,
			color: "#FF9900",
			mascotUrl: mascotUrl(),
			mascotScale: 150
		}
	},
	"deck-title": {
		label: "Capa da palestra",
		icon: "presentation",
		defaultData: () => ({
			event: `Meetup ${groupBrand().name}`,
			title: "Título da palestra",
			content: "Uma frase sobre o que o público vai levar desta palestra.",
			speakerName: "Seu nome",
			speakerRole: "Cargo · Empresa",
			speakerImg: "",
			date: "",
			tags: "#AWSSBG",
			notes: "",
			color: "#AD5CFF"
		})
	},
	"deck-section": {
		label: "Seção",
		icon: "square-split-vertical",
		defaultData: () => ({
			title: "Nome da seção",
			content: "O que vem nesta parte",
			tags: "#AWSSBG",
			notes: "",
			color: "#AD5CFF"
		})
	},
	"deck-bullets": {
		label: "Tópicos",
		icon: "list-ordered",
		defaultData: () => ({
			title: "Título do slide",
			items: "Primeiro ponto importante\nSegundo ponto\n- Detalhe do segundo ponto\nTerceiro ponto",
			numbered: false,
			tags: "#AWSSBG",
			notes: "",
			color: "#AD5CFF"
		})
	},
	"deck-image": {
		label: "Imagem",
		icon: "image",
		defaultData: () => ({
			title: "Arquitetura da solução",
			content: "",
			imageUrl: "",
			imageScale: 100,
			variant: "stack",
			caption: "",
			tags: "#AWSSBG",
			notes: "",
			color: "#42B4FF"
		})
	},
	"deck-code": {
		label: "Código",
		icon: "code-2",
		defaultData: () => ({
			title: "Exemplo",
			language: "Python",
			code: "import boto3\n\ns3 = boto3.client(\"s3\")\n\nfor bucket in s3.list_buckets()[\"Buckets\"]:\n    print(bucket[\"Name\"])",
			content: "",
			tags: "#AWSSBG",
			notes: "",
			color: "#00E582"
		})
	},
	"deck-compare": {
		label: "Comparação",
		icon: "columns-2",
		defaultData: () => ({
			title: "Antes × Depois",
			leftTitle: "Antes",
			leftItems: "Servidor ligado 24h\nDeploy manual\nEscala na mão",
			rightTitle: "Depois",
			rightItems: "Paga só pelo uso\nDeploy automático\nEscala sozinho",
			tags: "#AWSSBG",
			notes: "",
			color: "#FF9900"
		})
	},
	"deck-quote": {
		label: "Destaque",
		icon: "quote",
		defaultData: () => ({
			title: "Uma frase que resume a ideia principal.",
			content: "Autor ou fonte",
			tags: "#AWSSBG",
			notes: "",
			color: "#FF57E9"
		})
	},
	"deck-end": {
		label: "Encerramento",
		icon: "megaphone",
		defaultData: () => ({
			title: "Obrigado!",
			content: "Perguntas?",
			linkedin: "",
			github: "",
			email: "",
			website: "",
			qrLink: "",
			tags: "#AWSSBG",
			notes: "",
			color: "#AD5CFF",
			mascotUrl: mascotUrl(),
			mascotScale: 150
		})
	},
	meetup: {
		label: "Banner do Meetup",
		icon: "sparkles",
		defaultData: () => ({
			kicker: `Meetup ${groupBrand().name}`,
			title: "Nome do evento",
			content: "Nuvem, IA e carreira, com networking e muita troca entre builders.",
			date: "DATA • 19:00",
			location: groupBrand().place,
			highlights: "",
			showSponsors: true,
			sponsors: [],
			sponsorsFromSite: true,
			mascotUrl: mascotUrl(),
			tags: groupBrand().tag,
			color: "#AD5CFF"
		})
	},
	certificate: {
		label: "Certificado",
		icon: "award",
		defaultData: () => ({
			kicker: "Certificado de participação",
			badge: "mascot",
			badgePosition: "footer",
			title: `Meetup ${groupBrand().name}`,
			content: "participou do {evento}, realizado em {data}, em {local}, com carga horária de {horas}.",
			date: "",
			location: groupBrand().place,
			hours: "2 horas",
			signer1Name: "",
			signer1Role: `Líder · ${groupBrand().name}`,
			signer1Img: "",
			signer2Name: "",
			signer2Role: "",
			signer2Img: "",
			previewName: "Nome do Participante",
			recipients: [],
			tags: "#AWSSBG",
			color: "#AD5CFF"
		})
	}
};
function createSlide(type, mode) {
	const def = SLIDE_TYPES[type];
	if (!def) throw new Error(`Tipo de slide desconhecido: ${type}`);
	return {
		id: generateId(),
		type,
		...def.defaultData(mode),
		elements: defaultComponents(type, mode)
	};
}
//#endregion
//#region src/data/modes.js
const EVENT_ACCENT_COLOR = "#AD5CFF";
const POST_CANVAS = CANVAS_SIZES.event;
const MODES = {
	event: {
		label: "Evento",
		icon: "calendar-days",
		description: "Carrossel de divulgação: capa, palestrante, agenda, apoiadores e chamada final.",
		slideTypes: [
			"cover",
			"speaker",
			"agenda",
			"sponsors",
			"backcover"
		],
		canvasSize: POST_CANVAS,
		getDefaultSlides: () => [
			{
				...createSlide("cover", "event"),
				color: EVENT_ACCENT_COLOR
			},
			{
				...createSlide("speaker", "event"),
				color: EVENT_ACCENT_COLOR
			},
			{
				...createSlide("agenda", "event"),
				color: EVENT_ACCENT_COLOR
			},
			{
				...createSlide("sponsors", "event"),
				color: EVENT_ACCENT_COLOR
			},
			{
				...createSlide("backcover", "event"),
				color: EVENT_ACCENT_COLOR
			}
		]
	},
	content: {
		label: "Conteúdo",
		icon: "newspaper",
		description: "Carrossel de posts educativos sobre AWS/Cloud: capa, tópicos e chamada final.",
		slideTypes: [
			"cover",
			"content",
			"backcover"
		],
		canvasSize: POST_CANVAS,
		getDefaultSlides: () => [
			{
				...createSlide("cover", "content"),
				title: "O Cérebro da Nuvem: Guia Definitivo",
				content: "Descomplique as opções de computação na AWS e aprenda de forma prática."
			},
			{
				...createSlide("content", "content"),
				title: "1. Máquinas Virtuais",
				content: "O Amazon EC2 é a base da computação.\n\nFornece servidores virtuais com total controle sobre o sistema operacional. Ideal para aplicações tradicionais.",
				tags: "#AmazonEC2 #Infra"
			},
			{
				...createSlide("content", "content"),
				title: "2. Serverless",
				content: "Escreva e execute código sem gerenciar servidores com o AWS Lambda.\n\nVocê paga apenas pelo tempo exato de computação consumido.",
				tags: "#Serverless #AWSLambda",
				color: "#FF9900"
			},
			{ ...createSlide("backcover", "content") }
		]
	},
	club: {
		label: "Banner do Clube",
		icon: "qr-code",
		description: "Folha A4 pra divulgar o clube: identidade, chamada, destaques e QR code do site.",
		slideTypes: ["club"],
		canvasSize: CANVAS_SIZES.club,
		getDefaultSlides: () => [createSlide("club", "club")]
	},
	waiting: {
		label: "Tela de Espera",
		icon: "hourglass",
		description: "Banner widescreen pra deixar em loop no telão antes do evento começar.",
		slideTypes: ["waiting"],
		canvasSize: CANVAS_SIZES.waiting,
		getDefaultSlides: () => [createSlide("waiting", "waiting")]
	},
	presentation: {
		label: "Apresentação",
		icon: "presentation",
		description: "Slides 16:9 para palestras e workshops, com notas do apresentador, modo Apresentar e exportação em PDF e PowerPoint.",
		slideTypes: [
			"deck-title",
			"deck-section",
			"deck-bullets",
			"deck-image",
			"deck-code",
			"deck-compare",
			"deck-quote",
			"deck-end"
		],
		canvasSize: CANVAS_SIZES.presentation,
		getDefaultSlides: () => [
			createSlide("deck-title", "presentation"),
			createSlide("deck-section", "presentation"),
			createSlide("deck-bullets", "presentation"),
			createSlide("deck-code", "presentation"),
			createSlide("deck-compare", "presentation"),
			createSlide("deck-end", "presentation")
		]
	},
	meetup: {
		label: "Banner do Meetup",
		icon: "sparkles",
		description: "Banner horizontal (1200×685), na proporção da capa do evento no Meetup: chamada, título, data, local, etiquetas e apoiadores. Serve para meetups, Student Community Day e outros eventos.",
		slideTypes: ["meetup"],
		canvasSize: CANVAS_SIZES.meetup,
		getDefaultSlides: () => [createSlide("meetup", "meetup")]
	},
	certificate: {
		label: "Certificado",
		icon: "award",
		description: "Certificados em PDF (A4) com o nome de cada participante, para baixar ou enviar por e-mail. Só líder e core team.",
		slideTypes: ["certificate"],
		canvasSize: CANVAS_SIZES.certificate,
		getDefaultSlides: () => [createSlide("certificate", "certificate")]
	}
};
const tidy = (t) => (t || "").replace(/\s+/g, " ").trim();
function projectTitleOf({ slides, globalSettings, modeLabel }) {
	return tidy(globalSettings?.projectTitle).slice(0, 120) || tidy(slides.find((s) => tidy(s.title))?.title) || modeLabel;
}
//#endregion
//#region src/utils/gridMetrics.js
/**
* Medidas da grade de um formato: tamanho do card, colunas, lado da célula e linhas. `rows` conta só as
* linhas inteiras; `R` conta também a última, parcial, quando a altura não é múltipla da célula.
* Banners e apresentação têm colunas fixas; os posts usam o tamanho de grade escolhido.
*/
function gridMetrics(mode, gridSize) {
	const { width: W, height: H } = MODES[mode].canvasSize;
	const cols = GRID_COLS[mode] ?? GRID_SIZES[gridSize]?.cols ?? 12;
	const cell = W / cols;
	return {
		W,
		H,
		cols,
		cell,
		rows: Math.floor(H / cell + .001),
		R: Math.ceil(H / cell - .001)
	};
}
//#endregion
//#region src/lib/eventData.js
const isUtcMidnight = (d) => d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
const isLocalMidnight = (d) => d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
function eventDate(iso) {
	const d = new Date(iso);
	if (isUtcMidnight(d) && !isLocalMidnight(d)) return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
	return d;
}
const eventHasTime = (iso) => !isLocalMidnight(eventDate(iso));
function isPastEvent(iso, now = /* @__PURE__ */ new Date()) {
	const d = eventDate(iso);
	return (eventHasTime(iso) ? d : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)) < now;
}
const time = (d) => d.toLocaleTimeString("pt-BR", {
	hour: "2-digit",
	minute: "2-digit"
});
const clean = (s) => s.replace(/\./g, "").toUpperCase();
/** "SÁB, 24 DE AGOSTO • 19:00" (capa do post e tela de espera) */
function longDate(iso) {
	const d = eventDate(iso);
	const day = clean(d.toLocaleDateString("pt-BR", {
		weekday: "short",
		day: "numeric",
		month: "long"
	}));
	return eventHasTime(iso) ? `${day} • ${time(d)}` : day;
}
/** "15 OUT 2026" (capa da apresentação) */
function shortDate(iso) {
	return clean(eventDate(iso).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	})).replace(/ DE /g, " ");
}
/** Resumo curto para o texto da capa: até ~220 caracteres, cortando numa frase ou palavra */
function summary(text, max = 220) {
	const t = (text || "").replace(/\s+/g, " ").trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max);
	const sentence = cut.lastIndexOf(". ");
	return sentence > max * .5 ? cut.slice(0, sentence + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
const eventSpeakers = (event) => Array.isArray(event?.speakers) ? event.speakers.filter((s) => s?.name?.trim()) : [];
/**
* Evento que preenche um projeto novo: o próximo que ainda vai acontecer (o mais perto da data de
* hoje); se não houver nenhum futuro, o que aconteceu por último. `events` em qualquer ordem.
*/
function pickDefaultEvent(events, now = /* @__PURE__ */ new Date()) {
	const list = (events ?? []).filter((e) => e?.date);
	const upcoming = list.filter((e) => !isPastEvent(e.date, now)).sort((a, b) => eventDate(a.date) - eventDate(b.date));
	if (upcoming.length) return upcoming[0];
	return list.sort((a, b) => eventDate(b.date) - eventDate(a.date))[0] ?? null;
}
//#endregion
//#region src/lib/fillFromSite.js
/** "/in/josé-henrique" a partir do link do perfil, sem o domínio e com os acentos legíveis (o link vem codificado: %C3%A9) */
function linkedinPath(url) {
	const path = String(url).trim().replace(/^https?:\/\/(www\.)?linkedin\.com/i, "").replace(/\/$/, "");
	try {
		return decodeURI(path);
	} catch {
		return path;
	}
}
const same = (a, b) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
/** Aplica um evento do site aos slides do formato atual. Devolve { slides, changes } */
function applyEventToSlides(mode, slides, event, profile) {
	const changes = [];
	let next = slides.map((s) => ({ ...s }));
	const speakers = eventSpeakers(event);
	if (mode === "event") {
		const cover = next.find((s) => s.type === "cover");
		if (cover) {
			Object.assign(cover, {
				title: event.title,
				content: summary(event.description) || cover.content,
				date: longDate(event.date),
				location: event.location || cover.location
			});
			changes.push("capa");
		}
		if (speakers.length) {
			const existing = next.filter((s) => s.type === "speaker");
			const color = cover?.color;
			const made = speakers.map((sp, i) => ({
				...existing[i] ?? {
					...createSlide("speaker", mode),
					...color ? { color } : {}
				},
				speakerName: sp.name,
				speakerRole: sp.role || "",
				title: sp.topic || existing[i]?.title || "",
				speakerImg: sp.photo || existing[i]?.speakerImg || "",
				speakerLinkedin: sp.linkedin ? linkedinPath(sp.linkedin) : existing[i]?.speakerLinkedin || ""
			}));
			const firstIdx = next.findIndex((s) => s.type === "speaker");
			const without = next.filter((s) => s.type !== "speaker");
			const at = firstIdx >= 0 ? firstIdx : Math.max(without.findIndex((s) => s.type === "cover") + 1, 0);
			without.splice(at, 0, ...made);
			next = without;
			changes.push(speakers.length === 1 ? "1 palestrante" : `${speakers.length} palestrantes`);
		}
		const sponsorIds = Array.isArray(event.sponsor_ids) ? event.sponsor_ids : [];
		if (sponsorIds.length) {
			const slidesWithSponsors = next.filter((s) => s.type === "sponsors");
			for (const sl of slidesWithSponsors) Object.assign(sl, {
				sponsorsFromSite: true,
				sponsorIds
			});
			if (slidesWithSponsors.length) changes.push(sponsorIds.length === 1 ? "1 apoiador" : `${sponsorIds.length} apoiadores`);
		}
		if (event.agenda?.trim()) {
			const agenda = next.find((s) => s.type === "agenda");
			if (agenda) {
				agenda.agendaText = event.agenda.trim();
				changes.push("agenda");
			}
		}
	}
	if (mode === "waiting") {
		for (const s of next.filter((x) => x.type === "waiting")) Object.assign(s, {
			title: event.title,
			date: longDate(event.date),
			location: event.location || s.location
		});
		changes.push("tela de espera");
	}
	if (mode === "meetup") {
		const sponsorIds = Array.isArray(event.sponsor_ids) ? event.sponsor_ids : [];
		for (const s of next.filter((x) => x.type === "meetup")) Object.assign(s, {
			title: event.title,
			content: summary(event.description, 110) || s.content,
			date: longDate(event.date),
			location: event.location || s.location,
			...sponsorIds.length ? {
				sponsorsFromSite: true,
				sponsorIds
			} : {}
		});
		changes.push(sponsorIds.length ? "banner e apoiadores" : "banner");
	}
	if (mode === "certificate") {
		for (const s of next.filter((x) => x.type === "certificate")) {
			const d = eventDate(event.date);
			Object.assign(s, {
				title: event.title,
				date: d.toLocaleDateString("pt-BR", {
					day: "numeric",
					month: "long",
					year: "numeric"
				}),
				location: event.location || s.location
			});
		}
		changes.push("evento, data e local");
	}
	if (mode === "presentation") {
		const title = next.find((s) => s.type === "deck-title");
		if (title) {
			title.event = event.title;
			title.date = shortDate(event.date);
			const me = speakers.find((sp) => sp.profile_id && sp.profile_id === profile?.id || same(sp.name, profile?.name));
			if (me?.topic) title.title = me.topic;
			if (me?.role && (!title.speakerRole || title.speakerRole === SLIDE_TYPES["deck-title"].defaultData().speakerRole)) title.speakerRole = me.role;
			changes.push(me?.topic ? "capa (com o seu tema)" : "capa");
		}
	}
	return {
		slides: next,
		changes
	};
}
SLIDE_TYPES["deck-title"].defaultData();
//#endregion
//#region src/utils/certificates.js
/** Troca {nome}, {evento}, {data}, {local} e {horas} pelos valores do certificado */
/** Logo do certificado, numa linha própria acima do tipo (ver certificateBody.jsx) */
const CERTIFICATE_BADGES = {
	none: {
		label: "Sem logo",
		aws: false,
		mascot: false
	},
	aws: {
		label: "Logo da AWS",
		aws: true,
		mascot: false
	},
	mascot: {
		label: "Mascote (Aurora)",
		aws: false,
		mascot: true
	},
	both: {
		label: "Mascote e logo da AWS",
		aws: true,
		mascot: true
	}
};
/** Onde a logo do certificado fica (lugares prontos do layout, ver certificateBody.jsx) */
const CERTIFICATE_BADGE_POSITIONS = {
	footer: "No rodapé, entre a assinatura e as informações",
	top: "Na linha do tipo (acima do nome)"
};
//#endregion
//#region src/mcp/errors.js
/** Erro de entrada: a mensagem volta para o Claude corrigir e tentar de novo */
var ProjectInputError = class extends Error {};
//#endregion
//#region src/lib/taskRules.js
const STATUS = {
	todo: {
		label: "Aguardando",
		accent: "#c3c8d0"
	},
	doing: {
		label: "Em andamento",
		accent: "#42b4ff"
	},
	review: {
		label: "Em aprovação",
		accent: "#ff9900"
	},
	done: {
		label: "Finalizada",
		accent: "#00e582"
	}
};
const KINDS = {
	task: "Tarefa",
	fix: "Correção",
	idea: "Ideia"
};
const CATEGORIES = {
	design: "Design",
	content: "Conteúdo",
	social: "Redes sociais",
	event: "Evento",
	studio: "Site / Studio",
	other: "Outro"
};
const PRIORITIES = {
	high: {
		label: "Alta",
		accent: "#ff7a7a"
	},
	medium: {
		label: "Média",
		accent: "#ff9900"
	},
	low: {
		label: "Baixa",
		accent: "#a3a8b3"
	}
};
//#endregion
//#region src/lib/linkRules.js
/** Mesma checagem do banco (is_http_url): http(s), sem espaços, até 500 caracteres */
function isHttpUrl(value) {
	return /^https?:\/\/[^\s<>"]+$/i.test(value?.trim() ?? "") && value.trim().length <= 500;
}
/**
* Situação do link agora:
*  off       desligado manualmente
*  ended     já passou do "some em"
*  scheduled ligado, mas ainda antes do "aparece em" (com contagem: travado; sem: oculto)
*  live      no ar
*/
function linkStatus(link, now = Date.now()) {
	if (!link.enabled) return "off";
	if (link.ends_at && Date.parse(link.ends_at) <= now) return "ended";
	if (link.starts_at && Date.parse(link.starts_at) > now) return "scheduled";
	return "live";
}
//#endregion
//#region src/mcp/workspace.js
const norm = (t) => String(t ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const pick = (map, value, what) => {
	if (value === void 0 || value === null || value === "") return void 0;
	const v = norm(value);
	const hit = Object.entries(map).find(([key, aliases]) => key === v || aliases.includes(v));
	if (!hit) throw new ProjectInputError(`${what} "${value}" não existe (use ${Object.keys(map).join(", ")}).`);
	return hit[0];
};
const STATUS_IN = {
	todo: [
		"aguardando",
		"a fazer",
		"afazer",
		"pendente"
	],
	doing: [
		"em andamento",
		"andamento",
		"fazendo"
	],
	review: [
		"em aprovacao",
		"aprovacao",
		"revisao"
	],
	done: [
		"finalizada",
		"finalizado",
		"concluida",
		"concluido",
		"feito",
		"aprovada"
	]
};
const KIND_IN = {
	task: ["tarefa"],
	fix: [
		"correcao",
		"bug",
		"problema"
	],
	idea: ["ideia"]
};
const CATEGORY_IN = {
	design: [],
	content: ["conteudo"],
	social: [
		"redes sociais",
		"redes",
		"social media"
	],
	event: ["evento"],
	studio: [
		"site",
		"site / studio",
		"site/studio"
	],
	other: ["outro", "outros"]
};
const PRIORITY_IN = {
	high: ["alta", "urgente"],
	medium: ["media", "normal"],
	low: ["baixa"]
};
const TASK_OPTIONS = {
	situacao: Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, v.label])),
	tipo: KINDS,
	categoria: CATEGORIES,
	prioridade: Object.fromEntries(Object.entries(PRIORITIES).map(([k, v]) => [k, v.label])),
	regras: "A equipe move entre aguardando, em andamento e em aprovação; só o líder finaliza (aprova) ou reabre uma tarefa finalizada. Responsável: alguém do core team ou o líder."
};
const resolveStatus = (value) => pick(STATUS_IN, value, "Situação");
/** Só o líder finaliza (aprova) ou reabre; o resto da equipe anda livre entre as outras situações */
function canMoveTask(from, to, isLeader) {
	if (from === to) return true;
	return isLeader || from !== "done" && to !== "done";
}
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
/** Campos da tarefa a gravar (`partial`: só os que vieram, para editar) */
function taskFields(input, { partial = false } = {}) {
	const out = {};
	if (!partial || input.titulo !== void 0) {
		const title = String(input.titulo ?? "").trim().slice(0, 140);
		if (!title) throw new ProjectInputError("A tarefa precisa de um título.");
		out.title = title;
	}
	if (input.descricao !== void 0) out.description = String(input.descricao ?? "").slice(0, 5e3);
	const kind = pick(KIND_IN, input.tipo, "Tipo");
	if (kind) out.kind = kind;
	const category = pick(CATEGORY_IN, input.categoria, "Categoria");
	if (category) out.category = category;
	const priority = pick(PRIORITY_IN, input.prioridade, "Prioridade");
	if (priority) out.priority = priority;
	if (input.prazo !== void 0) {
		if (input.prazo === null || input.prazo === "" || norm(input.prazo) === "nenhum") out.due_date = null;
		else if (ISO_DAY.test(String(input.prazo)) && !Number.isNaN(Date.parse(input.prazo))) out.due_date = input.prazo;
		else throw new ProjectInputError(`Prazo "${input.prazo}" inválido: use AAAA-MM-DD (ou "nenhum").`);
	}
	return out;
}
/** Acha a pessoa da equipe pelo que o Claude mandou: "eu", o id ou parte do nome. null = sem responsável */
function findPerson(team, value, me) {
	if (value === void 0) return void 0;
	if (value === null || value === "" || norm(value) === "ninguem" || norm(value) === "nenhum") return null;
	if (norm(value) === "eu") return me;
	const v = norm(value);
	const exact = team.find((p) => p.id === value || norm(p.name) === v);
	if (exact) return exact.id;
	const partial = team.filter((p) => norm(p.name).includes(v));
	if (partial.length === 1) return partial[0].id;
	if (partial.length > 1) throw new ProjectInputError(`"${value}" combina com mais de uma pessoa (${partial.map((p) => p.name).join(", ")}): diga o nome completo.`);
	throw new ProjectInputError(`Ninguém do core team ou liderança chamado "${value}" (veja listar_equipe).`);
}
/** Tarefa para o Claude ler: em português, com nomes no lugar dos ids */
function describeTask(t, { people = /* @__PURE__ */ new Map(), folders = /* @__PURE__ */ new Map() } = {}) {
	return {
		id: t.id,
		titulo: t.title,
		descricao: t.description ? t.description.slice(0, 600) : "",
		situacao: STATUS[t.status]?.label ?? t.status,
		tipo: KINDS[t.kind] ?? t.kind,
		categoria: CATEGORIES[t.category] ?? t.category,
		prioridade: PRIORITIES[t.priority]?.label ?? t.priority,
		prazo: t.due_date || null,
		responsavel: t.assignee_id ? people.get(t.assignee_id) ?? "alguém da equipe" : null,
		projeto: t.folder_id ? folders.get(t.folder_id) ?? null : null,
		criada_por: people.get(t.created_by) ?? null,
		...t.approved_by ? { aprovada_por: people.get(t.approved_by) ?? null } : {},
		atualizada_em: t.updated_at
	};
}
function folderName(value) {
	const name = String(value ?? "").trim().slice(0, 80);
	if (!name) throw new ProjectInputError("O projeto precisa de um nome.");
	return name;
}
const LINK_STATUS = {
	live: "No ar",
	scheduled: "Agendado",
	off: "Desligado",
	ended: "Encerrado"
};
const bool = (v) => typeof v === "boolean" ? v : [
	"sim",
	"true",
	"1",
	"ligado"
].includes(norm(v));
/** Data e hora sem fuso ("2026-10-20T19:00") = horário de Brasília */
function parseDateTime(value, what) {
	if (value === null || value === "" || norm(value) === "nenhum") return null;
	let v = String(value).trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v += "T00:00";
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)) v += "-03:00";
	const t = Date.parse(v);
	if (Number.isNaN(t)) throw new ProjectInputError(`${what} "${value}" inválido: use AAAA-MM-DDTHH:MM (horário de Brasília).`);
	return new Date(t).toISOString();
}
/** Campos do link a gravar (`partial`: só os que vieram, para editar); `current` = o link antes (para checar o horário) */
function linkFields(input, { partial = false, current = null } = {}) {
	const out = {};
	if (!partial || input.titulo !== void 0) {
		const title = String(input.titulo ?? "").trim().slice(0, 80);
		if (!title) throw new ProjectInputError("O link precisa de um título.");
		out.title = title;
	}
	if (!partial || input.url !== void 0) {
		const url = String(input.url ?? "").trim();
		if (!isHttpUrl(url)) throw new ProjectInputError(`Endereço "${url}" inválido: use http(s)://…`);
		out.url = url;
	}
	if (input.descricao !== void 0) out.description = String(input.descricao ?? "").trim().slice(0, 160) || null;
	if (input.grupo !== void 0) out.group_label = String(input.grupo ?? "").trim().slice(0, 40) || null;
	if (input.ligado !== void 0) out.enabled = bool(input.ligado);
	if (input.destaque !== void 0) out.highlight = bool(input.destaque);
	if (input.contagem !== void 0) out.countdown = bool(input.contagem);
	if (input.aparece_em !== void 0) out.starts_at = parseDateTime(input.aparece_em, "aparece_em");
	if (input.some_em !== void 0) out.ends_at = parseDateTime(input.some_em, "some_em");
	const starts = out.starts_at !== void 0 ? out.starts_at : current?.starts_at;
	const ends = out.ends_at !== void 0 ? out.ends_at : current?.ends_at;
	if (starts && ends && Date.parse(ends) <= Date.parse(starts)) throw new ProjectInputError("\"some_em\" precisa ser depois de \"aparece_em\".");
	return out;
}
function describeLink(l, now = Date.now()) {
	return {
		id: l.id,
		titulo: l.title,
		url: l.url,
		descricao: l.description || "",
		grupo: l.group_label || null,
		situacao: LINK_STATUS[linkStatus(l, now)],
		ligado: l.enabled,
		destaque: l.highlight,
		aparece_em: l.starts_at,
		some_em: l.ends_at,
		contagem_regressiva: l.countdown
	};
}
//#endregion
//#region src/mcp/project.js
var project_exports = /* @__PURE__ */ __exportAll({
	EVENT_MODES: () => EVENT_MODES,
	LOOKS: () => LOOKS,
	MCP_MODES: () => MCP_MODES,
	ProjectInputError: () => ProjectInputError,
	TASK_OPTIONS: () => TASK_OPTIONS,
	buildProject: () => buildProject,
	canMoveTask: () => canMoveTask,
	cleanLink: () => cleanLink,
	describeLink: () => describeLink,
	describeOptions: () => describeOptions,
	describeTask: () => describeTask,
	eventDateBR: () => eventDateBR,
	eventLongDateBR: () => eventLongDateBR,
	findPerson: () => findPerson,
	folderName: () => folderName,
	hasDesign: () => hasDesign,
	linkFields: () => linkFields,
	parseDateTime: () => parseDateTime,
	pickDefaultEvent: () => pickDefaultEvent,
	pickLook: () => pickLook,
	pickPhoto: () => pickPhoto,
	resolveColor: () => resolveColor,
	resolveStatus: () => resolveStatus,
	styleOf: () => styleOf,
	summarizeSlides: () => summarizeSlides,
	taskFields: () => taskFields
});
/** Todos os formatos do Studio (quem pode o quê segue os cargos: o palestrante só faz apresentação) */
const MCP_MODES = Object.keys(MODES);
/** Os posts (carrosséis): só neles entram ícones automáticos e a foto automática da capa */
const POST_MODES = ["content", "event"];
/** Formatos que puxam os dados de um evento do site (mesma rotina do botão "Evento do site") */
const EVENT_MODES = [
	"event",
	"waiting",
	"meetup",
	"certificate",
	"presentation"
];
/** Mesmo valor de PROJECT_FILE_VERSION (state/AppStateContext.jsx), que não dá para importar aqui (React) */
const FILE_VERSION = 1;
const MAX_SLIDES = 10;
const MAX_DECK_SLIDES = 30;
const MAX_TEXT = 2e3;
const NOT_FIELDS = /(Img|Url|Image)$|^(color|variant|imageAlign|badge|badgePosition|previewName|sponsorsFromSite)$/;
const FIELD_HELP = {
	items: "tópicos, um por linha (linha começando com \"- \" vira subtópico)",
	code: "o código (quebras de linha com \\n)",
	language: "linguagem do código (Python, JavaScript...)",
	notes: "notas do apresentador (aparecem só no modo Apresentar e no .pptx)",
	leftTitle: "título da coluna da esquerda",
	leftItems: "itens da esquerda, um por linha",
	rightTitle: "título da coluna da direita",
	rightItems: "itens da direita, um por linha",
	highlights: "destaques, um por linha",
	kicker: "chamada curta acima do título",
	event: "nome do evento (capa da apresentação)",
	hours: "carga horária, ex.: \"2 horas\"",
	signer1Name: "quem assina (o líder, por padrão)",
	signer1Role: "cargo de quem assina",
	signer2Name: "segunda assinatura (opcional)",
	signer2Role: "cargo da segunda assinatura",
	qrLink: "link que vira QR code no slide final",
	numbered: "true = tópicos numerados",
	showSponsors: "true = mostra a faixa de apoiadores",
	title: "título (curto e forte)",
	content: "texto de apoio (quebras de linha com \\n)",
	date: "data e hora, ex.: \"12 NOV • 19:00\"",
	location: "local",
	tags: "hashtags separadas por espaço, ex.: \"#AWS #Lambda\"",
	speakerName: "nome do palestrante",
	speakerRole: "cargo / empresa do palestrante",
	agendaText: "uma linha por item, ex.: \"19:00 - Recepção\""
};
const STYLE_OPTIONS = {
	theme: Object.fromEntries(Object.entries(THEMES).map(([k, v]) => [k, v.label])),
	pattern: Object.fromEntries(Object.entries(GRID_PATTERNS).map(([k, v]) => [k, v.label])),
	composition: Object.fromEntries(Object.entries(COMPOSITIONS).map(([k, v]) => [k, `${v.label}: ${v.hint}`])),
	gridLines: Object.fromEntries(Object.entries(GRID_LINES).map(([k, v]) => [k, v.label])),
	blockGradient: {
		auto: "Automático (combina com a cor)",
		...Object.fromEntries(Object.entries(GRADIENTS).map(([k, v]) => [k, v.label]))
	},
	gridSize: Object.fromEntries(Object.entries(GRID_SIZES).map(([k, v]) => [k, v.label]))
};
const STYLE_KEYS = Object.keys(STYLE_OPTIONS);
const COLORS = {
	roxo: KIT.purple,
	"roxo-forte": KIT.purpleStrong,
	magenta: KIT.magenta,
	"magenta-forte": KIT.magentaStrong,
	azul: KIT.sky,
	"azul-forte": KIT.skyStrong,
	verde: KIT.mint,
	"verde-forte": KIT.mintStrong,
	laranja: KIT.orange,
	"laranja-forte": KIT.orangeStrong
};
const HEX = /^#[0-9a-f]{6}$/i;
/**
* Visuais prontos: combinações de tema, padrão de blocos, composição, grade e paleta que ficam boas juntas. O Claude
* escolhe um pelo nome (ou o servidor sorteia um diferente dos últimos materiais); `estilo` ainda ajusta por cima.
* As cores da paleta se alternam entre os slides (o ritmo do carrossel).
*/
const LOOKS = {
	"noite-roxa": {
		descricao: "Escuro com escadinha e destaques roxo/magenta: o visual clássico do grupo",
		estilo: {
			theme: "sbg-dark",
			pattern: "stairs",
			composition: "open",
			gridLines: "lines",
			blockGradient: "auto"
		},
		cores: [
			"roxo",
			"magenta",
			"azul",
			"roxo"
		]
	},
	"neon-verde": {
		descricao: "Escuro, faixa atrás do texto, pontos e células acesas em verde/azul: tech, energético",
		estilo: {
			theme: "sbg-dark",
			pattern: "constellation",
			composition: "band",
			gridLines: "dots",
			blockGradient: "lime"
		},
		cores: [
			"verde",
			"azul",
			"verde",
			"laranja"
		]
	},
	aurora: {
		descricao: "Degradê aurora (roxo → azul → branco) com cartão branco: leve e moderno",
		estilo: {
			theme: "grad-aurora",
			pattern: "gradient",
			composition: "card",
			gridLines: "fine",
			blockGradient: "aurora"
		},
		cores: [
			"roxo-forte",
			"azul-forte",
			"roxo-forte"
		]
	},
	"por-do-sol": {
		descricao: "Degradê magenta → laranja, painel embaixo e escadinha em degradê: vibrante, para eventos",
		estilo: {
			theme: "grad-sunset",
			pattern: "stairs-gradient",
			composition: "panel-bottom",
			gridLines: "lines",
			blockGradient: "sunset"
		},
		cores: [
			"magenta-forte",
			"laranja-forte",
			"magenta-forte"
		]
	},
	papel: {
		descricao: "Claro, grade aberta e escadinha dupla colorida: limpo, bom para conteúdo didático",
		estilo: {
			theme: "sbg-light",
			pattern: "stairs-double",
			composition: "open",
			gridLines: "lines",
			blockGradient: "auto"
		},
		cores: [
			"roxo-forte",
			"azul-forte",
			"verde-forte",
			"laranja-forte"
		]
	},
	candy: {
		descricao: "Degradê candy (lilás → rosa → laranja), escadinha dupla e cruzes: divertido",
		estilo: {
			theme: "grad-candy",
			pattern: "stairs-double",
			composition: "card",
			gridLines: "cross",
			blockGradient: "candy"
		},
		cores: [
			"roxo-forte",
			"magenta-forte",
			"laranja-forte"
		]
	},
	"azul-profundo": {
		descricao: "Fundo azul profundo, faixa lateral e grade fina: sóbrio, institucional",
		estilo: {
			theme: "sbg-deep-blue",
			pattern: "strip",
			composition: "panel-top",
			gridLines: "fine",
			blockGradient: "aurora"
		},
		cores: [
			"azul",
			"verde",
			"azul"
		]
	},
	"bloco-roxo": {
		descricao: "Fundo roxo inteiro, escadinha em degradê e grade aberta: forte, chama atenção",
		estilo: {
			theme: "sbg-purple",
			pattern: "stairs-gradient",
			composition: "open",
			gridLines: "lines",
			blockGradient: "sunset"
		},
		cores: ["roxo"]
	},
	"laranja-kit": {
		descricao: "Fundo laranja com cantos e faixa: quente, bom para chamadas e avisos",
		estilo: {
			theme: "sbg-orange",
			pattern: "corners",
			composition: "band",
			gridLines: "lines",
			blockGradient: "sunset"
		},
		cores: ["laranja"]
	}
};
/** Fotos: posição, tamanho e filtro (o escurecimento para o texto ficar legível é automático no Studio) */
const PHOTO_OPTIONS = {
	posicao: Object.fromEntries(Object.entries(PHOTO_LAYOUTS).map(([k, v]) => [k, v.label])),
	tamanho: Object.fromEntries(Object.entries(PHOTO_SIZES).map(([k, v]) => [k, v.label])),
	filtro: Object.fromEntries(Object.entries(PHOTO_FILTERS).map(([k, v]) => [k, v.label]))
};
const SLIDE_KEYS = [
	"tipo",
	"type",
	"cor",
	"color",
	"foto",
	"foto_posicao",
	"foto_tamanho",
	"foto_filtro",
	"elementos",
	"ocultar",
	"badge",
	"badgePosition",
	"imagem",
	"icone_titulo",
	"mascote"
];
/** Fundos degradê da marca (bucket brand, fundos/endcard-N.jpg), usados como foto do slide */
const BRAND_BACKGROUNDS = [
	"fundo-1",
	"fundo-2",
	"fundo-3",
	"fundo-4",
	"fundo-5",
	"fundo-6"
];
const MAX_ELEMENTOS = 4;
const ELEMENT_COLORS = {
	verde: "mint",
	roxo: "purple",
	laranja: "amber",
	azul: "blue",
	magenta: "magenta",
	rosa: "magenta",
	branco: "white",
	escuro: "grey-850"
};
const SLOTS = [
	"topo-esquerda",
	"topo-centro",
	"topo-direita",
	"base-esquerda",
	"base-centro",
	"base-direita"
];
const ICONS = Object.fromEntries(BRAND_ICONS.map((i) => [i.id, i.label]));
const ELEMENT_TYPES = {
	icone: {
		descricao: "Ícone da marca AWS (2x2 células; \"tamanho\": \"p\" = 1x1)",
		campos: {
			icone: ICONS,
			cor: "cor do ícone"
		}
	},
	selo: {
		descricao: "Selo de destaque com texto curto (ex.: \"NOVO\", \"GRATUITO\", \"VAGAS LIMITADAS\"), 1 linha",
		campos: {
			texto: "até 18 caracteres",
			cor: "cor do fundo"
		}
	},
	data: {
		descricao: "Chip com ícone e texto (data, hora, local, pessoas), 1 linha",
		campos: {
			texto: "ex.: \"20 OUT · 19h\"",
			icone: CHIP_ICONS,
			cor: "cor da célula do ícone"
		}
	},
	bloco: {
		descricao: "Bloco colorido decorativo (1x1; \"tamanho\": \"g\" = 2x2)",
		campos: {
			cor: "cor",
			estilo: {
				solid: "cheio",
				outline: "só contorno"
			}
		}
	},
	seta: {
		descricao: "Seta (1x1; \"tamanho\": \"g\" = 2x2), boa para \"deslize\" ou para apontar",
		campos: {
			direcao: ARROW_DIRS,
			cor: "cor"
		}
	},
	mascote: {
		descricao: "A Aurora, mascote do grupo (2x2). Todo carrossel leva o mascote em pelo menos um slide (se faltar, o servidor coloca na chamada final)",
		campos: {}
	},
	logo: {
		descricao: "Logo oficial (2x1), em uma cor só que se adapta ao fundo",
		campos: { variante: {
			aws: "AWS",
			"builder-center": "AWS Builder Center"
		} }
	},
	qr: {
		descricao: "QR code de um link (2x2), ex.: inscrição do evento",
		campos: { url: "https://..." }
	}
};
const COMPONENT_KEYS = {
	contador: "counter",
	hashtags: "tags",
	deslize: "swipe"
};
const elementColor = (v) => {
	const k = String(v ?? "").trim().toLowerCase();
	return ELEMENT_COLORS[k] ?? (ICON_COLORS.some((c) => c.id === k) ? k : "");
};
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const textCells = (text, extra, min, max) => Math.min(Math.max(Math.ceil(String(text).length * .2 + extra), min), max);
/** Monta o elemento pedido (sem posição) ou devolve a mensagem do que está errado */
function elementFrom(req, brandBase) {
	const tipo = req?.tipo;
	const big = req?.tamanho === "g";
	const small = req?.tamanho === "p";
	const cor = elementColor(req?.cor);
	if (req?.cor && !cor) return `cor "${req.cor}" não existe (use ${Object.keys(ELEMENT_COLORS).join(", ")})`;
	switch (tipo) {
		case "icone":
			if (!ICONS[req.icone]) return `ícone "${req.icone}" não existe (use ${Object.keys(ICONS).join(", ")})`;
			return {
				kind: "icon",
				icon: req.icone,
				color: cor,
				w: small ? 1 : 2,
				h: small ? 1 : 2,
				reserve: true,
				boxed: req.estilo !== "solto"
			};
		case "selo": {
			const texto = String(req.texto ?? "").trim().slice(0, 18);
			if (!texto) return "selo sem texto";
			return {
				kind: "badge",
				text: texto,
				color: cor || "magenta",
				w: textCells(texto, 1.2, 2, 6),
				h: 1
			};
		}
		case "data": {
			const texto = String(req.texto ?? "").trim().slice(0, 40);
			if (!texto) return "chip de data sem texto";
			return {
				kind: "chip",
				icon: CHIP_ICONS[req.icone] ? req.icone : "calendar",
				text: texto,
				color: cor,
				w: textCells(texto, 2, 3, 9),
				h: 1
			};
		}
		case "bloco": return {
			kind: "shape",
			color: cor || "purple",
			style: req.estilo === "outline" ? "outline" : "solid",
			w: big ? 2 : 1,
			h: big ? 2 : 1
		};
		case "seta": return {
			kind: "arrow",
			dir: ARROW_DIRS[req.direcao] ? req.direcao : "right",
			color: cor,
			w: big ? 2 : 1,
			h: big ? 2 : 1
		};
		case "mascote":
			if (!mascotUrl()) return "este grupo não tem mascote cadastrado";
			return {
				kind: "image",
				src: mascotUrl(),
				fit: "contain",
				w: 2,
				h: 2
			};
		case "logo":
			if (!brandBase) return "logo indisponível aqui";
			return {
				kind: "image",
				src: `${brandBase}logos/${req.variante === "builder-center" ? "builder-center-preta.png" : "aws-preta.png"}`,
				fit: "contain",
				invert: true,
				w: 2,
				h: 1
			};
		case "qr": {
			const url = String(req.url ?? "").trim();
			if (!/^https?:\/\/\S+$/.test(url)) return "QR code precisa de uma URL https://";
			return {
				kind: "qr",
				url,
				w: 2,
				h: 2
			};
		}
		default: return `tipo de elemento "${tipo}" não existe (use ${Object.keys(ELEMENT_TYPES).join(", ")})`;
	}
}
/** Primeira posição livre no lugar pedido: varre a linha a partir do canto (ou do centro) até achar espaço */
function findSpot(slot, w, h, { cols, rows }, taken) {
	const y = slot.startsWith("topo") ? 1 : rows - 1 - h;
	const min = 1;
	const max = cols - 1 - w;
	if (max < min) return null;
	let xs = Array.from({ length: max - min + 1 }, (_, k) => min + k);
	if (slot.endsWith("direita")) xs = xs.reverse();
	if (slot.endsWith("centro")) {
		const mid = (cols - w) / 2;
		xs = xs.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
	}
	for (const x of xs) {
		const rect = {
			x,
			y,
			w,
			h
		};
		if (!taken.some((t) => overlaps(rect, t))) return rect;
	}
	return null;
}
/** Componentes escondidos (ocultar) e elementos pedidos, posicionados sem cair no texto nem uns nos outros */
function applyElements(slide, s, i, mode, gridSize, avisos, brandBase) {
	const hide = (Array.isArray(s.ocultar) ? s.ocultar : []).map((k) => {
		if (!COMPONENT_KEYS[k]) avisos.push(`Slide ${i + 1}: ocultar "${k}" não existe (use ${Object.keys(COMPONENT_KEYS).join(", ")}).`);
		return COMPONENT_KEYS[k];
	});
	slide.elements = (slide.elements ?? []).filter((e) => !hide.includes(e.kind));
	const list = Array.isArray(s.elementos) ? s.elementos : [];
	if (list.length > MAX_ELEMENTOS) avisos.push(`Slide ${i + 1}: no máximo ${MAX_ELEMENTOS} elementos; os demais foram ignorados.`);
	const metrics = gridMetrics(mode, gridSize);
	const taken = slide.elements.map((e) => ({
		x: e.x,
		y: e.y,
		w: e.w,
		h: e.h
	}));
	for (const req of list.slice(0, MAX_ELEMENTOS)) {
		if (req?.tipo === "mascote" && "mascotUrl" in slide && mascotUrl()) {
			slide.mascotUrl = mascotUrl();
			if (req.tamanho === "g") slide.mascotScale = 150;
			continue;
		}
		const el = elementFrom(req, brandBase);
		if (typeof el === "string") {
			avisos.push(`Slide ${i + 1}: elemento ignorado: ${el}.`);
			continue;
		}
		const slot = SLOTS.includes(req?.posicao) ? req.posicao : "topo-esquerda";
		if (req?.posicao && !SLOTS.includes(req.posicao)) avisos.push(`Slide ${i + 1}: posição "${req.posicao}" não existe; ficou "topo-esquerda".`);
		const spot = findSpot(slot, el.w, el.h, metrics, taken);
		if (!spot) {
			avisos.push(`Slide ${i + 1}: sem espaço para o ${req.tipo} em "${slot}" (tente outra posição ou um tamanho menor).`);
			continue;
		}
		const { kind, ...rest } = el;
		slide.elements.push(createElement(kind, metrics, {
			...rest,
			at: {
				x: spot.x,
				y: spot.y
			}
		}));
		taken.push(spot);
	}
}
/** Coloca um elemento no primeiro dos lugares que tiver espaço; devolve se conseguiu */
function placeFirst(slide, el, slots, metrics) {
	const taken = (slide.elements ?? []).map((e) => ({
		x: e.x,
		y: e.y,
		w: e.w,
		h: e.h
	}));
	for (const slot of slots) {
		const spot = findSpot(slot, el.w, el.h, metrics, taken);
		if (!spot) continue;
		const { kind, ...rest } = el;
		slide.elements = [...slide.elements ?? [], createElement(kind, metrics, {
			...rest,
			at: {
				x: spot.x,
				y: spot.y
			}
		})];
		return true;
	}
	return false;
}
/** Tipos com a célula colorida do título, onde o ícone do kit entra (mesma lista do painel do Studio) */
const TITLE_ICON_TYPES = /* @__PURE__ */ new Set([
	"content",
	"agenda",
	"sponsors",
	"deck-bullets",
	"deck-image",
	"deck-code"
]);
const AUTO_ICON = {
	agenda: ["clock"],
	sponsors: ["teams"],
	"deck-bullets": [
		"bolt",
		"ladder",
		"key"
	],
	"deck-image": ["drop"],
	"deck-code": ["wrench"],
	content: [
		"key",
		"wrench",
		"ladder",
		"drop",
		"bolt",
		"trophy",
		"bracket-smile"
	]
};
const isMascot = (e) => e?.kind === "image" && Boolean(e.src) && e.src === mascotUrl();
/**
* Deixa o carrossel com a cara do grupo mesmo quando o pedido não fala de design: o slide sem elementos ganha um ícone
* da AWS ligado ao tipo dele (na cor do slide; escuro nos fundos coloridos e degradês), e o mascote entra em pelo
* menos um slide (de preferência a chamada final). Devolve o que foi colocado, para o Claude contar.
*/
function decorate(built, explicit, mode, globalSettings, { icons: withIcons = true, event = null } = {}) {
	const metrics = gridMetrics(mode, globalSettings.gridSize);
	const notes = [];
	let topic = 0;
	const meetup = cleanLink(event?.meetup_url);
	if (withIcons && meetup && !built.some((sl) => (sl.elements ?? []).some((e) => e.kind === "qr"))) {
		const last = [...built].reverse().find((sl) => sl.type === "backcover");
		if (last && placeFirst(last, {
			kind: "qr",
			url: meetup,
			w: 2,
			h: 2
		}, [
			"topo-esquerda",
			"topo-centro",
			"base-centro"
		], metrics)) notes.push(`slide ${built.indexOf(last) + 1}: QR de inscrição (${meetup})`);
	}
	built.forEach((slide, i) => {
		const k = slide.type === "content" ? topic++ : 0;
		if (!withIcons || !TITLE_ICON_TYPES.has(slide.type) || slide.badgeIcon) return;
		const icons = AUTO_ICON[slide.type] ?? ["bolt"];
		slide.badgeIcon = icons[k % icons.length];
		notes.push(`slide ${i + 1}: ícone ${slide.badgeIcon} no título`);
	});
	const hasMascot = !mascotUrl() || built.some((sl) => (sl.elements ?? []).some(isMascot) || sl.mascotUrl || ["mascot", "both"].includes(sl.badge));
	const slots = built.filter((sl) => "mascotUrl" in sl);
	const ownSpot = slots.find((sl) => sl.type === "backcover" || sl.type === "deck-end") ?? slots.at(-1);
	const certificate = built.find((sl) => sl.type === "certificate");
	if (!hasMascot && ownSpot) {
		ownSpot.mascotUrl = mascotUrl();
		if (ownSpot.type === "backcover" || ownSpot.type === "deck-end") ownSpot.mascotScale = 150;
		notes.push(`slide ${built.indexOf(ownSpot) + 1}: mascote (no lugar dele no layout)`);
	} else if (!hasMascot && certificate) {
		certificate.badge = certificate.badge === "aws" ? "both" : "mascot";
		notes.push(`slide ${built.indexOf(certificate) + 1}: mascote na logo do certificado`);
	} else if (!hasMascot) {
		for (const i of [...built.keys()].reverse()) if (placeFirst(built[i], {
			kind: "image",
			src: mascotUrl(),
			fit: "contain",
			w: 2,
			h: 2
		}, [
			"base-direita",
			"base-esquerda",
			"topo-direita",
			"topo-esquerda"
		], metrics)) {
			notes.push(`slide ${i + 1}: mascote`);
			break;
		}
	}
	return notes;
}
const PLACEHOLDERS = {
	cover: ["title", "date"],
	content: ["title", "content"],
	speaker: [
		"title",
		"speakerName",
		"speakerRole"
	],
	waiting: ["date"],
	meetup: ["title", "date"],
	"deck-title": [
		"title",
		"content",
		"speakerName",
		"speakerRole"
	],
	"deck-section": ["title", "content"],
	"deck-bullets": ["title", "items"],
	"deck-image": ["title"],
	"deck-quote": ["title", "content"]
};
const isPlaceholder = (type, mode, field, value) => {
	if (type === "cover" && field === "content") return mode === "content" && value === SLIDE_TYPES.cover.defaultData("content").content;
	if (type === "cover" && field === "title") return value === SLIDE_TYPES.cover.defaultData("content").title;
	return (PLACEHOLDERS[type] ?? []).includes(field) && value === SLIDE_TYPES[type].defaultData(mode)[field];
};
const fieldsOf = (type, mode) => {
	const defaults = SLIDE_TYPES[type].defaultData(mode);
	return Object.keys(defaults).filter((f) => !NOT_FIELDS.test(f) && ["string", "boolean"].includes(typeof defaults[f]));
};
const helpOf = (type, mode, f) => {
	if (FIELD_HELP[f]) return FIELD_HELP[f];
	const v = SLIDE_TYPES[type].defaultData(mode)[f];
	return typeof v === "boolean" ? "true ou false" : v ? `texto (ex.: "${String(v).replace(/\n/g, " / ").slice(0, 50)}")` : "texto";
};
/** Cor por nome do kit ("verde") ou hexadecimal; '' se não for válida */
function resolveColor(value) {
	const v = String(value ?? "").trim();
	if (COLORS[v.toLowerCase()]) return COLORS[v.toLowerCase()];
	return HEX.test(v) ? v.toUpperCase() : "";
}
/** Tudo o que o Claude precisa saber para montar um material (ferramenta listar_opcoes) */
function describeOptions() {
	return {
		formatos: Object.fromEntries(MCP_MODES.map((mode) => [mode, {
			nome: MODES[mode].label,
			descricao: MODES[mode].description,
			tipos_de_slide: MODES[mode].slideTypes.map((type) => ({
				tipo: type,
				nome: SLIDE_TYPES[type].label,
				campos: Object.fromEntries(fieldsOf(type, mode).map((f) => [f, helpOf(type, mode, f)]))
			})),
			exemplo_de_ordem: MODES[mode].getDefaultSlides().map((s) => s.type),
			...EVENT_MODES.includes(mode) ? { evento_do_site: "Passe evento_id (ou deixe o próximo evento entrar sozinho) para preencher com os dados reais." } : {},
			...mode === "certificate" ? { logo: {
				badge: Object.fromEntries(Object.entries(CERTIFICATE_BADGES).map(([k, v]) => [k, v.label])),
				badgePosition: CERTIFICATE_BADGE_POSITIONS
			} } : {}
		}])),
		visuais: Object.fromEntries(Object.entries(LOOKS).map(([k, v]) => [k, v.descricao])),
		estilo: STYLE_OPTIONS,
		cores: COLORS,
		elementos: {
			como_usar: "Prefira o que é DO LAYOUT: \"icone_titulo\" (ícone na célula do título dos tipos content, agenda, sponsors, deck-bullets, deck-image, deck-code) e \"mascote\": true (o mascote no lugar dele: backcover, deck-end, meetup, club, waiting). Elementos soltos (\"elementos\": [{ tipo, posicao, ...campos }], até 4) ficam na faixa de cima ou de baixo, sem cobrir o texto; use com moderação (selo na capa, chip de data, QR). Ícone solto vem em célula colorida (\"estilo\": \"solto\" tira a célula). \"ocultar\": [\"hashtags\", \"deslize\", \"contador\"] tira os componentes padrão.",
			tipos: ELEMENT_TYPES,
			posicoes: SLOTS,
			cores: Object.keys(ELEMENT_COLORS)
		},
		fotos: {
			...PHOTO_OPTIONS,
			fundos_da_marca: BRAND_BACKGROUNDS,
			como_usar: "Em qualquer slide: foto (URL de listar_fotos, ou um fundo degradê da marca: \"fundo-1\" a \"fundo-6\"), foto_posicao, foto_tamanho (para right/left/top/bottom) e foto_filtro. Sem foto nenhuma no carrossel, o servidor põe na capa uma foto real da galeria ligada ao tema."
		},
		automatico: "Sempre: o mascote em pelo menos um slide. Com \"decoracao\" (padrão true): ícone da AWS nos slides sem elementos e foto real da galeria na capa quando nenhum slide tem foto. \"decoracao\": false desliga os ícones e a foto automática.",
		limites: {
			slides: `1 a ${MAX_SLIDES}`,
			texto_por_campo: MAX_TEXT
		},
		dicas: [
			"Sempre escolha um visual (ou peça \"surpresa\"); sem ele o servidor sorteia um diferente dos últimos materiais. \"igual_ultimo\" repete o visual do material anterior.",
			"Uma foto da galeria na capa (posicao full ou right) deixa o carrossel bem mais forte; nos tópicos, use com moderação.",
			"Dê personalidade pelo layout: icone_titulo ligado ao assunto de cada tópico (o servidor escolhe um se você não escolher), o mascote na chamada final (\"mascote\": true) e, no máximo, 1 elemento solto por slide (um selo \"NOVO\" na capa, o chip de data, o QR de inscrição).",
			"O primeiro slide costuma ser a capa (cover) e o último a chamada final (backcover).",
			"Uma ideia por slide; títulos curtos. A cor de cada slide pode variar para dar ritmo ao carrossel.",
			"Para \"seguir a linha da última vez\", leia o material anterior (materiais_recentes / ler_material) e repita o estilo e as cores.",
			"Para variar, troque o padrão de blocos (pattern), a composição e as cores entre um material e outro."
		]
	};
}
/**
* Monta o projeto do Studio. `slides`: [{ tipo|type, cor|color, foto..., title, content, ... }]; `visual`: nome de LOOKS;
* `estilo`: chaves de STYLE_OPTIONS (theme, pattern...) por cima do visual e `cor` (destaque padrão dos slides);
* `cores`: paleta que se alterna entre os slides (vence a do visual). `photoPrefixes`: começos de URL aceitos para
* fotos (as da galeria do grupo; vazio = qualquer https). Devolve { title, mode, data, avisos, visual }.
*/
function buildProject({ formato, titulo = "", slides, visual = "", estilo = {}, cores, legenda = "", decoracao = true }, { photoPrefixes = [], brandBase = "", event = null, profile = null, leaderName = "" } = {}) {
	const mode = formato;
	if (!MCP_MODES.includes(mode)) throw new ProjectInputError(`Formato "${mode}" não disponível. Use: ${MCP_MODES.join(", ")}.`);
	if (!Array.isArray(slides) || slides.length === 0) throw new ProjectInputError("Mande pelo menos 1 slide.");
	const maxSlides = mode === "presentation" ? MAX_DECK_SLIDES : MAX_SLIDES;
	if (slides.length > maxSlides) throw new ProjectInputError(`No máximo ${maxSlides} slides.`);
	const avisos = [];
	const look = visual ? LOOKS[visual] : null;
	if (visual && !look) avisos.push(`Visual "${visual}" não existe; use um de listar_opcoes.`);
	const style = {
		...look?.estilo ?? {},
		...estilo && typeof estilo === "object" ? estilo : {}
	};
	const palette = (Array.isArray(cores) && cores.length ? cores : look?.cores ?? []).map(resolveColor).filter(Boolean);
	const defaultColor = resolveColor(style.cor ?? style.color);
	if ((style.cor ?? style.color) && !defaultColor) avisos.push(`Cor "${style.cor ?? style.color}" inválida: ficou a cor padrão de cada slide.`);
	const pendingElements = [];
	const built = slides.map((input, i) => {
		const s = input && typeof input === "object" ? input : {};
		const type = s.tipo ?? s.type;
		if (!MODES[mode].slideTypes.includes(type)) throw new ProjectInputError(`Slide ${i + 1}: tipo "${type}" não existe em ${MODES[mode].label}. Use: ${MODES[mode].slideTypes.join(", ")}.`);
		const slide = createSlide(type, mode);
		if ("mascotUrl" in slide) slide.mascotUrl = "";
		if (type === "certificate") slide.badge = "none";
		const allowed = fieldsOf(type, mode);
		for (const [key, value] of Object.entries(s)) {
			if (SLIDE_KEYS.includes(key)) continue;
			if (!allowed.includes(key)) {
				avisos.push(`Slide ${i + 1}: campo "${key}" ignorado (não existe em ${SLIDE_TYPES[type].label}).`);
				continue;
			}
			if (typeof slide[key] === "boolean") slide[key] = value === true || value === "true" || value === "sim";
			else if (typeof value === "string") slide[key] = value.slice(0, MAX_TEXT);
		}
		if (type === "certificate") applyBadge(slide, s, i, avisos);
		if (s.icone_titulo !== void 0) {
			if (!TITLE_ICON_TYPES.has(type)) avisos.push(`Slide ${i + 1}: icone_titulo só vale em ${[...TITLE_ICON_TYPES].join(", ")}.`);
			else if (!ICONS[s.icone_titulo]) avisos.push(`Slide ${i + 1}: ícone "${s.icone_titulo}" não existe (use ${Object.keys(ICONS).join(", ")}).`);
			else slide.badgeIcon = s.icone_titulo;
		}
		if (s.mascote === true || s.mascote === "sim") {
			if (!mascotUrl()) avisos.push(`Slide ${i + 1}: este grupo não tem mascote cadastrado.`);
			else if ("mascotUrl" in slide) slide.mascotUrl = mascotUrl();
			else avisos.push(`Slide ${i + 1}: "mascote" só vale nos slides com lugar para ele (backcover, deck-end, meetup, club, waiting); nos outros, use o elemento "mascote".`);
		}
		for (const f of [...PLACEHOLDERS[type] ?? [], ...type === "cover" ? ["content"] : []]) if (s[f] === void 0 && isPlaceholder(type, mode, f, slide[f])) slide[f] = "";
		if (s.imagem !== void 0) applyImage(slide, s, i, photoPrefixes, avisos);
		const ownColor = resolveColor(s.cor ?? s.color);
		if ((s.cor ?? s.color) && !ownColor) avisos.push(`Slide ${i + 1}: cor "${s.cor ?? s.color}" inválida.`);
		const paletteColor = palette.length ? palette[i % palette.length] : "";
		if (ownColor || defaultColor || paletteColor) slide.color = ownColor || defaultColor || paletteColor;
		applyPhoto(slide, s, i, photoPrefixes, avisos, brandBase);
		if (s.elementos !== void 0 || s.ocultar !== void 0) pendingElements.push([
			slide,
			s,
			i
		]);
		return slide;
	});
	const settings = getDefaultGlobalSettings();
	for (const key of STYLE_KEYS) {
		if (style[key] === void 0) continue;
		if (STYLE_OPTIONS[key][style[key]]) settings[key] = style[key];
		else avisos.push(`Estilo: ${key} "${style[key]}" não existe; ficou o padrão.`);
	}
	settings.projectTitle = String(titulo ?? "").trim().slice(0, 120);
	settings.caption = String(legenda ?? "").slice(0, 2200);
	const globalSettings = sanitizeGlobalSettings(settings);
	for (const [slide, s, i] of pendingElements) applyElements(slide, s, i, mode, globalSettings.gridSize, avisos, brandBase);
	const explicit = new Set(pendingElements.filter(([, s]) => Array.isArray(s.elementos) && s.elementos.length).map(([slide]) => slide.id));
	let final = built;
	const automaticos = [];
	if (event && EVENT_MODES.includes(mode)) {
		const r = withEventData(built, event, mode, profile);
		final = r.slides;
		automaticos.push(...r.notes);
	}
	if (mode === "presentation" && profile?.name) {
		for (const sl of final) if (sl.type === "deck-title" && !sl.speakerName?.trim()) sl.speakerName = profile.name;
	}
	final.forEach((sl, i) => {
		if ("title" in sl && !String(sl.title ?? "").trim() && ![
			"backcover",
			"agenda",
			"sponsors",
			"speaker"
		].includes(sl.type)) avisos.push(`Slide ${i + 1} (${SLIDE_TYPES[sl.type]?.label}) ficou sem título.`);
	});
	if (mode === "certificate" && leaderName) {
		for (const sl of final) if (sl.type === "certificate" && !sl.signer1Name?.trim()) {
			sl.signer1Name = leaderName;
			automaticos.push(`assinatura: ${leaderName} (líder)`);
		}
	}
	automaticos.push(...decorate(final, explicit, mode, globalSettings, {
		icons: decoracao !== false && POST_MODES.includes(mode),
		event
	}));
	return {
		title: projectTitleOf({
			slides: final,
			globalSettings,
			modeLabel: MODES[mode].label
		}),
		mode,
		data: {
			app: "aws-posts-builder",
			version: FILE_VERSION,
			mode,
			slides: final,
			globalSettings
		},
		avisos,
		visual: look ? visual : "",
		automaticos
	};
}
const BR_TZ = "America/Sao_Paulo";
/** Data do evento no horário de Brasília (meia-noite UTC antiga = só a data, em UTC), com o formato pedido */
function eventDateBR(iso, format) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const utcMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
	return d.toLocaleDateString("pt-BR", {
		timeZone: utcMidnight ? "UTC" : BR_TZ,
		...format
	});
}
/** Logo do certificado (badge) e posição, validados; sem pedido, o mascote (a cara do grupo) */
function applyBadge(slide, s, i, avisos) {
	if (s.badge !== void 0) {
		if (CERTIFICATE_BADGES[s.badge]) slide.badge = s.badge;
		else avisos.push(`Slide ${i + 1}: badge "${s.badge}" não existe (use ${Object.keys(CERTIFICATE_BADGES).join(", ")}).`);
	}
	if (s.badgePosition !== void 0) {
		if (CERTIFICATE_BADGE_POSITIONS[s.badgePosition]) slide.badgePosition = s.badgePosition;
		else avisos.push(`Slide ${i + 1}: badgePosition "${s.badgePosition}" não existe (use ${Object.keys(CERTIFICATE_BADGE_POSITIONS).join(", ")}).`);
	}
}
/**
* "TER, 14 DE OUTUBRO • 19:00", como longDate (eventData.js), mas sempre no horário de Brasília: o servidor roda em
* UTC e, sem isso, um evento das 19h sairia "22:00". Meia-noite (UTC antigo ou de Brasília) = só a data.
*/
function eventLongDateBR(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const utcMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
	const timeZone = utcMidnight ? "UTC" : BR_TZ;
	const clean = (t) => t.replace(/\./g, "").toUpperCase();
	const day = clean(d.toLocaleDateString("pt-BR", {
		timeZone,
		weekday: "short",
		day: "numeric",
		month: "long"
	}));
	const time = d.toLocaleTimeString("pt-BR", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	});
	return utcMidnight || time === "00:00" ? day : `${day} • ${time}`;
}
/**
* Link sem os parâmetros de rastreamento (utm_*, member_id...): o QR fica bem menos denso e a câmera lê de longe.
* '' se não for um link http(s).
*/
function cleanLink(url) {
	try {
		const u = new URL(String(url ?? "").trim());
		if (!/^https?:$/.test(u.protocol)) return "";
		for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|member_id|ref$|referral)/i.test(key)) u.searchParams.delete(key);
		u.hash = "";
		return u.toString();
	} catch {
		return "";
	}
}
/** Aplica o evento do site aos slides, mantendo o que o Claude escreveu de texto de apoio na capa */
function withEventData(slides, event, mode, profile = null) {
	const cover = mode === "event" ? slides.find((s) => s.type === "cover") : null;
	const ownContent = cover?.content && cover.content !== SLIDE_TYPES.cover.defaultData(mode).content ? cover.content : "";
	const { slides: next, changes } = applyEventToSlides(mode, slides, event, profile);
	for (const s of next) {
		if (s.type === "waiting" || s.type === "meetup") s.date = eventLongDateBR(event.date) || s.date;
		if (s.type === "certificate") s.date = eventDateBR(event.date, {
			day: "numeric",
			month: "long",
			year: "numeric"
		}) || s.date;
		if (s.type === "deck-title") s.date = eventDateBR(event.date, {
			day: "2-digit",
			month: "short",
			year: "numeric"
		}).replace(/\./g, "").replace(/ de /gi, " ").toUpperCase() || s.date;
	}
	const newCover = next.find((s) => s.type === "cover");
	if (mode === "event" && newCover) {
		newCover.date = eventLongDateBR(event.date) || newCover.date;
		if (ownContent) newCover.content = ownContent;
		else if (!summary(event.description)) newCover.content = cover?.content ?? newCover.content;
	}
	const speakers = eventSpeakers(event);
	const notes = [`dados do evento "${event.title}": ${changes.join(", ") || "nada a preencher"}`];
	const withPhoto = speakers.filter((sp) => sp.photo).length;
	if (mode === "event" && speakers.length) notes.push(`${withPhoto} de ${speakers.length} palestrantes com foto do cadastro`);
	return {
		slides: next,
		notes
	};
}
/** Imagem dentro do conteúdo (campo imageUrl: tópico do carrossel e slide de imagem da apresentação) */
function applyImage(slide, s, i, prefixes, avisos) {
	if (!("imageUrl" in slide)) {
		avisos.push(`Slide ${i + 1}: "imagem" só vale nos tipos content e deck-image (nos outros, use "foto").`);
		return;
	}
	const url = String(s.imagem ?? "").trim();
	if (!(/^https:\/\//.test(url) && (!prefixes.length || prefixes.some((p) => url.startsWith(p))))) {
		avisos.push(`Slide ${i + 1}: imagem ignorada (use uma URL de listar_fotos).`);
		return;
	}
	slide.imageUrl = url;
}
/** Foto do slide (da galeria): URL, posição, tamanho e filtro, com aviso para o que vier errado */
function applyPhoto(slide, s, i, prefixes, avisos, brandBase = "") {
	let url = String(s.foto ?? "").trim();
	if (!url) return;
	if (BRAND_BACKGROUNDS.includes(url)) {
		if (!brandBase) {
			avisos.push(`Slide ${i + 1}: fundo da marca indisponível aqui.`);
			return;
		}
		url = `${brandBase}fundos/endcard-${url.split("-")[1]}.jpg`;
	}
	if (!(/^https:\/\//.test(url) && (!prefixes.length || prefixes.some((p) => url.startsWith(p))))) {
		avisos.push(`Slide ${i + 1}: foto ignorada (use uma URL de listar_fotos).`);
		return;
	}
	slide.photo = url;
	const layout = s.foto_posicao ?? "full";
	slide.photoLayout = PHOTO_LAYOUTS[layout] ? layout : "full";
	if (!PHOTO_LAYOUTS[layout]) avisos.push(`Slide ${i + 1}: foto_posicao "${layout}" não existe; ficou "full".`);
	if (s.foto_tamanho !== void 0) {
		if (PHOTO_SIZES[s.foto_tamanho]) slide.photoSize = s.foto_tamanho;
		else avisos.push(`Slide ${i + 1}: foto_tamanho "${s.foto_tamanho}" não existe.`);
	}
	if (s.foto_filtro !== void 0) {
		if (PHOTO_FILTERS[s.foto_filtro]) slide.photoFilter = s.foto_filtro;
		else avisos.push(`Slide ${i + 1}: foto_filtro "${s.foto_filtro}" não existe.`);
	}
}
/**
* Escolhe um visual diferente dos usados nos materiais recentes (`recentSettings`: globalSettings deles). `random`
* entra só para o teste ser previsível.
*/
function pickLook(recentSettings = [], random = Math.random) {
	const used = new Set(recentSettings.map((gs) => `${gs?.theme}|${gs?.pattern}`));
	const fresh = Object.keys(LOOKS).filter((k) => !used.has(`${LOOKS[k].estilo.theme}|${LOOKS[k].estilo.pattern}`));
	const pool = fresh.length ? fresh : Object.keys(LOOKS);
	return pool[Math.floor(random() * pool.length) % pool.length];
}
/** Há alguma escolha de design no pedido? (sem nenhuma, o servidor sorteia um visual) */
const hasDesign = (args) => Boolean(args?.visual) || Boolean(args?.cores?.length) || STYLE_KEYS.some((k) => args?.estilo?.[k] !== void 0);
/** O estilo de um material salvo, no mesmo formato que buildProject aceita (para repetir "igual da última vez") */
function styleOf(data) {
	const gs = data?.globalSettings ?? {};
	const style = Object.fromEntries(STYLE_KEYS.filter((k) => gs[k] !== void 0).map((k) => [k, gs[k]]));
	const colors = (data?.slides ?? []).map((s) => s?.color).filter((c) => HEX.test(c ?? ""));
	return {
		...style,
		cores_dos_slides: colors
	};
}
/** Resumo dos slides (tipo, cor e textos) de um material salvo, sem imagens */
function summarizeSlides(data) {
	return (data?.slides ?? []).map((s) => {
		const texts = MODES[data.mode] && SLIDE_TYPES[s?.type] ? fieldsOf(s.type, data.mode) : [];
		const elementos = (s?.elements ?? []).filter((e) => ![
			"counter",
			"tags",
			"swipe"
		].includes(e.kind)).map((e) => ({
			kind: e.kind,
			...e.icon ? { icone: e.icon } : {},
			...e.text ? { texto: e.text } : {},
			...e.color ? { cor: e.color } : {}
		}));
		return {
			tipo: s?.type,
			cor: s?.color,
			...elementos.length ? { elementos } : {},
			...s?.photo ? {
				foto: s.photo,
				foto_posicao: s.photoLayout || "full"
			} : {},
			...Object.fromEntries(texts.filter((f) => typeof s[f] === "string" && s[f]).map((f) => [f, s[f].slice(0, 500)]))
		};
	});
}
const normalize = (t) => String(t ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const STOPWORDS = /* @__PURE__ */ new Set([
	"para",
	"como",
	"com",
	"sobre",
	"mais",
	"aws",
	"grupo",
	"voce",
	"seus",
	"suas",
	"esse",
	"esta",
	"este",
	"isso",
	"pelo",
	"pela",
	"quem",
	"quer"
]);
/**
* Foto real da galeria para a capa: a de legenda mais parecida com os textos do carrossel; sem nenhuma parecida, uma
* das mais recentes (variando, para não repetir sempre a mesma). `photos`: [{ url, legenda }] em ordem de data.
*/
function pickPhoto(photos, texts, random = Math.random, { fallback = true } = {}) {
	if (!photos.length) return null;
	const words = new Set(normalize(texts.join(" ")).split(/[^a-z0-9#]+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w)));
	let best = null;
	let bestScore = 0;
	for (const p of photos) {
		const caption = normalize(p.legenda);
		const score = [...words].filter((w) => caption.includes(w)).length;
		if (score > bestScore) {
			best = p;
			bestScore = score;
		}
	}
	if (best) return best;
	if (!fallback) return null;
	const recent = photos.slice(0, 8);
	return recent[Math.floor(random() * recent.length) % recent.length];
}
//#endregion
//#region src/mcp/server/workspaceTools.js
const UUID$1 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STAFF$1 = ["core", "leader"];
const TASK_COLS = "id, title, description, kind, category, status, priority, due_date, assignee_id, folder_id, created_by, approved_by, approved_at, updated_at";
const LINK_COLS = "id, title, url, description, group_label, position, enabled, highlight, countdown, starts_at, ends_at, updated_at";
const must = ({ data, error }) => {
	if (error) throw new Error(error.message);
	return data;
};
/** Acesso ao banco (chave de serviço). Os testes trocam por um repositório falso. */
function workspaceRepo(db, groupId) {
	return {
		async listFolders() {
			const folders = must(await db.from("studio_folders").select("id, name, owner_id, updated_at").eq("group_id", groupId).order("updated_at", { ascending: false }).limit(200)) ?? [];
			const owners = [...new Set(folders.map((f) => f.owner_id))];
			const roles = owners.length ? must(await db.from("group_members").select("user_id, role").eq("group_id", groupId).in("user_id", owners)) ?? [] : [];
			const roleOf = new Map(roles.map((r) => [r.user_id, r.role]));
			return folders.map((f) => ({
				...f,
				owner_role: roleOf.get(f.owner_id) ?? null
			}));
		},
		async createFolder(row) {
			return must(await db.from("studio_folders").insert({
				...row,
				group_id: groupId
			}).select("id, name, owner_id, updated_at").single());
		},
		async updateFolder(id, fields) {
			return must(await db.from("studio_folders").update(fields).eq("group_id", groupId).eq("id", id).select("id, name, owner_id, updated_at").single());
		},
		/** Quantos materiais (não excluídos) e tarefas cada pasta tem */
		async folderCounts(ids) {
			if (!ids.length) return {
				files: [],
				tasks: []
			};
			return {
				files: must(await db.from("studio_projects").select("folder_id, mode, owner_id").eq("group_id", groupId).in("folder_id", ids).is("deleted_at", null)) ?? [],
				tasks: must(await db.from("studio_tasks").select("folder_id").eq("group_id", groupId).in("folder_id", ids)) ?? []
			};
		},
		async getProjectMeta(id) {
			return must(await db.from("studio_projects").select("id, title, mode, owner_id, folder_id, deleted_at").eq("group_id", groupId).eq("id", id).maybeSingle());
		},
		async moveProject(id, folderId, userId) {
			return must(await db.from("studio_projects").update({
				folder_id: folderId,
				updated_by: userId
			}).eq("group_id", groupId).eq("id", id).select("id, title, folder_id").single());
		},
		async listTeam() {
			const members = must(await db.from("group_members").select("user_id, role").eq("group_id", groupId).in("role", STAFF$1)) ?? [];
			const people = members.length ? must(await db.from("profiles").select("id, full_name").in("id", members.map((m) => m.user_id))) ?? [] : [];
			const nameOf = new Map(people.map((p) => [p.id, p.full_name]));
			return members.map((m) => ({
				id: m.user_id,
				name: nameOf.get(m.user_id) || "Alguém da equipe",
				role: m.role
			})).sort((a, b) => a.name.localeCompare(b.name));
		},
		async listTasks({ status, assignee, folder, limit }) {
			let q = db.from("studio_tasks").select(TASK_COLS).eq("group_id", groupId).order("updated_at", { ascending: false }).limit(limit);
			if (status) q = q.eq("status", status);
			if (assignee !== void 0) q = assignee ? q.eq("assignee_id", assignee) : q.is("assignee_id", null);
			if (folder !== void 0) q = folder ? q.eq("folder_id", folder) : q.is("folder_id", null);
			return must(await q) ?? [];
		},
		async getTask(id) {
			return must(await db.from("studio_tasks").select(TASK_COLS).eq("group_id", groupId).eq("id", id).maybeSingle());
		},
		async insertTask(row) {
			return must(await db.from("studio_tasks").insert({
				...row,
				group_id: groupId
			}).select(TASK_COLS).single());
		},
		async updateTask(id, fields) {
			return must(await db.from("studio_tasks").update(fields).eq("group_id", groupId).eq("id", id).select(TASK_COLS).single());
		},
		async insertComment(row) {
			return must(await db.from("studio_task_comments").insert(row).select("id, created_at").single());
		},
		async listLinks() {
			return must(await db.from("links").select(LINK_COLS).eq("group_id", groupId).order("position").order("created_at")) ?? [];
		},
		async getLink(id) {
			return must(await db.from("links").select(LINK_COLS).eq("group_id", groupId).eq("id", id).maybeSingle());
		},
		async insertLink(row) {
			return must(await db.from("links").insert({
				...row,
				group_id: groupId
			}).select(LINK_COLS).single());
		},
		async updateLink(id, fields) {
			return must(await db.from("links").update(fields).eq("group_id", groupId).eq("id", id).select(LINK_COLS).single());
		}
	};
}
const str = (description, extra = {}) => ({
	type: "string",
	description,
	...extra
});
const taskInputProps = {
	titulo: str("Título curto da tarefa"),
	descricao: str("Detalhes, links, o que precisa ser feito"),
	tipo: str("tarefa, correção ou ideia"),
	categoria: str("design, conteúdo, redes sociais, evento, site/studio ou outro"),
	prioridade: str("alta, média ou baixa"),
	prazo: str("AAAA-MM-DD, ou \"nenhum\" para tirar"),
	responsavel: str("\"eu\", o nome (ou parte) de alguém do core/liderança (listar_equipe), ou \"ninguém\""),
	projeto_id: str("id do projeto (listar_projetos), ou \"nenhum\"")
};
const linkInputProps = {
	titulo: str("Texto do botão (até 80 caracteres)"),
	url: str("Endereço http(s)://"),
	descricao: str("Linha de apoio abaixo do título (até 160)"),
	grupo: str("Grupo na página (ex.: \"Eventos\"); vazio = sem grupo"),
	ligado: {
		type: "boolean",
		description: "Aparece na página (padrão true)"
	},
	destaque: {
		type: "boolean",
		description: "Botão em destaque"
	},
	aparece_em: str("Quando entra no ar: AAAA-MM-DDTHH:MM (horário de Brasília) ou \"nenhum\""),
	some_em: str("Quando sai do ar: AAAA-MM-DDTHH:MM (horário de Brasília) ou \"nenhum\""),
	contagem: {
		type: "boolean",
		description: "Antes de entrar no ar: aparece travado com contagem regressiva (true, padrão) ou fica oculto"
	}
};
const obj = (properties, required = []) => ({
	type: "object",
	properties,
	required,
	additionalProperties: false
});
const WORKSPACE_TOOLS = [
	{
		name: "listar_projetos",
		title: "Projetos",
		description: "Projetos (pastas) do Studio que a pessoa vê: os dela e os da equipe, com quantos materiais e tarefas cada um tem.",
		inputSchema: obj({}),
		annotations: { readOnlyHint: true }
	},
	{
		name: "criar_projeto",
		title: "Criar projeto",
		description: "Cria um projeto (pasta) para juntar os materiais e tarefas de um evento ou assunto. Depois use projeto_id em criar_material, mover_material e criar_tarefa.",
		inputSchema: obj({ nome: str("Nome do projeto (ex.: \"Meetup #05\")") }, ["nome"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false
		}
	},
	{
		name: "renomear_projeto",
		title: "Renomear projeto",
		description: "Troca o nome de um projeto.",
		inputSchema: obj({
			id: str("id do projeto"),
			nome: str("Nome novo")
		}, ["id", "nome"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true
		}
	},
	{
		name: "mover_material",
		title: "Mover material",
		description: "Coloca um material (de materiais_recentes) num projeto, ou tira dele (projeto_id \"nenhum\").",
		inputSchema: obj({
			material_id: str("id do material"),
			projeto_id: str("id do projeto, ou \"nenhum\"")
		}, ["material_id", "projeto_id"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true
		}
	},
	{
		name: "listar_equipe",
		title: "Equipe",
		description: "Líder e core team: quem pode ser responsável por uma tarefa.",
		inputSchema: obj({}),
		annotations: { readOnlyHint: true }
	},
	{
		name: "listar_tarefas",
		title: "Tarefas",
		description: "Cards do quadro de tarefas, com situação, responsável, prazo e projeto. Filtre por situação, responsável (\"eu\" ou nome) ou projeto.",
		inputSchema: obj({
			situacao: str("aguardando, em andamento, em aprovação ou finalizada"),
			responsavel: str("\"eu\", nome, ou \"ninguém\""),
			projeto_id: str("id do projeto ou \"nenhum\""),
			limite: {
				type: "integer",
				minimum: 1,
				maximum: 100,
				default: 30
			}
		}),
		annotations: { readOnlyHint: true }
	},
	{
		name: "criar_tarefa",
		title: "Criar tarefa",
		description: "Cria um card no quadro de tarefas (aparece na hora para a equipe). Começa \"aguardando\", a não ser que venha outra situação; só o líder cria já finalizada.",
		inputSchema: obj({
			...taskInputProps,
			situacao: str("aguardando (padrão), em andamento ou em aprovação")
		}, ["titulo"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false
		}
	},
	{
		name: "atualizar_tarefa",
		title: "Atualizar tarefa",
		description: "Edita um card ou muda a situação (mover no quadro). A equipe move entre aguardando, em andamento e em aprovação; só o líder finaliza (aprova) ou reabre.",
		inputSchema: obj({
			id: str("id da tarefa (listar_tarefas)"),
			...taskInputProps,
			situacao: str("aguardando, em andamento, em aprovação ou finalizada")
		}, ["id"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true
		}
	},
	{
		name: "comentar_tarefa",
		title: "Comentar tarefa",
		description: "Escreve um comentário num card (em nome de quem está conectado).",
		inputSchema: obj({
			id: str("id da tarefa"),
			texto: str("Comentário (até 4000 caracteres)")
		}, ["id", "texto"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false
		}
	},
	{
		name: "listar_links",
		title: "Links",
		description: "Os links da página de links do grupo (\"link na bio\"), na ordem da página, com a situação de cada um (no ar, agendado, desligado, encerrado).",
		inputSchema: obj({}),
		annotations: { readOnlyHint: true }
	},
	{
		name: "criar_link",
		title: "Criar link",
		description: "Adiciona um link no fim da página de links (pode já agendar quando entra e sai do ar).",
		inputSchema: obj(linkInputProps, ["titulo", "url"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false
		}
	},
	{
		name: "atualizar_link",
		title: "Atualizar link",
		description: "Edita um link: texto, endereço, grupo, destaque, ligar/desligar ou o horário de entrar e sair do ar.",
		inputSchema: obj({
			id: str("id do link (listar_links)"),
			...linkInputProps
		}, ["id"]),
		annotations: {
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true
		}
	}
];
/**
* As ferramentas: cada uma recebe (user, args) e devolve o resultado MCP. `helpers` vem do server.js (text, toolError,
* linkOf). Tudo aqui é de líder e core team.
*/
function createWorkspaceTools({ project, text, toolError, linkOf }) {
	const staffOnly = (fn) => async (user, args = {}) => {
		if (!user.staff) return toolError("Projetos, tarefas e links são de líder e core team.");
		try {
			return await fn(user, args);
		} catch (err) {
			if (err instanceof project.ProjectInputError) return toolError(err.message);
			throw err;
		}
	};
	/** Pastas que a pessoa vê e edita: as dela e as da equipe (criadas por líder/core) */
	const visibleFolders = async (user) => (await user.repo.listFolders()).filter((f) => f.owner_id === user.id || user.staff && STAFF$1.includes(f.owner_role));
	async function folderFor(user, id) {
		if (id === void 0) return void 0;
		if (id === null || id === "" || String(id).toLowerCase() === "nenhum") return null;
		if (!UUID$1.test(String(id))) throw new project.ProjectInputError("projeto_id inválido: use um id de listar_projetos (ou \"nenhum\").");
		const folder = (await visibleFolders(user)).find((f) => f.id === id);
		if (!folder) throw new project.ProjectInputError("Projeto não encontrado (use listar_projetos).");
		return folder.id;
	}
	const lookups = async (user) => {
		const [team, folders] = await Promise.all([user.repo.listTeam(), visibleFolders(user)]);
		return {
			team,
			people: new Map(team.map((p) => [p.id, p.name])),
			folders: new Map(folders.map((f) => [f.id, f.name]))
		};
	};
	return {
		listar_projetos: staffOnly(async (user) => {
			const folders = await visibleFolders(user);
			const { files, tasks } = await user.repo.folderCounts(folders.map((f) => f.id));
			const seen = (f) => f.owner_id === user.id || f.mode !== "presentation";
			return text(folders.map((f) => ({
				id: f.id,
				nome: f.name,
				meu: f.owner_id === user.id,
				materiais: files.filter((x) => x.folder_id === f.id && seen(x)).length,
				tarefas: tasks.filter((x) => x.folder_id === f.id).length,
				atualizado_em: f.updated_at
			})));
		}),
		criar_projeto: staffOnly(async (user, { nome }) => {
			const row = await user.repo.createFolder({
				owner_id: user.id,
				name: project.folderName(nome)
			});
			return text({
				criado: true,
				id: row.id,
				nome: row.name,
				proximo_passo: "Use este projeto_id em criar_material, mover_material e criar_tarefa."
			});
		}),
		renomear_projeto: staffOnly(async (user, { id, nome }) => {
			const folderId = await folderFor(user, id);
			if (!folderId) return toolError("Informe o id do projeto.");
			const row = await user.repo.updateFolder(folderId, {
				name: project.folderName(nome),
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			return text({
				renomeado: true,
				id: row.id,
				nome: row.name
			});
		}),
		mover_material: staffOnly(async (user, { material_id: id, projeto_id: to }) => {
			if (!UUID$1.test(String(id ?? ""))) return toolError("material_id inválido (use materiais_recentes).");
			const row = await user.repo.getProjectMeta(id);
			if (!row || row.deleted_at || !(row.owner_id === user.id || row.mode !== "presentation")) return toolError("Material não encontrado (ou você não tem acesso a ele).");
			const folderId = await folderFor(user, to);
			return text({
				movido: true,
				material: (await user.repo.moveProject(id, folderId, user.id)).title,
				projeto: folderId ? (await visibleFolders(user)).find((f) => f.id === folderId)?.name : null,
				link: linkOf(id, user)
			});
		}),
		listar_equipe: staffOnly(async (user) => {
			return text((await user.repo.listTeam()).map((p) => ({
				id: p.id,
				nome: p.name,
				cargo: p.role === "leader" ? "líder" : "core team",
				voce: p.id === user.id
			})));
		}),
		listar_tarefas: staffOnly(async (user, { situacao, responsavel, projeto_id: folder, limite = 30 } = {}) => {
			const look = await lookups(user);
			const tasks = await user.repo.listTasks({
				status: project.resolveStatus(situacao),
				assignee: project.findPerson(look.team, responsavel, user.id),
				folder: await folderFor(user, folder),
				limit: Math.min(Math.max(Number(limite) || 30, 1), 100)
			});
			return text({
				total: tasks.length,
				tarefas: tasks.map((t) => project.describeTask(t, look))
			});
		}),
		criar_tarefa: staffOnly(async (user, args) => {
			const look = await lookups(user);
			const status = project.resolveStatus(args.situacao) ?? "todo";
			if (status === "done" && user.role !== "leader") return toolError("Só o líder cria uma tarefa já finalizada.");
			const row = await user.repo.insertTask({
				...project.taskFields(args),
				status,
				created_by: user.id,
				assignee_id: project.findPerson(look.team, args.responsavel, user.id) ?? null,
				folder_id: await folderFor(user, args.projeto_id) ?? null,
				...status === "done" ? { approved_by: user.id } : {}
			});
			return text({
				criada: true,
				tarefa: project.describeTask(row, look)
			});
		}),
		atualizar_tarefa: staffOnly(async (user, args) => {
			if (!UUID$1.test(String(args.id ?? ""))) return toolError("id inválido (use listar_tarefas).");
			const current = await user.repo.getTask(args.id);
			if (!current) return toolError("Tarefa não encontrada.");
			const look = await lookups(user);
			const fields = project.taskFields(args, { partial: true });
			const assignee = project.findPerson(look.team, args.responsavel, user.id);
			if (assignee !== void 0) fields.assignee_id = assignee;
			const folder = await folderFor(user, args.projeto_id);
			if (folder !== void 0) fields.folder_id = folder;
			const status = project.resolveStatus(args.situacao);
			if (status && status !== current.status) {
				if (!project.canMoveTask(current.status, status, user.role === "leader")) return toolError("Só o líder finaliza (aprova) ou reabre uma tarefa finalizada.");
				fields.status = status;
				if (status === "done") fields.approved_by = user.id;
			}
			if (!Object.keys(fields).length) return toolError("Nada para mudar: mande algum campo (titulo, situacao, responsavel, prazo...).");
			const row = await user.repo.updateTask(current.id, fields);
			return text({
				atualizada: true,
				tarefa: project.describeTask(row, look)
			});
		}),
		comentar_tarefa: staffOnly(async (user, { id, texto }) => {
			if (!UUID$1.test(String(id ?? ""))) return toolError("id inválido (use listar_tarefas).");
			const body = String(texto ?? "").trim().slice(0, 4e3);
			if (!body) return toolError("Comentário vazio.");
			if (!await user.repo.getTask(id)) return toolError("Tarefa não encontrada.");
			await user.repo.insertComment({
				task_id: id,
				author_id: user.id,
				body
			});
			return text({ comentado: true });
		}),
		listar_links: staffOnly(async (user) => {
			const now = Date.now();
			return text((await user.repo.listLinks()).map((l) => project.describeLink(l, now)));
		}),
		criar_link: staffOnly(async (user, args) => {
			const position = (await user.repo.listLinks()).reduce((max, l) => Math.max(max, l.position ?? 0), -1) + 1;
			const row = await user.repo.insertLink({
				enabled: true,
				highlight: false,
				countdown: true,
				...project.linkFields(args),
				position,
				created_by: user.id,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			return text({
				criado: true,
				link: project.describeLink(row)
			});
		}),
		atualizar_link: staffOnly(async (user, args) => {
			if (!UUID$1.test(String(args.id ?? ""))) return toolError("id inválido (use listar_links).");
			const current = await user.repo.getLink(args.id);
			if (!current) return toolError("Link não encontrado.");
			const fields = project.linkFields(args, {
				partial: true,
				current
			});
			if (!Object.keys(fields).length) return toolError("Nada para mudar: mande algum campo (titulo, url, ligado, aparece_em...).");
			const row = await user.repo.updateLink(current.id, {
				...fields,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			return text({
				atualizado: true,
				link: project.describeLink(row)
			});
		})
	};
}
//#endregion
//#region src/mcp/server/server.js
const SERVER_INFO = {
	name: "studio-aws-sbg",
	version: "0.7.0"
};
const PROTOCOLS = [
	"2025-11-25",
	"2025-06-18",
	"2025-03-26",
	"2024-11-05"
];
const MAX_BODY = 1048576;
const STAFF = ["core", "leader"];
const STUDIO_ROLES = [
	"speaker",
	"core",
	"leader"
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INSTRUCTIONS = `Servidor do Studio do seu grupo do AWS Student Builder Groups: cria materiais que abrem prontos no Studio, com texto E design: carrosséis (Conteúdo, Evento),
banner do grupo, tela de espera, apresentação de palestra, banner do Meetup e certificado. Os campos de cada formato vêm de listar_opcoes.
Fluxo: 1) listar_opcoes (tipos de slide, campos, visuais prontos, estilos, cores e opções de foto);
2) carrossel de Evento: listar_eventos e passe o "evento_id" em criar_material. O servidor preenche sozinho, com os dados do site,
data, local, um slide por palestrante (com foto, cargo e LinkedIn do cadastro), apoiadores do evento, programação e QR de inscrição.
Sem evento_id, usa o próximo evento do site ("evento_id": "nenhum" para um evento que não está no site). Você escreve só a chamada e o tom; 3) listar_fotos para achar fotos da galeria do grupo (use na capa, pelo menos);
4) criar_material escolhendo o design: "visual" (um dos visuais prontos, "surpresa" ou "igual_ultimo"), e se quiser "estilo" por cima,
"cores" (paleta que alterna entre os slides), foto por slide e ELEMENTOS por slide (ícone, selo, chip de data, bloco, seta, mascote, QR):
prefira o que é DO LAYOUT: icone_titulo (ícone oficial do kit na célula do título) e mascote: true (o mascote no lugar dele); elementos soltos com moderação (no máximo 1 por slide: um selo na capa, o chip de data, o QR).
A cara do grupo é obrigatória: o mascote do grupo (se ele tiver um) entra em pelo menos um slide, e fotos REAIS da galeria são preferidas (pelo menos na capa).
Se você não mandar, o servidor completa: mascote no lugar dele (chamada final, slide final, banners), ícone do kit no título dos tópicos e uma foto da galeria na capa.
Fundos degradê da marca ("fundo-1" a "fundo-6") também valem como foto. Na resposta, conte o que o servidor completou (campo automaticos). Sem nenhuma escolha de design, o servidor sorteia um visual diferente dos últimos.
"Igual da última vez" / "mesma linha" = visual "igual_ultimo". "Algo diferente" = outro visual. 5) Entregue o link e diga qual visual usou.
O material nasce como rascunho; ajustes finos são feitos no Studio, pelo link.
Também dá para organizar o trabalho do grupo (líder e core team):
- Projetos (pastas): listar_projetos, criar_projeto, renomear_projeto; crie o material já no projeto (projeto_id em criar_material) ou mova depois (mover_material).
- Tarefas (quadro): listar_equipe, listar_tarefas, criar_tarefa, atualizar_tarefa (inclusive mover de situação) e comentar_tarefa. Só o líder finaliza ou reabre.
- Links da página "link na bio": listar_links, criar_link, atualizar_link (ligar, desligar, agendar).
Nada é excluído pelo Claude: excluir é no Studio.`;
const TOOLS = [...[
	{
		name: "listar_opcoes",
		title: "Opções do Studio",
		description: "Formatos disponíveis, tipos de slide e os campos de texto de cada um, opções de estilo (tema, padrão de blocos, composição, grade, degradê) e as cores do kit. Chame antes de criar um material.",
		inputSchema: {
			type: "object",
			properties: {},
			additionalProperties: false
		},
		annotations: { readOnlyHint: true }
	},
	{
		name: "listar_eventos",
		title: "Eventos do site",
		description: "Eventos cadastrados no site do grupo (título, data, local, palestrantes e programação), do mais recente para o mais antigo. Use para preencher um carrossel de Evento com dados reais.",
		inputSchema: {
			type: "object",
			properties: { limite: {
				type: "integer",
				minimum: 1,
				maximum: 20,
				default: 5
			} },
			additionalProperties: false
		},
		annotations: { readOnlyHint: true }
	},
	{
		name: "listar_fotos",
		title: "Fotos da galeria",
		description: "Fotos da galeria do grupo (eventos, palestras, a turma), com legenda e data. Use a URL no campo \"foto\" de um slide de criar_material.",
		inputSchema: {
			type: "object",
			properties: {
				busca: {
					type: "string",
					description: "Palavra na legenda (ex.: \"meetup\", \"palestra\")"
				},
				limite: {
					type: "integer",
					minimum: 1,
					maximum: 30,
					default: 12
				}
			},
			additionalProperties: false
		},
		annotations: { readOnlyHint: true }
	},
	{
		name: "materiais_recentes",
		title: "Materiais recentes",
		description: "Os últimos materiais do Studio que a pessoa pode ver, com o estilo de cada um (tema, padrão, composição...). Use para \"seguir a linha da última vez\" ou para variar em relação aos anteriores.",
		inputSchema: {
			type: "object",
			properties: {
				limite: {
					type: "integer",
					minimum: 1,
					maximum: 20,
					default: 8
				},
				formato: {
					type: "string",
					description: "Filtra por formato (content, event...)"
				},
				projeto_id: {
					type: "string",
					description: "Só os materiais deste projeto"
				}
			},
			additionalProperties: false
		},
		annotations: { readOnlyHint: true }
	},
	{
		name: "ler_material",
		title: "Ler material",
		description: "Um material do Studio por id: estilo completo (com a cor de cada slide) e os textos de cada slide. Use para copiar o estilo ou o tom de um material anterior.",
		inputSchema: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "id do material (de materiais_recentes)"
			} },
			required: ["id"],
			additionalProperties: false
		},
		annotations: { readOnlyHint: true }
	},
	{
		name: "criar_material",
		title: "Criar material",
		description: "Cria um carrossel no Studio (salvo na nuvem como rascunho), com texto e design, e devolve o link. Tipos de slide, campos, visuais e estilos válidos vêm de listar_opcoes; fotos, de listar_fotos.",
		inputSchema: {
			type: "object",
			properties: {
				formato: {
					type: "string",
					enum: [
						"content",
						"event",
						"club",
						"waiting",
						"presentation",
						"meetup",
						"certificate"
					],
					description: "content = carrossel educativo; event = divulgação de evento; club = banner A4 do clube (QR); waiting = tela de espera 16:9; presentation = slides de palestra; meetup = banner horizontal do evento; certificate = certificado A4 (o nome de cada participante entra no Studio)"
				},
				titulo: {
					type: "string",
					description: "Nome do arquivo no Studio (opcional; sem ele, usa o título da capa)"
				},
				slides: {
					type: "array",
					minItems: 1,
					maxItems: 10,
					description: "Na ordem. Cada slide: { tipo, cor?, e os campos do tipo (listar_opcoes > formatos > tipos_de_slide > campos) }. Banners (club, waiting, meetup, certificate) têm 1 slide; apresentação até 30.",
					items: {
						type: "object",
						properties: {
							tipo: {
								type: "string",
								description: "cover, content, speaker, agenda, sponsors ou backcover (conforme o formato)"
							},
							cor: {
								type: "string",
								description: "Nome do kit (roxo, verde, laranja...) ou #RRGGBB"
							},
							title: { type: "string" },
							content: { type: "string" },
							tags: { type: "string" },
							date: { type: "string" },
							location: { type: "string" },
							speakerName: { type: "string" },
							speakerRole: { type: "string" },
							agendaText: { type: "string" },
							foto: {
								type: "string",
								description: "URL de listar_fotos ou um fundo da marca: fundo-1 a fundo-6"
							},
							imagem: {
								type: "string",
								description: "Imagem DENTRO do conteúdo (tipos content e deck-image): URL de listar_fotos"
							},
							icone_titulo: {
								type: "string",
								description: "Ícone do kit na célula do título (content, agenda, sponsors, deck-bullets, deck-image, deck-code): bolt, clock, teams, speaker, trophy, key, wrench, drop, ladder, bracket-smile"
							},
							mascote: {
								type: "boolean",
								description: "true = o mascote no lugar dele no layout (backcover, deck-end, meetup, club, waiting)"
							},
							foto_posicao: {
								type: "string",
								enum: [
									"full",
									"frame",
									"right",
									"left",
									"top",
									"bottom"
								],
								description: "full = fundo inteiro (padrão)"
							},
							foto_tamanho: {
								type: "string",
								enum: [
									"third",
									"half",
									"two-thirds"
								],
								description: "Para right/left/top/bottom"
							},
							foto_filtro: {
								type: "string",
								enum: [
									"none",
									"mono",
									"tint",
									"contrast",
									"pixel"
								]
							},
							elementos: {
								type: "array",
								maxItems: 4,
								description: "Componentes do slide (listar_opcoes > elementos). O servidor encaixa na faixa de cima ou de baixo, sem cobrir o texto.",
								items: {
									type: "object",
									properties: {
										tipo: {
											type: "string",
											enum: [
												"icone",
												"selo",
												"data",
												"bloco",
												"seta",
												"mascote",
												"logo",
												"qr"
											]
										},
										variante: {
											type: "string",
											enum: ["aws", "builder-center"],
											description: "logo"
										},
										posicao: {
											type: "string",
											enum: [
												"topo-esquerda",
												"topo-centro",
												"topo-direita",
												"base-esquerda",
												"base-centro",
												"base-direita"
											]
										},
										cor: {
											type: "string",
											description: "verde, roxo, laranja, azul, magenta, branco ou escuro"
										},
										icone: {
											type: "string",
											description: "icone: bolt, clock, teams, speaker, trophy, key, wrench, drop, ladder, bracket-smile...; data: calendar, pin, clock, people"
										},
										texto: {
											type: "string",
											description: "selo ou data"
										},
										direcao: {
											type: "string",
											description: "seta: right, left, up, down, up-right..."
										},
										estilo: {
											type: "string",
											enum: [
												"solid",
												"outline",
												"solto"
											],
											description: "bloco: solid/outline; icone: \"solto\" tira a célula colorida"
										},
										tamanho: {
											type: "string",
											enum: ["p", "g"],
											description: "p = menor (ícone), g = maior (bloco, seta)"
										},
										url: {
											type: "string",
											description: "qr"
										}
									},
									required: ["tipo"]
								}
							},
							ocultar: {
								type: "array",
								items: {
									type: "string",
									enum: [
										"hashtags",
										"deslize",
										"contador"
									]
								},
								description: "Tira componentes padrão do slide"
							}
						},
						required: ["tipo"]
					}
				},
				visual: {
					type: "string",
					description: "Visual pronto (listar_opcoes > visuais), \"surpresa\" (sorteia um diferente dos últimos) ou \"igual_ultimo\" (repete o do último material do mesmo formato). Sem visual nem estilo, vale \"surpresa\"."
				},
				cores: {
					type: "array",
					items: { type: "string" },
					description: "Paleta que se alterna entre os slides (nomes do kit ou #RRGGBB); vence a do visual"
				},
				estilo: {
					type: "object",
					description: "Ajustes por cima do visual: theme, pattern, composition, gridLines, blockGradient, gridSize (valores de listar_opcoes) e cor (destaque de todos os slides)",
					properties: {
						theme: { type: "string" },
						pattern: { type: "string" },
						composition: { type: "string" },
						gridLines: { type: "string" },
						blockGradient: { type: "string" },
						gridSize: { type: "string" },
						cor: { type: "string" }
					}
				},
				legenda: {
					type: "string",
					description: "Legenda do post (Instagram/LinkedIn), opcional"
				},
				projeto_id: {
					type: "string",
					description: "Opcional: id de um projeto (listar_projetos / criar_projeto) para o material já nascer dentro dele"
				},
				evento_id: {
					type: "string",
					description: "Evento, tela de espera, banner do Meetup, certificado e apresentação: id de listar_eventos (sem ele, o próximo evento do site; \"nenhum\" para não usar o site). Preenche data, local, palestrantes com foto e LinkedIn, apoiadores, programação e QR."
				},
				decoracao: {
					type: "boolean",
					description: "Padrão true: completa com ícones da AWS e foto da galeria o que faltar. O mascote entra sempre."
				}
			},
			required: ["formato", "slides"],
			additionalProperties: false
		},
		annotations: {
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: false
		}
	}
], ...WORKSPACE_TOOLS];
/** SHA-256 em hexadecimal (o banco guarda só isso do token) */
async function hashToken(token) {
	const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
	return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
/** Mesma regra do Studio (eventData.js > withProfile): o perfil atual do palestrante vale mais que a cópia no evento */
function withProfileRow(sp, people) {
	const p = sp?.profile_id ? (people ?? []).find((x) => x.id === sp.profile_id) : null;
	if (!p) return sp;
	return {
		...sp,
		name: p.full_name?.trim() || sp.name,
		role: p.headline?.trim() || sp.role,
		photo: p.avatar_url || sp.photo,
		linkedin: p.linkedin || sp.linkedin
	};
}
/** Acesso ao banco com o cliente do Supabase (chave de serviço). Os testes trocam por um repositório falso. */
function supabaseRepo(db) {
	return {
		async findToken(hash) {
			const { data } = await db.from("studio_mcp_tokens").select("id, user_id, group_id, revoked_at").eq("token_hash", hash).maybeSingle();
			return data;
		},
		async touchToken(id) {
			await db.from("studio_mcp_tokens").update({ last_used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
		},
		/** Nome e cargo da pessoa NO GRUPO (só o cargo de verdade: o administrador da plataforma não entra por aqui) */
		async getMember(groupId, userId) {
			const { data: profile } = await db.from("profiles").select("id, full_name").eq("id", userId).maybeSingle();
			if (!profile) return null;
			const { data: member } = await db.from("group_members").select("role").eq("group_id", groupId).eq("user_id", userId).maybeSingle();
			return {
				id: profile.id,
				full_name: profile.full_name,
				role: member?.role ?? null
			};
		},
		/** Todo o resto do acesso ao banco, preso a um grupo */
		forGroup: (groupId) => groupRepo(db, groupId)
	};
}
function groupRepo(db, groupId) {
	return {
		...workspaceRepo(db, groupId),
		async getGroup() {
			const { data } = await db.from("groups").select("id, slug, name, short_name, institution, city, domain, socials, mascot").eq("id", groupId).maybeSingle();
			return data;
		},
		async insertProject(row) {
			const { data, error } = await db.from("studio_projects").insert({
				...row,
				group_id: groupId
			}).select("id, title, mode, updated_at").single();
			if (error) throw new Error(error.message);
			return data;
		},
		/** Visíveis para a pessoa (mesma regra do RLS): os dela e, para líder/core, os da equipe que não são apresentação */
		async listProjects({ userId, staff, mode, limit, folder }) {
			let q = db.from("studio_projects").select("id, title, mode, owner_id, folder_id, updated_at, settings:data->globalSettings").eq("group_id", groupId).is("deleted_at", null).order("updated_at", { ascending: false }).limit(limit);
			q = staff ? q.or(`owner_id.eq.${userId},mode.neq.presentation`) : q.eq("owner_id", userId);
			if (mode) q = q.eq("mode", mode);
			if (folder) q = q.eq("folder_id", folder);
			const { data, error } = await q;
			if (error) throw new Error(error.message);
			return data ?? [];
		},
		async getProject(id) {
			const { data, error } = await db.from("studio_projects").select("id, title, mode, owner_id, updated_at, deleted_at, data").eq("group_id", groupId).eq("id", id).maybeSingle();
			if (error) throw new Error(error.message);
			return data;
		},
		async listPhotos({ limit, search }) {
			let q = db.from("gallery_photos").select("id, storage_path, caption, taken_at").eq("group_id", groupId).eq("show_on_site", true).order("taken_at", {
				ascending: false,
				nullsFirst: false
			}).limit(limit);
			if (search) q = q.ilike("caption", `%${search.replace(/[%_,()]/g, " ")}%`);
			const { data, error } = await q;
			if (error) throw new Error(error.message);
			return data ?? [];
		},
		/** Um evento com os palestrantes atualizados pelo perfil de quem tem conta (foto, cargo, LinkedIn atuais) */
		async getEvent(id) {
			const { data, error } = await db.from("events").select("*").eq("group_id", groupId).eq("id", id).maybeSingle();
			if (error) throw new Error(error.message);
			if (!data || data.is_hidden) return null;
			const { data: people } = await db.rpc("get_event_speaker_profiles", { g: groupId });
			return {
				...data,
				speakers: (Array.isArray(data.speakers) ? data.speakers : []).map((sp) => withProfileRow(sp, people))
			};
		},
		async listEvents(limit) {
			const { data, error } = await db.from("events").select("*").eq("group_id", groupId).order("date", { ascending: false }).limit(limit + 10);
			if (error) throw new Error(error.message);
			return (data ?? []).filter((e) => !e.is_hidden).slice(0, limit);
		}
	};
}
const text = (value) => ({ content: [{
	type: "text",
	text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
}] });
const toolError = (message) => ({
	...text(message),
	isError: true
});
const rpcResult = (id, result) => ({
	jsonrpc: "2.0",
	id,
	result
});
const rpcError = (id, code, message) => ({
	jsonrpc: "2.0",
	id: id ?? null,
	error: {
		code,
		message
	}
});
const json = (body, status = 200, headers = {}) => new Response(body === null ? null : JSON.stringify(body), {
	status,
	headers: {
		"Content-Type": "application/json",
		...headers
	}
});
/**
* Handler HTTP (Request -> Response). `project`: o módulo src/mcp/project.js;
* `studioUrl`: endereço do Studio para os links (?projeto=<id>).
*/
function createMcpHandler({ repo, project, studioUrl = "", supabaseUrl = "", siteUrl = "" }) {
	const base = studioUrl.replace(/\/$/, "");
	const linkOf = (id, user) => base ? `${base}/?projeto=${id}${user?.groupId ? `&grupo=${user.groupId}` : ""}` : "";
	const storage = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/` : "";
	const photoPrefixes = storage ? [storage] : [];
	const brandBase = storage ? `${storage}brand/` : "";
	const photoOf = (p) => ({
		url: `${storage}gallery/${p.storage_path}`,
		legenda: p.caption || "",
		data: p.taken_at
	});
	async function authenticate(req) {
		const url = new URL(req.url);
		const token = ((req.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1] || url.searchParams.get("token") || "").trim();
		if (!token) return { error: "Falta o token. Gere um no Studio (menu da conta > Conectar ao Claude)." };
		const row = await repo.findToken(await hashToken(token));
		if (!row || row.revoked_at) return { error: "Token inválido ou revogado. Gere outro no Studio." };
		const member = await repo.getMember(row.group_id, row.user_id);
		if (!member || !STUDIO_ROLES.includes(member.role)) return { error: "Sua conta não tem mais acesso ao Studio deste grupo." };
		repo.touchToken(row.id).catch(() => {});
		return { user: {
			id: member.id,
			name: member.full_name || "",
			role: member.role,
			staff: STAFF.includes(member.role),
			groupId: row.group_id,
			repo: repo.forGroup(row.group_id)
		} };
	}
	const workspace = createWorkspaceTools({
		project,
		text,
		toolError,
		linkOf
	});
	const canSee = (user, row) => row && !row.deleted_at && (row.owner_id === user.id || user.staff && row.mode !== "presentation");
	const tools = {
		...workspace,
		async listar_opcoes() {
			return text(project.describeOptions());
		},
		async listar_eventos(user, { limite = 5 } = {}) {
			const events = await user.repo.listEvents(Math.min(Math.max(Number(limite) || 5, 1), 20));
			const next = project.pickDefaultEvent(events);
			return text(events.map((e) => ({
				id: e.id,
				proximo: e.id === next?.id,
				titulo: e.title,
				data: e.date,
				data_formatada: project.eventLongDateBR(e.date),
				local: e.location,
				descricao: (e.description || "").slice(0, 600),
				palestrantes: (Array.isArray(e.speakers) ? e.speakers : []).map((s) => ({
					nome: s?.name,
					cargo: s?.role,
					tema: s?.topic,
					tem_foto: Boolean(s?.photo || s?.profile_id)
				})).filter((s) => s.nome),
				apoiadores: Array.isArray(e.sponsor_ids) ? e.sponsor_ids.length : 0,
				programacao: e.agenda ?? null,
				inscricao: e.meetup_url || null
			})));
		},
		async listar_fotos(user, { busca = "", limite = 12 } = {}) {
			const rows = await user.repo.listPhotos({
				limit: Math.min(Math.max(Number(limite) || 12, 1), 30),
				search: String(busca || "").trim().slice(0, 60)
			});
			return text(rows.map(photoOf));
		},
		async materiais_recentes(user, { limite = 8, formato, projeto_id: folder } = {}) {
			const rows = await user.repo.listProjects({
				userId: user.id,
				staff: user.staff,
				mode: formato || null,
				folder: folder || null,
				limit: Math.min(Math.max(Number(limite) || 8, 1), 20)
			});
			const folders = user.staff ? new Map((await user.repo.listFolders()).map((f) => [f.id, f.name])) : /* @__PURE__ */ new Map();
			return text(rows.map((r) => ({
				id: r.id,
				titulo: r.title,
				formato: r.mode,
				atualizado_em: r.updated_at,
				meu: r.owner_id === user.id,
				projeto: r.folder_id ? folders.get(r.folder_id) ?? null : null,
				link: linkOf(r.id, user),
				estilo: project.styleOf({ globalSettings: r.settings ?? {} })
			})));
		},
		async ler_material(user, { id } = {}) {
			if (!UUID.test(String(id ?? ""))) return toolError("Informe o id do material (de materiais_recentes).");
			const row = await user.repo.getProject(id);
			if (!canSee(user, row)) return toolError("Material não encontrado (ou você não tem acesso a ele).");
			return text({
				id: row.id,
				titulo: row.title,
				formato: row.mode,
				atualizado_em: row.updated_at,
				link: linkOf(row.id, user),
				estilo: project.styleOf(row.data),
				legenda: row.data?.globalSettings?.caption || "",
				slides: project.summarizeSlides(row.data)
			});
		},
		async criar_material(user, args = {}) {
			if (!user.staff && args.formato !== "presentation") return toolError("Seu cargo cria só apresentações no Studio (formato \"presentation\").");
			let input = { ...args };
			let origem = "";
			if (input.visual === "igual_ultimo") {
				const [last] = await user.repo.listProjects({
					userId: user.id,
					staff: user.staff,
					mode: input.formato,
					limit: 1
				});
				const row = last && await user.repo.getProject(last.id);
				if (row?.data) {
					const { cores_dos_slides: colors, ...style } = project.styleOf(row.data);
					input = {
						...input,
						visual: "",
						estilo: {
							...style,
							...input.estilo || {}
						},
						cores: input.cores?.length ? input.cores : colors
					};
					origem = `igual ao último material ("${row.title}")`;
				} else input.visual = "surpresa";
			}
			if (input.visual === "surpresa" || !origem && !project.hasDesign(input)) {
				const recent = await user.repo.listProjects({
					userId: user.id,
					staff: user.staff,
					mode: null,
					limit: 6
				});
				input.visual = project.pickLook(recent.map((r) => r.settings));
				origem = `sorteado, diferente dos últimos materiais`;
			}
			let event = null;
			if (project.EVENT_MODES.includes(input.formato) && input.evento_id !== "nenhum") {
				if (input.evento_id) {
					if (!UUID.test(String(input.evento_id))) return toolError("evento_id inválido: use um id de listar_eventos (ou \"nenhum\").");
					event = await user.repo.getEvent(input.evento_id);
					if (!event) return toolError("Evento não encontrado no site (use listar_eventos).");
				} else {
					const next = project.pickDefaultEvent(await user.repo.listEvents(20));
					event = next ? await user.repo.getEvent(next.id) : null;
				}
			}
			delete input.evento_id;
			let folderId = null;
			if (input.projeto_id && String(input.projeto_id).toLowerCase() !== "nenhum") {
				const folder = (await user.repo.listFolders()).find((f) => f.id === input.projeto_id && (f.owner_id === user.id || ["core", "leader"].includes(f.owner_role)));
				if (!folder) return toolError("Projeto não encontrado (use listar_projetos ou criar_projeto).");
				folderId = folder.id;
			}
			delete input.projeto_id;
			let fotoAutomatica = "";
			const slides = Array.isArray(input.slides) ? input.slides : [];
			if (["content", "event"].includes(input.formato) && input.decoracao !== false && storage && slides.length && !slides.some((s) => s?.foto)) {
				const photos = (await user.repo.listPhotos({
					limit: 40,
					search: ""
				})).map(photoOf);
				const texts = slides.flatMap((s) => [s?.title, s?.content]).concat(input.titulo, event?.title);
				const photo = project.pickPhoto(photos, texts, Math.random, { fallback: input.formato === "event" });
				if (photo) {
					const at = Math.max(0, slides.findIndex((s) => (s?.tipo ?? s?.type) === "cover"));
					const title = String(slides[at]?.title || event?.title || "");
					input.slides = slides.map((s, i) => i === at ? {
						...s,
						foto: photo.url,
						foto_posicao: "right",
						foto_tamanho: title.length > 40 ? "third" : "half"
					} : s);
					fotoAutomatica = `slide ${at + 1}: foto da galeria "${photo.legenda}"`;
				}
			}
			let built;
			const group = await user.repo.getGroup();
			const groupSite = group?.domain ? `https://${group.domain}` : siteUrl && group?.slug ? `${siteUrl.replace(/\/$/, "")}/${group.slug}` : "";
			try {
				const leaderName = input.formato === "certificate" ? (await user.repo.listTeam()).find((p) => p.role === "leader")?.name ?? "" : "";
				setCurrentGroup(group ? {
					...group,
					siteUrl: groupSite
				} : null);
				built = project.buildProject(input, {
					photoPrefixes,
					brandBase,
					event,
					leaderName,
					profile: {
						id: user.id,
						name: user.name
					}
				});
			} catch (err) {
				if (err instanceof project.ProjectInputError) return toolError(err.message);
				throw err;
			} finally {
				setCurrentGroup(null);
			}
			const row = await user.repo.insertProject({
				owner_id: user.id,
				updated_by: user.id,
				title: built.title.slice(0, 120),
				mode: built.mode,
				data: built.data,
				folder_id: folderId
			});
			return text({
				criado: true,
				id: row.id,
				titulo: row.title,
				formato: row.mode,
				link: linkOf(row.id, user),
				slides: built.data.slides.length,
				visual: built.visual || (origem ? "" : "personalizado"),
				origem_do_visual: origem || "escolhido no pedido",
				estilo: project.styleOf(built.data),
				automaticos: [fotoAutomatica, ...built.automaticos].filter(Boolean),
				avisos: built.avisos,
				proximo_passo: "Abra o link para revisar, trocar imagens e exportar. O arquivo está como rascunho na tela inicial do Studio."
			});
		}
	};
	async function handleMessage(msg, user) {
		if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return rpcError(msg?.id, -32600, "Requisição JSON-RPC inválida");
		if (msg.id === void 0 || msg.id === null) return null;
		switch (msg.method) {
			case "initialize": {
				const asked = msg.params?.protocolVersion;
				return rpcResult(msg.id, {
					protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
					capabilities: { tools: { listChanged: false } },
					serverInfo: SERVER_INFO,
					instructions: INSTRUCTIONS
				});
			}
			case "ping": return rpcResult(msg.id, {});
			case "tools/list": return rpcResult(msg.id, { tools: TOOLS });
			case "tools/call": {
				const name = msg.params?.name;
				const tool = tools[name];
				if (!tool) return rpcError(msg.id, -32602, `Ferramenta desconhecida: ${name}`);
				try {
					return rpcResult(msg.id, await tool(user, msg.params?.arguments ?? {}));
				} catch (err) {
					return rpcResult(msg.id, toolError(`Não foi possível concluir: ${err?.message || err}`));
				}
			}
			default: return rpcError(msg.id, -32601, `Método não suportado: ${msg.method}`);
		}
	}
	return async function handler(req) {
		if (req.method === "OPTIONS") return new Response(null, {
			status: 204,
			headers: { Allow: "POST, OPTIONS" }
		});
		if (req.method !== "POST") return json(rpcError(null, -32e3, "Use POST (este servidor não abre stream SSE)."), 405, { Allow: "POST, OPTIONS" });
		const raw = await req.text();
		if (raw.length > MAX_BODY) return json(rpcError(null, -32600, "Requisição grande demais"), 413);
		let body;
		try {
			body = JSON.parse(raw);
		} catch {
			return json(rpcError(null, -32700, "JSON inválido"), 400);
		}
		const auth = await authenticate(req);
		if (auth.error) return json(rpcError(Array.isArray(body) ? null : body?.id, -32001, auth.error), 401);
		const messages = Array.isArray(body) ? body : [body];
		const replies = (await Promise.all(messages.map((m) => handleMessage(m, auth.user)))).filter(Boolean);
		if (!replies.length) return new Response(null, { status: 202 });
		return json(Array.isArray(body) ? replies : replies[0]);
	};
}
//#endregion
export { createMcpHandler, project_exports as project, supabaseRepo };
