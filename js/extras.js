/* CUT. PASTE. PLAY. · ce adaugă varianta HTML peste slide-urile din PowerPoint:
   1.2 cele 10 secunde · 1.5–1.7 lucrările (sau linkul spre muzeu) · 1.8 cele trei unelte, cu piesele kitului ·
   1.9 atelierul rapid · 1.12 mișcările · 1.13 cele 15 secunde în timp real · 1.14 aceleași imagini, trei sunete ·
   1.16 răspunsul într-un cuvânt · 1.21–1.28 schema mărită · 1.30 clipul și verificarea · 1.31 planul tău.
   Fiecare intrare: init(slide, primaVizită) și, opțional, leave() când pleci de pe slide. */
window.CPP_EXTRAS = (function () {
  'use strict';
  var P = function () { return window.P; };
  function o(root, name) { return root.querySelector('[data-o="' + name + '"]'); }
  function add(root, html) { var t = document.createElement('div'); t.innerHTML = html; var el = t.firstElementChild; root.appendChild(el); return el; }
  function cueOf(el) { return el ? el.getAttribute('data-cue') : null; }
  // un element nou intră odată cu un obiect din PowerPoint (același moment din voce)
  function sameCue(el, ref, fx, delay) {
    var c = cueOf(ref);
    if (c != null) { el.setAttribute('data-cue', c); el.setAttribute('data-fx', fx || 'fade'); el.style.setProperty('--d', (delay || 0) + 'ms'); el.style.setProperty('--t', '500ms'); }
    return el;
  }
  function onCue(root, fn) { root.addEventListener('cpp:cue', function (e) { fn(e.detail); }); }
  var KIT = 'media/kit/';

  // ---------- 1.2 · privește 10 secunde ----------
  var ten = {
    init: function (r) {
      var bar = add(r, '<div class="ten" aria-hidden="true"><i></i></div>');
      onCue(r, function (k) { if (k >= 1 && !bar.classList.contains('is-run')) { void bar.offsetWidth; bar.classList.add('is-run'); } });
    }
  };

  // ---------- 1.5–1.7 · lucrările (protejate de drepturi de autor) ----------
  function artwork(id, imgName, legend) {
    return {
      init: function (r) {
        var C = P().CFG;
        if (C.arataLucrarile !== false) { return; }
        var w = C.lucrari[id], img = o(r, imgName);
        if (!w || !img) { return; }
        var st = img.getAttribute('style');
        var card = add(r, '<div class="o work-card" style="' + st + '"><div><span class="chip">LUCRAREA</span>' +
          '<p class="wc-a">' + P().esc(w.autor) + '</p><p class="wc-t">' + P().esc(w.titlu) + ' · ' + P().esc(w.an) + '</p>' +
          '<p class="wc-m">' + P().esc(w.muzeu) + '</p><a class="btn btn--lime btn--small" href="' + P().esc(w.url) + '" target="_blank" rel="noopener">' +
          'Vezi lucrarea pe site-ul muzeului' + P().icon('ext') + '<span class="sr-only"> (se deschide într-o filă nouă)</span></a></div></div>');
        sameCue(card, img, 'fade', 0);
        img.parentNode.removeChild(img);
        var lg = o(r, legend); if (lg) { lg.style.display = 'none'; }
      }
    };
  }

  // ---------- 1.8 · cele trei unelte ----------
  var tools = {
    init: function (r) {
      var c1 = r.querySelector('.art--contrast'), c2 = r.querySelector('.art--straturi'), c3 = r.querySelector('.art--asociere');
      if (c1) { c1.innerHTML = '<img class="bird" src="' + KIT + 'pasare.png" alt=""><span class="ground"></span><img class="house" src="' + KIT + 'casa.png" alt="">'; }
      if (c2) {
        c2.innerHTML = '<div class="lay l1"></div><div class="lay l2"><img src="' + KIT + 'banda.png" alt=""></div><div class="lay l3"><img src="' + KIT + 'casa.png" alt=""></div>' +
          '<span class="art-tag t1" aria-hidden="true">SPATE</span><span class="art-tag t2" aria-hidden="true">MIJLOC</span><span class="art-tag t3" aria-hidden="true">FAȚĂ</span>';
      }
      if (c3) { c3.innerHTML = '<span class="art-sun sun"></span><img class="house" src="' + KIT + 'casa.png" alt=""><img class="bird" src="' + KIT + 'pasare.png" alt=""><img class="word" src="' + KIT + 'zboara.png" alt="">'; }
    }
  };

  // ---------- 1.9 · atelierul rapid: trei sensuri în 60 de secunde ----------
  var studioTimer = 0;
  var exercise = {
    init: function (r) {
      var b = add(r, '<button class="btn btn--ink try-btn" type="button" data-ctl>' + P().icon('timer') + 'Încearcă aici: 60 de secunde</button>');
      sameCue(b, o(r, 'txt_Pas3'), 'zoom', 500);
      b.addEventListener('click', openStudio);
    },
    leave: function () { clearInterval(studioTimer); }
  };
  function openStudio() {
    var p = P(), V = p.V;
    var html = '<h2 class="m-h">Trei sensuri în 60 de secunde</h2><div class="studio">' +
      '<div class="st-frame" id="stFrame" role="img" aria-label=""><img class="st-el st-house" src="' + KIT + 'casa.png" alt=""><img class="st-el st-bird" src="' + KIT + 'pasare.png" alt=""></div>' +
      '<div class="st-side"><ol class="st-steps">' +
      '<li><span class="num" aria-hidden="true">01</span><span>Două elemente: casa și pasărea.</span></li>' +
      '<li><span class="num" aria-hidden="true">02</span><button class="btn btn--small" type="button" id="stOrder">Schimbă ordinea</button><span class="m-small">cine e în față?</span></li>' +
      '<li><span class="num" aria-hidden="true">03</span><button class="btn btn--small" type="button" id="stSize">Schimbă dimensiunea</button><span class="m-small">cine e mare?</span></li>' +
      '<li><span class="num" aria-hidden="true">04</span><button class="btn btn--small" type="button" id="stBg">Schimbă fundalul</button></li></ol>' +
      '<p class="m-lead" style="margin:0 0 6px">De fiecare dată, imaginea spune altceva. Ce spune acum?</p>' +
      '<div class="st-timer"><div class="st-clock" aria-hidden="true"><svg viewBox="0 0 128 128"><circle class="bg" cx="64" cy="64" r="56"/><circle class="fg" id="stArc" cx="64" cy="64" r="56" stroke-dasharray="351.86" stroke-dashoffset="0"/></svg><b id="stSec">60</b></div>' +
      '<div><button class="btn btn--lime" type="button" id="stGo">' + p.icon('timer') + 'Pornește cele 60 de secunde</button><p class="m-small" id="stTimeTxt" aria-live="polite"></p></div></div>' +
      '<div class="st-count"><button class="btn btn--small btn--ink" type="button" id="stPlus">+ Am găsit un sens</button><span class="st-dots" aria-hidden="true"><i></i><i></i><i></i></span><span id="stN" aria-live="polite"></span></div>' +
      '</div></div><p class="sr-only" id="stLive" aria-live="polite"></p>';
    var m = p.openModal({ html: html, label: 'Trei sensuri în 60 de secunde', cls: 'modal-studio', onClose: function () { clearInterval(studioTimer); } });
    var f = m.el.querySelector('#stFrame'), live = m.el.querySelector('#stLive');
    var st = { swap: false, big: false, lime: false };
    function describe() {
      var front = st.swap ? 'casa' : 'pasărea', big = st.big ? 'casa e mare, pasărea e mică' : 'pasărea e mare, casa e mică';
      var d = 'Cadrul tău: ' + front + ' e în față; ' + big + '; fundal ' + (st.lime ? 'lime' : 'cu soare') + '.';
      f.setAttribute('aria-label', d); return d;
    }
    function apply(msg) { f.classList.toggle('is-swap', st.swap); f.classList.toggle('is-big-house', st.big); f.classList.toggle('is-lime', st.lime); var d = describe(); if (msg) { live.textContent = d; } }
    apply(false);
    m.el.querySelector('#stOrder').addEventListener('click', function () { st.swap = !st.swap; apply(true); });
    m.el.querySelector('#stSize').addEventListener('click', function () { st.big = !st.big; apply(true); });
    m.el.querySelector('#stBg').addEventListener('click', function () { st.lime = !st.lime; apply(true); });
    function dots() {
      var n = Number(V.nSensuri) || 0;
      Array.prototype.forEach.call(m.el.querySelectorAll('.st-dots i'), function (d, i) { d.classList.toggle('is-on', i < n); });
      m.el.querySelector('#stN').textContent = n === 0 ? 'Niciun sens încă' : n === 1 ? 'Un sens' : n + ' sensuri' + (n >= 3 ? ': ai reușit!' : '');
    }
    dots();
    m.el.querySelector('#stPlus').addEventListener('click', function () { p.setVar('nSensuri', Math.min(9, (Number(V.nSensuri) || 0) + 1)); dots(); });
    var arc = m.el.querySelector('#stArc'), sec = m.el.querySelector('#stSec'), txt = m.el.querySelector('#stTimeTxt'), go = m.el.querySelector('#stGo');
    go.addEventListener('click', function () {
      clearInterval(studioTimer);
      var t0 = Date.now(), L = 351.86;
      p.setVar('nSensuri', 0); dots();
      go.disabled = true; txt.textContent = 'Cronometrul a pornit: 60 de secunde.';
      studioTimer = setInterval(function () {
        var left = Math.max(0, 60 - (Date.now() - t0) / 1000);
        sec.textContent = Math.ceil(left); arc.setAttribute('stroke-dashoffset', String(L * (1 - left / 60)));
        if (left === 15) { txt.textContent = 'Mai ai 15 secunde.'; }
        if (left <= 0) { clearInterval(studioTimer); go.disabled = false; txt.textContent = 'Timpul a trecut. Câte sensuri ai găsit?'; }
      }, 200);
    });
  }

  // ---------- 1.12 · iconițele își fac mișcarea ----------
  var moves = {
    init: function (r) {
      [['shp_Card1', ['shp_IconIntrare'], 1], ['shp_Card2', ['shp_IconZoom'], 2], ['shp_Card3', ['shp_IconRotatie'], 3], ['shp_Card4', ['shp_IconCadru1', 'shp_IconCadru2'], 4]]
        .forEach(function (x) {
          var card = o(r, x[0]); if (!card) { return; }
          card.classList.add('mv-card');
          card.addEventListener('mouseenter', function () {
            x[1].forEach(function (n) { var ic = o(r, n); if (!ic || ic.classList.contains('cue-wait')) { return; } ic.classList.add('mv-ico'); ic.classList.remove('is-mv' + x[2]); void ic.offsetWidth; ic.classList.add('is-mv' + x[2]); });
          });
        });
      r.addEventListener('animationend', function (e) { if (/^mv-/.test(e.animationName)) { e.target.classList.remove('is-mv1', 'is-mv2', 'is-mv3', 'is-mv4'); } });
    }
  };

  // ---------- 1.13 · cele 15 secunde, în timp real, cu clipul-exemplu ----------
  var runRaf = 0, runVid = null;
  var fifteen = {
    init: function (r) {
      var p = P();
      var b = add(r, '<button class="btn btn--lime run-btn" type="button" data-ctl>' + p.icon('play') + 'Simte cele 15 secunde, pe clipul-exemplu</button>');
      sameCue(b, o(r, 'txt_Ritm'), 'zoom', 700);
      var head = add(r, '<div class="run-head" aria-hidden="true"></div>');
      var time = add(r, '<p class="run-time" aria-live="off"></p>');
      sameCue(time, o(r, 'txt_Ritm'), 'fade', 700);
      var vbox = add(r, '<div class="o run-vid" aria-hidden="true" style="left:1556px;top:588px;width:180px;height:320px;z-index:30;display:none"><video muted playsinline preload="none" src="' + p.CFG.media.clip + '" poster="' + p.CFG.media.clipPoster + '"></video></div>');
      var vid = vbox.querySelector('video'); runVid = vid;
      var segs = ['shp_Segment1', 'shp_Segment2', 'shp_Segment3'].map(function (n) { return o(r, n); });
      function xAt(t) {
        var P0 = [[0, 96], [3, 438.6], [10, 1245], [15, 1824]];
        for (var i = 1; i < P0.length; i++) { if (t <= P0[i][0]) { var a = P0[i - 1], z = P0[i]; return a[1] + (z[1] - a[1]) * (t - a[0]) / (z[0] - a[0]); } }
        return 1824;
      }
      function stop(done) {
        cancelAnimationFrame(runRaf);
        segs.forEach(function (s) { if (s) { s.classList.remove('seg-dim', 'seg-on'); } });
        if (!done) { head.classList.remove('is-on'); vbox.style.display = 'none'; time.textContent = ''; }
        b.disabled = false;
      }
      b.addEventListener('click', function () {
        p.VO.pause();
        b.disabled = true;
        head.classList.add('is-on'); vbox.style.display = 'block';
        var t0 = performance.now(), useVid = true;
        try { vid.currentTime = 0; var pr = vid.play(); if (pr && pr.catch) { pr.catch(function () { useVid = false; }); } } catch (e) { useVid = false; }
        (function loop() {
          var t = useVid && !vid.paused && vid.currentTime > 0 ? vid.currentTime : (performance.now() - t0) / 1000;
          t = Math.min(15, t);
          head.style.left = (xAt(t) - 2) + 'px';
          var k = t < 3 ? 0 : t < 10 ? 1 : 2;
          segs.forEach(function (s, i) { if (s) { s.classList.toggle('seg-on', i === k); s.classList.toggle('seg-dim', i !== k); } });
          time.textContent = t.toFixed(1).replace('.', ',') + ' s · ' + ['HOOK', 'REMIX', 'REVEAL'][k];
          if (t >= 15) { time.textContent = '15 s · STOP'; var rt = o(r, 'txt_Ritm'); if (rt) { rt.classList.remove('ritm-hot'); void rt.offsetWidth; rt.classList.add('ritm-hot'); } stop(true); return; }
          runRaf = requestAnimationFrame(loop);
        })();
      });
    },
    leave: function () { cancelAnimationFrame(runRaf); if (runVid) { try { runVid.pause(); } catch (e) { /* ignoră */ } } }
  };

  // ---------- 1.14 · aceleași imagini, trei sunete (sunet generat în browser, fără fișiere) ----------
  var Lab = (function () {
    var ctx = null, master, an, noise, timer = 0, nodes = [], mode = 0, next = 0, step = 0;
    function ensure() {
      if (ctx) { return true; }
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { return false; }
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; an = ctx.createAnalyser(); an.fftSize = 64;
      master.connect(an); an.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noise.getChannelData(0); for (var i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
      return true;
    }
    function keep(n) { nodes.push(n); return n; }
    function env(g, t, a, peak, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + rel); }
    function kick(t) { var o1 = keep(ctx.createOscillator()), g = ctx.createGain(); o1.frequency.setValueAtTime(140, t); o1.frequency.exponentialRampToValueAtTime(42, t + .14); env(g, t, .004, .95, .3); o1.connect(g); g.connect(master); o1.start(t); o1.stop(t + .36); }
    function hat(t, v) { var s = keep(ctx.createBufferSource()), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7500; env(g, t, .002, v, .05); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + .08); }
    function clap(t) { var s = keep(ctx.createBufferSource()), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = .8; env(g, t, .003, .55, .16); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + .22); }
    function bass(t, hz) { var o1 = keep(ctx.createOscillator()), f = ctx.createBiquadFilter(), g = ctx.createGain(); o1.type = 'sawtooth'; o1.frequency.value = hz; f.type = 'lowpass'; f.frequency.value = 420; env(g, t, .01, .22, .2); o1.connect(f); f.connect(g); g.connect(master); o1.start(t); o1.stop(t + .26); }
    var delay = null;
    function echo() {
      if (delay) { return delay; }
      delay = ctx.createDelay(1.5); delay.delayTime.value = .48; var fb = ctx.createGain(); fb.gain.value = .45; var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(master); return delay;
    }
    function pad(t, freqs, dur) {
      freqs.forEach(function (hz, i) {
        [-4, 4].forEach(function (det) {
          var o1 = keep(ctx.createOscillator()), g = ctx.createGain(); o1.type = i ? 'sine' : 'triangle'; o1.frequency.value = hz; o1.detune.value = det;
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + 1.4); g.gain.setValueAtTime(.05, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o1.connect(g); g.connect(master); g.connect(echo()); o1.start(t); o1.stop(t + dur + .1);
        });
      });
    }
    function bell(t, hz) { var o1 = keep(ctx.createOscillator()), g = ctx.createGain(); o1.type = 'sine'; o1.frequency.value = hz; env(g, t, .01, .16, 2.2); o1.connect(g); g.connect(master); g.connect(echo()); o1.start(t); o1.stop(t + 2.4); }
    var BASS = [55, 55, 65.4, 49], BELLS = [659.3, 523.3, 587.3, 440, 493.9, 392];
    function schedule() {
      var ahead = ctx.currentTime + .12;
      while (next < ahead) {
        if (mode === 1) {         // beat rapid: 128 BPM, optimi
          var s8 = step % 8;
          if (s8 % 2 === 0) { kick(next); }
          hat(next, s8 % 2 ? .22 : .12);
          if (s8 === 2 || s8 === 6) { clap(next); }
          if (s8 === 0 || s8 === 3 || s8 === 6) { bass(next, BASS[Math.floor(step / 8) % 4]); }
          next += 60 / 128 / 2;
        } else if (mode === 2) {  // ambient + ecou: acorduri lente și clopoței
          if (step % 6 === 0) { pad(next, step % 12 === 0 ? [110, 164.8, 196, 246.9] : [87.3, 130.8, 174.6, 220], 6.2); }
          if (step % 2 === 1) { bell(next, BELLS[step % BELLS.length]); }
          next += 1.0;
        } else { next = ahead + 1; }
        step++;
      }
    }
    function start(m) {
      if (!ensure()) { return false; }
      stop(); mode = m; if (!m) { return true; }
      if (ctx.state === 'suspended') { ctx.resume(); }
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(.55, ctx.currentTime);
      next = ctx.currentTime + .05; step = 0; schedule(); timer = setInterval(schedule, 30);
      return true;
    }
    function stop() {
      clearInterval(timer); timer = 0; mode = 0;
      if (!ctx) { return; }
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + .25);
      nodes.forEach(function (n) { try { n.stop(t + .3); } catch (e) { /* oprit deja */ } }); nodes = [];
      if (delay) { var d0 = delay; delay = null; setTimeout(function () { try { d0.disconnect(); } catch (e) { /* ignoră */ } }, 400); }
    }
    function level() { if (!an) { return []; } var a = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(a); return a; }
    return { start: start, stop: stop, level: level };
  })();
  var labRaf = 0;
  var sound = {
    init: function (r) {
      var b = add(r, '<button class="btn btn--ink lab-btn" type="button" data-ctl>' + P().icon('sound') + 'Ascultă diferența, pe clipul-exemplu</button>');
      sameCue(b, o(r, 'txt_Atentie'), 'zoom', 600);
      b.addEventListener('click', openLab);
    },
    leave: function () { Lab.stop(); cancelAnimationFrame(labRaf); }
  };
  function openLab() {
    var p = P();
    var opts = [['0', 'FĂRĂ SUNET', 'mister', '#FFFFFF'], ['1', 'BEAT RAPID', 'energie', 'var(--lime)'], ['2', 'AMBIENT / ECOU', 'nostalgie', '#BDD7EE']];
    var html = '<h2 class="m-h">Aceleași imagini, trei sunete</h2><div class="lab">' +
      '<div class="lab-phone"><video id="labV" muted playsinline preload="auto" src="' + p.CFG.media.clip + '" poster="' + p.CFG.media.clipPoster + '" aria-label="Clipul-exemplu, 15 secunde"></video></div>' +
      '<div><p class="m-lead">Alege un sunet și pornește clipul. Ce simți de fiecare dată?</p><fieldset class="lab-opts"><legend class="sr-only">Sunetul clipului</legend>' +
      opts.map(function (x, i) {
        return '<label class="lab-opt"><input type="radio" name="labS" value="' + x[0] + '"' + (i ? '' : ' checked') + '><span class="lab-sw" style="background:' + x[3] + '" aria-hidden="true">' + p.icon(i ? 'sound' : 'voloff') + '</span>' +
          '<span class="lab-t"><b>' + x[1] + '</b><span>' + x[2] + '</span></span></label>';
      }).join('') + '</fieldset>' +
      '<div class="btn-row"><button class="btn btn--lime" type="button" id="labGo">' + p.icon('play') + 'Pornește clipul</button><div class="lab-meter" aria-hidden="true">' + new Array(16).join('<i></i>') + '</div></div>' +
      '<p class="m-small" style="margin-top:22px">Sunetul e generat de browser pentru exercițiu. În clipul tău: muzică liberă de drepturi sau din biblioteca editorului. Sunetul este opțional, licența lui nu.</p></div></div>';
    var m = p.openModal({ html: html, label: 'Aceleași imagini, trei sunete', cls: 'modal-lab', onClose: function () { Lab.stop(); cancelAnimationFrame(labRaf); } });
    var v = m.el.querySelector('#labV'), go = m.el.querySelector('#labGo'), bars = m.el.querySelectorAll('.lab-meter i');
    function sel() { var c = m.el.querySelector('input[name=labS]:checked'); return c ? Number(c.value) : 0; }
    function meter() {
      var a = Lab.level();
      Array.prototype.forEach.call(bars, function (b, i) { b.style.height = (6 + (a[i + 1] || 0) / 255 * 50) + 'px'; });
      labRaf = requestAnimationFrame(meter);
    }
    function play() {
      try { v.currentTime = 0; } catch (e) { /* ignoră */ }
      var pr = v.play(); if (pr && pr.catch) { pr.catch(function () { /* pornește la al doilea clic */ }); }
      if (!Lab.start(sel())) { p.banner('Browserul acesta nu poate genera sunet.'); }
      cancelAnimationFrame(labRaf); meter();
      go.innerHTML = p.icon('replay') + 'Pornește din nou';
    }
    go.addEventListener('click', play);
    Array.prototype.forEach.call(m.el.querySelectorAll('input[name=labS]'), function (x) {
      x.addEventListener('change', function () { if (!v.paused) { Lab.start(sel()); } });
    });
    v.addEventListener('ended', function () { Lab.stop(); });
    v.addEventListener('pause', function () { Lab.stop(); });
  }

  // ---------- 1.16 · răspunsul într-un cuvânt ----------
  var word = {
    init: function (r) {
      var p = P();
      var w = add(r, '<div class="word" data-ctl><label class="sr-only" for="wIn">Răspunsul tău, într-un cuvânt: ce faci publicul să simtă?</label>' +
        '<input id="wIn" type="text" maxlength="30" autocomplete="off" spellcheck="false" placeholder="un singur cuvânt…">' +
        '<span class="word-ok" aria-live="polite">' + p.icon('check') + '<span>Salvat. Îl regăsești în planul tău (1.31).</span></span></div>');
      sameCue(w, o(r, 'txt_Eticheta'), 'fade', 300);
      var inp = w.querySelector('input'), ok = w.querySelector('.word-ok');
      inp.value = p.V.tCuvant || '';
      ok.classList.toggle('is-on', !!inp.value.trim());
      inp.addEventListener('input', function () { p.setVar('tCuvant', inp.value.trim()); ok.classList.toggle('is-on', !!inp.value.trim()); });
      inp.addEventListener('change', function () { p.saveNow(true); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { inp.blur(); } });
    }
  };

  // ---------- 1.21–1.28 · schema editorului: mărită și legată de panoul lime ----------
  var schema = {
    init: function (r) {
      var p = P(), sch = r.querySelector('.schema');
      if (!sch) { return; }
      var b = add(r, '<button class="schema-zoom" type="button" style="right:520px;top:132px">' + p.icon('zoom') + 'Mărește schema</button>');
      b.addEventListener('click', function () { openSchema(r); });
      sch.addEventListener('click', function () { openSchema(r); });
      for (var k = 1; k <= 4; k++) {
        (function (k) {
          var badge = o(sch, 'shp_InsignaSchema' + k);
          ['txt_PasPanou' + k, 'txt_Insigna' + k].forEach(function (n) {
            var el = o(r, n); if (!el || !badge) { return; }
            el.addEventListener('mouseenter', function () { if (!badge.classList.contains('cue-wait')) { badge.classList.add('is-hot'); } });
            el.addEventListener('mouseleave', function () { badge.classList.remove('is-hot'); });
          });
        })(k);
      }
    }
  };
  function openSchema(r) {
    var p = P(), sch = r.querySelector('.schema'), cur = p.current();
    var k = Math.min(1840 / 1320, 860 / 704);
    var clone = sch.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('[data-cue]'), function (el) { el.classList.remove('cue-wait', 'cue-in', 'is-hot'); });
    var steps = [];
    for (var i = 1; i <= 4; i++) {
      var t = o(r, 'txt_PasPanou' + i); if (!t) { continue; }
      var ps = Array.prototype.map.call(t.querySelectorAll('.p'), function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
      steps.push('<b>' + ('0' + i) + '</b> ' + p.esc(ps[0] || '') + (ps.length > 1 ? ': ' + p.esc(ps.slice(1).join(' ')) : ''));
    }
    var html = '<h2 class="sr-only">' + p.esc(cur.title) + ': schema editorului</h2>' +
      '<div class="schema-big" style="width:' + Math.round(1320 * k) + 'px;height:' + Math.round(704 * k) + 'px"><div style="transform:scale(' + k.toFixed(4) + ');transform-origin:0 0;width:1320px;height:704px;position:relative">' + clone.outerHTML + '</div></div>' +
      '<p class="schema-cap">' + steps.join(' &nbsp;·&nbsp; ') + '</p>';
    p.openModal({ html: html, label: cur.title + ': schema editorului', cls: 'modal-schema', dark: true });
  }

  // ---------- 1.30 · clipul în telefon și cele patru întrebări ----------
  var clipCheck = {
    init: function (r) {
      var p = P(), V = p.V;
      var box = r.querySelector('.phone-video');
      if (box) {
        box.removeAttribute('role'); box.removeAttribute('aria-label');
        box.innerHTML = '<video src="' + p.CFG.media.clip + '" poster="' + p.CFG.media.clipPoster + '" playsinline preload="metadata" aria-label="Clipul-exemplu: 15 secunde, fără sunet, construit după cei șapte pași"></video>' +
          '<button class="pv-play" type="button" aria-label="Pornește clipul-exemplu (15 secunde, fără sunet)"><span>' + p.icon('play') + '</span></button>';
        var v = box.querySelector('video');
        box.querySelector('.pv-play').addEventListener('click', function () {
          box.classList.add('pv-played'); v.controls = true;
          var pr = v.play(); if (pr && pr.catch) { pr.catch(function () { /* ignoră */ }); }
          v.focus();
        });
      }
      var note = add(r, '<p class="chk-note" aria-live="polite"></p>');
      function upd() {
        var n = [1, 2, 3, 4].filter(function (i) { return V['bVerif' + i]; }).length;
        note.textContent = n === 4 ? 'Toate patru. Clipul tău are o idee, straturi, sunet gândit și 15 secunde.' : n ? n + ' din 4 bifate.' : 'Bifează întrebările la care clipul tău răspunde cu „da”.';
        note.classList.toggle('is-on', n === 4);
      }
      for (var i = 1; i <= 4; i++) {
        (function (i) {
          var dot = o(r, 'shp_Punct' + i), txt = o(r, 'txt_Intrebare' + i);
          if (!dot || !txt) { return; }
          var size = (txt.querySelector('.p') || txt).style.fontSize || '32px';
          var lab = add(r, '<label class="chk" style="left:672px;top:' + (parseFloat(txt.style.top) - 3) + 'px;width:1160px">' +
            '<input type="checkbox" data-v="bVerif' + i + '"><span class="chk-box" aria-hidden="true">' + p.icon('check') + '</span>' +
            '<span class="chk-t" style="font-size:' + size + '">' + p.esc(txt.textContent.trim()) + '</span></label>');
          sameCue(lab, txt, 'fade', 0);
          var cb = lab.querySelector('input'); cb.checked = !!V['bVerif' + i];
          cb.addEventListener('change', function () { p.setVar('bVerif' + i, cb.checked); upd(); p.saveNow(true); });
          dot.parentNode.removeChild(dot); txt.parentNode.removeChild(txt);
        })(i);
      }
      var last = r.querySelectorAll('.chk'); if (last.length) { sameCue(note, last[last.length - 1], 'fade', 400); }
      upd();
    },
    leave: function () { var v = document.querySelector('.phone-video video'); if (v) { try { v.pause(); } catch (e) { /* ignoră */ } } }
  };

  // ---------- 1.31 · planul tău, de completat și de descărcat ----------
  var plan = {
    init: function (r) {
      var p = P(), V = p.V;
      if (!V.tPlan_Emotie && V.tCuvant) { p.setVar('tPlan_Emotie', V.tCuvant); }
      var keys = ['tPlan_Emotie', 'tPlan_Primul', 'tPlan_Ultimul', 'tPlan_Element'];
      var hints = ['de exemplu: ' + (V.tCuvant || 'mister, bucurie, neliniște'), 'ce vede publicul în prima secundă', 'compoziția finală, care rămâne 1 secundă', 'unul-două straturi: ce intră, ce crește, ce se rotește'];
      keys.forEach(function (k, i) {
        var q = o(r, 'txt_Intrebare' + (i + 1)); if (!q) { return; }
        var inp = add(r, '<input class="plan-in" type="text" maxlength="140" autocomplete="off" style="left:160px;top:' + (parseFloat(q.style.top) + 54) + 'px" aria-label="' + p.esc(q.textContent.trim()) + '" placeholder="' + p.esc(hints[i]) + '">');
        sameCue(inp, q, 'fade', 250);
        inp.value = V[k] || '';
        inp.addEventListener('input', function () { p.setVar(k, inp.value); });
        inp.addEventListener('change', function () { p.saveNow(true); });
      });
      var acts = add(r, '<div class="plan-acts" data-ctl><button class="btn btn--small btn--ink" type="button" data-x="plan-download">' + p.icon('download') + 'Descarcă planul (.doc)</button>' +
        (p.canPrint() ? '<button class="btn btn--small" type="button" data-x="plan-print">' + p.icon('print') + 'Printează</button>' : '') + '</div>');
      sameCue(acts, o(r, 'txt_Intrebare4'), 'fade', 600);
      p.wireExports(acts);
    }
  };

  var X = {
    '1.2': ten, '1.5': artwork('1.5', 'img_Picasso', 'txt_Legenda'), '1.6': artwork('1.6', 'img_Hoch', 'txt_Legenda'),
    '1.7': artwork('1.7', 'img_Bearden', 'txt_Legenda'), '1.8': tools, '1.9': exercise, '1.12': moves, '1.13': fifteen,
    '1.14': sound, '1.16': word, '1.30': clipCheck, '1.31': plan
  };
  for (var n = 21; n <= 28; n++) { X['1.' + n] = schema; }
  return X;
})();
