import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../extension/icons');

const svgBuffer = Buffer.from(`
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="56" fill="#0f172a"/>
  <!-- Shield outline -->
  <path d="M128 36L196 66V130C196 172 167 207 128 220C89 207 60 172 60 130V66L128 36Z" fill="url(#grad1)" stroke="#10b981" stroke-width="8"/>
  <!-- Checkmark -->
  <path d="M104 128L122 146L158 106" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Glowing Pulse Dot -->
  <circle cx="196" cy="196" r="22" fill="#06b6d4" stroke="#ffffff" stroke-width="6"/>
  <defs>
    <linearGradient id="grad1" x1="60" y1="36" x2="196" y2="220" gradientUnits="userSpaceOnUse">
      <stop stop-color="#059669"/>
      <stop offset="1" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
</svg>
`);

async function generate() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sizes = [16, 48, 128];
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
