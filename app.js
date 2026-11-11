'use strict';
/* ===== Mes courses — logique de l'application =====
   Toutes les données restent sur le téléphone (localStorage). Aucun serveur. */

const VERSION = '1.5.2';
const KEY = 'mes-courses-v2';

/* ---------- Constantes ---------- */
const UNITS = [['', 'unité'], ['g', 'g'], ['kg', 'kg'], ['ml', 'ml'], ['cl', 'cl'], ['l', 'L'], ['bouquet', 'bouquet'], ['boîte', 'boîte'], ['sachet', 'sachet'], ['paquet', 'paquet'], ['pot', 'pot'], ['tranche', 'tranche']];
const SLOTS = ['Petit-déjeuner', 'Brunch', 'Apéro', 'Midi', 'Goûter', 'Dîner'];
const THEMES = {
  rose:      { g: '#D92A63', g1: '#EC5E8C', g2: '#FBE6EF', gb: '#F6D3E1', b1: '#D92A63', b2: '#EC5E8C', bt: '#FFFFFF' },
  vert:      { g: '#2F7D4F', g1: '#4AA673', g2: '#E3F0E8', gb: '#CFE3D6', b1: '#2F7D4F', b2: '#4AA673', bt: '#FFFFFF' },
  orange:    { g: '#B05400', g1: '#FF7F00', g2: '#FFF0DE', gb: '#F7D9B5', b1: '#FF7F00', b2: '#FF9D3D', bt: '#3A1D00' },
  turquoise: { g: '#0F8299', g1: '#6BD8EC', g2: '#E3F7FB', gb: '#BFEAF2', b1: '#58CBE2', b2: '#86E2F1', bt: '#0B3340' },
  taupe:     { g: '#756559', g1: '#A08F82', g2: '#EEE8E2', gb: '#DDD3CA', b1: '#756559', b2: '#A08F82', bt: '#FFFFFF' }
};


/* ---------- Icônes ----------
   Icônes « Lucide » (https://lucide.dev), licence ISC. Style plat : traits fins, sans relief. */
const ICONS = {
  'shopping-cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  'settings': '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  'shopping-basket': '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'minus': '<path d="M5 12h14"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
};
function ic(name, size = 20, sw = 2) {
  const e = document.createElement('span'); e.className = 'ic'; e.setAttribute('aria-hidden', 'true');
  e.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
  return e;
}

/* ---------- Données ---------- */
const defaults = () => ({ v: 2, rev: 0, backedRev: 0, started: false, items: [], dishes: [], plan: {}, stats: {}, sessions: 0, lastBackup: '', prefs: { size: 1, theme: 'rose', custom: '#7B5EA7', addBottom: false } });

function normalize(o) {
  const r = Object.assign(defaults(), o || {});
  r.prefs = Object.assign(defaults().prefs, (o && o.prefs) || {});
  for (const k of Object.keys(r.plan)) {
    r.plan[k] = (r.plan[k] || []).map(m => {
      if (!m.parts) { // ancien format : un plat ou une note
        m.parts = [];
        if (m.dishId) m.parts.push({ t: 'dish', id: m.dishId, inList: false });
        if (m.note) m.parts.push({ t: 'note', text: m.note });
      }
      return m;
    });
    if (!r.plan[k].length) delete r.plan[k];
  }
  return r;
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) {}
  return normalize({});
}
function save() {
  S.rev = (S.rev || 0) + 1; // numéro de modification : sert à savoir s'il reste du travail non sauvegardé
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Enregistrement impossible'); }
}
let S = load();
let view = 'courses';
let weekStart = monday(new Date());
let dishQuery = '';

const isEmpty = () => !S.items.length && !S.dishes.length && !Object.keys(S.plan).length;
const isDirty = () => !isEmpty() && S.rev !== S.backedRev;
function refreshBadge() { const b = $('.tabs .badge'); if (b) b.style.display = isDirty() ? 'block' : 'none'; }
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const dishById = id => S.dishes.find(d => d.id === id);
let lastStamp = 0;
const stamp = () => (lastStamp = Math.max(Date.now(), lastStamp + 1)); // horodatage strictement croissant (ordre des coches)

/* ---------- Utilitaires ---------- */
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in (attrs || {})) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
const $ = s => document.querySelector(s);
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/\s+/g, ' ');
const stemWord = w => (w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w);
const stem = s => norm(s).split(' ').map(stemWord).join(' ');
const keyOf = (name, unit) => stem(name) + '|' + (unit || '');
const byName = (a, b) => a.name.localeCompare(b.name, 'fr');
const r2 = n => Math.round(n * 100) / 100;
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function monday(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDay = d => cap1(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
const parseQty = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n > 0 ? n : null; };
const fmtNum = n => String(r2(n)).replace('.', ',');
const unitLabel = u => (UNITS.find(x => x[0] === u) || [0, u])[1];
const fmtQty = i => i.qty == null ? '' : fmtNum(i.qty) + (i.unit ? ' ' + unitLabel(i.unit) : '');
function unitSelect(val) {
  const s = h('select', { 'aria-label': 'Unité' }, UNITS.map(([v, l]) => h('option', { value: v }, l)));
  s.value = val || ''; return s;
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let p = [...Array(n + 1).keys()];
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
  return p[n];
}
function similarDish(name, selfId) {
  const a = stem(name); if (a.length < 3) return null;
  return S.dishes.find(d => {
    if (d.id === selfId) return false;
    const b = stem(d.name);
    if (a === b) return true;
    if (a.length >= 5 && b.length >= 5 && (a.includes(b) || b.includes(a))) return true;
    return a.length >= 5 && b.length >= 5 && lev(a, b) <= 1;
  }) || null;
}
function knownNames() {
  const set = new Map();
  const add = n => { if (n && !set.has(stem(n))) set.set(stem(n), n); };
  S.items.forEach(i => add(i.name));
  S.dishes.forEach(d => d.ingredients.forEach(g => add(g.name)));
  Object.values(S.stats).forEach(st => add(st.name));
  Object.values(S.plan).forEach(ms => ms.forEach(m => m.parts.forEach(p => p.t === 'ing' && add(p.name))));
  return [...set.values()].sort((a, b) => a.localeCompare(b, 'fr'));
}
const namesList = () => h('datalist', { id: 'names' }, knownNames().map(n => h('option', { value: n })));

let toastT;
function toast(msg, actionLabel, fn) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = h('div', { class: 'toast', role: 'status' }, msg, actionLabel ? h('button', { onclick: () => { t.remove(); fn(); } }, actionLabel) : null);
  document.body.append(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), actionLabel ? 5500 : 3200);
}

