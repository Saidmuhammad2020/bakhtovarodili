/* =====================================================================
   FintechStan — Цифровая визитка · логика страницы
   ---------------------------------------------------------------------
   ✏️  Чтобы отредактировать данные, измените объект CONFIG ниже
       (и соответствующий текст в index.html).
   ===================================================================== */

const CONFIG = {
  firstName: "Бахтовар",
  lastName:  "Одили",
  middleName:"",
  title:     "Директор Департамента развития персонала",
  org:       "ООО «Финтехстан Таджикистан»",
  phone:     "+992888812328",        // для tel: / vCard (без пробелов)
  email:     "bakhtovar.odili@fintechstan.com",
  site:      "https://fintechstan.uz",
  // Канонический адрес визитки — используется для QR и vCard,
  // если страница открыта локально (file://). При хостинге QR
  // автоматически подставляет реальный адрес страницы.
  url:       "https://saidmuhammad2020.github.io/bakhtovarodili/"
};

const QR_QUIET = 4;          // «тихая зона» вокруг кода (модулей)
const QR_DARK  = "#0b1f3a";  // тёмно-синий, читается как чёрный

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function pageUrl() {
  const p = location.protocol;
  if (p === "http:" || p === "https:") {
    let u = location.origin + location.pathname.replace(/index\.html?$/i, "");
    return u + location.search;
  }
  return CONFIG.url; // fallback для file://
}

function fullName() {
  return `${CONFIG.lastName} ${CONFIG.firstName} ${CONFIG.middleName}`.trim();
}

function slug() {
  return `${CONFIG.lastName}-${CONFIG.firstName}`
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-");
}

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1900);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---------- QR ---------- */
function buildQrModel(text) {
  if (typeof qrcode !== "function") return null;
  const qr = qrcode(0, "M");          // тип 0 = авто-размер, коррекция M (~15%)
  qr.addData(text);
  qr.make();
  return qr;
}

function qrToSvgString(qr, sizePx) {
  const n = qr.getModuleCount();
  const total = n + QR_QUIET * 2;
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        d += `M${c + QR_QUIET},${r + QR_QUIET}h1v1h-1z`;
      }
    }
  }
  const dim = sizePx ? ` width="${sizePx}" height="${sizePx}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${total} ${total}" ` +
         `shape-rendering="crispEdges" role="img" aria-label="QR-код визитки">` +
         `<rect width="${total}" height="${total}" fill="#ffffff"/>` +
         `<path d="${d}" fill="${QR_DARK}"/></svg>`;
}

function qrToCanvas(qr, targetPx) {
  const n = qr.getModuleCount();
  const total = n + QR_QUIET * 2;
  const scale = Math.max(4, Math.floor(targetPx / total));
  const dim = total * scale;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = dim;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, dim, dim);
  ctx.fillStyle = QR_DARK;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect((c + QR_QUIET) * scale, (r + QR_QUIET) * scale, scale, scale);
      }
    }
  }
  return canvas;
}

function initQr() {
  const target = pageUrl();
  const model = buildQrModel(target);
  const holder = $("#qrCode");

  if (!model || !holder) {
    if (holder) {
      holder.innerHTML =
        `<a href="${target}" style="font-size:12px;color:#2E7CC4">${target}</a>`;
    }
    return;
  }

  holder.innerHTML = qrToSvgString(model);

  // PNG (печать / соцсети)
  const png = $("#dlPng");
  if (png) png.addEventListener("click", () => {
    qrToCanvas(model, 1200).toBlob((blob) => {
      if (blob) {
        downloadBlob(`fintechstan-qr-${slug()}.png`, blob);
        toast("QR-код PNG сохранён");
      }
    }, "image/png");
  });

  // SVG (вектор для типографии)
  const svg = $("#dlSvg");
  if (svg) svg.addEventListener("click", () => {
    const blob = new Blob([qrToSvgString(model, 1024)], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(`fintechstan-qr-${slug()}.svg`, blob);
    toast("QR-код SVG сохранён");
  });
}

/* ---------- vCard ---------- */
function buildVCard() {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${CONFIG.lastName};${CONFIG.firstName};${CONFIG.middleName};;`,
    `FN:${fullName()}`,
    `ORG:${CONFIG.org}`,
    `TITLE:${CONFIG.title}`,
    `TEL;TYPE=CELL,VOICE:${CONFIG.phone}`,
    `EMAIL;TYPE=INTERNET,WORK:${CONFIG.email}`,
    `URL:${CONFIG.site}`,
    `URL:${pageUrl()}`,
    "END:VCARD"
  ].join("\r\n");
}

function initVCard() {
  const btn = $("#saveContact");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
    downloadBlob(`${slug()}.vcf`, blob);
    toast("Контакт сохранён в vCard");
  });
}

/* ---------- copy to clipboard ---------- */
function initCopy() {
  $$(".contact__copy[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        ta.remove();
      }
      toast("Скопировано в буфер обмена");
    });
  });
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  items.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i, 6) * 60 + "ms";
    io.observe(el);
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
  initReveal();
  initQr();
  initVCard();
  initCopy();
});
