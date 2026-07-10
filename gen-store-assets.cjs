const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = 'store-assets';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// ── Color palette ──
const BG = '#0C0C14';
const BG2 = '#141420';
const BG3 = '#1C1C2E';
const PURPLE = '#6C63FF';
const CYAN = '#00D4FF';
const TEXT = '#E8E8F0';
const TEXT2 = '#8888AA';
const ACCENT = '#22C55E';
const BORDER = '#2A2A40';

// ── Shared SVG Components ──
function iconSvg(x, y, size = 40) {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.2}" fill="${BG}"/>
    <circle cx="${x + size/2}" cy="${y + size/2}" r="${size * 0.23}" fill="none" stroke="url(#iconGrad)" stroke-width="${size * 0.055}"/>
    <circle cx="${x + size/2}" cy="${y + size/2}" r="${size * 0.1}" fill="url(#iconGrad)" opacity="0.8"/>
    <line x1="${x + size*0.18}" y1="${y + size*0.18}" x2="${x + size*0.3}" y2="${y + size*0.18}" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round"/>
    <line x1="${x + size*0.18}" y1="${y + size*0.18}" x2="${x + size*0.18}" y2="${y + size*0.3}" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round"/>
    <line x1="${x + size*0.82}" y1="${y + size*0.18}" x2="${x + size*0.7}" y2="${y + size*0.18}" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round"/>
    <line x1="${x + size*0.82}" y1="${y + size*0.18}" x2="${x + size*0.82}" y2="${y + size*0.3}" stroke="url(#iconGrad)" stroke-width="${size*0.04}" stroke-linecap="round"/>
  `;
}

function gradientDef() {
  return `
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PURPLE}"/>
      <stop offset="100%" style="stop-color:${CYAN}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0C0C14"/>
      <stop offset="100%" style="stop-color:#141428"/>
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${PURPLE}"/>
      <stop offset="100%" style="stop-color:${CYAN}"/>
    </linearGradient>
  `;
}

// ── Screenshot 1: Popup Interface (1280x800) ──
function screenshot1_popup() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <!-- Background decoration -->
  <circle cx="200" cy="600" r="300" fill="${PURPLE}" opacity="0.03"/>
  <circle cx="1100" cy="200" r="250" fill="${CYAN}" opacity="0.03"/>
  
  <!-- Centered popup mockup -->
  <g transform="translate(390, 60)">
    <!-- Popup frame -->
    <rect x="0" y="0" width="500" height="680" rx="16" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="500" height="70" rx="16" fill="${BG3}"/>
    <rect x="0" y="50" width="500" height="20" fill="${BG3}"/>
    ${iconSvg(20, 15, 40)}
    <text x="72" y="42" fill="${TEXT}" font-family="Inter, sans-serif" font-size="18" font-weight="700">ScreenKing</text>
    <text x="178" y="42" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">v3.0.1</text>
    
    <!-- Settings gear -->
    <circle cx="440" cy="35" r="16" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="435" y="40" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14">⚙</text>
    
    <!-- History icon -->
    <circle cx="472" cy="35" r="16" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="467" y="40" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14">📋</text>
    
    <!-- Screenshot Section -->
    <text x="24" y="104" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">📷 Screenshot</text>
    
    <!-- Capture Visible -->
    <rect x="16" y="118" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="150" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Capture Visible Area</text>
    <rect x="350" y="132" width="120" height="24" rx="6" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>
    <text x="368" y="149" fill="${TEXT2}" font-family="Inter, monospace" font-size="11">Alt+Shift+V</text>
    
    <!-- Full Page -->
    <rect x="16" y="178" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="210" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Capture Full Page</text>
    <rect x="350" y="192" width="120" height="24" rx="6" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>
    <text x="368" y="209" fill="${TEXT2}" font-family="Inter, monospace" font-size="11">Alt+Shift+F</text>
    
    <!-- Select Region -->
    <rect x="16" y="238" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="270" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Select Region</text>
    <rect x="350" y="252" width="120" height="24" rx="6" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>
    <text x="368" y="269" fill="${TEXT2}" font-family="Inter, monospace" font-size="11">Alt+Shift+S</text>

    <!-- Recording Section -->
    <text x="24" y="326" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">🎬 Recording</text>
    
    <!-- Record Tab -->
    <rect x="16" y="340" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="372" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Record Current Tab</text>
    
    <!-- Record Desktop -->
    <rect x="16" y="400" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="432" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Record Desktop</text>

    <!-- Sharing Section -->
    <text x="24" y="490" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">🔗 Sharing</text>
    
    <rect x="16" y="504" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="536" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Share to Web</text>
    
    <!-- Toggle -->
    <rect x="16" y="570" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="602" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Auto Copy to Clipboard</text>
    <rect x="424" y="586" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="454" cy="598" r="9" fill="white"/>
  </g>
  
  <!-- Title text -->
  <text x="640" y="775" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">Clean, intuitive popup for quick access to all capture modes</text>
</svg>`;
}

