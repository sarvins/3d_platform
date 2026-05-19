import thresholdsData from '../data/thresholds.json' with { type: 'json' };
import co2MaterialData from '../data/co2Material.json' with { type: 'json' };
import energyData from '../data/energyData.json' with { type: 'json' };

const THRESHOLDS = thresholdsData.thresholds;
const DATA_VERSION = thresholdsData.data_version;
const CO2_MATERIAL_DATA = co2MaterialData;
const ENERGY_DATA = energyData;

if (DATA_VERSION !== co2MaterialData.data_version) {
  throw new Error(`Data version mismatch: thresholds=${DATA_VERSION}, co2=${co2MaterialData.data_version}`);
}
if (DATA_VERSION !== energyData.data_version) {
  throw new Error(`Data version mismatch: thresholds=${DATA_VERSION}, energy=${energyData.data_version}`);
}

const FLOOR_HEIGHT_M = 3.5;
const PV_KWH_YEAR = 56250; // 375m² × 150 kWh/m²/yr effective roof PV

const CORE_SIZES = { A: [1.2, 2.0], B: [1.6, 2.0], C: [2.0, 2.0], D: [2.4, 2.4], E: [2.8, 2.8] };

const CORE_LABELS = {
  A: { dims: '6×10m', area: '60m²' },
  B: { dims: '8×10m', area: '80m²' },
  C: { dims: '10×10m', area: '100m²' },
  D: { dims: '12×12m', area: '144m²' },
  E: { dims: '14×14m', area: '196m²' },
};

const DEFAULT_STEP2 = {
  balkons: 'buiten', zonwering: 'extern', raamOppervlak: 50,
  isolatieRc: 5, luchtdichtheid: 4, liftEfficiency: 4,
};

const ENERGY_CATEGORIES = ['verwarming', 'koeling', 'ventilatie', 'verlichting', 'warmtapwater', 'lift', 'gebruikers'];

function interpolate(table, x) {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }
  return table[table.length - 1][1];
}

function getCoreVariant(floors) {
  if (floors < THRESHOLDS[0].floors) return 'A';
  if (floors < THRESHOLDS[1].floors) return 'B';
  if (floors < THRESHOLDS[2].floors) return 'C';
  if (floors < THRESHOLDS[3].floors) return 'D';
  return 'E';
}

function getElevatorCount(floors) {
  let count = 0;
  for (const t of THRESHOLDS) { if (floors >= t.floors) count++; }
  return count;
}

function getFoundationType(floors) {
  if (floors < 2)  return 'Hout/stalen palen (ondiep)';
  if (floors < THRESHOLDS[0].floors) return 'Houten palen';
  if (floors < THRESHOLDS[2].floors) return 'Betonpalen (1e laag)';
  return 'Betonpalen (2e laag, diep)';
}

function getStabilitySystem(floors) {
  if (floors < 10) return 'Skeletbouw';
  if (floors < THRESHOLDS[3].floors) return 'Kern + skelet stabiliteit';
  return 'Schilstabiliteit';
}

function getLiftScale(floors) {
  const ls = ENERGY_DATA.lift_scale;
  if (floors < 9)  return ls.below_9;
  if (floors < 28) return ls['9_to_27'];
  if (floors < 38) return ls['28_to_37'];
  return ls.above_38;
}

