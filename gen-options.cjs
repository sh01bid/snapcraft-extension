const sharp = require('sharp');
const fs = require('fs');

const PURPLE = '#6C63FF';
const CYAN = '#00D4FF';
const BG = '#0C0C14';

function gradientDef() {
  return `
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PURPLE}"/>
      <stop offset="100%" style="stop-color:${CYAN}"/>
    </linearGradient>
  `;
}

// Option 1: Monogram K
function opt1() {
  const size = 512;
  const strokeW = size * 0.07;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>${gradientDef()}</defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
    <!-- stylized K using brackets -->
    <path d="
      M ${size*0.3} ${size*0.25} L ${size*0.3} ${size*0.75}
      M ${size*0.7} ${size*0.25} L ${size*0.3} ${size*0.5}
      M ${size*0.48} ${size*0.5} L ${size*0.7} ${size*0.75}
    " fill="none" stroke="url(#iconGrad)" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- crown on top of the letter -->
    <path d="
      M ${size*0.35} ${size*0.18} 
      L ${size*0.42} ${size*0.1} 
      L ${size*0.5} ${size*0.18} 
      L ${size*0.58} ${size*0.1} 
      L ${size*0.65} ${size*0.18}
    " fill="none" stroke="url(#iconGrad)" stroke-width="${strokeW*0.5}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// Option 2: Desktop & Crown
function opt2() {
  const size = 512;
  const strokeW = size * 0.055;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>${gradientDef()}</defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
    <!-- Desktop monitor -->
    <rect x="${size*0.2}" y="${size*0.35}" width="${size*0.6}" height="${size*0.4}" rx="${size*0.06}" fill="none" stroke="url(#iconGrad)" stroke-width="${strokeW}"/>
    <line x1="${size*0.35}" y1="${size*0.82}" x2="${size*0.65}" y2="${size*0.82}" stroke="url(#iconGrad)" stroke-width="${strokeW}" stroke-linecap="round"/>
    <line x1="${size*0.5}" y1="${size*0.75}" x2="${size*0.5}" y2="${size*0.82}" stroke="url(#iconGrad)" stroke-width="${strokeW}" stroke-linecap="round"/>
    <!-- Solid Crown on top -->
    <path d="
      M ${size*0.35} ${size*0.35}
      L ${size*0.3} ${size*0.15}
      L ${size*0.4} ${size*0.25}
      L ${size*0.5} ${size*0.1}
      L ${size*0.6} ${size*0.25}
      L ${size*0.7} ${size*0.15}
      L ${size*0.65} ${size*0.35}
      Z
    " fill="url(#iconGrad)" opacity="0.9" />
  </svg>`;
}

// Option 3: Screen Stack Crown
function opt3() {
  const size = 512;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>${gradientDef()}</defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.22}" fill="${BG}"/>
    
    <g transform="translate(${size*0.5}, ${size*0.5})">
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
  </svg>`;
}

async function render() {
  const outDir = '../../brain/943a9dd3-3075-4f88-b631-af7853a49885';
  await sharp(Buffer.from(opt1())).png().toFile(outDir + '/opt1.png');
  await sharp(Buffer.from(opt2())).png().toFile(outDir + '/opt2.png');
  await sharp(Buffer.from(opt3())).png().toFile(outDir + '/opt3.png');
  console.log("Generated options");
}
render();
