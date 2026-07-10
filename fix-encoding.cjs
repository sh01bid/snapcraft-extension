const fs = require('fs');
const path = require('path');

function fixEncoding(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixEncoding(fullPath);
    } else if (fullPath.match(/\.(ts|tsx|css|js|cjs|html|svg)$/)) {
      try {
        // Read file as buffer
        const buf = fs.readFileSync(fullPath);
        
        // If it's UTF-16 LE (FF FE) or BE (FE FF), convert to UTF-8
        let str;
        if (buf[0] === 0xFF && buf[1] === 0xFE) {
          str = buf.toString('utf16le');
          // Remove BOM
          if (str.charCodeAt(0) === 0xFEFF) {
            str = str.slice(1);
          }
        } else if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
          // UTF-8 BOM
          str = buf.toString('utf8');
          // Remove BOM
          if (str.charCodeAt(0) === 0xFEFF) {
            str = str.slice(1);
          }
        } else {
          // Assume ascii / utf-8
          str = buf.toString('utf8');
        }
        
        // Save as standard UTF-8 without BOM
        fs.writeFileSync(fullPath, str, 'utf8');
      } catch (e) {
        console.error("Failed on", fullPath, e);
      }
    }
  }
}

fixEncoding('./src');
fixEncoding('./entrypoints');
fixEncoding('./store-assets');
try {
  let cjs = fs.readFileSync('gen-store-assets.cjs');
  let str;
  if (cjs[0] === 0xFF && cjs[1] === 0xFE) {
    str = cjs.toString('utf16le');
    if (str.charCodeAt(0) === 0xFEFF) str = str.slice(1);
  } else if (cjs[0] === 0xEF && cjs[1] === 0xBB && cjs[2] === 0xBF) {
    str = cjs.toString('utf8');
    if (str.charCodeAt(0) === 0xFEFF) str = str.slice(1);
  } else {
    str = cjs.toString('utf8');
  }
  fs.writeFileSync('gen-store-assets.cjs', str, 'utf8');
} catch (e) {}

console.log("Encoding fixed!");
