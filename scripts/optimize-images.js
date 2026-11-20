// Converte as imagens exportadas do Figma para WebP otimizado.
// Originais ficam em public/img/_src (ignorado no git).
import sharp from 'sharp';
import { mkdir, rename, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/img');
const src = path.join(root, '_src');
await mkdir(src, { recursive: true });

const jobs = [
  ['hero.png', 'hero.webp', 2400, 78],
  ['cta.png', 'cta.webp', 2400, 72],
  ['paris.png', 'paris.webp', 900, 80],
  ['dubai.png', 'dubai.webp', 900, 80],
  ['maldivas.png', 'maldivas.webp', 900, 80],
  ['avatar-1.png', 'avatar-1.webp', 96, 85],
  ['avatar-2.png', 'avatar-2.webp', 96, 85],
  ['avatar-3.png', 'avatar-3.webp', 96, 85],
  ['partners/raw1.jpg', 'partners/four-seasons.webp', 1200, 78],
  ['partners/raw5.jpg', 'partners/ritz-carlton.webp', 1000, 78],
  ['partners/raw4.jpg', 'partners/mandarin.webp', 1000, 78],
];

const exists = (p) => access(p).then(() => true).catch(() => false);

for (const [inName, outName, width, quality] of jobs) {
  const original = path.join(src, inName.replace('/', '__'));
  const input = path.join(root, inName);
  if (await exists(input)) await rename(input, original);
  if (!(await exists(original))) { console.warn('skip', inName); continue; }
  await sharp(original).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(path.join(root, outName));
  console.log('ok', outName);
}