// ── Screenshot 2: Editor (1280x800) ──
function screenshot2_editor() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}
    <filter id="blurFilter"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter>
  </defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <g transform="translate(60, 30)">
    <!-- Window frame -->
    <rect x="0" y="0" width="1160" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Toolbar -->
    <rect x="0" y="0" width="1160" height="56" rx="12" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="40" width="1160" height="16" fill="${BG3}"/>
    
    <!-- Tool buttons - Draw is active -->
    <rect x="16" y="10" width="36" height="36" rx="8" fill="${PURPLE}" opacity="0.25" stroke="${PURPLE}" stroke-width="1.5"/>
    <text x="26" y="34" fill="${PURPLE}" font-size="16">✏️</text>
    <rect x="60" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="70" y="34" fill="${TEXT2}" font-size="16">📝</text>
    <rect x="104" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="114" y="34" fill="${TEXT2}" font-size="16">⬜</text>
    <rect x="148" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="158" y="34" fill="${TEXT2}" font-size="16">⭕</text>
    <rect x="192" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="202" y="34" fill="${TEXT2}" font-size="16">➡️</text>
    <rect x="236" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="246" y="34" fill="${TEXT2}" font-size="16">🔤</text>
    <rect x="280" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="290" y="34" fill="${TEXT2}" font-size="16">🌫️</text>
    <rect x="324" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="334" y="34" fill="${TEXT2}" font-size="16">✂️</text>
    
    <!-- Divider -->
    <line x1="380" y1="12" x2="380" y2="44" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Color palette -->
    <circle cx="408" cy="28" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
    <circle cx="438" cy="28" r="12" fill="#F59E0B"/>
    <circle cx="468" cy="28" r="12" fill="#22C55E"/>
    <circle cx="498" cy="28" r="12" fill="#3B82F6"/>
    <circle cx="528" cy="28" r="12" fill="#8B5CF6"/>
    <circle cx="558" cy="28" r="12" fill="white"/>
    
    <!-- Divider -->
    <line x1="590" y1="12" x2="590" y2="44" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Stroke width -->
    <text x="610" y="32" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Size</text>
    <rect x="646" y="22" width="80" height="6" rx="3" fill="${BG}"/>
    <rect x="646" y="22" width="50" height="6" rx="3" fill="#EF4444"/>
    <circle cx="696" cy="25" r="6" fill="white"/>
    
    <!-- Undo / Redo -->
    <rect x="790" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="800" y="34" fill="${TEXT2}" font-size="14">↩️</text>
    <rect x="832" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="842" y="34" fill="${TEXT2}" font-size="14" opacity="0.4">↪️</text>

    <!-- Right side buttons -->
    <rect x="920" y="10" width="100" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="940" y="34" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">💾 Save</text>
    <rect x="1030" y="10" width="115" height="36" rx="8" fill="url(#btnGrad)"/>
    <text x="1050" y="34" fill="white" font-family="Inter, sans-serif" font-size="12" font-weight="600">📋 Copy</text>
    
    <!-- ═══ Canvas: Simulated webpage screenshot ═══ -->
    <rect x="20" y="66" width="1120" height="660" rx="8" fill="#f8f9fa"/>
    
    <!-- Browser-like nav bar -->
    <rect x="20" y="66" width="1120" height="40" rx="8" fill="#e9ecef"/>
    <rect x="20" y="98" width="1120" height="8" fill="#e9ecef"/>
    <circle cx="44" cy="86" r="6" fill="#ff5f57"/>
    <circle cx="64" cy="86" r="6" fill="#ffbd2e"/>
    <circle cx="84" cy="86" r="6" fill="#28c840"/>
    <rect x="120" y="78" width="350" height="18" rx="9" fill="white" stroke="#d1d5db" stroke-width="0.5"/>
    <text x="140" y="91" fill="#6b7280" font-family="Inter, sans-serif" font-size="10">example.com/dashboard</text>
    
    <!-- Page: header area -->
    <rect x="20" y="106" width="1120" height="60" fill="#1e293b"/>
    <text x="60" y="142" fill="white" font-family="Inter, sans-serif" font-size="18" font-weight="700">Dashboard</text>
    <rect x="900" y="124" width="80" height="30" rx="6" fill="#3b82f6"/>
    <text x="918" y="144" fill="white" font-family="Inter, sans-serif" font-size="11">Settings</text>
    <rect x="990" y="124" width="110" height="30" rx="6" fill="#8b5cf6"/>
    <text x="1010" y="144" fill="white" font-family="Inter, sans-serif" font-size="11">+ New Item</text>
    
    <!-- Content area - left column -->
    <rect x="40" y="186" width="520" height="200" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="60" y="216" fill="#1e293b" font-family="Inter, sans-serif" font-size="14" font-weight="600">Monthly Revenue</text>
    <text x="60" y="240" fill="#6b7280" font-family="Inter, sans-serif" font-size="11">Last 30 days performance</text>
    <!-- Chart bars -->
    <rect x="60" y="340" width="40" height="30" rx="3" fill="#c7d2fe"/>
    <rect x="110" y="320" width="40" height="50" rx="3" fill="#c7d2fe"/>
    <rect x="160" y="300" width="40" height="70" rx="3" fill="#c7d2fe"/>
    <rect x="210" y="290" width="40" height="80" rx="3" fill="#a5b4fc"/>
    <rect x="260" y="270" width="40" height="100" rx="3" fill="#818cf8"/>
    <rect x="310" y="280" width="40" height="90" rx="3" fill="#818cf8"/>
    <rect x="360" y="260" width="40" height="110" rx="3" fill="#6366f1"/>
    <rect x="410" y="290" width="40" height="80" rx="3" fill="#818cf8"/>
    <rect x="460" y="310" width="40" height="60" rx="3" fill="#a5b4fc"/>
    
    <!-- Content area - right column cards -->
    <rect x="580" y="186" width="540" height="90" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="600" y="216" fill="#1e293b" font-family="Inter, sans-serif" font-size="13" font-weight="600">Total Users</text>
    <text x="600" y="240" fill="#6366f1" font-family="Inter, sans-serif" font-size="22" font-weight="700">12,847</text>
    <text x="600" y="260" fill="#22c55e" font-family="Inter, sans-serif" font-size="11">▲ 12.5% from last month</text>
    
    <rect x="580" y="286" width="540" height="90" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="600" y="316" fill="#1e293b" font-family="Inter, sans-serif" font-size="13" font-weight="600">Active Sessions</text>
    <text x="600" y="340" fill="#6366f1" font-family="Inter, sans-serif" font-size="22" font-weight="700">3,291</text>
    <text x="600" y="360" fill="#22c55e" font-family="Inter, sans-serif" font-size="11">▲ 8.3% from last month</text>

    <!-- Bottom area: table -->
    <rect x="40" y="406" width="1080" height="300" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="60" y="436" fill="#1e293b" font-family="Inter, sans-serif" font-size="14" font-weight="600">Recent Orders</text>
    <!-- Table header -->
    <rect x="40" y="450" width="1080" height="30" fill="#f9fafb"/>
    <text x="60" y="470" fill="#6b7280" font-family="Inter, sans-serif" font-size="11" font-weight="600">Order ID</text>
    <text x="240" y="470" fill="#6b7280" font-family="Inter, sans-serif" font-size="11" font-weight="600">Customer</text>
    <text x="500" y="470" fill="#6b7280" font-family="Inter, sans-serif" font-size="11" font-weight="600">Email</text>
    <text x="780" y="470" fill="#6b7280" font-family="Inter, sans-serif" font-size="11" font-weight="600">Amount</text>
    <text x="960" y="470" fill="#6b7280" font-family="Inter, sans-serif" font-size="11" font-weight="600">Status</text>
    <!-- Row 1 -->
    <text x="60" y="505" fill="#374151" font-family="Inter, sans-serif" font-size="11">#ORD-7291</text>
    <text x="240" y="505" fill="#374151" font-family="Inter, sans-serif" font-size="11">Sarah Johnson</text>
    <text x="500" y="505" fill="#6b7280" font-family="Inter, sans-serif" font-size="11">sarah@example.com</text>
    <text x="780" y="505" fill="#374151" font-family="Inter, sans-serif" font-size="11" font-weight="600">$299.00</text>
    <rect x="960" y="492" width="70" height="20" rx="10" fill="#dcfce7"/>
    <text x="978" y="506" fill="#16a34a" font-family="Inter, sans-serif" font-size="10" font-weight="600">Completed</text>
    <line x1="40" y1="518" x2="1120" y2="518" stroke="#f3f4f6" stroke-width="1"/>
    <!-- Row 2 -->
    <text x="60" y="540" fill="#374151" font-family="Inter, sans-serif" font-size="11">#ORD-7290</text>
    <text x="240" y="540" fill="#374151" font-family="Inter, sans-serif" font-size="11">Mike Chen</text>
    <text x="500" y="540" fill="#6b7280" font-family="Inter, sans-serif" font-size="11">mike@example.com</text>
    <text x="780" y="540" fill="#374151" font-family="Inter, sans-serif" font-size="11" font-weight="600">$149.50</text>
    <rect x="960" y="527" width="60" height="20" rx="10" fill="#fef9c3"/>
    <text x="973" y="541" fill="#a16207" font-family="Inter, sans-serif" font-size="10" font-weight="600">Pending</text>
    <line x1="40" y1="553" x2="1120" y2="553" stroke="#f3f4f6" stroke-width="1"/>
    <!-- Row 3 -->
    <text x="60" y="575" fill="#374151" font-family="Inter, sans-serif" font-size="11">#ORD-7289</text>
    <text x="240" y="575" fill="#374151" font-family="Inter, sans-serif" font-size="11">Emily Davis</text>
    <text x="500" y="575" fill="#6b7280" font-family="Inter, sans-serif" font-size="11">emily@example.com</text>
    <text x="780" y="575" fill="#374151" font-family="Inter, sans-serif" font-size="11" font-weight="600">$89.99</text>
    <rect x="960" y="562" width="70" height="20" rx="10" fill="#dcfce7"/>
    <text x="978" y="576" fill="#16a34a" font-family="Inter, sans-serif" font-size="10" font-weight="600">Completed</text>

    <!-- ═══ ANNOTATIONS overlaid on the screenshot ═══ -->
    
    <!-- 1. Big red arrow pointing to the chart peak -->
    <line x1="480" y1="210" x2="400" y2="260" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
    <polygon points="400,260 415,248 408,264" fill="#EF4444"/>
    
    <!-- 2. Red circle around Total Users number -->
    <ellipse cx="660" cy="238" rx="80" ry="20" fill="none" stroke="#EF4444" stroke-width="3"/>
    
    <!-- 3. Text annotation callout -->
    <rect x="740" y="208" width="200" height="36" rx="6" fill="#EF4444" opacity="0.9"/>
    <text x="760" y="232" fill="white" font-family="Inter, sans-serif" font-size="14" font-weight="700">Key Metric Here!</text>
    <line x1="740" y1="230" x2="720" y2="238" stroke="#EF4444" stroke-width="2"/>
    
    <!-- 4. Freehand-style underline on chart title -->
    <path d="M58,218 Q100,225 180,218 Q220,215 260,220 Q300,224 340,218" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    
    <!-- 5. Rectangle highlight around "+ New Item" button -->
    <rect x="985" y="118" width="122" height="42" rx="4" fill="none" stroke="#22C55E" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="990" y="112" fill="#22C55E" font-family="Inter, sans-serif" font-size="11" font-weight="700">Click here →</text>
    
    <!-- 6. Blur overlay on email column -->
    <rect x="494" y="490" width="260" height="100" rx="4" fill="${BG3}" opacity="0.85" filter="url(#blurFilter)"/>
    <rect x="494" y="490" width="260" height="100" rx="4" fill="none" stroke="${TEXT2}" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="570" y="545" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13" font-weight="600" text-anchor="middle" opacity="0.7">🔒 Blurred</text>
  </g>
  
  <text x="640" y="790" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">Powerful annotation editor with drawing, text, arrows, blur, and more</text>
