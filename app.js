const $ = id => document.getElementById(id);

const STORAGE_KEY = "mixer-app-state-v1";
const MIN_SLOTS = 3;    // số ô âm mặc định
const MAX_ITEMS = 14;   // tổng số phần tử tối đa (ô âm + dấu cách)
const EDGE = 14;        // độ dày vùng viền (px) để cầm kéo ô
const DRAG_THRESHOLD = 5; // quãng kéo tối thiểu (px) để tính là kéo
const SHADOW = "shadow-[0_10px_30px_rgba(0,0,0,.22)]";
const BOX_H = "h-[min(36vw,13.34rem)]";
const BOX_W = "min-w-[min(24vw,10rem)]";

const FILL = {
  con: "bg-con text-con-t",
  vow: "bg-vow text-vow-t"
};

const KEY = "shadow-[0_3px_8px_rgba(0,0,0,.25),inset_0_1px_0_rgba(255,255,255,.35)]";
const DIVIDER = "border-[color-mix(in_srgb,var(--text)_15%,transparent)]";

// ---- Thông số kéo thả ----
const SHADOW_REST = "0 10px 30px rgba(0,0,0,.22)";
const SHADOW_LIFT = "0 45px 80px rgba(0,0,0,.40), 0 16px 28px rgba(0,0,0,.25)";
const FOLLOW = 24;      // độ bám chuột (cao = sát hơn)
const DROP_MS = 200;
const RETURN_MS = 260;
const HOVER_CLASSES = ["ring-4", "ring-hl", "scale-105"];
const COLLECTION_HOVER = ["ring-4", "ring-hl"];
const MAX_COLLECTIONS = 20;

const reduceMotion =
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

let TONES = [];
let savedWords = [];
let restoredSlots = null;
let collections = []; // [{ id, name, wordIds: [] }]

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
          // Danh sách âm đã ghép (" " = dấu cách). Dữ liệu cũ chưa có thì để null
          parts: Array.isArray(item.parts)
            ? item.parts.filter(part => typeof part === "string")
            : null
        }));
    }

    if (Array.isArray(data.collections)) {
      collections = data.collections
        .filter(c => c && typeof c.name === "string")
        .map(c => ({
          id: typeof c.id === "string" ? c.id : crypto.randomUUID(),
          name: c.name.slice(0, 40),
          wordIds: Array.isArray(c.wordIds)
            ? c.wordIds.filter(id => typeof id === "string")
            : []
        }))
        .slice(0, MAX_COLLECTIONS);
    }

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
    restoredSlots = null;
  }
}

function persist(slots) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 3,
        savedWords,
        collections,
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


