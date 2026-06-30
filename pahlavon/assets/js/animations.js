/* =================================================================
   ПАХЛАВОН — SVG-анимации услуг (ТЗ §7, КЛЮЧЕВОЙ РАЗДЕЛ)
   • фирменные цвета берутся из CSS-токенов (var(--accent) и т.п.)
   • запуск по вьюпорту (класс .anim-on добавляет app.js)
   • статичный ключевой кадр уже отрисован в разметке → это и есть
     fallback для prefers-reduced-motion (движение отключается в @media)
   • анимируются только transform/opacity (ТЗ §11)
   ================================================================= */
(function () {
  /* ---- Глобальные keyframes для всех анимаций услуг ---- */
  var css = `
  .svc { --c: var(--accent); --c2: var(--text); --bgd: var(--surface-2); }
  .svc .bg { fill: var(--bg-deep); }
  .svc .grid line { stroke: var(--border); stroke-width: .5; }
  .svc .stroke { stroke: var(--c); fill: none; }
  .svc .fillc { fill: var(--c); }
  .svc .fill2 { fill: var(--text-muted); }
  .svc .lbl { fill: var(--text); font: 700 9px var(--font-base); }
  .svc .lblc { fill: var(--c); font: 800 11px var(--font-base); }

  /* анимации работают только если разрешено движение и секция видна */
  @media (prefers-reduced-motion: no-preference) {
    .anim-on .a-sweep { animation: a-sweep 6s linear infinite; }
    .anim-on .a-box { opacity: 0; animation: a-pop 6s ease infinite; }
    .anim-on .a-box.b2 { animation-delay: 1.2s; }
    .anim-on .a-box.b3 { animation-delay: 2.4s; }
    .anim-on .a-pulse { transform-box: fill-box; transform-origin: center; animation: a-pulse 2s ease-in-out infinite; }
    .anim-on .a-count { animation: a-blink 1.5s steps(1) infinite; }

    .anim-on .a-card { animation: a-card 5.5s ease-in-out infinite; }
    .anim-on .a-ring { transform-box: fill-box; transform-origin: center; opacity: 0; animation: a-ring 5.5s ease-out infinite; }
    .anim-on .a-lock { transform-box: fill-box; transform-origin: center; animation: a-lock 5.5s ease-in-out infinite; }
    .anim-on .a-ok { opacity: 0; animation: a-pop 5.5s ease infinite; animation-delay: 2.5s; }
    .anim-on .a-door { transform-box: fill-box; transform-origin: left center; animation: a-door 5.5s ease-in-out infinite; }

    .anim-on .a-smoke { animation: a-smoke 4s ease-in infinite; }
    .anim-on .a-smoke.s2 { animation-delay: 1.3s; } .anim-on .a-smoke.s3 { animation-delay: 2.6s; }
    .anim-on .a-wave { transform-box: fill-box; transform-origin: center; opacity: 0; animation: a-wave 4s ease-out infinite; }
    .anim-on .a-wave.w2 { animation-delay: .6s; } .anim-on .a-wave.w3 { animation-delay: 1.2s; }
    .anim-on .a-dot { offset-rotate: 0deg; animation: a-dot 4s linear infinite; }

    .anim-on .a-press { transform-box: fill-box; transform-origin: center; animation: a-press 6s ease-in-out infinite; }
    .anim-on .a-travel { animation: a-travel 6s ease-in-out infinite; }
    .anim-on .a-move { animation: a-move 7s ease-in-out infinite; }
    .anim-on .a-timer { animation: a-blink 1s steps(1) infinite; }

    .anim-on .a-guard { animation: a-guard 7s ease-in-out infinite; }
    .anim-on .a-draw { stroke-dasharray: 600; stroke-dashoffset: 600; animation: a-draw 7s ease-in-out infinite; }
    .anim-on .a-shield { transform-box: fill-box; transform-origin: center; opacity: 0; animation: a-shield 7s ease-out infinite; animation-delay: 2s; }

    .anim-on .a-route { stroke-dasharray: 400; stroke-dashoffset: 400; animation: a-draw2 8s ease-in-out infinite; }
    .anim-on .a-car { animation: a-car 8s ease-in-out infinite; }
    .anim-on .a-pin { transform-box: fill-box; transform-origin: bottom; opacity: 0; animation: a-pin 8s ease-out infinite; animation-delay: 3s; }
    .anim-on .a-geo { transform-box: fill-box; transform-origin: center; animation: a-pulse 2.5s ease-in-out infinite; }

    .anim-on .a-scan { animation: a-scanx 6s ease-in-out infinite; }
    .anim-on .a-led { animation: a-led 6s steps(1) infinite; }
    .anim-on .a-led.l2 { animation-delay: 1.2s; } .anim-on .a-led.l3 { animation-delay: 2.4s; }
    .anim-on .a-gear { transform-box: fill-box; transform-origin: center; animation: a-spin 6s linear infinite; }

    .anim-on .a-flow { animation: a-flow 7s linear infinite; }
    .anml-on, .anim-on .a-barrier { transform-box: fill-box; transform-origin: bottom; animation: a-barrier 7s ease-out infinite; }
    .anim-on .a-barrier.r2 { animation-delay: .5s; } .anim-on .a-barrier.r3 { animation-delay: 1s; }
  }

  @keyframes a-sweep { 0%{transform:translateX(-20px)} 50%{transform:translateX(300px)} 100%{transform:translateX(-20px)} }
  @keyframes a-pop { 0%,10%{opacity:0;transform:scale(.7)} 25%,80%{opacity:1;transform:scale(1)} 95%,100%{opacity:0} }
  @keyframes a-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:.55} }
  @keyframes a-blink { 0%,49%{opacity:1} 50%,100%{opacity:.35} }
  @keyframes a-card { 0%{transform:translate(-40px,10px)} 35%,55%{transform:translate(0,0)} 90%,100%{transform:translate(-40px,10px)} }
  @keyframes a-ring { 0%,30%{opacity:0;transform:scale(.4)} 45%{opacity:.9;transform:scale(1)} 70%,100%{opacity:0;transform:scale(1.6)} }
  @keyframes a-lock { 0%,45%{transform:rotate(0)} 60%,100%{transform:rotate(-32deg)} }
  @keyframes a-door { 0%,55%{transform:scaleX(1)} 75%,100%{transform:scaleX(.15)} }
  @keyframes a-smoke { 0%{transform:translateY(0) scale(.6);opacity:0} 30%{opacity:.7} 100%{transform:translateY(-70px) scale(1.4);opacity:0} }
  @keyframes a-wave { 0%,20%{opacity:0;transform:scale(.3)} 35%{opacity:.8;transform:scale(1)} 70%,100%{opacity:0;transform:scale(2)} }
  @keyframes a-dot { 0%{offset-distance:0%;opacity:0} 55%{opacity:0} 60%{opacity:1} 100%{offset-distance:100%;opacity:1} }
  @keyframes a-press { 0%,55%{transform:translateY(0)} 62%{transform:translateY(3px)} 70%,100%{transform:translateY(0)} }
  @keyframes a-travel { 0%,15%{offset-distance:0%;opacity:0} 20%{opacity:1} 55%{offset-distance:100%;opacity:1} 60%,100%{opacity:0} }
  @keyframes a-move { 0%{offset-distance:0%} 60%{offset-distance:100%} 100%{offset-distance:100%} }
  @keyframes a-guard { 0%{offset-distance:0%} 100%{offset-distance:100%} }
  @keyframes a-draw { 0%{stroke-dashoffset:600} 45%,100%{stroke-dashoffset:0} }
  @keyframes a-draw2 { 0%{stroke-dashoffset:400} 60%,100%{stroke-dashoffset:0} }
  @keyframes a-shield { 0%,25%{opacity:0;transform:scale(.5)} 45%,100%{opacity:1;transform:scale(1)} }
  @keyframes a-car { 0%{offset-distance:0%} 60%{offset-distance:100%} 100%{offset-distance:100%} }
  @keyframes a-pin { 0%,35%{opacity:0;transform:translateY(-14px)} 50%,100%{opacity:1;transform:translateY(0)} }
  @keyframes a-scanx { 0%{transform:translateX(0)} 50%{transform:translateX(230px)} 100%{transform:translateX(0)} }
  @keyframes a-led { 0%,20%{fill:var(--text-subtle)} 30%,100%{fill:var(--accent)} }
  @keyframes a-spin { to { transform: rotate(360deg); } }
  @keyframes a-flow { 0%{transform:translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(120px);opacity:0} }
  @keyframes a-barrier { 0%,25%{transform:scaleY(0);opacity:0} 45%,100%{transform:scaleY(1);opacity:1} }
  `;
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* helper: визир-уголки треугольного мотива бренда */
  function corners() {
    return `<g class="stroke" stroke-width="1.5" opacity=".8">
      <path d="M8 8h22M8 8v22"/><path d="M312 8h-22M312 8v22"/>
      <path d="M8 192h22M8 192v-22"/><path d="M312 192h-22M312 192v-22"/></g>`;
  }
  function gridBg() {
    var l = "";
    for (var x = 40; x < 320; x += 40) l += `<line x1="${x}" y1="0" x2="${x}" y2="200"/>`;
    for (var y = 40; y < 200; y += 40) l += `<line x1="0" y1="${y}" x2="320" y2="${y}"/>`;
    return `<g class="grid">${l}</g>`;
  }
  var W = `viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" class="svc" role="img"`;

  window.SERVICE_ANIMS = {
    /* 1 — Видеонаблюдение: sweep + рамки распознавания + счётчик */
    video: function () {
      return `<svg ${W} aria-label="Видеонаблюдение">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- фигуры -->
        <g class="fill2">
          <circle cx="90" cy="95" r="13"/><rect x="78" y="108" width="24" height="34" rx="6"/>
          <rect x="180" y="120" width="50" height="24" rx="4"/><circle cx="190" cy="148" r="5"/><circle cx="222" cy="148" r="5"/>
        </g>
        <!-- рамки распознавания (статичный кадр = видны) -->
        <g class="stroke" stroke-width="2">
          <g class="a-box"><rect x="70" y="78" width="42" height="70" rx="3"/><rect class="fillc" x="70" y="68" width="46" height="11"/><text class="lbl" x="73" y="77" fill="var(--brand-graphite)">человек</text></g>
          <g class="a-box b2"><rect x="172" y="112" width="66" height="42" rx="3"/><rect class="fillc" x="172" y="102" width="34" height="11"/><text class="lbl" x="175" y="111" fill="var(--brand-graphite)">авто</text></g>
          <g class="a-box b3"><rect class="a-pulse" x="250" y="40" width="34" height="34" rx="3"/><text class="lblc" x="262" y="34">!</text></g>
        </g>
        <!-- сканирующая линия -->
        <rect class="a-sweep fillc" x="0" y="0" width="3" height="200" opacity=".7"/>
        <!-- счётчик -->
        <g class="a-count"><rect class="fillc" x="14" y="18" width="9" height="9" rx="1"/><text class="lbl" x="30" y="26">поток: 128</text></g>
        ${corners()}
      </svg>`;
    },

    /* 2 — СКУД: карта → считыватель → замок открывается → галочка */
    access: function () {
      return `<svg ${W} aria-label="Контроль доступа">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- турникет/дверь -->
        <rect class="fill2" x="150" y="60" width="14" height="100" rx="3"/>
        <rect class="a-door fill2" x="166" y="64" width="60" height="92" opacity=".5"/>
        <!-- считыватель -->
        <rect class="fillc" x="120" y="92" width="22" height="34" rx="4"/>
        <circle class="a-ring stroke" stroke-width="2.5" cx="131" cy="109" r="14"/>
        <!-- карта -->
        <g class="a-card"><rect class="fillc" x="60" y="100" width="34" height="22" rx="3"/><rect class="bg" x="64" y="106" width="14" height="3"/></g>
        <!-- замок -->
        <g transform="translate(232,150)"><rect class="fillc" x="-12" y="0" width="24" height="18" rx="3"/><path class="a-lock stroke" stroke-width="3" d="M-7 0 v-6 a7 7 0 0 1 14 0"/></g>
        <!-- галочка «Доступ разрешён» -->
        <g class="a-ok"><circle class="fillc" cx="160" cy="34" r="13"/><path stroke="var(--brand-graphite)" stroke-width="2.5" fill="none" d="M154 34l4 4 8-9"/><text class="lblc" x="180" y="38">OK</text></g>
        ${corners()}
      </svg>`;
    },

    /* 3 — Пожарная: дым → датчик → кольца → сигнал на телефон */
    fire: function () {
      return `<svg ${W} aria-label="Пожарная сигнализация">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- датчик на потолке -->
        <ellipse class="fillc" cx="120" cy="40" rx="22" ry="8"/>
        <circle class="a-pulse" cx="120" cy="40" r="5" fill="var(--danger)"/>
        <circle class="a-wave stroke" stroke-width="2" cx="120" cy="46" r="16"/>
        <circle class="a-wave w2 stroke" stroke-width="2" cx="120" cy="46" r="16"/>
        <circle class="a-wave w3 stroke" stroke-width="2" cx="120" cy="46" r="16"/>
        <!-- дым -->
        <g class="fill2" opacity=".5">
          <circle class="a-smoke" cx="116" cy="160" r="10"/>
          <circle class="a-smoke s2" cx="126" cy="160" r="8"/>
          <circle class="a-smoke s3" cx="120" cy="160" r="9"/>
        </g>
        <!-- путь сигнала к телефону -->
        <path id="firePath" class="stroke" stroke-dasharray="4 4" stroke-width="1.2" opacity=".5" d="M138 44 Q230 50 250 120"/>
        <circle class="a-dot fillc" r="4" style="offset-path:path('M138 44 Q230 50 250 120')"/>
        <!-- телефон с сиреной -->
        <g transform="translate(236,118)"><rect class="fill2" width="28" height="48" rx="5"/><rect class="fillc" x="3" y="5" width="22" height="30" rx="2"/><path class="a-count" stroke="var(--danger)" stroke-width="2" fill="none" d="M8 16 h12 M8 21 h12 M8 26 h8"/></g>
        ${corners()}
      </svg>`;
    },

    /* 4 — Пультовая: кнопка → сигнал → пульт → выезд группы → таймер */
    monitoring: function () {
      return `<svg ${W} aria-label="Пультовая охрана">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- тревожная кнопка -->
        <circle class="a-wave stroke" stroke-width="2" cx="56" cy="120" r="22"/>
        <circle class="a-wave w2 stroke" stroke-width="2" cx="56" cy="120" r="22"/>
        <circle class="a-press fillc" cx="56" cy="120" r="16"/>
        <text x="56" y="124" text-anchor="middle" fill="var(--brand-graphite)" font="800 11px var(--font-base)">SOS</text>
        <!-- путь к пульту -->
        <path class="stroke" stroke-dasharray="4 4" stroke-width="1.2" opacity=".5" d="M78 120 H150"/>
        <circle class="a-travel fillc" r="4" style="offset-path:path('M78 120 H150')"/>
        <!-- пульт оператора -->
        <g transform="translate(150,96)"><rect class="fill2" width="56" height="40" rx="4"/><rect class="a-pulse fillc" x="5" y="6" width="46" height="20" rx="2" opacity=".85"/><rect class="fill2" x="16" y="32" width="24" height="5" rx="2"/></g>
        <!-- выезд группы -->
        <path class="stroke" stroke-dasharray="4 4" stroke-width="1.2" opacity=".5" d="M208 116 Q250 130 286 150"/>
        <g class="a-move" style="offset-path:path('M208 116 Q250 130 286 150')"><rect class="fillc" x="-9" y="-6" width="18" height="12" rx="2"/></g>
        <!-- таймер -->
        <g class="a-timer"><circle class="stroke" stroke-width="2" cx="280" cy="40" r="14"/><path class="stroke" stroke-width="2" d="M280 40 V31 M280 40 l7 4"/></g>
        ${corners()}
      </svg>`;
    },

    /* 5 — Физическая охрана: патруль → периметр draw-on → щит */
    guard: function () {
      return `<svg ${W} aria-label="Физическая охрана">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- здание -->
        <rect class="fill2" x="120" y="78" width="80" height="60" rx="3"/>
        <rect class="bg" x="134" y="92" width="14" height="14"/><rect class="bg" x="172" y="92" width="14" height="14"/>
        <!-- периметр (рисуется) -->
        <rect class="a-draw stroke" stroke-width="2.5" x="70" y="50" width="180" height="120" rx="6"/>
        <!-- маршрут патруля -->
        <rect class="stroke" stroke-dasharray="4 4" stroke-width="1" opacity=".4" x="86" y="64" width="148" height="92" rx="4" fill="none"/>
        <g class="a-guard" style="offset-path:path('M86 110 V64 H234 V156 H86 Z')">
          <circle class="fillc" cx="0" cy="-7" r="5"/><rect class="fillc" x="-5" y="-2" width="10" height="14" rx="3"/>
        </g>
        <!-- щит-мотив бренда -->
        <g class="a-shield" transform="translate(160,108)">
          <path class="fillc" d="M0 -24 L20 -15 V4 C20 18 0 26 0 26 C0 26 -20 18 -20 4 V-15 Z" opacity=".9"/>
          <path stroke="var(--brand-graphite)" stroke-width="2" fill="none" d="M-8 2 l5 6 l11 -13"/>
        </g>
        ${corners()}
      </svg>`;
    },

    /* 6 — GPS: авто едет, чертит маршрут, пин, геозона */
    gps: function () {
      return `<svg ${W} aria-label="GPS-мониторинг">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- геозона -->
        <circle class="a-geo stroke" stroke-width="1.5" stroke-dasharray="5 5" cx="250" cy="70" r="38" opacity=".6"/>
        <!-- маршрут -->
        <path class="a-route stroke" stroke-width="2.5" d="M30 160 Q90 80 150 130 T260 70"/>
        <!-- авто -->
        <g class="a-car" style="offset-path:path('M30 160 Q90 80 150 130 T260 70')">
          <rect class="fillc" x="-10" y="-6" width="20" height="12" rx="3"/><circle class="bg" cx="-4" cy="6" r="2.5"/><circle class="bg" cx="4" cy="6" r="2.5"/>
        </g>
        <!-- пин назначения -->
        <g class="a-pin" transform="translate(260,70)"><path class="fillc" d="M0 0 C-9 -10 -9 -22 0 -22 C9 -22 9 -10 0 0Z" transform="translate(0,-2)"/><circle class="bg" cx="0" cy="-13" r="4"/></g>
        <!-- телеметрия -->
        <g class="a-count"><rect class="fill2" x="14" y="16" width="86" height="26" rx="4"/><text class="lblc" x="22" y="33">62 км/ч</text></g>
        ${corners()}
      </svg>`;
    },

    /* 7 — Диагностика: скан по устройствам, статусы OK, шестерёнка */
    service: function () {
      return `<svg ${W} aria-label="Диагностика и ремонт">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        <!-- устройства -->
        <g class="fill2">
          <rect x="40" y="90" width="48" height="36" rx="4"/>
          <rect x="136" y="90" width="48" height="36" rx="4"/>
          <rect x="232" y="90" width="48" height="36" rx="4"/>
        </g>
        <!-- статус-индикаторы -->
        <circle class="a-led fillc" cx="64" cy="135" r="5"/>
        <circle class="a-led l2 fillc" cx="160" cy="135" r="5"/>
        <circle class="a-led l3 fillc" cx="256" cy="135" r="5"/>
        <text class="lbl" x="50" y="84">CAM</text><text class="lbl" x="142" y="84">SENS</text><text class="lbl" x="236" y="84">CTRL</text>
        <!-- диагностический скан -->
        <rect class="a-scan fillc" x="34" y="80" width="3" height="60" opacity=".6"/>
        <!-- шестерёнка -->
        <g class="a-gear" transform="translate(160,42)"><path class="fillc" d="M0 -14 2 -9 8 -11 9 -5 14 -3 11 2 14 8 8 9 5 14 0 11 -5 14 -8 9 -14 8 -11 2 -14 -3 -9 -5 -11 -11 -5 -9 -2 -14Z"/><circle class="bg" r="4"/></g>
        ${corners()}
      </svg>`;
    },

    /* 8 — Мероприятия: поток людей → ограждения slide-in → сканер → счётчик */
    events: function () {
      var people = "";
      for (var i = 0; i < 5; i++) people += `<g class="a-flow" style="animation-delay:${i * 0.9}s"><circle class="fill2" cx="${10 + i * 6}" cy="120" r="5"/><rect class="fill2" x="${5 + i * 6}" y="126" width="10" height="14" rx="3"/></g>`;
      return `<svg ${W} aria-label="Безопасность мероприятий">
        <rect class="bg" width="320" height="200"/>${gridBg()}
        ${people}
        <!-- ограждения -->
        <g class="fillc">
          <rect class="a-barrier" x="150" y="70" width="6" height="60" rx="2"/>
          <rect class="a-barrier r2" x="150" y="130" width="6" height="50" rx="2"/>
          <rect class="a-barrier r3" x="240" y="70" width="6" height="110" rx="2"/>
        </g>
        <!-- ворота-сканер -->
        <rect class="a-pulse stroke" stroke-width="2.5" x="170" y="78" width="48" height="64" rx="4"/>
        <text class="lblc" x="178" y="70">SCAN</text>
        <!-- счётчик посетителей -->
        <g class="a-count"><rect class="fill2" x="262" y="16" width="48" height="26" rx="4"/><text class="lblc" x="270" y="33">1 240</text></g>
        ${corners()}
      </svg>`;
    },
  };

  /* ===== Основной логотип — официальный растровый файл (ТЗ §3.2/§3.3) =====
     Логотип больше не рисуется в JS: используется готовый файл бренда
     (assets/img/logo-cream.png / logo-graphite.png), подключаемый через
     <img> прямо в разметке header/footer каждой страницы, с CSS-переключением
     по теме. Здесь остаётся только щит-эмблема — фирменный знак из того же
     логотипа, вырезанный отдельно для точечного использования (favicon,
     «О компании», экран входа в админку) — НЕ как основной логотип. */
  window.PAHLAVON_SHIELD_SRC = function (theme) {
    return "assets/img/shield-" + (theme === "light" ? "graphite" : "gold") + ".png";
  };

  /* ===== Дрейфующий треугольный паттерн для hero (ТЗ §3.4, §8.2) ===== */
  window.HERO_PATTERN = function () {
    return `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600" aria-hidden="true">
      <defs><pattern id="tri" width="80" height="70" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
        <path d="M40 6 L74 64 L6 64 Z" fill="none" stroke="var(--accent)" stroke-width="1" opacity=".18"/>
        <path d="M40 64 L74 6 L6 6 Z" fill="none" stroke="var(--brand-cream)" stroke-width=".5" opacity=".06"/>
      </pattern></defs>
      <rect width="800" height="600" fill="url(#tri)">
        <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="80 70" dur="22s" repeatCount="indefinite"/>
      </rect>
    </svg>`;
  };
})();
