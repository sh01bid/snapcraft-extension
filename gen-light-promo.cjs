const fs = require('fs');
const sharp = require('sharp');

// ── Light Color palette ──
const BG = '#F8F9FA';
const BG2 = '#FFFFFF';
const BG3 = '#F1F3F5';
const PURPLE = '#E6A800'; 
const CYAN = '#B38200';   
const TEXT = '#111111';
const TEXT2 = '#666666';
const ACCENT = '#CC9500';
const BORDER = '#E5E5E5';

function iconSvg(x, y, size = 40) {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
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
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F8F9FA"/>
      <stop offset="100%" style="stop-color:#E9ECEF"/>
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${PURPLE}"/>
      <stop offset="100%" style="stop-color:${CYAN}"/>
    </linearGradient>
  `;
}

function fakeUI(x, y, w, h) {
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${w}" height="${h}" rx="12" fill="${BG2}" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.1))" stroke="${BORDER}" stroke-width="1"/>
      <!-- Header -->
      <path d="M 0 12 Q 0 0 12 0 L ${w-12} 0 Q ${w} 0 ${w} 12 L ${w} 40 L 0 40 Z" fill="${BG3}"/>
      <circle cx="20" cy="20" r="5" fill="#FF5F56"/>
      <circle cx="40" cy="20" r="5" fill="#FFBD2E"/>
      <circle cx="60" cy="20" r="5" fill="#27C93F"/>
      <!-- Content Lines -->
      <rect x="20" y="60" width="${w * 0.4}" height="10" rx="5" fill="${TEXT}"/>
      <rect x="20" y="85" width="${w * 0.6}" height="8" rx="4" fill="${TEXT2}"/>
      <rect x="20" y="110" width="${w * 0.5}" height="8" rx="4" fill="${TEXT2}"/>
      <rect x="${w - 120}" y="55" width="100" height="70" rx="8" fill="${BG3}" stroke="${BORDER}"/>
      <circle cx="${w - 70}" cy="90" r="16" fill="url(#btnGrad)"/>
    </g>
  `;
}

function promoSmall() {
  return `
    <svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
      <defs>${gradientDef()}</defs>
      <rect width="440" height="280" fill="url(#bgGrad)"/>
      <!-- Grid pattern -->
      <path d="M 0 20 L 440 20 M 0 60 L 440 60 M 0 100 L 440 100 M 0 140 L 440 140 M 0 180 L 440 180 M 0 220 L 440 220 M 0 260 L 440 260" stroke="${BORDER}" stroke-width="1" opacity="0.3"/>
      <path d="M 40 0 L 40 280 M 100 0 L 100 280 M 160 0 L 160 280 M 220 0 L 220 280 M 280 0 L 280 280 M 340 0 L 340 280 M 400 0 L 400 280" stroke="${BORDER}" stroke-width="1" opacity="0.3"/>
      <!-- Main Content -->
      <g transform="translate(15, 60)">
        ${iconSvg(30, 50, 80)}
        <text x="130" y="100" fill="${TEXT}" font-family="Inter, sans-serif" font-size="48" font-weight="800" letter-spacing="-1">ScreenKing</text>
        <text x="135" y="135" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="20">Capture &amp; Record</text>
      </g>
      <!-- Decoration -->
      ${fakeUI(300, 160, 200, 150)}
    </svg>
  `;
}

async function run() {
  const svg = promoSmall();
  const outDir = '../../brain/943a9dd3-3075-4f88-b631-af7853a49885';
  await sharp(Buffer.from(svg)).png().toFile(outDir + '/promo-small-light.png');
  console.log("Generated");
}
run();
