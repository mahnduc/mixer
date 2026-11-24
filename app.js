const $ = id => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const STORAGE_KEY = "mixer-app-state-v1";
const DRAG_THRESHOLD = 5;
const SHADOW = "shadow-[0_10px_30px_rgba(0,0,0,.22)]";

const KEY = "shadow-[0_3px_8px_rgba(0,0,0,.25),inset_0_1px_0_rgba(255,255,255,.35)]";
const DIVIDER = "border-[color-mix(in_srgb,var(--text)_15%,transparent)]";
const WORD_CARD =
  "bg-bg text-text border border-[color-mix(in_srgb,var(--text)_25%,transparent)]";

const BORDER = "border border-[color-mix(in_srgb,var(--text)_25%,transparent)]";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl";
const FIELD = `h-9 min-w-0 px-3 rounded-full text-sm bg-bg text-text ${BORDER} ${FOCUS}`;
const PRIMARY_BTN =
  "flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold " +
  `bg-text text-bg transition hover:opacity-90 ${FOCUS}`;

const SHADOW_REST = "0 10px 30px rgba(0,0,0,.22)";
const SHADOW_LIFT = "0 45px 80px rgba(0,0,0,.40), 0 16px 28px rgba(0,0,0,.25)";
const FOLLOW = 24;
const DROP_MS = 200;
const RETURN_MS = 260;
const HOVER_CLASSES = ["ring-4", "ring-hl"];
const MAX_SENTENCE = 40;
const MAX_WORD_LEN = 100;
const MAX_DOC_WORDS = 1000;
const MAX_IMPORT_WORDS = 500;
const MAX_IMPORT_SIZE = 2 * 1024 * 1024;
const MAX_SAVED_SENTENCES = 50;
const MAX_NAME_LEN = 80;
const MAX_LEGEND_LEN = 60;
const MAX_NOTE_LEN = 300;

const SELECT_BLUE = "#3b82f6";
const PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", SELECT_BLUE, "#8b5cf6", "#ec4899"
];

const MAX_TABLE_ROWS = 50;
const MAX_TABLE_COLS = 12;
const DEFAULT_IMG_W = 160;
const MIN_IMG_W = 24;
const MAX_IMG_W = 1200;
const MAX_IMG_FILE = 512 * 1024;
const IMG_SEL = 'figure[data-kind="img"]';
const IMG_PRESETS = ["heart", "star", "smile", "sun", "moon", "leaf", "lightbulb", "book-open"];
const presetUrl = name => `https://cdn.jsdelivr.net/npm/lucide-static/icons/${name}.svg`;
const IMG_SRC_RE =
  /^(?:https:\/\/[^\s"'()<>\\]{1,2000}|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+)$/i;

const cleanColor = value =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;

const cleanNote = value =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, MAX_NOTE_LEN) : "";

const cleanSrc = value =>
  typeof value === "string" && value.length <= 900000 && IMG_SRC_RE.test(value) ? value : null;

const cleanWidth = value => {
  const n = Number(value);
  return Number.isFinite(n) && n >= MIN_IMG_W && n <= MAX_IMG_W ? Math.round(n) : null;
};

const GRADIENT = "gradient";
const GRADIENT_CSS = "linear-gradient(to right, var(--con), var(--vow))";
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72];

const FONTS = [
  { id: "arial", label: "Arial", css: "Arial, Helvetica, sans-serif" },
  { id: "verdana", label: "Verdana", css: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", css: "Tahoma, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", css: '"Trebuchet MS", Helvetica, sans-serif' },
  { id: "georgia", label: "Georgia", css: "Georgia, serif" },
  { id: "times", label: "Times New Roman", css: '"Times New Roman", Times, serif' },
  { id: "courier", label: "Courier New", css: '"Courier New", Courier, monospace' },
  { id: "comic", label: "Comic Sans MS", css: '"Comic Sans MS", "Comic Neue", cursive' }
];
const FONT_MAP = new Map(FONTS.map(font => [font.id, font]));
const DEFAULT_DOC_FONT = "arial";

const cleanFont = value =>
  typeof value === "string" && FONT_MAP.has(value) ? value : null;

const fontIdFromCss = value => {
  const first = String(value).split(",")[0].replace(/["']/g, "").trim().toLowerCase();
  return FONTS.find(font => font.label.toLowerCase() === first)?.id ?? null;
};

const cleanWordColor = value => (value === GRADIENT ? GRADIENT : cleanColor(value));

const cleanSize = value => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 8 && n <= 200 ? Math.round(n) : null;
};

const paintBackground = (node, color) => {
  if (color === GRADIENT) node.style.backgroundImage = GRADIENT_CSS;
  else node.style.backgroundColor = color;
};

const setGradientText = node => {
  node.style.backgroundImage = GRADIENT_CSS;
  node.style.webkitBackgroundClip = "text";
  node.style.backgroundClip = "text";
  node.style.webkitTextFillColor = "transparent";
  node.style.color = "transparent";
  node.dataset.gradient = "1";
};

const clearGradientText = node => {
  node.style.backgroundImage = "";
  node.style.webkitBackgroundClip = "";
  node.style.backgroundClip = "";
  node.style.webkitTextFillColor = "";
  delete node.dataset.gradient;
};

const paintText = (node, color) => {
  if (color === GRADIENT) setGradientText(node);
  else if (color) node.style.color = color;
};

const makeLinkedSpan = (wordId, color) => {
  const span = document.createElement("span");
  span.dataset.wid = wordId;
  paintText(span, cleanWordColor(color));
  return span;
};

const wrapTextRange = (node, start, end, span) => {
  const mid = start > 0 ? node.splitText(start) : node;
  if (mid.nodeValue.length > end - start) mid.splitText(end - start);
  mid.replaceWith(span);
  span.append(mid);
  return span;
};

const cleanItem = item =>
  item && typeof item.word === "string" && item.word
    ? { word: item.word.slice(0, MAX_WORD_LEN), color: cleanColor(item.color) }
    : null;

const cleanWordItem = item =>
  item && typeof item.word === "string" && item.word.trim()
    ? {
      id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
      word: item.word.slice(0, MAX_WORD_LEN),
      color: cleanWordColor(item.color),
      bold: item.bold === true,
      italic: item.italic === true,
      underline: item.underline === true
    }
    : null;

const cleanWords = list => {
  const out = [];
  if (!Array.isArray(list)) return out;

  const seen = new Set();

  for (const raw of list) {
    const word = cleanWordItem(raw);
    if (!word || seen.has(word.id)) continue;
    seen.add(word.id);
    out.push(word);
    if (out.length >= MAX_DOC_WORDS) break;
  }

  return out;
};

const parseCssColor = value => {
  if (typeof value !== "string") return null;
  const text = value.trim();

  const hex = /^#([0-9a-f]{6})$/i.exec(text);
  if (hex) return `#${hex[1].toLowerCase()}`;

  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(text);
  if (!rgb) return null;

  return "#" + rgb
    .slice(1, 4)
    .map(n => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
    .join("");
};

const sameStyle = (a, b) =>
  (a.color || null) === (b.color || null) &&
  Boolean(a.bold) === Boolean(b.bold) &&
  Boolean(a.italic) === Boolean(b.italic) &&
  Boolean(a.underline) === Boolean(b.underline) &&
  (a.size || null) === (b.size || null) &&
  (a.font || null) === (b.font || null) &&
  Boolean(a.gradient) === Boolean(b.gradient) &&
  (a.wid || null) === (b.wid || null) &&
  (a.nid || null) === (b.nid || null) &&
  (a.note || null) === (b.note || null);

let docWords = [];
let sentenceBlocks = [];
let savedSentences = [];
let currentSavedId = null;
let colorLegend = {};

const DEFAULT_DOC_SIZE = 18;
let docSize = DEFAULT_DOC_SIZE;
let docFont = DEFAULT_DOC_FONT;

let showOutline = false;
let showLegend = false;

let dragActive = false;

const withWords = (words, fn) => {
  const previous = docWords;
  docWords = words;
  try {
    return fn();
  } finally {
    docWords = previous;
  }
};

const cleanRun = run => {
  if (!run || typeof run.text !== "string") return null;

  const text = run.text.replace(/\u00a0/g, " ").replace(/[\u200b\r]/g, "");
  if (!text) return null;

  const word =
    typeof run.wid === "string" && run.wid
      ? docWords.find(w => w.id === run.wid) || null
      : null;

  const noteText = cleanNote(run.note);
  const noteId =
    noteText && typeof run.nid === "string" && /^[\w-]{1,40}$/.test(run.nid) ? run.nid : null;

  let color = cleanColor(run.color);
  let gradient = run.gradient === true;

  if (word) {
    const wc = cleanWordColor(word.color);
    gradient = wc === GRADIENT;
    color = gradient ? null : wc;
  }

  return {
    text,
    color,
    bold: run.bold === true,
    italic: run.italic === true,
    underline: run.underline === true,
    size: cleanSize(run.size),
    font: cleanFont(run.font),
    gradient,
    wid: word ? word.id : null,
    nid: noteId,
    note: noteId ? noteText : null
  };
};

const cleanRuns = list => {
  const out = [];
  if (!Array.isArray(list)) return out;

  for (const raw of list) {
    const run = cleanRun(raw);
    if (!run) continue;

    const last = out[out.length - 1];
    if (last && sameStyle(last, run)) last.text += run.text;
    else out.push(run);
  }

  while (out.length) {
    const last = out[out.length - 1];
    last.text = last.text.replace(/\n+$/, "");
    if (last.text) break;
    out.pop();
  }

  return out;
};

const runsToText = runs => runs.map(run => run.text).join("");

const legacyToRuns = items =>
  cleanRuns(
    items.flatMap((item, i) => [
      { text: item.word, color: item.color },
      ...(i < items.length - 1 ? [{ text: " " }] : [])
    ])
  );

function domToRuns(root) {
  const runs = [];
  const state = { needBreak: false };

  const lastChar = () => {
    const last = runs[runs.length - 1];
    return last ? last.text.slice(-1) : "";
  };

  const add = (text, style) => {
    const last = runs[runs.length - 1];
    if (last && sameStyle(last, style)) last.text += text;
    else runs.push({ text, ...style });
  };

  const emit = (text, style) => {
    if (!text) return;

    if (state.needBreak) {
      state.needBreak = false;
      if (runs.length && lastChar() !== "\n") add("\n", style);
    }

    add(text, style);
  };

  const walk = (node, style) => {
    if (node.nodeType === Node.TEXT_NODE) {
      emit(node.textContent.replace(/\u00a0/g, " ").replace(/[\u200b\r]/g, ""), style);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;

    if (tag === "BR") {
      emit("\n", style);
      return;
    }

    const next = { ...style };
    const linked = node.dataset?.wid || null;
    if (linked) next.wid = linked;

    const noteId = node.dataset?.nid || null;
    if (noteId) {
      next.nid = noteId;
      next.note = node.dataset.note || null;
    }

    if (tag === "B" || tag === "STRONG") next.bold = true;
    if (tag === "I" || tag === "EM") next.italic = true;
    if (tag === "U") next.underline = true;
    if (tag === "FONT" && node.getAttribute("color")) {
      next.color = parseCssColor(node.getAttribute("color"));
      if (!linked) next.wid = null;
    }

    const css = node.style;
    if (css) {
      if (css.color && css.color !== "transparent") {
        next.color = parseCssColor(css.color);
        next.gradient = false;
        if (!linked) next.wid = null;
      }

      if (css.fontSize) {
        const px = /^(\d+(?:\.\d+)?)px$/.exec(css.fontSize);
        next.size = px ? cleanSize(px[1]) : null;
      }

      if (css.fontFamily) next.font = fontIdFromCss(css.fontFamily);

      if (
        node.dataset?.gradient === "1" ||
        css.backgroundClip === "text" ||
        css.webkitBackgroundClip === "text"
      ) {
        next.gradient = true;
        if (!linked) next.wid = null;
      }
      if (css.fontWeight) {
        next.bold = css.fontWeight === "bold" || Number(css.fontWeight) >= 600;
      }
      if (css.fontStyle) next.italic = css.fontStyle === "italic";

      const decoration = css.textDecorationLine || css.textDecoration;
      if (decoration) next.underline = decoration.includes("underline");
    }

    const block = /^(DIV|P|H[1-6]|UL|OL|LI|BLOCKQUOTE)$/.test(tag);
    if (block && runs.length) state.needBreak = true;

    node.childNodes.forEach(child => walk(child, next));

    if (block) state.needBreak = true;
  };

  root.childNodes.forEach(child =>
    walk(child, {
      color: null,
      bold: false,
      italic: false,
      underline: false,
      size: null,
      font: null,
      gradient: false,
      wid: null,
      nid: null,
      note: null
    })
  );

  return cleanRuns(runs);
}

function appendRuns(runs, container) {
  runs.forEach(run => {
    const styled =
      run.color || run.bold || run.italic || run.underline || run.size || run.font ||
      run.gradient || run.wid || run.nid;

    run.text.split("\n").forEach((part, i) => {
      if (i > 0) container.append(document.createElement("br"));
      if (!part) return;

      if (!styled) {
        container.append(document.createTextNode(part));
        return;
      }

      const span = document.createElement("span");
      span.textContent = part;
      if (run.wid) span.dataset.wid = run.wid;
      if (run.nid) {
        span.dataset.nid = run.nid;
        span.dataset.note = run.note;
        span.title = run.note;
      }
      if (run.gradient) setGradientText(span);
      else if (run.color) span.style.color = run.color;
      if (run.size) span.style.fontSize = `${run.size}px`;
      if (run.font) span.style.fontFamily = FONT_MAP.get(run.font).css;
      if (run.bold) span.style.fontWeight = "700";
      if (run.italic) span.style.fontStyle = "italic";
      if (run.underline) span.style.textDecoration = "underline";
      container.append(span);
    });
  });
}

function numberNotes(root) {
  const groups = new Map();

  root.querySelectorAll("[data-nid]").forEach(node => {
    const id = node.dataset.nid;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(node);
  });

  let n = 0;
  groups.forEach(nodes => {
    n++;
    nodes.forEach((node, i) => {
      if (i === nodes.length - 1) {
        if (node.dataset.n !== String(n)) node.dataset.n = String(n);
      } else if (node.dataset.n !== undefined) {
        delete node.dataset.n;
      }
    });
  });

  return groups;
}

const reduceMotion =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const BLOCK_TYPES = [
  "p", "h1", "h2", "h3", "h4", "ul", "ol", "quote", "cite", "poem", "dropcap", "img", "table"
];
const ALIGNS = ["left", "center", "right", "justify"];
const SPECIAL_KINDS = ["quote", "cite", "poem", "dropcap"];

const numSpec = (def, min, max, step = 1) => ({ t: "num", def, min, max, step });
const boolSpec = def => ({ t: "bool", def });
const pickSpec = (def, opts) => ({ t: "pick", def, opts });

const headingSchema = (size, lh, top, bottom) => ({
  size: numSpec(size, 10, 120, 1),
  weight: pickSpec("700", ["400", "500", "600", "700", "800", "900"]),
  lh: numSpec(lh, 0.8, 3, 0.05),
  top: numSpec(top, 0, 5, 0.05),
  bottom: numSpec(bottom, 0, 5, 0.05)
});

const STYLE_SCHEMA = {
  page: {
    top: numSpec(8, 0, 200, 1),
    right: numSpec(12, 0, 300, 1),
    bottom: numSpec(8, 0, 200, 1),
    left: numSpec(12, 0, 300, 1)
  },
  p: {
    lh: numSpec(1.63, 1, 3, 0.05),
    gap: numSpec(0, 0, 3, 0.05),
    indent: numSpec(2, 0, 10, 0.5)
  },
  h1: headingSchema(36, 1.2, 0.4, 0.2),
  h2: headingSchema(30, 1.25, 0.4, 0.2),
  h3: headingSchema(24, 1.3, 0.35, 0.15),
  h4: headingSchema(20, 1.35, 0.3, 0.1),
  quote: {
    size: numSpec(1.15, 0.6, 3, 0.05),
    italic: boolSpec(true),
    align: pickSpec("center", ALIGNS),
    top: numSpec(0.6, 0, 5, 0.05),
    bottom: numSpec(0.2, 0, 5, 0.05),
    side: numSpec(1.5, 0, 10, 0.25)
  },
  cite: {
    size: numSpec(0.9, 0.5, 2, 0.05),
    opacity: numSpec(0.75, 0.2, 1, 0.05),
    align: pickSpec("right", ALIGNS),
    bottom: numSpec(0.6, 0, 5, 0.05),
    side: numSpec(1.5, 0, 10, 0.25)
  },

  poem: {
    size: numSpec(1, 0.6, 3, 0.05),
    lh: numSpec(1.7, 1, 3, 0.05),
    italic: boolSpec(false),
    top: numSpec(0.6, 0, 5, 0.05),
    bottom: numSpec(0.6, 0, 5, 0.05)
  },

  dropcap: {
    lines: numSpec(3, 2, 6, 1),
    cap: numSpec(0.7, 0.4, 1, 0.01),
    gap: numSpec(0.08, 0, 1, 0.01),
    weight: pickSpec("700", ["400", "500", "600", "700", "800", "900"])
  }
};

const cleanStyleValue = (spec, value) => {
  if (spec.t === "bool") return typeof value === "boolean" ? value : spec.def;
  if (spec.t === "pick") return spec.opts.includes(value) ? value : spec.def;

  const n = Number(value);
  if (value === "" || value === null || !Number.isFinite(n)) return spec.def;
  return Math.round(clamp(n, spec.min, spec.max) * 100) / 100;
};

const cleanDocStyle = value => {
  const src = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const out = {};

  Object.entries(STYLE_SCHEMA).forEach(([group, fields]) => {
    const raw = src[group] && typeof src[group] === "object" ? src[group] : {};
    out[group] = {};
    Object.entries(fields).forEach(([key, spec]) => {
      out[group][key] = cleanStyleValue(spec, raw[key]);
    });
  });

  return out;
};

let docStyle = cleanDocStyle({});

const STYLE_PICK_LABELS = {
  left: "Trái",
  center: "Giữa",
  right: "Phải",
  justify: "Đều hai bên",
  "400": "400 · Thường",
  "500": "500 · Vừa",
  "600": "600 · Bán đậm",
  "700": "700 · Đậm",
  "800": "800 · Rất đậm",
  "900": "900 · Cực đậm"
};

const STYLE_SECTIONS = [
  [
    "Lề tài liệu",
    "page",
    [
      ["top", "Lề trên", "px"],
      ["right", "Lề phải", "px"],
      ["bottom", "Lề dưới", "px"],
      ["left", "Lề trái", "px"]
    ]
  ],
  [
    "Đoạn văn",
    "p",
    [
      ["lh", "Giãn dòng", "×"],
      ["gap", "Cách đoạn", "em"],
      ["indent", "Thụt đầu dòng", "em"]
    ]
  ],
  ...[1, 2, 3, 4].map(n => [
    `Tiêu đề cấp ${n}`,
    `h${n}`,
    [
      ["size", "Cỡ chữ", "px"],
      ["weight", "Độ đậm", ""],
      ["lh", "Giãn dòng", "×"],
      ["top", "Cách trên", "em"],
      ["bottom", "Cách dưới", "em"]
    ]
  ]),
  [
    "Trích dẫn",
    "quote",
    [
      ["size", "Cỡ chữ", "em"],
      ["italic", "In nghiêng", ""],
      ["align", "Căn lề", ""],
      ["top", "Cách trên", "em"],
      ["bottom", "Cách dưới", "em"],
      ["side", "Lề hai bên", "rem"]
    ]
  ],
  [
    "Tác giả / chú thích",
    "cite",
    [
      ["size", "Cỡ chữ", "em"],
      ["opacity", "Độ đậm nhạt", "0–1"],
      ["align", "Căn lề", ""],
      ["bottom", "Cách dưới", "em"],
      ["side", "Lề hai bên", "rem"]
    ]
  ],
  [
    "Thơ tự do",
    "poem",
    [
      ["size", "Cỡ chữ", "em"],
      ["lh", "Giãn dòng", "×"],
      ["italic", "In nghiêng", ""],
      ["top", "Cách trên", "em"],
      ["bottom", "Cách dưới", "em"]
    ]
  ],
  [
    "Chữ cái đầu to (tiểu thuyết)",
    "dropcap",
    [
      ["lines", "Số dòng chữ cái chiếm", "dòng"],
      ["cap", "Tỉ lệ chiều cao chữ hoa", ""],
      ["gap", "Cách chữ bên phải", "em"],
      ["weight", "Độ đậm", ""]
    ]
  ]
];

const docStyleCss = s => {
  const dc = s.dropcap;
  const k = ((dc.lines - 1) * s.p.lh) / dc.cap + 1;
  const dcLine = ((dc.lines * s.p.lh) / k) * 0.99;

  return [
    `.rt-doc.rt-doc { line-height: ${s.p.lh}; }`,
    `.rt-doc p:not([data-kind]) { margin-bottom: ${s.p.gap}em; }`,
    `.rt-doc [data-indent="1"] { text-indent: ${s.p.indent}em; }`,
    ...[1, 2, 3, 4].map(n => {
      const h = s[`h${n}`];
      return (
        `.rt-doc h${n} { font-size: ${h.size}px; font-weight: ${h.weight}; ` +
        `line-height: ${h.lh}; margin: ${h.top}em 0 ${h.bottom}em; }`
      );
    }),
    `.rt-doc [data-kind="quote"] { text-align: ${s.quote.align}; ` +
    `font-style: ${s.quote.italic ? "italic" : "normal"}; font-size: ${s.quote.size}em; ` +
    `margin: ${s.quote.top}em ${s.quote.side}rem ${s.quote.bottom}em; }`,
    `.rt-doc [data-kind="cite"] { text-align: ${s.cite.align}; font-size: ${s.cite.size}em; ` +
    `opacity: ${s.cite.opacity}; margin: 0 ${s.cite.side}rem ${s.cite.bottom}em; }`,
    `.rt-doc [data-kind="poem"] { text-align: left; font-size: ${s.poem.size}em; ` +
    `line-height: ${s.poem.lh}; font-style: ${s.poem.italic ? "italic" : "normal"}; ` +
    `max-width: 100%; margin-left: auto; margin-right: auto; }`,
    `.rt-doc :not([data-kind="poem"]) + [data-kind="poem"], ` +
    `.rt-doc [data-kind="poem"]:first-child { margin-top: ${s.poem.top}em; }`,
    `.rt-doc [data-kind="poem"]:not(:has(+ [data-kind="poem"])) { margin-bottom: ${s.poem.bottom}em; }`,
    `.rt-doc [data-kind="dropcap"] { display: flow-root; margin: .3em 0; }`,
    `.rt-doc [data-kind="dropcap"]::first-letter { float: left; font-size: ${k.toFixed(3)}em; ` +
    `line-height: ${dcLine.toFixed(4)}; font-weight: ${dc.weight}; ` +
    `margin: 0 ${dc.gap}em 0 0; padding: 0; }`
  ].join("\n");
};

const runsToBlocks = runs => (runs.length ? [{ type: "p", align: null, runs }] : []);

const blockText = block =>
  block.type === "table"
    ? block.rows.map(row => row.map(runsToText).join("\t")).join("\n")
    : block.type === "img"
      ? "[ảnh]"
      : block.type === "cite" && block.runs.length
        ? `— ${runsToText(block.runs)} —`
        : runsToText(block.runs);

const blocksToText = blocks => blocks.map(blockText).join("\n");

const defaultSentenceName = blocks => {
  const text = blocksToText(blocks).replace(/\s+/g, " ").trim();
  return (text ? text.slice(0, 30) : "Tệp").trim();
};

const cleanName = (raw, fallback = "Tệp") =>
  String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LEN) || fallback;

const cleanLegend = value => {
  const out = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return out;

  Object.entries(value).forEach(([key, label]) => {
    const color = key === GRADIENT ? GRADIENT : cleanColor(key);
    const text =
      typeof label === "string"
        ? label.replace(/\s+/g, " ").trim().slice(0, MAX_LEGEND_LEN)
        : "";
    if (color && text) out[color] = text;
  });

  return out;
};

const dedupeNames = list => {
  const used = new Set();

  list.forEach(item => {
    const base = item.name;
    let name = base;
    let n = 2;

    while (used.has(name.toLowerCase())) name = `${base} (${n++})`.slice(0, MAX_NAME_LEN + 6);

    item.name = name;
    used.add(name.toLowerCase());
  });
};

const cleanCell = cell =>
  Array.isArray(cell)
    ? cleanRuns(cell)
    : typeof cell === "string"
      ? cleanRuns([{ text: cell }])
      : [];

const cleanRows = rows => {
  if (!Array.isArray(rows)) return [];

  const out = rows
    .slice(0, MAX_TABLE_ROWS)
    .filter(Array.isArray)
    .map(row => row.slice(0, MAX_TABLE_COLS).map(cleanCell));

  const cols = Math.max(0, ...out.map(row => row.length));
  out.forEach(row => {
    while (row.length < cols) row.push([]);
  });

  return cols ? out : [];
};

const cleanBlock = block => {
  const type = BLOCK_TYPES.includes(block?.type) ? block.type : "p";

  if (type === "img") {
    const src = cleanSrc(block.src);
    return src
      ? {
        type,
        src,
        width: cleanWidth(block.width) ?? DEFAULT_IMG_W,
        color: cleanWordColor(block.color),
        align: block.align === "center" || block.align === "right" ? block.align : null,
        runs: []
      }
      : null;
  }

  if (type === "table") {
    const rows = cleanRows(block.rows);
    return rows.length ? { type, header: block.header === true, rows, runs: [] } : null;
  }

  const keepLeft = type === "quote" || type === "cite";

  return {
    type,
    align:
      ALIGNS.includes(block?.align) &&
        (keepLeft || block.align !== "left")
        ? block.align
        : null,
    indent: type === "p" && block?.indent === true,
    runs: cleanRuns(block?.runs)
  };
};

const isEmptyBlock = block =>
  !block.runs.length && block.type !== "img" && block.type !== "table";

const cleanBlocks = list => {
  const out = [];
  if (!Array.isArray(list)) return out;

  for (const raw of list) {
    const block = cleanBlock(raw);
    if (block) out.push(block);
  }

  while (out.length && isEmptyBlock(out[out.length - 1])) out.pop();

  return out;
};

const textToBlocks = text =>
  cleanBlocks(
    String(text)
      .split(/\r?\n/)
      .map(line => ({ type: "p", runs: line ? [{ text: line }] : [] }))
  );

const cloneBlocks = blocks => JSON.parse(JSON.stringify(blocks));

const collectWids = blocks => {
  const ids = new Set();
  const visit = runs => runs.forEach(run => run.wid && ids.add(run.wid));

  blocks.forEach(block => {
    if (block.type === "table") block.rows.flat().forEach(visit);
    else visit(block.runs);
  });

  return ids;
};

const blocksFromEntry = entry =>
  Array.isArray(entry?.blocks)
    ? cleanBlocks(entry.blocks)
    : Array.isArray(entry?.runs)
      ? runsToBlocks(cleanRuns(entry.runs))
      : Array.isArray(entry?.items)
        ? runsToBlocks(
          legacyToRuns(entry.items.map(cleanItem).filter(Boolean).slice(0, MAX_SENTENCE))
        )
        : [];

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);

    const legacyWords = cleanWords(data.savedWords);
    const hasDocWords = Array.isArray(data.docWords);
    docWords = hasDocWords ? cleanWords(data.docWords) : legacyWords;

    if (Array.isArray(data.sentenceBlocks)) {
      sentenceBlocks = cleanBlocks(data.sentenceBlocks);
    } else if (Array.isArray(data.sentenceRuns)) {
      sentenceBlocks = runsToBlocks(cleanRuns(data.sentenceRuns));
    } else if (Array.isArray(data.sentence)) {
      sentenceBlocks = runsToBlocks(
        legacyToRuns(data.sentence.map(cleanItem).filter(Boolean).slice(0, MAX_SENTENCE))
      );
    }

    if (Array.isArray(data.savedSentences)) {
      savedSentences = data.savedSentences
        .map(entry => {
          const hasWords = Array.isArray(entry?.words);
          const words = hasWords ? cleanWords(entry.words) : legacyWords;
          const blocks = withWords(words, () => blocksFromEntry(entry));

          if (!blocks.length) return null;

          const used = collectWids(blocks);

          return {
            id: typeof entry.id === "string" ? entry.id : crypto.randomUUID(),
            name:
              typeof entry?.name === "string" && entry.name.trim()
                ? cleanName(entry.name)
                : defaultSentenceName(blocks),
            blocks,
            words: hasWords ? words : words.filter(word => used.has(word.id))
          };
        })
        .filter(Boolean)
        .slice(0, MAX_SAVED_SENTENCES);

      dedupeNames(savedSentences);
    }

    if (
      typeof data.currentSavedId === "string" &&
      savedSentences.some(s => s.id === data.currentSavedId)
    ) {
      currentSavedId = data.currentSavedId;
    }

    if (!hasDocWords) {
      const current = collectWids(sentenceBlocks);
      const usedElsewhere = new Set(savedSentences.flatMap(s => [...collectWids(s.blocks)]));
      docWords = legacyWords.filter(word => current.has(word.id) || !usedElsewhere.has(word.id));
    }

    colorLegend = cleanLegend(data.colorLegend);

    docSize = cleanSize(data.docSize) ?? DEFAULT_DOC_SIZE;
    docFont = cleanFont(data.docFont) ?? DEFAULT_DOC_FONT;
    docStyle = cleanDocStyle(data.docStyle);

    showOutline = data.showOutline === true;
    showLegend = data.showLegend === true;
  } catch (error) {
    console.warn("Không thể đọc dữ liệu Mixer đã lưu:", error);
    docWords = [];
    sentenceBlocks = [];
    savedSentences = [];
    currentSavedId = null;
    colorLegend = {};
    docSize = DEFAULT_DOC_SIZE;
    docFont = DEFAULT_DOC_FONT;
    docStyle = cleanDocStyle({});
    showOutline = false;
    showLegend = false;
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 18,
        docSize,
        docFont,
        docStyle,
        docWords,
        sentenceBlocks,
        savedSentences,
        currentSavedId,
        colorLegend,
        showOutline,
        showLegend
      })
    );
  } catch (error) {
    console.error("Không thể lưu dữ liệu Mixer:", error);
    showStorageWarning();
  }
}

