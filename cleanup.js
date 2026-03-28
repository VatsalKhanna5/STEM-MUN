const fs = require('fs');
const path = require('path');

const classesToRemove = [
  'italic',
  'uppercase',
  /tracking-\[.*?\]/g,
  'tracking-widest',
  'tracking-tighter',
  'tracking-tight',
  'tracking-luxury',
  /text-\[.*?\]/g,
  'font-display',
  'font-headline',
  'font-label',
  'font-body',
  'font-black',
  'font-light',
  'font-bold',
  'font-medium'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content;
      // Basic string replacement for standard classes
      classesToRemove.forEach(cls => {
        if (typeof cls === 'string') {
          // Replace exact word boundaries
          const regex = new RegExp(`\\b${cls}\\b`, 'g');
          newContent = newContent.replace(regex, '');
        } else {
          newContent = newContent.replace(cls, '');
        }
      });

      // Cleanup extra spaces in className attributes
      newContent = newContent.replace(/className=(["'])[\s]+(.*?)(["'])/g, 'className=$1$2$3');
      newContent = newContent.replace(/className=(["'])(.*?)[\s]+(["'])/g, 'className=$1$2$3');
      newContent = newContent.replace(/[\s]{2,}/g, ' ');

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Cleanup script completed.');
