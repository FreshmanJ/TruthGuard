import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');
const publicDir = path.join(rootDir, 'public');
const storeAssetsDir = path.join(rootDir, 'store-assets');

const targetPublicZip = path.join(publicDir, 'truthguard-extension.zip');
const targetStoreZip = path.join(storeAssetsDir, 'truthguard-edge-v1.0.0.zip');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(storeAssetsDir)) {
  fs.mkdirSync(storeAssetsDir, { recursive: true });
}

console.log('📦 Packaging TruthGuard Browser Extension for Microsoft Edge & Chrome...');

async function addDirectoryToZip(zip, folderPath, relativePrefix = '') {
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
    // Skip git, readme, system hidden files
    if (item.startsWith('.') || item === 'README.md' || item === 'Thumbs.db') {
      continue;
    }

    const fullPath = path.join(folderPath, item);
    // Use forward slashes for zip entries to ensure full compatibility with Edge & Chrome Web Store
    const entryPath = relativePrefix ? `${relativePrefix}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await addDirectoryToZip(zip, fullPath, entryPath);
    } else {
      const content = fs.readFileSync(fullPath);
      zip.file(entryPath, content);
      console.log(`  + [ZIP] ${entryPath} (${stat.size} bytes)`);
    }
  }
}

async function packageExtension() {
  const zip = new JSZip();

  await addDirectoryToZip(zip, extDir);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  // Save to public dir (for web download)
  fs.writeFileSync(targetPublicZip, zipBuffer);
  // Save to store-assets dir (for Edge Add-ons upload)
  fs.writeFileSync(targetStoreZip, zipBuffer);

  console.log(`\n✅ Successfully generated extension packages:`);
  console.log(`  1. Public ZIP:       ${targetPublicZip} (${zipBuffer.length} bytes)`);
  console.log(`  2. Store Upload ZIP: ${targetStoreZip} (${zipBuffer.length} bytes)`);
}

packageExtension().catch(err => {
  console.error('❌ Error packaging extension:', err);
  process.exit(1);
});
