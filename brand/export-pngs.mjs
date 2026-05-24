import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const list = [
  { src: 'scorpius-search-stacked-on-white.svg', out: 'png/scorpius-search-stacked-400.png', width: 400 },
  { src: 'scorpius-search-stacked-on-white.svg', out: 'png/scorpius-search-stacked-1080.png', width: 1080 },
  { src: 'scorpius-search-stacked-on-black.svg', out: 'png/scorpius-search-stacked-black-1080.png', width: 1080 },
  { src: 'scorpius-search-wordmark.svg',         out: 'png/scorpius-search-wordmark-2000.png', width: 2000 },
  { src: 'scorpius-search-wordmark-on-white.svg', out: 'png/scorpius-search-wordmark-on-white-2000.png', width: 2000 },
  { src: 'scorpius-search-wordmark-on-black.svg', out: 'png/scorpius-search-wordmark-on-black-2000.png', width: 2000 },
  { src: 'scorpius-search-favicon.svg',          out: 'png/favicon-32.png', width: 32 },
  { src: 'scorpius-search-favicon.svg',          out: 'png/favicon-180.png', width: 180 },
];

function buildOgSvg() {
  const wm = fs.readFileSync(path.join(__dirname, 'scorpius-search-wordmark.svg'), 'utf8');
  const m = wm.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
  const [, vb, inner] = m;
  const [, , vw, vh] = vb.split(' ').map(Number);
  const lightInner = inner.replace(/fill="#0A0A0C"/g, 'fill="#F5F4EF"');
  const targetW = 900;
  const scale = targetW / vw;
  const scaledH = vh * scale;
  const offsetX = (1200 - targetW) / 2;
  const offsetY = (630 - scaledH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#000000"/>
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">${lightInner}</g>
  <text x="80" y="565" font-family="Inter, Helvetica, sans-serif" font-size="22" font-weight="500" fill="#F5F4EF" opacity="0.55" letter-spacing="3">A GROUP OF SEARCH FIRMS</text>
</svg>`;
}

fs.mkdirSync(path.join(__dirname, 'png'), { recursive: true });

for (const e of list) {
  const svg = fs.readFileSync(path.join(__dirname, e.src));
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: e.width }, background: 'rgba(0,0,0,0)' });
  fs.writeFileSync(path.join(__dirname, e.out), r.render().asPng());
  console.log(`✓ ${e.out}  ${e.width}px`);
}

{
  const og = buildOgSvg();
  fs.writeFileSync(path.join(__dirname, 'scorpius-search-og.svg'), og);
  const r = new Resvg(og, { fitTo: { mode: 'original' } });
  fs.writeFileSync(path.join(__dirname, 'png/scorpius-search-og-1200x630.png'), r.render().asPng());
  console.log('✓ png/scorpius-search-og-1200x630.png');
}
