'use strict';
/* ===== Import de recettes depuis un export de notes =====
   Lit un fichier JSON [{ titre, texte }, …] et en tire, pour chaque note,
   le nom du plat et la liste de ses ingrédients (nom, quantité, unité). */

const RC_END = '(?![A-Za-zÀ-ÿŒœ])'; // fin de mot (le \b de JavaScript ignore les lettres accentuées)
const RC_STOP_HEAD = /pr[ée]pa|instruction|method|[ée]tape|r[ée]alisation|variation|info|temps|comment|conseil|astuce|pourquoi|utilisez|choisissez|combien|meilleur|particularit/i;
const RC_SKIP_WORDS = new Set(['sel', 'poivre', 'eau', 'et', 'au', 'goût', 'gout', 'pincée', 'pincee', 'de', 'salt', 'and', 'black', 'pepper', 'water']);
const rcSkippable = n => n.toLowerCase().split(/[\s\/,&]+/).filter(Boolean).every(w => RC_SKIP_WORDS.has(w));
const RC_FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

// unités reconnues : [expression, unité de l'application]
const RC_UNITS = [
  ['kilos?|kg', 'kg'], ['gr?|grammes?', 'g'], ['ml', 'ml'], ['cl', 'cl'], ['litres?|l', 'l'],
  ['bouquets?|bottes?', 'bouquet'], ['bo[iî]tes?', 'boîte'], ['sachets?', 'sachet'],
  ['paquets?', 'paquet'], ['pots?', 'pot'], ['tranches?', 'tranche']
].map(([re, u]) => [new RegExp('^(' + re + ')' + RC_END, 'i'), u]);

// mesures sans intérêt pour une liste de courses (cuillères, tasses, gousses…) : on garde l'ingrédient, sans quantité
const RC_SPOON = new RegExp('^(c\\.?\\s*[àa]\\.?\\s*(soupe|caf[ée]|s|c)|cuil(?:l[èe]res?)?\\.?(-|\\s*)([àa](-|\\s*))?(soupe|caf[ée])?|mugs?|c-?[àa]-?(soupe|caf[ée]|s|c)|cs|cc|c[àa][sc]|tbsp|tsp|cups?|tasses?|poign[ée]es?|pinc[ée]es?|verres?|gousses?|cm)' + RC_END + '\\.?\\s*', 'i');

function rcNum(s) {
  s = s.trim();
  let m;
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
  if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔])$/))) return +m[1] + RC_FRAC[m[2]];
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
  if (RC_FRAC[s]) return RC_FRAC[s];
  const n = parseFloat(s.replace(',', '.'));
  return isFinite(n) ? n : null;
}

function rcClean(s) {
  return s
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}\u{23E9}-\u{23FF}]/gu, '') // émojis
    .replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