/* ---------- Fenêtres (avec le bouton retour du téléphone) ---------- */
// Une seule entrée d'historique tant qu'au moins une fenêtre est ouverte :
// le bouton « retour » du téléphone ferme la fenêtre du dessus au lieu de quitter l'application.
const sheetStack = []; let ignorePop = 0, hasEntry = false;
function openSheet(build) {
  const ov = h('div', { class: 'overlay' }), sh = h('div', { class: 'sheet' });
  ov.append(sh);
  const close = () => {
    const i = sheetStack.indexOf(ov); if (i < 0) return;
    sheetStack.splice(i, 1); ov.remove();
    setTimeout(() => { if (!sheetStack.length && hasEntry) { hasEntry = false; ignorePop++; history.back(); } }, 0);
  };
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  build(sh, close);
  document.body.append(ov); sheetStack.push(ov);
  if (!hasEntry) { history.pushState({ sheet: 1 }, ''); hasEntry = true; }
}
window.addEventListener('popstate', () => {
  if (ignorePop > 0) { ignorePop--; return; }
  hasEntry = false;
  const ov = sheetStack.pop(); if (ov) ov.remove();
  if (sheetStack.length) { history.pushState({ sheet: 1 }, ''); hasEntry = true; }
});

/* ---------- Liste de courses : logique ---------- */
function addToList(name, qty, unit) {
  unit = unit || '';
  const ex = S.items.find(i => !i.checked && keyOf(i.name, i.unit) === keyOf(name, unit));
  if (ex) { if (qty != null) ex.qty = r2((ex.qty || 0) + qty); }
  else S.items.push({ id: uid(), name, qty: qty == null ? null : qty, unit, checked: false });
}
const rankOf = i => { const st = S.stats[stem(i.name)]; return st && st.pos != null ? st.pos : null; };
function storeOrder(a, b) {
  const ra = rankOf(a), rb = rankOf(b);
  if (ra == null && rb == null) return 0;
  if (ra == null) return 1; if (rb == null) return -1; return ra - rb;
}
function recordPurchases(checked) {
  const sorted = checked.slice().sort((a, b) => (a.checkedAt || 0) - (b.checkedAt || 0));
  const seen = new Set(), order = [];
  sorted.forEach(i => { const k = stem(i.name); if (!seen.has(k)) { seen.add(k); order.push(i); } });
  order.forEach((i, idx) => {
    const k = stem(i.name);
    const st = S.stats[k] || (S.stats[k] = { name: i.name, count: 0, pos: null, npos: 0 });
    st.name = i.name; st.count++; st.qty = i.qty; st.unit = i.unit || '';
    if (order.length > 1) {
      const p = idx / (order.length - 1);
      if (st.pos == null) { st.pos = p; st.npos = 1; }
      else { const a = 1 / (Math.min(st.npos, 8) + 1); st.pos += a * (p - st.pos); st.npos++; }
    }
  });
  if (order.length > 1) S.sessions++;
}

/* ---------- Semaine : logique ---------- */
function partIngredients(p) {
  if (p.t === 'dish') { const d = dishById(p.id); return d ? d.ingredients.map(g => ({ name: g.name, qty: g.qty, unit: g.unit || '' })) : []; }
  if (p.t === 'ing') return [{ name: p.name, qty: p.qty, unit: p.unit || '' }];
  return [];
}
function partLabel(p) {
  if (p.t === 'dish') { const d = dishById(p.id); return d ? d.name : '(plat supprimé)'; }
  return p.t === 'ing' ? p.name : p.text;
}
const mealText = m => m.parts.map(partLabel).join(' + ') || '—';
const pendingParts = m => m.parts.filter(p => !p.inList && partIngredients(p).length);
const slotRank = s => { const i = SLOTS.indexOf(s); return i < 0 ? 99 : i; };
function weekMeals() {
  const out = [];
  for (let i = 0; i < 7; i++) { const day = addDays(weekStart, i), k = iso(day); (S.plan[k] || []).forEach(m => out.push({ day, k, m })); }
  return out;
}

/* ---------- Sauvegarde ---------- */
function doBackup(manual) {
  S.lastBackup = iso(new Date()); S.backedRev = (S.rev || 0) + 1; save();
  const blob = new Blob([JSON.stringify({ app: 'mes-courses', date: new Date().toISOString(), data: S }, null, 1)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'courses-sauvegarde-' + iso(new Date()) + '.json' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast(manual ? 'Sauvegarde enregistrée dans Téléchargements' : 'Sauvegarde du jour enregistrée (Téléchargements)');
  refreshBadge();
  if (view === 'reglages') render();
}
let armed = false;
const BACKUP_DAYS = 7;
function backupDue() {
  if (!S.lastBackup) return true;
  const d = (new Date(iso(new Date()) + 'T12:00:00') - new Date(S.lastBackup + 'T12:00:00')) / 86400000;
  return !(d >= 0 && d < BACKUP_DAYS);
}
function armAutoBackup() {
  if (armed || !isDirty() || !backupDue()) return;
  armed = true;
  const fire = () => {
    document.removeEventListener('pointerup', fire); armed = false;
    setTimeout(() => { if (isDirty() && backupDue()) doBackup(false); }, 1200);
  };
  document.addEventListener('pointerup', fire);
}
function restoreFile(file, ask) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const o = JSON.parse(r.result), d = o.data || o;
      if (!d || !Array.isArray(d.items) || !Array.isArray(d.dishes) || typeof d.plan !== 'object') throw 0;
      if (ask && !isEmpty() && !confirm('Remplacer les données actuelles par cette sauvegarde ?')) return;
      S = normalize(Object.assign({}, d, { started: true })); save(); applyPrefs(); render(); toast('Données restaurées');
    } catch (e) { toast('Fichier non reconnu'); }
  };
  r.readAsText(file);
}
function restoreButton(text, cls, ask) {
  const inp = h('input', { type: 'file', onchange: e => { const f = e.target.files[0]; if (f) restoreFile(f, ask); e.target.value = ''; } });
  return h('label', { class: 'btn ' + cls }, text, inp);
}

