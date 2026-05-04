# Data Model: Energie Module

**Branch**: `002-energie-module` | **Date**: 2026-05-02

---

## New / Extended Entities

### Step2Params (new — stored in `state.step2`)

The user's Step 2 configuration. Sub-object within the central state store.

| Field | Type | Values | Default |
|---|---|---|---|
| `balkons` | enum | `'buiten'` / `'binnen'` / `'gevellijn'` | `'buiten'` |
| `zonwering` | enum | `'extern'` / `'intern'` / `'zonwerend_glas'` | `'extern'` |
| `raamOppervlak` | integer | 30, 40, 50, 60, 70, 80 | 50 |
| `isolatieRc` | integer | 3, 4, 5, 6, 7, 8 | 5 |
| `luchtdichtheid` | enum | `'hoog'` / `'norm'` | `'norm'` |
| `liftEfficiency` | enum | `'zuinig'` / `'standaard'` | `'standaard'` |

**Derived display values** (computed from `isolatieRc`, not stored):

| isolatieRc | Uglas |
|---|---|
| 3 | 1.2 |
| 4 | 1.1 |
| 5 | 1.0 |
| 6 | 0.95 |
| 7 | 0.85 |
| 8 | 0.80 |

---

### EnergyBreakdown (new — field in ImpactResult)

Energy use per category for the current configuration at the current floor count.

| Field | Type | Unit | Phase 1 |
|---|---|---|---|
| `verwarming` | number | kWh/m²/year | Populated |
| `koeling` | number | kWh/m²/year | Populated |
| `ventilatie` | number | kWh/m²/year | Populated |
| `verlichting` | number | kWh/m²/year | Populated |
| `warmtapwater` | number | kWh/m²/year | Populated |
| `lift` | number | kWh/m²/year | Populated (scales with floor count) |
| `gebruikers` | number | kWh/m²/year | Populated (fixed base load) |
| `total` | number | kWh/m²/year | Sum of all categories |

---

### ImpactResult (extended — previously-null energy fields now populated)

| Field | Change | Phase 1 |
|---|---|---|
| `co2_energy_kwh_m2` | Was null → now `number` | = `energy_breakdown.total` |
| `energy_neutrality_pct` | Was null → now `number` (0–100) | = min(100, round(56250 / (total × floors × 625) × 100)) |
| `energy_breakdown` | Was null → now `EnergyBreakdown` | Populated from lookup + adjustments |

All other ImpactResult fields remain unchanged.

---

### EnergyLookupTable (new — stored in `data/energyData.json`)

| Field | Type | Description |
|---|---|---|
| `data_version` | string (semver) | Must match across all data files |
| `base` | object | Base kWh/m²/year per category, keyed by installatie type |
| `lift_scale` | object | Floor-count-based multipliers for lift energy |
| `adjustments` | object | Per Step2Param per option → per category multiplier |

**Lift scale table**:

| Threshold | Multiplier |
|---|---|
| floors < 9 | 0.5 (no elevator or minimal use) |
| floors 9–27 | 1.0 (base) |
| floors 28–37 | 1.3 (3rd elevator, longer travel) |
| floors ≥ 38 | 1.6 (4th elevator, max height regime) |

---

### EnergyScenario (chart data — not persisted)

Pre-computed energy breakdown for all floors 2–71 at the current configuration. Used by `energyChart.js`. Computed by `getEnergyChartData()` on demand; not stored in state.

| Field | Type | Description |
|---|---|---|
| `labels` | string[] | Height labels: `[floors × 3.5 + 'm']` for floors 2–71 |
| `datasets` | object | 7 keys (one per category), each an array of 70 values |
| `currentFloorIndex` | integer | Index of current floor in labels array (floor − 2) |

---

## State Transitions (Energie module additions)

```
User changes Step 2 control (balkons, zonwering, slider)
  → store.setState({ step2: { [field]: newValue } })
  → store deep-merges into _state.step2
  → All subscribers notified synchronously
  → main.js subscriber calls getImpact(625, floors×3.5, bouwmethodiek, installatie, state.step2)
  → ImpactResult now has populated energy_breakdown, co2_energy_kwh_m2, energy_neutrality_pct
  → step1Panel.updateOutputs(state, impact) → energie neutraliteit % updates in output panel
  → energyChart.updateEnergyChart(state, impact) → chart datasets recomputed, current bar highlighted

User changes installatie (Step 1, already wired)
  → store.setState({ installatie: newValue })
  → same flow as above — energy chart updates to new base scenario
```

---

## Validation Rules

- `raamOppervlak` MUST be one of [30, 40, 50, 60, 70, 80]. Values outside this set are clamped to nearest valid step at the store level.
- `isolatieRc` MUST be one of [3, 4, 5, 6, 7, 8]. Values outside this set are clamped.
- `balkons`, `zonwering`, `luchtdichtheid`, `liftEfficiency` MUST be one of their defined enum values. Invalid values fall back to the default.
- `energy_neutrality_pct` is always capped at 100. When capped, the UI MUST display "Energie positief" label.
- `EnergyBreakdown` fields MUST all be non-negative numbers rounded to 1 decimal place.
- `data_version` in `energyData.json` MUST match `data_version` in `thresholds.json` and `co2Material.json`.
