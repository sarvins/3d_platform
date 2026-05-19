// Gate: energy computation — 10 input/output snapshot pairs
import { getImpact, getEnergyChartData } from '../js/getImpact.js';

const ENERGY_CATS = ['verwarming','koeling','ventilatie','verlichting','warmtapwater','lift','gebruikers'];
let allPass = true;

function assert(label, condition, detail = '') {
  if (!condition) {
    console.log(`  ✗ ${label}${detail ? ' — ' + detail : ''}`);
    allPass = false;
  } else {
    console.log(`  ✓ ${label}`);
  }
}

// 1: Default settings floor 10 — breakdown has all 7 keys and total > 0
{
  const r = getImpact(625, 35, 'business_as_usual', 'business_as_usual', {});
  assert('1. energy_breakdown has all 7 keys', ENERGY_CATS.every(c => r.energy_breakdown[c] !== undefined));
  assert('1. total > 0', r.energy_breakdown.total > 0, `total=${r.energy_breakdown.total}`);
  assert('1. co2_energy_kwh_m2 === total', r.co2_energy_kwh_m2 === r.energy_breakdown.total);
  assert('1. energy_neutrality_pct is number 0-100', typeof r.energy_neutrality_pct === 'number' && r.energy_neutrality_pct >= 0 && r.energy_neutrality_pct <= 100);
}

// 2: Floor 2 (2 floors) — energy_is_positive should be true (tiny building, big roof)
{
  const r = getImpact(625, 7, 'business_as_usual', 'business_as_usual', {});
  assert('2. energy_is_positive at floor 2', r.energy_is_positive === true, `pct=${r.energy_neutrality_pct}`);
  assert('2. energy_neutrality_pct === 100 (capped)', r.energy_neutrality_pct === 100);
}

// 3: Floor 71 (max) — energy_neutrality_pct should be low (large building, small roof)
{
  const r = getImpact(625, 248.5, 'business_as_usual', 'business_as_usual', {});
  assert('3. energy_neutrality_pct < 30 at floor 71', r.energy_neutrality_pct < 30, `pct=${r.energy_neutrality_pct}`);
}

// 4: high_tech lower total than business_as_usual at floor 20
{
  const bau = getImpact(625, 70, 'business_as_usual', 'business_as_usual', {});
  const ht  = getImpact(625, 70, 'business_as_usual', 'high_tech', {});
  assert('4. high_tech total < business_as_usual', ht.energy_breakdown.total < bau.energy_breakdown.total,
    `ht=${ht.energy_breakdown.total} bau=${bau.energy_breakdown.total}`);
}

// 5: natuurlijk lowest total at floor 20
{
  const bau = getImpact(625, 70, 'business_as_usual', 'business_as_usual', {});
  const nat = getImpact(625, 70, 'business_as_usual', 'natuurlijk', {});
  assert('5. natuurlijk total < business_as_usual', nat.energy_breakdown.total < bau.energy_breakdown.total,
    `nat=${nat.energy_breakdown.total} bau=${bau.energy_breakdown.total}`);
}

// 6: liftEfficiency 0 (zuinig) reduces lift vs 4 (standaard) at floor 28
{
  const std  = getImpact(625, 98, 'business_as_usual', 'business_as_usual', { liftEfficiency: 4 });
  const zuin = getImpact(625, 98, 'business_as_usual', 'business_as_usual', { liftEfficiency: 0 });
  assert('6. zuinig lift < standaard lift', zuin.energy_breakdown.lift < std.energy_breakdown.lift,
    `zuinig=${zuin.energy_breakdown.lift} standaard=${std.energy_breakdown.lift}`);
}

// 7: isolatieRc 8 reduces verwarming vs Rc 3 at floor 20
{
  const rc3 = getImpact(625, 70, 'business_as_usual', 'business_as_usual', { isolatieRc: 3 });
  const rc8 = getImpact(625, 70, 'business_as_usual', 'business_as_usual', { isolatieRc: 8 });
  assert('7. Rc8 verwarming < Rc3 verwarming', rc8.energy_breakdown.verwarming < rc3.energy_breakdown.verwarming,
    `rc8=${rc8.energy_breakdown.verwarming} rc3=${rc3.energy_breakdown.verwarming}`);
}

// 8: zonwering intern increases koeling vs extern at floor 20
{
  const ext = getImpact(625, 70, 'business_as_usual', 'business_as_usual', { zonwering: 'extern' });
  const int = getImpact(625, 70, 'business_as_usual', 'business_as_usual', { zonwering: 'intern' });
  assert('8. intern koeling > extern koeling', int.energy_breakdown.koeling > ext.energy_breakdown.koeling,
    `intern=${int.energy_breakdown.koeling} extern=${ext.energy_breakdown.koeling}`);
}

// 9: getEnergyChartData returns 70 values per category
{
  const data = getEnergyChartData('business_as_usual', {});
  assert('9. 70 labels (floors 2-71)', data.labels.length === 70, `got ${data.labels.length}`);
  for (const cat of ENERGY_CATS) {
    assert(`9. dataset.${cat} has 70 values`, data.datasets[cat].length === 70);
  }
}

// 10: energy_breakdown.total equals sum of all 7 categories (±0.5 tolerance)
{
  const r = getImpact(625, 70, 'business_as_usual', 'business_as_usual', {});
  const sum = +(ENERGY_CATS.reduce((s, c) => s + r.energy_breakdown[c], 0)).toFixed(1);
  assert('10. total equals sum of categories', Math.abs(r.energy_breakdown.total - sum) < 0.6,
    `total=${r.energy_breakdown.total} sum=${sum}`);
}

console.log(`\n${allPass ? '✓ PASS' : '✗ FAIL'} — energy snapshot (10 pairs)`);
process.exit(allPass ? 0 : 1);
