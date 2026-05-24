/**
 * Social media pack generator — Scorpius Search
 * RIGHT-aligned for LinkedIn/X, centered for IG/YouTube
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const INK   = '#0A0A0C';
const BLACK = '#000000';
const CREAM = '#F5F4EF';
const RED   = '#C8362A';

const TAGLINE = 'A GROUP OF RECRUITMENT FIRMS';
const SUBTAG  = 'SCORPIUS STAFFING · SCORPIUS LEADS · ARGUSHAUS';

const wordmarkSvg = fs.readFileSync(path.join(__dirname, 'scorpius-search-wordmark.svg'), 'utf8');
const m = wordmarkSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
const [, vb, innerOriginal] = m;
const [, , vw, vh] = vb.split(' ').map(Number);
const innerLight = innerOriginal.replace(/fill="#0A0A0C"/g, `fill="${CREAM}"`);
const innerDark  = innerOriginal;

function compose({ width, height, bg, wordmarkW, align = 'center', marginX = 80, taglineSize, taglineGap = 28, subtagGap = 14, lightWordmark = true, tagline, subtag, taglineColor }) {
  const scale = wordmarkW / vw;
  const wordmarkH = vh * scale;
  const tagSize = taglineSize || Math.max(14, Math.round(width / 80));
  const subSize = Math.max(11, Math.round(width / 130));

  let blockH = wordmarkH;
  if (tagline) blockH += taglineGap + tagSize;
  if (subtag)  blockH += subtagGap  + subSize;

  const blockTop = (height - blockH) / 2;
  const wmY = blockTop;
  const tagY = blockTop + wordmarkH + taglineGap + tagSize * 0.75;
  const subY = blockTop + wordmarkH + taglineGap + tagSize + subtagGap + subSize * 0.75;

  let wmX, textX, textAnchor;
  if (align === 'right') {
    wmX = width - marginX - wordmarkW;
    textX = width - marginX;
    textAnchor = 'end';
  } else if (align === 'left') {
    wmX = marginX;
    textX = marginX;
    textAnchor = 'start';
  } else {
    wmX = (width - wordmarkW) / 2;
    textX = width / 2;
    textAnchor = 'middle';
  }

  const inner = lightWordmark ? innerLight : innerDark;
  const tagColor = taglineColor || CREAM;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  if (bg) svg += `<rect width="${width}" height="${height}" fill="${bg}"/>`;
  svg += `<g transform="translate(${wmX}, ${wmY}) scale(${scale})">${inner}</g>`;
  if (tagline) {
    svg += `<text x="${textX}" y="${tagY}" font-family="Inter, Helvetica, sans-serif" font-size="${tagSize}" font-weight="500" fill="${tagColor}" opacity="0.7" letter-spacing="3" text-anchor="${textAnchor}">${tagline}</text>`;
  }
  if (subtag) {
    svg += `<text x="${textX}" y="${subY}" font-family="Inter, Helvetica, sans-serif" font-size="${subSize}" font-weight="400" fill="${tagColor}" opacity="0.5" letter-spacing="2" text-anchor="${textAnchor}">${subtag}</text>`;
  }
  svg += '</svg>';
  return svg;
}

function render(svg, outPath) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'original' } });
  fs.writeFileSync(path.join(__dirname, outPath), resvg.render().asPng());
  console.log(`✓ ${outPath}`);
}

const outDir = 'png/social';
fs.mkdirSync(path.join(__dirname, outDir), { recursive: true });

render(compose({ width: 1584, height: 396, bg: BLACK, wordmarkW: 600, align: 'right', marginX: 100, tagline: TAGLINE, subtag: SUBTAG }), `${outDir}/linkedin-banner-1584x396.png`);
render(compose({ width: 1128, height: 191, bg: BLACK, wordmarkW: 380, align: 'right', marginX: 70, tagline: TAGLINE, taglineGap: 18 }), `${outDir}/linkedin-personal-banner-1128x191.png`);
render(compose({ width: 1500, height: 500, bg: BLACK, wordmarkW: 600, align: 'right', marginX: 100, tagline: TAGLINE, subtag: SUBTAG }), `${outDir}/x-header-1500x500.png`);
render(compose({ width: 1080, height: 1080, bg: BLACK, wordmarkW: 750, align: 'center', tagline: TAGLINE, subtag: SUBTAG, taglineGap: 50, subtagGap: 18 }), `${outDir}/instagram-post-1080x1080.png`);
render(compose({ width: 1080, height: 1920, bg: BLACK, wordmarkW: 800, align: 'center', tagline: TAGLINE, subtag: SUBTAG, taglineGap: 70, subtagGap: 22 }), `${outDir}/instagram-story-1080x1920.png`);
render(compose({ width: 2560, height: 1440, bg: BLACK, wordmarkW: 1000, align: 'center', tagline: TAGLINE, subtag: SUBTAG, taglineGap: 80, subtagGap: 26 }), `${outDir}/youtube-banner-2560x1440.png`);
render(compose({ width: 600, height: 150, bg: null, wordmarkW: 380, align: 'left', marginX: 0, lightWordmark: false, tagline: TAGLINE, taglineGap: 16, taglineColor: '#6E6E72' }), `${outDir}/email-signature-transparent.png`);

console.log('\n✓ Scorpius Search social pack done.');