</svg>`;
}

// ── Screenshot 3: History Gallery (1280x800) ──
function screenshot3_history() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <g transform="translate(40, 20)">
    <rect x="0" y="0" width="1200" height="760" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="1200" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="1200" height="16" fill="${BG3}"/>
    ${iconSvg(20, 12, 40)}
    <text x="72" y="40" fill="${TEXT}" font-family="Inter, sans-serif" font-size="18" font-weight="700">Capture History</text>
    
    <!-- Filter tabs -->
    <rect x="250" y="16" width="60" height="32" rx="8" fill="${PURPLE}"/>
    <text x="267" y="37" fill="white" font-family="Inter, sans-serif" font-size="12" font-weight="600">All</text>
    <rect x="318" y="16" width="100" height="32" rx="8" fill="${BG2}"/>
    <text x="332" y="37" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">Screenshots</text>
    <rect x="426" y="16" width="100" height="32" rx="8" fill="${BG2}"/>
    <text x="440" y="37" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">Recordings</text>
    
    <!-- Search -->
    <rect x="900" y="16" width="200" height="32" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="920" y="37" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">🔍 Search...</text>
    
    <!-- Select mode button -->
    <rect x="1110" y="16" width="72" height="32" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="1122" y="37" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">☑ Select</text>
    
    <!-- Grid of capture cards -->
    ${[0,1,2,3].map(col => [0,1,2].map(row => {
      const x = 16 + col * 294;
      const y = 80 + row * 220;
      const isVideo = (col + row) % 3 === 0;
      const colors = ['#1a1a3e', '#1a2a3e', '#2a1a3e', '#1a3a2e', '#3a1a2e', '#1a2a2e'];
      const color = colors[(col + row) % colors.length];
      return `
        <rect x="${x}" y="${y}" width="278" height="204" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
        <rect x="${x + 8}" y="${y + 8}" width="262" height="148" rx="6" fill="${color}"/>
        ${isVideo ? `
          <circle cx="${x + 139}" cy="${y + 82}" r="20" fill="rgba(0,0,0,0.5)"/>
          <polygon points="${x+133},${y+74} ${x+133},${y+90} ${x+148},${y+82}" fill="white"/>
          <rect x="${x + 200}" y="${y + 130}" width="56" height="18" rx="4" fill="rgba(0,0,0,0.6)"/>
          <text x="${x + 212}" y="${y + 143}" fill="white" font-size="10" font-family="Inter, sans-serif">0:45</text>
        ` : `
          <rect x="${x + 20}" y="${y + 30}" width="222" height="12" rx="3" fill="${TEXT2}" opacity="0.15"/>
          <rect x="${x + 20}" y="${y + 50}" width="180" height="12" rx="3" fill="${TEXT2}" opacity="0.1"/>
          <rect x="${x + 20}" y="${y + 70}" width="200" height="12" rx="3" fill="${TEXT2}" opacity="0.12"/>
        `}
        <text x="${x + 16}" y="${y + 176}" fill="${TEXT}" font-family="Inter, sans-serif" font-size="11">${isVideo ? '🎬' : '📷'} ${isVideo ? 'Screen Recording' : 'Screenshot'}</text>
        <text x="${x + 16}" y="${y + 194}" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="10">Jul 2, 2026 · ${isVideo ? '2.4 MB' : '156 KB'}</text>
      `;
    }).join('')).join('')}
  </g>
  
  <text x="640" y="790" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">Capture history with search, filter, batch operations, and quick preview</text>
</svg>`;
}

// ── Screenshot 4: Settings (1280x800) ──
function screenshot4_settings() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <g transform="translate(240, 30)">
    <rect x="0" y="0" width="800" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="800" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="800" height="16" fill="${BG3}"/>
    ${iconSvg(20, 12, 40)}
    <text x="72" y="40" fill="${TEXT}" font-family="Inter, sans-serif" font-size="18" font-weight="700">Settings</text>
    <text x="148" y="40" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">v3.0.1</text>
    
    <!-- Screenshot section -->
    <rect x="20" y="80" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="106" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">📷 Screenshot</text>
    
    <!-- Image Format -->
    <rect x="20" y="128" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="154" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Image Format</text>
    <text x="40" y="172" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Default format for saved screenshots</text>
    <rect x="620" y="138" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="660" y="159" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">PNG ▾</text>
    
    <!-- Quality -->
    <rect x="20" y="192" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="218" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Image Quality</text>
    <text x="40" y="236" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">For JPEG and WebP formats (1-100)</text>
    <rect x="580" y="210" width="160" height="8" rx="4" fill="${BG3}"/>
    <rect x="580" y="210" width="128" height="8" rx="4" fill="url(#btnGrad)"/>
    <circle cx="708" cy="214" r="8" fill="white"/>
    <text x="750" y="218" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">92</text>
    
    <!-- Auto Copy -->
    <rect x="20" y="256" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="282" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Auto Copy to Clipboard</text>
    <text x="40" y="300" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Automatically copy screenshots to clipboard</text>
    <rect x="716" y="274" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="746" cy="286" r="9" fill="white"/>
    
    <!-- Recording section -->
    <rect x="20" y="328" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="354" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">🎬 Recording</text>
    
    <!-- Video Format -->
    <rect x="20" y="376" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="402" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Video Format</text>
    <text x="40" y="420" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">WebM (native) or MP4 (converted)</text>
    <rect x="620" y="386" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="640" y="407" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">WebM (VP9) ▾</text>
    
    <!-- FPS -->
    <rect x="20" y="440" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="466" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Frame Rate</text>
    <text x="40" y="484" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Frames per second</text>
    <rect x="620" y="450" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="670" y="471" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">30 FPS ▾</text>
    
    <!-- General section -->
    <rect x="20" y="520" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="546" fill="${TEXT}" font-family="Inter, sans-serif" font-size="14" font-weight="600">⚙ General</text>
    
    <!-- Theme -->
    <rect x="20" y="568" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="594" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Theme</text>
    <text x="40" y="612" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Visual appearance</text>
    <rect x="620" y="578" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="665" y="599" fill="${TEXT}" font-family="Inter, sans-serif" font-size="12">Dark ▾</text>
    
    <!-- Notifications -->
    <rect x="20" y="632" width="760" height="56" rx="0" fill="transparent"/>
    <text x="40" y="658" fill="${TEXT}" font-family="Inter, sans-serif" font-size="13">Notifications</text>
    <text x="40" y="676" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="11">Show desktop notifications after capture</text>
    <rect x="716" y="650" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="746" cy="662" r="9" fill="white"/>
  </g>
  
  <text x="640" y="790" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">Customizable settings for screenshots, recordings, and general preferences</text>
