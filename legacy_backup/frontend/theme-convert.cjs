const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'admin'),
  path.join(__dirname, 'src', 'employee')
];

const replacements = [
  // Backgrounds
  { regex: /bg-gray-950/g, replacement: 'bg-slate-50' },
  { regex: /bg-gray-900\/50/g, replacement: 'bg-white' },
  { regex: /bg-gray-900\/80/g, replacement: 'bg-white' },
  { regex: /bg-gray-900/g, replacement: 'bg-white' },
  { regex: /bg-gray-800/g, replacement: 'bg-slate-100' },
  { regex: /bg-gray-700/g, replacement: 'bg-slate-200' },
  
  // Text Colors
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-gray-400/g, replacement: 'text-slate-500' },
  { regex: /text-gray-300/g, replacement: 'text-slate-600' },
  { regex: /text-gray-500/g, replacement: 'text-slate-400' },
  { regex: /text-gray-600/g, replacement: 'text-slate-500' },
  
  // Borders
  { regex: /border-white\/5/g, replacement: 'border-slate-200' },
  { regex: /border-white\/10/g, replacement: 'border-slate-300' },
  
  // Hover & Subtle Backgrounds
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-slate-100' },
  { regex: /bg-white\/5/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/10/g, replacement: 'bg-slate-200' },
  { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-slate-50' },
  
  // Specific dark class forced in layouts
  { regex: /overflow-hidden dark/g, replacement: 'overflow-hidden' },
  { regex: /h-screen bg-gray-950 text-white/g, replacement: 'h-screen bg-slate-50 text-slate-900' }
];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.error(`Directory not found: ${directory}`);
    return;
  }

  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

directories.forEach(processDirectory);
console.log('Theme conversion completed!');