/* ---------- Apparence ---------- */
// Couleur au choix : on assombrit la couleur choisie pour que le texte blanc reste lisible.
function customTheme(hex) {
  const n = parseInt(hex.slice(1), 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const toHex = c => '#' + c.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
  const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const light = rgb.map(v => v + (255 - v) * 0.2);                       // boutons : la couleur choisie, un peu éclaircie
  const mid = rgb.map((v, i) => (v + light[i]) / 2), L = lum(mid);
  const bt = contrast(1, L) >= contrast(L, lum([29, 37, 33])) ? '#FFFFFF' : '#1D2521'; // texte blanc ou foncé, le plus lisible
  let k = 1;                                                              // accent : la couleur assombrie jusqu'à être lisible sur fond blanc
  while (k > 0.25 && contrast(1, lum(rgb.map(v => v * k))) < 4.5) k -= 0.04;
  return { g: toHex(rgb.map(v => v * k)), g1: hex, g2: toHex(rgb.map(v => v * 0.12 + 255 * 0.88)), gb: toHex(rgb.map(v => v * 0.3 + 255 * 0.7)), b1: hex, b2: toHex(light), bt };
}
const themeOf = p => (p.theme === 'perso' && /^#[0-9a-f]{6}$/i.test(p.custom || '') ? customTheme(p.custom) : (THEMES[p.theme] || THEMES.rose));
function applyPrefs() {
  const p = S.prefs, r = document.documentElement, t = themeOf(p);
  ['g', 'g1', 'g2', 'gb', 'b1', 'b2', 'bt'].forEach(k => r.style.setProperty('--' + k, t[k]));
  r.style.fontSize = [15, 17, 19][p.size] + 'px';
}

/* ---------- Affichage ---------- */
const page = (title, ...kids) => h('div', {}, h('div', { class: 'hdr' }, h('h1', {}, title)), h('div', { class: 'pg' }, kids));

function render() {
  const app = $('#app'); app.replaceChildren();
  document.body.dataset.view = (isEmpty() && !S.started) ? 'accueil' : view;
  document.querySelectorAll('.tabs,.foot,.dock').forEach(t => t.remove());
  document.body.classList.remove('typing');
  document.documentElement.style.setProperty('--dockh', '0px');
  if (isEmpty() && !S.started) { app.append(viewWelcome()); return; }
  app.append(namesList());
  app.append(view === 'courses' ? viewCourses() : view === 'semaine' ? viewWeek() : view === 'plats' ? viewDishes() : viewSettings());
  document.body.append(h('nav', { class: 'tabs' }, [['courses', 'shopping-cart', 'Courses'], ['semaine', 'calendar-days', 'Semaine'], ['plats', 'utensils', 'Plats'], ['reglages', 'settings', 'Réglages']]
    .map(([k, i, l]) => h('button', { class: view === k ? 'on' : '', onclick: () => { view = k; render(); window.scrollTo(0, 0); } }, ic(i, 24, view === k ? 2.3 : 1.8), l, k === 'reglages' ? h('i', { class: 'badge', 'aria-label': 'Modifications non sauvegardées' }) : null))));
  refreshBadge();
  armAutoBackup();
}

function viewWelcome() {
  return h('div', { class: 'center pg' },
    h('div', { class: 'big' }, ic('shopping-basket', 64, 1.6)), h('h1', { style: 'margin:0 0 10px' }, 'Mes courses'),
    h('p', { class: 'hint' }, 'Votre liste de courses et vos menus de la semaine, directement sur le téléphone.'),
    h('button', { class: 'btn', onclick: () => { S.started = true; save(); render(); } }, 'Commencer'),
    restoreButton('Restaurer une sauvegarde', 'ghost', false),
    h('p', { class: 'hint', style: 'margin-top:14px' }, 'Après un nettoyage du navigateur, choisissez le fichier de sauvegarde le plus récent.'));
}

/* ----- Courses ----- */
function viewCourses() {
  const nameI = h('input', { id: 'addname', type: 'text', placeholder: 'Produit…', list: 'names', autocomplete: 'off', enterkeyhint: 'done' });
  const qtyI = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'Qté', 'aria-label': 'Quantité' });
  const unitS = unitSelect('');
  const add = () => {
    const n = nameI.value.trim(); if (!n) { nameI.focus(); return; }
    addToList(n, parseQty(qtyI.value), unitS.value); save(); render();
    const next = $('#addname'); if (next) next.focus();
  };
  [nameI, qtyI].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') add(); }));

  const todo = S.items.filter(i => !i.checked).sort(storeOrder);
  const done = S.items.filter(i => i.checked).sort((a, b) => (a.checkedAt || 0) - (b.checkedAt || 0));
  const inTodo = new Set(todo.map(i => stem(i.name)));
  const habits = Object.values(S.stats).filter(st => st.count > 0 && !inTodo.has(stem(st.name))).sort((a, b) => b.count - a.count).slice(0, 12);

  const tog = i => { i.checked = !i.checked; i.checkedAt = i.checked ? stamp() : null; save(); render(); };
  const row = i => h('li', { class: 'row' + (i.checked ? ' done' : '') },
    h('button', { class: 'tick', 'aria-label': i.checked ? 'Décocher ' + i.name : 'Cocher ' + i.name, onclick: () => tog(i) }, i.checked ? ic('check', 18, 3) : null),
    h('div', { class: 'rbody', onclick: () => itemSheet(i) }, h('span', { class: 'nm' }, i.name), h('span', { class: 'q' }, fmtQty(i))));

  const ordered = S.sessions > 0 && todo.some(i => rankOf(i) != null);
  const bottom = !!S.prefs.addBottom;
  const capEl = ordered ? h('p', { class: 'cap' }, 'Classée dans votre ordre habituel') : null;
  const addEl = h('div', { class: 'addform' }, nameI, qtyI, unitS, h('button', { class: 'btn plus', onclick: add, 'aria-label': 'Ajouter' }, ic('plus', 24)));
  const habEl = habits.length ? h('div', { class: 'chipsrow' }, habits.map(st => h('button', { class: 'hab', onclick: () => { addToList(st.name, st.qty == null ? null : st.qty, st.unit); save(); render(); } }, ic('plus', 16, 2.4), st.name))) : null;
  const sc = 'sec' + (bottom ? ' tight' : '');
  const listEl = [
    todo.length ? h('div', {}, h('div', { class: sc }, 'À acheter (' + todo.length + ')'), h('ul', { class: 'l' }, todo.map(row)))
      : h('p', { class: 'hint', style: 'margin-top:14px' }, S.items.length ? 'Tout est dans le panier.' : 'Votre liste est vide. Ajoutez un produit ' + (bottom ? 'ci-dessous' : 'ci-dessus') + ', ou générez la liste depuis l’onglet Semaine.'),
    done.length ? h('div', {}, h('div', { class: todo.length ? 'sec' : sc }, 'Dans le panier (' + done.length + ')'), h('ul', { class: 'l' }, done.map(row))) : null
  ];
  const body = (bottom ? [capEl, ...listEl] : [capEl, addEl, habEl, ...listEl]).concat([h('div', { style: 'height:70px' })]);
  if (bottom) {
    const dock = h('div', { class: 'dock' }, addEl, habEl);
    dock.addEventListener('focusin', () => document.body.classList.add('typing'));
    dock.addEventListener('focusout', () => setTimeout(() => {
      const d = document.querySelector('.dock');
      if (!d || !d.contains(document.activeElement)) document.body.classList.remove('typing');
    }, 250));
    document.body.append(dock);
    document.documentElement.style.setProperty('--dockh', dock.offsetHeight + 'px');
  }
  if (done.length) document.body.append(h('div', { class: 'foot' }, h('button', { class: 'btn', onclick: finishSheet }, 'Terminer les courses · ' + done.length + (done.length > 1 ? ' cochés' : ' coché'))));
  return page('Ma liste de courses', body);
}

