/**
 * Social media pack generator — Scorpius Search
 * Clean cream composition. Content on the RIGHT (LinkedIn profile-pic safe).
 * No decorative graphics — minimal editorial.
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const INK      = '#0A0A0C';
const CREAM    = '#F5F4EF';
const CREAM_DK = '#E8E5DC';
const RED      = '#C8362A';
const MUTED    = '#6E6E72';

const TAGLINE = 'A GROUP OF SEARCH FIRMS';
const DIRECTORY = '01 SCORPIUS STAFFING    ·    02 SCORPIUS LEADS    ·    03 ARGUSHAUS';

const wordmarkSvg = fs.readFileSync(path.join(__dirname, 'scorpius-search-wordmark.svg'), 'utf8');
const m = wordmarkSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
const [, vb, innerOriginal] = m;
const [, , vw, vh] = vb.split(' ').map(Number);

/* Banner: cream gradient, wordmark center-right, content on the right */
function banner({ width, height, wordmarkW, centerX, taglineSize, headerSize, showDirectory = true, showFooter = true, showHeader = true }) {
  const scale = wordmarkW / vw;
  const wordmarkH = vh * scale;
  const tagSize = taglineSize || Math.max(15, Math.round(width / 75));
  const hdrSize = headerSize  || Math.max(11, Math.round(width / 130));
  const ftrSize = Math.max(10, Math.round(width / 140));

  const wmX = centerX - wordmarkW / 2;
  const wmY = (height - wordmarkH) / 2 - tagSize * 0.4;
  const tagY = wmY + wordmarkH + tagSize * 2.0;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${CREAM_DK}"/>
      <stop offset="60%" stop-color="${CREAM}"/>
      <stop offset="100%" stop-color="${CREAM}"/>
    </linearGradient>
  </defs>`;
  svg += `<rect width="${width}" height="${height}" fill="url(#bg)"/>`;

  // Wordmark
  svg += `<g transform="translate(${wmX}, ${wmY}) scale(${scale})">${innerOriginal}</g>`;

  // Tagline
  svg += `<text x="${centerX}" y="${tagY}" font-family="Inter, Helvetica, sans-serif" font-size="${tagSize}" font-weight="500" fill="${INK}" opacity="0.6" letter-spacing="5" text-anchor="middle">${TAGLINE}</text>`;

  // Top right — EST. 2022
  if (showHeader) {
    const hdrX = width - Math.round(width * 0.025);
    const hdrY = Math.round(height * 0.22);
    svg += `<text x="${hdrX}" y="${hdrY}" font-family="JetBrains Mono, Menlo, monospace" font-size="${hdrSize}" font-weight="500" fill="${INK}" letter-spacing="2.5" opacity="0.65" text-anchor="end">EST. 2022</text>`;
  }

  // Bottom — directory (centered around wordmark column)
  if (showDirectory) {
    const dirY = height - Math.round(height * 0.13);
    const dirSize = Math.max(11, Math.round(width / 140));
    svg += `<text x="${centerX}" y="${dirY}" font-family="JetBrains Mono, Menlo, monospace" font-size="${dirSize}" font-weight="500" fill="${INK}" opacity="0.55" letter-spacing="2" text-anchor="middle">${DIRECTORY}</text>`;
  }

  // URL — bottom right
  if (showFooter) {
    const ftrX = width - Math.round(width * 0.025);
    const ftrY = height - Math.round(height * 0.13);
    svg += `<text x="${ftrX}" y="${ftrY}" font-family="JetBrains Mono, Menlo, monospace" font-size="${ftrSize}" font-weight="400" fill="${INK}" opacity="0.45" letter-spacing="1.5" text-anchor="end">SCORPIUSSEARCH.COM</text>`;
  }

  svg += '</svg>';
  return svg;
}

/* Centered formats (IG, YouTube) — minimal cream */
function centered({ width, height, wordmarkW, taglineSize }) {
  const scale = wordmarkW / vw;
  const wordmarkH = vh * scale;
  const tagSize = taglineSize || Math.max(18, Math.round(width / 60));
  const subS    = Math.max(12, Math.round(width / 90));

  const wmX = (width - wordmarkW) / 2;
  const wmY = (height - wordmarkH) / 2 - tagSize * 0.4;
  const tagY = wmY + wordmarkH + tagSize * 1.8;
  const dirY = tagY + subS * 2.4;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${CREAM}"/>
      <stop offset="100%" stop-color="${CREAM_DK}"/>
    </linearGradient>
  </defs>`;
  svg += `<rect width="${width}" height="${height}" fill="url(#bg)"/>`;

  const hdrSize = Math.max(11, Math.round(width / 90));
  svg += `<text x="${width/2}" y="${Math.round(height * 0.10)}" font-family="JetBrains Mono, Menlo, monospace" font-size="${hdrSize}" font-weight="500" fill="${INK}" letter-spacing="3" text-anchor="middle" opacity="0.65">EST. 2022</text>`;

  svg += `<g transform="translate(${wmX}, ${wmY}) scale(${scale})">${innerOriginal}</g>`;

  svg += `<text x="${width/2}" y="${tagY}" font-family="Inter, Helvetica, sans-serif" font-size="${tagSize}" font-weight="500" fill="${INK}" opacity="0.7" letter-spacing="5" text-anchor="middle">${TAGLINE}</text>`;

  svg += `<text x="${width/2}" y="${dirY}" font-family="JetBrains Mono, Menlo, monospace" font-size="${subS}" font-weight="500" fill="${INK}" opacity="0.55" letter-spacing="2" text-anchor="middle">${DIRECTORY}</text>`;

  const ftrSize = Math.max(10, Math.round(width / 100));
  svg += `<text x="${width/2}" y="${height - Math.round(height * 0.07)}" font-family="JetBrains Mono, Menlo, monospace" font-size="${ftrSize}" font-weight="400" fill="${INK}" opacity="0.45" letter-spacing="2" text-anchor="middle">SCORPIUSSEARCH.COM</text>`;

  svg += '</svg>';
  return svg;
}

