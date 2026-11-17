/* CUT. PASTE. PLAY. · motorul player-ului (HTML, SCORM 2004 3rd Edition).
   Rulează: din LMS (SCORM), de pe un server static (GitHub Pages, AWS S3) sau direct de pe PC (index.html).
   Fără LMS, progresul și răspunsurile se păstrează doar în browserul de pe acest dispozitiv (localStorage). */
(function () {
  'use strict';

  var CFG = window.CPP_CONFIG;
  var VOI = window.CPP_VO || {};
  var SLIDES = window.CPP_SLIDES || [];
  var EXTRAS = window.CPP_EXTRAS || {};
  var ORDER = SLIDES.map(function (s) { return s.id; });
  var LEAD = 0.2;          // obiectele apar cu 0,2 s înaintea cuvintelor lor
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- Iconițe (SVG, culoarea textului) ----------
  var ICONS = {
    menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    play: '<path d="M7.5 5v14l11.5-7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3.4"/>',
    replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4.5v4.6h4.6"/>',
    skip: '<path d="M5 6l8 6-8 6z" fill="currentColor" stroke="none"/><path d="M18 6v12" stroke-width="2.8"/>',
    cc: '<rect x="2.5" y="5" width="19" height="14"/><path d="M10.4 10.2a2.6 2.6 0 1 0 0 3.6M17.4 10.2a2.6 2.6 0 1 0 0 3.6"/>',
    vol: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11"/>',
    voloff: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
    print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7.5"/><path d="M7 14h10v6H7z"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    compress: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 2M9.5 2.5h5"/>',
    film: '<rect x="3.5" y="4" width="17" height="16"/><path d="M3.5 8.5h17M3.5 15.5h17M8 4v4.5M12 4v4.5M16 4v4.5M8 15.5V20M12 15.5V20M16 15.5V20"/>',
    recipe: '<rect x="5" y="3" width="14" height="18"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5"/>',
    box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    pen: '<path d="M4 20l1-5L16.5 3.5l4 4L9 19z"/><path d="M14 6l4 4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/>',
    exit: '<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    sound: '<path d="M4 14V10M8 17V7M12 20V4M16 16V8M20 13v-2"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="1.5"/><path d="M11 18.5h2"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  // ---------- Stare ----------
  var V = {};
  var S = { visited: {}, seen: {}, loc: ORDER[0], completed: false, history: [] };
  function resetVars() { Object.keys(CFG.vars).forEach(function (k) { V[k] = CFG.vars[k]; }); }
  resetVars();

  var prefs = { voice: true, cc: true, rate: 1 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem('CPP_prefs') || '{}')); } catch (e) { /* fără localStorage */ }
  function savePrefs() { try { localStorage.setItem('CPP_prefs', JSON.stringify(prefs)); } catch (e) { /* ignoră */ } }

  // ---------- Salvare: LMS (SCORM) sau browserul local ----------
  var lms = false, saveTimer = 0, lastCommit = 0;
  function snapshot() {
    return JSON.stringify({ v: 1, loc: S.loc, vars: V, vis: ORDER.filter(function (id) { return S.visited[id]; }), seen: S.seen, done: S.completed ? 1 : 0 });
  }
  function restore(json) {
    try {
      var d = JSON.parse(json);
      if (!d || !d.vars) { return false; }
      Object.keys(CFG.vars).forEach(function (k) { if (k in d.vars) { V[k] = d.vars[k]; } });
      (d.vis || []).forEach(function (id) { S.visited[id] = true; });
      S.seen = d.seen || {}; S.loc = d.loc || ORDER[0]; S.completed = !!d.done;
      return true;
    } catch (e) { return false; }
  }
  function progress() { return Math.min(1, ORDER.filter(function (id) { return S.visited[id]; }).length / ORDER.length); }
  function saveNow(forceCommit) {
    clearTimeout(saveTimer);
    var data = snapshot();
    if (lms) {
      SCORM.set('cmi.location', S.loc);
      SCORM.set('cmi.suspend_data', data);
      SCORM.set('cmi.progress_measure', S.completed ? '1' : progress().toFixed(2));
      if (forceCommit || Date.now() - lastCommit > 15000) { SCORM.commit(); lastCommit = Date.now(); }
    } else {
      try { localStorage.setItem(CFG.storageKey, data); } catch (e) { /* plin sau blocat */ }
    }
  }
  function save(delay) { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, delay == null ? 600 : delay); }
  function setVar(k, v) { V[k] = v; save(); }

  // ---------- Elemente de bază ----------
  var app, stage, slideEl, ccEl, barEl, progEl, liveEl, chromeEl, snavEl;
  var current = null;

  // Pânza de 1920 × 1224 (slide 1080 + subtitrare 64 + bară 80) se scalează la fereastră.
  function fit() {
    var W = 1920, H = 1224, root = document.documentElement;
    var iw = root.clientWidth || window.innerWidth, ih = root.clientHeight || window.innerHeight;
    var s = Math.min(iw / W, ih / H);
    var x = Math.max(0, (iw - W * s) / 2), y = Math.max(0, (ih - H * s) / 2);
    app.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    // pe un telefon ținut în picioare, pânza ar fi prea mică: îl rugăm să-l întoarcă (o singură dată)
    var portrait = ih > iw * 1.15 && iw < 760 && !S.seen.rotOk;
    root.classList.toggle('is-portrait', portrait);
  }

  // ---------- Ecran complet ----------
  function fsSupported() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); }
  function fsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function fsEnter() {
    var el = document.documentElement, p = null;
    try {
      if (el.requestFullscreen) { p = el.requestFullscreen({ navigationUI: 'hide' }); }
      else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); }
    } catch (e) { /* browserul a refuzat */ }
    if (p && p.catch) { p.catch(function () { /* browserul a refuzat */ }); }
  }
  function fsExit() {
    var p = null;
    try {
      if (document.exitFullscreen) { p = document.exitFullscreen(); }
      else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
    } catch (e) { /* ignoră */ }
    if (p && p.catch) { p.catch(function () { /* ignoră */ }); }
  }
  function fsToggle() { if (fsActive()) { fsExit(); } else { fsEnter(); } }
  function announce(msg) { liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = msg; }, 60); }

  // ---------- Vocea și apariția obiectelor pe fraze ----------
  var VO = {
    a: new Audio(), key: null, scope: null, idx: -1, raf: 0, state: 'idle', timers: [],
    load: function (key, scope) {
      this.stop();
      this.key = VOI[key] ? key : null; this.scope = scope; this.idx = -1; this.state = 'idle';
      if (this.key && prefs.voice) { this.src(); }
      ui();
    },
    src: function () {
      var want = 'audio/' + this.key + '.mp3';
      if (this.a.getAttribute('src') !== want) { this.a.src = want; this.a.preload = 'auto'; }
    },
    cues: function () { return this.key ? VOI[this.key].c : []; },
    sents: function () { return this.key ? VOI[this.key].s || [] : []; },
    play: function (fromStart) {
      var self = this;
      if (!this.key) { return; }
      if (!prefs.voice) { reveal(this.scope, 99); return; }
      this.src();
      if (fromStart || this.state === 'ended' || this.state === 'idle' || this.state === 'blocked') {
        hideCues(this.scope); this.idx = -1;
        try { this.a.currentTime = 0; } catch (e) { /* încă nu e încărcat */ }
        this.step(0);
      }
      this.a.playbackRate = prefs.rate;
      this.state = 'playing'; ui();
      var p = this.a.play();
      if (p && p.catch) {
        p.catch(function (err) {
          if (self.state !== 'playing') { return; }
          // Browserul nu lasă sunetul să pornească singur (fără un clic): arătăm tot și marcăm butonul ▶.
          self.state = err && err.name === 'NotAllowedError' ? 'blocked' : 'idle';
          cancelAnimationFrame(self.raf); quickReveal(self.scope); caption(''); ui();
        });
      }
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(function loop() {
        if (self.state !== 'playing') { return; }
        var t = self.a.currentTime + LEAD, c = self.cues(), i = -1;
        for (var j = 0; j < c.length; j++) { if (c[j][0] <= t) { i = j; } }
        if (i > self.idx) { self.step(i); }
        var s = self.sents(), k = -1, ct = self.a.currentTime;
        for (var m = 0; m < s.length; m++) { if (s[m][0] <= ct + 0.05) { k = m; } }
        caption(k >= 0 ? s[k][1] : '');
        if (self.a.duration) { progEl.style.width = (100 * self.a.currentTime / self.a.duration) + '%'; }
        self.raf = requestAnimationFrame(loop);
      });
    },
    step: function (i) { this.idx = i; reveal(this.scope, i); },
    pause: function () { if (this.state === 'playing') { this.a.pause(); this.state = 'paused'; cancelAnimationFrame(this.raf); ui(); } },
    stop: function () {
      cancelAnimationFrame(this.raf);
      try { this.a.pause(); } catch (e) { /* ignoră */ }
      if (this.state === 'playing' || this.state === 'paused') { this.state = 'idle'; }
      caption(''); if (progEl) { progEl.style.width = '0'; }
    },
    skip: function () { this.stop(); this.state = 'ended'; reveal(this.scope, 99); ui(); }
  };
  VO.a.addEventListener('ended', function () {
    VO.state = 'ended'; cancelAnimationFrame(VO.raf); reveal(VO.scope, 99);
    progEl.style.width = '100%';
    setTimeout(function () { if (VO.state === 'ended') { caption(''); progEl.style.width = '0'; } }, 900);
    ui();
  });
  VO.a.addEventListener('error', function () {
    if (VO.state === 'playing') { VO.state = 'idle'; cancelAnimationFrame(VO.raf); quickReveal(VO.scope); caption(''); ui(); }
  });

  function cueEls(scope) { return scope ? $$('[data-cue]', scope) : []; }
  function hideCues(scope) { cueEls(scope).forEach(function (el) { el.classList.remove('cue-in'); el.classList.add('cue-wait'); }); }
  function reveal(scope, upTo) {
    var hit = false;
    cueEls(scope).forEach(function (el) {
      if (Number(el.getAttribute('data-cue')) <= upTo && el.classList.contains('cue-wait')) {
        el.classList.remove('cue-wait'); void el.offsetWidth; el.classList.add('cue-in'); hit = true;
      }
    });
    if (hit && scope) { scope.dispatchEvent(new CustomEvent('cpp:cue', { detail: upTo })); }
  }
  function quickReveal(scope) {
    var max = 0;
    cueEls(scope).forEach(function (el) { max = Math.max(max, Number(el.getAttribute('data-cue'))); });
    reveal(scope, 0);
    for (var i = 1; i <= max; i++) { (function (k) { VO.timers.push(setTimeout(function () { reveal(scope, k); }, 260 * k)); })(i); }
  }
  function revealNow(scope) {
    cueEls(scope).forEach(function (el) { el.classList.remove('cue-wait'); el.classList.remove('cue-in'); });
    if (scope) { scope.dispatchEvent(new CustomEvent('cpp:cue', { detail: 99 })); }
  }
  function caption(text) {
    var span = $('span', ccEl);
    if (span.textContent !== (text || '')) { span.textContent = text || ''; }
    ccEl.classList.toggle('is-off', !prefs.cc || !text);
  }

  // Prima vizită: cu voce; la revenire, tot slide-ul e pe ecran (▶ reia vocea).
  function narrate(key, scope, first) {
    VO.timers.forEach(clearTimeout); VO.timers = [];
    VO.load(key, scope);
    if (!VO.key) { revealNow(scope); return; }
    if (first && prefs.voice) { VO.play(true); }
    else if (first) { hideCues(scope); quickReveal(scope); }
    else { revealNow(scope); }
  }

  // ---------- Bara de control ----------
  function ui() {
    if (!barEl) { return; }
    var playBtn = $('#bPlay'), has = !!VO.key, playing = VO.state === 'playing';
    playBtn.innerHTML = icon(playing ? 'pause' : 'play');
    playBtn.setAttribute('aria-label', playing ? 'Pune vocea pe pauză' : 'Ascultă vocea');
    playBtn.title = playBtn.getAttribute('aria-label');
    playBtn.classList.toggle('is-attn', VO.state === 'blocked' && prefs.voice);
    ['#bPlay', '#bReplay', '#bSkip'].forEach(function (id) { $(id).disabled = !has || !prefs.voice; });
    $('#bCC').setAttribute('aria-pressed', String(prefs.cc));
    var vb = $('#bVoice');
    vb.setAttribute('aria-pressed', String(prefs.voice));
    vb.innerHTML = icon(prefs.voice ? 'vol' : 'voloff') + '<span>Voce</span>';
    var rate = String(prefs.rate).replace('.', ',') + '×';
    $('#bRate').textContent = rate; $('#bRate').setAttribute('aria-label', 'Viteza vocii: ' + rate);
    $('#bRate').disabled = !prefs.voice;
    var fb = $('#bFull'), fs = fsActive();
    fb.innerHTML = icon(fs ? 'compress' : 'expand');
    fb.setAttribute('aria-pressed', String(fs));
    fb.title = fs ? 'Ieși din ecranul complet' : 'Ecran complet';
  }
  function buildBar() {
    barEl.innerHTML =
      '<div class="bar-progress" id="bProg" aria-hidden="true"></div>' +
      '<button class="bar-btn" id="bMenu" aria-haspopup="dialog">' + icon('menu') + '<span>Cuprins</span></button>' +
      '<p class="bar-label" id="bLabel"></p>' +
      '<div class="bar-voice" role="group" aria-label="Vocea">' +
      '<button class="bar-btn" id="bReplay" aria-label="Ascultă din nou de la început" title="Ascultă din nou">' + icon('replay') + '</button>' +
      '<button class="bar-btn bar-play" id="bPlay"></button>' +
      '<button class="bar-btn" id="bSkip" aria-label="Arată tot slide-ul acum, fără să aștepți vocea" title="Arată tot acum">' + icon('skip') + '</button>' +
      '<span class="bar-sep" aria-hidden="true"></span>' +
      '<button class="bar-btn" id="bCC" aria-label="Subtitrare" title="Subtitrare">' + icon('cc') + '</button>' +
      '<button class="bar-btn" id="bVoice" title="Pornește sau oprește vocea"></button>' +
      '<button class="bar-btn bar-rate" id="bRate" title="Viteza vocii">1×</button>' +
      '</div>' +
      '<span class="bar-sep" aria-hidden="true"></span>' +
      '<button class="bar-btn" id="bFull" aria-label="Ecran complet"' + (fsSupported() ? '' : ' hidden') + '></button>';
    progEl = $('#bProg');
    $('#bMenu').addEventListener('click', openMenu);
    $('#bPlay').addEventListener('click', function () {
      if (VO.state === 'playing') { VO.pause(); }
      else if (VO.state === 'paused') { VO.play(false); }
      else { VO.play(true); }
    });
    $('#bReplay').addEventListener('click', function () { VO.play(true); });
    $('#bSkip').addEventListener('click', function () { VO.skip(); });
    $('#bCC').addEventListener('click', function () {
      prefs.cc = !prefs.cc; savePrefs(); ui();
      if (!prefs.cc) { ccEl.classList.add('is-off'); } else if (VO.state === 'playing') { ccEl.classList.remove('is-off'); }
    });
    $('#bVoice').addEventListener('click', function () {
      prefs.voice = !prefs.voice; savePrefs();
      if (!prefs.voice) { VO.skip(); } else { VO.state = 'idle'; }
      ui();
    });
    $('#bRate').addEventListener('click', function () {
      var r = [1, 1.25, 1.5, 0.85]; prefs.rate = r[(r.indexOf(prefs.rate) + 1) % r.length] || 1;
      VO.a.playbackRate = prefs.rate; savePrefs(); ui();
    });
    $('#bFull').addEventListener('click', fsToggle);
    ui();
  }

  // ---------- Cadrul slide-ului: antet, subsol, progres, butoanele Înapoi / Următorul ----------
  function buildChrome() {
    chromeEl.innerHTML = '<p class="ch-hdr" aria-hidden="true">ATELIER / CLASA A XII-A</p>' +
      '<p class="ch-sec" id="chSec"></p><div class="ch-line ch-line--top"></div>' +
      '<p class="ch-num" id="chNum" aria-hidden="true"></p><p class="ch-foot" aria-hidden="true">CUT / PASTE / PLAY</p>' +
      '<div class="ch-line ch-line--bot"></div><div class="ch-prog" id="chProg"></div>';
    snavEl.innerHTML = '<button class="snav-btn snav-prev" id="nPrev" type="button"><span class="arr" aria-hidden="true">←</span> Înapoi</button>' +
      '<button class="snav-btn snav-next" id="nNext" type="button">Următorul <span class="arr" aria-hidden="true">→</span></button>';
    $('#nPrev').addEventListener('click', prev);
    $('#nNext').addEventListener('click', next);
  }
  function chromeFor(s) {
    var n = s.n;
    $('#chSec').textContent = s.sec;
    $('#chSec').setAttribute('aria-label', 'Secțiunea ' + s.sec);
    $('#chNum').textContent = (n < 10 ? '0' : '') + n;
    $('#chProg').style.width = (1792 * n / ORDER.length).toFixed(1) + 'px';
    snavEl.hidden = !(s.layout === 'content' || s.layout === 'dark');
    $('#bLabel').innerHTML = '<b>' + esc(s.id) + '</b><span>' + esc(s.title) + '</span><span class="chap">' + esc(s.chap.toUpperCase()) + '</span>';
  }

  // ---------- Navigare ----------
  var SL = {};
  function go(id, opts) {
    var s = SL[id];
    if (!s) { return; }
    opts = opts || {};
    VO.stop(); closeModals(true); clearMsgs();
    if (current && EXTRAS[current.id] && EXTRAS[current.id].leave) { try { EXTRAS[current.id].leave(); } catch (e) { /* ignoră */ } }
    if (current && !opts.back && current.id !== id) { S.history.push(current.id); if (S.history.length > 60) { S.history.shift(); } }
    var first = !S.visited[id];
    current = s; S.loc = id; S.visited[id] = true;
    stage.className = 'stage is-' + s.layout;
    chromeFor(s);
    // un element nou pentru fiecare slide (fără ascultătorii slide-ului de dinainte)
    var fresh = slideEl.cloneNode(false); slideEl.parentNode.replaceChild(fresh, slideEl); slideEl = fresh;
    slideEl.addEventListener('animationend', function (e) {
      if (/^fx-/.test(e.animationName) && e.target.classList.contains('cue-in')) { e.target.classList.remove('cue-in'); }
    });
    slideEl.className = 'slide s-' + s.key;
    slideEl.setAttribute('aria-label', 'Slide-ul ' + s.n + ' din ' + ORDER.length + ': ' + s.title);
    slideEl.innerHTML = s.html;
    void slideEl.offsetWidth; slideEl.classList.add('is-enter');
    $$('[data-act]', slideEl).forEach(function (b) {
      var a = b.getAttribute('data-act');
      b.addEventListener('click', a === 'start' ? next : a === 'prev' ? prev : finish);
    });
    if (EXTRAS[id] && EXTRAS[id].init) { try { EXTRAS[id].init(slideEl, first); } catch (e) { if (window.console) { console.error(e); } } }
    narrate(s.key, slideEl, first);
    var h = $('h1', slideEl);
    if (h && !opts.keepFocus) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    announce('Slide-ul ' + s.n + ' din ' + ORDER.length + ': ' + s.title);
    saveNow(true);
    // imaginile slide-ului următor se încarcă dinainte (fără sclipire la „Următorul”)
    var nx = SL[ORDER[ORDER.indexOf(id) + 1]];
    if (nx) { setTimeout(function () { (nx.html.match(/src="[^"]+"/g) || []).forEach(function (m) { var im = new Image(); im.src = m.slice(5, -1); }); }, 500); }
  }
  function next() {
    if (!current || modals.length) { return; }
    var i = ORDER.indexOf(current.id);
    if (ORDER[i + 1]) { go(ORDER[i + 1]); }
  }
  function prev() {
    if (!current || modals.length) { return; }
    var i = ORDER.indexOf(current.id);
    if (i > 0) { go(ORDER[i - 1], { back: true }); }
  }

  // ---------- Ferestre ----------
  var modals = [];
  function openModal(o) {
    var m = document.createElement('div');
    m.className = 'modal' + (o.dark ? ' modal--dark' : '') + (o.cls ? ' ' + o.cls : '');
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', o.label || '');
    m.innerHTML = '<div class="modal-panel"' + (o.style ? ' style="' + o.style + '"' : '') + '><div class="modal-body">' + o.html + '</div><button class="modal-x" type="button" data-close aria-label="Închide">' + icon('close') + '</button></div>';
    stage.appendChild(m);
    var prevFocus = document.activeElement;
    slideEl.inert = true; snavEl.inert = true; $$('.modal', stage).forEach(function (x) { if (x !== m) { x.inert = true; } });
    $('#bMenu').disabled = true;
    var api = {
      el: m,
      close: function (silent) {
        if (!m.parentNode) { return; }
        m.parentNode.removeChild(m);
        modals = modals.filter(function (x) { return x !== api; });
        var top = modals[modals.length - 1];
        if (top) { top.el.inert = false; } else { slideEl.inert = false; snavEl.inert = false; $('#bMenu').disabled = false; }
        if (o.onClose) { o.onClose(); }
        if (!silent && prevFocus && prevFocus.focus && document.contains(prevFocus)) { try { prevFocus.focus({ preventScroll: true }); } catch (e) { /* ignoră */ } }
      }
    };
    modals.push(api);
    $$('[data-close]', m).forEach(function (b) { b.addEventListener('click', function () { api.close(); }); });
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); api.close(); }
      if (e.key === 'Tab') { trap(e, m); }
    });
    m.addEventListener('mousedown', function (e) { if (e.target === m && o.scrimClose !== false) { api.close(); } });
    if (o.stopVoice !== false) { if (current) { reveal(slideEl, 99); } VO.timers.forEach(clearTimeout); VO.stop(); if (VO.state !== 'blocked') { VO.state = 'idle'; } ui(); }
    if (o.onOpen) { o.onOpen(m, api); }
    var f = $(o.focus || 'h2, h1, [data-close]', m);
    if (f) { if (!f.hasAttribute('tabindex') && !/BUTTON|A|INPUT|TEXTAREA/.test(f.tagName)) { f.setAttribute('tabindex', '-1'); } try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    return api;
  }
  function trap(e, m) {
    var f = $$('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"]), video[controls]', m)
      .filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
    if (!f.length) { return; }
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  function closeModals(silent) { modals.slice().reverse().forEach(function (x) { x.close(silent); }); }

  // ---------- Mesaje ----------
  var msgTimer = 0;
  function clearMsgs() { clearTimeout(msgTimer); $$('.banner, .toast', stage).forEach(function (x) { x.parentNode.removeChild(x); }); }
  function banner(text, ms) {
    clearMsgs();
    var b = document.createElement('div');
    b.className = 'banner'; b.setAttribute('role', 'alert');
    b.innerHTML = icon('alert') + '<span>' + esc(text) + '</span><button class="x" type="button" aria-label="Închide mesajul">' + icon('close') + '</button>';
    stage.appendChild(b);
    $('.x', b).addEventListener('click', clearMsgs);
    msgTimer = setTimeout(clearMsgs, ms || 7000);
    return b;
  }
  function toast(text) {
    clearMsgs();
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = icon('check') + '<span>' + esc(text) + '</span>';
    stage.appendChild(t);
    msgTimer = setTimeout(clearMsgs, 3200);
  }

  // ---------- Cuprinsul: capitole, miniaturi, resurse ----------
  function chapters() {
    var list = [];
    SLIDES.forEach(function (s) {
      var c = list[list.length - 1];
      if (!c || c.name !== s.chap) { list.push({ name: s.chap, items: [s] }); } else { c.items.push(s); }
    });
    return list;
  }
  // miniaturile: o singură imagine (media/thumbs.jpg), 6 coloane × 6 rânduri
  function thumbPos(n) {
    var k = n - 1, cols = 6, rows = Math.ceil(ORDER.length / cols);
    return (100 * (k % cols) / (cols - 1)).toFixed(3) + '% ' + (100 * Math.floor(k / cols) / (rows - 1)).toFixed(3) + '%';
  }
  function openMenu() {
    var chs = chapters(), seen = ORDER.filter(function (id) { return S.visited[id]; }).length;
    var curChap = current ? current.chap : chs[0].name;
    var html = '<div class="menu"><div class="menu-side"><h2>Cuprins</h2>' +
      '<p class="menu-prog"><b>' + seen + '</b> din ' + ORDER.length + ' slide-uri văzute' + (S.completed ? ' · atelier încheiat' : '') + '</p>' +
      '<div class="menu-bar" aria-hidden="true"><i style="width:' + Math.round(100 * seen / ORDER.length) + '%"></i></div>' +
      '<ul class="menu-chaps">' + chs.map(function (c, i) {
        var done = c.items.filter(function (s) { return S.visited[s.id]; }).length;
        return '<li><button class="menu-chap" type="button" data-chap="' + i + '"' + (c.name === curChap ? ' aria-current="true"' : '') + '><span>' + esc(c.name) + '</span><small>' + done + ' / ' + c.items.length + '</small></button></li>';
      }).join('') + '</ul>' +
      '<div class="menu-res"><h3>RESURSE</h3><ul>' +
      '<li><button class="menu-link" type="button" data-res="reteta">' + icon('recipe') + 'Rețeta clipului-exemplu</button></li>' +
      (CFG.media.kit ? '<li><a class="menu-link" href="' + esc(CFG.media.kit) + '" download data-res="kit">' + icon('box') + 'Kitul clipului-exemplu (ZIP)</a></li>' : '') +
      '<li><button class="menu-link" type="button" data-res="plan">' + icon('pen') + 'Planul meu</button></li>' +
      '<li><button class="menu-link" type="button" data-res="despre">' + icon('info') + 'Despre atelier</button></li>' +
      '</ul></div>' +
      '<div class="menu-foot"><button class="btn btn--small menu-reset" type="button" id="mReset">' + (lms ? 'Începe de la zero' : 'Șterge progresul de pe acest dispozitiv') + '</button>' +
      '<p class="m-small">' + (lms ? 'Progresul se salvează în platforma de curs.' : 'Fără platformă de curs, progresul și răspunsurile rămân doar în acest browser.') +
      ' Tastele ← și → schimbă slide-ul.</p></div></div>' +
      '<div class="menu-main" id="mMain"></div></div>';
    var m = openModal({ html: html, label: 'Cuprins', cls: 'modal-menu' });
    var main = $('#mMain', m.el);
    function showChap(i) {
      var c = chs[i];
      $$('.menu-chap', m.el).forEach(function (b) { b.setAttribute('aria-current', String(Number(b.getAttribute('data-chap')) === i)); });
      main.innerHTML = '<h3>' + esc(c.name) + '</h3><ul class="menu-grid">' + c.items.map(function (s) {
        var cur = current && current.id === s.id;
        return '<li><button class="menu-card" type="button" data-go="' + s.id + '"' + (cur ? ' aria-current="true"' : '') + '>' +
          '<span class="menu-thumb" style="background-position:' + thumbPos(s.n) + '" aria-hidden="true">' + (S.visited[s.id] ? '<span class="menu-seen">' + icon('check') + '</span>' : '') + '</span>' +
          '<span class="menu-cap"><b>' + esc(s.id) + '</b> <span>' + esc(s.title) + '</span>' + (S.visited[s.id] ? '<span class="sr-only">, văzut</span>' : '') + '</span></button></li>';
      }).join('') + '</ul>';
      $$('[data-go]', main).forEach(function (b) {
        b.addEventListener('click', function () { m.close(true); go(b.getAttribute('data-go')); });
      });
    }
    $$('.menu-chap', m.el).forEach(function (b) { b.addEventListener('click', function () { showChap(Number(b.getAttribute('data-chap'))); }); });
    showChap(Math.max(0, chs.map(function (c) { return c.name; }).indexOf(curChap)));
    $$('[data-res]', m.el).forEach(function (b) {
      var r = b.getAttribute('data-res');
      if (r === 'kit') { return; }
      b.addEventListener('click', function () { ({ reteta: openRecipe, plan: openMine, despre: openAbout })[r](); });
    });
    $('#mReset', m.el).addEventListener('click', function () { confirmReset(); });
  }
  function confirmReset() {
    var c = openModal({
      label: 'Ștergi progresul?', cls: 'modal-confirm',
      html: '<h2 class="m-h">Ștergi progresul?</h2><p class="m-lead">Slide-urile văzute, cuvântul tău, planul și bifele dispar' + (lms ? ' din această încercare' : ' de pe acest dispozitiv') + '.</p>' +
        '<div class="btn-row"><button class="btn btn--small" type="button" data-x="plan-download">' + icon('download') + 'Descarcă întâi planul</button>' +
        '<button class="btn btn--lime btn--small" type="button" id="cYes">Șterge și începe de la zero</button><button class="btn btn--link btn--small" type="button" data-close>Renunță</button></div>'
    });
    wireExports(c.el);
    $('#cYes', c.el).addEventListener('click', function () {
      resetVars(); S.visited = {}; S.seen = {}; S.history = []; S.completed = false; S.loc = ORDER[0];
      if (!lms) { try { localStorage.removeItem(CFG.storageKey); } catch (e) { /* ignoră */ } }
      saveNow(true);
      closeModals(true); go(ORDER[0]);
    });
  }

  // ---------- Resurse: rețeta clipului, planul meu, despre ----------
  function openRecipe() {
    var rows = [
      ['V1 · Fundal', 'fundal 1 (soarele) · fundal 2 (lime) · fundal 1', [[0, 7], [7, 8.5, 'var(--lime)'], [8.5, 15]], 'Split la 7 s și la 8,5 s: bucata din mijloc devine fondul lime (o „bătaie” de ritm).', '#9C9C94'],
      ['V2 · A', 'casa (decupaj)', [[0, 15]], 'Position: 0 s în afara cadrului (X −840) → 1,5 s în centru (X 0). Scale: 1,5 s 100% → 3 s 120%. 10 s → 12 s: revine la 100% și coboară puțin.', 'var(--lime)'],
      ['V3 · B', 'pasărea (decupaj)', [[3, 15]], 'Scale: 3 s 40% → 5 s 100%. 10 s → 12 s: coboară puțin.', 'var(--lime)'],
      ['V4 · C', 'banda de hârtie (decupaj)', [[6, 15]], 'Rotate: 6 s −15° → 7 s 0°.', 'var(--lime)'],
      ['T1 · Text', '„ZBOARĂ.”', [[12, 15]], 'Fără keyframes. Între 14 și 15 s nimic nu se mișcă (pauza).', 'var(--coral)'],
      ['A1 · Sunet', 'sunet (opțional)', [[0, 15]], 'Fade out în ultima secundă (opțional). Licența: obligatorie. Clipul-exemplu nu are sunet.', 'var(--blue)']
    ];
    var html = '<h2 class="m-h">Rețeta clipului-exemplu</h2><p class="m-lead">Aceleași valori ca pe slide-urile editorului și în clipul de pe 1.30. Sunt ale exemplului, nu reguli: 0–3 s cârligul, 3–10 s remixul, 10–15 s dezvăluirea, cu o secundă de pauză la final.</p>' +
      '<table class="rec"><thead><tr><th scope="col">PISTA</th><th scope="col">CE PUI</th><th scope="col">CÂND (0–15 S)</th><th scope="col">KEYFRAMES ȘI VALORI</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var bars = r[2].map(function (b) { return '<i style="left:' + (100 * b[0] / 15).toFixed(2) + '%;width:' + (100 * (b[1] - b[0]) / 15).toFixed(2) + '%;background:' + (b[2] || r[4]) + '"></i>'; }).join('');
        var when = r[2].map(function (b) { return String(b[0]).replace('.', ',') + '–' + String(b[1]).replace('.', ',') + ' s'; }).join(' · ');
        return '<tr><td><span class="trk" style="background:' + r[4] + (r[4] === 'var(--blue)' ? ';color:#FFFFFF' : '') + '">' + esc(r[0]) + '</span></td><td>' + esc(r[1]) + '</td>' +
          '<td><div class="rec-bar" role="img" aria-label="' + esc(when) + '">' + bars + '</div><span class="m-small">' + esc(when) + '</span></td><td>' + esc(r[3]) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="btn-row" style="margin-top:28px">' + (CFG.media.kit ? '<a class="btn btn--lime btn--small" href="' + esc(CFG.media.kit) + '" download>' + icon('download') + 'Descarcă kitul (fundaluri și decupaje)</a>' : '') +
      '<p class="m-small">Numele din editor pot varia după versiune (exemplele: CapCut).</p></div>';
    openModal({ html: html, label: 'Rețeta clipului-exemplu', cls: 'modal-recipe' });
  }
  var PLAN = [
    ['Ideea clipului (1.16 · într-un cuvânt)', 'tCuvant'],
    ['Ce emoție aleg?', 'tPlan_Emotie'], ['Care este primul meu cadru?', 'tPlan_Primul'],
    ['Care va fi ultimul?', 'tPlan_Ultimul'], ['Ce element se va mișca?', 'tPlan_Element']
  ];
  var CHECKS = ['Văd o idee sau un slideshow?', 'Se mișcă straturile independent?', 'Sunetul are dinamică? Un intro, un punct culminant, un final?', 'Durata e de maximum 15 secunde?'];
  function openMine() {
    var html = '<div class="mine"><h2 class="m-h">Planul meu</h2>' + PLAN.map(function (p) {
      var v = String(V[p[1]] || '');
      return '<section class="mine-q"><h3>' + esc(p[0].toUpperCase()) + '</h3><p>' + (v ? esc(v) : '<span class="gol">încă necompletat</span>') + '</p></section>';
    }).join('') +
      '<section class="mine-q"><h3>VERIFICAREA CLIPULUI (1.30)</h3><p>' + CHECKS.map(function (q, i) { return (V['bVerif' + (i + 1)] ? '✓ ' : '○ ') + esc(q); }).join('<br>') + '</p></section>' +
      '<div class="btn-row"><button class="btn btn--lime btn--small" type="button" data-x="plan-download">' + icon('download') + 'Descarcă (.doc)</button>' +
      (canPrint() ? '<button class="btn btn--small" type="button" data-x="plan-print">' + icon('print') + 'Printează</button>' : '') +
      '<button class="btn btn--small" type="button" id="mGo31">' + icon('pen') + 'Completează pe 1.31</button></div></div>';
    var m = openModal({ html: html, label: 'Planul meu', cls: 'modal-mine' });
    wireExports(m.el);
    $('#mGo31', m.el).addEventListener('click', function () { closeModals(true); go('1.31'); });
  }
  function openAbout() {
    var html = '<h2 class="m-h">Despre atelier</h2><div class="about"><div>' +
      '<div class="logos"><img src="media/brand/is89-manifest.png" alt="Imagine Sunet ’89 · Manifest" width="230">' +
      '<img src="media/brand/finantat-cp.png" alt="Finanțat de Municipiul Timișoara prin Centrul de Proiecte" width="380"></div>' +
      '<div class="logos"><img src="media/brand/tehnoarte.svg" alt="Tehnoarte" width="260"><a href="https://www.tehnoarte.com" target="_blank" rel="noopener">www.tehnoarte.com</a></div></div>' +
      '<div><h3>' + esc(CFG.credits.made) + '</h3>' + CFG.credits.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
      '<p>Versiunea ' + esc(CFG.version) + ' · SCORM 2004 3rd Edition</p></div></div>';
    openModal({ html: html, label: 'Despre atelier', cls: 'modal-about' });
  }

  // ---------- Planul ca document (.doc) sau printat ----------
  function docHtml() {
    var rows = PLAN.map(function (p) {
      var v = String(V[p[1]] || '');
      return '<p class="q">' + esc(p[0]) + '</p><p class="a">' + (v ? esc(v) : '<i class="gol">(necompletat)</i>') + '</p>';
    }).join('');
    var chk = CHECKS.map(function (q, i) { return '<p class="a">' + (V['bVerif' + (i + 1)] ? '☑ ' : '☐ ') + esc(q) + '</p>'; }).join('');
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>CUT. PASTE. PLAY. · Planul meu</title>' +
      '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->' +
      '<style>body{font-family:Arial,sans-serif;max-width:40em;margin:2em auto;line-height:1.45;color:#181918}h1{font-size:22pt;margin:0 0 .2em}h2{font-size:14pt;margin:1.6em 0 .4em}' +
      '.q{font-weight:bold;margin:1em 0 .2em}.a{margin:0 0 .3em}.gol{color:#66665F}.meta{color:#66665F;font-size:10pt}</style></head>' +
      '<body><h1>CUT. PASTE. PLAY.</h1><p class="meta">Planul meu pentru clipul-colaj de 15 secunde · ' + new Date().toLocaleDateString('ro-RO') + '</p>' +
      '<h2>Planul</h2>' + rows + '<h2>Verificarea clipului</h2>' + chk + '</body></html>';
  }
  var inViewer = !!(window.claude && typeof window.claude.use === 'function');
  var viewerDownloads = null;
  if (inViewer) { window.claude.use('downloads').then(function (d) { viewerDownloads = d; }).catch(function () { viewerDownloads = null; }); }
  function canPrint() { return !inViewer; }
  function localDate() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function exportDoc(mode) {
    var html = docHtml(), name = 'Planul_meu_CutPastePlay_' + localDate() + '.doc';
    if (mode === 'plan-download') {
      if (viewerDownloads) {
        viewerDownloads.save({ filename: name, data: '﻿' + html }).then(function () { toast('Descărcat: ' + name); })
          .catch(function (e) { banner(e && e.code === 'declined' ? 'Descărcarea a fost anulată.' : 'Descărcarea nu a pornit. Încearcă din nou.'); });
        return;
      }
      var blob = new Blob(['﻿', html], { type: 'application/msword' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 2000);
      toast('Descărcat: ' + name);
    } else {
      var f = document.createElement('iframe');
      f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;width:0;height:0;border:0;left:-9999px';
      document.body.appendChild(f);
      f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
      setTimeout(function () {
        try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { banner('Printarea nu a pornit. Descarcă fișierul și printează-l din Word.'); }
        setTimeout(function () { if (f.parentNode) { f.parentNode.removeChild(f); } }, 4000);
      }, 350);
    }
  }
  function wireExports(root) {
    $$('[data-x]', root).forEach(function (b) { b.addEventListener('click', function () { exportDoc(b.getAttribute('data-x')); }); });
  }

  // ---------- Finalizare și ieșire ----------
  function complete() {
    if (!S.completed) {
      S.completed = true;
      if (lms) { SCORM.set('cmi.completion_status', 'completed'); }
    }
    saveNow(true);
  }
  var ended = false;
  function endSession() {
    if (ended) { return; }
    ended = true; saveNow(true);
    if (lms) { SCORM.finish('suspend'); }
  }
  // „Încheie” (1.33): Complete course, apoi Exit course (ca în Storyline)
  function finish() {
    complete();
    VO.stop();
    if (lms && !ended) { SCORM.set('adl.nav.request', 'suspendAll'); }
    endSession();
    var e = document.createElement('div');
    e.className = 'end'; e.setAttribute('role', 'dialog'); e.setAttribute('aria-modal', 'true'); e.setAttribute('aria-label', 'Atelierul s-a încheiat');
    e.innerHTML = '<div class="end-card"><img src="media/brand/is89-manifest.png" alt="Imagine Sunet ’89 · Manifest" width="420">' +
      '<div><h2 tabindex="-1">Atelierul s-a încheiat.</h2><p class="m-lead">Don’t just edit. Re-mix. Ne vedem la atelier, cu decupajele tale.' + (lms ? ' Poți închide această fereastră.' : '') + '</p>' +
      '<div class="end-logos"><img src="media/brand/finantat-cp.png" alt="Finanțat de Municipiul Timișoara prin Centrul de Proiecte" width="400"><img src="media/brand/tehnoarte.svg" alt="Tehnoarte" width="230"></div>' +
      '<p class="end-made">' + esc(CFG.credits.made) + '</p><p class="m-small">CUT. PASTE. PLAY. · versiunea ' + esc(CFG.version) + '</p>' +
      (lms ? '' : '<div class="btn-row" style="margin-top:30px"><button class="btn btn--small" type="button" id="eBack">' + icon('replay') + 'Înapoi în atelier</button></div>') + '</div></div>';
    stage.appendChild(e);
    slideEl.inert = true; snavEl.inert = true;
    var h = $('h2', e); try { h.focus({ preventScroll: true }); } catch (err) { h.focus(); }
    var back = $('#eBack', e);
    if (back) { back.addEventListener('click', function () { e.parentNode.removeChild(e); slideEl.inert = false; snavEl.inert = false; ended = false; go(ORDER[ORDER.length - 1], { back: true }); }); }
    try { if (lms && window.top === window) { window.close(); } } catch (err) { /* ignoră */ }
  }

  // ---------- Pornire: logo animat, reluare, primul slide ----------
  function startCourse() {
    var saved = '';
    lms = SCORM.init(function () { /* jurnalul SCORM e tăcut în cursul real */ });
    if (lms) {
      saved = SCORM.get('cmi.suspend_data');
      var st = SCORM.get('cmi.completion_status');
      if (st !== 'completed') { SCORM.set('cmi.completion_status', 'incomplete'); }
      if (st === 'completed') { S.completed = true; }
    } else {
      try { saved = localStorage.getItem(CFG.storageKey) || ''; } catch (e) { saved = ''; }
    }
    var resumed = saved ? restore(saved) : false;
    var loc = S.loc;
    playIntro(function () {
      if (resumed && loc && loc !== ORDER[0] && SL[loc]) { go(ORDER[0]); askResume(loc); }
      else { go(ORDER[0]); }
    });
  }
  function askResume(loc) {
    var s = SL[loc];
    var m = openModal({
      label: 'Continui de unde ai rămas?', cls: 'modal-confirm', scrimClose: false,
      html: '<h2 class="m-h">Continui de unde ai rămas?</h2><p class="m-lead">Ultimul slide: ' + esc(s.id + ' · ' + s.title) + '. Răspunsurile tale sunt păstrate.</p>' +
        '<div class="btn-row"><button class="btn btn--lime" type="button" id="rYes">Continuă</button><button class="btn" type="button" id="rNo">De la început</button></div>',
      focus: '#rYes'
    });
    $('#rYes', m.el).addEventListener('click', function () { m.close(true); go(loc); });
    $('#rNo', m.el).addEventListener('click', function () { m.close(); });
  }
  function playIntro(done) {
    var box = $('#intro'), v = $('#introVideo'), finished = false;
    app.classList.add('is-intro');
    var finish = function () {
      if (finished) { return; } finished = true;
      app.classList.remove('is-intro');
      box.classList.add('is-out');
      setTimeout(function () { box.hidden = true; try { v.pause(); } catch (e) { /* ignoră */ } }, 650);
      done();
    };
    $('#skipIntro').addEventListener('click', finish);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      v.addEventListener('loadeddata', function () { try { v.currentTime = 5.5; } catch (e) { /* ignoră */ } });
      setTimeout(finish, 2600); return;
    }
    v.addEventListener('ended', function () { setTimeout(finish, 350); });
    v.addEventListener('error', function () { setTimeout(finish, 1200); });
    var p = v.play();
    if (p && p.catch) { p.catch(function () { setTimeout(finish, 1800); }); }
    setTimeout(finish, 9000); // plasă de siguranță
  }

  // ---------- API pentru extras.js ----------
  window.P = {
    V: V, S: S, CFG: CFG, icon: icon, esc: esc, setVar: setVar, go: go, next: next, prev: prev, $: $, $$: $$,
    banner: banner, toast: toast, clearMsgs: clearMsgs, openModal: openModal, closeModals: closeModals, VO: VO,
    reveal: reveal, saveNow: saveNow, exportDoc: exportDoc, wireExports: wireExports, canPrint: canPrint,
    current: function () { return current; }, isLms: function () { return lms; }
  };

  document.addEventListener('DOMContentLoaded', function () {
    app = $('#app'); stage = $('#stage'); slideEl = $('#slide'); ccEl = $('#cc'); barEl = $('#bar'); liveEl = $('#live');
    chromeEl = $('#chrome'); snavEl = $('#snav');
    SLIDES.forEach(function (s) { SL[s.id] = s; });
    fit(); window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', function () { setTimeout(fit, 250); });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) { document.addEventListener(ev, function () { fit(); ui(); }); });
    $('#rotOk').addEventListener('click', function () { S.seen.rotOk = 1; fit(); });
    buildChrome(); buildBar(); caption('');
    // ← și → schimbă slide-ul (nu când scrii într-un câmp și nu când e deschisă o fereastră)
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || modals.length || app.classList.contains('is-intro')) { return; }
      var t = e.target, typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      if (typing || $('.end', stage)) { return; }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    });
    window.addEventListener('pagehide', endSession);
    window.addEventListener('beforeunload', endSession);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { saveNow(true); } });
    startCourse();
  });
})();