</svg>`;
}

// ── Screenshot 5: Recording Preview + MP4 conversion (1280x800) ──
function screenshot5_preview() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  
  <g transform="translate(80, 30)">
    <rect x="0" y="0" width="1120" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="1120" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="1120" height="16" fill="${BG3}"/>
    <text x="24" y="28" fill="${TEXT}" font-family="Inter, sans-serif" font-size="16">🎬</text>
    <text x="52" y="38" fill="${TEXT}" font-family="Inter, sans-serif" font-size="16" font-weight="700">Recording Preview</text>
    
    <!-- Duration & Size -->
    <text x="240" y="36" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">⏱ 1m 23s</text>
    <text x="320" y="36" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="12">📦 4.2 MB</text>
    
    <!-- Format select -->
    <rect x="780" y="16" width="120" height="32" rx="6" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="800" y="37" fill="${CYAN}" font-family="Inter, sans-serif" font-size="12" font-weight="600">MP4 (H.264) ▾</text>
    
    <!-- Download button with progress -->
    <rect x="910" y="16" width="130" height="32" rx="8" fill="url(#btnGrad)"/>
    <text x="940" y="37" fill="white" font-family="Inter, sans-serif" font-size="12" font-weight="600">Converting: 67%</text>
    
    <!-- Delete -->
    <rect x="1050" y="16" width="52" height="32" rx="8" fill="#EF4444" opacity="0.15" stroke="#EF4444" stroke-width="1"/>
    <text x="1060" y="37" fill="#EF4444" font-family="Inter, sans-serif" font-size="12">🗑️</text>

    <!-- Progress bar -->
    <rect x="0" y="64" width="1120" height="3" fill="${BG3}"/>
    <rect x="0" y="64" width="750" height="3" fill="url(#btnGrad)"/>
    
    <!-- Video player area -->
    <rect x="40" y="90" width="1040" height="585" rx="8" fill="#0a0a1a"/>
    
    <!-- Mock video content -->
    <rect x="80" y="120" width="960" height="500" rx="4" fill="#111128"/>
    <rect x="120" y="150" width="400" height="30" rx="4" fill="${TEXT2}" opacity="0.1"/>
    <rect x="120" y="200" width="880" height="16" rx="3" fill="${TEXT2}" opacity="0.08"/>
    <rect x="120" y="230" width="700" height="16" rx="3" fill="${TEXT2}" opacity="0.06"/>
    <rect x="120" y="260" width="800" height="16" rx="3" fill="${TEXT2}" opacity="0.08"/>
    <rect x="120" y="320" width="400" height="250" rx="8" fill="${BG3}" opacity="0.5"/>
    <rect x="560" y="320" width="440" height="250" rx="8" fill="${BG3}" opacity="0.3"/>
    
    <!-- Play button overlay -->
    <circle cx="560" cy="400" r="40" fill="rgba(0,0,0,0.5)"/>
    <polygon points="548,380 548,420 580,400" fill="white"/>
    
    <!-- Video controls bar -->
    <rect x="40" y="640" width="1040" height="35" rx="0" fill="rgba(0,0,0,0.6)"/>
    <text x="60" y="663" fill="white" font-family="Inter, monospace" font-size="11">0:45 / 1:23</text>
    <rect x="170" y="654" width="800" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
    <rect x="170" y="654" width="420" height="4" rx="2" fill="${CYAN}"/>
    <circle cx="590" cy="656" r="6" fill="white"/>
  </g>
  
  <text x="640" y="790" fill="${TEXT2}" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">Preview recordings and export as WebM or MP4 with real-time conversion progress</text>
</svg>`;
}

// ── Small Promo Tile (440x280) — displayed ~220x140, fonts must be HUGE ──
function promoSmall() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
  <defs>${gradientDef()}</defs>
  <rect width="440" height="280" fill="url(#bgGrad)"/>
  
  <!-- Background glow -->
  <circle cx="220" cy="140" r="250" fill="${PURPLE}" opacity="0.06"/>
  <circle cx="380" cy="220" r="180" fill="${CYAN}" opacity="0.05"/>
  
  <!-- Icon -->
  ${iconSvg(30, 50, 80)}
  
  <!-- Title - LARGE -->
  <text x="130" y="100" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="800">ScreenKing</text>
  
  <!-- Subtitle -->
  <text x="130" y="140" fill="${TEXT2}" font-family="Inter, Arial, sans-serif" font-size="22">Screenshot &amp; Recorder</text>
  
  <!-- Feature tags - big and bold -->
  <rect x="30" y="180" width="120" height="40" rx="20" fill="${PURPLE}" opacity="0.2" stroke="${PURPLE}" stroke-width="2"/>
  <text x="90" y="206" fill="${PURPLE}" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="700">Capture</text>
  
  <rect x="165" y="180" width="110" height="40" rx="20" fill="${CYAN}" opacity="0.2" stroke="${CYAN}" stroke-width="2"/>
  <text x="220" y="206" fill="${CYAN}" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="700">Record</text>
  
  <rect x="290" y="180" width="120" height="40" rx="20" fill="${ACCENT}" opacity="0.2" stroke="${ACCENT}" stroke-width="2"/>
  <text x="350" y="206" fill="${ACCENT}" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle" font-weight="700">Annotate</text>
  
  <!-- Tagline -->
  <text x="220" y="256" fill="${TEXT2}" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle">All-in-One · Free · Open Source</text>
