# SnapCraft — 截图与录屏工具

<p align="center">
  <img src="public/icon/128.png" width="80" alt="SnapCraft Logo" />
</p>

<p align="center">
  <strong>截图、录屏、标注，全部在浏览器内完成。</strong>
</p>

<p align="center">
  <a href="#-功能特性">功能</a> •
  <a href="#-快速开始">开始</a> •
  <a href="#-项目结构">结构</a> •
  <a href="#-商店素材">素材</a> •
  <a href="#-许可证">许可证</a>
</p>

<p align="center">
  <a href="README.md">English</a> | <strong>中文</strong>
</p>

---

## ✨ 功能特性

### 📸 截图
- **截取可见区域** — 一键截取当前屏幕内容
- **截取整页** — 自动滚动截取完整网页，拼接为一张图片
- **选取区域** — 拖拽选择自定义截图范围
- **内置编辑器** — 截图后使用 10+ 种标注工具进行编辑

### 🎬 屏幕录制
- **标签页录制** — 录制指定浏览器标签页及音频
- **桌面录制** — 录制整个屏幕、窗口或指定应用
- **录制控制** — 悬浮控制条，支持计时、暂停/继续、拖拽移动
- **预览与导出** — 录制预览，支持导出 WebM 或 MP4 (H.264) 格式，实时转换

### ✏️ 标注编辑器
| 工具 | 说明 |
|------|------|
| ✏️ 画笔 | 自由画笔，可自定义颜色和粗细 |
| 🖊️ 荧光笔 | 半透明标记 |
| ➡️ 箭头 | 绘制箭头 |
| 📏 直线 | 绘制直线 |
| ▬ 矩形 | 矩形和正方形 |
| ⭕ 椭圆 | 圆形和椭圆 |
| 🔤 文字 | 添加文字标注，可调整字号 |
| 🔢 步骤编号 | 编号圆圈，适用于教程标注 |
| 🟦 模糊/马赛克 | 像素化处理敏感信息 |
| ✂️ 裁剪 | 裁剪到选中区域 |

### 📋 智能功能
- 截图后**自动复制**到剪贴板
- **快捷键**一键截图 — `Alt+Shift+V` / `F` / `S`
- **右键菜单**快速访问
- 截图完成**桌面通知**提醒
- **自定义文件名模式**，支持日期/时间变量

### 📁 历史记录
- 画廊式缩略图浏览
- 按类型搜索和筛选（截图/录制）
- 批量选择、下载、删除
- 快速预览及元信息查看（大小、日期、尺寸）

### ⚙️ 丰富的设置选项
- 图片格式：PNG、JPEG、WebP
- 图片质量滑块 (1–100)
- 视频格式：WebM (VP9) 或 MP4 (H.264)
- 录制画质：720p / 1080p / 原始分辨率
- 帧率：15 / 24 / 30 / 60 FPS
- 录制倒计时
- 系统声音和麦克风开关
- 深色主题
- 历史记录数量上限设置

### 🌍 多语言支持
- 中文（简体）和英文界面
- 所有 UI 文本通过 `chrome.i18n` 实现

### 🔒 隐私保护
- 所有数据本地存储 — 无云端上传、无追踪
- 无需注册账号
- 开源免费

## 🛠️ 技术栈

- [WXT](https://wxt.dev/) — 新一代浏览器扩展框架
- [React 19](https://react.dev/) — UI 组件
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [Dexie.js](https://dexie.org/) — IndexedDB 封装
- Chrome Extension Manifest V3

## 🚀 快速开始

### 前置条件
- Node.js 18+
- npm 或 pnpm

### 安装与开发

```bash
# 安装依赖
npm install

# 启动开发模式（自动重载扩展）
npm run dev
```

### 在 Chrome 中加载

1. 打开 `chrome://extensions/`
2. 开启**开发者模式**
3. 点击**加载已解压的扩展程序**
4. 选择 `.output/chrome-mv3-dev` 目录

### 生产构建

```bash
npm run build
```

输出目录：`.output/chrome-mv3/`

## 📁 项目结构

```
entrypoints/
├── background.ts          # Service Worker（消息路由、截图逻辑）
├── popup/                 # 扩展弹窗 UI
├── editor/                # 截图标注编辑器
├── preview/               # 录制预览页面
├── captures/              # 历史记录画廊
├── options/               # 设置页面
├── offscreen/             # 离屏文档（MediaRecorder）
├── region-selector.content.ts  # 区域选取覆盖层
└── recording-controls.content.ts  # 录制悬浮控制条

src/
├── components/
│   ├── editor/EditorApp.tsx     # 基于 Canvas 的标注编辑器
│   ├── history/HistoryApp.tsx   # 历史记录画廊
│   ├── options/OptionsApp.tsx   # 设置界面
│   └── preview/PreviewApp.tsx   # 录制预览与 MP4 转换
├── lib/
│   ├── editor/engine.ts   # Canvas 渲染与导出引擎
│   ├── storage.ts         # IndexedDB + Chrome Storage 存储层
│   ├── messaging.ts       # 消息传递工具
│   ├── i18n.ts            # 国际化辅助函数
│   └── types.ts           # 共享 TypeScript 类型
├── utils/
│   ├── download.ts        # 文件下载与剪贴板工具
│   ├── image.ts           # 图片处理（裁剪、拼接、缩略图）
│   └── mp4-converter.ts   # WebM → MP4 实时转换（WebCodecs）
└── styles/
    ├── design-system.css  # CSS 变量与设计令牌
    ├── reset.css          # CSS 重置
    └── animations.css     # 共享动画

public/
├── _locales/              # i18n 消息文件（en、zh_CN）
└── icon/                  # 扩展图标（16/32/48/96/128px）

store-assets/              # Chrome Web Store 商店素材
├── screenshot-*.png       # 英文截图 (1280×800)
├── zh-screenshot-*.png    # 中文截图 (1280×800)
├── promo-small-440x280.png
├── promo-marquee-1400x560.png
└── LISTING.md             # 商店描述（中英文）
```

## 🖼️ 商店素材

商店展示图通过 SVG → PNG 管线生成：

```bash
node gen-store-assets.cjs
```

输出 13 张 PNG 到 `store-assets/`：
- 5 张英文 + 5 张中文截图 (1280×800)
- 2 张英文 + 1 张中文宣传图
- 保留所有 SVG 源文件，方便编辑

## 📝 许可证

MIT
