const fs = require('fs');
const path = require('path');

const replacements = [
  { pattern: /bg-white dark:bg-slate-900/g, replacement: 'bg-card' },
  { pattern: /bg-white dark:bg-slate-950/g, replacement: 'bg-background' },
  { pattern: /bg-slate-50 dark:bg-slate-950/g, replacement: 'bg-background' },
  { pattern: /bg-slate-100 dark:bg-slate-800/g, replacement: 'bg-muted' },
  { pattern: /bg-slate-50 dark:bg-slate-800\/50/g, replacement: 'bg-muted/50' },
  { pattern: /bg-slate-50 dark:bg-slate-800/g, replacement: 'bg-muted' },
  { pattern: /bg-slate-200 dark:bg-slate-700/g, replacement: 'bg-accent' },
  
  { pattern: /border-slate-200 dark:border-slate-800\/50/g, replacement: 'border-border/50' },
  { pattern: /border-slate-200 dark:border-slate-800/g, replacement: 'border-border' },
  { pattern: /border-slate-200 dark:border-slate-700\/50/g, replacement: 'border-border/50' },
  { pattern: /border-slate-200 dark:border-slate-700/g, replacement: 'border-border' },
  { pattern: /border-slate-300 dark:border-slate-700/g, replacement: 'border-border' },
  { pattern: /border-slate-300 dark:border-slate-600/g, replacement: 'border-border' },
  
  { pattern: /text-slate-900 dark:text-slate-100/g, replacement: 'text-foreground' },
  { pattern: /text-slate-800 dark:text-slate-200/g, replacement: 'text-foreground' },
  { pattern: /text-slate-700 dark:text-slate-300/g, replacement: 'text-card-foreground' },
  { pattern: /text-slate-600 dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  { pattern: /text-slate-600 dark:text-slate-300/g, replacement: 'text-muted-foreground' },
  { pattern: /text-slate-500 dark:text-slate-400\/60/g, replacement: 'text-muted-foreground/60' },
  { pattern: /text-slate-500 dark:text-slate-400/g, replacement: 'text-muted-foreground' },
  
  { pattern: /bg-slate-900 dark:bg-white text-white dark:text-slate-900/g, replacement: 'bg-foreground text-background' },
  { pattern: /bg-slate-900 dark:bg-white/g, replacement: 'bg-foreground' },
  { pattern: /text-white dark:text-slate-900/g, replacement: 'text-background' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { pattern, replacement } of replacements) {
        content = content.replace(pattern, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory('src');
console.log('Theme replacement complete.');
