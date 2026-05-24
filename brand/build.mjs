/**
 * Scorpius Search logo builder — Fraunces serif, BLACK (parent/holding neutral)
 * Same typographic system as Scorpius Staffing, but neutral black.
 * Wordmark "Scorpius Search." horizontal + stacked variant
 */
import opentype from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const INK       = '#0A0A0C';    // near-black (Scorpius Search neutral)
const INK_DEEP  = '#000000';    // pure black bg
const CREAM     = '#F5F4EF';
const WHITE     = '#FFFFFF';
const RED       = '#C8362A';

const font = opentype.loadSync(path.join(__dirname, 'raw/fraunces-600.ttf'));

function makePath(text, fontSize, x = 0, y = 0, letterSpacing = 0) {
  const glyphs = font.stringToGlyphs(text);
  const scale = (1 / font.unitsPerEm) * fontSize;
  let cursor = x;
  const parts = [];
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const p = g.getPath(cursor, y, fontSize);
    parts.push(p.toPathData(3));
    cursor += g.advanceWidth * scale + letterSpacing;
  }
  return { paths: parts, advanceTo: cursor };
}

function buildWordmark({ fontSize = 100 }) {
  const ls = -fontSize * 0.005;
  const baseline = fontSize * 0.78;
  const main = makePath('Scorpius Search', fontSize, 0, baseline, ls);
  const dot  = makePath('.', fontSize, main.advanceTo, baseline, ls);
  return {
    mainD: main.paths.join(' '),
    dotD:  dot.paths.join(' '),
    totalWidth: dot.advanceTo,
    totalHeight: fontSize
  };
}

function buildStacked({ fontSize = 100 }) {
  const ls = -fontSize * 0.01;
  const lineGap = fontSize * 0.06;
  const baseline1 = fontSize * 0.78;
  const baseline2 = baseline1 + fontSize + lineGap;

  const line1 = makePath('Scorpius', fontSize, 0, baseline1, ls);
  const line2Text = makePath('Search', fontSize, 0, baseline2, ls);
  const dot      = makePath('.', fontSize, line2Text.advanceTo, baseline2, ls);

  const maxW = Math.max(line1.advanceTo, dot.advanceTo);
  const totalH = fontSize + lineGap + fontSize;

  return {
    line1D: line1.paths.join(' '),
    line2D: line2Text.paths.join(' '),
    dotD:   dot.paths.join(' '),
    line1W: line1.advanceTo,
    maxWidth: maxW,
    totalHeight: totalH
  };
}

