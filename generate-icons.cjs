const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PURPLE = '#FCEABB';
const CYAN = '#F8B500';
const BG = '#0A0A0A';

function iconSvg(x, y, size = 40) {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
    <g transform="translate(${x + size*0.5}, ${y + size*0.5})">
      <!-- Left Screen -->
      <g transform="translate(${-size*0.22}, ${size*0.08}) rotate(-25)">
        <rect x="${-size*0.15}" y="${-size*0.25}" width="${size*0.3}" height="${size*0.5}" rx="${size*0.06}" fill="none" stroke="url(#iconGrad)" stroke-width="${size*0.04}"/>
      </g>
      <!-- Right Screen -->
      <g transform="translate(${size*0.22}, ${size*0.08}) rotate(25)">
        <rect x="${-size*0.15}" y="${-size*0.25}" width="${size*0.3}" height="${size*0.5}" rx="${size*0.06}" fill="none" stroke="url(#iconGrad)" stroke-width="${size*0.04}"/>
      </g>
      <!-- Center Screen (Top peak) -->
      <g transform="translate(0, ${-size*0.05})">
        <rect x="${-size*0.18}" y="${-size*0.3}" width="${size*0.36}" height="${size*0.6}" rx="${size*0.08}" fill="url(#iconGrad)" opacity="0.9"/>
      </g>
    </g>
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
