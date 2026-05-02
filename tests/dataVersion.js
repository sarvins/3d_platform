// Gate 5: data_version in ImpactResult must equal the DATA_VERSION constant
import { getImpact, DATA_VERSION } from '../js/getImpact.js';

const result = getImpact(625, 35, 'business_as_usual', 'business_as_usual', {});
const ok = result.data_version === DATA_VERSION;

console.log(`DATA_VERSION constant : "${DATA_VERSION}"`);
console.log(`ImpactResult.data_version: "${result.data_version}"`);
console.log(`\n${ok ? '✓ PASS' : '✗ FAIL'} — data version consistency`);
process.exit(ok ? 0 : 1);