function computeEnergyBreakdown(installatie, floors, step2Params) {
  const s2 = { ...DEFAULT_STEP2, ...(step2Params || {}) };
  const instalKey = ENERGY_DATA.base[installatie] ? installatie : 'business_as_usual';
  const base = { ...ENERGY_DATA.base[instalKey] };
  const adj = ENERGY_DATA.adjustments;

  // Apply lift floor scaling
  base.lift = +(base.lift * getLiftScale(floors)).toFixed(1);

  // Apply Step 2 multiplicative adjustments
  const applyAdj = (paramKey, valueKey) => {
    const factors = adj[paramKey]?.[valueKey] || {};
    for (const [cat, factor] of Object.entries(factors)) {
      if (base[cat] !== undefined) base[cat] = +(base[cat] * factor).toFixed(1);
    }
  };

  applyAdj('balkons',        s2.balkons);
  applyAdj('zonwering',      s2.zonwering);
  applyAdj('raamOppervlak',  String(s2.raamOppervlak));
  applyAdj('isolatieRc',     String(s2.isolatieRc));
  applyAdj('luchtdichtheid', String(s2.luchtdichtheid));
  applyAdj('liftEfficiency', String(s2.liftEfficiency));

  const total = +ENERGY_CATEGORIES.reduce((sum, cat) => sum + (base[cat] || 0), 0).toFixed(1);

  return {
    verwarming: base.verwarming, koeling: base.koeling, ventilatie: base.ventilatie,
    verlichting: base.verlichting, warmtapwater: base.warmtapwater,
    lift: base.lift, gebruikers: base.gebruikers,
    total,
  };
}

let _prevFloors = null;

export function getImpact(gfa_m2, height_m, bouwmethodiek, installatie, step2Params = {}) {
  const floors = Math.round(height_m / FLOOR_HEIGHT_M);
  const methodKey = CO2_MATERIAL_DATA[bouwmethodiek] ? bouwmethodiek : 'business_as_usual';

  const co2_material_kg_m2 = interpolate(CO2_MATERIAL_DATA[methodKey], floors);
  const core_variant = getCoreVariant(floors);
  const elevator_count = getElevatorCount(floors);

  const thresholds_crossed = [];
  if (_prevFloors !== null) {
    for (const t of THRESHOLDS) {
      const crossedUp   = floors >= t.floors && _prevFloors < t.floors;
      const crossedDown = floors < t.floors  && _prevFloors >= t.floors;
      if (crossedUp || crossedDown) {
        thresholds_crossed.push({
          threshold_reached: t.threshold_reached,
          label: t.label,
          field: t.effect,
          direction: crossedUp ? 'up' : 'down',
          previous_value: _prevFloors,
          new_value: floors,
        });
      }
    }
  }
  _prevFloors = floors;

  const coreInfo = CORE_LABELS[core_variant];
  const energy_breakdown = computeEnergyBreakdown(installatie, floors, step2Params);
  const rawPct = (PV_KWH_YEAR / (energy_breakdown.total * floors * gfa_m2)) * 100;
  const energy_neutrality_pct = Math.min(100, Math.round(rawPct));
  const energy_is_positive = rawPct > 100;

  return {
    co2_material_kg_m2,
    co2_energy_kwh_m2: energy_breakdown.total,
    energy_neutrality_pct,
    energy_is_positive,
    co2_breakdown: null,
    energy_breakdown,
    structural: {
      core_variant,
      core_dims: coreInfo.dims,
      core_area: coreInfo.area,
      foundation_type: getFoundationType(floors),
      elevator_count,
      stability_system: getStabilitySystem(floors),
    },
    thresholds_crossed,
    data_version: DATA_VERSION,
    tolerance_note: '±5–10 kg CO₂/m² (indicatieve data, brongrafiek)',
    floors,
  };
}

export function getChartData() {
  const labels = [];
  const datasets = {
    business_as_usual: [], hoogwaardig_hybride: [],
    best_practice_biobased: [], max_innovatief: [],
  };
  for (let f = 2; f <= 71; f++) {
    labels.push(f);
    for (const key of Object.keys(datasets)) {
      datasets[key].push(interpolate(CO2_MATERIAL_DATA[key], f));
    }
  }
  return { labels, datasets };
}

export function getEnergyChartData(installatie, step2Params) {
  const labels = [];
  const datasets = {};
  for (const cat of ENERGY_CATEGORIES) datasets[cat] = [];

  for (let f = 2; f <= 71; f++) {
    labels.push(Math.round(f * FLOOR_HEIGHT_M) + 'm');
    const breakdown = computeEnergyBreakdown(installatie, f, step2Params);
    for (const cat of ENERGY_CATEGORIES) datasets[cat].push(breakdown[cat]);
  }
  return { labels, datasets, data_version: DATA_VERSION };
}

export { DATA_VERSION, THRESHOLDS, CORE_LABELS };