function itemSheet(it) {
  openSheet((sh, close) => {
    const nameI = h('input', { type: 'text', value: it.name, list: 'names', autocomplete: 'off' });
    const qtyI = h('input', { type: 'text', inputmode: 'decimal', value: it.qty == null ? '' : fmtNum(it.qty), placeholder: 'Qté' });
    const unitS = unitSelect(it.unit);
    let taken = it.qty;
    const box = h('div', { class: 'card warm', style: 'margin-top:14px' });
    const stepSize = () => { const u = unitS.value; return u === 'g' || u === 'ml' ? 50 : u === 'cl' ? 5 : u === 'kg' || u === 'l' ? 0.5 : 1; };
    const drawBox = () => {
      const q = parseQty(qtyI.value);
      if (q == null) { box.style.display = 'none'; return; }
      box.style.display = ''; if (taken == null || taken > q) taken = q;
      const rest = r2(q - taken);
      box.replaceChildren(h('b', {}, 'J’en ai pris moins ?'),
        h('div', { class: 'stepper' },
          h('button', { 'aria-label': 'Moins', onclick: () => { taken = Math.max(0, r2(taken - stepSize())); drawBox(); } }, ic('minus', 20)),
          h('b', {}, fmtNum(taken)),
          h('button', { 'aria-label': 'Plus', onclick: () => { taken = Math.min(q, r2(taken + stepSize())); drawBox(); } }, ic('plus', 20)),
          h('span', { class: 'hint' }, 'sur ' + fmtNum(q))),
        h('span', { class: 'hint' }, taken > 0 && taken < q ? 'Les ' + fmtNum(taken) + ' pris sont cochés. Il en reste ' + fmtNum(rest) + ' dans la liste pour la prochaine fois.' : taken === 0 ? 'Rien de pris pour l’instant.' : 'Touchez − si vous en avez pris moins.'));
    };
    qtyI.addEventListener('input', () => { taken = parseQty(qtyI.value); drawBox(); });
    unitS.addEventListener('change', drawBox);
    drawBox();
    sh.append(h('h2', {}, 'Modifier l’article'),
      h('div', { class: 'hint' }, 'Libellé'), nameI,
      h('div', { class: 'hint', style: 'margin-top:10px' }, 'Quantité à acheter'),
      h('div', { style: 'display:grid;grid-template-columns:1fr 100px;gap:6px' }, qtyI, unitS),
      box,
      h('button', { class: 'btn', onclick: () => {
        const name = nameI.value.trim() || it.name, q = parseQty(qtyI.value), u = unitS.value;
        if (q != null && taken != null && taken > 0 && taken < q) {
          S.items.push({ id: uid(), name, qty: r2(q - taken), unit: u, checked: false });
          Object.assign(it, { name, qty: taken, unit: u, checked: true, checkedAt: stamp() });
        } else Object.assign(it, { name, qty: q, unit: u });
        save(); close(); render();
      } }, 'Enregistrer'),
      h('button', { class: 'btn danger', onclick: () => { S.items = S.items.filter(x => x !== it); save(); close(); render(); } }, 'Supprimer de la liste'));
  });
}

