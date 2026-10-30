import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../extension/icons');
const storeAssetsDir = path.resolve(__dirname, '../store-assets');

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

// SVG for 440x280 small promo tile
const promoSvgBuffer = Buffer.from(`
<svg width="440" height="280" viewBox="0 0 440 280" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="440" height="280" rx="16" fill="#0b1120"/>
  <!-- Decorative grid lines & gradients -->
  <defs>
    <linearGradient id="pgrad" x1="40" y1="40" x2="200" y2="240" gradientUnits="userSpaceOnUse">
      <stop stop-color="#059669"/>
      <stop offset="1" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0b1120" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="110" cy="140" r="100" fill="url(#glow)"/>
  
  <!-- Shield Icon -->
  <g transform="translate(46, 76) scale(0.5)">
    <rect width="256" height="256" rx="56" fill="#0f172a" stroke="#1e293b" stroke-width="4"/>
    <path d="M128 36L196 66V130C196 172 167 207 128 220C89 207 60 172 60 130V66L128 36Z" fill="url(#pgrad)" stroke="#10b981" stroke-width="8"/>
    <path d="M104 128L122 146L158 106" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="196" cy="196" r="22" fill="#06b6d4" stroke="#ffffff" stroke-width="6"/>
  </g>
  
  <!-- Title & Subtitle -->
  <text x="200" y="115" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">TruthGuard</text>
  <text x="200" y="148" fill="#10b981" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="600">事实检察官</text>
  <text x="200" y="185" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">基于腾讯元宝搜索 · 多源事实核验</text>
  <text x="200" y="208" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12">网页划词秒查 | 全流程过程树 | 仲裁报告</text>
</svg>
`);

async function generate() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(storeAssetsDir)) {
    fs.mkdirSync(storeAssetsDir, { recursive: true });
  }

  // 1. Extension icons: 16, 32, 48, 128, 300
  const sizes = [16, 32, 48, 128, 300];
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${outputPath}`);
  }

  // 2. Microsoft Edge Store Logo (300x300 mandatory)
  const storeLogoPath = path.join(storeAssetsDir, 'store-logo-300x300.png');
  await sharp(svgBuffer)
    .resize(300, 300)
    .png()
    .toFile(storeLogoPath);
  console.log(`Generated Store Logo: ${storeLogoPath}`);

  // 3. Microsoft Edge Store Small Promotional Tile (440x280)
  const promoTilePath = path.join(storeAssetsDir, 'small-promo-440x280.png');
  await sharp(promoSvgBuffer)
    .resize(440, 280)
    .png()
    .toFile(promoTilePath);
  console.log(`Generated Promo Tile: ${promoTilePath}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});

