const sharp = require('sharp');
const fs = require('fs');

const palettes = [
  {
    name: 'gold',
    c1: '#FCEABB',
    c2: '#F8B500',
    bg: '#0A0A0A'
  },
  {
    name: 'ruby',
    c1: '#FF416C',
    c2: '#FF4B2B',
    bg: '#120505'
  },
  {
    name: 'emerald',
    c1: '#56AB2F',
    c2: '#A8E063',
    bg: '#051208'
  },
  {
    name: 'ocean',
    c1: '#2193b0',
    c2: '#6dd5ed',
    bg: '#050D14'
  }
];

function opt3(size, p) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad_${p.name}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.c1}"/>
        <stop offset="100%" style="stop-color:${p.c2}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.22}" fill="${p.bg}"/>
    <g transform="translate(${size*0.5}, ${size*0.5})">
      <!-- Left Screen -->
      <g transform="translate(${-size*0.22}, ${size*0.08}) rotate(-25)">
        <rect x="${-size*0.15}" y="${-size*0.25}" width="${size*0.3}" height="${size*0.5}" rx="${size*0.06}" fill="none" stroke="url(#grad_${p.name})" stroke-width="${size*0.04}"/>
      </g>
      <!-- Right Screen -->
      <g transform="translate(${size*0.22}, ${size*0.08}) rotate(25)">
        <rect x="${-size*0.15}" y="${-size*0.25}" width="${size*0.3}" height="${size*0.5}" rx="${size*0.06}" fill="none" stroke="url(#grad_${p.name})" stroke-width="${size*0.04}"/>
      </g>
      <!-- Center Screen (Top peak) -->
      <g transform="translate(0, ${-size*0.05})">
        <rect x="${-size*0.18}" y="${-size*0.3}" width="${size*0.36}" height="${size*0.6}" rx="${size*0.08}" fill="url(#grad_${p.name})" opacity="0.9"/>
      </g>
    </g>
  </svg>`;
}

async function render() {
  const outDir = '../../brain/943a9dd3-3075-4f88-b631-af7853a49885';
  for (const p of palettes) {
    const svg = opt3(512, p);
    await sharp(Buffer.from(svg)).png().toFile(outDir + '/color_' + p.name + '.png');
  }
  console.log("Generated colors");
}
render();
