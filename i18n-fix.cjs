const fs = require('fs');

const enJsonPath = 'public/_locales/en/messages.json';
const zhJsonPath = 'public/_locales/zh_CN/messages.json';

const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const zhData = JSON.parse(fs.readFileSync(zhJsonPath, 'utf8'));

const newStrings = {
  settingsVideoFormat: { en: "Video Format", zh: "视频格式" },
  settingsVideoFormatDesc: { en: "WebM (native) or MP4 (converted via WebCodecs)", zh: "WebM (原生) 或 MP4 (WebCodecs转换)" },
  settingsVideoFormatWebm: { en: "WebM (VP9)", zh: "WebM (VP9)" },
  settingsVideoFormatMp4: { en: "MP4 (H.264)", zh: "MP4 (H.264)" },
  settingsQualityLow: { en: "Low (720p)", zh: "低 (720p)" },
  settingsQualityMedium: { en: "Medium (1080p)", zh: "中 (1080p)" },
  settingsQualityHigh: { en: "High (Original)", zh: "高 (原画)" },
  settingsFpsValue: { en: "$FPS$ FPS", zh: "$FPS$ 帧" },
  settingsCountdownNone: { en: "No countdown", zh: "无倒计时" },
  settingsCountdownSecs: { en: "$SEC$ seconds", zh: "$SEC$ 秒" },
  settingsSystemAudio: { en: "System Audio", zh: "系统音频" },
  settingsSystemAudioDesc: { en: "Record tab or system audio", zh: "录制标签页或系统声音" },
  settingsMicrophone: { en: "Microphone", zh: "麦克风" },
  settingsMicrophoneDesc: { en: "Record microphone audio", zh: "录制麦克风声音" },
  settingsThemeDark: { en: "Dark", zh: "深色 (Dark)" },
  settingsThemeLight: { en: "Light", zh: "浅色 (Light)" },
  settingsThemeSystem: { en: "System", zh: "跟随系统" },
  settingsKeyboardShortcuts: { en: "Keyboard Shortcuts", zh: "快捷键" },
  settingsShortcutVisible: { en: "Visible Area Screenshot", zh: "截取可见区域" },
  settingsShortcutFull: { en: "Full Page Screenshot", zh: "截取整个页面" },
  settingsShortcutSelect: { en: "Select Area Screenshot", zh: "选取区域截图" },
  settingsShortcutRecord: { en: "Record Tab", zh: "录制当前标签页" },
  settingsShortcutChange: { en: "To change shortcuts, visit ", zh: "如需修改快捷键，请访问 " }
};

for (const [key, trans] of Object.entries(newStrings)) {
  if (trans.en.includes('$FPS$') || trans.en.includes('$SEC$')) {
    const placeholder = trans.en.includes('$FPS$') ? 'FPS' : 'SEC';
    enData[key] = { message: trans.en, placeholders: { [placeholder]: { content: "$1" } } };
    zhData[key] = { message: trans.zh, placeholders: { [placeholder]: { content: "$1" } } };
  } else {
    enData[key] = { message: trans.en };
    zhData[key] = { message: trans.zh };
  }
}

fs.writeFileSync(enJsonPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(zhJsonPath, JSON.stringify(zhData, null, 2), 'utf8');

const tsxPath = 'src/components/options/OptionsApp.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf8');

tsx = tsx
  .replace('Video Format</div>', '{t(\'settingsVideoFormat\')}</div>')
  .replace('WebM (native) or MP4 (converted via WebCodecs)</div>', '{t(\'settingsVideoFormatDesc\')}</div>')
  .replace('>WebM (VP9)<', '>{t(\'settingsVideoFormatWebm\')}<')
  .replace('>MP4 (H.264)<', '>{t(\'settingsVideoFormatMp4\')}<')
  .replace('>Low (720p)<', '>{t(\'settingsQualityLow\')}<')
  .replace('>Medium (1080p)<', '>{t(\'settingsQualityMedium\')}<')
  .replace('>High (Original)<', '>{t(\'settingsQualityHigh\')}<')
  .replace('>15 FPS<', '>{t(\'settingsFpsValue\', \'15\')}<')
  .replace('>24 FPS<', '>{t(\'settingsFpsValue\', \'24\')}<')
  .replace('>30 FPS<', '>{t(\'settingsFpsValue\', \'30\')}<')
  .replace('>60 FPS<', '>{t(\'settingsFpsValue\', \'60\')}<')
  .replace('>No countdown<', '>{t(\'settingsCountdownNone\')}<')
  .replace('>3 seconds<', '>{t(\'settingsCountdownSecs\', \'3\')}<')
  .replace('>5 seconds<', '>{t(\'settingsCountdownSecs\', \'5\')}<')
  .replace('>10 seconds<', '>{t(\'settingsCountdownSecs\', \'10\')}<')
  .replace('System Audio</div>', '{t(\'settingsSystemAudio\')}</div>')
  .replace('Record tab or system audio</div>', '{t(\'settingsSystemAudioDesc\')}</div>')
  .replace('>Microphone</div>', '>{t(\'settingsMicrophone\')}</div>')
  .replace('Record microphone audio</div>', '{t(\'settingsMicrophoneDesc\')}</div>')
  .replace('>Dark<', '>{t(\'settingsThemeDark\')}<')
  .replace('>Light<', '>{t(\'settingsThemeLight\')}<')
  .replace('>System<', '>{t(\'settingsThemeSystem\')}<')
  .replace('>Keyboard Shortcuts<', '>{t(\'settingsKeyboardShortcuts\')}<')
  .replace('>Visible Area Screenshot<', '>{t(\'settingsShortcutVisible\')}<')
  .replace('>Full Page Screenshot<', '>{t(\'settingsShortcutFull\')}<')
  .replace('>Select Area Screenshot<', '>{t(\'settingsShortcutSelect\')}<')
  .replace('>Record Tab<', '>{t(\'settingsShortcutRecord\')}<')
  .replace('To change shortcuts, visit <', '{t(\'settingsShortcutChange\')} <');

fs.writeFileSync(tsxPath, tsx, 'utf8');
console.log('i18n updated');
