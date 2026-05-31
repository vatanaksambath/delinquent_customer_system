const fs = require('fs');
const path = require('path');

const replacements = [
  { pattern: /bg-slate-50 dark:bg-slate-900\/50/g, replacement: 'bg-background/50' },
  { pattern: /bg-slate-900 dark:bg-slate-100/g, replacement: 'bg-foreground text-background' },
  { pattern: /bg-slate-100 dark:bg-slate-950/g, replacement: 'bg-muted' },
  { pattern: /bg-slate-200 dark:bg-slate-800/g, replacement: 'bg-accent' },
  { pattern: /bg-slate-300 dark:bg-slate-700/g, replacement: 'bg-accent' },
  { pattern: /bg-white\/90 dark:bg-slate-900\/90/g, replacement: 'bg-background/90' },
  { pattern: /bg-white\/95 dark:bg-slate-900\/95/g, replacement: 'bg-background/95' },
  { pattern: /bg-slate-900\/60/g, replacement: 'bg-foreground/60' },
  { pattern: /bg-slate-950/g, replacement: 'bg-background' },
  { pattern: /bg-slate-900/g, replacement: 'bg-foreground' },
  { pattern: /bg-slate-800\/50/g, replacement: 'bg-muted/50' },
  
  { pattern: /hover:bg-slate-100 dark:hover:bg-slate-800/g, replacement: 'hover:bg-accent hover:text-accent-foreground' },
  { pattern: /hover:bg-slate-200 dark:hover:bg-slate-700/g, replacement: 'hover:bg-accent hover:text-accent-foreground' },
  { pattern: /hover:bg-slate-800 dark:hover:bg-slate-200/g, replacement: 'hover:bg-accent hover:text-accent-foreground' },
  { pattern: /hover:bg-slate-50 dark:hover:bg-slate-800\/40/g, replacement: 'hover:bg-accent/40' },
  { pattern: /hover:bg-slate-50 dark:hover:bg-slate-800\/30/g, replacement: 'hover:bg-accent/30' },
  
  { pattern: /text-slate-900/g, replacement: 'text-foreground' },
  { pattern: /text-slate-100/g, replacement: 'text-foreground' },
  { pattern: /text-slate-500/g, replacement: 'text-muted-foreground' },
  { pattern: /text-slate-400/g, replacement: 'text-muted-foreground' },
  { pattern: /text-slate-600/g, replacement: 'text-muted-foreground' },
  { pattern: /text-slate-700/g, replacement: 'text-card-foreground' },
  
  { pattern: /border-slate-200/g, replacement: 'border-border' },
  { pattern: /border-slate-800/g, replacement: 'border-border' },
  { pattern: /border-slate-700/g, replacement: 'border-border' },
  { pattern: /border-slate-300/g, replacement: 'border-border' },
  
  { pattern: /bg-slate-50/g, replacement: 'bg-muted' },
  { pattern: /bg-slate-100/g, replacement: 'bg-muted' },
  { pattern: /bg-slate-200/g, replacement: 'bg-accent' },
  { pattern: /bg-white/g, replacement: 'bg-card' },
  { pattern: /text-white/g, replacement: 'text-card-foreground' },
  { pattern: /text-black/g, replacement: 'text-foreground' }
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
      
      // Fix potential duplicates introduced by simple global replacement
      content = content.replace(/dark:bg-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:text-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:border-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:hover:bg-[a-z0-9\-\/]+/g, '');
      content = content.replace(/dark:hover:text-[a-z0-9\-\/]+/g, '');
      
      // Clean up multiple spaces
      content = content.replace(/\s+/g, ' ');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory('src');
console.log('Pass 2 replacement complete.');
