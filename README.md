# SnapCraft — Screenshot & Screen Recorder

<p align="center">
  <img src="public/icon/128.png" width="80" alt="SnapCraft Logo" />
</p>

<p align="center">
  <strong>Capture screenshots, record your screen, and annotate — all without leaving your browser.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-store-assets">Store Assets</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <strong>English</strong> | <a href="README_ZH.md">中文</a>
</p>

---

## ✨ Features

### 📸 Screenshot
- **Visible Area** — Capture what's currently visible in the tab
- **Full Page** — Scroll-capture the entire page, stitched into one image
- **Region Select** — Click and drag to capture a specific area
- **Built-in Editor** — Annotate screenshots with 10+ tools before saving

### 🎬 Screen Recording
- **Tab Recording** — Record a specific browser tab with audio
- **Screen Recording** — Record your entire screen, window, or specific app
- **Recording Controls** — Floating control bar with timer, pause/resume, drag-to-move
- **Preview & Export** — Preview recordings, export as WebM or MP4 (H.264) with real-time conversion

### ✏️ Annotation Editor
| Tool | Description |
|------|-------------|
| ✏️ Pen | Freehand drawing with custom color & thickness |
| 🖊️ Highlighter | Semi-transparent marker |
| ➡️ Arrow | Draw arrows |
| 📏 Line | Straight lines |
| ▬ Rectangle | Rectangles & squares |
| ⭕ Ellipse | Circles & ovals |
| 🔤 Text | Add text labels with adjustable font size |
| 🔢 Step Number | Numbered circles for tutorials |
| 🟦 Blur/Mosaic | Pixelate sensitive information |
| ✂️ Crop | Crop to selection |

### 📋 Smart Features
- **Auto-copy** to clipboard after capture
- **Keyboard shortcuts** — `Alt+Shift+V` / `F` / `S` for quick capture
- **Right-click context menu** for instant access
- **Desktop notifications** on capture completion
- **Customizable filename patterns** with date/time variables

### 📁 Capture History
- Gallery view with thumbnail previews
- Search & filter by type (screenshots / recordings)
- Batch select, download, and delete
- Quick preview with metadata (size, date, dimensions)

### ⚙️ Customizable Settings
- Image format: PNG, JPEG, WebP
- Image quality slider (1–100)
- Video format: WebM (VP9) or MP4 (H.264)
- Recording quality: 720p / 1080p / Original
- Frame rate: 15 / 24 / 30 / 60 FPS
- Recording countdown timer
- System audio & microphone toggle
- Dark theme
- Max history items control

### 🌍 Multilingual
- English and Chinese (Simplified) interface
- All UI text via `chrome.i18n`

### 🔒 Privacy
- All data stays local — no cloud uploads, no tracking
- No account required
- Open source

## 🛠️ Tech Stack

- [WXT](https://wxt.dev/) — Next-gen web extension framework
- [React 19](https://react.dev/) — UI components
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Dexie.js](https://dexie.org/) — IndexedDB wrapper for storage
- Chrome Extension Manifest V3

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install & Dev

```bash
# Install dependencies
npm install

# Start development (auto-reloads extension in Chrome)
npm run dev
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3-dev` folder

### Build for Production

```bash
npm run build
```

Output will be in `.output/chrome-mv3/`.

## 📁 Project Structure

```
entrypoints/
├── background.ts          # Service worker (message routing, capture logic)
├── popup/                 # Extension popup UI
├── editor/                # Screenshot annotation editor
├── preview/               # Recording preview page
├── captures/              # History gallery page
├── options/               # Settings page
├── offscreen/             # Offscreen document (MediaRecorder)
├── region-selector.content.ts  # Region selection overlay
└── recording-controls.content.ts  # Recording floating bar

src/
├── components/
│   ├── editor/EditorApp.tsx     # Canvas-based annotation editor
│   ├── history/HistoryApp.tsx   # Capture history gallery
│   ├── options/OptionsApp.tsx   # Settings UI
│   └── preview/PreviewApp.tsx   # Recording preview & MP4 converter
├── lib/
│   ├── editor/engine.ts   # Canvas rendering & export engine
│   ├── storage.ts         # IndexedDB + Chrome Storage layer
│   ├── messaging.ts       # Message passing utilities
│   ├── i18n.ts            # Internationalization helper
│   └── types.ts           # Shared TypeScript types
├── utils/
│   ├── download.ts        # File download & clipboard utilities
│   ├── image.ts           # Image processing (crop, stitch, thumbnail)
│   └── mp4-converter.ts   # WebM → MP4 real-time conversion (WebCodecs)
└── styles/
    ├── design-system.css  # CSS variables & design tokens
    ├── reset.css          # CSS reset
    └── animations.css     # Shared animations

public/
├── _locales/              # i18n messages (en, zh_CN)
└── icon/                  # Extension icons (16/32/48/96/128px)

store-assets/              # Chrome Web Store listing assets
├── screenshot-*.png       # EN screenshots (1280×800)
├── zh-screenshot-*.png    # ZH screenshots (1280×800)
├── promo-small-440x280.png
├── promo-marquee-1400x560.png
└── LISTING.md             # Store description (EN + ZH)
```

## 🖼️ Store Assets

Store listing images are generated via SVG → PNG pipeline:

```bash
node gen-store-assets.cjs
```

Outputs 13 PNG images to `store-assets/`:
- 5 English + 5 Chinese screenshots (1280×800)
- 2 English + 1 Chinese promo tiles
- All SVG sources retained for easy editing

## 📝 License

MIT