function finishSheet() {
  const done = S.items.filter(i => i.checked), rest = S.items.length - done.length;
  openSheet((sh, close) => {
    sh.append(h('h2', {}, 'Terminer les courses ?'),
      h('p', {}, h('b', {}, done.length + (done.length > 1 ? ' articles cochés' : ' article coché')), ' ' + (done.length > 1 ? 'sont rangés.' : 'est rangé.')),
      h('p', {}, h('b', {}, rest + (rest > 1 ? ' articles' : ' article')), ' ' + (rest > 1 ? 'restent' : 'reste') + ' dans la liste pour la prochaine fois.'),
      h('p', { class: 'hint' }, 'Votre ordre habituel de magasin est mis à jour avec cette sortie.'),
      h('button', { class: 'btn', onclick: () => { recordPurchases(done); S.items = S.items.filter(i => !i.checked); save(); close(); render(); toast('Courses terminées'); } }, 'Terminer les courses'),
      h('button', { class: 'btn link', onclick: close }, 'Pas encore'));
  });
}

/* ----- Semaine ----- */
function viewWeek() {
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i)), todayIso = iso(new Date());
  const meals = weekMeals(), n = meals.filter(x => pendingParts(x.m).length).length;
  const label = 'Semaine du ' + weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const body = [
    h('div', { class: 'weeknav' },
      h('button', { 'aria-label': 'Semaine précédente', onclick: () => { weekStart = addDays(weekStart, -7); render(); } }, ic('chevron-left', 22)),
      h('div', { class: 'mid' }, label),
      h('button', { 'aria-label': 'Semaine suivante', onclick: () => { weekStart = addDays(weekStart, 7); render(); } }, ic('chevron-right', 22))),
    +weekStart !== +monday(new Date()) ? h('button', { class: 'btn link', style: 'margin:0 0 6px', onclick: () => { weekStart = monday(new Date()); render(); } }, 'Revenir à cette semaine') : null,
    h('button', { class: 'btn' + (n ? '' : ' ghost'), style: 'margin:0 0 12px', onclick: genSheet }, n ? 'Générer la liste · ' + n + (n > 1 ? ' nouveaux repas' : ' nouveau repas') : 'Générer la liste de courses'),
    days.map(d => {
      const k = iso(d), ms = (S.plan[k] || []).slice().sort((a, b) => slotRank(a.slot) - slotRank(b.slot));
      return h('div', { class: 'day' + (k === todayIso ? ' today' : '') },
        h('div', { class: 'dayh' }, h('span', {}, fmtDay(d)), h('button', { onclick: () => mealSheet(k, d, null) }, '+ Repas')),
        ms.map(m => h('div', { class: 'meal' }, h('span', { class: 's' }, m.slot), h('span', { class: 'd', onclick: () => mealSheet(k, d, m) }, mealText(m)),
          h('button', { class: 'x', 'aria-label': 'Retirer ce repas', onclick: () => {
            const idx = S.plan[k].indexOf(m); S.plan[k].splice(idx, 1); if (!S.plan[k].length) delete S.plan[k]; save(); render();
            toast('Repas retiré', 'Annuler', () => { (S.plan[k] = S.plan[k] || []).push(m); save(); render(); });
          } }, ic('x', 18)))));
    }), h('div', { style: 'height:10px' })];
  return page('Menus de la semaine', body);
}