</svg>`;
}

// ── Large Promo / Marquee (1400x560) — displayed ~700x280, fonts 2x ──
function promoLarge() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560">
  <defs>${gradientDef()}</defs>
  <rect width="1400" height="560" fill="url(#bgGrad)"/>
  
  <!-- Background glow -->
  <circle cx="450" cy="280" r="400" fill="${PURPLE}" opacity="0.05"/>
  <circle cx="1050" cy="280" r="350" fill="${CYAN}" opacity="0.05"/>
  
  <!-- Left side: Branding -->
  <g transform="translate(80, 60)">
    ${iconSvg(0, 10, 100)}
    
    <text x="120" y="80" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800">ScreenKing</text>
    
    <text x="0" y="150" fill="${TEXT2}" font-family="Inter, Arial, sans-serif" font-size="32">Screenshot &amp; Screen Recorder</text>
    <text x="0" y="195" fill="${TEXT2}" font-family="Inter, Arial, sans-serif" font-size="32">with Built-in Editor</text>
    
    <!-- Feature list - large text -->
    <text x="0" y="270" fill="${CYAN}" font-family="Inter, Arial, sans-serif" font-size="26">✦</text>
    <text x="36" y="270" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="26">Full page, visible area &amp; region capture</text>
    
    <text x="0" y="310" fill="${CYAN}" font-family="Inter, Arial, sans-serif" font-size="26">✦</text>
    <text x="36" y="310" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="26">Tab &amp; desktop screen recording</text>
    
    <text x="0" y="350" fill="${CYAN}" font-family="Inter, Arial, sans-serif" font-size="26">✦</text>
    <text x="36" y="350" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="26">Export as PNG, JPEG, WebP, MP4</text>

    <!-- CTA button -->
    <rect x="0" y="390" width="280" height="64" rx="32" fill="url(#btnGrad)"/>
    <text x="140" y="430" fill="white" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle">Add to Chrome</text>
    
    <text x="310" y="430" fill="${TEXT2}" font-family="Inter, Arial, sans-serif" font-size="22">Free &amp; Open Source</text>
  </g>
  
  <!-- Right side: Simplified popup mockup -->
  <g transform="translate(900, 40)">
    <rect x="0" y="0" width="440" height="480" rx="20" fill="${BG2}" stroke="${BORDER}" stroke-width="2" opacity="0.9"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="440" height="64" rx="20" fill="${BG3}"/>
    <rect x="0" y="44" width="440" height="20" fill="${BG3}"/>
    ${iconSvg(16, 12, 40)}
    <text x="68" y="42" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700">ScreenKing</text>
    
    <!-- Menu items - bigger -->
    <rect x="16" y="80" width="408" height="54" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="114" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18">📷 Capture Visible</text>
    
    <rect x="16" y="142" width="408" height="54" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="176" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18">📄 Full Page</text>
    
    <rect x="16" y="204" width="408" height="54" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="238" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18">✂️ Select Region</text>
    
    <text x="28" y="290" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600">🎬 Recording</text>
    
    <rect x="16" y="304" width="408" height="54" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="338" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18">🖥️ Record Tab</text>
    
    <rect x="16" y="366" width="408" height="54" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="400" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="18">💻 Record Desktop</text>
    
    <!-- Toggle -->
    <rect x="16" y="434" width="408" height="40" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="48" y="460" fill="${TEXT}" font-family="Inter, Arial, sans-serif" font-size="16">📋 Auto Copy</text>
    <rect x="370" y="444" width="40" height="22" rx="11" fill="${PURPLE}"/>
    <circle cx="398" cy="455" r="8" fill="white"/>
  </g>
</svg>`;
}

// ══════════════════════════════════════════
// ── Chinese (zh-CN) Screenshots ──
// ══════════════════════════════════════════

function screenshot1_popup_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  <circle cx="200" cy="600" r="300" fill="${PURPLE}" opacity="0.03"/>
  <circle cx="1100" cy="200" r="250" fill="${CYAN}" opacity="0.03"/>
  <g transform="translate(390, 60)">
    <rect x="0" y="0" width="500" height="680" rx="16" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="0" width="500" height="70" rx="16" fill="${BG3}"/>
    <rect x="0" y="50" width="500" height="20" fill="${BG3}"/>
    ${iconSvg(20, 15, 40)}
    <text x="72" y="42" fill="${TEXT}" font-family="sans-serif" font-size="18" font-weight="700">ScreenKing</text>
    <text x="24" y="104" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">📷 截图</text>
    <rect x="16" y="118" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="150" fill="${TEXT}" font-family="sans-serif" font-size="13">截取可见区域</text>
    <rect x="350" y="132" width="120" height="24" rx="6" fill="${BG}" stroke="${BORDER}" stroke-width="1"/>
    <text x="368" y="149" fill="${TEXT2}" font-family="monospace" font-size="11">Alt+Shift+V</text>
    <rect x="16" y="178" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="210" fill="${TEXT}" font-family="sans-serif" font-size="13">截取整页</text>
    <rect x="16" y="238" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="270" fill="${TEXT}" font-family="sans-serif" font-size="13">选取区域</text>
    <text x="24" y="326" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">🎬 录制</text>
    <rect x="16" y="340" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="372" fill="${TEXT}" font-family="sans-serif" font-size="13">录制当前标签页</text>
    <rect x="16" y="400" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="432" fill="${TEXT}" font-family="sans-serif" font-size="13">录制桌面</text>
    <text x="24" y="490" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">🔗 分享</text>
    <rect x="16" y="504" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="536" fill="${TEXT}" font-family="sans-serif" font-size="13">分享到网络</text>
    <rect x="16" y="570" width="468" height="52" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="52" y="602" fill="${TEXT}" font-family="sans-serif" font-size="13">自动复制到剪贴板</text>
    <rect x="424" y="586" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="454" cy="598" r="9" fill="white"/>
  </g>
  <text x="640" y="775" fill="${TEXT2}" font-family="sans-serif" font-size="14" text-anchor="middle">简洁直观的弹窗界面，快速访问所有截图和录制模式</text>
