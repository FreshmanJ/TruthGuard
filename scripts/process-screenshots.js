import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'store-assets', 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const inputImages = [
  'C:/Users/admin/.gemini/antigravity/brain/faac8ef6-b25e-4617-8d06-e272f92830b5/.user_uploaded/media_1793461903964_431b4db4.png',
  'C:/Users/admin/.gemini/antigravity/brain/faac8ef6-b25e-4617-8d06-e272f92830b5/.user_uploaded/media_1793461955533_b47c22be.png',
  'C:/Users/admin/.gemini/antigravity/brain/faac8ef6-b25e-4617-8d06-e272f92830b5/.user_uploaded/media_1793461971159_a57a61ce.png',
  'C:/Users/admin/.gemini/antigravity/brain/faac8ef6-b25e-4617-8d06-e272f92830b5/.user_uploaded/media_1793461982811_cfefc702.png'
];

// Helper: Create SVG background
function createSvgBackground(width, height, title, subtitle) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width}" ${height} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </radialGradient>
        <pattern id="dotPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <rect width="${width}" height="${height}" fill="url(#dotPattern)" />
      ${title ? `
        <text x="40" y="52" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">${title}</text>
        ${subtitle ? `<text x="40" y="78" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${subtitle}</text>` : ''}
      ` : ''}
    </svg>
  `);
}

async function processAll() {
  console.log('🖼️ Processing 4 screenshots into 1280x800 and 640x400 standard sizes...');

  // ================= 1. Image 1: 网页划词即刻触发事实核验 =================
  console.log('Processing Screenshot 1 (Highlight & Verify)...');
  {
    const img1 = sharp(inputImages[0]);
    // Resize content with rounded window card & drop shadow look
    const resized1 = await img1
      .resize(1200, null, { fit: 'inside' })
      .toBuffer();
    const meta1 = await sharp(resized1).metadata();

    const topOffset = Math.round((800 - meta1.height) / 2);
    const leftOffset = Math.round((1280 - meta1.width) / 2);

    const bg1 = await sharp({
      create: {
        width: 1280,
        height: 800,
        channels: 4,
        background: { r: 250, g: 251, b: 252, alpha: 1 }
      }
    })
    .composite([
      { input: resized1, top: topOffset, left: leftOffset }
    ])
    .png()
    .toBuffer();

    const out1280 = path.join(outputDir, 'screenshot-1-1280x800.png');
    await sharp(bg1).toFile(out1280);

    const out640 = path.join(outputDir, 'screenshot-1-640x400.png');
    await sharp(bg1).resize(640, 400).toFile(out640);
    console.log('  ✅ Generated screenshot-1');
  }

  // ================= 2. Image 2: 全屏事实穿透工作树 + 实时流水日志 =================
  console.log('Processing Screenshot 2 (Workflow Tree & Live Logs)...');
  {
    const img2 = sharp(inputImages[1]);
    const resized2 = await img2
      .resize(1240, null, { fit: 'inside' })
      .toBuffer();
    const meta2 = await sharp(resized2).metadata();

    const topOffset = Math.round((800 - meta2.height) / 2);
    const leftOffset = Math.round((1280 - meta2.width) / 2);

    const bg2 = await sharp({
      create: {
        width: 1280,
        height: 800,
        channels: 4,
        background: { r: 248, g: 250, b: 252, alpha: 1 }
      }
    })
    .composite([
      { input: resized2, top: topOffset, left: leftOffset }
    ])
    .png()
    .toBuffer();

    const out1280 = path.join(outputDir, 'screenshot-2-1280x800.png');
    await sharp(bg2).toFile(out1280);

    const out640 = path.join(outputDir, 'screenshot-2-640x400.png');
    await sharp(bg2).resize(640, 400).toFile(out640);
    console.log('  ✅ Generated screenshot-2');
  }

  // ================= 3. Image 3: 事实核验总览报告与权威引注 =================
  console.log('Processing Screenshot 3 (Audit Report & Citations)...');
  {
    const img3 = sharp(inputImages[2]);
    // Height is 821, resize so it fits gracefully inside 800 with padding
    const resized3 = await img3
      .resize(null, 740, { fit: 'inside' })
      .toBuffer();
    const meta3 = await sharp(resized3).metadata();

    const topOffset = Math.round((800 - meta3.height) / 2);
    const leftOffset = Math.round((1280 - meta3.width) / 2);

    const bg3 = await sharp({
      create: {
        width: 1280,
        height: 800,
        channels: 4,
        background: { r: 241, g: 245, b: 249, alpha: 1 }
      }
    })
    .composite([
      { input: resized3, top: topOffset, left: leftOffset }
    ])
    .png()
    .toBuffer();

    const out1280 = path.join(outputDir, 'screenshot-3-1280x800.png');
    await sharp(bg3).toFile(out1280);

    const out640 = path.join(outputDir, 'screenshot-3-640x400.png');
    await sharp(bg3).resize(640, 400).toFile(out640);
    console.log('  ✅ Generated screenshot-3');
  }

  // ================= 4. Image 4: 插件快捷控制台与自定义配置 =================
  console.log('Processing Screenshot 4 (Extension Popup & Controls)...');
  {
    const img4 = sharp(inputImages[3]);
    // Resize popup naturally
    const resized4 = await img4
      .resize(null, 720, { fit: 'inside' })
      .toBuffer();
    const meta4 = await sharp(resized4).metadata();

    // Use Image 1 as a blurred, elegant web browser background
    const bgBase = await sharp(inputImages[0])
      .resize(1280, 800, { fit: 'cover' })
      .blur(16)
      .modulate({ brightness: 0.92, saturation: 0.85 })
      .toBuffer();

    // Position the popup on the right-center, exactly where browser extensions pop up!
    const rightMargin = 80;
    const leftOffset = 1280 - meta4.width - rightMargin;
    const topOffset = Math.round((800 - meta4.height) / 2);

    // Decorative promotional headline on the left side of the canvas
    const promoOverlaySvg = Buffer.from(`
      <svg width="1280" height="800" viewBox="0 0 1280 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="240" width="620" height="320" rx="24" fill="rgba(255, 255, 255, 0.85)" stroke="rgba(226, 232, 240, 0.9)" stroke-width="1.5" />
        
        <circle cx="96" cy="292" r="24" fill="#0f172a" />
        <path d="M96 280L108 286V298C108 305 103 311 96 313C89 311 84 305 84 298V286L96 280Z" fill="#10b981" />
        
        <text x="136" y="292" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800">TruthGuard 事实检察官</text>
        <text x="136" y="316" fill="#059669" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">轻量插件 · 划词即查 · 额度充沛</text>
        
        <text x="80" y="375" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600">⚡ 腾讯云元宝搜索 (WSA) 实时直连</text>
        <text x="80" y="405" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">数千亿网页精准去噪证据段落，毫秒级联网穿透</text>
        
        <text x="80" y="455" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600">🔒 本地安全沙盒与隐私持久化</text>
        <text x="80" y="485" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">支持自定义私有 Key，零隐私上传，自由控制划选胶囊</text>
      </svg>
    `);

    const final4 = await sharp(bgBase)
      .composite([
        { input: promoOverlaySvg, top: 0, left: 0 },
        { input: resized4, top: topOffset, left: leftOffset }
      ])
      .png()
      .toBuffer();

    const out1280 = path.join(outputDir, 'screenshot-4-1280x800.png');
    await sharp(final4).toFile(out1280);

    const out640 = path.join(outputDir, 'screenshot-4-640x400.png');
    await sharp(final4).resize(640, 400).toFile(out640);
    console.log('  ✅ Generated screenshot-4');
  }

  console.log('\n🎉 ALL 8 SCREENSHOTS GENERATED SUCCESSFULLY IN store-assets/screenshots!');
}

processAll().catch(err => {
  console.error('Error processing screenshots:', err);
  process.exit(1);
});
