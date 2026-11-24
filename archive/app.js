const $ = id => document.getElementById(id);

const STORAGE_KEY = "mixer-app-state-v1";
const MIN_SLOTS = 3;
const MAX_ITEMS = 14;
const EDGE = 14;
const DRAG_THRESHOLD = 5;
const SHADOW = "shadow-[0_10px_30px_rgba(0,0,0,.22)]";
const BOX_H = "h-[min(36vw,13.34rem)]";
const BOX_W = "min-w-[min(24vw,10rem)]";

const FILL = {
  con: "bg-con text-con-t",
  vow: "bg-vow text-vow-t"
};

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
const HOVER_CLASSES = ["ring-4", "ring-hl", "scale-105"];
const COLLECTION_HOVER = ["ring-4", "ring-hl"];
const MAX_COLLECTIONS = 20;
const MAX_SENTENCE = 40;
const MAX_WORD_LEN = 100;
const MAX_IMPORT_WORDS = 500;
const MAX_IMPORT_SIZE = 2 * 1024 * 1024;
const MAX_SAVED_SENTENCES = 50;
const MAX_NAME_LEN = 80;
const MAX_LEGEND_LEN = 60;

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

const cleanSrc = value =>
  typeof value === "string" && value.length <= 900000 && IMG_SRC_RE.test(value) ? value : null;

const cleanWidth = value => {
  const n = Number(value);
  return Number.isFinite(n) && n >= MIN_IMG_W && n <= MAX_IMG_W ? Math.round(n) : null;
};

const GRADIENT = "gradient";
const GRADIENT_CSS = "linear-gradient(to right, var(--con), var(--vow))";
const GRADIENT_STYLE =
  `background-image:${GRADIENT_CSS};-webkit-background-clip:text;background-clip:text;` +
  "-webkit-text-fill-color:transparent;color:transparent";
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

// Tạo span chữ liên kết (data-wid) với một thẻ chữ, tô màu theo màu hiện tại của thẻ.
const makeLinkedSpan = (wordId, color) => {
  const span = document.createElement("span");
  span.dataset.wid = wordId;
  paintText(span, cleanWordColor(color));
  return span;
};

// Bọc đoạn [start, end) của một text node bằng `span` (tách node nếu cần).
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
  (a.wid || null) === (b.wid || null);

let TONES = [];
let savedWords = [];
let restoredSlots = null;
let collections = [];
let sentenceBlocks = [];
let savedSentences = [];
let currentSavedId = null;
let colorLegend = {};
let markedCollectionId = null;

const DEFAULT_DOC_SIZE = 18;
let docSize = DEFAULT_DOC_SIZE;
let docFont = DEFAULT_DOC_FONT;

// Chữ trong tệp có thể liên kết (wid) với một thẻ chữ trong danh sách từ:
// màu của chữ luôn lấy theo màu hiện tại của thẻ chữ đó.
const cleanRun = run => {
  if (!run || typeof run.text !== "string") return null;

  const text = run.text.replace(/\u00a0/g, " ").replace(/[\u200b\r]/g, "");
  if (!text) return null;

  const word =
    typeof run.wid === "string" && run.wid
      ? savedWords.find(w => w.id === run.wid) || null
      : null;

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
    wid: word ? word.id : null
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
        // Màu đặt thủ công bên trong chữ liên kết => gỡ liên kết.
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
      wid: null
    })
  );

  return cleanRuns(runs);
}

function appendRuns(runs, container) {
  runs.forEach(run => {
    const styled =
      run.color || run.bold || run.italic || run.underline || run.size || run.font ||
      run.gradient || run.wid;

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

const reduceMotion =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const BLOCK_TYPES = ["p", "h1", "h2", "h3", "h4", "ul", "ol", "quote", "cite", "img", "table"];
const ALIGNS = ["left", "center", "right", "justify"];
const SPECIAL_KINDS = ["quote", "cite"];

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

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);

    if (Array.isArray(data.savedWords)) {
      savedWords = data.savedWords
        .filter(item => item && typeof item.word === "string")
        .map(item => ({
          id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
          word: item.word,
          parts: Array.isArray(item.parts)
            ? item.parts.filter(part => typeof part === "string")
            : null,
          color: cleanWordColor(item.color)
        }));
    }

    if (Array.isArray(data.collections)) {
      collections = data.collections
        .filter(c => c && typeof c.name === "string")
        .map(c => ({
          id: typeof c.id === "string" ? c.id : crypto.randomUUID(),
          name: c.name.slice(0, 40),
          color: cleanColor(c.color),
          wordIds: Array.isArray(c.wordIds)
            ? c.wordIds.filter(id => typeof id === "string")
            : []
        }))
        .slice(0, MAX_COLLECTIONS);

      const known = new Set(savedWords.map(word => word.id));
      const seen = new Set();

      collections.forEach(col => {
        col.wordIds = col.wordIds.filter(id => {
          if (!known.has(id) || seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        if (col.color) {
          col.wordIds.forEach(id => {
            const word = savedWords.find(w => w.id === id);
            if (word && !word.color) word.color = col.color;
          });
        }
        delete col.color;
      });
    }

    if (
      typeof data.markedCollectionId === "string" &&
      collections.some(c => c.id === data.markedCollectionId)
    ) {
      markedCollectionId = data.markedCollectionId;
    }

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
          const blocks = Array.isArray(entry?.blocks)
            ? cleanBlocks(entry.blocks)
            : Array.isArray(entry?.runs)
              ? runsToBlocks(cleanRuns(entry.runs))
              : Array.isArray(entry?.items)
                ? runsToBlocks(
                  legacyToRuns(entry.items.map(cleanItem).filter(Boolean).slice(0, MAX_SENTENCE))
                )
                : [];

          if (!blocks.length) return null;

          return {
            id: typeof entry.id === "string" ? entry.id : crypto.randomUUID(),
            name:
              typeof entry?.name === "string" && entry.name.trim()
                ? cleanName(entry.name)
                : defaultSentenceName(blocks),
            blocks
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

    colorLegend = cleanLegend(data.colorLegend);

    docSize = cleanSize(data.docSize) ?? DEFAULT_DOC_SIZE;
    docFont = cleanFont(data.docFont) ?? DEFAULT_DOC_FONT;

    if (Array.isArray(data.slots)) {
      const list = [];

      data.slots.forEach((slot, index) => {
        if (slot?.kind === "space") {
          list.push({ kind: "space" });
          return;
        }

        list.push({
          kind: "sound",
          value: typeof slot?.value === "string" ? slot.value : "",
          locked: Boolean(slot?.locked)
        });

        if (slot?.split && index < data.slots.length - 1) {
          list.push({ kind: "space" });
        }
      });

      restoredSlots = list.slice(0, MAX_ITEMS);
    }
  } catch (error) {
    console.warn("Không thể đọc dữ liệu Mixer đã lưu:", error);
    savedWords = [];
    collections = [];
    sentenceBlocks = [];
    savedSentences = [];
    currentSavedId = null;
    colorLegend = {};
    markedCollectionId = null;
    restoredSlots = null;
    docSize = DEFAULT_DOC_SIZE;
    docFont = DEFAULT_DOC_FONT;
  }
}

function persist(slots) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 14,
        docSize,
        docFont,
        savedWords,
        collections,
        sentenceBlocks,
        savedSentences,
        currentSavedId,
        colorLegend,
        markedCollectionId,
        slots: slots.map(({ kind, value, locked }) =>
          kind === "space" ? { kind } : { kind, value, locked }
        )
      })
    );
  } catch (error) {
    console.error("Không thể lưu dữ liệu Mixer:", error);
    showStorageWarning();
  }
}

