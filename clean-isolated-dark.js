const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      content = content.replace(/dark:bg-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:text-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:border-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:hover:bg-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:hover:text-[a-z0-9\-\/]+/g, '');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Cleaned isolated dark classes: ' + fullPath);
      }
    }
  }
}

processDirectory('src');