</svg>`;
}

function screenshot2_editor_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}
    <filter id="blurFilter"><feGaussianBlur in="SourceGraphic" stdDeviation="6"/></filter>
  </defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  <g transform="translate(60, 30)">
    <rect x="0" y="0" width="1160" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="0" width="1160" height="56" rx="12" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="40" width="1160" height="16" fill="${BG3}"/>
    <!-- Tool buttons -->
    <rect x="16" y="10" width="36" height="36" rx="8" fill="${PURPLE}" opacity="0.25" stroke="${PURPLE}" stroke-width="1.5"/>
    <text x="26" y="34" fill="${PURPLE}" font-size="16">✏️</text>
    <rect x="60" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="70" y="34" fill="${TEXT2}" font-size="16">📝</text>
    <rect x="104" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="114" y="34" fill="${TEXT2}" font-size="16">⬜</text>
    <rect x="148" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="158" y="34" fill="${TEXT2}" font-size="16">⭕</text>
    <rect x="192" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="202" y="34" fill="${TEXT2}" font-size="16">➡️</text>
    <rect x="236" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="246" y="34" fill="${TEXT2}" font-size="16">🔤</text>
    <rect x="280" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="290" y="34" fill="${TEXT2}" font-size="16">🌫️</text>
    <rect x="324" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="334" y="34" fill="${TEXT2}" font-size="16">✂️</text>
    <line x1="380" y1="12" x2="380" y2="44" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="408" cy="28" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
    <circle cx="438" cy="28" r="12" fill="#F59E0B"/>
    <circle cx="468" cy="28" r="12" fill="#22C55E"/>
    <circle cx="498" cy="28" r="12" fill="#3B82F6"/>
    <circle cx="528" cy="28" r="12" fill="#8B5CF6"/>
    <circle cx="558" cy="28" r="12" fill="white"/>
    <line x1="590" y1="12" x2="590" y2="44" stroke="${BORDER}" stroke-width="1"/>
    <text x="610" y="32" fill="${TEXT2}" font-family="sans-serif" font-size="11">粗细</text>
    <rect x="646" y="22" width="80" height="6" rx="3" fill="${BG}"/>
    <rect x="646" y="22" width="50" height="6" rx="3" fill="#EF4444"/>
    <circle cx="696" cy="25" r="6" fill="white"/>
    <rect x="790" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="800" y="34" fill="${TEXT2}" font-size="14">↩️</text>
    <rect x="832" y="10" width="36" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="0.5"/>
    <text x="842" y="34" fill="${TEXT2}" font-size="14" opacity="0.4">↪️</text>
    <rect x="920" y="10" width="100" height="36" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="940" y="34" fill="${TEXT}" font-family="sans-serif" font-size="12">💾 保存</text>
    <rect x="1030" y="10" width="115" height="36" rx="8" fill="url(#btnGrad)"/>
    <text x="1050" y="34" fill="white" font-family="sans-serif" font-size="12" font-weight="600">📋 复制</text>
    
    <!-- Canvas: webpage screenshot -->
    <rect x="20" y="66" width="1120" height="660" rx="8" fill="#f8f9fa"/>
    <rect x="20" y="66" width="1120" height="40" rx="8" fill="#e9ecef"/>
    <rect x="20" y="98" width="1120" height="8" fill="#e9ecef"/>
    <circle cx="44" cy="86" r="6" fill="#ff5f57"/>
    <circle cx="64" cy="86" r="6" fill="#ffbd2e"/>
    <circle cx="84" cy="86" r="6" fill="#28c840"/>
    <rect x="120" y="78" width="350" height="18" rx="9" fill="white" stroke="#d1d5db" stroke-width="0.5"/>
    <text x="140" y="91" fill="#6b7280" font-family="sans-serif" font-size="10">example.com/dashboard</text>
    <rect x="20" y="106" width="1120" height="60" fill="#1e293b"/>
    <text x="60" y="142" fill="white" font-family="sans-serif" font-size="18" font-weight="700">Dashboard</text>
    <rect x="900" y="124" width="80" height="30" rx="6" fill="#3b82f6"/>
    <text x="918" y="144" fill="white" font-family="sans-serif" font-size="11">Settings</text>
    <rect x="990" y="124" width="110" height="30" rx="6" fill="#8b5cf6"/>
    <text x="1010" y="144" fill="white" font-family="sans-serif" font-size="11">+ New Item</text>
    <rect x="40" y="186" width="520" height="200" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="60" y="216" fill="#1e293b" font-family="sans-serif" font-size="14" font-weight="600">Monthly Revenue</text>
    <text x="60" y="240" fill="#6b7280" font-family="sans-serif" font-size="11">Last 30 days performance</text>
    <rect x="60" y="340" width="40" height="30" rx="3" fill="#c7d2fe"/>
    <rect x="110" y="320" width="40" height="50" rx="3" fill="#c7d2fe"/>
    <rect x="160" y="300" width="40" height="70" rx="3" fill="#c7d2fe"/>
    <rect x="210" y="290" width="40" height="80" rx="3" fill="#a5b4fc"/>
    <rect x="260" y="270" width="40" height="100" rx="3" fill="#818cf8"/>
    <rect x="310" y="280" width="40" height="90" rx="3" fill="#818cf8"/>
    <rect x="360" y="260" width="40" height="110" rx="3" fill="#6366f1"/>
    <rect x="410" y="290" width="40" height="80" rx="3" fill="#818cf8"/>
    <rect x="460" y="310" width="40" height="60" rx="3" fill="#a5b4fc"/>
    <rect x="580" y="186" width="540" height="90" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="600" y="216" fill="#1e293b" font-family="sans-serif" font-size="13" font-weight="600">Total Users</text>
    <text x="600" y="240" fill="#6366f1" font-family="sans-serif" font-size="22" font-weight="700">12,847</text>
    <text x="600" y="260" fill="#22c55e" font-family="sans-serif" font-size="11">▲ 12.5%</text>
    <rect x="580" y="286" width="540" height="90" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="600" y="316" fill="#1e293b" font-family="sans-serif" font-size="13" font-weight="600">Active Sessions</text>
    <text x="600" y="340" fill="#6366f1" font-family="sans-serif" font-size="22" font-weight="700">3,291</text>
    <text x="600" y="360" fill="#22c55e" font-family="sans-serif" font-size="11">▲ 8.3%</text>
    <rect x="40" y="406" width="1080" height="300" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
    <text x="60" y="436" fill="#1e293b" font-family="sans-serif" font-size="14" font-weight="600">Recent Orders</text>
    <rect x="40" y="450" width="1080" height="30" fill="#f9fafb"/>
    <text x="60" y="470" fill="#6b7280" font-family="sans-serif" font-size="11" font-weight="600">Order ID</text>
    <text x="240" y="470" fill="#6b7280" font-family="sans-serif" font-size="11" font-weight="600">Customer</text>
    <text x="500" y="470" fill="#6b7280" font-family="sans-serif" font-size="11" font-weight="600">Email</text>
    <text x="780" y="470" fill="#6b7280" font-family="sans-serif" font-size="11" font-weight="600">Amount</text>
    <text x="960" y="470" fill="#6b7280" font-family="sans-serif" font-size="11" font-weight="600">Status</text>
    <text x="60" y="505" fill="#374151" font-family="sans-serif" font-size="11">#ORD-7291</text>
    <text x="240" y="505" fill="#374151" font-family="sans-serif" font-size="11">Sarah Johnson</text>
    <text x="500" y="505" fill="#6b7280" font-family="sans-serif" font-size="11">sarah@example.com</text>
    <text x="780" y="505" fill="#374151" font-family="sans-serif" font-size="11" font-weight="600">$299.00</text>
    <rect x="960" y="492" width="70" height="20" rx="10" fill="#dcfce7"/>
    <text x="978" y="506" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="600">Completed</text>
    <line x1="40" y1="518" x2="1120" y2="518" stroke="#f3f4f6" stroke-width="1"/>
    <text x="60" y="540" fill="#374151" font-family="sans-serif" font-size="11">#ORD-7290</text>
    <text x="240" y="540" fill="#374151" font-family="sans-serif" font-size="11">Mike Chen</text>
    <text x="500" y="540" fill="#6b7280" font-family="sans-serif" font-size="11">mike@example.com</text>
    <text x="780" y="540" fill="#374151" font-family="sans-serif" font-size="11" font-weight="600">$149.50</text>
    <rect x="960" y="527" width="60" height="20" rx="10" fill="#fef9c3"/>
    <text x="973" y="541" fill="#a16207" font-family="sans-serif" font-size="10" font-weight="600">Pending</text>
    <line x1="40" y1="553" x2="1120" y2="553" stroke="#f3f4f6" stroke-width="1"/>
    <text x="60" y="575" fill="#374151" font-family="sans-serif" font-size="11">#ORD-7289</text>
    <text x="240" y="575" fill="#374151" font-family="sans-serif" font-size="11">Emily Davis</text>
    <text x="500" y="575" fill="#6b7280" font-family="sans-serif" font-size="11">emily@example.com</text>
    <text x="780" y="575" fill="#374151" font-family="sans-serif" font-size="11" font-weight="600">$89.99</text>

    <!-- ANNOTATIONS (Chinese labels) -->
    <line x1="480" y1="210" x2="400" y2="260" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
    <polygon points="400,260 415,248 408,264" fill="#EF4444"/>
    <ellipse cx="660" cy="238" rx="80" ry="20" fill="none" stroke="#EF4444" stroke-width="3"/>
    <rect x="740" y="208" width="180" height="36" rx="6" fill="#EF4444" opacity="0.9"/>
    <text x="755" y="232" fill="white" font-family="sans-serif" font-size="14" font-weight="700">关键指标！</text>
    <line x1="740" y1="230" x2="720" y2="238" stroke="#EF4444" stroke-width="2"/>
    <path d="M58,218 Q100,225 180,218 Q220,215 260,220 Q300,224 340,218" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    <rect x="985" y="118" width="122" height="42" rx="4" fill="none" stroke="#22C55E" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="990" y="112" fill="#22C55E" font-family="sans-serif" font-size="11" font-weight="700">点击这里 →</text>
    <rect x="494" y="490" width="260" height="100" rx="4" fill="${BG3}" opacity="0.85" filter="url(#blurFilter)"/>
    <rect x="494" y="490" width="260" height="100" rx="4" fill="none" stroke="${TEXT2}" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="570" y="545" fill="${TEXT}" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle" opacity="0.7">🔒 已模糊</text>
  </g>
  <text x="640" y="790" fill="${TEXT2}" font-family="sans-serif" font-size="14" text-anchor="middle">强大的标注编辑器：画笔、文字、箭头、模糊等丰富工具</text>
</svg>`;
}

