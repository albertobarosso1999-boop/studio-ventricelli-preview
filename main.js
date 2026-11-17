(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = matchMedia('(min-width:1021px)');

/* ── header, barra di avanzamento, pulsante chiama ── */
const header = $('#header'), progress = $('#progress'), fab = $('#fab');
const parallax = $$('[data-parallax]');
const quote = $('#quote');
let words = [];
if (quote) {
  const out = [];
  quote.childNodes.forEach(n => {
    const key = n.nodeType === 1;
    n.textContent.trim().split(/\s+/).forEach(w => out.push(`<span class="w${key ? ' key' : ''}">${w}</span>`));
  });
  quote.innerHTML = out.join(' ');
  words = $$('.w', quote);
}
function litQuote() {
  if (!quote || reduce) return;
  const r = quote.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .88 - r.top) / (innerHeight * .5 + r.height * .5)));
  const n = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('lit', i < n));
}
let ticking = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('solid', y > 60);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (fab) fab.classList.toggle('show', y > innerHeight * .6);
  litQuote();
  if (!reduce) parallax.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    el.style.transform = `translateY(${(-6 + p * -6).toFixed(2)}%)`;
  });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll);

/* ── menu mobile ── */
const burger = $('#burger');
const setMenu = open => {
  document.documentElement.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('menu-open')));
$$('.nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ── chi siamo: pannelli dei dottori ── */
const docs = $$('.doc');
docs.forEach(d => {
  const act = () => { if (wide.matches) docs.forEach(x => x.classList.toggle('on', x === d)); };
  d.addEventListener('click', act);
  d.addEventListener('focus', act);
  d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
});

/* ── perché scegliere noi ── */
const whyList = $('#whyList');
if (whyList) {
  const whyItems = $$('li', whyList), whyImgs = $$('#whyVis img'), whyCount = $('#whyCount');
  const setWhy = i => {
    whyItems.forEach((li, k) => { li.classList.toggle('on', k === i); $('button', li).setAttribute('aria-expanded', k === i); });
    whyImgs.forEach((im, k) => im.classList.toggle('on', k === i));
    whyCount.textContent = `${pad(i + 1)} / ${pad(whyItems.length)}`;
  };
  whyItems.forEach((li, i) => {
    $('button', li).addEventListener('click', () => setWhy(i));
    li.addEventListener('mouseenter', () => { if (wide.matches && matchMedia('(hover:hover)').matches) setWhy(i); });
  });
}

/* ── trattamenti: scheda di dettaglio ── */
const grid = $('#actGrid'), sheet = $('#sheet');
if (grid && sheet) {
  const cards = $$('.card', grid), sBody = $('#sheetBody'), sImg = $('#sheetImg');
  let si = 0;
  const showSheet = i => {
    si = (i + cards.length) % cards.length;
    const c = cards[si], title = $('h3', c).textContent;
    sImg.src = $('img', c).getAttribute('src'); sImg.alt = title;
    $('#sheetCnt').textContent = `${pad(si + 1)} / ${pad(cards.length)}`;
    $('#sheetTitle').textContent = title;
    $('#sheetText').innerHTML = $$('.desc > span', c).map(p => `<p>${p.innerHTML}</p>`).join('');
    [sBody, sImg].forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
    sBody.parentElement.scrollTop = 0;
  };
  grid.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (!c) return;
    showSheet(cards.indexOf(c)); sheet.showModal();
  });
  $('#sheetPrev').addEventListener('click', () => showSheet(si - 1));
  $('#sheetNext').addEventListener('click', () => showSheet(si + 1));
  $('#sheetClose').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') showSheet(si + 1);
    if (e.key === 'ArrowLeft') showSheet(si - 1);
  });
}

/* ── trattamenti: linguette ── */
const tx = $('#tx');
if (tx) {
  const tabs = $$('.tx-tab', tx), panels = $$('.tx-panel', tx);
  let cur = 0;
  const show = (i, focus) => {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === cur); t.tabIndex = k === cur ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== cur; });
    const t = tabs[cur], box = t.parentElement;
    box.scrollTo({ left: t.offsetLeft - box.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
    if (focus) t.focus({ preventScroll: true });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true); }
    });
  });
  $('#txPrev').addEventListener('click', () => show(cur - 1));
  $('#txNext').addEventListener('click', () => show(cur + 1));
  const fromHash = () => { const k = panels.findIndex(p => '#' + p.id === location.hash); if (k >= 0) show(k); };
  addEventListener('hashchange', fromHash); fromHash();
}

/* ── orari: giorno corrente e stato ── */
const hours = $('#hours');
if (hours) {
  const SCHED = { 1: [[540, 720], [780, 1200]], 2: [[750, 1170]], 3: [[540, 720], [780, 1200]], 4: [[540, 840]], 5: [[540, 720], [780, 1200]] };
  const hoursNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const min = (+get('hour') % 24) * 60 + +get('minute');
    const open = (SCHED[day] || []).some(([a, b]) => min >= a && min < b);
    $$('li', hours).forEach(li => li.classList.toggle('today', +li.dataset.d === day));
    const st = $('#status');
    st.textContent = open ? 'Aperto ora' : 'Chiuso ora';
    st.classList.toggle('open', open);
  };
  hoursNow(); setInterval(hoursNow, 60000);
}

/* ── richiesta appuntamento: apre la mail già compilata ── */
const form = $('#apptForm');
if (form) {
  const formCard = $('#formCard'), formNote = $('#formNote'), noteDefault = formNote.textContent;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      formNote.textContent = 'Compila i campi contrassegnati con * e accetta la privacy.';
      formNote.style.color = '#a3261a';
      form.reportValidity();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const body = [
      'Buongiorno, vorrei richiedere un appuntamento.', '',
      'Nome e cognome: ' + d.nome,
      'Telefono: ' + d.tel,
      d.email ? 'Email: ' + d.email : null,
      'Motivo: ' + d.motivo,
      'Preferenza oraria: ' + d.fascia,
      d.msg ? '\nMessaggio:\n' + d.msg : null,
    ].filter(x => x !== null).join('\n');
    location.href = 'mailto:segreteria@studioventricelli.it?subject=' + encodeURIComponent('Richiesta appuntamento – ' + d.motivo) + '&body=' + encodeURIComponent(body);
    formCard.classList.add('sent');
  });
  $('#formAgain').addEventListener('click', () => { form.reset(); formNote.textContent = noteDefault; formNote.style.color = ''; formCard.classList.remove('sent'); });
}

/* ── mappa: caricata solo su richiesta ── */
const mapBtn = $('#mapBtn');
if (mapBtn) mapBtn.addEventListener('click', () => {
  $('#map').innerHTML = '<iframe title="Mappa: Corso Vinzaglio 12 bis, Torino" loading="lazy" referrerpolicy="no-referrer" src="https://www.google.com/maps?q=Corso+Vinzaglio+12bis,+Torino&z=16&output=embed"></iframe>';
});

/* ── comparsa allo scorrimento ── */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
$$('.reveal').forEach(el => io.observe(el));

onScroll();
})();