// Nettoie le nom : remarques, alternatives, article initial
function rcName(s) {
  s = s.replace(/\s+ou\s+.*$/i, '').replace(/\s\/\s.*$/, '').replace(/\s[-–>]\s.*$/, '').replace(/\s*[:;].*$/, '').replace(/,.*$/, '').trim();
  for (let i = 0; i < 3; i++) s = s.replace(/^(de la |de l['’]|du |des |de |d['’]|un peu de |un peu d['’]|une? |la |le |les |l['’]|m[ée]lange (de |d['’])?)/i, '').trim();
  s = s.replace(/\s+si\s+.*$/i, '').replace(/\s*[-–]\s*$/, '');
  s = s.replace(/[.,;:]+$/, '').trim();
  if (/^ails?$/i.test(s)) s = 'ail';
  return s;
}

// Analyse une ligne d'ingrédient → liste de { name, qty, unit }
function rcParseLine(raw) {
  let s = rcClean(raw).replace(/^[-•*]\s*/, '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s || /^(pour |http|\/)/i.test(s) || /^\d+\s*(pers|personnes)/i.test(s)) return [];
  // « 1 boîte … + 1 boîte … » : deux ingrédients
  const plus = s.split(/\s\+\s/);
  if (plus.length > 1) return plus.flatMap(rcParseLine);
  // listes sans quantité : « Huile d'olive, poivre et sel »
  if (!/^[\d½¼¾]/.test(s) && !/\sx\s?\d/i.test(s) && /,|\set\s|\s&\s/.test(s) && s.split(/\s+/).length <= 9) {
    const bits = s.split(/\s*,\s*|\s+et\s+|\s+&\s+/).map(t => t.trim()).filter(Boolean);
    if (bits.length > 1 && bits.every(b => b.split(/\s+/).length <= 4)) return bits.flatMap(rcParseLine);
  }
  let qty = null, unit = '', name = s, m;

  if ((m = s.match(/^(.+?)\s+x\s?(\d+(?:[.,]\d+)?)\s*(.*)$/i))) { // « Pain de mie x10 tranches »
    name = m[1]; qty = rcNum(m[2]);
    const u = RC_UNITS.find(([re]) => re.test(m[3])); if (u) unit = u[1];
  } else if (!/^[\d½¼¾]/.test(s) && (m = s.match(/^([A-Za-zÀ-ÿŒœ'’ -]+?)\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|filet)?$/i))) { // « Parmesan râpé 30 g »
    name = m[1].replace(/\s+de$/i, ''); qty = rcNum(m[2]);
    if (m[3] && m[3].toLowerCase() !== 'filet') unit = RC_UNITS.find(([re]) => re.test(m[3]))[1];
    if (m[3] && m[3].toLowerCase() === 'filet') qty = null;
  } else if ((m = s.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔])\s*(?:(?:[-–]|\s?à\s)\s*\d+(?:[.,]\d+)?\s*)?(.*)$/))) { // « 250g de », « 1 1/2 », « 3-4 », « 4 à 5 »
    qty = rcNum(m[1]);
    let rest = m[2].trim().replace(/^x\s*x+g?\s+(de\s+)?/i, '');
    const u = RC_UNITS.find(([re]) => re.test(rest));
    if (RC_SPOON.test(rest)) { qty = null; rest = rest.replace(RC_SPOON, '').trim(); }
    else if (u) {
      unit = u[1]; rest = rest.replace(u[0], '').trim();
      rest = rest.replace(/^\/\s*\d+(?:[.,]\d+)?\s*[A-Za-zÀ-ÿ]*\s*/, ''); // « 600 g/1,5 boîtes »
      rest = rest.replace(/^de\s+\d+(?:[.,]\d+)?\s*(g|kg|ml|cl|l)\s*/i, ''); // « 1 boîte de 400 g de tomates »
      if (/^et demie?\b/i.test(rest)) { qty += 0.5; rest = rest.replace(/^et demie?\s*/i, ''); }
    }
    name = rest;
  }

  // « Gruyère à râper de 200g »
  if (qty == null && (m = name.match(/^(.+?)\s+de\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l)$/i))) { name = m[1]; qty = rcNum(m[2]); unit = RC_UNITS.find(([re]) => re.test(m[3]))[1]; }

  name = rcName(name);
  if (!name || name.length < 2 || name.split(/\s+/).length > 9 || rcSkippable(name)) return [];
  name = name.charAt(0).toUpperCase() + name.slice(1);
  if (qty != null) qty = qty > 0 ? Math.round(qty * 100) / 100 : null;
  if (qty == null) unit = '';
  return [{ name, qty, unit }];
}

// Extrait les lignes d'ingrédients d'une note
function rcExtract(texte) {
  const text = String(texte || '').replace(/\r/g, '').replace(/^([ \t]*-[ \t]*)\n[ \t]*/gm, '$1');
  const lines = text.split('\n');
  const isHead = l => /^\s*#{1,6}\s/.test(l);
  const headIng = l => {
    const t = l.replace(/^\s*#+\s*/, '');
    return !/^(le choix|comment|combien|pourquoi)/i.test(t) && /ingr[ée]dients?|zutaten|personnes\s*:?$/i.test(t);
  };
  const got = [];
  let on = false, found = false;
  for (const l of lines) {
    if (isHead(l)) {
      if (headIng(l)) { on = true; found = true; }
      else if (on && RC_STOP_HEAD.test(l)) on = false;
      continue; // les autres sous-titres (« Base aromatique »…) ne changent rien
    }
    if (on && /^\s*[-•*]\s*\S/.test(l)) got.push(l);
  }
  if (!found) { // pas d'en-tête : liste à puces en tête de note
    let started = false;
    for (const l of lines) {
      if (/^\s*[-•*]\s*\S/.test(l)) { if (started && /pr[ée]paration/i.test(l)) break; got.push(l); started = true; }
      else if (started && !/^\s*$/.test(l)) break;
      else if (!started && isHead(l)) break;
    }
    if (got.length < 3 || !got.some(l => /^\s*[-•*]\s*\d/.test(l))) got.length = 0;
  }
  return got;
}

// Fichier complet → [{ name, ingredients: [{ name, qty, unit }] }]
function rcParse(data) {
  const arr = Array.isArray(data) ? data : (data && Array.isArray(data.notes) ? data.notes : null);
  if (!arr) throw new Error('format');
  const seen = new Set(), out = [];
  for (const n of arr) {
    if (!n || typeof n.titre !== 'string') continue;
    const name = rcClean(n.titre).replace(/\s*[:|–-]\s*la recette.*$/i, '').replace(/\.{3}$/, '').replace(/^recette\s+(?!v[ée]g[ée]tarienne)/i, '').trim();
    if (!name) continue;
    const ings = [], keys = new Set();
    for (const l of rcExtract(n.texte)) for (const g of rcParseLine(l)) {
      const k = g.name.toLowerCase() + '|' + g.unit;
      if (keys.has(k)) continue; keys.add(k); ings.push(g);
    }
    const id = name.toLowerCase();
    if (seen.has(id)) continue; seen.add(id);
    out.push({ name: name.charAt(0).toUpperCase() + name.slice(1), ingredients: ings });
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { rcParse, rcParseLine, rcExtract };
