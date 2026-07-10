const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const outDir = 'store-assets';

// Clean old files in root of store-assets
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }
}

let originalCode = fs.readFileSync('gen-store-assets.cjs', 'utf8');

// 1. Dark Theme
let darkCode = originalCode.replace("const outDir = 'store-assets';", "const outDir = 'store-assets/dark';\nif (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});");
fs.writeFileSync('temp-dark.cjs', darkCode);
console.log("Generating Dark Theme Assets...");
execSync('node temp-dark.cjs', { stdio: 'inherit' });

// 2. Light Theme
let lightCode = originalCode
  .replace("const outDir = 'store-assets';", "const outDir = 'store-assets/light';\nif (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});")
  .replace("const BG = '#0A0A0A';", "const BG = '#F8F9FA';")
  .replace("const BG2 = '#141414';", "const BG2 = '#FFFFFF';")
  .replace("const BG3 = '#1C1C1C';", "const BG3 = '#F1F3F5';")
  .replace("const PURPLE = '#FCEABB';", "const PURPLE = '#E6A800';")
  .replace("const CYAN = '#F8B500';", "const CYAN = '#B38200';")
  .replace("const TEXT = '#F5F5F5';", "const TEXT = '#111111';")
  .replace("const TEXT2 = '#A0A0A0';", "const TEXT2 = '#666666';")
  .replace("const ACCENT = '#F8B500';", "const ACCENT = '#CC9500';")
  .replace("const BORDER = '#2A2A2A';", "const BORDER = '#E5E5E5';")
  .replace(/stop-color:#0A0A0A/g, 'stop-color:#F8F9FA')
  .replace(/stop-color:#141414/g, 'stop-color:#E9ECEF');

fs.writeFileSync('temp-light.cjs', lightCode);
console.log("Generating Light Theme Assets...");
execSync('node temp-light.cjs', { stdio: 'inherit' });

// Cleanup
fs.unlinkSync('temp-dark.cjs');
fs.unlinkSync('temp-light.cjs');

console.log("All assets generated successfully in store-assets/dark/ and store-assets/light/");
