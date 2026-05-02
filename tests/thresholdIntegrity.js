// Gate 3: every threshold entry must have a non-empty threshold_reached string
import thresholdsData from '../data/thresholds.json' with { type: 'json' };

const { thresholds } = thresholdsData;
let passed = true;

console.log(`Checking ${thresholds.length} threshold entries...\n`);

for (const entry of thresholds) {
  const ok = typeof entry.threshold_reached === 'string' && entry.threshold_reached.trim().length > 0;
  const status = ok ? '✓' : '✗';
  console.log(`  ${status} floors=${entry.floors}: threshold_reached="${entry.threshold_reached}"`);
  if (!ok) passed = false;
}

console.log(`\n${passed ? '✓ PASS' : '✗ FAIL'} — threshold integrity`);
process.exit(passed ? 0 : 1);
