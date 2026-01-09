import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'favicon-192x192.png' },
  { size: 512, name: 'favicon-512x512.png' },
];

async function generateFavicons() {
  const svgPath = join(publicDir, 'favicon.svg');
  const svg = readFileSync(svgPath);

  console.log('Generating favicon PNGs...');

  for (const { size, name } of sizes) {
    const outputPath = join(publicDir, name);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: ${name} (${size}x${size})`);
  }

  console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error);
