const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else {
      if (['.ts', '.tsx', '.css'].some(ext => fullPath.endsWith(ext))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = content
          .replace(/#6c63ff/gi, '#f8b500')
          .replace(/108,\s*99,\s*255/g, '248, 181, 0')
          .replace(/99,\s*102,\s*241/g, '248, 181, 0');
        if (content !== modified) {
          fs.writeFileSync(fullPath, modified, 'utf8');
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
replaceInDir(path.join(__dirname, 'entrypoints'));
