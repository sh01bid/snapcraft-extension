const fs = require('fs');
let content = fs.readFileSync('gen-store-assets.cjs', 'utf8');

// Fix promoSmall
content = content.replace(
  /\$\{iconSvg\(30,\s*50,\s*80\)\}\s*<text x="130" y="100" fill="\$\{TEXT\}" font-family="Inter, Arial, sans-serif" font-size="52"/g,
  '${iconSvg(15, 50, 80)}\n  <text x="105" y="100" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="48"'
);

// Fix promoSmall_zh
content = content.replace(
  /\$\{iconSvg\(30,\s*50,\s*80\)\}\s*<text x="130" y="100" fill="\$\{TEXT\}" font-family="Arial, sans-serif" font-size="52"/g,
  '${iconSvg(15, 50, 80)}\n  <text x="105" y="100" fill="${TEXT}" font-family="Arial, sans-serif" font-size="48"'
);

// Fix corrupted Chinese characters in case they got mangled
content = content.replace(/截图与录屏工[^<]*/g, '截图与录屏工具');
content = content.replace(/一站式 · 免费 · 开[^<]*/g, '一站式 · 免费 · 开源');

fs.writeFileSync('gen-store-assets.cjs', content, 'utf8');
console.log("Fixed promo tile layout and characters.");
