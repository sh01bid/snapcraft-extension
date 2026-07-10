const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.match(/\.(ts|tsx|css|svg|cjs)$/)) {
      replaceInFile(fullPath);
    }
  }
}

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/SnapCraft/g, 'ScreenKing');
    newContent = newContent.replace(/snapcraft/g, 'screenking');
    
    // Fix Chinese SVGs
    if (filePath.includes('zh-screenshot-1-popup.svg') || filePath.includes('zh-promo-small-440x280.svg')) {
      newContent = newContent.replace(/ScreenKing/g, '截图王');
    }
    
    // In gen-store-assets.cjs, there is one place where the Chinese title might be generated, 
    // but previously I just replaced 'ScreenKing</text>' with '截图王</text>'.
    // Let's do that for safety just to match what I did before.
    if (filePath.includes('gen-store-assets.cjs')) {
      newContent = newContent.replace(/ScreenKing<\/text>`/g, '截图王<\/text>`');
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (e) {
    console.error(`Failed on ${filePath}`, e);
  }
}

replaceInDir('./src');
replaceInDir('./entrypoints');
replaceInDir('./store-assets');
replaceInFile('./gen-store-assets.cjs');
