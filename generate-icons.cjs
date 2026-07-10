const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PURPLE = '#6C63FF';
const CYAN = '#00D4FF';
const BG = '#0C0C14';

function iconSvg(x, y, size = 40) {
  const cx = x + size / 2;
  const cy = y + size * 0.55;
  const strokeW = size * 0.055;
  
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
    <circle cx="${cx}" cy="${cy}" r="${size * 0.22}" fill="none" stroke="url(#iconGrad)" stroke-width="${strokeW}"/>
    <circle cx="${cx}" cy="${cy}" r="${size * 0.09}" fill="url(#iconGrad)" opacity="0.9"/>
    <path d="
      M ${cx - size*0.22} ${cy - size*0.16}
      L ${cx - size*0.26} ${cy - size*0.36}
      L ${cx - size*0.11} ${cy - size*0.26}
      L ${cx} ${cy - size*0.42}
      L ${cx + size*0.11} ${cy - size*0.26}
      L ${cx + size*0.26} ${cy - size*0.36}
      L ${cx + size*0.22} ${cy - size*0.16}
    " fill="none" stroke="url(#iconGrad)" stroke-width="${strokeW}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="
      M ${cx - size*0.15} ${cy + size*0.28}
      L ${cx - size*0.28} ${cy + size*0.28}
      L ${cx - size*0.28} ${cy + size*0.15}
    " fill="none" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="
      M ${cx + size*0.15} ${cy + size*0.28}
      L ${cx + size*0.28} ${cy + size*0.28}
      L ${cx + size*0.28} ${cy + size*0.15}
    " fill="none" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

function gradientDef() {
  return `
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PURPLE}"/>
      <stop offset="100%" style="stop-color:${CYAN}"/>
    </linearGradient>
  `;
}

async function gen() {
  const sizes = [16, 32, 48, 96, 128];
  
  if (!fs.existsSync('public/icon')) {
    fs.mkdirSync('public/icon', { recursive: true });
  }

  for (const s of sizes) {
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <defs>${gradientDef()}</defs>
      ${iconSvg(0, 0, s)}
    </svg>`;
    await sharp(Buffer.from(svgStr)).png().toFile(`public/icon/${s}.png`);
    console.log(`Generated public/icon/${s}.png`);
  }
}
gen();