function emailSig({ width, height }) {
  const wordmarkW = 360;
  const scale = wordmarkW / vw;
  const wordmarkH = vh * scale;
  const tagSize = 13;
  const blockH = wordmarkH + tagSize + 12;
  const blockTop = (height - blockH) / 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<g transform="translate(0, ${blockTop}) scale(${scale})">${innerOriginal}</g>`;
  svg += `<text x="0" y="${blockTop + wordmarkH + 16}" font-family="Inter, Helvetica, sans-serif" font-size="${tagSize}" font-weight="500" fill="${MUTED}" letter-spacing="2">${TAGLINE}</text>`;
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

render(banner({ width: 1584, height: 396, wordmarkW: 520, centerX: 1100 }), `${outDir}/linkedin-banner-1584x396.png`);
render(banner({ width: 1584, height: 396, wordmarkW: 520, centerX: 1100, showDirectory: false, showFooter: false }), `${outDir}/linkedin-personal-banner-1584x396.png`);
render(banner({ width: 1500, height: 500, wordmarkW: 540, centerX: 1050 }), `${outDir}/x-header-1500x500.png`);
render(centered({ width: 1080, height: 1080, wordmarkW: 720 }), `${outDir}/instagram-post-1080x1080.png`);
render(centered({ width: 1080, height: 1920, wordmarkW: 760 }), `${outDir}/instagram-story-1080x1920.png`);
render(centered({ width: 2560, height: 1440, wordmarkW: 1000 }), `${outDir}/youtube-banner-2560x1440.png`);
render(banner({ width: 1284, height: 540, wordmarkW: 460, centerX: 642 }), `${outDir}/whatsapp-business-cover-1284x540.png`);
render(emailSig({ width: 600, height: 150 }), `${outDir}/email-signature-transparent.png`);

console.log('\n✓ Scorpius Search social pack done.');