function mealSheet(dayIso, dayDate, meal) {
  openSheet((sh, close) => {
    let parts = meal ? JSON.parse(JSON.stringify(meal.parts)) : [];
    let slot = meal ? (SLOTS.includes(meal.slot) ? meal.slot : 'Autre') : (new Date().getHours() < 15 ? 'Midi' : 'Dîner');
    let editIdx = null;
    const custom = h('input', { type: 'text', placeholder: 'Nom du repas (ex. : Collation)', value: meal && !SLOTS.includes(meal.slot) ? meal.slot : '', style: 'margin-bottom:10px;' + (slot === 'Autre' ? '' : 'display:none') });
    const chips = h('div', { class: 'chips' });
    const drawChips = () => chips.replaceChildren(...[...SLOTS, 'Autre'].map(s => h('button', { class: 'chip' + (s === slot ? ' on' : ''), onclick: () => { slot = s; drawChips(); custom.style.display = s === 'Autre' ? '' : 'none'; if (s === 'Autre') custom.focus(); } }, s)));
    drawChips();

    const pills = h('div', {}), qtyEd = h('div', {}), saveBtn = h('button', { class: 'btn' });
    const refreshBtn = () => { saveBtn.textContent = (meal ? 'Enregistrer le repas' : 'Ajouter ce repas') + ' (' + parts.length + ')'; saveBtn.disabled = !parts.length; };
    const drawQty = () => {
      if (editIdx == null || !parts[editIdx]) { qtyEd.replaceChildren(); return; }
      const p = parts[editIdx];
      const qi = h('input', { type: 'text', inputmode: 'decimal', value: p.qty == null ? '' : fmtNum(p.qty), placeholder: 'Qté', oninput: e => { p.qty = parseQty(e.target.value); } });
      const us = unitSelect(p.unit); us.addEventListener('change', () => { p.unit = us.value; });
      qtyEd.replaceChildren(h('div', { class: 'hint' }, 'Quantité de « ' + p.name + ' » (facultatif)'),
        h('div', { class: 'qrow' }, qi, us, h('button', { class: 'btn', style: 'margin:0;min-height:46px', onclick: () => { editIdx = null; drawQty(); drawPills(); } }, 'OK')));
      setTimeout(() => qi.focus(), 30);
    };
    const drawPills = () => {
      pills.replaceChildren(...parts.map((p, i) => {
        const lbl = partLabel(p) + '';
        return h('span', { class: 'sp', onclick: () => { if (p.t === 'ing') { editIdx = i; drawQty(); } } },
          lbl, p.t === 'ing' && p.qty != null ? h('i', {}, '· ' + fmtQty(p)) : null,
          h('b', { 'aria-label': 'Retirer', onclick: e => { e.stopPropagation(); parts.splice(i, 1); editIdx = null; drawQty(); drawPills(); refreshBtn(); } }, ic('x', 14, 2.4)));
      }));
      refreshBtn();
    };

    const q = h('input', { type: 'search', placeholder: 'Chercher un plat ou un ingrédient…', autocomplete: 'off' });
    const results = h('div', { class: 'list-sc' });
    const addPart = p => {
      if (p.t === 'dish' && parts.some(x => x.t === 'dish' && x.id === p.id)) { toast('Ce plat est déjà dans le repas'); return; }
      if (p.t === 'ing' && parts.some(x => x.t === 'ing' && stem(x.name) === stem(p.name))) { toast('Cet ingrédient est déjà dans le repas'); return; }
      parts.push(Object.assign({ inList: false }, p)); q.value = ''; drawResults(); drawPills();
    };
    const opt = (kind, label, onclick) => h('div', { class: 'opt', onclick }, h('span', { class: 'k ' + kind[0] }, kind[1]), label, h('span', { class: 'pl' }, ic('plus', 20, 2.4)));
    const drawResults = () => {
      const f = norm(q.value), raw = q.value.trim();
      const ds = S.dishes.filter(d => !f || norm(d.name).includes(f)).sort(byName).slice(0, f ? 20 : 4);
      const names = knownNames(), ings = names.filter(n => !f || norm(n).includes(f)).slice(0, f ? 20 : 4);
      const rows = [];
      if (ds.length) rows.push(h('div', { class: 'sec', style: 'margin:10px 2px 2px' }, 'Plats'), ...ds.map(d => opt(['p', 'plat'], d.name, () => addPart({ t: 'dish', id: d.id }))));
      if (ings.length) rows.push(h('div', { class: 'sec', style: 'margin:10px 2px 2px' }, 'Ingrédients'), ...ings.map(n => opt(['i', 'ingrédient'], n, () => addPart({ t: 'ing', name: n, qty: null, unit: '' }))));
      if (raw && !names.some(n => stem(n) === stem(raw))) {
        rows.push(h('div', { class: 'sec', style: 'margin:10px 2px 2px' }, 'Nouveau'),
          opt(['i', 'ingrédient'], 'Ajouter « ' + raw + ' » comme ingrédient', () => addPart({ t: 'ing', name: cap1(raw), qty: null, unit: '' })),
          opt(['n', 'note'], 'Ajouter « ' + raw + ' » comme note (rien à acheter)', () => addPart({ t: 'note', text: cap1(raw) })));
      }
      if (!rows.length) rows.push(h('p', { class: 'hint' }, 'Aucun résultat.'));
      results.replaceChildren(...rows);
    };
    q.addEventListener('input', drawResults); drawResults(); drawPills();

    saveBtn.addEventListener('click', () => {
      const name = slot === 'Autre' ? (custom.value.trim() || 'Autre') : slot;
      if (meal) { meal.slot = name; meal.parts = parts; }
      else (S.plan[dayIso] = S.plan[dayIso] || []).push({ id: uid(), slot: name, parts });
      save(); close(); view = 'semaine'; render();
    });
    const del = h('button', { class: 'btn danger', onclick: () => {
      if (del.dataset.sure !== '1') { del.dataset.sure = '1'; del.textContent = 'Confirmer la suppression'; return; }
      const arr = S.plan[dayIso]; arr.splice(arr.indexOf(meal), 1); if (!arr.length) delete S.plan[dayIso]; save(); close(); render();
    } }, 'Supprimer ce repas');

    sh.append(h('h2', {}, fmtDay(dayDate)), chips, custom,
      h('div', { class: 'hint', style: 'margin-bottom:6px' }, 'Dans ce repas'), pills, qtyEd,
      h('p', { class: 'hint', style: 'font-size:.78rem;margin:0 0 8px' }, 'Touchez un ingrédient pour régler sa quantité (facultatif).'),
      q, results,
      h('button', { class: 'btn ghost', onclick: () => dishSheet(null, d => addPart({ t: 'dish', id: d.id })) }, '+ Nouveau plat'),
      saveBtn, ...(meal ? [del] : []), h('button', { class: 'btn link', onclick: close }, 'Annuler'));
  });
}

function genSheet() {
  const all = weekMeals();
  let mode = all.some(x => pendingParts(x.m).length) ? 'new' : 'all';
  openSheet((sh, close) => {
    const body = h('div', {});
    const draw = () => {
      const considered = [];
      all.forEach(x => x.m.parts.forEach(p => { if (partIngredients(p).length && (mode === 'all' || !p.inList)) considered.push({ x, p }); }));
      const map = new Map();
      considered.forEach(({ p }) => partIngredients(p).forEach(g => {
        const k = keyOf(g.name, g.unit), e = map.get(k) || { name: g.name, unit: g.unit, qty: null, on: true };
        if (g.qty != null) e.qty = r2((e.qty || 0) + g.qty); map.set(k, e);
      }));
      const arr = [...map.values()].sort(byName);
      const mealsSeen = [...new Set(considered.map(c => c.x.m))];
      const btn = h('button', { class: 'btn' });
      const upd = () => { const n = arr.filter(e => e.on).length; btn.textContent = 'Ajouter à la liste (' + n + ')'; btn.disabled = !n; };
      const rows = arr.map(e => {
        const tick = h('button', { class: 'tick', 'aria-label': e.name });
        const row = h('div', { class: 'gen' }, tick, h('span', { class: 'nm' }, e.name), h('span', { class: 'q' }, fmtQty(e)));
        const paint = () => { tick.className = 'tick' + (e.on ? ' on' : ''); tick.replaceChildren(...(e.on ? [ic('check', 18, 3)] : [])); row.classList.toggle('off', !e.on); };
        row.addEventListener('click', () => { e.on = !e.on; paint(); upd(); }); paint(); return row;
      });
      btn.addEventListener('click', () => {
        arr.filter(e => e.on).forEach(e => addToList(e.name, e.qty, e.unit));
        considered.forEach(({ p }) => { p.inList = true; });
        save(); close(); view = 'courses'; render(); toast('Liste de courses mise à jour');
      });
      upd();
      const hasNew = all.some(x => pendingParts(x.m).length);
      body.replaceChildren(...[
        h('h2', {}, mode === 'new' ? 'Nouveaux repas à ajouter' : 'Tous les repas de la semaine'),
        mealsSeen.map(m => { const x = all.find(a => a.m === m); return h('span', { class: 'pill' }, cap1(x.day.toLocaleDateString('fr-FR', { weekday: 'long' })) + ' ' + m.slot.toLowerCase() + ' · ' + mealText(m)); }),
        arr.length ? h('p', { class: 'hint', style: 'margin-top:4px' }, 'Décochez ce que vous avez déjà à la maison.') : h('p', { class: 'hint' }, mode === 'new' ? 'Aucun nouvel ingrédient à ajouter.' : 'Aucun plat ou ingrédient planifié cette semaine.'),
        rows, arr.length ? btn : null,
        (mode === 'new' || hasNew) ? h('button', { class: 'btn link', onclick: () => { mode = mode === 'new' ? 'all' : 'new'; draw(); } }, mode === 'new' ? 'Voir tous les repas de la semaine' : 'Voir seulement les nouveaux repas') : null,
        h('button', { class: 'btn link', onclick: close }, 'Annuler')].flat(Infinity).filter(Boolean));
    };
    draw(); sh.append(body);
  });
}

