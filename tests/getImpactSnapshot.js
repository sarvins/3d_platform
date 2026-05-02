// Gate 6: 10 known input/output pairs; ImpactResult shape frozen
import { getImpact } from '../js/getImpact.js';

const REQUIRED_FIELDS = [
  'co2_material_kg_m2', 'co2_energy_kwh_m2', 'energy_neutrality_pct',
  'co2_breakdown', 'structural', 'thresholds_crossed', 'data_version',
  'tolerance_note', 'floors',
];

const REQUIRED_STRUCTURAL = [
  'core_variant', 'core_dims', 'core_area', 'foundation_type',
  'elevator_count', 'stability_system',
];

const SNAPSHOTS = [
  // Below threshold 1 (floor 9)
  { floors: 8,  method: 'business_as_usual',    expectElev: 0, expectCore: 'A', expectCo2Min: 140, expectCo2Max: 165 },
  // At threshold 1
  { floors: 9,  method: 'business_as_usual',    expectElev: 1, expectCore: 'B', expectCo2Min: 155, expectCo2Max: 185 },
  // Below threshold 2 (floor 16)
  { floors: 15, method: 'business_as_usual',    expectElev: 1, expectCore: 'B', expectCo2Min: 155, expectCo2Max: 185 },
  // At threshold 2
  { floors: 16, method: 'business_as_usual',    expectElev: 2, expectCore: 'C', expectCo2Min: 170, expectCo2Max: 200 },
  // Below threshold 3 (floor 28)
  { floors: 27, method: 'business_as_usual',    expectElev: 2, expectCore: 'C', expectCo2Min: 175, expectCo2Max: 205 },
  // At threshold 3
  { floors: 28, method: 'business_as_usual',    expectElev: 3, expectCore: 'D', expectCo2Min: 200, expectCo2Max: 240 },
  // All 4 bouwmethodiek options at floor 20
  { floors: 20, method: 'business_as_usual',    expectElev: 2, expectCore: 'C', expectCo2Min: 165, expectCo2Max: 195 },
  { floors: 20, method: 'hoogwaardig_hybride',  expectElev: 2, expectCore: 'C', expectCo2Min: 110, expectCo2Max: 145 },
  { floors: 20, method: 'best_practice_biobased', expectElev: 2, expectCore: 'C', expectCo2Min: 88, expectCo2Max: 120 },
  { floors: 20, method: 'max_innovatief',       expectElev: 2, expectCore: 'C', expectCo2Min: 80, expectCo2Max: 112 },
];

let allPass = true;

for (const snap of SNAPSHOTS) {
  const result = getImpact(625, snap.floors * 3.5, snap.method, 'business_as_usual', {});

  const fieldOk = REQUIRED_FIELDS.every(f => f in result);
  const structOk = REQUIRED_STRUCTURAL.every(f => f in result.structural);
  const elevOk = result.structural.elevator_count === snap.expectElev;
  const coreOk = result.structural.core_variant === snap.expectCore;
  const co2Ok  = result.co2_material_kg_m2 >= snap.expectCo2Min && result.co2_material_kg_m2 <= snap.expectCo2Max;
  const arrayOk = Array.isArray(result.thresholds_crossed);

  const pass = fieldOk && structOk && elevOk && coreOk && co2Ok && arrayOk;
  if (!pass) allPass = false;

  const status = pass ? '✓' : '✗';
  const issues = [];
  if (!fieldOk) issues.push('missing fields');
  if (!structOk) issues.push('missing structural fields');
  if (!elevOk)  issues.push(`elevator: got ${result.structural.elevator_count}, expected ${snap.expectElev}`);
  if (!coreOk)  issues.push(`core: got ${result.structural.core_variant}, expected ${snap.expectCore}`);
  if (!co2Ok)   issues.push(`co2: got ${result.co2_material_kg_m2}, expected ${snap.expectCo2Min}–${snap.expectCo2Max}`);
  if (!arrayOk) issues.push('thresholds_crossed not array');

  console.log(`  ${status} floors=${snap.floors} ${snap.method.padEnd(22)} co2=${result.co2_material_kg_m2} elev=${result.structural.elevator_count} core=${result.structural.core_variant}${issues.length ? ' — ' + issues.join(', ') : ''}`);
}

console.log(`\n${allPass ? '✓ PASS' : '✗ FAIL'} — getImpact snapshot (10 pairs)`);
process.exit(allPass ? 0 : 1);