function screenshot3_history_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  <g transform="translate(40, 20)">
    <rect x="0" y="0" width="1200" height="760" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="0" width="1200" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="1200" height="16" fill="${BG3}"/>
    ${iconSvg(20, 12, 40)}
    <text x="72" y="40" fill="${TEXT}" font-family="sans-serif" font-size="18" font-weight="700">历史记录</text>
    <rect x="220" y="16" width="60" height="32" rx="8" fill="${PURPLE}"/>
    <text x="237" y="37" fill="white" font-family="sans-serif" font-size="12" font-weight="600">全部</text>
    <rect x="288" y="16" width="72" height="32" rx="8" fill="${BG2}"/>
    <text x="306" y="37" fill="${TEXT2}" font-family="sans-serif" font-size="12">截图</text>
    <rect x="368" y="16" width="72" height="32" rx="8" fill="${BG2}"/>
    <text x="386" y="37" fill="${TEXT2}" font-family="sans-serif" font-size="12">录制</text>
    <rect x="900" y="16" width="200" height="32" rx="8" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="920" y="37" fill="${TEXT2}" font-family="sans-serif" font-size="12">🔍 搜索...</text>
    ${[0,1,2,3].map(col => [0,1,2].map(row => {
      const x = 16 + col * 294;
      const y = 80 + row * 220;
      const isVideo = (col + row) % 3 === 0;
      const colors = ['#1a1a3e', '#1a2a3e', '#2a1a3e', '#1a3a2e', '#3a1a2e', '#1a2a2e'];
      const color = colors[(col + row) % colors.length];
      return `
        <rect x="${x}" y="${y}" width="278" height="204" rx="10" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
        <rect x="${x + 8}" y="${y + 8}" width="262" height="148" rx="6" fill="${color}"/>
        ${isVideo ? `<circle cx="${x + 139}" cy="${y + 82}" r="20" fill="rgba(0,0,0,0.5)"/>
          <polygon points="${x+133},${y+74} ${x+133},${y+90} ${x+148},${y+82}" fill="white"/>` : `
          <rect x="${x + 20}" y="${y + 30}" width="222" height="12" rx="3" fill="${TEXT2}" opacity="0.15"/>
          <rect x="${x + 20}" y="${y + 50}" width="180" height="12" rx="3" fill="${TEXT2}" opacity="0.1"/>`}
        <text x="${x + 16}" y="${y + 176}" fill="${TEXT}" font-family="sans-serif" font-size="11">${isVideo ? '🎬 屏幕录制' : '📷 截图'}</text>
        <text x="${x + 16}" y="${y + 194}" fill="${TEXT2}" font-family="sans-serif" font-size="10">2026/7/2 · ${isVideo ? '2.4 MB' : '156 KB'}</text>`;
    }).join('')).join('')}
  </g>
  <text x="640" y="790" fill="${TEXT2}" font-family="sans-serif" font-size="14" text-anchor="middle">历史记录画廊：搜索、筛选、批量操作、快速预览</text>
</svg>`;
}

function screenshot4_settings_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  <g transform="translate(240, 30)">
    <rect x="0" y="0" width="800" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="0" width="800" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="800" height="16" fill="${BG3}"/>
    ${iconSvg(20, 12, 40)}
    <text x="72" y="40" fill="${TEXT}" font-family="sans-serif" font-size="18" font-weight="700">设置</text>
    <text x="110" y="40" fill="${TEXT2}" font-family="sans-serif" font-size="12">v3.0.1</text>
    <rect x="20" y="80" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="106" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">📷 截图</text>
    <text x="40" y="154" fill="${TEXT}" font-family="sans-serif" font-size="13">图片格式</text>
    <text x="40" y="172" fill="${TEXT2}" font-family="sans-serif" font-size="11">保存截图的默认格式</text>
    <rect x="620" y="138" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="660" y="159" fill="${TEXT}" font-family="sans-serif" font-size="12">PNG ▾</text>
    <text x="40" y="218" fill="${TEXT}" font-family="sans-serif" font-size="13">图片质量</text>
    <rect x="580" y="210" width="160" height="8" rx="4" fill="${BG3}"/>
    <rect x="580" y="210" width="128" height="8" rx="4" fill="url(#btnGrad)"/>
    <circle cx="708" cy="214" r="8" fill="white"/>
    <text x="40" y="282" fill="${TEXT}" font-family="sans-serif" font-size="13">自动复制到剪贴板</text>
    <rect x="716" y="274" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="746" cy="286" r="9" fill="white"/>
    <rect x="20" y="328" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="354" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">🎬 录制</text>
    <text x="40" y="402" fill="${TEXT}" font-family="sans-serif" font-size="13">视频格式</text>
    <rect x="620" y="386" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="640" y="407" fill="${TEXT}" font-family="sans-serif" font-size="12">WebM (VP9) ▾</text>
    <text x="40" y="466" fill="${TEXT}" font-family="sans-serif" font-size="13">帧率</text>
    <rect x="620" y="450" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="670" y="471" fill="${TEXT}" font-family="sans-serif" font-size="12">30 FPS ▾</text>
    <rect x="20" y="520" width="760" height="40" rx="8" fill="${BG3}"/>
    <text x="56" y="546" fill="${TEXT}" font-family="sans-serif" font-size="14" font-weight="600">⚙ 通用</text>
    <text x="40" y="594" fill="${TEXT}" font-family="sans-serif" font-size="13">主题</text>
    <rect x="620" y="578" width="140" height="32" rx="6" fill="${BG3}" stroke="${BORDER}" stroke-width="1"/>
    <text x="660" y="599" fill="${TEXT}" font-family="sans-serif" font-size="12">深色 ▾</text>
    <text x="40" y="658" fill="${TEXT}" font-family="sans-serif" font-size="13">通知</text>
    <rect x="716" y="650" width="44" height="24" rx="12" fill="${PURPLE}"/>
    <circle cx="746" cy="662" r="9" fill="white"/>
  </g>
  <text x="640" y="790" fill="${TEXT2}" font-family="sans-serif" font-size="14" text-anchor="middle">丰富的自定义设置：截图、录制、通用选项一应俱全</text>
</svg>`;
}

