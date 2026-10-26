import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const extDir = path.join(rootDir, 'extension');
const publicDir = path.join(rootDir, 'public');
const targetZip = path.join(publicDir, 'truthguard-extension.zip');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Packaging TruthGuard Browser Extension...');

try {
  if (process.platform === 'win32') {
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '${extDir}/*' -DestinationPath '${targetZip}' -Force"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${extDir}" && zip -r "${targetZip}" .`, { stdio: 'inherit' });
  }
  console.log(`Successfully created ${targetZip} (${fs.statSync(targetZip).size} bytes)`);
} catch (err) {
  console.error('Error packaging extension:', err);
  process.exit(1);
}
