const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/naive/Documents/Collage/ATSH2/solutionhub-main/frontend/src/employee';
const files = fs.readdirSync(dir);
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/u;

for (const file of files) {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (emojiRegex.test(line)) {
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}