function screenshot5_preview_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>${gradientDef()}</defs>
  <rect width="1280" height="800" fill="url(#bgGrad)"/>
  <g transform="translate(80, 30)">
    <rect x="0" y="0" width="1120" height="740" rx="12" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="0" y="0" width="1120" height="64" rx="12" fill="${BG3}"/>
    <rect x="0" y="48" width="1120" height="16" fill="${BG3}"/>
    <text x="24" y="28" fill="${TEXT}" font-size="16">🎬</text>
    <text x="52" y="38" fill="${TEXT}" font-family="sans-serif" font-size="16" font-weight="700">录制预览</text>
    <text x="160" y="36" fill="${TEXT2}" font-family="sans-serif" font-size="12">⏱ 1分23秒</text>
    <text x="260" y="36" fill="${TEXT2}" font-family="sans-serif" font-size="12">📦 4.2 MB</text>
    <rect x="780" y="16" width="120" height="32" rx="6" fill="${BG2}" stroke="${BORDER}" stroke-width="1"/>
    <text x="800" y="37" fill="${CYAN}" font-family="sans-serif" font-size="12" font-weight="600">MP4 (H.264) ▾</text>
    <rect x="910" y="16" width="130" height="32" rx="8" fill="url(#btnGrad)"/>
    <text x="936" y="37" fill="white" font-family="sans-serif" font-size="12" font-weight="600">转换中：67%</text>
    <rect x="1050" y="16" width="52" height="32" rx="8" fill="#EF4444" opacity="0.15" stroke="#EF4444" stroke-width="1"/>
    <text x="1064" y="37" fill="#EF4444" font-size="12">🗑️</text>
    <rect x="0" y="64" width="1120" height="3" fill="${BG3}"/>
    <rect x="0" y="64" width="750" height="3" fill="url(#btnGrad)"/>
    <rect x="40" y="90" width="1040" height="585" rx="8" fill="#0a0a1a"/>
    <rect x="80" y="120" width="960" height="500" rx="4" fill="#111128"/>
    <rect x="120" y="150" width="400" height="30" rx="4" fill="${TEXT2}" opacity="0.1"/>
    <rect x="120" y="200" width="880" height="16" rx="3" fill="${TEXT2}" opacity="0.08"/>
    <rect x="120" y="260" width="800" height="16" rx="3" fill="${TEXT2}" opacity="0.08"/>
    <circle cx="560" cy="400" r="40" fill="rgba(0,0,0,0.5)"/>
    <polygon points="548,380 548,420 580,400" fill="white"/>
    <rect x="40" y="640" width="1040" height="35" fill="rgba(0,0,0,0.6)"/>
    <text x="60" y="663" fill="white" font-family="monospace" font-size="11">0:45 / 1:23</text>
    <rect x="170" y="654" width="800" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
    <rect x="170" y="654" width="420" height="4" rx="2" fill="${CYAN}"/>
    <circle cx="590" cy="656" r="6" fill="white"/>
  </g>
  <text x="640" y="790" fill="${TEXT2}" font-family="sans-serif" font-size="14" text-anchor="middle">预览录制内容，支持 WebM 或 MP4 导出，实时显示转换进度</text>
</svg>`;
}

function promoSmall_zh() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280">
  <defs>${gradientDef()}</defs>
  <rect width="440" height="280" fill="url(#bgGrad)"/>
  <circle cx="220" cy="140" r="250" fill="${PURPLE}" opacity="0.06"/>
  <circle cx="380" cy="220" r="180" fill="${CYAN}" opacity="0.05"/>
  ${iconSvg(15, 50, 80)}
  <text x="105" y="100" fill="${TEXT}" font-family="Arial, sans-serif" font-size="48" font-weight="800">ScreenKing</text>
  <text x="130" y="140" fill="${TEXT2}" font-family="sans-serif" font-size="22">截图与录屏工具</text>
  <rect x="30" y="180" width="120" height="40" rx="20" fill="${PURPLE}" opacity="0.2" stroke="${PURPLE}" stroke-width="2"/>
  <text x="90" y="206" fill="${PURPLE}" font-family="sans-serif" font-size="18" text-anchor="middle" font-weight="700">截图</text>
  <rect x="165" y="180" width="110" height="40" rx="20" fill="${CYAN}" opacity="0.2" stroke="${CYAN}" stroke-width="2"/>
  <text x="220" y="206" fill="${CYAN}" font-family="sans-serif" font-size="18" text-anchor="middle" font-weight="700">录制</text>
  <rect x="290" y="180" width="120" height="40" rx="20" fill="${ACCENT}" opacity="0.2" stroke="${ACCENT}" stroke-width="2"/>
  <text x="350" y="206" fill="${ACCENT}" font-family="sans-serif" font-size="18" text-anchor="middle" font-weight="700">标注</text>
  <text x="220" y="256" fill="${TEXT2}" font-family="sans-serif" font-size="18" text-anchor="middle">一站式 · 免费 · 开源</text>
</svg>`;
}

// ── Generate all assets ──
async function generateAll() {
  const assets = [
    // English
    { name: 'screenshot-1-popup', svg: screenshot1_popup(), w: 1280, h: 800 },
    { name: 'screenshot-2-editor', svg: screenshot2_editor(), w: 1280, h: 800 },
    { name: 'screenshot-3-history', svg: screenshot3_history(), w: 1280, h: 800 },
    { name: 'screenshot-4-settings', svg: screenshot4_settings(), w: 1280, h: 800 },
    { name: 'screenshot-5-preview', svg: screenshot5_preview(), w: 1280, h: 800 },
    { name: 'promo-small-440x280', svg: promoSmall(), w: 440, h: 280 },
    { name: 'promo-marquee-1400x560', svg: promoLarge(), w: 1400, h: 560 },
    // Chinese
    { name: 'zh-screenshot-1-popup', svg: screenshot1_popup_zh(), w: 1280, h: 800 },
    { name: 'zh-screenshot-2-editor', svg: screenshot2_editor_zh(), w: 1280, h: 800 },
    { name: 'zh-screenshot-3-history', svg: screenshot3_history_zh(), w: 1280, h: 800 },
    { name: 'zh-screenshot-4-settings', svg: screenshot4_settings_zh(), w: 1280, h: 800 },
    { name: 'zh-screenshot-5-preview', svg: screenshot5_preview_zh(), w: 1280, h: 800 },
    { name: 'zh-promo-small-440x280', svg: promoSmall_zh(), w: 440, h: 280 },
  ];

  for (const asset of assets) {
    const svgPath = path.join(outDir, `${asset.name}.svg`);
    const pngPath = path.join(outDir, `${asset.name}.png`);
    fs.writeFileSync(svgPath, asset.svg);
    await sharp(Buffer.from(asset.svg))
      .resize(asset.w, asset.h)
      .png()
      .toFile(pngPath);
    const stat = fs.statSync(pngPath);
    console.log(`✓ ${asset.name}.png (${(stat.size / 1024).toFixed(1)} KB)`);
  }
  console.log(`\nAll assets saved to ${outDir}/`);
}

generateAll().catch(console.error);

