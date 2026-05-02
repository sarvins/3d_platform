// Gate 4: no JS file other than getImpact.js imports directly from data/
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve('.');
const JS_DIR = join(ROOT, 'js');
const GETIMPACT = resolve('js/getImpact.js');

function walkJs(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkJs(full));
    } else if (entry.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

const DATA_IMPORT_PATTERN = /from\s+['"][^'"]*\/data\//;
const FETCH_DATA_PATTERN   = /fetch\s*\(\s*['"][^'"]*\/data\//;

const allJs = walkJs(JS_DIR).filter(f => f !== GETIMPACT);
let passed = true;

console.log(`Checking ${allJs.length} JS files for direct data/ access...\n`);

for (const file of allJs) {
  const content = readFileSync(file, 'utf8');
  const hasDataImport = DATA_IMPORT_PATTERN.test(content);
  const hasDataFetch  = FETCH_DATA_PATTERN.test(content);
  const violation = hasDataImport || hasDataFetch;
  if (violation) passed = false;
  const rel = file.replace(ROOT + '\\', '').replace(ROOT + '/', '');
  const status = violation ? '✗ VIOLATION' : '✓';
  if (violation) console.log(`  ${status} ${rel} — direct data/ access found`);
  else console.log(`  ${status} ${rel}`);
}

console.log(`\n${passed ? '✓ PASS' : '✗ FAIL'} — abstraction boundary`);
process.exit(passed ? 0 : 1);
