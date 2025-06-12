// Script to sync src/i18n/locales/*.json to public/_locales/*/messages.json for Chrome Extension
// Usage: node scripts/sync-i18n.js

const fs = require('fs');
const path = require('path');

const srcLocalesDir = path.join(__dirname, '../src/i18n/locales');
const destLocalesDir = path.join(__dirname, '../public/_locales');

// Helper to flatten nested JSON keys (e.g. { a: { b: { c: 1 } } } => { 'a_b_c': 1 })
function flatten(obj, prefix = '', res = {}) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flatten(obj[key], prefix ? `${prefix}_${key}` : key, res);
    } else {
      res[prefix ? `${prefix}_${key}` : key] = obj[key];
    }
  }
  return res;
}

function convertToChromeMessages(flat) {
  const out = {};
  for (const key in flat) {
    out[key] = { message: flat[key] };
  }
  return out;
}

function syncLocale(lang) {
  const srcFile = path.join(srcLocalesDir, `${lang}.json`);
  const destDir = path.join(destLocalesDir, lang);
  const destFile = path.join(destDir, 'messages.json');

  if (!fs.existsSync(srcFile)) {
    console.error(`Source file not found: ${srcFile}`);
    return;
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const srcData = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
  const flat = flatten(srcData);
  const chromeMessages = convertToChromeMessages(flat);
  fs.writeFileSync(destFile, JSON.stringify(chromeMessages, null, 2), 'utf8');
  console.log(`Synced: ${srcFile} -> ${destFile}`);
}

['en', 'fr'].forEach(syncLocale);