function showStorageWarning() {
  const result = $("result");
  if (!result) return;
  result.title =
    "Trình duyệt không thể lưu dữ liệu. Hãy kiểm tra chế độ riêng tư hoặc dung lượng lưu trữ.";
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

const stripTones = value => {
  let text = "";
  let mark = "";

  for (const char of value.normalize("NFD")) {
    if (TONES.some(tone => tone.mark === char)) mark = char;
    else text += char;
  }

  return { text: text.normalize("NFC"), mark };
};

const applyTone = (value, mark) => {
  if (!mark) return value;

  const chars = [...value.normalize("NFC")];

  const shapedIndex = chars.reduce(
    (result, char, index) => (/[ăâêôơư]/.test(char) ? index : result),
    -1
  );

  const index = shapedIndex >= 0 ? shapedIndex : chars.length === 3 ? 1 : 0;

  chars[index] = (chars[index].normalize("NFD") + mark).normalize("NFC");
  return chars.join("");
};

const slugify = text =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "bo-suu-tap";

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
            : tag === "BLOCKQUOTE" || kind === "quote"
              ? "quote"
              : kind === "cite"
                ? "cite"
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

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const poseAt = (tx, ty, rz, rx, ry, s) =>
  `translate3d(${tx}px, ${ty}px, 0) perspective(900px) ` +
  `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;

function startDrag(srcEl, down, o = {}) {
  const {
    makeGhost, lift = 1.1, dim = false, fade = false,
    onPick, onDrop, onCancel, onEnd, canDrop, onFrame,
    targets = "[data-slot]"
  } = o;

  if (down.pointerType === "mouse" && down.button !== 0) return;

  const pointerId = down.pointerId;
  const rect = srcEl.getBoundingClientRect();

  let w = rect.width;
  let h = rect.height;
  let grabX = down.clientX - rect.left;
  let grabY = down.clientY - rect.top;

  let tx = down.clientX, ty = down.clientY;
  let x = tx, y = ty;
  let rz = 0, rx = 0, ry = 0;
  let scale = makeGhost ? 0.85 : 1;

  let ghost = null, raf = 0, last = 0;
  let hover = null;
  let dragging = false, finished = false;

  const pose = () => poseAt(x - grabX, y - grabY, rz, rx, ry, scale);

  const hoverClasses = node =>
    node.dataset.sentence !== undefined
      ? []
      : node.dataset.slot !== undefined
        ? HOVER_CLASSES
        : COLLECTION_HOVER;

  const setHover = node => {
    if (hover === node) return;
    if (hover) hover.classList.remove(...hoverClasses(hover));
    hover = node;
    if (hover) hover.classList.add(...hoverClasses(hover));
  };

  const findSlot = () => {
    const node = document.elementFromPoint(tx, ty)?.closest(targets);
    return node && (!canDrop || canDrop(node)) ? node : null;
  };

  const begin = () => {
    dragging = true;

    if (makeGhost) {
      ghost = makeGhost();
    } else {
      ghost = srcEl.cloneNode(true);
      ghost.removeAttribute("data-slot");
      ghost.removeAttribute("data-chip");
      ghost.removeAttribute("data-word");
      ghost.removeAttribute("id");
      ghost.classList.remove("relative", "ring-4", "ring-hl", "scale-105", "transition");
    }

    ghost.classList.add("pointer-events-none", "cursor-grabbing");

    Object.assign(ghost.style, {
      position: "fixed",
      left: "0",
      top: "0",
      margin: "0",
      zIndex: "65",
      pointerEvents: "none",
      transformOrigin: "50% 50%",
      willChange: "transform",
      boxShadow: SHADOW_REST,
      transition: "box-shadow 160ms ease-out",
      transform: "translate3d(-9999px,-9999px,0)"
    });

    if (!makeGhost) {
      ghost.style.width = `${w}px`;
      ghost.style.height = `${h}px`;
    }

    document.body.append(ghost);

    if (makeGhost) {
      const r = ghost.getBoundingClientRect();
      w = r.width; h = r.height;
      grabX = w / 2; grabY = h / 2;
      x = tx; y = ty;
    }

    ghost.style.transform = pose();
    ghost.getBoundingClientRect();
    ghost.style.boxShadow = SHADOW_LIFT;

    if (dim) srcEl.style.opacity = "0.4";

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
    onFrame?.(tx, ty);
    raf = requestAnimationFrame(tick);
  };

  const onMove = e => {
    if (e.pointerId !== pointerId) return;
    tx = e.clientX; ty = e.clientY;

    if (!dragging) {
      if (Math.hypot(tx - down.clientX, ty - down.clientY) < DRAG_THRESHOLD) return;
      begin();
    }

    setHover(findSlot());
  };

  const onUp = e => {
    if (e.pointerId !== pointerId) return;
    tx = e.clientX; ty = e.clientY;
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
    cleanup();

    if (!dragging) return;

    cancelAnimationFrame(raf);

    const target = allowDrop ? findSlot() : null;
    const point = { x: tx, y: ty };
    setHover(null);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    srcEl.style.opacity = "";

    onEnd?.();

    const done = () => {
      ghost.remove();
      target ? onDrop?.(target, point) : onCancel?.();
    };

    if (reduceMotion) return done();

    const soft = fade || Boolean(target && target.dataset.slot === undefined);

    const dest = target ? target.getBoundingClientRect() : rect;
    const endTx = dest.left + dest.width / 2 - w / 2;
    const endTy = dest.top + dest.height / 2 - h / 2;
    const endScale = soft
      ? (target ? 0.6 : 0.85)
      : target ? Math.min(dest.width / w, dest.height / h) : 1;

    const from = ghost.style.transform;
    ghost.style.transition = "none";

    const anim = ghost.animate(
      [
        { transform: from, boxShadow: SHADOW_LIFT, opacity: 1 },
        {
          transform: poseAt(endTx, endTy, 0, 0, 0, endScale),
          boxShadow: SHADOW_REST,
          opacity: soft ? 0 : 1
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

function init({ phonetics: phoneticsData }) {
  TONES = phoneticsData.tones || [];

  const applyDocDefaults = () => {
    const root = document.documentElement.style;
    root.setProperty("--doc-size", `${docSize}px`);
    root.setProperty("--doc-font", FONT_MAP.get(docFont || DEFAULT_DOC_FONT).css);
  };

  applyDocDefaults();

  const tag = (groups, type) =>
    Object.entries(groups || {}).flatMap(([key, list]) =>
      list.map(value => ({ v: value, type, k: key }))
    );

  const sounds = [
    ...tag(phoneticsData.consonants, "con"),
    ...tag(phoneticsData.vowels, "vow")
  ];

  const GROUPS = [
    { title: "Phụ âm", type: "con" },
    { title: "Nguyên âm", type: "vow" }
  ]
    .map(group => ({
      ...group,
      items: sounds.filter(sound => sound.type === group.type)
    }))
    .filter(group => group.items.length);

  const typeOf = Object.fromEntries(sounds.map(sound => [sound.v, sound.type]));

  const makeSound = (value = "", locked = false) => {
    const type = value ? typeOf[stripTones(value).text] : undefined;
    return {
      kind: "sound",
      value: type ? value : "",
      type,
      locked: Boolean(locked)
    };
  };

  const makeSpace = () => ({ kind: "space" });

  const slotEls = new WeakMap();

  const slots = (restoredSlots || []).map(saved =>
    saved.kind === "space"
      ? makeSpace()
      : makeSound(saved.value, saved.locked)
  );

  const soundCount = () => slots.filter(s => s.kind === "sound").length;

  while (soundCount() < MIN_SLOTS) slots.push(makeSound());

  const numberOf = index =>
    slots.slice(0, index).filter(s => s.kind === "sound").length + 1;

  const labelOf = index => `ô ${numberOf(index)}`;

  const soundIndices = () =>
    slots.reduce((list, slot, index) => {
      if (slot.kind === "sound") list.push(index);
      return list;
    }, []);

  const getWords = () => {
    const words = [""];

    slots.forEach(slot => {
      if (slot.kind === "space") words.push("");
      else words[words.length - 1] += slot.value;
    });

    return words.filter(Boolean).map(word => word.normalize("NFC"));
  };

  const getParts = () => {
    const parts = [];

    slots.forEach(slot => {
      if (slot.kind === "space") {
        if (parts.length && parts[parts.length - 1] !== " ") parts.push(" ");
      } else if (slot.value) {
        parts.push(slot.value);
      }
    });

    while (parts[parts.length - 1] === " ") parts.pop();
    return parts;
  };

  const parseWord = word => {
    const chars = [...word.normalize("NFC")];
    const parts = [];
    let pos = 0;

    while (pos < chars.length) {
      if (chars[pos] === " ") {
        if (parts.length && parts[parts.length - 1] !== " ") parts.push(" ");
        pos++;
        continue;
      }

      let found = 0;

      for (let len = Math.min(4, chars.length - pos); len >= 1; len--) {
        const piece = chars.slice(pos, pos + len).join("");
        if (typeOf[stripTones(piece).text]) {
          parts.push(piece);
          found = len;
          break;
        }
      }

      pos += found || 1;
    }

    while (parts[parts.length - 1] === " ") parts.pop();
    return parts;
  };

  const partsOf = item => (item.parts?.length ? item.parts : parseWord(item.word));

  let active = -1;
  let keyEls = [];

  $("row").className =
    "flex flex-wrap justify-center items-start gap-x-0.5 gap-y-4";
  $("groups").className = "flex flex-col gap-5 w-full min-w-0";
  $("result").classList.add("text-center");

  $("savedWords").dataset.wordlist = "1";

  const toast = el(
    "div",
    "fixed left-1/2 bottom-6 z-[70] -translate-x-1/2 px-4 py-2 rounded-full " +
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

  const toolBtnClass =
    `flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold ${BORDER} text-text ` +
    "transition hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl";

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

  const askName = ({ title, defaultValue, suffix = "", okText = "OK", clean }) =>
    new Promise(resolve => {
      const overlay = el(
        "div",
        "fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
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
      input.maxLength = MAX_NAME_LEN;
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

  const addSoundBtn = mkBtn(
    toolBtnClass,
    "Thêm ô nhập",
    '<i data-lucide="plus" class="size-4"></i><span class="text-sm font-semibold">Ô</span>'
  );
  const addSpaceBtn = mkBtn(
    toolBtnClass,
    "Thêm dấu cách",
    '<span class="size-2.5 rounded-full bg-hl"></span><span class="text-sm font-semibold">Cách</span>'
  );
  const clearBtn = mkBtn(
    toolBtnClass,
    "Làm sạch các ô",
    '<i data-lucide="eraser" class="size-4"></i><span class="text-sm font-semibold">Làm sạch</span>'
  );

  const toolbar = el(
    "div",
    "ml-auto flex items-center gap-2",
    "",
    addSoundBtn,
    addSpaceBtn,
    clearBtn
  );

  const headerEl = document.querySelector("header");
  if (headerEl) headerEl.append(toolbar);
  else $("row").before(toolbar);

  addSoundBtn.onclick = event => {
    event.stopPropagation();
    if (slots.length >= MAX_ITEMS) return;
    slots.push(makeSound());
    persist(slots);
    open(slots.length - 1);
  };

  addSpaceBtn.onclick = event => {
    event.stopPropagation();
    if (slots.length >= MAX_ITEMS) return;
    close();
    slots.push(makeSpace());
    persist(slots);
    render();
  };

  clearBtn.onclick = event => {
    event.stopPropagation();
    close();

    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i].kind === "space") slots.splice(i, 1);
    }

    slots.forEach(slot => {
      if (slot.locked) return;
      slot.value = "";
      slot.type = undefined;
    });

    persist(slots);
    render();
  };

  const buildRemove = (index, text) => {
    const button = mkBtn(
      "flex items-center justify-center size-9 rounded-full text-muted " +
      `hover:bg-red-500/10 hover:text-red-500 ${FOCUS}`,
      text,
      '<i data-lucide="x" class="size-4"></i>'
    );

    button.onclick = event => {
      event.stopPropagation();
      close();
      slots.splice(index, 1);
      persist(slots);
      render();
    };

    return button;
  };

  const prepareMove = (from, to) => {
    if (from === to) return false;

    const a = slots[from];
    const b = slots[to];
    if (a?.kind !== "sound" || b?.kind !== "sound") return false;

    if (b.locked && !a.locked) {
      showToast("Ô đích đang bị khóa");
      return false;
    }

    if (active >= 0) {
      active = -1;
      $("panel").classList.replace("flex", "hidden");
    }

    return true;
  };

  const moveSound = (from, to) => {
    if (!prepareMove(from, to)) return;
    [slots[from], slots[to]] = [slots[to], slots[from]];
    persist(slots);
  };

  const moveEmptySlot = (from, to) => {
    if (!prepareMove(from, to)) return;
    slots.splice(to, 0, slots.splice(from, 1)[0]);
    persist(slots);
  };

  const loadParts = (parts, start) => {
    if (!parts.length) return;

    close();

    let i = clamp(start, 0, slots.length);
    let overflow = false;

    for (const part of parts) {
      if (part === " ") {
        if (slots[i]?.kind === "space") {
          i++;
        } else if (slots.length < MAX_ITEMS) {
          slots.splice(i, 0, makeSpace());
          i++;
        } else {
          overflow = true;
        }
        continue;
      }

      for (; ;) {
        const slot = slots[i];
        if (!slot) break;
        if (slot.kind === "space") { slots.splice(i, 1); continue; }
        if (slot.locked) { i++; continue; }
        break;
      }

      if (!slots[i]) {
        if (slots.length >= MAX_ITEMS) { overflow = true; break; }
        slots.push(makeSound());
      }

      slots[i].value = part;
      slots[i].type = typeOf[stripTones(part).text];
      i++;
    }

    persist(slots);
    render();

    if (overflow) showToast("Không đủ chỗ cho cả từ");
  };

  let suppressClick = false;
  const releaseClick = () => setTimeout(() => { suppressClick = false; }, 60);

  const attachDrag = (box, index) => {
    const slot = slots[index];
    const empty = !slot.value;

    box.style.touchAction = "none";

    const onEdge = (x, y) => {
      const r = box.getBoundingClientRect();
      return Math.min(x - r.left, r.right - x, y - r.top, r.bottom - y) <= EDGE;
    };

    box.addEventListener("pointermove", event => {
      if (event.buttons) return;
      box.style.cursor = onEdge(event.clientX, event.clientY) ? "grab" : "";
    });

    box.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (!empty && !onEdge(event.clientX, event.clientY)) return;

      const savedClass = box.className;
      const textNode = [...box.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      const savedText = textNode ? textNode.textContent : "";

      const emptyBox = () => {
        if (textNode) textNode.textContent = "";
        box.classList.remove(...(FILL[slot.type]?.split(" ") ?? []), "ring-4", "ring-hl");
        box.classList.add("bg-bg", "text-muted");
        box.style.cursor = "";
      };

      const restoreBox = () => {
        if (textNode) textNode.textContent = savedText;
        box.className = savedClass;
      };

      startDrag(box, event, {
        lift: 1.12,
        dim: empty,
        canDrop: node => Number(node.dataset.slot) !== index,
        onPick: () => {
          suppressClick = true;
          if (!empty) emptyBox();
        },
        onEnd: releaseClick,
        onDrop: node => {
          const to = Number(node.dataset.slot);
          flipRender(() => {
            if (empty) moveEmptySlot(index, to);
            else moveSound(index, to);
          });
        },
        onCancel: () => {
          if (!empty) restoreBox();
        }
      });
    });
  };

  const sentenceString = () => blocksToText(sentenceBlocks);

  const wordColor = wordId =>
    savedWords.find(word => word.id === wordId)?.color || null;

  const attachWordDrag = (card, item, collectionId = null) => {
    card.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (event.target.closest("button")) return;
      if (event.pointerType !== "mouse" && !event.target.closest("[data-grip]")) return;

      startDrag(card, event, {
        lift: 1.08,
        dim: true,
        targets: "[data-slot],[data-collection],[data-wordlist],[data-sentence]",
        canDrop: node => {
          if (node.dataset.collection !== undefined) {
            return node.dataset.collection !== collectionId;
          }
          if (node.dataset.wordlist !== undefined) return Boolean(collectionId);
          return true;
        },
        onPick: () => { suppressClick = true; },
        onFrame: (x, y) => updateDropCaret(x, y),
        onEnd: () => {
          hideDropCaret();
          releaseClick();
        },
        onDrop: (node, point) => {
          if (node.dataset.collection !== undefined) {
            addToCollection(node.dataset.collection, item.id);
          } else if (node.dataset.wordlist !== undefined) {
            removeFromCollection(collectionId, item.id);
          } else if (node.dataset.sentence !== undefined) {
            insertWordIntoEditor(item, point, wordColor(item.id));
          } else {
            loadParts(partsOf(item), Number(node.dataset.slot));
          }
        }
      });
    });
  };

  const buildSlot = index => {
    const slot = slots[index];
    const number = numberOf(index);

    const wrapper = el("div", "flex flex-col items-center gap-2");
    slotEls.set(slot, wrapper);

    const box = el(
      "button",
      `relative flex items-center justify-center ${BOX_H} ${BOX_W} px-[.2em] ` +
      `rounded-[2rem] text-[min(15vw,6.5rem)] font-bold transition ${SHADOW} ` +
      (slot.value ? FILL[slot.type] : "bg-bg text-muted") +
      (active === index ? " ring-4 ring-hl" : "") +
      (slot.locked ? " opacity-90" : "") +
      " focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-hl",
      slot.value
    );

    box.type = "button";
    box.dataset.slot = String(index);
    box.setAttribute("aria-label", `Chọn ${labelOf(index)}`);

    if (number <= 9) {
      const badge = el(
        "span",
        "absolute top-3 left-4 text-xs font-semibold leading-none opacity-60 pointer-events-none",
        String(number)
      );
      box.append(badge);
    }

    box.onclick = event => {
      event.stopPropagation();

      if (suppressClick) return;

      if (slot.locked) {
        showToast(`Ô ${number} đang bị khóa`);
        return;
      }

      active === index ? close() : open(index);
    };

    attachDrag(box, index);

    const actions = el("div", "flex items-center gap-1");

    const lockText = slot.locked
      ? `Mở khóa ${labelOf(index)}`
      : `Khóa ${labelOf(index)}`;

    const lockButton = mkBtn(
      "flex items-center justify-center size-9 rounded-full " +
      "hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] " +
      `${FOCUS} ${slot.locked ? "text-con" : "text-muted"}`,
      lockText,
      `<i data-lucide="${slot.locked ? "lock" : "lock-open"}" class="size-4"></i>`
    );

    lockButton.onclick = event => {
      event.stopPropagation();
      slot.locked = !slot.locked;
      if (slot.locked && active === index) close();
      persist(slots);
      render();
    };

    actions.append(lockButton);

    if (soundCount() > MIN_SLOTS) {
      actions.append(buildRemove(index, `Xóa ${labelOf(index)}`));
    }

    wrapper.append(box, actions);
    return wrapper;
  };

  const buildSpace = index => {
    const wrapper = el("div", "flex flex-col items-center gap-2");
    slotEls.set(slots[index], wrapper);

    const dot = el(
      "div",
      `flex items-center justify-center ${BOX_H} w-6 sm:w-8`,
      "",
      el("span", "size-4 sm:size-5 rounded-full bg-hl")
    );

    dot.title = "Dấu cách";
    dot.setAttribute("role", "img");
    dot.setAttribute("aria-label", "Dấu cách");

    wrapper.append(dot, buildRemove(index, "Xóa dấu cách"));
    return wrapper;
  };

  const canInsertAt = index =>
    index > 0 &&
    slots.length < MAX_ITEMS &&
    slots[index - 1].kind === "sound" &&
    slots[index].kind === "sound";

  const buildGap = index => {
    const glow = el(
      "span",
      "pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-8 -translate-x-1/2 -translate-y-1/2 " +
      "opacity-0 blur-md transition-opacity duration-200 " +
      "bg-[radial-gradient(ellipse_at_center,var(--hl),transparent_70%)] " +
      "group-hover:opacity-70 group-focus-visible:opacity-70"
    );

    const bar = el(
      "span",
      "pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[3px] -translate-x-1/2 -translate-y-1/2 " +
      "rounded-full opacity-0 transition-opacity duration-200 " +
      "bg-[linear-gradient(to_bottom,transparent,var(--hl),transparent)] " +
      "group-hover:opacity-100 group-focus-visible:opacity-100"
    );

    const button = el(
      "button",
      `group relative z-10 flex items-center justify-center shrink-0 ${BOX_H} w-2 sm:w-3 ` +
      "focus-visible:outline-none",
      "",
      glow,
      bar
    );

    button.type = "button";
    button.title = "Chèn dấu cách";
    button.setAttribute("aria-label", "Chèn dấu cách vào đây");

    button.onclick = event => {
      event.stopPropagation();
      close();
      slots.splice(index, 0, makeSpace());
      persist(slots);
      render();
    };

    return button;
  };

  const render = () => {
    const row = $("row");
    row.replaceChildren();

    slots.forEach((slot, index) => {
      if (canInsertAt(index)) row.append(buildGap(index));

      row.append(slot.kind === "space" ? buildSpace(index) : buildSlot(index));
    });

    const full = slots.length >= MAX_ITEMS;
    addSoundBtn.disabled = full;
    addSpaceBtn.disabled = full;

    clearBtn.disabled = !slots.some(
      slot =>
        slot.kind === "space" ||
        (slot.kind === "sound" && slot.value && !slot.locked)
    );

    $("result").textContent = getWords().join(" ");

    const hasValue = slots.some(slot => slot.kind === "sound" && slot.value);
    $("confirm").disabled = !hasValue;
    $("confirm").classList.toggle("opacity-40", !hasValue);

    if (window.lucide) lucide.createIcons();
  };

  const flipRender = mutate => {
    const first = new Map();
    slots.forEach(slot => {
      const node = slotEls.get(slot);
      if (node?.isConnected) first.set(slot, node.getBoundingClientRect());
    });

    mutate();
    render();

    if (reduceMotion) return;

    slots.forEach(slot => {
      const before = first.get(slot);
      const node = slotEls.get(slot);
      if (!before || !node) return;

      const after = node.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (!dx && !dy) return;

      node.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
        { duration: 240, easing: "cubic-bezier(.2,.8,.3,1)" }
      );
    });
  };

  const choose = value => {
    if (active < 0) return;

    const slot = slots[active];
    if (!slot || slot.kind !== "sound" || slot.locked) return;

    slot.value = value;
    slot.type = value ? typeOf[stripTones(value).text] : undefined;

    persist(slots);
    close();
  };

  const confirmWord = () => {
    const words = getWords();
    if (!words.length) return;

    savedWords.push({
      id: crypto.randomUUID(),
      word: words.join(" "),
      parts: getParts()
    });

    slots.forEach(slot => {
      if (slot.kind !== "sound" || slot.locked) return;
      slot.value = "";
      slot.type = undefined;
    });

    active = -1;
    $("panel").classList.replace("flex", "hidden");

    persist(slots);
    renderSavedWords();
    render();
  };

  const playMixEffect = button => {
    if (reduceMotion) return;

    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    const waveMask =
      "radial-gradient(circle closest-side, " +
      "transparent 30%, " +
      "rgba(0,0,0,.18) 60%, " +
      "rgba(0,0,0,.55) 80%, " +
      "#000 88%, " +
      "transparent 100%)";

    const WAVES = [
      { delay: 0, alpha: 0.85 },
      { delay: 180, alpha: 0.5 }
    ];

    const DURATION = 1400;

    WAVES.forEach(({ delay, alpha }) => {
      const wave = el("div", "fixed z-[60] pointer-events-none rounded-full");

      Object.assign(wave.style, {
        left: `${cx - radius}px`,
        top: `${cy - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        background: "linear-gradient(to right, var(--con), var(--vow))",
        maskImage: waveMask,
        webkitMaskImage: waveMask,
        willChange: "transform, opacity",
        opacity: "0"
      });

      document.body.append(wave);

      const animation = wave.animate(
        [
          { transform: "scale(0)", opacity: alpha },
          { opacity: alpha * 0.55, offset: 0.5 },
          { transform: "scale(1)", opacity: 0 }
        ],
        {
          duration: DURATION,
          delay,
          easing: "cubic-bezier(.15,.55,.3,1)",
          fill: "backwards"
        }
      );

      animation.onfinish = () => wave.remove();
      animation.oncancel = () => wave.remove();
    });

    button.animate(
      [
        { boxShadow: "0 0 0 0 color-mix(in srgb, var(--con) 55%, transparent)" },
        { boxShadow: "0 0 0 16px color-mix(in srgb, var(--con) 0%, transparent)" }
      ],
      { duration: 450, easing: "ease-out" }
    );
  };

  $("confirm").addEventListener("click", event => {
    const button = event.currentTarget;
    if (button.disabled) return;

    playMixEffect(button);
    confirmWord();
  });

  const iconBtn =
    "flex items-center justify-center size-7 shrink-0 rounded-full opacity-70 " +
    `hover:opacity-100 hover:bg-black/15 ${FOCUS}`;

  const renderAll = () => {
    renderSavedWords();
    renderCollections();
  };

  // Gỡ liên kết giữa chữ trong tệp và các thẻ chữ sắp bị xóa (chữ giữ nguyên màu hiện tại).
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
    savedWords = savedWords.filter(word => !ids.has(word.id));
    collections.forEach(col => {
      col.wordIds = col.wordIds.filter(wordId => !ids.has(wordId));
    });
    persist(slots);
    renderAll();
  };

  const deleteWord = id => dropWords(new Set([id]));

  const clearListedWords = () => {
    const words = listedWords();
    if (!words.length) return;

    if (
      !window.confirm(
        `Xóa tất cả ${words.length} từ trong danh sách từ? ` +
        "(Các từ nằm trong bộ sưu tập sẽ được giữ lại.)"
      )
    ) {
      return;
    }

    dropWords(new Set(words.map(word => word.id)));
    showToast(`Đã xóa ${words.length} từ`);
  };

  const clearWordsBtn = mkBtn(
    `${toolBtnClass} ml-2`,
    "Xóa nhanh tất cả từ trong danh sách từ",
    '<i data-lucide="trash-2" class="size-4"></i><span class="text-sm font-semibold">Xóa tất cả</span>'
  );
  clearWordsBtn.onclick = event => {
    event.stopPropagation();
    clearListedWords();
  };
  $("count").after(clearWordsBtn);

  const buildWordCard = (item, collectionId = null, compact = false) => {
    const inCollection = Boolean(collectionId);

    const card = el(
      "div",
      "flex items-center gap-1 pl-1 pr-1 max-w-full min-w-0 rounded-2xl font-bold select-none cursor-grab " +
      KEY + " " + WORD_CARD + " " +
      (inCollection || compact ? "py-1" : "py-2")
    );

    card.title = "Kéo vào bộ sưu tập, vào tệp hoặc vào ô để nạp lại từ này";

    const grip = el(
      "span",
      "flex items-center justify-center size-7 shrink-0 opacity-60 touch-none"
    );
    grip.dataset.grip = "1";
    grip.innerHTML = '<i data-lucide="grip-vertical" class="size-4"></i>';

    const label = inCollection
      ? `Bỏ “${item.word}” khỏi bộ sưu tập`
      : `Xóa từ ${item.word}`;

    const remove = mkBtn(
      iconBtn,
      label,
      `<i data-lucide="${inCollection ? "x" : "trash-2"}" class="size-4"></i>`
    );

    remove.onclick = event => {
      event.stopPropagation();
      inCollection ? removeFromCollection(collectionId, item.id) : deleteWord(item.id);
    };

    const labelEl = el("span", "px-1 min-w-0 truncate whitespace-nowrap", item.word);
    labelEl.title = item.word;
    labelEl.style.fontSize = "var(--doc-size, 18px)";
    labelEl.style.fontFamily = "var(--doc-font, inherit)";
    paintText(labelEl, item.color);

    // Mọi thẻ chữ đều nhận màu kéo thả, kể cả khi chưa thuộc bộ sưu tập.
    card.dataset.word = item.id;

    card.append(grip, labelEl, remove);
    attachWordDrag(card, item, collectionId);
    return card;
  };

  const listedWords = () => {
    const inCollection = new Set(collections.flatMap(col => col.wordIds));
    return savedWords.filter(word => !inCollection.has(word.id));
  };

  function renderSavedWords() {
    const container = $("savedWords");
    const words = listedWords();

    container.className = "flex flex-wrap gap-3 pt-2 min-h-16 rounded-2xl transition";
    $("count").textContent = `${words.length} từ`;
    clearWordsBtn.disabled = !words.length;

    if (!words.length) {
      container.replaceChildren(
        el(
          "p",
          "w-full py-6 text-center text-muted",
          savedWords.length
            ? "Tất cả từ đã nằm trong bộ sưu tập."
            : "Chưa có từ nào được lưu."
        )
      );
    } else {
      container.replaceChildren(...words.map(item => buildWordCard(item)));
    }

    renderWordsAside();

    if (window.lucide) lucide.createIcons();
  }

  const RT_STYLE = `
.rt-doc { caret-color: var(--text); }
.rt-doc > * { scroll-margin-top: 9rem; }
.rt-doc ::selection { background: color-mix(in srgb, ${SELECT_BLUE} 45%, transparent); }
.rt-doc p, .rt-doc h1, .rt-doc h2, .rt-doc h3, .rt-doc h4 { margin: 0; }
.rt-doc h1 { font-size: 2.25rem; line-height: 1.2; font-weight: 700; margin: .4em 0 .2em; }
.rt-doc h2 { font-size: 1.875rem; line-height: 1.25; font-weight: 700; margin: .4em 0 .2em; }
.rt-doc h3 { font-size: 1.5rem; line-height: 1.3; font-weight: 700; margin: .35em 0 .15em; }
.rt-doc h4 { font-size: 1.25rem; line-height: 1.35; font-weight: 700; margin: .3em 0 .1em; }
.rt-doc ul { list-style: disc; padding-left: 1.75rem; margin: .25em 0; }
.rt-doc ol { list-style: decimal; padding-left: 1.75rem; margin: .25em 0; }
.rt-doc li[style*="text-align: center"], .rt-doc li[style*="text-align: right"],
.rt-doc ul[style*="text-align: center"], .rt-doc ul[style*="text-align: right"],
.rt-doc ol[style*="text-align: center"], .rt-doc ol[style*="text-align: right"] {
  list-style-position: inside;
}
.rt-tool[aria-pressed="true"] { background: color-mix(in srgb, var(--text) 16%, transparent); }
.rt-doc [data-indent="1"] { text-indent: 2em; }
.rt-doc.rt-doc { font-size: var(--doc-size, 18px); font-family: var(--doc-font, inherit); }
.rt-doc [data-kind="quote"] {
  text-align: center; font-style: italic; font-size: 1.15em;
  margin: .6em 1.5rem .2em;
}
.rt-doc [data-kind="cite"] {
  text-align: right; font-size: .9em; opacity: .75;
  margin: 0 1.5rem .6em;
}
.rt-doc [data-kind="cite"]::before { content: "— "; }
.rt-doc [data-kind="cite"]::after { content: " —"; }
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

  try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch { }

  const sentenceEl = el("section", "mt-12 w-[min(96vw,1200px)] flex flex-col gap-3");
  const sentenceTitle = el(
    "p",
    "mr-auto min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted"
  );

  const iconToolClass = toolBtnClass.replace("px-3", "w-9 justify-center px-0") + " rt-tool";

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
    "Tách chữ đang bôi đen thành thẻ chữ và đưa về danh sách từ / bộ sưu tập (chữ vẫn được giữ trong tệp và liên kết màu với thẻ)"
  );

  const selectClass =
    `h-9 px-2 rounded-full text-sm font-semibold bg-bg text-text ${BORDER} ${FOCUS}`;

  const fontSelect = el("select", `${selectClass} w-[9.5rem]`);
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
    `${selectClass} w-[7rem] flex items-center justify-between gap-1`
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

  // Không bôi đen chữ: đổi cỡ chữ / phông chữ mặc định, dùng chung cho thẻ chữ và tệp.
  const setDocDefaults = ({ size, font }) => {
    if (size !== undefined) docSize = cleanSize(size) ?? DEFAULT_DOC_SIZE;
    if (font !== undefined) docFont = cleanFont(font) ?? DEFAULT_DOC_FONT;

    applyDocDefaults();
    persist(slots);
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
  const imageBtn = makeToolBtn("image", "Chèn ảnh (SVG/PNG từ CDN hoặc tệp)");
  const tableBtn = makeToolBtn("table", "Chèn bảng");
  const moveUpBtn = makeToolBtn("arrow-up", "Chuyển đoạn lên trên (Alt+↑)");
  const moveDownBtn = makeToolBtn("arrow-down", "Chuyển đoạn xuống dưới (Alt+↓)");

  const saveSentenceBtn = makeToolBtn("save", "Lưu tệp (Ctrl+S)");
  const copySentenceBtn = makeToolBtn("copy", "Sao chép nội dung tệp");
  const clearSentenceBtn = makeToolBtn("eraser", "Xóa nội dung tệp");
  const exportSentenceBtn = makeToolBtn("download", "Xuất tài liệu ra tệp JSON (giữ Shift để đổi tên tệp)");
  const importSentenceBtn = makeToolBtn("upload", "Nhập tài liệu từ tệp JSON");
  const legendBtn = makeToolBtn("palette", "Chú giải màu");

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
  editor.dataset.sentence = "1";
  editor.dataset.placeholder = "Gõ trực tiếp hoặc kéo các thẻ từ vào tệp…";
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.setAttribute("aria-label", "Soạn tệp");

  const setShown = (node, shown) => {
    node.style.display = shown ? "" : "none";
  };

  const SIDE_CLASS =
    "min-w-0 w-full max-h-[40vh] overflow-y-auto overflow-x-hidden " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
    "lg:max-h-[calc(100vh-2rem)] lg:sticky lg:top-4 lg:self-start " +
    `flex flex-col gap-2 p-3 rounded-2xl border-2 border-dashed ${DIVIDER}`;

  const markedAside = el("aside", `${SIDE_CLASS} lg:col-start-1 lg:row-start-1`);
  setShown(markedAside, false);

  const outlineAside = el("aside", `${SIDE_CLASS} lg:col-start-3 lg:row-start-1`);
  setShown(outlineAside, false);
  const outlineList = el("nav", "flex flex-col");
  outlineAside.append(
    el("p", "px-2 text-xs font-semibold uppercase tracking-wide text-muted", "Mục lục"),
    outlineList
  );

  let modal = null;

  const closeModal = () => {
    if (!modal) return;
    document.removeEventListener("keydown", modal.onKey, true);
    modal.overlay.remove();
    modal = null;
  };

  const openModal = (title, renderBody, kind, footer = null) => {
    closeModal();

    const overlay = el(
      "div",
      "fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
    );
    const dialog = el(
      "div",
      `w-full max-w-md max-h-[80vh] flex flex-col gap-3 p-5 rounded-2xl bg-bg text-text ${SHADOW}`
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
      if (event.target === overlay) closeModal();
    });

    const onKey = event => {
      if (event.key !== "Escape") return;
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
    "flex flex-wrap items-center gap-x-4 gap-y-1 px-3 text-sm"
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

  let legendSig = "";

  const refreshLegendStrip = () => {
    const items = usedSentenceColors()
      .filter(color => colorLegend[color])
      .map(color => [color, colorLegend[color]]);

    setShown(legendStrip, items.length > 0);

    const sig = JSON.stringify(items);
    if (sig === legendSig) return;
    legendSig = sig;

    legendStrip.replaceChildren(
      el("span", "text-xs font-semibold uppercase tracking-wide text-muted", "Chú giải"),
      ...items.map(([color, label]) => {
        const chip = mkBtn(
          "flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-sm " +
          `hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] ${FOCUS}`,
          "Sửa chú giải màu"
        );

        const dot = el("span", "size-3 shrink-0 rounded-full");
        paintBackground(dot, color);

        chip.append(dot, el("span", "min-w-0", label));
        chip.onclick = event => {
          event.stopPropagation();
          openLegendModal();
        };
        return chip;
      })
    );
  };

  const group = (...buttons) => el("div", "flex items-center gap-1", "", ...buttons);

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

  const stickyBar = el(
    "div",
    "sticky top-0 z-30 flex flex-col gap-3 py-2 bg-bg " +
    "border-b border-[color-mix(in_srgb,var(--text)_12%,transparent)]",
    "",
    el(
      "div",
      "flex flex-wrap items-center gap-1",
      "",
      sentenceTitle,
      filesBtn,
      legendBtn,
      saveSentenceBtn,
      copySentenceBtn,
      clearSentenceBtn,
      exportSentenceBtn,
      importSentenceBtn,
      sentenceFile
    ),
    el(
      "div",
      "flex flex-wrap items-center gap-x-3 gap-y-2",
      "",
      group(boldBtn, italicBtn, underlineBtn, plainBtn),
      group(upperBtn, lowerBtn, splitBtn),
      group(fontSelect, sizeWrap),
      group(...headingBtns),
      group(...alignBtns),
      group(bulletBtn, numberBtn),
      group(indentBtn, quoteBtn, citeBtn),
      group(imageBtn, tableBtn),
      group(moveUpBtn, moveDownBtn)
    ),
    imgBar,
    tableBar
  );

  const centerCol = el(
    "div",
    "min-w-0 w-full flex flex-col gap-3 lg:col-start-2 lg:row-start-1",
    "",
    stickyBar,
    editor,
    legendStrip
  );

  const toolRow = stickyBar.children[1];
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

  const workspace = el(
    "div",
    "grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_13rem]",
    "",
    markedAside,
    centerCol,
    outlineAside
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
    persistTimer = setTimeout(() => persist(slots), 250);
  };

  window.addEventListener("pagehide", () => {
    clearTimeout(persistTimer);
    persist(slots);
  });

  const findSaved = id => savedSentences.find(s => s.id === id) || null;
  const currentSaved = () => findSaved(currentSavedId);

  const sameBlocks = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const isDirty = () => {
    const saved = currentSaved();
    // Chuẩn hóa lại bản đã lưu để màu liên kết theo thẻ chữ không bị tính là thay đổi.
    if (saved) return !sameBlocks(cleanBlocks(saved.blocks), sentenceBlocks);
    return Boolean(sentenceString().trim());
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

  let outlineSig = "";

  const goToHeading = index => {
    const heading = editor.querySelectorAll("h1,h2,h3,h4")[index];
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

  const refreshOutline = () => {
    const items = [...editor.querySelectorAll("h1,h2,h3,h4")].map(h => ({
      level: Number(h.tagName[1]),
      text: h.textContent.replace(/\u200b/g, "").trim()
    }));

    setShown(outlineAside, items.length > 0);

    const sig = items.map(i => `${i.level}:${i.text}`).join("\n");
    if (sig === outlineSig) return;
    outlineSig = sig;

    outlineList.replaceChildren(
      ...items.map((item, index) => {
        const button = el(
          "button",
          "w-full truncate text-left rounded-lg py-1 pr-2 text-sm text-text " +
          `hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] ${FOCUS} ` +
          (item.level === 1 ? "font-bold" : item.level === 2 ? "font-semibold" : ""),
          item.text || "(Tiêu đề trống)"
        );
        button.type = "button";
        button.title = item.text;
        button.style.paddingLeft = `${0.5 + (item.level - 1) * 0.75}rem`;
        button.onclick = event => {
          event.stopPropagation();
          goToHeading(index);
        };
        return button;
      })
    );
  };

  const refreshSentenceUi = () => {
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
    clearSentenceBtn.disabled = !trimmed;
    exportSentenceBtn.disabled = !trimmed && !savedSentences.length;

    refreshOutline();
    refreshLegendStrip();
  };

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

  const setSentence = (blocks, savedId = null) => {
    sentenceBlocks = cleanBlocks(blocks);
    currentSavedId = savedId;
    renderBlocks(sentenceBlocks, editor);
    refreshSentenceUi();
    syncBars();
    persist(slots);
  };

  const escapeHtml = value =>
    value.replace(/[&<>"']/g, ch => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));

  const rangeFromPoint = (x, y) => {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);

    const pos = document.caretPositionFromPoint?.(x, y);
    if (!pos) return null;

    const range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
    return range;
  };

  const dropCaret = el("div", "fixed z-[66] pointer-events-none bg-text");
  Object.assign(dropCaret.style, {
    display: "none",
    left: "0",
    top: "0",
    width: "2px",
    boxShadow: "0 0 0 1px var(--bg)",
    willChange: "transform"
  });
  document.body.append(dropCaret);

  const hideDropCaret = () => {
    dropCaret.style.display = "none";
  };

  const updateDropCaret = (x, y) => {
    const hit = document.elementFromPoint(x, y);
    if (!hit || !editor.contains(hit)) {
      hideDropCaret();
      return;
    }

    const range = rangeFromPoint(x, y);
    if (!range || !editor.contains(range.startContainer)) {
      hideDropCaret();
      return;
    }

    let rect = [...range.getClientRects()].find(r => r.height > 0);

    if (!rect) {
      const node =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement
          : range.startContainer;
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const pad = node === editor;

      rect = {
        left: box.left + (pad ? parseFloat(style.paddingLeft) || 0 : 0),
        top: box.top + (pad ? parseFloat(style.paddingTop) || 0 : 0),
        height: parseFloat(style.lineHeight) || 28
      };
    }

    dropCaret.style.display = "block";
    dropCaret.style.height = `${rect.height}px`;
    dropCaret.style.transform = `translate3d(${rect.left - 1.5}px, ${rect.top}px, 0)`;
  };

  // Chèn thẻ chữ vào tệp: chữ được liên kết (data-wid) với thẻ nên màu luôn đồng bộ.
  function insertWordIntoEditor(item, point, color) {
    let range = point ? rangeFromPoint(point.x, point.y) : null;

    if (!range || !editor.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    const before = document.createRange();
    before.selectNodeContents(editor);
    before.setEnd(range.startContainer, range.startOffset);
    const beforeText = before.toString();
    const needLead = beforeText && !/[\s]$/.test(beforeText);

    editor.focus();
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const style =
      color === GRADIENT ? GRADIENT_STYLE : `color:${cleanColor(color) || "var(--text)"}`;
    const html =
      (needLead ? "&nbsp;" : "") +
      `<span data-wid="${escapeHtml(item.id)}" style="${style}"` +
      `${color === GRADIENT ? ' data-gradient="1"' : ""}>` +
      `${escapeHtml(item.word)}</span>&nbsp;`;

    document.execCommand("styleWithCSS", false, true);
    document.execCommand("insertHTML", false, html);
    syncFromEditor();
  }

  // ===== Đồng bộ màu giữa thẻ chữ và chữ trong tệp =====
  const WORD_BOUNDARY = /[\s.,;:!?…"'“”‘’()\[\]{}\/\\]/;

  const lastTextNode = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    let last = null;
    while ((node = walker.nextNode())) if (node.nodeValue) last = node;
    return last;
  };

  // Tìm thẻ chữ có màu mà phần cuối của `before` trùng khớp (ưu tiên thẻ dài nhất).
  const findColoredWord = before => {
    const hay = before.normalize("NFC").toLowerCase();
    if (hay.length !== before.length) return null;

    const candidates = savedWords
      .filter(w => cleanWordColor(w.color))
      .map(w => ({ word: w, key: w.word.normalize("NFC").toLowerCase().trim() }))
      .filter(c => c.key)
      .sort((a, b) => b.key.length - a.key.length);

    for (const { word, key } of candidates) {
      if (!hay.endsWith(key)) continue;
      const start = hay.length - key.length;
      if (start === 0 || WORD_BOUNDARY.test(hay[start - 1])) return { word, start };
    }
    return null;
  };

  // Bọc chữ kết thúc tại `end` trong node (nếu khớp thẻ chữ có màu) bằng span liên kết data-wid.
  // Trả về { tail, shift } để đặt lại con trỏ, hoặc null nếu không làm gì.
  const colorWordEndingAt = (node, end) => {
    const text = node.nodeValue;

    while (end > 0 && WORD_BOUNDARY.test(text[end - 1])) end--;
    if (end <= 0) return null;

    if (node.parentElement?.closest("[data-wid]")) return null;
    if (nodeColor(node)) return null; // chữ đã được tô màu thủ công

    const hit = findColoredWord(text.slice(0, end));
    if (!hit) return null;

    const tail = node.splitText(end);
    wrapTextRange(node, hit.start, end, makeLinkedSpan(hit.word.id, hit.word.color));

    return { tail, shift: end };
  };

  // Khi thẻ chữ vừa được tô màu: liên kết (và tô màu) mọi chữ trùng khớp chưa có màu trong tệp,
  // giống cách tệp tự tô màu khi gõ. Trả về true nếu DOM có thay đổi.
  const linkTextToWord = word => {
    const color = cleanWordColor(word.color);
    const key = word.word.normalize("NFC").toLowerCase().trim();
    if (!color || !key) return false;

    const nodes = [];
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    let changed = false;

    nodes.forEach(textNode => {
      const parent = textNode.parentElement;
      if (!parent || parent.closest("[data-wid]") || nodeColor(textNode)) return;

      const text = textNode.nodeValue;
      const hay = text.normalize("NFC").toLowerCase();
      if (hay.length !== text.length) return;

      const hits = [];
      for (let from = 0; ;) {
        const i = hay.indexOf(key, from);
        if (i < 0) break;

        const e = i + key.length;
        const okStart = i === 0 || WORD_BOUNDARY.test(hay[i - 1]);
        const okEnd = e === hay.length || WORD_BOUNDARY.test(hay[e]);

        if (okStart && okEnd) {
          hits.push(i);
          from = e;
        } else {
          from = i + 1;
        }
      }

      for (let k = hits.length - 1; k >= 0; k--) {
        wrapTextRange(textNode, hits[k], hits[k] + key.length, makeLinkedSpan(word.id, color));
        changed = true;
      }
    });

    return changed;
  };

  const autoColorTyped = ({ paragraph }) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return false;

    if (paragraph) {
      let prev = currentBlockEl()?.previousElementSibling;
      if (prev && (prev.tagName === "UL" || prev.tagName === "OL")) prev = prev.lastElementChild;
      if (!prev) return false;

      const node = lastTextNode(prev);
      return Boolean(node && colorWordEndingAt(node, node.nodeValue.length));
    }

    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE || !editor.contains(node)) return false;

    const offset = sel.anchorOffset;
    const result = colorWordEndingAt(node, offset - 1); // bỏ ký tự ngăn cách vừa gõ
    if (!result) return false;

    // Đặt lại con trỏ ngay sau ký tự ngăn cách (nằm ngoài span màu).
    const range = document.createRange();
    range.setStart(result.tail, Math.max(0, offset - result.shift));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  };

  editor.addEventListener("input", event => {
    if (event.isComposing) {
      sentenceBlocks = domToBlocks(editor);
      refreshSentenceUi();
      schedulePersist();
      return;
    }

    // Gõ xong một từ (dấu cách / dấu câu / Enter): tự tô màu nếu từ đó có thẻ chữ màu.
    if (event.inputType === "insertText" && event.data && WORD_BOUNDARY.test(event.data)) {
      autoColorTyped({ paragraph: false });
    } else if (event.inputType === "insertParagraph") {
      autoColorTyped({ paragraph: true });

      const block = currentBlockEl();
      if (block?.dataset.kind === "cite" && block.previousElementSibling?.dataset.kind === "cite") {
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

  // Gõ tiếp ở mép chữ liên kết (data-wid): đặt con trỏ vào một text node nằm NGOÀI span,
  // để chữ mới không thừa hưởng màu / liên kết của từ đứng trước (hoặc sau).
  const escapeLinkedEdge = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return;

    const base = sel.anchorNode;
    if (!base || !editor.contains(base)) return;

    const host = base.nodeType === Node.TEXT_NODE ? base.parentElement : base;
    const span = host?.closest?.("[data-wid]");
    if (!span || !editor.contains(span)) return;

    const probe = document.createRange();
    probe.selectNodeContents(span);
    probe.setStart(base, sel.anchorOffset);
    const atEnd = !probe.toString();

    probe.selectNodeContents(span);
    probe.setEnd(base, sel.anchorOffset);
    const atStart = !probe.toString();

    if (!atEnd && !atStart) return; // đang sửa giữa từ: giữ nguyên liên kết

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
    persist(slots);
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

  // Khi màu của thẻ chữ thay đổi: vẽ lại tệp để chữ liên kết đổi màu theo.
  function syncLinkedColors() {
    if (editor.querySelector("[data-wid]")) normalizeEditor();
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

      // Tô màu thủ công => gỡ liên kết màu với thẻ chữ.
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

  // Các text node nằm trong vùng bôi đen, kèm đoạn [start, end) được chọn.
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

  const nodeColor = node => {
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
      const text = node.nodeValue.slice(start, end).replace(/\u00a0/g, " ").replace(/\u200b/g, "");

      for (const ch of text) {
        if (/\s/.test(ch)) {
          flushWord();
        } else {
          if (!cur) cur = { word: "", color };
          cur.word += ch;
        }
      }
    });

    flushWord();

    return words
      .map(w => ({ word: w.word.slice(0, MAX_WORD_LEN), color: cleanWordColor(w.color) }))
      .slice(0, MAX_IMPORT_WORDS);
  };

  // Liên kết (data-wid) chữ đang bôi đen với các thẻ chữ vừa tạo, để màu luôn đồng bộ.
  // Quy tắc tách từ giống hệt selectionWords nên chỉ số từ khớp với `ids`.
  const linkSelectionToWords = (saved, ids, merged) => {
    restoreSel(saved);

    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;

    if (merged) {
      // Giữ nguyên cả cụm: mỗi text node được bọc liền một mạch (kể cả dấu cách ở giữa),
      // chỉ cắt khoảng trắng thừa ở hai đầu vùng bôi đen.
      const word = savedWords.find(w => w.id === ids[0]);
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
        const id = merged ? ids[0] : ids[segs[k].idx];
        if (!id) continue;

        const word = savedWords.find(w => w.id === id);
        if (!word) continue;

        wrapTextRange(node, segs[k].s, segs[k].e, makeLinkedSpan(id, word.color));
      }
    });

    normalizeEditor();
  };

  const openSplitModal = () => {
    const sel = window.getSelection();

    if (!selectionInEditor() || selectedImg || !sel.rangeCount || sel.isCollapsed) {
      showToast("Hãy bôi đen chữ trong tệp để tách thành thẻ chữ");
      return;
    }

    const saved = captureSel();
    const words = selectionWords(sel.getRangeAt(0));

    if (!saved || !words.length) {
      showToast("Vùng bôi đen không có chữ để tách");
      return;
    }

    const perWord = el("input", "size-4 accent-[#3b82f6]");
    perWord.type = "checkbox";
    perWord.checked = false; // mặc định: giữ nguyên cả cụm đã bôi đen thành một thẻ

    // Tạo thẻ chữ mới và liên kết chữ trong tệp với các thẻ đó (màu đồng bộ hai chiều).
    const commit = collectionId => {
      const col = collectionId ? collections.find(c => c.id === collectionId) : null;
      const merged = !perWord.checked;

      const items = merged
        ? [{
          word: words.map(w => w.word).join(" ").slice(0, MAX_WORD_LEN),
          color: words[0].color
        }]
        : words;

      const ids = items.map(item => {
        const id = crypto.randomUUID();
        savedWords.push({ id, word: item.word, parts: null, color: item.color });
        if (col) col.wordIds.push(id);
        return id;
      });

      closeModal();

      linkSelectionToWords(saved, ids, merged);

      persist(slots);
      renderAll();
      showToast(
        `Đã tách ${items.length} thẻ chữ` +
        (col ? ` vào “${col.name}”` : " vào danh sách từ") +
        " (chữ trong tệp được liên kết màu với thẻ)"
      );
    };

    const destBtn = (icon, label, count, onClick, highlight = false) => {
      const button = mkBtn(
        `${toolBtnClass} w-full justify-start h-10` +
        (highlight ? " bg-[color-mix(in_srgb,var(--text)_10%,transparent)]" : ""),
        label,
        `<i data-lucide="${icon}" class="size-4 shrink-0"></i>`
      );
      button.append(
        el("span", "min-w-0 flex-1 truncate text-left", label),
        el("span", "shrink-0 text-xs text-muted", count)
      );
      button.onclick = event => {
        event.stopPropagation();
        onClick();
      };
      return button;
    };

    openModal(
      `Tách ${words.length} từ thành thẻ chữ`,
      body =>
        body.replaceChildren(
          el(
            "p",
            "mb-2 text-xs text-muted",
            "Chữ đang bôi đen sẽ được giữ nguyên trong tệp, đồng thời tạo thành thẻ chữ và liên kết màu với thẻ. Chọn nơi đặt các thẻ:"
          ),
          el(
            "div",
            "flex flex-col gap-2",
            "",
            destBtn("list", "Danh sách từ", `${listedWords().length} từ`, () => commit(null)),
            ...collections.map(col =>
              destBtn(
                col.id === markedCollectionId ? "pin" : "folder",
                col.name,
                `${col.wordIds.length} từ`,
                () => commit(col.id),
                col.id === markedCollectionId
              )
            )
          )
        ),
      "split",
      el(
        "label",
        "flex items-center gap-2 text-sm",
        "",
        perWord,
        el("span", "", "Cắt nhỏ: mỗi từ một thẻ riêng (mặc định giữ nguyên cả cụm)")
      )
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
      currentSavedId = existing.id;
      showToast(`Đã cập nhật “${name}”`);
    } else {
      if (savedSentences.length >= MAX_SAVED_SENTENCES) {
        showToast(`Tối đa ${MAX_SAVED_SENTENCES} tệp đã lưu`);
        return;
      }

      const entry = { id: crypto.randomUUID(), name, blocks };
      savedSentences.unshift(entry);
      currentSavedId = entry.id;
      showToast(`Đã lưu “${name}”`);
    }

    persist(slots);
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
    setSentence([]);
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
        version: 6,
        exportedAt: new Date().toISOString(),
        document: { text: sentenceString(), blocks: sentenceBlocks },
        colorLegend,
        savedSentences: savedSentences.map(entry => ({
          name: entry.name,
          text: blocksToText(entry.blocks),
          blocks: entry.blocks
        }))
      },
      `${name}.json`
    );

    showToast(`Đã xuất “${name}.json”`);
  };

  const sanitizeSentenceImport = data => {
    const toBlocks = value => {
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
    };

    const result = { document: [], saved: [], legend: {} };

    if (typeof data === "string" || Array.isArray(data)) {
      result.document = toBlocks(data);
      return result;
    }

    if (!data || typeof data !== "object") return result;

    const source =
      data.document ??
      (data.blocks !== undefined || data.runs !== undefined || data.text !== undefined
        ? data
        : null);
    result.document = toBlocks(source);
    result.legend = cleanLegend(data.colorLegend);

    const list = Array.isArray(data.savedSentences)
      ? data.savedSentences
      : Array.isArray(data.sentences)
        ? data.sentences
        : [];

    result.saved = list
      .map(item => ({
        name:
          item && typeof item === "object" && typeof item.name === "string"
            ? cleanName(item.name, "")
            : "",
        blocks: toBlocks(item)
      }))
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
        !parsed.document.length &&
        !parsed.saved.length &&
        !Object.keys(parsed.legend).length
      ) {
        showToast("Tệp không có nội dung hợp lệ");
        return;
      }

      if (parsed.document.length) {
        if (!confirmDiscard()) return;
        setSentence(parsed.document);
      }

      Object.assign(colorLegend, parsed.legend);

      let added = 0;
      for (const entry of parsed.saved) {
        if (savedSentences.length >= MAX_SAVED_SENTENCES) break;
        savedSentences.push({
          id: crypto.randomUUID(),
          name: uniqueName(entry.name || defaultSentenceName(entry.blocks)),
          blocks: entry.blocks
        });
        added++;
      }

      persist(slots);
      renderSavedSentences();
      refreshSentenceUi();

      showToast(
        (parsed.document.length ? "Đã nhập tài liệu" : "Đã nhập") +
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

    setSentence(cloneBlocks(entry.blocks), entry.id);
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
    persist(slots);
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
    open.append(el("span", "min-w-0 truncate", entry.name));
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
          persist(slots);
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
        ...savedWords.map(word => word.color).filter(Boolean),
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

    setSentence([...sentenceBlocks, ...added], currentSavedId);
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
        "Chú giải hiện dưới khung soạn cho các màu đang dùng trong tệp."
      ),
      insertBtn
    );

    openModal("Chú giải màu", renderLegendBody, "legend", footer);
  }

  legendBtn.onclick = event => {
    event.stopPropagation();
    openLegendModal();
  };

  const collectionsEl = el("section", "mt-8 flex flex-col gap-3");
  const collectionsTitle = el(
    "p",
    "mr-auto text-xs font-semibold uppercase tracking-wide text-muted"
  );
  const collectionList = el("div", "grid gap-3 sm:grid-cols-2");

  const nameInput = el("input", `${FIELD} w-40`);
  nameInput.type = "text";
  nameInput.maxLength = 40;
  nameInput.placeholder = "Tên bộ sưu tập";
  nameInput.setAttribute("aria-label", "Tên bộ sưu tập mới");

  const createBtn = mkBtn(
    toolBtnClass,
    "Tạo bộ sưu tập",
    '<i data-lucide="folder-plus" class="size-4"></i><span class="text-sm font-semibold">Tạo</span>'
  );
  const importBtn = mkBtn(
    toolBtnClass,
    "Nhập bộ sưu tập từ tệp JSON",
    '<i data-lucide="upload" class="size-4"></i><span class="text-sm font-semibold">Nhập</span>'
  );
  const exportAllBtn = mkBtn(
    toolBtnClass,
    "Xuất tất cả bộ sưu tập ra tệp JSON",
    '<i data-lucide="download" class="size-4"></i><span class="text-sm font-semibold">Xuất tất cả</span>'
  );

  const fileInput = el("input", "hidden");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.setAttribute("aria-hidden", "true");

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
    buildSwatch(() => null, "Xóa màu (kéo vào thẻ chữ)"),
    el(
      "span",
      "ml-1 text-xs text-muted",
      "Kéo màu vào bất kỳ thẻ chữ nào · hoặc bôi đen chữ / chọn ảnh trong tệp rồi bấm màu"
    )
  );

  collectionsEl.append(
    el(
      "div",
      "flex flex-wrap items-center gap-2",
      "",
      collectionsTitle,
      nameInput,
      createBtn,
      importBtn,
      exportAllBtn,
      fileInput
    ),
    paletteRow,
    collectionList
  );
  $("savedWords").after(collectionsEl);
  $("savedWords").closest("section").after(sentenceEl);

  const wordsAside = el(
    "aside",
    "hidden lg:flex flex-col gap-2 fixed left-4 top-4 z-40 w-60 " +
    "max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden p-3 rounded-2xl " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
    `bg-bg text-text border-2 border-dashed ${DIVIDER}`
  );

  wordsAside.dataset.wordlist = "1";
  wordsAside.addEventListener("click", event => event.stopPropagation());
  setShown(wordsAside, false);
  document.body.append(wordsAside);

  const asideWatch = { words: true, collections: false, workspace: false };

  const updateWordsAside = () => {
    const show =
      !asideWatch.words &&
      asideWatch.collections &&
      !asideWatch.workspace &&
      listedWords().length > 0;
    setShown(wordsAside, show);
  };

  function renderWordsAside() {
    const words = listedWords();

    const body = el("div", "flex flex-wrap gap-2");
    body.append(...words.map(item => buildWordCard(item, null, true)));

    const clearAside = mkBtn(
      `${iconBtn} text-muted hover:text-red-500`,
      "Xóa nhanh tất cả từ trong danh sách từ",
      '<i data-lucide="trash-2" class="size-4"></i>'
    );
    clearAside.onclick = event => {
      event.stopPropagation();
      clearListedWords();
    };

    wordsAside.replaceChildren(
      el(
        "div",
        "flex items-center gap-1",
        "",
        el("span", "min-w-0 flex-1 truncate text-sm font-semibold", "Danh sách từ"),
        el("span", "shrink-0 text-xs text-muted", `${words.length} từ`),
        clearAside
      ),
      body
    );

    updateWordsAside();

    if (window.lucide) lucide.createIcons();
  }

  if ("IntersectionObserver" in window) {
    [
      ["words", $("savedWords")],
      ["collections", collectionsEl],
      ["workspace", workspace]
    ].forEach(([key, node]) => {
      new IntersectionObserver(entries => {
        asideWatch[key] = entries[entries.length - 1].isIntersecting;
        updateWordsAside();
      }).observe(node);
    });
  }

  const createCollection = () => {
    const name = nameInput.value.trim();

    if (!name) {
      nameInput.focus();
      return;
    }

    if (collections.length >= MAX_COLLECTIONS) {
      showToast(`Tối đa ${MAX_COLLECTIONS} bộ sưu tập`);
      return;
    }

    collections.push({ id: crypto.randomUUID(), name, wordIds: [] });
    nameInput.value = "";

    persist(slots);
    renderCollections();
  };

  createBtn.onclick = createCollection;

  nameInput.addEventListener("keydown", event => {
    if (event.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      createCollection();
    }
  });

  const addToCollection = (collectionId, wordId) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    const exists = col.wordIds.includes(wordId);

    collections.forEach(other => {
      if (other.id !== collectionId) {
        other.wordIds = other.wordIds.filter(id => id !== wordId);
      }
    });

    if (!exists) col.wordIds.push(wordId);

    persist(slots);
    renderAll();
    showToast(exists ? `Từ đã có trong “${col.name}”` : `Đã chuyển vào “${col.name}”`);
  };

  const removeFromCollection = (collectionId, wordId) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    col.wordIds = col.wordIds.filter(id => id !== wordId);
    persist(slots);
    renderAll();
  };

  // Đổi màu thẻ chữ => chữ liên kết trong tệp tự đổi theo; chữ trùng khớp chưa có màu cũng được liên kết.
  const setWordColor = (wordId, color) => {
    const word = savedWords.find(w => w.id === wordId);
    if (!word) return;

    word.color = color || null;
    if (word.color) linkTextToWord(word);

    persist(slots);
    renderAll();
    syncLinkedColors();
    showToast(color ? `Đã đổi màu “${word.word}”` : `Đã xóa màu “${word.word}”`);
  };

  const serializeCollection = col => ({
    name: col.name,
    words: col.wordIds
      .map(id => savedWords.find(word => word.id === id))
      .filter(Boolean)
      .map(word => ({ word: word.word, parts: partsOf(word), color: word.color || null }))
  });

  const buildExport = list => ({
    app: "mixer",
    type: "collections",
    version: 1,
    exportedAt: new Date().toISOString(),
    collections: list.map(serializeCollection)
  });

  const exportCollections = (list, filename) => {
    downloadJson(buildExport(list), filename);
    showToast(`Đã xuất ${list.length} bộ sưu tập`);
  };

  exportAllBtn.onclick = event => {
    event.stopPropagation();

    if (!collections.length) {
      showToast("Chưa có bộ sưu tập để xuất");
      return;
    }

    exportCollections(collections, "mixer-bo-suu-tap.json");
  };

  const sanitizeImport = data => {
    let list = null;

    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data?.collections)) list = data.collections;
    else if (data && typeof data.name === "string") list = [data];

    if (!list) return null;

    return list
      .filter(c => c && typeof c.name === "string" && c.name.trim())
      .map(c => ({
        name: c.name.trim().slice(0, 40),
        words: (Array.isArray(c.words) ? c.words : [])
          .map(w => (typeof w === "string" ? { word: w } : w))
          .filter(w => w && typeof w.word === "string" && w.word.trim())
          .slice(0, MAX_IMPORT_WORDS)
          .map(w => {
            const parts = Array.isArray(w.parts)
              ? w.parts.filter(p => typeof p === "string").slice(0, MAX_ITEMS)
              : [];

            return {
              word: w.word.trim().slice(0, MAX_WORD_LEN),
              parts: parts.length ? parts : null,
              color: cleanWordColor(w.color)
            };
          })
      }));
  };

  const importCollections = async file => {
    try {
      if (file.size > MAX_IMPORT_SIZE) {
        showToast("Tệp quá lớn (tối đa 2 MB)");
        return;
      }

      const list = sanitizeImport(JSON.parse(await file.text()));

      if (!list || !list.length) {
        showToast("Tệp không đúng định dạng bộ sưu tập");
        return;
      }

      let addedCollections = 0;
      let addedWords = 0;
      let skipped = 0;

      for (const imported of list) {
        if (collections.length >= MAX_COLLECTIONS) {
          skipped++;
          continue;
        }

        const col = { id: crypto.randomUUID(), name: imported.name, wordIds: [] };

        imported.words.forEach(w => {
          const id = crypto.randomUUID();
          savedWords.push({ id, word: w.word, parts: w.parts, color: w.color });
          col.wordIds.push(id);
          addedWords++;
        });

        collections.push(col);
        addedCollections++;
      }

      persist(slots);
      renderAll();

      if (!addedCollections) {
        showToast(`Tối đa ${MAX_COLLECTIONS} bộ sưu tập`);
      } else {
        showToast(
          `Đã nhập ${addedCollections} bộ, ${addedWords} từ` +
          (skipped ? ` (bỏ qua ${skipped} bộ do vượt giới hạn)` : "")
        );
      }
    } catch (error) {
      console.warn("Không thể nhập tệp JSON:", error);
      showToast("Không thể đọc tệp JSON");
    }
  };

  importBtn.onclick = event => {
    event.stopPropagation();
    fileInput.click();
  };

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (file) importCollections(file);
  });

  const startRename = (col, nameEl) => {
    const input = el(
      "input",
      "min-w-0 flex-1 h-8 px-2 rounded-lg text-sm font-semibold bg-bg text-text " +
      `${BORDER} ${FOCUS}`
    );
    input.type = "text";
    input.maxLength = 40;
    input.value = col.name;
    input.setAttribute("aria-label", "Đổi tên bộ sưu tập");

    let finished = false;

    const commit = save => {
      if (finished) return;
      finished = true;

      const name = input.value.trim();
      if (save && name) {
        col.name = name;
        persist(slots);
      }
      renderCollections();
    };

    input.addEventListener("keydown", event => {
      if (event.isComposing) return;

      if (event.key === "Enter") {
        event.preventDefault();
        commit(true);
      } else if (event.key === "Escape") {
        event.stopPropagation();
        commit(false);
      }
    });
    input.addEventListener("blur", () => commit(true));

    nameEl.replaceWith(input);
    input.focus();
    input.select();
  };

  const buildCollection = col => {
    const words = col.wordIds
      .map(id => savedWords.find(word => word.id === id))
      .filter(Boolean);

    const marked = col.id === markedCollectionId;

    const panel = el(
      "div",
      "flex flex-col gap-3 p-3 rounded-2xl border-2 border-dashed transition " +
      (marked ? "border-hl" : DIVIDER)
    );
    panel.dataset.collection = col.id;

    const nameEl = el("span", "min-w-0 flex-1 truncate font-semibold", col.name);
    nameEl.title = "Nhấp đúp để đổi tên";
    nameEl.addEventListener("dblclick", () => startRename(col, nameEl));

    const pinLabel = marked
      ? "Bỏ đánh dấu bộ sưu tập"
      : "Đánh dấu: hiện bên trái khung soạn tệp khi cuộn xuống";
    const pin = mkBtn(
      `${iconBtn} ${marked ? "text-con" : "text-muted"}`,
      pinLabel,
      `<i data-lucide="${marked ? "pin-off" : "pin"}" class="size-4"></i>`
    );
    pin.setAttribute("aria-pressed", String(marked));
    pin.onclick = event => {
      event.stopPropagation();
      markedCollectionId = marked ? null : col.id;
      persist(slots);
      renderCollections();
      showToast(marked ? "Đã bỏ đánh dấu" : `Đã đánh dấu “${col.name}”`);
    };

    const rename = mkBtn(
      `${iconBtn} text-muted`,
      "Đổi tên",
      '<i data-lucide="pencil" class="size-4"></i>'
    );
    rename.setAttribute("aria-label", `Đổi tên bộ sưu tập ${col.name}`);
    rename.onclick = event => {
      event.stopPropagation();
      startRename(col, nameEl);
    };

    const exportBtn = mkBtn(
      `${iconBtn} text-muted`,
      "Xuất bộ sưu tập ra tệp JSON",
      '<i data-lucide="download" class="size-4"></i>'
    );
    exportBtn.setAttribute("aria-label", `Xuất bộ sưu tập ${col.name} ra JSON`);
    exportBtn.onclick = event => {
      event.stopPropagation();
      exportCollections([col], `mixer-${slugify(col.name)}.json`);
    };

    const del = mkBtn(
      `${iconBtn} text-muted hover:text-red-500`,
      "Xóa bộ sưu tập (các từ quay về danh sách từ)",
      '<i data-lucide="trash-2" class="size-4"></i>'
    );
    del.setAttribute("aria-label", `Xóa bộ sưu tập ${col.name}`);
    del.onclick = event => {
      event.stopPropagation();
      if (markedCollectionId === col.id) markedCollectionId = null;
      collections = collections.filter(c => c.id !== col.id);
      persist(slots);
      renderAll();
    };

    const head = el(
      "div",
      "flex items-center gap-1",
      "",
      nameEl,
      el("span", "shrink-0 mr-1 text-xs text-muted", `${words.length} từ`),
      pin,
      rename,
      exportBtn,
      del
    );

    const body = el("div", "flex flex-wrap items-start gap-2 min-h-12");

    if (words.length) {
      body.append(...words.map(word => buildWordCard(word, col.id)));
    } else {
      body.append(
        el("p", "w-full py-3 text-center text-sm text-muted", "Kéo thẻ từ vào đây")
      );
    }

    panel.append(head, body);
    return panel;
  };

  let markedOriginVisible = true;
  let markedObserver = null;

  function renderMarked() {
    markedObserver?.disconnect();
    markedObserver = null;

    const col = collections.find(c => c.id === markedCollectionId);

    if (!col) {
      setShown(markedAside, false);
      markedAside.replaceChildren();
      return;
    }

    const words = col.wordIds
      .map(id => savedWords.find(word => word.id === id))
      .filter(Boolean);

    const unpin = mkBtn(
      `${iconBtn} text-muted`,
      "Bỏ đánh dấu",
      '<i data-lucide="pin-off" class="size-4"></i>'
    );
    unpin.setAttribute("aria-label", "Bỏ đánh dấu bộ sưu tập");
    unpin.onclick = event => {
      event.stopPropagation();
      markedCollectionId = null;
      persist(slots);
      renderCollections();
    };

    const body = el("div", "flex flex-wrap gap-2");
    if (words.length) {
      body.append(...words.map(word => buildWordCard(word, col.id)));
    } else {
      body.append(el("p", "w-full py-2 text-center text-sm text-muted", "Bộ sưu tập chưa có từ nào."));
    }

    markedAside.replaceChildren(
      el(
        "div",
        "flex items-center gap-1",
        "",
        el("span", "min-w-0 flex-1 truncate text-sm font-semibold", col.name),
        unpin
      ),
      body
    );

    setShown(markedAside, !markedOriginVisible);

    const origin = [...collectionList.children].find(n => n.dataset?.collection === col.id);

    if (origin && "IntersectionObserver" in window) {
      markedObserver = new IntersectionObserver(entries => {
        markedOriginVisible = entries[entries.length - 1].isIntersecting;
        setShown(markedAside, !markedOriginVisible);
      });
      markedObserver.observe(origin);
    } else {
      setShown(markedAside, true);
    }
  }

  function renderCollections() {
    collectionsTitle.textContent = `Bộ sưu tập · ${collections.length}`;
    exportAllBtn.disabled = !collections.length;

    if (!collections.length) {
      collectionList.replaceChildren(
        el(
          "p",
          "sm:col-span-2 py-4 text-center text-sm text-muted",
          "Tạo hoặc nhập bộ sưu tập, rồi kéo thẻ từ vào đó để sắp xếp."
        )
      );
    } else {
      collectionList.replaceChildren(...collections.map(col => buildCollection(col)));
    }

    renderMarked();

    if (window.lucide) lucide.createIcons();
  }

  const norm = value => value.normalize("NFC").toLowerCase().trim();

  const typed = $("typed");
  typed.placeholder = "Gõ âm rồi nhấn Enter · Phím số: đổi ô";

  const filterKeys = () => {
    const query = stripTones(norm(typed.value)).text;

    keyEls.forEach(({ node, value }) => {
      node.classList.toggle(
        "opacity-25",
        Boolean(query) && !norm(value).startsWith(query)
      );
    });
  };

  const pickTyped = () => {
    const { text, mark } = stripTones(norm(typed.value));

    if (!text || active < 0 || slots[active]?.locked) return;

    const hit =
      sounds.find(sound => norm(sound.v) === text) ||
      sounds.find(sound => norm(sound.v).startsWith(text));

    if (!hit) return;

    choose(hit.type === "vow" && mark ? applyTone(hit.v, mark) : hit.v);
  };

  typed.addEventListener("input", filterKeys);

  typed.addEventListener("keydown", event => {
    if (event.isComposing) return;

    if (event.key === "Enter") {
      event.preventDefault();
      pickTyped();
    }
  });

  const openByNumber = number => {
    const index = soundIndices()[number - 1];

    if (index === undefined) {
      showToast(`Không có ô ${number}`);
      return;
    }

    if (slots[index].locked) {
      showToast(`Ô ${number} đang bị khóa`);
      return;
    }

    open(index);
  };

  const showTones = (base, current) => {
    $("toneLabel").textContent = `Chọn dấu cho "${base}"`;

    $("toneKeys").replaceChildren(
      ...TONES.map(tone => {
        const value = applyTone(base, tone.mark);

        const button = el(
          "button",
          `w-full flex flex-col items-center justify-center aspect-square rounded-xl ${KEY} ${FILL.vow}` +
          (current === value ? " ring-4 ring-hl" : ""),
          "",
          el("span", "text-xl font-semibold leading-none", value),
          el("span", "mt-1 text-[10px] leading-none opacity-75", tone.name)
        );

        button.type = "button";
        button.title = tone.name;

        button.onclick = event => {
          event.stopPropagation();
          choose(value);
        };

        return button;
      })
    );

    $("tones").classList.remove("hidden");

    keyEls.forEach(({ node, value }) => {
      const selected = value === base;
      node.classList.toggle("ring-4", selected);
      node.classList.toggle("ring-hl", selected);
    });
  };

  function open(index) {
    if (slots[index]?.kind !== "sound" || slots[index].locked) return;

    active = index;

    const current = slots[index].value;

    keyEls = [];

    const textSize = value => {
      const length = [...value].length;
      return length > 2 ? "text-sm" : length === 2 ? "text-lg" : "text-xl";
    };

    const createKey = ({ v, type }) => {
      const node = document.createElement("button");

      node.type = "button";
      node.textContent = v;

      node.className =
        `w-[52px] h-[52px] min-w-0 flex items-center justify-center rounded-xl ` +
        `font-semibold transition-opacity ${textSize(v)} ${KEY} ${FILL[type]}`;

      node.onclick = event => {
        event.stopPropagation();
        type === "vow" ? showTones(v, current) : choose(v);
      };

      keyEls.push({ node, value: v });
      return node;
    };

    const eraser = mkBtn(
      `w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-bg text-muted ${KEY}`,
      "Bỏ chọn",
      '<i data-lucide="eraser" class="size-5"></i>'
    );

    eraser.onclick = event => {
      event.stopPropagation();
      choose("");
    };

    $("groups").replaceChildren(
      ...GROUPS.map(({ title, items }, groupIndex) => {
        const group = el("div", "flex flex-col gap-2 w-full min-w-0");

        const grid = el(
          "div",
          "grid grid-cols-[repeat(auto-fill,52px)] justify-start content-start gap-2"
        );

        grid.append(
          ...items.map(createKey),
          ...(groupIndex === GROUPS.length - 1 ? [eraser] : [])
        );

        group.append(
          el(
            "p",
            "text-xs font-semibold uppercase tracking-wide text-muted",
            `${title} · ${items.length}`
          ),
          grid
        );

        return group;
      })
    );

    $("panel").classList.replace("hidden", "flex");
    $("tones").classList.add("hidden");

    const currentBase = stripTones(current).text;

    if (typeOf[currentBase] === "vow") {
      showTones(currentBase, current);
    }

    typed.value = "";

    filterKeys();
    render();

    typed.focus();

    if (window.lucide) lucide.createIcons();
  }

  function close() {
    active = -1;
    $("panel").classList.replace("flex", "hidden");
    render();
  }

  document.addEventListener("click", event => {
    if (suppressClick) return;
    if (!$("sheet").contains(event.target)) close();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof HTMLInputElement && event.target !== typed) return;
    if (event.target instanceof HTMLSelectElement) return;
    if (event.target instanceof HTMLElement && event.target.isContentEditable) return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      openByNumber(Number(event.key));
    }
  });

  render();
  renderSavedWords();
  renderSentence();
  renderSavedSentences();
  renderCollections();
  persist(slots);
}

(async () => {
  try {
    const response = await fetch("../data/metadata.json");

    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu: HTTP ${response.status}`);
    }

    init(await response.json());
  } catch (error) {
    console.error(error);
    $("row").replaceChildren(el("p", "text-muted", "Không thể tải dữ liệu âm."));
  }

  if (window.lucide) lucide.createIcons();
})();