// engine kéo thả
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const poseAt = (tx, ty, rz, rx, ry, s) =>
  `translate3d(${tx}px, ${ty}px, 0) perspective(900px) ` +
  `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;

/**
 * @param {HTMLElement}  srcEl  phần tử được nhấn
 * @param {PointerEvent} down   sự kiện pointerdown
 * @param {object}       o
 *   makeGhost : () => HTMLElement   tự tạo thẻ bay (mặc định: nhân bản srcEl)
 *   lift      : độ phóng to khi nâng
 *   dim       : làm mờ phần tử gốc khi kéo (dùng cho danh sách)
 *   fade      : thẻ mờ dần khi hạ cánh (dùng cho danh sách)
 *   onPick    : () => void          bắt đầu kéo thật sự
 *   onDrop    : (slotEl) => void    thả vào ô hợp lệ (sau khi bay xong)
 *   onCancel  : () => void          thả ra ngoài / Esc (sau khi bay về xong)
 *   onEnd     : () => void          ngay khi thả (trước animation)
 *   canDrop   : (targetEl) => bool
 *   targets   : selector các vùng thả (mặc định "[data-slot]")
 */
function startDrag(srcEl, down, o = {}) {
  const {
    makeGhost, lift = 1.1, dim = false, fade = false,
    onPick, onDrop, onCancel, onEnd, canDrop,
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
    node.dataset.collection !== undefined ? COLLECTION_HOVER : HOVER_CLASSES;

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
    setHover(null);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    srcEl.style.opacity = "";

    onEnd?.();

    const done = () => {
      ghost.remove();
      target ? onDrop?.(target) : onCancel?.();
    };

    if (reduceMotion) return done();

    const soft = fade || Boolean(target?.dataset.collection);

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
    toast.classList.replace("opacity-0", "opacity-100");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.replace("opacity-100", "opacity-0");
    }, 1800);
  };

  const toolBtnClass =
    "flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold " +
    "border border-[color-mix(in_srgb,var(--text)_25%,transparent)] text-text " +
    "transition hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl";

  const addSoundBtn = el("button", toolBtnClass);
  addSoundBtn.type = "button";
  addSoundBtn.title = "Thêm ô nhập";
  addSoundBtn.setAttribute("aria-label", "Thêm ô nhập");
  addSoundBtn.innerHTML =
    '<i data-lucide="plus" class="size-4"></i><span class="text-sm font-semibold">Ô</span>';

  const addSpaceBtn = el("button", toolBtnClass);
  addSpaceBtn.type = "button";
  addSpaceBtn.title = "Thêm dấu cách";
  addSpaceBtn.setAttribute("aria-label", "Thêm dấu cách");
  addSpaceBtn.innerHTML =
    '<span class="size-2.5 rounded-full bg-hl"></span><span class="text-sm font-semibold">Cách</span>';

  const clearBtn = el("button", toolBtnClass);
  clearBtn.type = "button";
  clearBtn.title = "Làm sạch các ô";
  clearBtn.setAttribute("aria-label", "Làm sạch các ô");
  clearBtn.innerHTML =
    '<i data-lucide="eraser" class="size-4"></i><span class="text-sm font-semibold">Làm sạch</span>';

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
    const button = el(
      "button",
      "flex items-center justify-center size-9 rounded-full text-muted " +
      "hover:bg-red-500/10 hover:text-red-500 " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl"
    );

    button.type = "button";
    button.title = text;
    button.setAttribute("aria-label", text);
    button.innerHTML = '<i data-lucide="x" class="size-4"></i>';

    button.onclick = event => {
      event.stopPropagation();
      close();
      slots.splice(index, 1);
      persist(slots);
      render();
    };

    return button;
  };

  const moveSound = (from, to) => {
    if (from === to) return;

    const a = slots[from];
    const b = slots[to];
    if (a?.kind !== "sound" || b?.kind !== "sound") return;

    if (a.locked || b.locked) {
      showToast("Ô đang bị khóa, không thể di chuyển");
      return;
    }

    [a.value, b.value] = [b.value, a.value];
    [a.type, b.type] = [b.type, a.type];

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

      for (;;) {
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

  const attachDrag = (box, index) => {
    const slot = slots[index];

    box.style.touchAction = "none";

    const onEdge = (x, y) => {
      const r = box.getBoundingClientRect();
      return Math.min(x - r.left, r.right - x, y - r.top, r.bottom - y) <= EDGE;
    };

    const canGrab = () => Boolean(slot.value) && !slot.locked;

    box.addEventListener("pointermove", event => {
      if (event.buttons) return;
      box.style.cursor = canGrab() && onEdge(event.clientX, event.clientY) ? "grab" : "";
    });

    box.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (!canGrab() || !onEdge(event.clientX, event.clientY)) return;

      const savedClass = box.className;
      const textNode = [...box.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      const savedText = textNode ? textNode.textContent : "";

      const emptyBox = () => {
        if (textNode) textNode.textContent = "";
        box.classList.remove(...FILL[slot.type].split(" "), "ring-4", "ring-hl");
        box.classList.add("bg-bg", "text-muted");
        box.style.cursor = "";
      };

      const restoreBox = () => {
        if (textNode) textNode.textContent = savedText;
        box.className = savedClass;
      };

      startDrag(box, event, {
        lift: 1.12,
        canDrop: node => Number(node.dataset.slot) !== index,
        onPick: () => {
          suppressClick = true;
          emptyBox();
        },
        onEnd: () => setTimeout(() => { suppressClick = false; }, 60),
        onDrop: node => {
          moveSound(index, Number(node.dataset.slot));
          render();
        },
        onCancel: restoreBox
      });
    });
  };

  const attachWordDrag = (card, item, collectionId = null) => {
    card.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (event.target.closest("button")) return;
      if (event.pointerType !== "mouse" && !event.target.closest("[data-grip]")) return;

      startDrag(card, event, {
        lift: 1.08,
        dim: true,
        targets: "[data-slot],[data-collection]",
        canDrop: node => !collectionId || node.dataset.collection !== collectionId,
        onPick: () => { suppressClick = true; },
        onEnd: () => setTimeout(() => { suppressClick = false; }, 60),
        onDrop: node => {
          if (node.dataset.collection) {
            addToCollection(node.dataset.collection, item.id, collectionId);
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

    const lockButton = el(
      "button",
      "flex items-center justify-center size-9 rounded-full " +
      "hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl " +
      (slot.locked ? "text-con" : "text-muted")
    );

    lockButton.type = "button";
    lockButton.title = lockText;
    lockButton.setAttribute("aria-label", lockText);
    lockButton.innerHTML =
      `<i data-lucide="${slot.locked ? "lock" : "lock-open"}" class="size-4"></i>`;

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
    "hover:opacity-100 hover:bg-black/15 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl";

  const deleteWord = id => {
    savedWords = savedWords.filter(word => word.id !== id);
    collections.forEach(col => {
      col.wordIds = col.wordIds.filter(wordId => wordId !== id);
    });
    persist(slots);
    renderSavedWords();
    renderCollections();
  };

  const buildWordCard = (item, collectionId = null) => {
    const inCollection = Boolean(collectionId);

    const card = el(
      "div",
      "flex items-center gap-1 pl-1 pr-1 rounded-2xl font-bold select-none cursor-grab " +
      KEY + " " +
      (inCollection ? `${FILL.vow} py-1 text-lg` : `${FILL.con} py-2 text-2xl`)
    );

    card.title = "Kéo vào bộ sưu tập hoặc vào ô để nạp lại từ này";

    const grip = el(
      "span",
      "flex items-center justify-center size-7 shrink-0 opacity-60 touch-none"
    );
    grip.dataset.grip = "1";
    grip.innerHTML = '<i data-lucide="grip-vertical" class="size-4"></i>';

    const label = inCollection
      ? `Bỏ “${item.word}” khỏi bộ sưu tập`
      : `Xóa từ ${item.word}`;

    const remove = el("button", iconBtn);
    remove.type = "button";
    remove.title = label;
    remove.setAttribute("aria-label", label);
    remove.innerHTML = `<i data-lucide="${inCollection ? "x" : "trash-2"}" class="size-4"></i>`;

    remove.onclick = event => {
      event.stopPropagation();
      inCollection ? removeFromCollection(collectionId, item.id) : deleteWord(item.id);
    };

    card.append(grip, el("span", "px-1 whitespace-nowrap", item.word), remove);
    attachWordDrag(card, item, collectionId);
    return card;
  };

  function renderSavedWords() {
    const container = $("savedWords");

    container.className = "flex flex-wrap gap-3 pt-2";
    $("count").textContent = `${savedWords.length} từ`;

    if (!savedWords.length) {
      container.replaceChildren(
        el("p", "w-full py-6 text-center text-muted", "Chưa có từ nào được lưu.")
      );
      return;
    }

    container.replaceChildren(...savedWords.map(item => buildWordCard(item)));

    if (window.lucide) lucide.createIcons();
  }

  const collectionsEl = el("section", "mt-8 flex flex-col gap-3");
  const collectionsTitle = el(
    "p",
    "mr-auto text-xs font-semibold uppercase tracking-wide text-muted"
  );
  const collectionList = el("div", "grid gap-3 sm:grid-cols-2");

  const nameInput = el(
    "input",
    "h-9 w-40 min-w-0 px-3 rounded-full text-sm bg-bg text-text " +
    "border border-[color-mix(in_srgb,var(--text)_25%,transparent)] " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl"
  );
  nameInput.type = "text";
  nameInput.maxLength = 40;
  nameInput.placeholder = "Tên bộ sưu tập";
  nameInput.setAttribute("aria-label", "Tên bộ sưu tập mới");

  const createBtn = el("button", toolBtnClass);
  createBtn.type = "button";
  createBtn.title = "Tạo bộ sưu tập";
  createBtn.setAttribute("aria-label", "Tạo bộ sưu tập");
  createBtn.innerHTML =
    '<i data-lucide="folder-plus" class="size-4"></i><span class="text-sm font-semibold">Tạo</span>';

  collectionsEl.append(
    el("div", "flex flex-wrap items-center gap-2", "", collectionsTitle, nameInput, createBtn),
    collectionList
  );
  $("savedWords").after(collectionsEl);

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

  const addToCollection = (collectionId, wordId, fromId = null) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    const exists = col.wordIds.includes(wordId);
    if (!exists) col.wordIds.push(wordId);

    if (fromId && fromId !== collectionId) {
      const from = collections.find(c => c.id === fromId);
      if (from) from.wordIds = from.wordIds.filter(id => id !== wordId);
    }

    persist(slots);
    renderCollections();
    showToast(exists ? `Từ đã có trong “${col.name}”` : `Đã thêm vào “${col.name}”`);
  };

  const removeFromCollection = (collectionId, wordId) => {
    const col = collections.find(c => c.id === collectionId);
    if (!col) return;

    col.wordIds = col.wordIds.filter(id => id !== wordId);
    persist(slots);
    renderCollections();
  };

  const startRename = (col, nameEl) => {
    const input = el(
      "input",
      "min-w-0 flex-1 h-8 px-2 rounded-lg text-sm font-semibold bg-bg text-text " +
      "border border-[color-mix(in_srgb,var(--text)_25%,transparent)] " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-hl"
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

    const panel = el(
      "div",
      `flex flex-col gap-3 p-3 rounded-2xl border-2 border-dashed transition ${DIVIDER}`
    );
    panel.dataset.collection = col.id;

    const nameEl = el("span", "min-w-0 flex-1 truncate font-semibold", col.name);
    nameEl.title = "Nhấp đúp để đổi tên";
    nameEl.addEventListener("dblclick", () => startRename(col, nameEl));

    const rename = el("button", `${iconBtn} text-muted`);
    rename.type = "button";
    rename.title = "Đổi tên";
    rename.setAttribute("aria-label", `Đổi tên bộ sưu tập ${col.name}`);
    rename.innerHTML = '<i data-lucide="pencil" class="size-4"></i>';
    rename.onclick = event => {
      event.stopPropagation();
      startRename(col, nameEl);
    };

    const del = el("button", `${iconBtn} text-muted hover:text-red-500`);
    del.type = "button";
    del.title = "Xóa bộ sưu tập (các từ vẫn được giữ)";
    del.setAttribute("aria-label", `Xóa bộ sưu tập ${col.name}`);
    del.innerHTML = '<i data-lucide="trash-2" class="size-4"></i>';
    del.onclick = event => {
      event.stopPropagation();
      collections = collections.filter(c => c.id !== col.id);
      persist(slots);
      renderCollections();
    };

    const head = el(
      "div",
      "flex items-center gap-1",
      "",
      nameEl,
      el("span", "shrink-0 mr-1 text-xs text-muted", `${words.length} từ`),
      rename,
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

  function renderCollections() {
    collectionsTitle.textContent = `Bộ sưu tập · ${collections.length}`;

    if (!collections.length) {
      collectionList.replaceChildren(
        el(
          "p",
          "sm:col-span-2 py-4 text-center text-sm text-muted",
          "Tạo bộ sưu tập, rồi kéo thẻ từ vào đó để sắp xếp."
        )
      );
      return;
    }

    collectionList.replaceChildren(...collections.map(col => buildCollection(col)));

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

    const eraser = document.createElement("button");

    eraser.type = "button";
    eraser.title = "Bỏ chọn";
    eraser.className =
      `w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-bg text-muted ${KEY}`;
    eraser.innerHTML = '<i data-lucide="eraser" class="size-5"></i>';

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
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      openByNumber(Number(event.key));
    }
  });

  render();
  renderSavedWords();
  renderCollections();
  persist(slots);
}

(async () => {
  try {
    const response = await fetch("./data/metadata.json");

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