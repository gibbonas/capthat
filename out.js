// create out directory for static Chrome Extension

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix HTML files to use correct paths
const files = glob.sync('out/**/*.html');
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const modifiedContent = content.replace(/\/_next/g, './next');
  fs.writeFileSync(file, modifiedContent, 'utf-8');
});

// Rename _next to next
const sourcePath = 'out/_next';
const destinationPath = 'out/next';

if (fs.existsSync(sourcePath)) {
  fs.rename(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error('Failed to rename "_next" directory to "next".', err);
    } else {
      console.log('Renamed "_next" directory to "next" successfully.');
    }
  });
}

// Ensure background.js is in the out directory
const backgroundSource = 'public/background.js';
const backgroundDest = 'out/background.js';
if (fs.existsSync(backgroundSource)) {
  fs.copyFileSync(backgroundSource, backgroundDest);
  console.log('Copied background.js to out directory.');
}
