import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicRoot = fileURLToPath(new URL('../packages/template/public/', import.meta.url));
const samples = [
  ['portfolio-ironvale-fabrication', 'Ironvale Welding', '& Fabrication', '#f05b23'],
  ['portfolio-northmark-hvac', 'Northmark Heating', '& Air', '#147d9a'],
  ['portfolio-elderbrook-masonry', 'Elderbrook', 'Masonry', '#8d6a38'],
  ['portfolio-halcott-dental', 'Halcott', 'Dental', '#416abe'],
  ['portfolio-voltway-electric', 'Voltway', 'Electric', '#e6a928'],
];
const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#162a3c"/><text x="50" y="64" text-anchor="middle" font-family="sans-serif" font-size="46" font-weight="700" fill="#fff">SF</text></svg>';
writeFileSync(join(publicRoot, 'images/logo.svg'), logo + '\n');
writeFileSync(join(publicRoot, 'favicon.svg'), logo + '\n');
const hero = '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#121a20"/><stop offset="1" stop-color="#30404e"/></linearGradient><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#718897" stroke-opacity=".12"/></pattern><linearGradient id="shade"><stop stop-color="#0d1319" stop-opacity=".8"/><stop offset="1" stop-color="#0d1319" stop-opacity="0"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" fill="url(#grid)"/><g fill="none" stroke="#8a9ead" stroke-width="8" opacity=".6"><path d="M1100 850V320L1550 180l250 140v530z"/><path d="M1100 320l250 140 450-140M1350 460v390M1100 610l250 140 450-140"/><path d="M1520 390v420M1640 350v420" stroke="#ef6a32"/><path d="M1020 915h835M1095 940v-60M1800 940v-60" stroke-width="3"/><circle cx="1550" cy="180" r="25" stroke="#ef6a32"/><circle cx="1350" cy="460" r="25" stroke="#ef6a32"/></g><g fill="#ef6a32" opacity=".7"><circle cx="1660" cy="785" r="4"/><circle cx="1668" cy="802" r="5"/><circle cx="1649" cy="806" r="3"/><circle cx="1688" cy="775" r="4"/></g><rect width="1000" height="1080" fill="url(#shade)"/></svg>';
writeFileSync(join(publicRoot, 'images/hero.svg'), hero + '\n');
const illustrations = ['story', 'service-welding-fitting', 'service-repairs-rebuilds', 'service-precision-machining', 'service-custom-fabrication', 'gallery-1', 'gallery-2', 'gallery-3', 'gallery-4', 'gallery-5', 'gallery-6', 'og'];
for (const [index, name] of illustrations.entries()) {
  const accent = ['#f05b23','#147d9a','#8d6a38','#416abe'][index % 4];
  const illustration = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#16232e"/><path d="M0 150H1200M0 300H1200M0 450H1200M0 600H1200M0 750H1200M150 0V900M300 0V900M450 0V900M600 0V900M750 0V900M900 0V900M1050 0V900" stroke="#adc4d5" stroke-opacity=".08"/><g fill="none" stroke="#99acb8" stroke-width="12"><path d="M300 560V300L660 190l240 150v340L540 790z"/><path d="M300 300l240 150 360-110M540 450v340M300 560l240 150 360-140"/><circle cx="720" cy="440" r="90" stroke="${accent}"/><circle cx="720" cy="440" r="42" stroke="${accent}"/><path d="M195 795H975" stroke-width="3"/></g><g fill="${accent}"><circle cx="300" cy="300" r="17"/><circle cx="540" cy="450" r="17"/><circle cx="900" cy="340" r="17"/></g></svg>`;
  writeFileSync(join(publicRoot, 'images', `${name}.svg`), illustration + '\n');
}
for (const [slug, first, second, accent] of samples) {
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#101820"/><rect x="72" y="70" width="72" height="72" rx="14" fill="${accent}"/><text x="108" y="117" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="700" fill="#fff">SF</text><text x="170" y="116" font-family="sans-serif" font-size="24" fill="${accent}" letter-spacing="3">SYNTHETIC DEMONSTRATION</text><text x="72" y="300" font-family="sans-serif" font-size="70" font-weight="700" fill="#fff">${first}</text><text x="72" y="386" font-family="sans-serif" font-size="70" font-weight="700" fill="#fff">${second.replace('&','&amp;')}</text><text x="72" y="490" font-family="sans-serif" font-size="27" fill="#b5c0ca">Config-driven website • invented business • local form simulation</text><rect y="613" width="1200" height="17" fill="${accent}"/></svg>`;
  mkdirSync(join(publicRoot, 'og'), { recursive: true });
  await sharp(Buffer.from(card)).png().toFile(join(publicRoot, 'og', `${slug}.png`));
  const icons = join(publicRoot, 'icons', slug);
  mkdirSync(icons, { recursive: true });
  for (const [file, size] of [['icon-512.png',512], ['icon-192.png',192], ['favicon-32.png',32], ['apple-touch-icon.png',180]]) {
    await sharp(Buffer.from(logo)).resize(size, size).png().toFile(join(icons, file));
  }
  writeFileSync(join(icons, 'site.webmanifest'), JSON.stringify({ name: `${first} ${second} (synthetic demo)`, short_name: 'Site Factory', start_url: '/', display: 'standalone', icons: [{ src: `/icons/${slug}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `/icons/${slug}/icon-512.png`, sizes: '512x512', type: 'image/png' }] }, null, 2) + '\n');
}
console.log('Generated synthetic social cards and neutral SF icons.');