let storageWarned = false;
let onStorageWarning = null;

function showStorageWarning() {
  if (storageWarned) return;
  storageWarned = true;
  onStorageWarning?.(
    "Trình duyệt không thể lưu dữ liệu. Hãy kiểm tra chế độ riêng tư hoặc dung lượng lưu trữ."
  );
}

const el = (tag, cls, text, ...kids) => {
  const node = document.createElement(tag);
  node.className = cls;
  if (text !== undefined && text !== null && text !== "") {
    node.textContent = text;
  }
  node.append(...kids);
  return node;
};

const mkBtn = (cls, title, html) => {
  const button = el("button", cls);
  button.type = "button";
  if (title) {
    button.title = title;
    button.setAttribute("aria-label", title);
  }
  if (html) button.innerHTML = html;
  return button;
};

const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function domToBlocks(root) {
  const blocks = [];
  const BLOCK_RE = /^(P|DIV|H[1-6]|BLOCKQUOTE|UL|OL|TABLE|FIGURE)$/;

  const alignOf = (node, fallback = null) => {
    const raw = (node.style?.textAlign || node.getAttribute?.("align") || "").toLowerCase();
    return ALIGNS.includes(raw) ? raw : fallback;
  };

  const walkBlocks = (parent, inherited) => {
    let loose = null;

    const flush = () => {
      if (!loose) return;
      blocks.push({ type: "p", align: inherited, runs: domToRuns(loose) });
      loose = null;
    };

    parent.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && BLOCK_RE.test(node.tagName)) {
        flush();

        const tag = node.tagName;
        const align = alignOf(node, inherited);

        if (tag === "FIGURE") {
          blocks.push({
            type: "img",
            src: node.dataset.src,
            width: node.dataset.w,
            color: node.dataset.color,
            align: alignOf(node)
          });
        } else if (tag === "TABLE") {
          blocks.push({
            type: "table",
            header: node.dataset.header === "1",
            rows: [...node.rows].map(row => [...row.cells].map(cell => domToRuns(cell)))
          });
        } else if (tag === "UL" || tag === "OL") {
          const type = tag.toLowerCase();
          [...node.children]
            .filter(child => child.tagName === "LI")
            .forEach(li => {
              blocks.push({ type, align: alignOf(li, align), runs: domToRuns(li) });
            });
        } else if (tag === "DIV" && [...node.children].some(c => BLOCK_RE.test(c.tagName))) {
          walkBlocks(node, align);
        } else {
          const kind = node.dataset?.kind;
          const type = /^H[1-6]$/.test(tag)
            ? `h${Math.min(4, Number(tag[1]))}`
            : tag === "BLOCKQUOTE"
              ? "quote"
              : SPECIAL_KINDS.includes(kind)
                ? kind
                : "p";

          blocks.push({
            type,
            align,
            indent: type === "p" && node.dataset?.indent === "1",
            runs: domToRuns(node)
          });
        }
        return;
      }

      if (node.nodeType === Node.TEXT_NODE && !node.textContent) return;

      if (!loose) loose = document.createElement("div");
      loose.append(node.cloneNode(true));
    });

    flush();
  };

  walkBlocks(root, null);
  return cleanBlocks(blocks);
}

const setMask = (node, src) => {
  const url = `url("${src}")`;
  Object.assign(node.style, {
    webkitMaskImage: url,
    maskImage: url,
    webkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    webkitMaskPosition: "center",
    maskPosition: "center",
    webkitMaskSize: "contain",
    maskSize: "contain"
  });
};

function paintImage(fig) {
  const { src, w, color } = fig.dataset;

  const wrap = el("span", "rt-wrap");
  wrap.style.width = `${cleanWidth(w) ?? DEFAULT_IMG_W}px`;

  const img = document.createElement("img");
  img.src = src;
  img.alt = "Ảnh";
  img.draggable = false;
  img.onerror = () => wrap.classList.add("rt-broken");
  if (color) img.style.visibility = "hidden";
  wrap.append(img);

  if (color) {
    const tint = el("span", "rt-mask");
    setMask(tint, src);
    paintBackground(tint, color);
    wrap.append(tint);
  }

  if (fig.classList.contains("rt-img-sel")) {
    const handle = el("span", "rt-handle");
    handle.dataset.handle = "1";
    handle.title = "Kéo để đổi kích cỡ";
    wrap.append(handle);
  }

  fig.replaceChildren(wrap);
}

function buildImageFigure(block) {
  const fig = document.createElement("figure");
  fig.contentEditable = "false";
  fig.dataset.kind = "img";
  fig.dataset.src = block.src;
  fig.dataset.w = String(block.width);
  if (block.color) fig.dataset.color = block.color;
  if (block.align) fig.style.textAlign = block.align;
  paintImage(fig);
  return fig;
}

function buildTable(block) {
  const table = document.createElement("table");
  if (block.header) table.dataset.header = "1";

  const body = table.createTBody();
  block.rows.forEach(row => {
    const tr = body.insertRow();
    row.forEach(cell => {
      const td = tr.insertCell();
      appendRuns(cell, td);
      if (!td.firstChild) td.append(document.createElement("br"));
    });
  });

  return table;
}

function renderBlocks(blocks, container) {
  container.replaceChildren();

  let list = null;

  blocks.forEach(block => {
    if (block.type === "img" || block.type === "table") {
      list = null;
      container.append(block.type === "img" ? buildImageFigure(block) : buildTable(block));
      return;
    }

    let node;

    if (block.type === "ul" || block.type === "ol") {
      if (!list || list.tagName.toLowerCase() !== block.type) {
        list = document.createElement(block.type);
        container.append(list);
      }
      node = document.createElement("li");
      list.append(node);
    } else {
      list = null;
      const special = SPECIAL_KINDS.includes(block.type);
      node = document.createElement(special ? "p" : block.type);
      if (special) node.dataset.kind = block.type;
      if (block.indent) node.dataset.indent = "1";
      container.append(node);
    }

    if (block.align) node.style.textAlign = block.align;

    appendRuns(block.runs, node);
    if (!node.firstChild) node.append(document.createElement("br"));
  });

  const last = blocks[blocks.length - 1];
  if (last && (last.type === "img" || last.type === "table")) {
    const tail = document.createElement("p");
    tail.append(document.createElement("br"));
    container.append(tail);
  }
}

