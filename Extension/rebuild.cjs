// ...existing code...
const { execSync } = require('child_process');

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
  } catch (e) {
    process.exit(1);
  }
}

console.log('[1/2] Build multi-entry (popup, options, background)...');
run('npx vite build --config vite.config.multi.ts');

console.log('[2/2] Build content script (IIFE)...');
run('npx vite build --config vite.config.content.ts');

console.log('Build complete! All extension files are in the dist/ folder.');