function wrapSvg({ width, height, viewBox, bg, content }) {
  const bgRect = bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">
${bgRect}
${content}
</svg>
`;
}

const out = __dirname;

/* ========== HORIZONTAL WORDMARK ========== */

// 1. Transparent (black + red dot)
{
  const fs0 = 100;
  const w = buildWordmark({ fontSize: fs0 });
  const pad = fs0 * 0.25;
  const W = w.totalWidth + pad * 2;
  const H = fs0 + pad * 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-wordmark.svg'),
    wrapSvg({ width: W, height: H, viewBox: `0 0 ${W} ${H}`,
      content: `<g transform="translate(${pad}, ${pad})"><path d="${w.mainD}" fill="${INK}"/><path d="${w.dotD}" fill="${RED}"/></g>` }));
}

// 2. On white
{
  const fs0 = 100;
  const w = buildWordmark({ fontSize: fs0 });
  const pad = fs0 * 0.5;
  const W = w.totalWidth + pad * 2;
  const H = fs0 + pad * 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-wordmark-on-white.svg'),
    wrapSvg({ width: W, height: H, viewBox: `0 0 ${W} ${H}`, bg: WHITE,
      content: `<g transform="translate(${pad}, ${pad})"><path d="${w.mainD}" fill="${INK}"/><path d="${w.dotD}" fill="${RED}"/></g>` }));
}

// 3. Light (cream + red dot) — for dark BG
{
  const fs0 = 100;
  const w = buildWordmark({ fontSize: fs0 });
  const pad = fs0 * 0.25;
  const W = w.totalWidth + pad * 2;
  const H = fs0 + pad * 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-wordmark-light.svg'),
    wrapSvg({ width: W, height: H, viewBox: `0 0 ${W} ${H}`,
      content: `<g transform="translate(${pad}, ${pad})"><path d="${w.mainD}" fill="${CREAM}"/><path d="${w.dotD}" fill="${RED}"/></g>` }));
}

// 4. On black
{
  const fs0 = 100;
  const w = buildWordmark({ fontSize: fs0 });
  const pad = fs0 * 0.5;
  const W = w.totalWidth + pad * 2;
  const H = fs0 + pad * 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-wordmark-on-black.svg'),
    wrapSvg({ width: W, height: H, viewBox: `0 0 ${W} ${H}`, bg: INK_DEEP,
      content: `<g transform="translate(${pad}, ${pad})"><path d="${w.mainD}" fill="${CREAM}"/><path d="${w.dotD}" fill="${RED}"/></g>` }));
}

/* ========== STACKED (square format) ========== */

// 5. Stacked transparent
{
  const fs0 = 120;
  const s = buildStacked({ fontSize: fs0 });
  const side = Math.max(s.maxWidth, s.totalHeight) + fs0 * 0.5;
  const xOffset = (side - s.maxWidth) / 2;
  const yOffset = (side - s.totalHeight) / 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-stacked.svg'),
    wrapSvg({ width: side, height: side, viewBox: `0 0 ${side} ${side}`,
      content: `<g transform="translate(${xOffset}, ${yOffset})"><path d="${s.line1D}" fill="${INK}"/><path d="${s.line2D}" fill="${INK}"/><path d="${s.dotD}" fill="${RED}"/></g>` }));
}

// 6. Stacked on white
{
  const fs0 = 120;
  const s = buildStacked({ fontSize: fs0 });
  const side = Math.max(s.maxWidth, s.totalHeight) + fs0 * 0.8;
  const xOffset = (side - s.maxWidth) / 2;
  const yOffset = (side - s.totalHeight) / 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-stacked-on-white.svg'),
    wrapSvg({ width: side, height: side, viewBox: `0 0 ${side} ${side}`, bg: WHITE,
      content: `<g transform="translate(${xOffset}, ${yOffset})"><path d="${s.line1D}" fill="${INK}"/><path d="${s.line2D}" fill="${INK}"/><path d="${s.dotD}" fill="${RED}"/></g>` }));
}

// 7. Stacked on black
{
  const fs0 = 120;
  const s = buildStacked({ fontSize: fs0 });
  const side = Math.max(s.maxWidth, s.totalHeight) + fs0 * 0.8;
  const xOffset = (side - s.maxWidth) / 2;
  const yOffset = (side - s.totalHeight) / 2;
  fs.writeFileSync(path.join(out, 'scorpius-search-stacked-on-black.svg'),
    wrapSvg({ width: side, height: side, viewBox: `0 0 ${side} ${side}`, bg: INK_DEEP,
      content: `<g transform="translate(${xOffset}, ${yOffset})"><path d="${s.line1D}" fill="${CREAM}"/><path d="${s.line2D}" fill="${CREAM}"/><path d="${s.dotD}" fill="${RED}"/></g>` }));
}

/* ========== FAVICON ========== */
// "S" + red dot at 32x32
{
  const fs0 = 22;
  const baseline = fs0 * 0.78;
  const mainP = makePath('S', fs0, 0, baseline, 0);
  const dotP  = makePath('.', fs0, mainP.advanceTo, baseline, 0);
  const side = 32;
  const xOffset = (side - dotP.advanceTo) / 2;
  const yOffset = (side - fs0) / 2 + 1;
  fs.writeFileSync(path.join(out, 'scorpius-search-favicon.svg'),
    wrapSvg({ width: side, height: side, viewBox: `0 0 ${side} ${side}`, bg: INK_DEEP,
      content: `<g transform="translate(${xOffset}, ${yOffset})"><path d="${mainP.paths.join(' ')}" fill="${CREAM}"/><path d="${dotP.paths.join(' ')}" fill="${RED}"/></g>` }));
}

console.log('Scorpius Search brand SVGs generated:');
fs.readdirSync(out).filter(f => f.endsWith('.svg')).forEach(f => console.log('  ' + f));