const poseAt = (tx, ty, rz, rx, ry, s) =>
  `translate3d(${tx}px, ${ty}px, 0) perspective(900px) ` +
  `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;

function startDrag(srcEl, down, { makeGhost, targets, lift = 1.25, onPick, onDrop, onEnd }) {
  if (down.pointerType === "mouse" && down.button !== 0) return;

  const pointerId = down.pointerId;
  const rect = srcEl.getBoundingClientRect();

  let w = rect.width;
  let h = rect.height;
  let grabX = 0;
  let grabY = 0;

  let tx = down.clientX, ty = down.clientY;
  let x = tx, y = ty;
  let rz = 0, rx = 0, ry = 0;
  let scale = 0.85;

  let ghost = null, raf = 0, last = 0;
  let hover = null;
  let dragging = false, finished = false;

  const pose = () => poseAt(x - grabX, y - grabY, rz, rx, ry, scale);

  const setHover = node => {
    if (hover === node) return;
    if (hover) hover.classList.remove(...HOVER_CLASSES);
    hover = node;
    if (hover) hover.classList.add(...HOVER_CLASSES);
  };

  const findTarget = () => document.elementFromPoint(tx, ty)?.closest(targets) ?? null;

  const begin = () => {
    dragging = true;
    dragActive = true;

    ghost = makeGhost();
    ghost.classList.add("pointer-events-none", "cursor-grabbing");

    Object.assign(ghost.style, {
      position: "fixed",
      left: "0",
      top: "0",
      margin: "0",
      zIndex: "90",
      pointerEvents: "none",
      transformOrigin: "50% 50%",
      willChange: "transform",
      boxShadow: SHADOW_REST,
      transition: "box-shadow 160ms ease-out",
      transform: "translate3d(-9999px,-9999px,0)"
    });

    document.body.append(ghost);

    const r = ghost.getBoundingClientRect();
    w = r.width;
    h = r.height;
    grabX = w / 2;
    grabY = h / 2;
    x = tx;
    y = ty;

    ghost.style.transform = pose();
    ghost.getBoundingClientRect();
    ghost.style.boxShadow = SHADOW_LIFT;

    onPick?.();

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("keydown", onKey);

    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const tick = now => {
    const dt = clamp((now - last) / 1000, 1 / 240, 0.05);
    last = now;

    const k = reduceMotion ? 1 : 1 - Math.exp(-FOLLOW * dt);
    const px = x, py = y;
    x += (tx - x) * k;
    y += (ty - y) * k;

    const vx = (x - px) / dt;
    const vy = (y - py) / dt;

    const tRz = reduceMotion ? 0 : clamp(vx * 0.010, -12, 12);
    const tRx = reduceMotion ? 0 : clamp(-vy * 0.006, -8, 8);
    const tRy = reduceMotion ? 0 : clamp(vx * 0.006, -8, 8);

    const kr = 1 - Math.exp(-14 * dt);
    rz += (tRz - rz) * kr;
    rx += (tRx - rx) * kr;
    ry += (tRy - ry) * kr;
    scale += (lift - scale) * (1 - Math.exp(-18 * dt));

    ghost.style.transform = pose();
    raf = requestAnimationFrame(tick);
  };

  const onMove = e => {
    if (e.pointerId !== pointerId) return;
    tx = e.clientX;
    ty = e.clientY;

    if (!dragging) {
      if (Math.hypot(tx - down.clientX, ty - down.clientY) < DRAG_THRESHOLD) return;
      begin();
    }

    setHover(findTarget());
  };

  const onUp = e => {
    if (e.pointerId !== pointerId) return;
    tx = e.clientX;
    ty = e.clientY;
    finish(true);
  };

  const onPointerCancel = e => {
    if (e.pointerId === pointerId) finish(false);
  };

  const onKey = e => {
    if (e.key === "Escape") finish(false);
  };

  const cleanup = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("keydown", onKey);
  };

  const finish = allowDrop => {
    if (finished) return;
    finished = true;
    dragActive = false;
    cleanup();

    if (!dragging) return;

    cancelAnimationFrame(raf);

    const target = allowDrop ? findTarget() : null;
    setHover(null);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    onEnd?.();

    const done = () => {
      ghost.remove();
      if (target) onDrop?.(target);
    };

    if (reduceMotion) return done();

    const dest = target ? target.getBoundingClientRect() : rect;
    const endTx = dest.left + dest.width / 2 - w / 2;
    const endTy = dest.top + dest.height / 2 - h / 2;
    const endScale = target ? 0.6 : 0.85;

    const from = ghost.style.transform;
    ghost.style.transition = "none";

    const anim = ghost.animate(
      [
        { transform: from, boxShadow: SHADOW_LIFT, opacity: 1 },
        {
          transform: poseAt(endTx, endTy, 0, 0, 0, endScale),
          boxShadow: SHADOW_REST,
          opacity: 0
        }
      ],
      {
        duration: target ? DROP_MS : RETURN_MS,
        easing: "cubic-bezier(.2,.8,.3,1)",
        fill: "forwards"
      }
    );

    anim.onfinish = done;
    anim.oncancel = done;
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onPointerCancel);
}

readStorage();

function init() {
  const applyDocDefaults = () => {
    const root = document.documentElement.style;
    root.setProperty("--doc-size", `${docSize}px`);
    root.setProperty("--doc-font", FONT_MAP.get(docFont || DEFAULT_DOC_FONT).css);
  };

  applyDocDefaults();

  const toast = el(
    "div",
    "fixed left-1/2 bottom-6 z-[95] -translate-x-1/2 px-4 py-2 rounded-full " +
    "bg-text text-bg text-sm font-semibold shadow-lg " +
    "transition-opacity duration-200 opacity-0 pointer-events-none"
  );
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.append(toast);

  let toastTimer = 0;

  const showToast = message => {
    toast.textContent = message;
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 1800);
  };

  onStorageWarning = showToast;

  const toolBtnClass =
    `flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-semibold ${BORDER} text-text ` +
    "transition hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl";

  const iconBtn =
    "flex items-center justify-center size-7 shrink-0 rounded-full opacity-70 " +
    `hover:opacity-100 hover:bg-black/15 ${FOCUS}`;

  const DEFAULT_EXPORT_NAME = "mixer-tep";
  let lastExportName = null;

  const safeFileName = (raw, fallback) =>
    raw
      .replace(/\.json$/i, "")
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\.+/, "")
      .slice(0, 80) || fallback;

  const askName = ({ title, defaultValue, suffix = "", okText = "OK", clean, maxLength = MAX_NAME_LEN }) =>
    new Promise(resolve => {
      const overlay = el(
        "div",
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      );
      const dialog = el(
        "div",
        `w-full max-w-sm flex flex-col gap-3 p-5 rounded-2xl bg-bg text-text ${SHADOW}`
      );
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", title);

      const input = el("input", `${FIELD} flex-1 h-10`);
      input.type = "text";
      input.maxLength = maxLength;
      input.value = defaultValue;
      input.setAttribute("aria-label", title);

      const cancel = el("button", toolBtnClass, "Hủy");
      cancel.type = "button";

      const ok = el("button", PRIMARY_BTN, okText);
      ok.type = "button";

      let done = false;
      const finish = value => {
        if (done) return;
        done = true;
        overlay.remove();
        resolve(value);
      };

      const submit = () => finish(clean(input.value));

      input.addEventListener("keydown", event => {
        if (event.isComposing) return;
        if (event.key === "Enter") {
          event.preventDefault();
          submit();
        } else if (event.key === "Escape") {
          event.stopPropagation();
          finish(null);
        }
      });

      ok.onclick = submit;
      cancel.onclick = () => finish(null);
      overlay.addEventListener("click", event => {
        event.stopPropagation();
        if (event.target === overlay) finish(null);
      });

      dialog.append(
        el("p", "text-sm font-semibold", title),
        el(
          "div",
          "flex items-center gap-2",
          "",
          input,
          ...(suffix ? [el("span", "text-sm text-muted", suffix)] : [])
        ),
        el("div", "flex justify-end gap-2", "", cancel, ok)
      );
      overlay.append(dialog);
      document.body.append(overlay);

      input.focus();
      input.select();
    });

  const askFileName = defaultName =>
    askName({
      title: "Tên tệp xuất",
      defaultValue: defaultName,
      suffix: ".json",
      okText: "Xuất",
      clean: raw => safeFileName(raw, defaultName)
    });

  let suppressClick = false;
  const releaseClick = () => setTimeout(() => { suppressClick = false; }, 60);

  const sentenceString = () => blocksToText(sentenceBlocks);

  const commitWords = () => {
    persist();
    renderWords();
    refreshSentenceUi();
  };

  function unlinkWords(ids) {
    let changed = false;

    editor.querySelectorAll("[data-wid]").forEach(node => {
      if (ids.has(node.dataset.wid)) {
        delete node.dataset.wid;
        changed = true;
      }
    });

    if (changed) syncFromEditor();
  }

  const dropWords = ids => {
    unlinkWords(ids);
    docWords = docWords.filter(word => !ids.has(word.id));
    commitWords();
  };

  const deleteWord = id => dropWords(new Set([id]));

  const clearAllWords = () => {
    if (!docWords.length) return;

    if (!window.confirm(`Xóa tất cả ${docWords.length} từ trong danh sách từ của tài liệu này?`)) {
      return;
    }

    const count = docWords.length;
    dropWords(new Set(docWords.map(word => word.id)));
    showToast(`Đã xóa ${count} từ`);
  };

  const wordsCount = el("span", "text-sm font-semibold", "0 từ");
  const wordsList = el("div", "flex flex-wrap gap-3 pt-3 min-h-16 rounded-2xl transition");

  const clearWordsBtn = mkBtn(
    toolBtnClass,
    "Xóa nhanh tất cả từ trong danh sách từ của tài liệu này",
    '<i data-lucide="trash-2" class="size-4"></i><span class="text-sm font-semibold">Xóa tất cả</span>'
  );
  clearWordsBtn.onclick = event => {
    event.stopPropagation();
    clearAllWords();
  };

  const buildWordCard = item => {
    const card = el(
      "div",
      "flex items-center gap-1 pl-3 pr-1 py-2 max-w-full min-w-0 rounded-2xl select-none " +
      KEY + " " + WORD_CARD
    );

    card.title = "Kéo một màu hoặc nút định dạng (đậm, nghiêng, gạch chân, hoa, thường) vào thẻ";
    card.dataset.word = item.id;

    const remove = mkBtn(
      iconBtn,
      `Xóa từ ${item.word}`,
      '<i data-lucide="trash-2" class="size-4"></i>'
    );
    remove.onclick = event => {
      event.stopPropagation();
      deleteWord(item.id);
    };

    const labelEl = el("span", "px-1 min-w-0 truncate whitespace-nowrap", item.word);
    labelEl.title = item.word;
    labelEl.style.fontSize = "var(--doc-size, 18px)";
    labelEl.style.fontFamily = "var(--doc-font, inherit)";
    labelEl.style.textTransform = "none";
    labelEl.style.fontWeight = item.bold ? "700" : "400";
    labelEl.style.fontStyle = item.italic ? "italic" : "normal";
    if (item.underline) labelEl.style.textDecoration = "underline";
    paintText(labelEl, item.color);

    card.append(labelEl, remove);
    return card;
  };

  function renderWords() {
    wordsCount.textContent = `${docWords.length} từ`;
    const clipTitle =
      "Bộ nhớ tạm: màu và danh sách từ" + (docWords.length ? ` (${docWords.length} từ)` : "");
    clipboardBtn.title = clipTitle;
    clipboardBtn.setAttribute("aria-label", clipTitle);
    clearWordsBtn.disabled = !docWords.length;

    if (!docWords.length) {
      wordsList.replaceChildren(
        el(
          "p",
          "w-full py-6 text-center text-muted",
          "Tài liệu này chưa có từ nào. Bôi đen chữ trong tệp rồi bấm nút cắt để tạo thẻ từ."
        )
      );
    } else {
      wordsList.replaceChildren(...docWords.map(buildWordCard));
    }

    if (window.lucide) lucide.createIcons();
  }

  const RT_STYLE = `
