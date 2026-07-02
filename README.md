# SnapCraft — Screenshot & Screen Recorder

A powerful Chrome extension for capturing screenshots and recording your screen, built with modern web technologies.

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
- **Preview & Download** — Preview recordings before saving

### ✏️ Annotation Editor
| Tool | Description |
|------|-------------|
| ✏️ Pen | Freehand drawing |
| 🖊️ Highlighter | Semi-transparent marker |
| ➡️ Arrow | Draw arrows |
| 📏 Line | Straight lines |
| ▬ Rectangle | Rectangles & squares |
| ⭕ Ellipse | Circles & ovals |
| 🔤 Text | Add text labels |
| 🔢 Step Number | Numbered circles for tutorials |
| 🟦 Blur/Mosaic | Pixelate sensitive info |
| ✂️ Crop | Crop to selection |

### 📦 Other Features
- **History** — Browse all captures stored locally in IndexedDB
- **Settings** — Customize format, quality, FPS, shortcuts
- **HiDPI Support** — Retina/4K display aware
- **Dark Theme** — Beautiful glassmorphism dark UI
- **Keyboard Shortcuts** — Configurable via `chrome://extensions/shortcuts`

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
│   └── preview/PreviewApp.tsx   # Recording preview
├── lib/
│   ├── editor/engine.ts   # Canvas rendering & export engine
│   ├── storage.ts         # IndexedDB + Chrome Storage layer
│   ├── messaging.ts       # Message passing utilities
│   └── types.ts           # Shared TypeScript types
├── utils/
│   ├── download.ts        # File download & clipboard utilities
│   └── image.ts           # Image processing (crop, stitch, thumbnail)
└── styles/
    ├── design-system.css  # CSS variables & design tokens
    ├── reset.css          # CSS reset
    └── animations.css     # Shared animations
```

## 📝 License

MIT