/* ----- Plats ----- */
function viewDishes() {
  const q = h('input', { type: 'search', placeholder: 'Chercher un plat…', value: dishQuery, autocomplete: 'off' });
  const info = h('p', { class: 'cap', style: 'margin-top:8px' }), list = h('div', {});
  const draw = () => {
    const f = norm(dishQuery), ds = S.dishes.filter(d => norm(d.name).includes(f)).sort(byName);
    info.textContent = f ? ds.length + (ds.length > 1 ? ' plats trouvés' : ' plat trouvé') : '';
    list.replaceChildren(...(ds.length ? ds.map(d => h('button', { class: 'pick', onclick: () => dishSheet(d) }, d.name, h('small', {}, d.ingredients.length + ' ingrédient' + (d.ingredients.length > 1 ? 's' : ''))))
      : [h('p', { class: 'hint' }, S.dishes.length ? 'Aucun plat trouvé.' : 'Aucun plat pour l’instant. Créez-en un avec ses ingrédients : vous pourrez le réutiliser chaque semaine.')]));
  };
  q.addEventListener('input', () => { dishQuery = q.value; draw(); }); draw();
  return page('Mes plats', h('div', { class: 'searchrow' }, q, h('button', { class: 'btn plus', onclick: () => dishSheet(null), 'aria-label': 'Ajouter un plat' }, ic('plus', 24))), info, list, h('button', { class: 'btn', onclick: () => dishSheet(null) }, '+ Nouveau plat'));
}

function dishSheet(dish, onSaved) {
  openSheet((sh, close) => {
    const d = dish ? JSON.parse(JSON.stringify(dish)) : { id: uid(), name: '', ingredients: [] };
    if (!d.ingredients.length) d.ingredients.push({ name: '', qty: null, unit: '' });
    const nameI = h('input', { type: 'text', value: d.name, placeholder: 'Nom du plat (ex. : Gratin de courgettes)', autocomplete: 'off' });
    const warn = h('div', {}), saveBtn = h('button', { class: 'btn', style: 'margin-top:14px' }, 'Enregistrer');
    let dup = null;
    const checkDup = () => {
      dup = similarDish(nameI.value, d.id);
      warn.replaceChildren(...(dup ? [h('div', { class: 'warn' }, ic('triangle-alert', 18), ' Un plat ressemble à celui-ci : ', h('b', {}, dup.name), h('br'),
        h('button', { onclick: () => { const t = dup; close(); dishSheet(t); } }, 'Ouvrir ce plat →'))] : []));
      saveBtn.textContent = dup ? 'Enregistrer quand même' : 'Enregistrer';
    };
    nameI.addEventListener('input', checkDup); checkDup();
    const rows = h('div', {});
    const draw = () => rows.replaceChildren(...d.ingredients.map(g => {
      const n = h('input', { type: 'text', value: g.name, placeholder: 'Ingrédient', list: 'names', autocomplete: 'off', oninput: e => { g.name = e.target.value; } });
      const qi = h('input', { type: 'text', inputmode: 'decimal', value: g.qty == null ? '' : fmtNum(g.qty), placeholder: 'Qté', 'aria-label': 'Quantité', oninput: e => { g.qty = parseQty(e.target.value); } });
      const u = unitSelect(g.unit); u.addEventListener('change', () => { g.unit = u.value; });
      return h('div', { class: 'ing' }, n, qi, u, h('button', { class: 'x', 'aria-label': 'Retirer', onclick: () => { d.ingredients = d.ingredients.filter(x => x !== g); if (!d.ingredients.length) d.ingredients.push({ name: '', qty: null, unit: '' }); draw(); } }, ic('x', 18)));
    }));
    draw();
    saveBtn.addEventListener('click', () => {
      d.name = nameI.value.trim(); if (!d.name) { nameI.focus(); toast('Donnez un nom au plat'); return; }
      d.ingredients = d.ingredients.filter(g => g.name.trim()).map(g => ({ name: g.name.trim(), qty: g.qty, unit: g.unit || '' }));
      const i = S.dishes.findIndex(x => x.id === d.id); if (i >= 0) S.dishes[i] = d; else S.dishes.push(d);
      save(); close(); render(); if (onSaved) onSaved(d);
    });
    const del = h('button', { class: 'btn danger', onclick: () => {
      if (del.dataset.sure !== '1') { del.dataset.sure = '1'; del.textContent = 'Confirmer la suppression'; return; }
      S.dishes = S.dishes.filter(x => x.id !== d.id);
      for (const k of Object.keys(S.plan)) { S.plan[k].forEach(m => { m.parts = m.parts.filter(p => !(p.t === 'dish' && p.id === d.id)); }); S.plan[k] = S.plan[k].filter(m => m.parts.length); if (!S.plan[k].length) delete S.plan[k]; }
      save(); close(); render();
    } }, 'Supprimer ce plat');
    sh.append(h('h2', {}, dish ? 'Modifier le plat' : 'Nouveau plat'), nameI, warn, h('div', { class: 'sec', style: 'margin-left:0' }, 'Ingrédients'), rows,
      h('button', { class: 'btn ghost', onclick: () => { d.ingredients.push({ name: '', qty: null, unit: '' }); draw(); const all = rows.querySelectorAll('input[list]'); all[all.length - 1].focus(); } }, '+ Ingrédient'),
      saveBtn, ...(dish ? [del] : []), h('button', { class: 'btn link', onclick: close }, 'Annuler'));
    if (!dish) setTimeout(() => nameI.focus(), 50);
  });
}