* { scrollbar-width: none; -ms-overflow-style: none; }
*::-webkit-scrollbar { display: none; width: 0; height: 0; }
.rt-doc { caret-color: var(--text); }
.rt-doc > * { scroll-margin-top: 9rem; }
.rt-doc ::selection { background: color-mix(in srgb, ${SELECT_BLUE} 45%, transparent); }
.rt-doc p, .rt-doc h1, .rt-doc h2, .rt-doc h3, .rt-doc h4 { margin: 0; }
.rt-doc ul { list-style: disc; padding-left: 1.75rem; margin: .25em 0; }
.rt-doc ol { list-style: decimal; padding-left: 1.75rem; margin: .25em 0; }
.rt-doc li[style*="text-align: center"], .rt-doc li[style*="text-align: right"],
.rt-doc ul[style*="text-align: center"], .rt-doc ul[style*="text-align: right"],
.rt-doc ol[style*="text-align: center"], .rt-doc ol[style*="text-align: right"] {
  list-style-position: inside;
}
.rt-tool[aria-pressed="true"] { background: color-mix(in srgb, var(--text) 16%, transparent); }
.rt-doc.rt-doc { font-size: var(--doc-size, 18px); font-family: var(--doc-font, inherit); }
.rt-doc [data-kind="cite"]::before { content: "— "; }
.rt-doc [data-kind="cite"]::after { content: " —"; }
.rt-doc [data-nid] {
  border-bottom: 1px dotted color-mix(in srgb, var(--text) 60%, transparent); cursor: help;
}
.rt-doc [data-nid][data-n]::after {
  content: attr(data-n); font-size: .65em; font-weight: 700; line-height: 0;
  vertical-align: super; margin-left: 1px; font-style: normal; text-decoration: none;
  color: ${SELECT_BLUE}; -webkit-text-fill-color: ${SELECT_BLUE}; background: none;
  user-select: none;
}
.rt-doc table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: .5em 0; }
.rt-doc td {
  border: 1px solid color-mix(in srgb, var(--text) 30%, transparent);
  padding: .35em .5em; vertical-align: top; overflow-wrap: anywhere;
}
.rt-doc table[data-header="1"] tr:first-child td {
  font-weight: 700; background: color-mix(in srgb, var(--text) 8%, transparent);
}
.rt-doc figure[data-kind="img"] { margin: .5em 0; }
.rt-doc .rt-wrap { position: relative; display: inline-block; max-width: 100%; vertical-align: top; }
.rt-doc .rt-wrap img { display: block; width: 100%; height: auto; pointer-events: none; }
.rt-doc .rt-mask { position: absolute; inset: 0; pointer-events: none; }
.rt-doc .rt-broken { min-height: 3rem; outline: 2px dashed color-mix(in srgb, var(--text) 40%, transparent); }
.rt-doc figure.rt-img-sel .rt-wrap { outline: 3px solid ${SELECT_BLUE}; outline-offset: 2px; }
.rt-doc .rt-handle {
  position: absolute; right: -9px; bottom: -9px; width: 16px; height: 16px;
  border-radius: 9999px; background: ${SELECT_BLUE}; border: 2px solid #fff;
  cursor: nwse-resize; touch-action: none; box-shadow: 0 1px 4px rgba(0,0,0,.4);
}
.rt-doc figure[style*="text-align: right"] .rt-handle { right: auto; left: -9px; cursor: nesw-resize; }
`;

  if (!document.getElementById("rt-style")) {
    const style = el("style", "", RT_STYLE);
    style.id = "rt-style";
    document.head.append(style);
  }

  const dynStyle = document.getElementById("rt-style-dynamic") || el("style", "");
  dynStyle.id = "rt-style-dynamic";
  document.head.append(dynStyle);

  try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch { }

  const sentenceEl = el(
    "section",
    "mx-auto self-center mt-2 w-[min(98vw,1760px)] max-w-full flex flex-col gap-3"
  );
  const sentenceTitle = el(
    "p",
    "mr-auto min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted"
  );

  const iconToolClass = toolBtnClass.replace("px-3", "w-8 justify-center px-0") + " rt-tool";

  const makeToolBtn = (icon, title) =>
    mkBtn(iconToolClass, title, `<i data-lucide="${icon}" class="size-4"></i>`);

  const bind = (btn, fn) => {
    btn.addEventListener("mousedown", event => event.preventDefault());
    btn.onclick = event => {
      event.stopPropagation();
      fn();
    };
    return btn;
  };

  const makePipette = (title, className, { onInput, onChange }) => {
    const wrap = el("span", "relative inline-flex shrink-0");

    const button = mkBtn(className, title, '<i data-lucide="pipette" class="size-4"></i>');

    const input = el("input", "absolute inset-0 size-full opacity-0 pointer-events-none");
    input.type = "color";
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    if (onInput) input.addEventListener("input", () => onInput(input.value));
    if (onChange) input.addEventListener("change", () => onChange(input.value));

    button.addEventListener("mousedown", event => event.preventDefault());
    button.onclick = event => {
      event.stopPropagation();

      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
          return;
        } catch { }
      }

      input.click();
    };

    wrap.append(button, input);
    return { wrap, input };
  };

  const boldBtn = makeToolBtn("bold", "In đậm (Ctrl+B)");
  const italicBtn = makeToolBtn("italic", "In nghiêng (Ctrl+I)");
  const underlineBtn = makeToolBtn("underline", "Gạch chân (Ctrl+U)");
  const plainBtn = makeToolBtn("remove-formatting", "Xóa định dạng của chữ đang chọn");
  const upperBtn = makeToolBtn("case-upper", "VIẾT HOA chữ đang chọn");
  const lowerBtn = makeToolBtn("case-lower", "viết thường chữ đang chọn");
  const splitBtn = makeToolBtn(
    "scissors",
    "Tạo thẻ chữ từ chữ đang bôi đen và đưa vào danh sách từ của tài liệu (chữ vẫn được giữ trong tệp và liên kết màu với thẻ)"
  );

  const selectClass =
    `h-8 px-2 rounded-full text-sm font-semibold bg-bg text-text ${BORDER} ${FOCUS}`;

  const fontSelect = el("select", `${selectClass} w-[8.5rem]`);
  fontSelect.title = "Phông chữ (bôi đen chữ, hoặc đặt con trỏ trong tiêu đề)";
  fontSelect.setAttribute("aria-label", "Phông chữ");
  fontSelect.append(
    new Option("Mặc định", ""),
    ...FONTS.map(font => {
      const option = new Option(font.label, font.id);
      option.style.fontFamily = font.css;
      return option;
    })
  );
  const defaultFontOption = fontSelect.options[0];
  let defaultSizeItem = null;

  const sizeWrap = el("div", "relative");
  const sizeLabel = el("span", "truncate", "Mặc định");
  const sizeBtn = el(
    "button",
    `${selectClass} w-[6.5rem] flex items-center justify-between gap-1`
  );
  sizeBtn.type = "button";
  sizeBtn.title = "Cỡ chữ (bôi đen chữ, hoặc đặt con trỏ trong tiêu đề)";
  sizeBtn.setAttribute("aria-label", "Cỡ chữ");
  sizeBtn.append(sizeLabel);
  sizeBtn.insertAdjacentHTML("beforeend", '<i data-lucide="chevron-down" class="size-4 shrink-0"></i>');

  const sizeMenu = el(
    "div",
    "absolute left-0 top-full mt-1 z-50 hidden max-h-60 w-full overflow-y-auto " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
    `rounded-xl bg-bg text-text p-1 ${SHADOW} ${BORDER}`
  );

  const closeSizeMenu = () => sizeMenu.classList.add("hidden");

  const setSizeValue = value => {
    sizeLabel.textContent = `${value || docSize} px`;
  };

  [["", `Mặc định (${docSize} px)`], ...FONT_SIZES.map(n => [String(n), `${n} px`])].forEach(([value, text]) => {
    const item = el(
      "button",
      "w-full text-left rounded-lg px-2 py-1 text-sm " +
      "hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)]",
      text
    );
    item.type = "button";
    if (value === "") defaultSizeItem = item;
    item.addEventListener("mousedown", event => event.preventDefault());
    item.onclick = event => {
      event.stopPropagation();
      closeSizeMenu();
      setSizeValue(value);
      if (!applyInline("size", Number(value) || null, true)) {
        setDocDefaults({ size: Number(value) || DEFAULT_DOC_SIZE });
      }
    };
    sizeMenu.append(item);
  });

  sizeBtn.addEventListener("mousedown", event => event.preventDefault());
  sizeBtn.onclick = event => {
    event.stopPropagation();
    sizeMenu.classList.toggle("hidden");
  };
  document.addEventListener("click", closeSizeMenu);

  sizeWrap.append(sizeBtn, sizeMenu);

  const defaultFontName = () => FONT_MAP.get(docFont || DEFAULT_DOC_FONT).label;

  const refreshDefaultsUi = () => {
    if (defaultSizeItem) defaultSizeItem.textContent = `Mặc định (${docSize} px)`;
    defaultFontOption.textContent = `Mặc định (${defaultFontName()})`;
    updateToolbarState();
    if (!selectionInEditor()) setSizeValue("");
  };

  const setDocDefaults = ({ size, font }) => {
    if (size !== undefined) docSize = cleanSize(size) ?? DEFAULT_DOC_SIZE;
    if (font !== undefined) docFont = cleanFont(font) ?? DEFAULT_DOC_FONT;

    applyDocDefaults();
    fitPoems();
    persist();
    refreshDefaultsUi();
    showToast(
      `Chữ mặc định: ${docSize} px · ${defaultFontName()} (áp dụng cho thẻ chữ và tệp)`
    );
  };

  const headingBtns = [1, 2, 3, 4].map(level =>
    makeToolBtn(`heading-${level}`, `Tiêu đề cấp ${level}`)
  );

  const ALIGN_DEFS = [
    ["justifyLeft", "align-left", "Căn trái"],
    ["justifyCenter", "align-center", "Căn giữa"],
    ["justifyRight", "align-right", "Căn phải"],
    ["justifyFull", "align-justify", "Căn đều hai bên"]
  ];
  const alignBtns = ALIGN_DEFS.map(([, icon, title]) => makeToolBtn(icon, title));

  const bulletBtn = makeToolBtn("list", "Danh sách dấu đầu dòng");
  const numberBtn = makeToolBtn("list-ordered", "Danh sách đánh số");

  const indentBtn = makeToolBtn("indent-increase", "Thụt đầu dòng (lùi từ đầu tiên vào)");
  const quoteBtn = makeToolBtn("quote", "Trích dẫn (căn giữa, in nghiêng; có thể ghi tên tác giả)");
  const citeBtn = makeToolBtn("pen-line", "Thêm tác giả / chú thích dưới trích dẫn (căn phải, có dấu — hai đầu)");
  const poemBtn = makeToolBtn(
    "feather",
    "Thơ tự do: chữ căn trái, cả bài thơ nằm giữa trang (mỗi dòng một đoạn, để trống một dòng để ngắt khổ)"
  );
  const dropcapBtn = makeToolBtn(
    "book-text",
    "Đoạn tiểu thuyết: chữ cái đầu to bằng 3 dòng, 3 dòng đầu viết bên phải, từ dòng 4 viết xuống dưới chữ cái"
  );
  const imageBtn = makeToolBtn("image", "Chèn ảnh (SVG/PNG từ CDN hoặc tệp)");
  const tableBtn = makeToolBtn("table", "Chèn bảng");
  const moveUpBtn = makeToolBtn("arrow-up", "Chuyển đoạn lên trên (Alt+↑)");
  const moveDownBtn = makeToolBtn("arrow-down", "Chuyển đoạn xuống dưới (Alt+↓)");

  const saveSentenceBtn = makeToolBtn("save", "Lưu tệp (Ctrl+S)");
  const copySentenceBtn = makeToolBtn("copy", "Sao chép nội dung tệp");
  const clearSentenceBtn = makeToolBtn("eraser", "Xóa nội dung tệp");
  const exportSentenceBtn = makeToolBtn("download", "Xuất tài liệu ra tệp JSON (giữ Shift để đổi tên tệp)");
  const importSentenceBtn = makeToolBtn("upload", "Nhập tài liệu từ tệp JSON");
  const legendBtn = makeToolBtn("palette", "Đặt chú giải màu");
  const advBtn = makeToolBtn(
    "sliders-horizontal",
    "Tùy chỉnh nâng cao: tiêu đề, đoạn văn, trích dẫn, thơ, chữ cái đầu to, lề"
  );
  advBtn.setAttribute("aria-pressed", "false");
  const noteBtn = makeToolBtn(
    "superscript",
    "Chú giải nghĩa (chỉ số trên): bôi đen chữ rồi nhập nghĩa; đặt con trỏ vào chữ đã chú giải để sửa"
  );
  const notesBtn = makeToolBtn("book-open", "Xem tất cả chú giải nghĩa");

  const outlineToggleBtn = makeToolBtn(
    "list-tree",
    "Bật/tắt mục lục (hiện bên trái, kéo tiêu đề để sắp xếp lại nội dung)"
  );
  const legendToggleBtn = makeToolBtn("tags", "Bật/tắt chú giải màu (hiện bên trái)");
  outlineToggleBtn.setAttribute("aria-pressed", String(showOutline));
  legendToggleBtn.setAttribute("aria-pressed", String(showLegend));

  const clipboardBtn = makeToolBtn(
    "clipboard",
    "Bộ nhớ tạm: màu và danh sách từ (kéo thả trong màn hình này)"
  );

  const filesLabel = el("span", "text-sm font-semibold", "Tệp");
  const filesBtn = mkBtn(
    toolBtnClass,
    "Danh sách tệp đã lưu",
    '<i data-lucide="folder-open" class="size-4"></i>'
  );
  filesBtn.append(filesLabel);

  const sentenceFile = el("input", "hidden");
  sentenceFile.type = "file";
  sentenceFile.accept = ".json,application/json";
  sentenceFile.setAttribute("aria-hidden", "true");

  const editor = el(
    "div",
    "rt-doc min-h-[min(60vh,28rem)] w-full px-3 py-2 rounded-2xl " +
    "bg-[color-mix(in_srgb,var(--text)_4%,transparent)] " +
    "text-lg leading-relaxed outline-none " +
    "whitespace-pre-wrap break-words " +
    "empty:before:content-[attr(data-placeholder)] empty:before:text-muted " +
    "empty:before:pointer-events-none"
  );
  editor.contentEditable = "true";
  editor.spellcheck = false;
  editor.dataset.placeholder = "Gõ nội dung tại đây…";
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.setAttribute("aria-label", "Soạn tệp");

  const setShown = (node, shown) => {
    node.style.display = shown ? "" : "none";
  };

  function fitPoems() {
    let group = [];

    const flush = () => {
      if (!group.length) return;

      group.forEach(node => {
        node.style.width = "max-content";
        node.dataset.pfit = "1";
      });

      const width = Math.ceil(
        Math.max(0, ...group.map(node => node.getBoundingClientRect().width))
      );

      group.forEach(node => {
        node.style.width = `${width}px`;
      });

      group = [];
    };

    [...editor.children].forEach(node => {
      if (node.dataset?.kind === "poem") {
        group.push(node);
        return;
      }

      flush();

      if (node.dataset?.pfit) {
        node.style.width = "";
        delete node.dataset.pfit;
      }
    });

    flush();
  }

  let poemFitWidth = 0;
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      const width = editor.clientWidth;
      if (width === poemFitWidth) return;
      poemFitWidth = width;
      fitPoems();
    }).observe(editor);
  }

  const applyDocStyle = () => {
    dynStyle.textContent = docStyleCss(docStyle);

    const p = docStyle.page;
    editor.style.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;

    fitPoems();
  };

  const OUTLINE_CLASS =
    "min-w-0 w-full max-h-[40vh] overflow-y-auto overflow-x-hidden " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
    "lg:max-h-[calc(100vh-2rem)] lg:sticky lg:top-4 lg:self-start " +
    "flex flex-col gap-4 py-3 pr-2 lg:col-start-1 lg:row-start-1";

  const outlineAside = el("div", "flex flex-col gap-2");
  setShown(outlineAside, false);
  const outlineList = el("nav", "flex flex-col");
  outlineAside.append(
    el("p", "px-2 text-xs font-semibold uppercase tracking-wide text-muted", "Mục lục"),
    outlineList
  );

  const ADV_CLASS =
    "min-w-0 w-full max-h-[60vh] overflow-y-auto overflow-x-hidden " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
    "lg:max-h-[calc(100vh-2rem)] lg:sticky lg:top-4 lg:self-start " +
    `flex flex-col gap-2 p-3 rounded-2xl border-2 border-dashed ${DIVIDER} ` +
    "lg:col-start-3 lg:row-start-1";

  const advAside = el("aside", ADV_CLASS);
  setShown(advAside, false);

  const styleSyncers = [];
  const refreshStyleInputs = () => styleSyncers.forEach(fn => fn());

  const commitStyle = () => {
    applyDocStyle();
    schedulePersist();
  };

  const buildStyleField = (group, key, label, unit) => {
    const spec = STYLE_SCHEMA[group][key];
    const text = unit ? `${label} (${unit})` : label;
    let input;

    if (spec.t === "num") {
      input = el("input", `${FIELD} w-20 px-2`);
      input.type = "number";
      input.min = String(spec.min);
      input.max = String(spec.max);
      input.step = String(spec.step);
      input.setAttribute("aria-label", `${label} — ${group}`);

      input.addEventListener("input", () => {
        if (input.value === "") return;
        const n = Number(input.value);
        if (!Number.isFinite(n)) return;
        docStyle[group][key] = Math.round(clamp(n, spec.min, spec.max) * 100) / 100;
        commitStyle();
      });
      input.addEventListener("change", () => {
        input.value = String(docStyle[group][key]);
      });
      input.addEventListener("keydown", event => {
        if (!event.isComposing && event.key === "Enter") input.blur();
      });

      styleSyncers.push(() => {
        if (document.activeElement !== input) input.value = String(docStyle[group][key]);
      });
    } else if (spec.t === "pick") {
      input = el("select", `${selectClass} w-28`);
      input.setAttribute("aria-label", `${label} — ${group}`);
      spec.opts.forEach(value => input.append(new Option(STYLE_PICK_LABELS[value] ?? value, value)));

      input.addEventListener("change", () => {
        docStyle[group][key] = cleanStyleValue(spec, input.value);
        commitStyle();
      });

      styleSyncers.push(() => {
        input.value = docStyle[group][key];
      });
    } else {
      input = el("input", "size-4 accent-[#3b82f6]");
      input.type = "checkbox";
      input.setAttribute("aria-label", `${label} — ${group}`);

      input.addEventListener("change", () => {
        docStyle[group][key] = input.checked;
        commitStyle();
      });

      styleSyncers.push(() => {
        input.checked = Boolean(docStyle[group][key]);
      });
    }

    return el(
      "label",
      "flex items-center justify-between gap-2 text-sm",
      "",
      el("span", "min-w-0 truncate", text),
      input
    );
  };

  const buildStyleSection = ([title, group, fields], open) => {
    const details = el("details", `rounded-xl ${BORDER}`);
    details.open = open;

    const summary = el(
      "summary",
      "cursor-pointer select-none rounded-xl px-3 py-2 text-sm font-semibold " +
      `hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] ${FOCUS}`,
      title
    );

    const reset = el("button", `${toolBtnClass} justify-center`, "Đặt lại mục này");
    reset.type = "button";
    reset.onclick = event => {
      event.stopPropagation();
      docStyle[group] = cleanDocStyle({})[group];
      commitStyle();
      refreshStyleInputs();
    };

    details.append(
      summary,
      el(
        "div",
        "flex flex-col gap-2 px-3 pb-3 pt-1",
        "",
        ...fields.map(([key, label, unit]) => buildStyleField(group, key, label, unit)),
        reset
      )
    );

    return details;
  };

  const resetAllStyle = () => {
    docStyle = cleanDocStyle({});
    commitStyle();
    refreshStyleInputs();
    showToast("Đã đặt lại toàn bộ tùy chỉnh nâng cao");
  };

  const advResetBtn = mkBtn(
    `${toolBtnClass} shrink-0`,
    "Đặt lại tất cả thông số về mặc định",
    '<i data-lucide="rotate-ccw" class="size-4"></i>'
  );
  advResetBtn.onclick = event => {
    event.stopPropagation();
    resetAllStyle();
  };

  const advCloseBtn = mkBtn(
    `${iconBtn} text-muted`,
    "Đóng tùy chỉnh nâng cao",
    '<i data-lucide="x" class="size-4"></i>'
  );

  advAside.append(
    el(
      "div",
      "flex items-center gap-2",
      "",
      el("p", "min-w-0 flex-1 truncate text-sm font-semibold", "Tùy chỉnh nâng cao"),
      advResetBtn,
      advCloseBtn
    ),
    el(
      "p",
      "text-xs text-muted",
      "Thông số áp dụng ngay cho toàn bộ tệp, được lưu cùng trình duyệt và đi kèm khi xuất JSON."
    ),
    ...STYLE_SECTIONS.map((section, i) => buildStyleSection(section, i === 0))
  );

  let advOpen = false;
  const setAdvOpen = open => {
    advOpen = open;
    setShown(advAside, open);
    advBtn.setAttribute("aria-pressed", String(open));
  };
  advCloseBtn.onclick = event => {
    event.stopPropagation();
    setAdvOpen(false);
  };

  refreshStyleInputs();
  applyDocStyle();

  let modal = null;

  const closeModal = () => {
    if (!modal) return;
    document.removeEventListener("keydown", modal.onKey, true);
    modal.overlay.remove();
    modal = null;
  };

  const openModal = (title, renderBody, kind, footer = null, wide = false) => {
    closeModal();

    const overlay = el(
      "div",
      "fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
    );
    const dialog = el(
      "div",
      `w-full ${wide ? "max-w-3xl max-h-[88vh]" : "max-w-md max-h-[80vh]"} flex flex-col gap-3 ` +
      `p-5 rounded-2xl bg-bg text-text ${SHADOW}`
    );
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", title);

    const closeBtn = mkBtn(
      `${iconBtn} text-muted`,
      "Đóng",
      '<i data-lucide="x" class="size-4"></i>'
    );
    closeBtn.onclick = event => {
      event.stopPropagation();
      closeModal();
    };

    const body = el("div", "min-h-0 flex-1 overflow-y-auto pr-1");

    dialog.append(
      el(
        "div",
        "flex items-center gap-2",
        "",
        el("p", "min-w-0 flex-1 truncate text-sm font-semibold", title),
        closeBtn
      ),
      body,
      ...(footer ? [footer] : [])
    );
    overlay.append(dialog);

    overlay.addEventListener("click", event => {
      event.stopPropagation();
      if (event.target === overlay && !suppressClick) closeModal();
    });

    const onKey = event => {
      if (event.key !== "Escape" || dragActive) return;
      const focus = document.activeElement;
      if (focus instanceof HTMLInputElement && !overlay.contains(focus)) return;
      event.stopPropagation();
      closeModal();
    };
    document.addEventListener("keydown", onKey, true);

    const refresh = () => {
      renderBody(body);
      if (window.lucide) lucide.createIcons();
    };

    modal = { overlay, kind, refresh, onKey };
    document.body.append(overlay);
    refresh();
  };

  const legendStrip = el(
    "div",
    "flex flex-col gap-1 text-sm"
  );
  setShown(legendStrip, false);

  const usedSentenceColors = () => {
    const seen = new Set();

    sentenceBlocks.forEach(block => {
      if (block.type === "img") {
        if (block.color) seen.add(block.color);
        return;
      }

      (block.type === "table" ? block.rows.flat(2) : block.runs).forEach(run => {
        if (run.gradient) seen.add(GRADIENT);
        else if (run.color) seen.add(run.color);
      });
    });

    return [...seen];
  };

  let legendSig = null;

  const refreshLegendStrip = () => {
    setShown(legendStrip, showLegend);
    if (!showLegend) return;

    const items = usedSentenceColors()
      .filter(color => colorLegend[color])
      .map(color => [color, colorLegend[color]]);

    const sig = JSON.stringify(items);
    if (sig === legendSig) return;
    legendSig = sig;

    legendStrip.replaceChildren(
      el("span", "px-2 text-xs font-semibold uppercase tracking-wide text-muted", "Chú giải"),
      ...(items.length
        ? items.map(([color, label]) => {
          const chip = mkBtn(
            "flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left text-sm " +
            `hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] ${FOCUS}`,
            "Sửa chú giải màu"
          );

          const dot = el("span", "mt-1 size-3 shrink-0 rounded-full");
          paintBackground(dot, color);

          chip.append(dot, el("span", "min-w-0 break-words", label));
          chip.onclick = event => {
            event.stopPropagation();
            openLegendModal();
          };
          return chip;
        })
        : [
          el(
            "p",
            "px-2 py-1 text-xs text-muted",
            "Chưa có chú giải cho màu đang dùng. Bấm nút bảng màu trên thanh công cụ để đặt ý nghĩa cho màu."
          )
        ])
    );
  };

  const group = (...buttons) => el("div", "flex items-center gap-0.5", "", ...buttons);

  let selectedImg = null;
  let pickedAt = 0;

  const barClass =
    "flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 rounded-2xl " +
    "border border-[color-mix(in_srgb,var(--text)_20%,transparent)]";

  const barLabel = text =>
    el("span", "text-xs font-semibold uppercase tracking-wide text-muted", text);

  const widthRange = el("input", "w-28 accent-[#3b82f6]");
  widthRange.type = "range";
  widthRange.min = String(MIN_IMG_W);
  widthRange.max = "800";
  widthRange.step = "4";
  widthRange.setAttribute("aria-label", "Chiều rộng ảnh");

  const widthNum = el("input", `${FIELD} w-20 px-2`);
  widthNum.type = "number";
  widthNum.min = String(MIN_IMG_W);
  widthNum.max = String(MAX_IMG_W);
  widthNum.setAttribute("aria-label", "Chiều rộng ảnh (px)");

  const imgPalette = [SELECT_BLUE, ...PALETTE.filter(c => c !== SELECT_BLUE)].map(color => {
    const dot = bind(
      mkBtn(
        `size-6 shrink-0 rounded-full ${BORDER} transition hover:scale-110 ${FOCUS}`,
        `Đổi màu ảnh ${color}`
      ),
      () => setImageColor(color)
    );
    dot.style.backgroundColor = color;
    return dot;
  });

  const imgPipette = makePipette("Màu ảnh tùy chọn", iconToolClass, {
    onChange: value => setImageColor(value)
  });
  imgPipette.input.value = SELECT_BLUE;

  const imgGradientBtn = bind(mkBtn(iconToolClass, "Ảnh màu gradient như logo Mixer"), () =>
    setImageColor(GRADIENT)
  );
  const imgGradientDot = el("span", "size-4 rounded-full");
  imgGradientDot.style.backgroundImage = GRADIENT_CSS;
  imgGradientBtn.append(imgGradientDot);

  const imgResetBtn = bind(makeToolBtn("rotate-ccw", "Trả về màu gốc của ảnh"), () =>
    setImageColor(null)
  );

  const imgAlignBtns = [
    ["left", "align-left", "Căn trái ảnh"],
    ["center", "align-center", "Căn giữa ảnh"],
    ["right", "align-right", "Căn phải ảnh"]
  ].map(([align, icon, title]) => [
    bind(makeToolBtn(icon, title), () => setImageAlign(align)),
    align
  ]);

  const imgUpBtn = bind(makeToolBtn("arrow-up", "Chuyển ảnh lên trên"), () => moveImage(-1));
  const imgDownBtn = bind(makeToolBtn("arrow-down", "Chuyển ảnh xuống dưới"), () => moveImage(1));
  const imgDeleteBtn = bind(makeToolBtn("trash-2", "Xóa ảnh (Delete)"), () => removeSelectedImage());

  const imgBar = el(
    "div",
    barClass,
    "",
    barLabel("Ảnh"),
    widthRange,
    widthNum,
    el("span", "text-xs text-muted", "px"),
    el("div", "flex items-center gap-1.5", "", ...imgPalette, imgPipette.wrap, imgGradientBtn, imgResetBtn),
    group(...imgAlignBtns.map(([btn]) => btn)),
    group(imgUpBtn, imgDownBtn, imgDeleteBtn)
  );
  setShown(imgBar, false);

  const tableTool = (text, title, fn) => {
    const btn = bind(mkBtn(toolBtnClass + " rt-tool", title, ""), fn);
    btn.textContent = text;
    return btn;
  };

  const headerBtn = tableTool("Hàng tiêu đề", "Bật/tắt hàng tiêu đề", () => {
    const cell = cellEl();
    if (!cell) return;
    const table = cell.closest("table");
    if (table.dataset.header === "1") delete table.dataset.header;
    else table.dataset.header = "1";
    syncFromEditor();
    syncBars();
  });

  const tableBar = el(
    "div",
    barClass,
    "",
    barLabel("Bảng"),
    tableTool("+ Hàng", "Thêm hàng bên dưới", () => withCell(addRow)),
    tableTool("+ Cột", "Thêm cột bên phải", () => withCell(addCol)),
    tableTool("Xóa hàng", "Xóa hàng hiện tại", () => withCell(delRow)),
    tableTool("Xóa cột", "Xóa cột hiện tại", () => withCell(delCol)),
    headerBtn,
    tableTool("Xóa bảng", "Xóa cả bảng", () => withCell((td, table) => table.remove())),
    el("span", "text-xs text-muted", "Tab: sang ô kế tiếp")
  );
  setShown(tableBar, false);

  const TOOL_ROW_CLASS =
    "flex flex-wrap items-center justify-between gap-x-2 gap-y-2";

  const toolRow = el(
    "div",
    "flex flex-col gap-2",
    "",
    el(
      "div",
      TOOL_ROW_CLASS,
      "",
      group(boldBtn, italicBtn, underlineBtn, plainBtn),
      group(upperBtn, lowerBtn),
      group(fontSelect, sizeWrap),
      group(...headingBtns),
      group(noteBtn, notesBtn, splitBtn, clipboardBtn)
    ),
    el(
      "div",
      TOOL_ROW_CLASS,
      "",
      group(...alignBtns),
      group(bulletBtn, numberBtn),
      group(indentBtn, quoteBtn, citeBtn, poemBtn, dropcapBtn),
      group(imageBtn, tableBtn),
      group(moveUpBtn, moveDownBtn),
      group(outlineToggleBtn, legendToggleBtn)
    )
  );

  const stickyBar = el(
    "div",
    "sticky top-0 z-30 -mt-2 flex flex-col gap-2 py-2 bg-bg " +
    "border-b border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
    "",
    el(
      "div",
      "flex flex-wrap items-center gap-1",
      "",
      sentenceTitle,
      filesBtn,
      legendBtn,
      advBtn,
      saveSentenceBtn,
      copySentenceBtn,
      clearSentenceBtn,
      exportSentenceBtn,
      importSentenceBtn,
      sentenceFile
    ),
    toolRow,
    imgBar,
    tableBar
  );

  const centerCol = el(
    "div",
    "min-w-0 w-full flex flex-col gap-3 lg:col-start-2 lg:row-start-1",
    "",
    stickyBar,
    editor
  );

  const leftCol = el("aside", OUTLINE_CLASS, "", outlineAside, legendStrip);
  setShown(leftCol, showOutline || showLegend);

  let toolsCollapsed = false;

  const collapseBtn = mkBtn(iconToolClass, "", "");

  const applyCollapse = () => {
    const label = toolsCollapsed ? "Mở rộng thanh công cụ" : "Thu gọn thanh công cụ";

    setShown(toolRow, !toolsCollapsed);
    collapseBtn.title = label;
    collapseBtn.setAttribute("aria-label", label);
    collapseBtn.setAttribute("aria-expanded", String(!toolsCollapsed));
    collapseBtn.innerHTML =
      `<i data-lucide="${toolsCollapsed ? "chevron-down" : "chevron-up"}" class="size-4"></i>`;

    syncBars();
    if (window.lucide) lucide.createIcons();
  };

  bind(collapseBtn, () => {
    toolsCollapsed = !toolsCollapsed;
    applyCollapse();
  });

  stickyBar.children[0].append(collapseBtn);
  applyCollapse();

  bind(advBtn, () => setAdvOpen(!advOpen));

  const workspace = el(
    "div",
    "grid w-full items-start gap-3 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]",
    "",
    centerCol,
    leftCol,
    advAside
  );

  sentenceEl.append(workspace);

  const selectionInEditor = () => {
    const sel = window.getSelection();
    return Boolean(sel && sel.rangeCount && editor.contains(sel.anchorNode));
  };

  const currentBlockEl = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;

    const base = sel.anchorNode;
    const node = base?.nodeType === Node.TEXT_NODE ? base.parentElement : base;
    const block = node?.closest?.("h1,h2,h3,h4,h5,h6,li,p,div");

    return block && block !== editor && editor.contains(block) ? block : null;
  };

  function cellEl() {
    const sel = window.getSelection();
    if (!sel?.rangeCount || !editor.contains(sel.anchorNode)) return null;

    const base = sel.anchorNode;
    const node = base.nodeType === Node.TEXT_NODE ? base.parentElement : base;
    const td = node?.closest?.("td");

    return td && editor.contains(td) ? td : null;
  }

  const caretIn = (node, atStart = true) => {
    if (!node) return;

    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(atStart);

    editor.focus({ preventScroll: true });
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const placeCaretAtEnd = () => {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  let persistTimer = 0;
  const schedulePersist = () => {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => persist(), 250);
  };

  window.addEventListener("pagehide", () => {
    clearTimeout(persistTimer);
    persist();
  });

  const findSaved = id => savedSentences.find(s => s.id === id) || null;
  const currentSaved = () => findSaved(currentSavedId);

  const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const isDirty = () => {
    const saved = currentSaved();

    if (saved) {
      return (
        !sameJson(saved.words, docWords) ||
        !sameJson(withWords(saved.words, () => cleanBlocks(saved.blocks)), sentenceBlocks)
      );
    }

    return Boolean(sentenceString().trim()) || docWords.length > 0;
  };

  const confirmDiscard = () =>
    !isDirty() ||
    window.confirm("Nội dung hiện tại chưa được lưu và sẽ bị thay thế. Tiếp tục?");

  const nameTaken = (name, exceptId = null) =>
    savedSentences.some(
      s => s.id !== exceptId && s.name.toLowerCase() === name.toLowerCase()
    );

  const nextDefaultName = () => {
    let n = savedSentences.length + 1;
    while (nameTaken(`Tệp ${n}`)) n++;
    return `Tệp ${n}`;
  };

  const uniqueName = base => {
    let name = base;
    let n = 2;
    while (nameTaken(name)) name = `${base} (${n++})`;
    return name;
  };

  let outlineSig = null;
  let outlineClickGuard = false;

  const headingEls = () => [...editor.querySelectorAll("h1,h2,h3,h4")];
  const headingLevel = h => Number(h.tagName[1]);
  const sectionNodes = (hs, index) => {
    const level = headingLevel(hs[index]);
    const nodes = [hs[index]];
    let node = hs[index].nextElementSibling;

    while (node && !(/^H[1-4]$/.test(node.tagName) && headingLevel(node) <= level)) {
      nodes.push(node);
      node = node.nextElementSibling;
    }

    return nodes;
  };

  const sectionHeadingEnd = (hs, index) => {
    const level = headingLevel(hs[index]);
    let end = index + 1;
    while (end < hs.length && headingLevel(hs[end]) > level) end++;
    return end;
  };

  const flashHeading = index => {
    const heading = headingEls()[index];
    if (!heading) return;

    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });

    if (!reduceMotion) {
      heading.animate(
        [{ background: "color-mix(in srgb, var(--hl) 35%, transparent)" }, { background: "transparent" }],
        { duration: 900, easing: "ease-out" }
      );
    }
  };

  const goToHeading = index => {
    const heading = headingEls()[index];
    if (!heading) return;

    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    caretIn(heading, false);

    if (!reduceMotion) {
      heading.animate(
        [{ background: "color-mix(in srgb, var(--hl) 35%, transparent)" }, { background: "transparent" }],
        { duration: 900, easing: "ease-out" }
      );
    }
  };

  const moveSection = (from, to, after) => {
    const hs = headingEls();
    const src = hs[from];
    const dest = hs[to];
    if (!src || !dest || from === to) return -1;

    const nodes = sectionNodes(hs, from);
    if (nodes.includes(dest)) return -1;

    let ref = dest;
    if (after) {
      const tail = sectionNodes(hs, to).filter(n => !nodes.includes(n));
      ref = tail[tail.length - 1] ?? dest;
    }

    if (after) ref.after(...nodes);
    else ref.before(...nodes);

    const newIndex = headingEls().indexOf(src);

    normalizeEditor();
    flashHeading(newIndex);
    return newIndex;
  };

  const stepHeading = (index, dir) => {
    const hs = headingEls();
    if (!hs[index]) return;

    const level = headingLevel(hs[index]);
    let j;

    if (dir < 0) {
      j = index - 1;
      while (j >= 0 && headingLevel(hs[j]) > level) j--;
    } else {
      j = sectionHeadingEnd(hs, index);
    }

    if (j < 0 || j >= hs.length || headingLevel(hs[j]) !== level) {
      showToast("Không thể di chuyển thêm");
      return;
    }

    const next = moveSection(index, j, dir > 0);
    if (next >= 0) outlineList.children[next]?.focus();
  };

  const startOutlineDrag = (down, from, label) => {
    if (down.pointerType === "mouse" && down.button !== 0) return;

    const pointerId = down.pointerId;
    const hs = headingEls();
    const end = sectionHeadingEnd(hs, from);

    let dragging = false;
    let ghost = null;
    let target = null;
    let after = false;

    const dimmed = () => [...outlineList.children].slice(from, end);

    const mark = (item, y) => {
      if (target) target.style.boxShadow = "";
      target = null;
      if (!item) return;

      const to = Number(item.dataset.oi);
      if (to >= from && to < end) return;

      const rect = item.getBoundingClientRect();
      after = y > rect.top + rect.height / 2;
      target = item;
      item.style.boxShadow = after
        ? "inset 0 -3px 0 0 var(--hl)"
        : "inset 0 3px 0 0 var(--hl)";
    };

    const begin = () => {
      dragging = true;
      outlineClickGuard = true;

      ghost = el(
        "div",
        `fixed left-0 top-0 z-[90] max-w-[14rem] truncate pointer-events-none px-3 py-1 ` +
        `rounded-lg bg-bg text-text text-sm font-semibold ${BORDER} ${SHADOW}`,
        label || "(Tiêu đề trống)"
      );
      ghost.style.transform = `translate3d(${down.clientX + 12}px, ${down.clientY + 12}px, 0)`;
      document.body.append(ghost);

      dimmed().forEach(node => { node.style.opacity = "0.4"; });

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      window.addEventListener("keydown", onKey);
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
    };

    const finish = drop => {
      cleanup();

      if (!dragging) return;

      const to = target ? Number(target.dataset.oi) : -1;
      const placeAfter = after;

      if (target) target.style.boxShadow = "";
      dimmed().forEach(node => { node.style.opacity = ""; });
      ghost?.remove();

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      setTimeout(() => { outlineClickGuard = false; }, 60);

      if (drop && to >= 0) {
        const next = moveSection(from, to, placeAfter);
        if (next >= 0) showToast("Đã sắp xếp lại mục lục và nội dung tệp");
      }
    };

    const onMove = e => {
      if (e.pointerId !== pointerId) return;

      if (!dragging) {
        if (Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < DRAG_THRESHOLD) return;
        begin();
      }

      ghost.style.transform = `translate3d(${e.clientX + 12}px, ${e.clientY + 12}px, 0)`;

      const item = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-oi]");
      mark(item && outlineList.contains(item) ? item : null, e.clientY);
    };

    const onUp = e => {
      if (e.pointerId === pointerId) finish(true);
    };

    const onCancel = e => {
      if (e.pointerId === pointerId) finish(false);
    };

    const onKey = e => {
      if (e.key === "Escape") finish(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  const refreshOutline = () => {
    setShown(outlineAside, showOutline);
    if (!showOutline) return;

    const items = headingEls().map(h => ({
      level: headingLevel(h),
      text: h.textContent.replace(/\u200b/g, "").trim()
    }));

    const sig = items.map(i => `${i.level}:${i.text}`).join("\n");
    if (sig === outlineSig) return;
    outlineSig = sig;

    if (!items.length) {
      outlineList.replaceChildren(
        el(
          "p",
          "px-2 py-1 text-xs text-muted",
          "Chưa có tiêu đề. Dùng nút H1–H4 trên thanh công cụ để tạo tiêu đề."
        )
      );
      return;
    }

    outlineList.replaceChildren(
      ...items.map((item, index) => {
        const button = el(
          "button",
          "flex w-full items-center gap-1 rounded-lg py-1 pr-2 text-left text-sm text-text " +
          `hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] ${FOCUS} ` +
          (item.level === 1 ? "font-bold" : item.level === 2 ? "font-semibold" : "")
        );
        button.type = "button";
        button.dataset.oi = String(index);
        button.title = `${item.text || "(Tiêu đề trống)"}\nKéo để sắp xếp lại (hoặc Alt+↑/↓)`;
        button.style.paddingLeft = `${0.25 + (item.level - 1) * 0.75}rem`;

        const grip = el("span", "shrink-0 cursor-grab select-none leading-none text-muted opacity-60", "⋮⋮");
        grip.dataset.grip = "1";
        grip.style.touchAction = "none";

        button.append(grip, el("span", "min-w-0 flex-1 truncate", item.text || "(Tiêu đề trống)"));

        button.addEventListener("pointerdown", event => {
          if (event.pointerType === "touch" && !event.target.closest("[data-grip]")) return;
          startOutlineDrag(event, index, item.text);
        });

        button.onclick = event => {
          event.stopPropagation();
          if (outlineClickGuard) return;
          goToHeading(index);
        };

        button.addEventListener("keydown", event => {
          if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            event.preventDefault();
            stepHeading(index, event.key === "ArrowUp" ? -1 : 1);
          }
        });

        return button;
      })
    );
  };

  const applyPanels = () => {
    setShown(leftCol, showOutline || showLegend);

    outlineToggleBtn.setAttribute("aria-pressed", String(showOutline));
    legendToggleBtn.setAttribute("aria-pressed", String(showLegend));

    outlineSig = null;
    legendSig = null;
    refreshOutline();
    refreshLegendStrip();
  };

  bind(outlineToggleBtn, () => {
    showOutline = !showOutline;
    applyPanels();
    persist();
    showToast(showOutline ? "Đã bật mục lục" : "Đã tắt mục lục");
  });

  bind(legendToggleBtn, () => {
    showLegend = !showLegend;
    applyPanels();
    persist();
    showToast(showLegend ? "Đã bật chú giải màu" : "Đã tắt chú giải màu");
  });

  function refreshSentenceUi() {
    const text = sentenceString();
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;

    const saved = currentSaved();
    sentenceTitle.textContent =
      `Tệp · ${words} từ` + (saved ? ` · ${saved.name}${isDirty() ? " •" : ""}` : "");
    sentenceTitle.title = saved
      ? `Đang mở: ${saved.name}${isDirty() ? " (có thay đổi chưa lưu)" : ""}`
      : "";

    saveSentenceBtn.disabled = !trimmed;
    copySentenceBtn.disabled = !trimmed;
    clearSentenceBtn.disabled = !trimmed && !docWords.length;
    exportSentenceBtn.disabled = !trimmed && !savedSentences.length;

    fitPoems();
    refreshOutline();
    refreshLegendStrip();

    const noteCount = numberNotes(editor).size;
    const notesTitle = noteCount
      ? `Xem tất cả chú giải nghĩa (${noteCount})`
      : "Xem tất cả chú giải nghĩa";
    notesBtn.title = notesTitle;
    notesBtn.setAttribute("aria-label", notesTitle);

    if (modal?.kind === "notes") modal.refresh();
  }

  const syncFromEditor = () => {
    sentenceBlocks = domToBlocks(editor);

    if (
      !sentenceBlocks.length &&
      editor.children.length <= 1 &&
      !editor.textContent &&
      !editor.querySelector("h1,h2,h3,h4,ul,ol,table,figure,[data-kind],[data-indent],[style*='text-align']")
    ) {
      const focused = document.activeElement === editor;
      editor.replaceChildren();
      if (focused) placeCaretAtEnd();
    }

    refreshSentenceUi();
    schedulePersist();
  };

  const setDocument = (blocks, words, savedId = null) => {
    docWords = cleanWords(words);
    sentenceBlocks = cleanBlocks(blocks);
    currentSavedId = savedId;
    renderBlocks(sentenceBlocks, editor);
    renderWords();
    refreshSentenceUi();
    syncBars();
    persist();
  };

  editor.addEventListener("input", event => {
    if (event.isComposing) {
      sentenceBlocks = domToBlocks(editor);
      refreshSentenceUi();
      schedulePersist();
      return;
    }

    if (event.inputType === "insertParagraph") {
      const block = currentBlockEl();
      const prev = block?.previousElementSibling;

      if (block?.dataset.kind === "cite" && prev?.dataset.kind === "cite") {
        delete block.dataset.kind;
      }

      if (block?.dataset.kind === "dropcap" && prev?.dataset.kind === "dropcap") {
        delete block.dataset.kind;
      }
    }

    if (event.inputType === "insertFromDrop") {
      sentenceBlocks = domToBlocks(editor);
      renderBlocks(sentenceBlocks, editor);
      placeCaretAtEnd();
      refreshSentenceUi();
      schedulePersist();
      return;
    }

    syncFromEditor();
  });

  const escapeLinkedEdge = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return;

    const base = sel.anchorNode;
    if (!base || !editor.contains(base)) return;

    const host = base.nodeType === Node.TEXT_NODE ? base.parentElement : base;
    const LINKED = "[data-wid],[data-nid]";
    const probe = document.createRange();

    let span = null;
    let atEnd = false;
    let atStart = false;

    for (
      let n = host?.closest?.(LINKED);
      n && editor.contains(n);
      n = n.parentElement?.closest(LINKED)
    ) {
      probe.selectNodeContents(n);
      probe.setStart(base, sel.anchorOffset);
      const end = !probe.toString();

      probe.selectNodeContents(n);
      probe.setEnd(base, sel.anchorOffset);
      const start = !probe.toString();

      if (!end && !start) break;
      span = n;
      atEnd = end;
      atStart = start;
    }

    if (!span) return;

    const gap = document.createTextNode("\u200b");
    if (atEnd) span.after(gap);
    else span.before(gap);

    const range = document.createRange();
    range.setStart(gap, 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  editor.addEventListener("beforeinput", event => {
    if (event.inputType === "insertText" || event.inputType === "insertParagraph") {
      escapeLinkedEdge();
    }
  });

  editor.addEventListener("compositionstart", escapeLinkedEdge);

  editor.addEventListener("compositionend", () => syncFromEditor());

  editor.addEventListener("blur", () => {
    clearTimeout(persistTimer);
    persist();
  });

  editor.addEventListener("paste", event => {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (text) document.execCommand("insertText", false, text);
  });

  editor.addEventListener("drop", event => {
    if (event.dataTransfer?.files?.length) event.preventDefault();
  });

  let lastSel = null;

  const textOffset = (node, offset) => {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.setEnd(node, offset);
    return range.toString().length;
  };

  const captureSel = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    if (!editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode)) return null;

    const range = sel.getRangeAt(0);
    return {
      start: textOffset(range.startContainer, range.startOffset),
      end: textOffset(range.endContainer, range.endOffset)
    };
  };

  const locateText = (target, preferNext) => {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let remaining = target;
    let last = null;
    let node;

    while ((node = walker.nextNode())) {
      const len = node.nodeValue.length;
      if (remaining < len || (!preferNext && remaining === len)) return [node, remaining];
      remaining -= len;
      last = node;
    }

    return last ? [last, last.nodeValue.length] : [editor, editor.childNodes.length];
  };

  const restoreSel = saved => {
    if (!saved) return;

    editor.focus({ preventScroll: true });

    const collapsed = saved.start === saved.end;
    const [sn, so] = locateText(saved.start, !collapsed);
    const [en, eo] = locateText(saved.end, false);

    const range = document.createRange();
    try {
      range.setStart(sn, so);
      range.setEnd(en, eo);
    } catch {
      return;
    }

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const selectImage = fig => {
    if (!fig) return;

    if (selectedImg && selectedImg !== fig) {
      selectedImg.classList.remove("rt-img-sel");
      if (selectedImg.isConnected) paintImage(selectedImg);
    }

    selectedImg = fig;
    pickedAt = performance.now();
    fig.classList.add("rt-img-sel");
    paintImage(fig);

    editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNode(fig);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    syncBars();
  };

  const deselectImage = () => {
    if (!selectedImg) return;

    const fig = selectedImg;
    selectedImg = null;
    fig.classList.remove("rt-img-sel");
    if (fig.isConnected) paintImage(fig);

    syncBars();
  };

  const keepImageSelection = () => {
    if (!selectedImg) return;
    if (performance.now() - pickedAt < 250) return;

    const sel = window.getSelection();
    const inBar = imgBar.contains(document.activeElement);
    const covered =
      sel?.rangeCount &&
      !sel.isCollapsed &&
      sel.getRangeAt(0).intersectsNode(selectedImg);

    if (!selectedImg.isConnected || !(inBar || covered)) deselectImage();
  };

  const syncImgControls = () => {
    const fig = selectedImg;
    if (!fig) return;

    const w = cleanWidth(fig.dataset.w) ?? DEFAULT_IMG_W;
    widthRange.value = String(Math.min(w, Number(widthRange.max)));
    if (document.activeElement !== widthNum) widthNum.value = String(w);

    const align = fig.style.textAlign || "left";
    imgAlignBtns.forEach(([btn, a]) => btn.setAttribute("aria-pressed", String(a === align)));
  };

  function syncBars() {
    if (selectedImg && !selectedImg.isConnected) selectedImg = null;

    const cell = selectedImg ? null : cellEl();

    setShown(imgBar, Boolean(selectedImg) && !toolsCollapsed);
    setShown(tableBar, Boolean(cell) && !toolsCollapsed);

    if (selectedImg) syncImgControls();
    if (cell) {
      headerBtn.setAttribute("aria-pressed", String(cell.closest("table").dataset.header === "1"));
    }
  }

  const setImageWidth = (fig, value) => {
    const w = clamp(Math.round(Number(value)) || DEFAULT_IMG_W, MIN_IMG_W, MAX_IMG_W);
    fig.dataset.w = String(w);

    const wrap = fig.querySelector(".rt-wrap");
    if (wrap) wrap.style.width = `${w}px`;

    syncImgControls();
  };

  const setImageColor = color => {
    const fig = selectedImg;
    if (!fig) return false;

    if (color) fig.dataset.color = color;
    else delete fig.dataset.color;

    paintImage(fig);
    syncFromEditor();
    return true;
  };

  const setImageAlign = align => {
    const fig = selectedImg;
    if (!fig) return;

    fig.style.textAlign = align === "left" ? "" : align;
    syncFromEditor();
    syncImgControls();
  };

  const moveImage = dir => {
    const fig = selectedImg;
    if (!fig) return;

    const sibling = dir < 0 ? fig.previousElementSibling : fig.nextElementSibling;
    if (!sibling) {
      showToast("Không thể di chuyển thêm");
      return;
    }

    if (dir < 0) sibling.before(fig);
    else sibling.after(fig);

    fig.scrollIntoView({ block: "nearest" });
    syncFromEditor();
  };

  const removeSelectedImage = () => {
    const fig = selectedImg;
    if (!fig) return;

    const next = fig.nextElementSibling ?? fig.previousElementSibling;
    deselectImage();
    fig.remove();
    syncFromEditor();
    caretIn(next ?? editor);
  };

  widthRange.addEventListener("input", () => {
    if (!selectedImg) return;
    setImageWidth(selectedImg, widthRange.value);
    syncFromEditor();
  });

  widthNum.addEventListener("change", () => {
    if (!selectedImg) return;
    setImageWidth(selectedImg, widthNum.value);
    widthNum.value = selectedImg.dataset.w;
    syncFromEditor();
  });

  widthNum.addEventListener("keydown", event => {
    if (!event.isComposing && event.key === "Enter") widthNum.blur();
  });

  editor.addEventListener("click", event => {
    const fig = event.target.closest?.(IMG_SEL);
    if (!fig || !editor.contains(fig)) return;

    event.preventDefault();
    selectImage(fig);
  });

  editor.addEventListener("pointerdown", event => {
    const handle = event.target.closest?.("[data-handle]");
    const fig = selectedImg;
    if (!handle || !fig || (event.button !== 0 && event.pointerType === "mouse")) return;

    event.preventDefault();
    event.stopPropagation();

    const align = fig.style.textAlign;
    const dir = align === "right" ? -1 : 1;
    const gain = align === "center" ? 2 : 1;
    const startW = fig.querySelector(".rt-wrap").getBoundingClientRect().width;
    const startX = event.clientX;

    const move = e => {
      if (e.pointerId === event.pointerId) {
        setImageWidth(fig, startW + (e.clientX - startX) * dir * gain);
      }
    };

    const up = e => {
      if (e.pointerId !== event.pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      syncFromEditor();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });

  const fillCell = td => {
    td.replaceChildren(document.createElement("br"));
    return td;
  };

  const withCell = fn => {
    const td = cellEl();
    if (!td) return;

    fn(td, td.closest("table"));
    syncFromEditor();
    syncBars();
  };

  const addRow = (td, table = td.closest("table")) => {
    if (table.rows.length >= MAX_TABLE_ROWS) {
      showToast(`Tối đa ${MAX_TABLE_ROWS} hàng`);
      return;
    }

    const row = td.parentElement.cloneNode(false);
    for (let i = 0; i < td.parentElement.cells.length; i++) {
      row.append(fillCell(document.createElement("td")));
    }
    td.parentElement.after(row);
  };

  const addCol = (td, table) => {
    if (td.parentElement.cells.length >= MAX_TABLE_COLS) {
      showToast(`Tối đa ${MAX_TABLE_COLS} cột`);
      return;
    }

    const at = td.cellIndex + 1;
    [...table.rows].forEach(row => fillCell(row.insertCell(at)));
  };

  const delRow = (td, table) => {
    td.parentElement.remove();
    if (!table.rows.length) table.remove();
  };

  const delCol = (td, table) => {
    if (td.parentElement.cells.length <= 1) {
      table.remove();
      return;
    }

    const at = td.cellIndex;
    [...table.rows].forEach(row => row.deleteCell(at));
  };

  const stepCell = (td, dir) => {
    const table = td.closest("table");
    const cells = [...table.querySelectorAll("td")];
    let next = cells[cells.indexOf(td) + dir];

    if (!next && dir > 0) {
      addRow(td, table);
      next = [...table.querySelectorAll("td")][cells.length];
      syncFromEditor();
    }

    caretIn(next);
  };

  const topBlock = () => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return null;

    let node = sel.focusNode;
    if (node === editor) node = editor.childNodes[Math.max(0, sel.focusOffset - 1)] ?? null;
    while (node && node.parentNode !== editor) node = node.parentNode;

    return node;
  };

  const insertBlock = (node, kind) => {
    deselectImage();

    if (!selectionInEditor()) {
      restoreSel(lastSel);
      if (!selectionInEditor()) {
        editor.focus({ preventScroll: true });
        placeCaretAtEnd();
      }
    }

    const top = topBlock();

    if (!top) editor.append(node);
    else if (/^(P|DIV)$/.test(top.tagName) && !top.textContent.trim() && !top.querySelector("figure,table")) {
      top.replaceWith(node);
    } else top.after(node);

    const selector = kind === "img" ? IMG_SEL : "table";
    const index = [...editor.querySelectorAll(selector)].indexOf(node);

    normalizeEditor();

    const made = editor.querySelectorAll(selector)[index];
    if (kind === "img") selectImage(made);
    else caretIn(made?.querySelector("td"));

    made?.scrollIntoView({ block: "nearest" });
  };

  const insertImage = src =>
    insertBlock(
      buildImageFigure({ type: "img", src, width: DEFAULT_IMG_W, color: null, align: null }),
      "img"
    );

  const insertTable = (rows, cols, header) =>
    insertBlock(
      buildTable({
        type: "table",
        header,
        rows: Array.from({ length: rows }, () => Array.from({ length: cols }, () => []))
      }),
      "table"
    );

  const numField = (value, min, max, label) => {
    const input = el("input", `${FIELD} w-20`);
    input.type = "number";
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.setAttribute("aria-label", label);
    return input;
  };

  const openImageModal = () => {
    const urlInput = el("input", `${FIELD} w-full`);
    urlInput.type = "text";
    urlInput.placeholder = "https://cdn.jsdelivr.net/…/<name>.svg";
    urlInput.setAttribute("aria-label", "Địa chỉ ảnh");

    const submit = src => {
      const clean = cleanSrc(String(src).trim());
      if (!clean) {
        showToast("Chỉ nhận địa chỉ https:// hoặc tệp ảnh hợp lệ");
        return;
      }
      closeModal();
      insertImage(clean);
    };

    urlInput.addEventListener("keydown", event => {
      if (event.isComposing || event.key !== "Enter") return;
      event.preventDefault();
      submit(urlInput.value);
    });

    const fileInputEl = el("input", "hidden");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.setAttribute("aria-hidden", "true");
    fileInputEl.addEventListener("change", () => {
      const file = fileInputEl.files?.[0];
      fileInputEl.value = "";
      if (!file) return;

      if (file.size > MAX_IMG_FILE) {
        showToast("Ảnh quá lớn (tối đa 512 KB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => submit(reader.result);
      reader.onerror = () => showToast("Không thể đọc tệp ảnh");
      reader.readAsDataURL(file);
    });

    const presets = el(
      "div",
      "flex flex-wrap gap-2",
      "",
      ...IMG_PRESETS.map(name => {
        const button = el(
          "button",
          `size-12 p-2 rounded-xl bg-white ${BORDER} transition hover:scale-105 ${FOCUS}`
        );
        button.type = "button";
        button.title = name;

        const img = document.createElement("img");
        img.src = presetUrl(name);
        img.alt = name;
        img.className = "size-full";
        button.append(img);

        button.onclick = () => submit(presetUrl(name));
        return button;
      })
    );

    const uploadBtn = mkBtn(
      toolBtnClass,
      "Tải ảnh từ máy",
      '<i data-lucide="upload" class="size-4"></i><span class="text-sm font-semibold">Tải ảnh lên</span>'
    );
    uploadBtn.onclick = () => fileInputEl.click();

    const insertBtnEl = el("button", PRIMARY_BTN, "Chèn");
    insertBtnEl.type = "button";
    insertBtnEl.onclick = () => submit(urlInput.value);

    openModal(
      "Chèn ảnh",
      body =>
        body.replaceChildren(
          el("p", "mb-2 text-xs text-muted", "Dán địa chỉ ảnh (ưu tiên SVG từ CDN, bắt đầu bằng https://) hoặc chọn biểu tượng mẫu."),
          urlInput,
          el("p", "mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-muted", "Biểu tượng mẫu"),
          presets,
          el(
            "p",
            "mt-3 text-xs text-muted",
            "Sau khi chèn: kéo núm xanh ở góc hoặc dùng thanh Ảnh để đổi kích cỡ, màu và căn lề. " +
            "Đổi màu cần CDN bật CORS (jsDelivr hỗ trợ)."
          )
        ),
      "image",
      el("div", "flex flex-wrap items-center justify-between gap-2", "", uploadBtn, insertBtnEl, fileInputEl)
    );

    urlInput.focus();
  };

  const openTableModal = () => {
    const rows = numField(3, 1, MAX_TABLE_ROWS, "Số hàng");
    const cols = numField(3, 1, MAX_TABLE_COLS, "Số cột");

    const header = el("input", "size-4 accent-[#3b82f6]");
    header.type = "checkbox";
    header.checked = true;

    const submit = () => {
      const r = clamp(Math.round(Number(rows.value)) || 3, 1, MAX_TABLE_ROWS);
      const c = clamp(Math.round(Number(cols.value)) || 3, 1, MAX_TABLE_COLS);
      closeModal();
      insertTable(r, c, header.checked);
    };

    [rows, cols].forEach(input =>
      input.addEventListener("keydown", event => {
        if (event.isComposing || event.key !== "Enter") return;
        event.preventDefault();
        submit();
      })
    );

    const field = (text, input) =>
      el("label", "flex items-center justify-between gap-3 text-sm", "", el("span", "", text), input);

    const insertBtnEl = el("button", PRIMARY_BTN, "Chèn bảng");
    insertBtnEl.type = "button";
    insertBtnEl.onclick = submit;

    openModal(
      "Chèn bảng",
      body =>
        body.replaceChildren(
          el(
            "div",
            "flex flex-col gap-3",
            "",
            field(`Số hàng (tối đa ${MAX_TABLE_ROWS})`, rows),
            field(`Số cột (tối đa ${MAX_TABLE_COLS})`, cols),
            el("label", "flex items-center gap-2 text-sm", "", header, el("span", "", "Hàng đầu là tiêu đề"))
          )
        ),
      "table",
      el("div", "flex justify-end", "", insertBtnEl)
    );

    rows.focus();
    rows.select();
  };

  const prepareSelection = useLast => {
    const saved = captureSel() || (useLast ? lastSel : null);
    if (!saved) return false;

    restoreSel(saved);

    const sel = window.getSelection();
    if (!sel.rangeCount) return false;

    if (sel.isCollapsed) {
      const block = currentBlockEl();
      if (!block || !/^H[1-4]$/.test(block.tagName) || !block.textContent.trim()) return false;

      const range = document.createRange();
      range.selectNodeContents(block);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    return true;
  };

  function normalizeEditor() {
    const saved = captureSel();
    const imgIndex = selectedImg ? [...editor.querySelectorAll(IMG_SEL)].indexOf(selectedImg) : -1;
    selectedImg = null;

    sentenceBlocks = domToBlocks(editor);
    renderBlocks(sentenceBlocks, editor);

    const fig = imgIndex >= 0 ? editor.querySelectorAll(IMG_SEL)[imgIndex] : null;
    if (fig) selectImage(fig);
    else restoreSel(saved);

    refreshSentenceUi();
    schedulePersist();
    updateToolbarState();
  }

  function syncLinkedWord(word, { color = false, format = false, transform = null }) {
    const nodes = editor.querySelectorAll(`[data-wid="${CSS.escape(word.id)}"]`);
    if (!nodes.length) return;

    const paint = cleanWordColor(word.color);

    nodes.forEach(node => {
      if (color) {
        clearGradientText(node);
        node.style.color = "";
        paintText(node, paint);
      }

      if (format) {
        node.style.fontWeight = word.bold ? "700" : "400";
        node.style.fontStyle = word.italic ? "italic" : "normal";
        node.style.textDecoration = word.underline ? "underline" : "none";
      }

      if (transform) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let text;
        while ((text = walker.nextNode())) text.nodeValue = transform(text.nodeValue);
      }
    });

    if (format) normalizeEditor();
    else syncFromEditor();
  }

  const MARK_COLOR = "#010203";
  const MARK_SIZE = "xxx-large";
  const MARK_FONT = "mixerfontmark";

  const applyInline = (kind, value, useLast = false) => {
    if (selectedImg) return kind === "color" ? setImageColor(value) : false;
    if (!prepareSelection(useLast)) return false;

    document.execCommand("styleWithCSS", false, true);

    if (kind === "size") document.execCommand("fontSize", false, "7");
    else if (kind === "font") document.execCommand("fontName", false, MARK_FONT);
    else document.execCommand("foreColor", false, MARK_COLOR);

    editor.querySelectorAll("span,font").forEach(node => {
      if (kind === "size") {
        const marked =
          node.style?.fontSize === MARK_SIZE || node.getAttribute("size") === "7";
        if (!marked) return;

        node.removeAttribute("size");
        node.style.fontSize = value ? `${value}px` : "initial";
        return;
      }

      if (kind === "font") {
        const family = (node.style?.fontFamily || "").replace(/["']/g, "");
        const face = node.getAttribute("face") || "";
        if (family !== MARK_FONT && face !== MARK_FONT) return;

        node.removeAttribute("face");
        node.style.fontFamily = value ? FONT_MAP.get(value).css : "inherit";
        return;
      }

      const marked =
        parseCssColor(node.style?.color || "") === MARK_COLOR ||
        parseCssColor(node.getAttribute("color") || "") === MARK_COLOR;
      if (!marked) return;

      node.removeAttribute("data-wid");
      node.removeAttribute("color");
      clearGradientText(node);

      if (value === GRADIENT) setGradientText(node);
      else node.style.color = value || "var(--text)";
    });

    normalizeEditor();
    return true;
  };

  const imgHint = "Ảnh đang được chọn: dùng thanh Ảnh để chỉnh";
  const cellHint = "Tùy chọn này không dùng được trong ô bảng";

  const runCommand = command => {
    if (!selectionInEditor()) {
      showToast("Hãy đặt con trỏ hoặc bôi đen chữ trong tệp để định dạng");
      return;
    }

    if (selectedImg) {
      showToast(imgHint);
      return;
    }

    if (cellEl() && /^(insert|justify)/.test(command)) {
      showToast(cellHint);
      return;
    }

    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command);
    syncFromEditor();
    updateToolbarState();
  };

  const toggleHeading = level => {
    if (!selectionInEditor()) {
      showToast("Hãy đặt con trỏ trong tệp để tạo tiêu đề");
      return;
    }

    if (selectedImg || cellEl()) {
      showToast(selectedImg ? imgHint : cellHint);
      return;
    }

    const same = currentBlockEl()?.tagName === `H${level}`;
    document.execCommand("formatBlock", false, same ? "<p>" : `<h${level}>`);

    const made = currentBlockEl();
    if (made && /^H/.test(made.tagName)) {
      delete made.dataset.kind;
      delete made.dataset.indent;
    }

    syncFromEditor();
    updateToolbarState();
  };

  const selectedBlockEls = () => {
    if (!selectionInEditor() || selectedImg) return [];

    if (!currentBlockEl() && !cellEl()) document.execCommand("formatBlock", false, "<p>");

    const sel = window.getSelection();
    if (!sel.rangeCount) return [];

    const range = sel.getRangeAt(0);
    const out = [];

    [...editor.children].forEach(child => {
      if (!range.intersectsNode(child)) return;

      if (child.tagName === "UL" || child.tagName === "OL") {
        [...child.children].forEach(li => {
          if (li.tagName === "LI" && range.intersectsNode(li)) out.push(li);
        });
      } else {
        out.push(child);
      }
    });

    if (!range.collapsed && out.length > 1) {
      const tail = range.cloneRange();
      tail.setStart(out[out.length - 1], 0);
      if (!tail.toString()) out.pop();
    }

    return out;
  };

  const paragraphEls = () => selectedBlockEls().filter(n => /^(P|DIV)$/.test(n.tagName));

  const toggleKind = kind => {
    const els = paragraphEls();
    if (!els.length) {
      showToast("Hãy đặt con trỏ trong một đoạn văn để áp dụng");
      return;
    }

    const remove = els.every(n => n.dataset.kind === kind);
    els.forEach(n => {
      if (remove) {
        delete n.dataset.kind;
      } else {
        n.dataset.kind = kind;
        delete n.dataset.indent;
      }
    });

    syncFromEditor();
    updateToolbarState();
  };

  const setQuoteAuthor = (last, author) => {
    let anchor = last;
    while (anchor.nextElementSibling?.dataset.kind === "quote") {
      anchor = anchor.nextElementSibling;
    }

    let cite = anchor.nextElementSibling;
    if (cite?.dataset.kind !== "cite") {
      cite = document.createElement("p");
      cite.dataset.kind = "cite";
      anchor.after(cite);
    }

    cite.replaceChildren(document.createTextNode(author));
  };

  const applyQuote = async () => {
    const els = paragraphEls();
    if (!els.length) {
      showToast("Hãy đặt con trỏ trong một đoạn văn để áp dụng");
      return;
    }

    if (els.every(n => n.dataset.kind === "quote")) {
      toggleKind("quote");
      return;
    }

    const saved = captureSel();

    const author = await askName({
      title: "Tên tác giả của trích dẫn (có thể để trống)",
      defaultValue: "",
      okText: "Áp dụng",
      clean: raw => cleanName(raw, "")
    });
    if (author === null) return;

    restoreSel(saved);

    els.forEach(n => {
      n.dataset.kind = "quote";
      delete n.dataset.indent;
    });

    if (author) setQuoteAuthor(els[els.length - 1], author);

    syncFromEditor();
    updateToolbarState();
  };

  const toggleIndent = () => {
    const els = paragraphEls().filter(n => !n.dataset.kind);
    if (!els.length) {
      showToast("Thụt đầu dòng chỉ áp dụng cho đoạn văn thường");
      return;
    }

    const remove = els.every(n => n.dataset.indent === "1");
    els.forEach(n => {
      if (remove) delete n.dataset.indent;
      else n.dataset.indent = "1";
    });

    syncFromEditor();
    updateToolbarState();
  };

  const addCaption = () => {
    const els = paragraphEls();
    if (!els.length) {
      showToast("Hãy đặt con trỏ trong đoạn trích dẫn");
      return;
    }

    const last = els[els.length - 1];

    if (last.dataset.kind === "cite") {
      delete last.dataset.kind;
      syncFromEditor();
      updateToolbarState();
      return;
    }

    let anchor = last;
    while (anchor.nextElementSibling?.dataset.kind === "quote") {
      anchor = anchor.nextElementSibling;
    }

    if (anchor.dataset.kind !== "quote") {
      toggleKind("cite");
      return;
    }

    let cite = anchor.nextElementSibling;

    if (cite?.dataset.kind !== "cite") {
      cite = document.createElement("p");
      cite.dataset.kind = "cite";
      cite.append(document.createElement("br"));
      anchor.after(cite);
    }

    caretIn(cite);
    syncFromEditor();
    updateToolbarState();
  };

  const moveBlocks = dir => {
    if (selectedImg) {
      moveImage(dir);
      return;
    }

    const els = selectedBlockEls();
    if (!els.length) {
      showToast("Hãy đặt con trỏ trong đoạn cần di chuyển");
      return;
    }

    const parent = els[0].parentNode;
    if (!els.every(n => n.parentNode === parent)) {
      showToast("Chỉ di chuyển được các đoạn liền nhau cùng loại");
      return;
    }

    const sibling =
      dir < 0 ? els[0].previousElementSibling : els[els.length - 1].nextElementSibling;
    if (!sibling) {
      showToast("Không thể di chuyển thêm");
      return;
    }

    const sel = window.getSelection();
    const r = sel.rangeCount ? sel.getRangeAt(0) : null;
    const saved = r && {
      sc: r.startContainer, so: r.startOffset, ec: r.endContainer, eo: r.endOffset
    };

    if (dir < 0) sibling.before(...els);
    else sibling.after(...els);

    if (saved) {
      try {
        const next = document.createRange();
        next.setStart(saved.sc, saved.so);
        next.setEnd(saved.ec, saved.eo);
        sel.removeAllRanges();
        sel.addRange(next);
      } catch { }
    }

    els[0].scrollIntoView({ block: "nearest" });
    syncFromEditor();
    updateToolbarState();
  };

  const selectedTextSpans = range => {
    const spans = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node)) continue;

      const start = node === range.startContainer ? range.startOffset : 0;
      const end = node === range.endContainer ? range.endOffset : node.nodeValue.length;
      if (end > start) spans.push({ node, start, end });
    }

    return spans;
  };

  const changeCase = mode => {
    const sel = window.getSelection();

    if (!selectionInEditor() || selectedImg || !sel.rangeCount || sel.isCollapsed) {
      showToast("Hãy bôi đen chữ trong tệp để đổi kiểu chữ");
      return;
    }

    const saved = captureSel();
    const spans = selectedTextSpans(sel.getRangeAt(0));

    spans.forEach(({ node, start, end }) => {
      const text = node.nodeValue;
      const part = text.slice(start, end);
      const next = mode === "upper" ? part.toLocaleUpperCase("vi") : part.toLocaleLowerCase("vi");

      if (next !== part) node.nodeValue = text.slice(0, start) + next + text.slice(end);
    });

    syncFromEditor();
    restoreSel(saved);
    updateToolbarState();
  };

  const noteIdOf = node => node.parentElement?.closest("[data-nid]")?.dataset.nid ?? null;
  const noteSel = id => `[data-nid="${CSS.escape(id)}"]`;

  const collectNotes = () => {
    const groups = new Map();

    editor.querySelectorAll("[data-nid]").forEach(node => {
      const id = node.dataset.nid;
      if (!groups.has(id)) groups.set(id, { id, note: node.dataset.note || "", nodes: [] });
      groups.get(id).nodes.push(node);
    });

    return [...groups.values()].map((group, i) => ({
      id: group.id,
      note: group.note,
      n: i + 1,
      nodes: group.nodes,
      text: group.nodes
        .map(node => node.textContent)
        .join("")
        .replace(/\u200b/g, "")
        .replace(/\s+/g, " ")
        .trim()
    }));
  };

  const setNoteText = (id, text) => {
    editor.querySelectorAll(noteSel(id)).forEach(node => {
      if (text) {
        node.dataset.note = text;
        node.title = text;
      } else {
        delete node.dataset.nid;
        delete node.dataset.note;
        delete node.dataset.n;
        node.removeAttribute("title");
      }
    });

    normalizeEditor();
  };

  const askNote = (title, value) =>
    askName({ title, defaultValue: value, okText: "Lưu", maxLength: MAX_NOTE_LEN, clean: cleanNote });

  const editNote = async id => {
    const current = editor.querySelector(noteSel(id))?.dataset.note ?? "";
    const saved = captureSel();

    const text = await askNote("Sửa chú giải nghĩa (để trống để xóa chú giải)", current);
    if (text === null) return;

    if (saved) restoreSel(saved);
    setNoteText(id, text);
    showToast(text ? "Đã cập nhật chú giải" : "Đã xóa chú giải");
  };

  const addNote = async () => {
    const sel = window.getSelection();

    if (!selectionInEditor() || selectedImg || !sel.rangeCount) {
      showToast("Hãy bôi đen chữ trong tệp để thêm chú giải nghĩa");
      return;
    }

    if (sel.isCollapsed) {
      const base = sel.anchorNode;
      const host = base.nodeType === Node.TEXT_NODE ? base.parentElement : base;
      const id = host?.closest?.("[data-nid]")?.dataset.nid;

      if (id) editNote(id);
      else showToast("Hãy bôi đen chữ cần chú giải, hoặc đặt con trỏ vào chữ đã có chú giải để sửa");
      return;
    }

    const spans = selectedTextSpans(sel.getRangeAt(0));
    const touched = spans.map(sp => noteIdOf(sp.node));
    const ids = new Set(touched.filter(Boolean));

    if (ids.size) {
      const only = [...ids][0];
      if (ids.size === 1 && touched.every(id => id === only)) editNote(only);
      else showToast("Vùng chọn đã có chú giải. Hãy chọn chữ khác, hoặc đặt con trỏ vào chữ đó để sửa");
      return;
    }

    const parts = spans.map(sp => ({ ...sp, s: sp.start, e: sp.end }));
    const blank = ch => /[\s\u200b]/.test(ch);

    for (const sp of parts) {
      const text = sp.node.nodeValue;
      while (sp.s < sp.e && blank(text[sp.s])) sp.s++;
      if (sp.e > sp.s) break;
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const sp = parts[i];
      const text = sp.node.nodeValue;
      while (sp.e > sp.s && blank(text[sp.e - 1])) sp.e--;
      if (sp.e > sp.s) break;
    }

    const targets = parts.filter(sp => sp.e > sp.s);
    if (!targets.length) {
      showToast("Vùng bôi đen không có chữ để chú giải");
      return;
    }

    const label = targets.map(sp => sp.node.nodeValue.slice(sp.s, sp.e)).join(" ").slice(0, 40);
    const saved = captureSel();

    const text = await askNote(`Chú giải nghĩa cho “${label}”`, "");
    if (!text) return;

    restoreSel(saved);

    const id = crypto.randomUUID();
    targets.forEach(({ node, s, e }) => {
      const span = document.createElement("span");
      span.dataset.nid = id;
      span.dataset.note = text;
      span.title = text;
      wrapTextRange(node, s, e, span);
    });

    normalizeEditor();
    showToast("Đã thêm chú giải nghĩa");
  };

  const goToNote = id => {
    const node = editor.querySelector(noteSel(id));
    if (!node) return;

    closeModal();
    node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    caretIn(node, false);

    if (!reduceMotion) {
      node.animate(
        [{ background: "color-mix(in srgb, var(--hl) 40%, transparent)" }, { background: "transparent" }],
        { duration: 900, easing: "ease-out" }
      );
    }
  };

  const renderNotesBody = body => {
    const notes = collectNotes();

    if (!notes.length) {
      body.replaceChildren(
        el(
          "p",
          "py-6 text-center text-sm text-muted",
          "Chưa có chú giải nào. Bôi đen chữ rồi bấm nút chỉ số trên để thêm nghĩa."
        )
      );
      return;
    }

    body.replaceChildren(
      el(
        "div",
        "flex flex-col divide-y divide-[color-mix(in_srgb,var(--text)_12%,transparent)]",
        "",
        ...notes.map(item => {
          const row = el("div", "flex items-start gap-1 px-1 py-2");

          const open = el(
            "button",
            "flex min-w-0 flex-1 items-start gap-2 rounded-lg px-2 py-1 text-left " +
            `hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] ${FOCUS}`
          );
          open.type = "button";
          open.title = "Đi tới chữ được chú giải";

          const num = el("sup", "mt-0.5 shrink-0 text-xs font-bold", String(item.n));
          num.style.color = SELECT_BLUE;

          open.append(
            num,
            el(
              "span",
              "flex min-w-0 flex-1 flex-col",
              "",
              el("span", "break-words text-sm font-semibold", item.text || "(trống)"),
              el("span", "break-words text-sm text-muted", item.note)
            )
          );
          open.onclick = event => {
            event.stopPropagation();
            goToNote(item.id);
          };

          const edit = mkBtn(
            `${iconBtn} text-muted`,
            "Sửa chú giải",
            '<i data-lucide="pencil" class="size-4"></i>'
          );
          edit.onclick = event => {
            event.stopPropagation();
            editNote(item.id);
          };

          const remove = mkBtn(
            `${iconBtn} text-muted hover:text-red-500`,
            "Xóa chú giải",
            '<i data-lucide="trash-2" class="size-4"></i>'
          );
          remove.onclick = event => {
            event.stopPropagation();
            setNoteText(item.id, "");
          };

          row.append(open, edit, remove);
          return row;
        })
      )
    );
  };

  const openNotesModal = () => openModal("Chú giải nghĩa", renderNotesBody, "notes");

  function nodeColor(node) {
    let n = node.parentElement;

    while (n && n !== editor) {
      if (
        n.dataset?.gradient === "1" ||
        n.style?.backgroundClip === "text" ||
        n.style?.webkitBackgroundClip === "text"
      ) {
        return GRADIENT;
      }

      const raw = n.style?.color;
      if (raw && raw !== "transparent") {
        const color = parseCssColor(raw);
        if (color) return color;
      }

      n = n.parentElement;
    }

    return null;
  }

  const nodeFormat = node => {
    let bold = null;
    let italic = null;
    let underline = null;

    for (let n = node.parentElement; n && n !== editor; n = n.parentElement) {
      const css = n.style;

      if (bold === null) {
        if (n.tagName === "B" || n.tagName === "STRONG") bold = true;
        else if (css?.fontWeight) bold = css.fontWeight === "bold" || Number(css.fontWeight) >= 600;
      }

      if (italic === null) {
        if (n.tagName === "I" || n.tagName === "EM") italic = true;
        else if (css?.fontStyle) italic = css.fontStyle === "italic";
      }

      if (underline === null) {
        const decoration = css?.textDecorationLine || css?.textDecoration;
        if (n.tagName === "U") underline = true;
        else if (decoration) underline = decoration.includes("underline");
      }
    }

    return { bold: bold === true, italic: italic === true, underline: underline === true };
  };

  const BLOCK_SEL = "p,h1,h2,h3,h4,li,td,div";

  const blockOf = node => node.parentElement?.closest(BLOCK_SEL) ?? null;

  const selectionWords = range => {
    const words = [];
    let cur = null;
    let lastBlock = null;

    const flushWord = () => {
      if (cur) words.push(cur);
      cur = null;
    };

    selectedTextSpans(range).forEach(({ node, start, end }) => {
      const block = blockOf(node);
      if (block !== lastBlock) flushWord();
      lastBlock = block;

      const color = nodeColor(node);
      const format = nodeFormat(node);
      const text = node.nodeValue.slice(start, end).replace(/\u00a0/g, " ").replace(/\u200b/g, "");

      for (const ch of text) {
        if (/\s/.test(ch)) {
          flushWord();
        } else {
          if (!cur) cur = { word: "", color, ...format };
          cur.word += ch;
        }
      }
    });

    flushWord();

    return words
      .map(w => ({
        word: w.word.slice(0, MAX_WORD_LEN),
        color: cleanWordColor(w.color),
        bold: w.bold,
        italic: w.italic,
        underline: w.underline
      }))
      .slice(0, MAX_IMPORT_WORDS);
  };

  const linkSelectionToWords = (saved, ids, merged) => {
    restoreSel(saved);

    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;

    if (merged) {
      const word = docWords.find(w => w.id === ids[0]);
      const spans = selectedTextSpans(sel.getRangeAt(0)).map(sp => ({ ...sp, s: sp.start, e: sp.end }));
      const blank = ch => /[\s\u200b]/.test(ch);

      for (const sp of spans) {
        const text = sp.node.nodeValue;
        while (sp.s < sp.e && blank(text[sp.s])) sp.s++;
        if (sp.e > sp.s) break;
      }
      for (let i = spans.length - 1; i >= 0; i--) {
        const sp = spans[i];
        const text = sp.node.nodeValue;
        while (sp.e > sp.s && blank(text[sp.e - 1])) sp.e--;
        if (sp.e > sp.s) break;
      }

      if (word) {
        spans.forEach(sp => {
          if (sp.e > sp.s) wrapTextRange(sp.node, sp.s, sp.e, makeLinkedSpan(word.id, word.color));
        });
      }

      normalizeEditor();
      return;
    }

    const plan = [];
    let wordIdx = -1;
    let inWord = false;
    let lastBlock = null;

    selectedTextSpans(sel.getRangeAt(0)).forEach(({ node, start, end }) => {
      const block = blockOf(node);
      if (block !== lastBlock) inWord = false;
      lastBlock = block;

      const text = node.nodeValue;
      const segs = [];
      let from = -1;
      let seg = -1;

      const close = at => {
        if (from >= 0) segs.push({ s: from, e: at, idx: seg });
        from = -1;
      };

      for (let i = start; i < end; i++) {
        const ch = text[i];

        if (ch === "\u200b") continue;

        if (/\s/.test(ch)) {
          close(i);
          inWord = false;
          continue;
        }

        if (!inWord) {
          wordIdx++;
          inWord = true;
        }
        if (from < 0) {
          from = i;
          seg = wordIdx;
        }
      }
      close(end);

      if (segs.length) plan.push({ node, segs });
    });

    plan.forEach(({ node, segs }) => {
      for (let k = segs.length - 1; k >= 0; k--) {
        const id = ids[segs[k].idx];
        if (!id) continue;

        const word = docWords.find(w => w.id === id);
        if (!word) continue;

        wrapTextRange(node, segs[k].s, segs[k].e, makeLinkedSpan(id, word.color));
      }
    });

    normalizeEditor();
  };

  const commitSplit = (saved, words, merged) => {
    const items = merged
      ? [{ ...words[0], word: words.map(w => w.word).join(" ").slice(0, MAX_WORD_LEN) }]
      : words;

    if (docWords.length + items.length > MAX_DOC_WORDS) {
      showToast(`Mỗi tài liệu tối đa ${MAX_DOC_WORDS} từ`);
      return;
    }

    const ids = items.map(item => {
      const id = crypto.randomUUID();
      docWords.push({
        id,
        word: item.word,
        color: item.color,
        bold: item.bold,
        italic: item.italic,
        underline: item.underline
      });
      return id;
    });

    closeModal();

    linkSelectionToWords(saved, ids, merged);
    commitWords();

    showToast(`Đã thêm ${items.length} thẻ chữ vào danh sách từ`);
  };

  const openSplitModal = () => {
    const sel = window.getSelection();

    if (!selectionInEditor() || selectedImg || !sel.rangeCount || sel.isCollapsed) {
      showToast("Hãy bôi đen chữ trong tệp để tạo thẻ chữ");
      return;
    }

    const saved = captureSel();
    const words = selectionWords(sel.getRangeAt(0));

    if (!saved || !words.length) {
      showToast("Vùng bôi đen không có chữ để tạo thẻ");
      return;
    }

    if (words.length === 1) {
      commitSplit(saved, words, true);
      return;
    }

    const mergeBtn = el("button", PRIMARY_BTN, "Giữ nguyên cụm (1 thẻ)");
    mergeBtn.type = "button";
    mergeBtn.onclick = event => {
      event.stopPropagation();
      commitSplit(saved, words, true);
    };

    const splitAllBtn = el("button", toolBtnClass, `Cắt nhỏ (${words.length} thẻ)`);
    splitAllBtn.type = "button";
    splitAllBtn.onclick = event => {
      event.stopPropagation();
      commitSplit(saved, words, false);
    };

    openModal(
      `Tạo thẻ chữ từ ${words.length} từ`,
      body =>
        body.replaceChildren(
          el(
            "p",
            "mb-2 text-xs text-muted",
            "Chữ đang bôi đen vẫn được giữ trong tệp, đồng thời tạo thẻ chữ trong danh sách từ của tài liệu này và liên kết màu với thẻ."
          ),
          el(
            "p",
            "rounded-xl px-3 py-2 text-sm bg-[color-mix(in_srgb,var(--text)_6%,transparent)] break-words",
            words.map(w => w.word).join(" ")
          )
        ),
      "split",
      el("div", "flex flex-wrap items-center justify-end gap-2", "", splitAllBtn, mergeBtn)
    );
  };

  const formatButtons = [
    { btn: boldBtn, run: () => runCommand("bold"), active: () => document.queryCommandState("bold") },
    { btn: italicBtn, run: () => runCommand("italic"), active: () => document.queryCommandState("italic") },
    { btn: underlineBtn, run: () => runCommand("underline"), active: () => document.queryCommandState("underline") },
    {
      btn: plainBtn,
      run: () => {
        if (selectedImg) {
          setImageColor(null);
          return;
        }

        if (!prepareSelection(false)) {
          showToast("Hãy bôi đen chữ (hoặc đặt con trỏ trong tiêu đề) để xóa định dạng");
          return;
        }

        document.execCommand("styleWithCSS", false, true);
        document.execCommand("removeFormat");
        applyInline("color", null);
        applyInline("size", null);
        applyInline("font", null);
      }
    },
    { btn: upperBtn, run: () => changeCase("upper") },
    { btn: lowerBtn, run: () => changeCase("lower") },
    { btn: noteBtn, run: addNote },
    { btn: notesBtn, run: openNotesModal },
    { btn: splitBtn, run: openSplitModal },
    ...headingBtns.map((btn, i) => ({
      btn,
      run: () => toggleHeading(i + 1),
      active: () => currentBlockEl()?.tagName === `H${i + 1}`
    })),
    ...alignBtns.map((btn, i) => ({
      btn,
      run: () => runCommand(ALIGN_DEFS[i][0]),
      active: () => document.queryCommandState(ALIGN_DEFS[i][0])
    })),
    { btn: bulletBtn, run: () => runCommand("insertUnorderedList"), active: () => document.queryCommandState("insertUnorderedList") },
    { btn: numberBtn, run: () => runCommand("insertOrderedList"), active: () => document.queryCommandState("insertOrderedList") },
    { btn: indentBtn, run: toggleIndent, active: () => currentBlockEl()?.dataset.indent === "1" },
    { btn: quoteBtn, run: applyQuote, active: () => currentBlockEl()?.dataset.kind === "quote" },
    { btn: citeBtn, run: addCaption, active: () => currentBlockEl()?.dataset.kind === "cite" },
    { btn: poemBtn, run: () => toggleKind("poem"), active: () => currentBlockEl()?.dataset.kind === "poem" },
    { btn: dropcapBtn, run: () => toggleKind("dropcap"), active: () => currentBlockEl()?.dataset.kind === "dropcap" },
    { btn: imageBtn, run: openImageModal },
    { btn: tableBtn, run: openTableModal },
    { btn: moveUpBtn, run: () => moveBlocks(-1) },
    { btn: moveDownBtn, run: () => moveBlocks(1) }
  ];

  const safeState = fn => {
    try { return Boolean(fn()); } catch { return false; }
  };

  function updateToolbarState() {
    keepImageSelection();

    const inside = selectionInEditor();

    const savedSel = captureSel();
    if (savedSel) lastSel = savedSel;

    const selectOpen = document.activeElement === fontSelect;

    if (inside && !selectOpen && !selectedImg) {
      let node = window.getSelection().anchorNode;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;

      let px = null;
      let fontId = null;

      while (node && node !== editor) {
        const css = node.style;

        if (px === null && css?.fontSize) {
          const match = /^(\d+)px$/.exec(css.fontSize);
          px = match ? match[1] : "";
        }

        if (fontId === null && css?.fontFamily) {
          fontId = fontIdFromCss(css.fontFamily) || "";
        }

        node = node.parentElement;
      }

      px = px ?? "";
      fontId = fontId ?? "";

      setSizeValue(px);
      fontSelect.value = [...fontSelect.options].some(o => o.value === fontId) ? fontId : "";
    }

    formatButtons.forEach(({ btn, active }) => {
      if (active) btn.setAttribute("aria-pressed", String(inside && safeState(active)));
    });

    syncBars();
  }

  formatButtons.forEach(({ btn, run, active }) => {
    bind(btn, run);
    if (active) btn.setAttribute("aria-pressed", "false");
  });

  document.addEventListener("selectionchange", updateToolbarState);

  fontSelect.addEventListener("change", () => {
    if (!applyInline("font", fontSelect.value || null, true)) {
      setDocDefaults({ font: fontSelect.value });
    }
  });

  editor.addEventListener("keydown", event => {
    if (
      event.altKey && !event.ctrlKey && !event.metaKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      moveBlocks(event.key === "ArrowUp" ? -1 : 1);
      return;
    }

    if (
      (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey &&
      event.key.toLowerCase() === "s"
    ) {
      event.preventDefault();
      if (!saveSentenceBtn.disabled) saveSentenceBtn.click();
      return;
    }

    if (event.isComposing) return;

    if (selectedImg) {
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        removeSelectedImage();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const next = selectedImg.nextElementSibling;
        deselectImage();
        if (next) caretIn(next);
      }
      return;
    }

    if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const td = cellEl();
      if (td) {
        event.preventDefault();
        stepCell(td, event.shiftKey ? -1 : 1);
      }
    }
  });

  const applyColorToSelection = color => applyInline("color", color, false);

  saveSentenceBtn.onclick = async event => {
    event.stopPropagation();
    if (!sentenceString().trim()) return;

    const base = currentSaved()?.name || nextDefaultName();

    const name = await askName({
      title: "Lưu tệp",
      defaultValue: base,
      okText: "Lưu",
      clean: raw => cleanName(raw, base)
    });
    if (name === null) return;

    const blocks = cloneBlocks(sentenceBlocks);
    const words = cleanWords(docWords);
    const existing = savedSentences.find(s => s.name.toLowerCase() === name.toLowerCase());

    if (existing) {
      if (
        existing.id !== currentSavedId &&
        !window.confirm(`Đã có tệp “${existing.name}”. Ghi đè lên tệp đó?`)
      ) {
        return;
      }

      existing.name = name;
      existing.blocks = blocks;
      existing.words = words;
      currentSavedId = existing.id;
      showToast(`Đã cập nhật “${name}”`);
    } else {
      if (savedSentences.length >= MAX_SAVED_SENTENCES) {
        showToast(`Tối đa ${MAX_SAVED_SENTENCES} tệp đã lưu`);
        return;
      }

      const entry = { id: crypto.randomUUID(), name, blocks, words };
      savedSentences.unshift(entry);
      currentSavedId = entry.id;
      showToast(`Đã lưu “${name}”`);
    }

    persist();
    renderSavedSentences();
  };

  copySentenceBtn.onclick = async event => {
    event.stopPropagation();

    const text = sentenceString();
    if (!text.trim()) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép tệp");
    } catch (error) {
      console.warn("Không thể sao chép:", error);
      showToast("Không thể sao chép tệp");
    }
  };

  clearSentenceBtn.onclick = event => {
    event.stopPropagation();
    setDocument([], [], null);
    renderSavedSentences();
  };

  exportSentenceBtn.onclick = async event => {
    event.stopPropagation();

    const saved = currentSaved();
    let name =
      !event.shiftKey && (saved ? safeFileName(saved.name, DEFAULT_EXPORT_NAME) : lastExportName);

    if (!name) {
      name = await askFileName(lastExportName ?? DEFAULT_EXPORT_NAME);
      if (name === null) return;
    }
    lastExportName = name;

    downloadJson(
      {
        app: "mixer",
        type: "sentence-document",
        version: 8,
        exportedAt: new Date().toISOString(),
        document: { text: sentenceString(), blocks: sentenceBlocks, words: docWords },
        colorLegend,
        docStyle,
        savedSentences: savedSentences.map(entry => ({
          name: entry.name,
          text: blocksToText(entry.blocks),
          blocks: entry.blocks,
          words: entry.words
        }))
      },
      `${name}.json`
    );

    showToast(`Đã xuất “${name}.json”`);
  };

  const sanitizeSentenceImport = data => {
    const toDoc = value => {
      const words =
        value && typeof value === "object" && !Array.isArray(value)
          ? cleanWords(value.words)
          : [];

      const blocks = withWords(words, () => {
        if (typeof value === "string") return textToBlocks(value);

        if (Array.isArray(value)) {
          return value.some(item => item && (Array.isArray(item.runs) || item.type))
            ? cleanBlocks(value)
            : runsToBlocks(cleanRuns(value));
        }

        if (value && Array.isArray(value.blocks)) return cleanBlocks(value.blocks);
        if (value && Array.isArray(value.runs)) return runsToBlocks(cleanRuns(value.runs));
        if (value && typeof value.text === "string") return textToBlocks(value.text);
        return [];
      });

      return { blocks, words };
    };

    const result = { document: { blocks: [], words: [] }, saved: [], legend: {}, style: null };

    if (typeof data === "string" || Array.isArray(data)) {
      result.document = toDoc(data);
      return result;
    }

    if (!data || typeof data !== "object") return result;

    const source =
      data.document ??
      (data.blocks !== undefined || data.runs !== undefined || data.text !== undefined
        ? data
        : null);
    result.document = toDoc(source);
    result.legend = cleanLegend(data.colorLegend);

    if (data.docStyle && typeof data.docStyle === "object" && !Array.isArray(data.docStyle)) {
      result.style = cleanDocStyle(data.docStyle);
    }

    const list = Array.isArray(data.savedSentences)
      ? data.savedSentences
      : Array.isArray(data.sentences)
        ? data.sentences
        : [];

    result.saved = list
      .map(item => {
        const doc = toDoc(item);
        return {
          name:
            item && typeof item === "object" && typeof item.name === "string"
              ? cleanName(item.name, "")
              : "",
          blocks: doc.blocks,
          words: doc.words
        };
      })
      .filter(entry => entry.blocks.length);

    return result;
  };

  const importSentenceFile = async file => {
    try {
      if (file.size > MAX_IMPORT_SIZE) {
        showToast("Tệp quá lớn (tối đa 2 MB)");
        return;
      }

      const parsed = sanitizeSentenceImport(JSON.parse(await file.text()));

      if (
        !parsed.document.blocks.length &&
        !parsed.saved.length &&
        !Object.keys(parsed.legend).length &&
        !parsed.style
      ) {
        showToast("Tệp không có nội dung hợp lệ");
        return;
      }

      if (parsed.document.blocks.length) {
        if (!confirmDiscard()) return;
        setDocument(parsed.document.blocks, parsed.document.words);
      }

      Object.assign(colorLegend, parsed.legend);

      if (parsed.style) {
        docStyle = parsed.style;
        applyDocStyle();
        refreshStyleInputs();
      }

      let added = 0;
      for (const entry of parsed.saved) {
        if (savedSentences.length >= MAX_SAVED_SENTENCES) break;
        savedSentences.push({
          id: crypto.randomUUID(),
          name: uniqueName(entry.name || defaultSentenceName(entry.blocks)),
          blocks: entry.blocks,
          words: entry.words
        });
        added++;
      }

      persist();
      renderSavedSentences();
      refreshSentenceUi();

      showToast(
        (parsed.document.blocks.length ? "Đã nhập tài liệu" : "Đã nhập") +
        (added ? `, ${added} tệp đã lưu` : "")
      );
    } catch (error) {
      console.warn("Không thể nhập tệp JSON:", error);
      showToast("Không thể đọc tệp JSON");
    }
  };

  importSentenceBtn.onclick = event => {
    event.stopPropagation();
    sentenceFile.click();
  };

  sentenceFile.addEventListener("change", () => {
    const file = sentenceFile.files?.[0];
    sentenceFile.value = "";
    if (file) importSentenceFile(file);
  });

  function renderSentence() {
    renderBlocks(sentenceBlocks, editor);
    refreshSentenceUi();

    if (window.lucide) lucide.createIcons();
  }

  const openSaved = entry => {
    const reopeningSame = entry.id === currentSavedId;

    if (!reopeningSame && !confirmDiscard()) return;

    setDocument(cloneBlocks(entry.blocks), entry.words, entry.id);
    renderSavedSentences();

    editor.focus({ preventScroll: true });
    placeCaretAtEnd();
    editor.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });

    closeModal();
    showToast(`Đã mở “${entry.name}”`);
  };

  const renameSaved = async entry => {
    const name = await askName({
      title: "Đổi tên tệp",
      defaultValue: entry.name,
      okText: "Đổi tên",
      clean: raw => cleanName(raw, entry.name)
    });

    if (name === null || name === entry.name) return;

    if (nameTaken(name, entry.id)) {
      showToast("Đã có tệp trùng tên");
      return;
    }

    entry.name = name;
    persist();
    renderSavedSentences();
  };

  const buildSavedSentence = entry => {
    const isCurrent = entry.id === currentSavedId;

    const row = el("div", "flex items-center gap-1 px-1 py-1");

    const open = el(
      "button",
      "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-base " +
      `hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] ${FOCUS}` +
      (isCurrent
        ? " font-semibold bg-[color-mix(in_srgb,var(--text)_10%,transparent)]"
        : "")
    );
    open.type = "button";
    open.title = `Mở “${entry.name}” trong khu vực soạn tệp`;
    if (isCurrent) open.setAttribute("aria-current", "true");
    open.innerHTML = '<i data-lucide="file-text" class="size-4 shrink-0 text-muted"></i>';
    open.append(
      el("span", "min-w-0 flex-1 truncate", entry.name),
      el("span", "shrink-0 text-xs text-muted", `${entry.words.length} từ`)
    );
    open.onclick = event => {
      event.stopPropagation();
      openSaved(entry);
    };

    const makeBtn = (icon, title, onClick, extra = "") => {
      const button = mkBtn(
        `${iconBtn} text-muted ${extra}`,
        title,
        `<i data-lucide="${icon}" class="size-4"></i>`
      );
      button.onclick = event => {
        event.stopPropagation();
        onClick();
      };
      return button;
    };

    row.append(
      open,
      makeBtn("pencil", `Đổi tên “${entry.name}”`, () => renameSaved(entry)),
      makeBtn(
        "trash-2",
        `Xóa tệp “${entry.name}”`,
        () => {
          savedSentences = savedSentences.filter(s => s.id !== entry.id);
          if (currentSavedId === entry.id) currentSavedId = null;
          persist();
          renderSavedSentences();
        },
        "hover:text-red-500"
      )
    );

    return row;
  };

  const renderFilesBody = body => {
    if (!savedSentences.length) {
      body.replaceChildren(
        el("p", "py-6 text-center text-sm text-muted", "Chưa có tệp nào được lưu.")
      );
      return;
    }

    body.replaceChildren(
      el(
        "div",
        "flex flex-col divide-y divide-[color-mix(in_srgb,var(--text)_12%,transparent)]",
        "",
        ...savedSentences.map(buildSavedSentence)
      )
    );
  };

  function renderSavedSentences() {
    filesLabel.textContent = `Tệp · ${savedSentences.length}`;

    if (modal?.kind === "files") modal.refresh();

    refreshSentenceUi();

    if (window.lucide) lucide.createIcons();
  }

  filesBtn.onclick = event => {
    event.stopPropagation();
    openModal("Tệp đã lưu", renderFilesBody, "files");
  };

  const renderLegendBody = body => {
    const used = usedSentenceColors();
    const usedSet = new Set(used);

    const order = [
      ...new Set([
        ...used,
        ...docWords.map(word => word.color).filter(Boolean),
        ...Object.keys(colorLegend),
        ...PALETTE,
        GRADIENT
      ])
    ];

    body.replaceChildren(
      el(
        "div",
        "flex flex-col gap-2",
        "",
        ...order.map(color => {
          const dot = el("span", `size-6 shrink-0 rounded-full ${BORDER}`);
          paintBackground(dot, color);

          const input = el("input", `${FIELD} flex-1`);
          input.type = "text";
          input.maxLength = MAX_LEGEND_LEN;
          input.value = colorLegend[color] || "";
          input.placeholder = "Ý nghĩa của màu này…";
          input.setAttribute("aria-label", `Chú giải màu ${color}`);

          input.addEventListener("input", () => {
            const text = input.value.replace(/\s+/g, " ").trim().slice(0, MAX_LEGEND_LEN);
            if (text) colorLegend[color] = text;
            else delete colorLegend[color];

            schedulePersist();
            refreshLegendStrip();
          });

          input.addEventListener("keydown", event => {
            if (event.isComposing) return;
            if (event.key === "Enter") event.preventDefault();
          });

          return el(
            "div",
            "flex items-center gap-2",
            "",
            dot,
            input,
            ...(usedSet.has(color)
              ? [el("span", "shrink-0 text-xs text-muted", "trong tệp")]
              : [])
          );
        })
      )
    );
  };

  const insertLegendIntoDocument = () => {
    const items = usedSentenceColors().filter(color => colorLegend[color]);

    if (!items.length) {
      showToast("Hãy đặt chú giải cho màu đang dùng trong tệp trước");
      return;
    }

    const added = [
      ...(sentenceBlocks.length ? [{ type: "p", runs: [] }] : []),
      { type: "h4", runs: [{ text: "Chú giải" }] },
      ...items.map(color => ({
        type: "p",
        runs: [
          color === GRADIENT ? { text: "■ ", gradient: true } : { text: "■ ", color },
          { text: colorLegend[color] }
        ]
      }))
    ];

    setDocument([...sentenceBlocks, ...added], docWords, currentSavedId);
    closeModal();
    showToast("Đã chèn chú giải vào cuối tệp");
  };

  function openLegendModal() {
    const insertBtn = mkBtn(
      toolBtnClass,
      "",
      '<i data-lucide="plus" class="size-4"></i><span class="text-sm font-semibold">Chèn vào tệp</span>'
    );
    insertBtn.onclick = event => {
      event.stopPropagation();
      insertLegendIntoDocument();
    };

    const footer = el(
      "div",
      "flex flex-wrap items-center justify-between gap-2",
      "",
      el(
        "span",
        "min-w-0 flex-1 text-xs text-muted",
        "Bấm nút “Bật/tắt chú giải màu” trên thanh công cụ để xem chú giải ở bên trái (không hiển thị trong tài liệu)."
      ),
      insertBtn
    );

    openModal("Chú giải màu", renderLegendBody, "legend", footer);
  }

  legendBtn.onclick = event => {
    event.stopPropagation();
    openLegendModal();
  };

  const paletteRow = el("div", "flex flex-wrap items-center gap-2");
  let customColor = "#06b6d4";

  const attachSwatchDrag = (swatch, getColor) => {
    swatch.style.touchAction = "none";

    swatch.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const color = getColor();

      startDrag(swatch, event, {
        lift: 1.25,
        targets: "[data-word]",
        makeGhost: () => {
          const ghost = el(
            "div",
            "size-10 rounded-full border-2 border-white/70 flex items-center " +
            "justify-center font-bold text-muted"
          );
          if (color) paintBackground(ghost, color);
          else {
            ghost.classList.add("bg-bg");
            ghost.textContent = "✕";
          }
          return ghost;
        },
        onPick: () => { suppressClick = true; },
        onEnd: releaseClick,
        onDrop: node => setWordColor(node.dataset.word, color)
      });
    });
  };

  const buildSwatch = (getColor, title) => {
    const swatch = mkBtn(
      "size-8 shrink-0 rounded-full border-2 cursor-grab shadow transition hover:scale-110 " +
      `border-[color-mix(in_srgb,var(--text)_25%,transparent)] ${FOCUS}`,
      title
    );

    const color = getColor();
    if (color) {
      paintBackground(swatch, color);
    } else {
      swatch.classList.add("bg-bg", "text-muted", "text-xs", "font-bold");
      swatch.textContent = "✕";
    }

    swatch.addEventListener("mousedown", event => event.preventDefault());

    swatch.onclick = event => {
      event.stopPropagation();
      if (suppressClick) return;
      if (applyColorToSelection(getColor())) return;
      showToast("Kéo màu vào thẻ chữ, hoặc bôi đen chữ / chọn ảnh trong tệp rồi bấm màu");
    };

    attachSwatchDrag(swatch, getColor);
    return swatch;
  };

  const customSwatch = buildSwatch(() => customColor, "Màu tùy chỉnh (kéo vào thẻ chữ)");
  customSwatch.style.backgroundColor = customColor;

  const paletteSwatches = PALETTE.map(color =>
    buildSwatch(() => color, `Màu ${color} (kéo vào thẻ chữ)`)
  );

  const palettePipette = makePipette(
    "Chọn màu tùy chỉnh",
    "flex items-center justify-center size-8 shrink-0 rounded-full border-2 text-muted " +
    "transition hover:scale-110 hover:text-text " +
    `border-[color-mix(in_srgb,var(--text)_25%,transparent)] ${FOCUS}`,
    {
      onInput: value => {
        customColor = value;
        customSwatch.style.backgroundColor = customColor;
      }
    }
  );
  palettePipette.input.value = customColor;

  paletteRow.append(
    el("span", "mr-1 text-xs font-semibold uppercase tracking-wide text-muted", "Màu"),
    ...paletteSwatches,
    buildSwatch(
      () => GRADIENT,
      "Gradient như logo Mixer (kéo vào thẻ chữ, hoặc bôi đen chữ trong tệp rồi bấm)"
    ),
    customSwatch,
    palettePipette.wrap,
    buildSwatch(() => null, "Xóa màu (kéo vào thẻ chữ)")
  );

  const setWordColor = (wordId, color) => {
    const word = docWords.find(w => w.id === wordId);
    if (!word) return;

    word.color = color || null;

    commitWords();
    syncLinkedWord(word, { color: true });
    showToast(color ? `Đã đổi màu “${word.word}”` : `Đã xóa màu “${word.word}”`);
  };

  const WORD_TOOL_LABELS = {
    bold: "in đậm",
    italic: "in nghiêng",
    underline: "gạch chân",
    upper: "VIẾT HOA",
    lower: "viết thường",
    plain: "xóa định dạng"
  };

  const applyWordTool = (wordId, tool) => {
    const word = docWords.find(w => w.id === wordId);
    if (!word) return;

    let sync;

    if (tool === "upper" || tool === "lower") {
      const transform = text =>
        tool === "upper" ? text.toLocaleUpperCase("vi") : text.toLocaleLowerCase("vi");
      word.word = transform(word.word);
      sync = { transform };
    } else if (tool === "plain") {
      word.bold = false;
      word.italic = false;
      word.underline = false;
      word.color = null;
      sync = { color: true, format: true };
    } else {
      word[tool] = !word[tool];
      sync = { format: true };
    }

    commitWords();
    syncLinkedWord(word, sync);
    showToast(`Đã áp dụng ${WORD_TOOL_LABELS[tool]} cho “${word.word}”`);
  };

  const attachToolDrag = (btn, tool) => {
    btn.style.touchAction = "none";

    btn.addEventListener(
      "click",
      event => {
        if (!suppressClick) return;
        event.stopImmediatePropagation();
        event.preventDefault();
      },
      true
    );

    btn.addEventListener("pointerdown", event => {
      startDrag(btn, event, {
        lift: 1.2,
        targets: "[data-word]",
        makeGhost: () => {
          const ghost = btn.cloneNode(true);
          ghost.removeAttribute("aria-pressed");
          ghost.classList.add("bg-bg");
          return ghost;
        },
        onPick: () => { suppressClick = true; },
        onEnd: releaseClick,
        onDrop: node => applyWordTool(node.dataset.word, tool)
      });
    });
  };

  const toolsRow = el("div", "flex flex-wrap items-center gap-2");

  [
    ["bold", "bold", "Đậm", "Kéo vào thẻ chữ để in đậm"],
    ["italic", "italic", "Nghiêng", "Kéo vào thẻ chữ để in nghiêng"],
    ["underline", "underline", "Gạch chân", "Kéo vào thẻ chữ để gạch chân"],
    ["case-upper", "upper", "HOA", "Kéo vào thẻ chữ để VIẾT HOA"],
    ["case-lower", "lower", "thường", "Kéo vào thẻ chữ để viết thường"],
    ["remove-formatting", "plain", "Xóa định dạng", "Kéo vào thẻ chữ để xóa định dạng và màu"]
  ].forEach(([icon, tool, label, title]) => {
    const chip = mkBtn(
      `${toolBtnClass} cursor-grab`,
      title,
      `<i data-lucide="${icon}" class="size-4"></i><span class="text-sm font-semibold">${label}</span>`
    );
    chip.addEventListener("mousedown", event => event.preventDefault());
    chip.onclick = event => {
      event.stopPropagation();
      showToast("Kéo nút này vào một thẻ chữ để áp dụng");
    };
    attachToolDrag(chip, tool);
    toolsRow.append(chip);
  });

  toolsRow.prepend(
    el("span", "mr-1 text-xs font-semibold uppercase tracking-wide text-muted", "Định dạng")
  );

  const dragBar = el(
    "div",
    "sticky top-0 z-10 flex flex-col gap-3 bg-bg pb-3 " +
    "border-b border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
    "",
    el(
      "div",
      "flex flex-wrap items-center gap-2",
      "",
      wordsCount,
      clearWordsBtn,
      el(
        "span",
        "ml-auto min-w-0 text-xs text-muted",
        "Kéo màu hoặc nút định dạng vào thẻ chữ bên dưới."
      )
    ),
    paletteRow,
    toolsRow
  );

  const wordsPanel = el("div", "flex flex-col", "", dragBar, wordsList);

  const openClipboard = () =>
    openModal(
      "Bộ nhớ tạm · màu và danh sách từ",
      body => body.replaceChildren(wordsPanel),
      "clipboard",
      null,
      true
    );

  bind(clipboardBtn, openClipboard);

  const legacyWordsSection = $("savedWords").closest("section");
  legacyWordsSection.after(sentenceEl);
  legacyWordsSection.style.display = "none";

  applyPanels();
  renderWords();
  renderSentence();
  renderSavedSentences();
  persist();
}

init();

if (window.lucide) lucide.createIcons();