/* ----- Réglages ----- */
function customDot() {
  const on = S.prefs.theme === 'perso';
  const inp = h('input', { type: 'color', value: S.prefs.custom || '#7B5EA7', 'aria-label': 'Choisir une couleur',
    oninput: e => { S.prefs.theme = 'perso'; S.prefs.custom = e.target.value; applyPrefs(); },
    onchange: e => { S.prefs.theme = 'perso'; S.prefs.custom = e.target.value; save(); applyPrefs(); render(); } });
  return h('label', { class: 'dot-custom' + (on ? ' on' : ''), style: on ? 'background:linear-gradient(135deg,' + themeOf(S.prefs).b1 + ',' + themeOf(S.prefs).b2 + ')' : '' }, inp);
}
function viewSettings() {
  const last = S.lastBackup ? cap1(new Date(S.lastBackup + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })) : 'aucune';
  const ranked = Object.values(S.stats).filter(st => st.pos != null).length;
  const reset = h('button', { class: 'btn ghost', onclick: () => {
    if (reset.dataset.sure !== '1') { reset.dataset.sure = '1'; reset.textContent = 'Confirmer la réinitialisation'; return; }
    Object.values(S.stats).forEach(st => { st.pos = null; st.npos = 0; }); S.sessions = 0; save(); render(); toast('Ordre du magasin réinitialisé');
  } }, 'Réinitialiser l’ordre');
  return page('Réglages',
    h('div', { class: 'card' }, h('h2', {}, 'Sauvegarde'),
      h('p', { class: 'hint' }, 'Une sauvegarde est enregistrée automatiquement tous les 7 jours (à la première utilisation, si vous avez modifié quelque chose), dans le dossier Téléchargements. Vous pouvez aussi la faire à la main à tout moment.'),
      h('p', {}, 'Dernière sauvegarde : ', h('b', {}, last)),
      isDirty() ? h('p', { class: 'unsaved' }, ic('triangle-alert', 18), ' Des modifications ne sont pas encore sauvegardées. Touchez « Sauvegarder maintenant » avant de nettoyer le navigateur.') : h('p', { class: 'hint' }, 'Tout est sauvegardé.'),
      h('button', { class: 'btn', onclick: () => doBackup(true) }, 'Sauvegarder maintenant'),
      restoreButton('Restaurer une sauvegarde', 'ghost', true),
      h('p', { class: 'hint', style: 'margin-top:12px' }, 'Après avoir nettoyé le navigateur, touchez « Restaurer » et choisissez le fichier le plus récent.')),
    h('div', { class: 'card' }, h('h2', {}, 'Liste de courses'),
      h('div', { class: 'hint' }, 'Place de la ligne d’ajout et des produits habituels'),
      h('div', { class: 'sizes' }, [['En haut', false], ['En bas', true]].map(([lab, v]) => h('button', { class: !!S.prefs.addBottom === v ? 'on' : '', onclick: () => { S.prefs.addBottom = v; save(); render(); } }, lab)))),
    h('div', { class: 'card' }, h('h2', {}, 'Apparence'),
      h('div', { class: 'hint' }, 'Taille du texte'),
      h('div', { class: 'sizes' }, [14, 17, 21].map((px, i) => h('button', { class: S.prefs.size === i ? 'on' : '', style: 'font-size:' + px + 'px', 'aria-label': 'Taille ' + (i + 1), onclick: () => { S.prefs.size = i; save(); applyPrefs(); render(); } }, 'A'))),
      h('div', { class: 'hint' }, 'Couleur'),
      h('div', { class: 'dots' }, Object.keys(THEMES).map(k => h('button', { class: S.prefs.theme === k ? 'on' : '', style: 'background:linear-gradient(135deg,' + THEMES[k].b1 + ',' + THEMES[k].b2 + ')', 'aria-label': k, onclick: () => { S.prefs.theme = k; save(); applyPrefs(); render(); } })), customDot()),
      h('p', { class: 'hint', style: 'margin:8px 0 0' }, 'La dernière pastille ouvre un sélecteur : choisissez la couleur de votre choix.')),
    h('div', { class: 'card' }, h('h2', {}, 'Ordre du magasin'),
      h('p', { class: 'hint' }, S.sessions ? 'Appris sur ' + S.sessions + ' sortie' + (S.sessions > 1 ? 's' : '') + ' · ' + ranked + ' produit' + (ranked > 1 ? 's' : '') + ' classé' + (ranked > 1 ? 's' : '') : 'Pas encore appris : cochez vos articles au fil du magasin, puis touchez « Terminer les courses ».'),
      S.sessions ? reset : null),
    h('p', { class: 'hint', style: 'text-align:center' }, 'Mes courses · version ' + VERSION));
}

/* ---------- Démarrage ---------- */
applyPrefs();
render();
document.addEventListener('visibilitychange', () => { if (!document.hidden) armAutoBackup(); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  // Quand une nouvelle version prend le relais, on recharge la page (ou on propose de le faire).
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return; // première installation : rien à recharger
    const typing = document.activeElement && document.activeElement.matches && document.activeElement.matches('input,select');
    if (!sheetStack.length && !typing) location.reload();
    else toast('Nouvelle version disponible', 'Actualiser', () => location.reload());
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
