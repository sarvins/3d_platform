# Data Model: CO2 Material Module

**Branch**: `001-co2-material-module` | **Date**: 2026-05-02

---

## Entities

### TowerConfiguration
The user's current input state. The sole input to `getImpact()`.

| Field | Type | Constraints | Default |
|---|---|---|---|
| `floors` | integer | 2–71 inclusive | 10 |
| `bouwmethodiek` | enum | See values below | `'business_as_usual'` |

**Bouwmethodiek values** (internal key → Dutch UI label → chart line):

| Key | Dutch label | Chart line |
|---|---|---|
| `business_as_usual` | Business as usual | Conventioneel (red) |
| `hoogwaardig_hybride` | Hoogwaardig hybride | Hybride (blue) |
| `best_practice_biobased` | Best practice bio-based | Biobased (green) |
| `max_innovatief` | Max innovatief | Not charted — metric panel only |

---

### ImpactResult
The computed output for a given TowerConfiguration. Returned by `getImpact()`.

| Field | Type | Unit | Phase 1 |
|---|---|---|---|
| `co2_material_kg_m2` | number | kg CO2/m² GFA | Populated from lookup |
| `co2_energy_kwh_m2` | number | kWh/m²/year | null (Energie module) |
| `energy_neutrality_pct` | number | % | null (Energie module) |
| `co2_breakdown` | object or null | — | null |
| `co2_breakdown.fundering` | number or null | kg CO2/m² | null |
| `co2_breakdown.constructie` | number or null | kg CO2/m² | null |
| `co2_breakdown.liften` | number or null | kg CO2/m² | null |
| `co2_breakdown.brand` | number or null | kg CO2/m² | null (TBD) |
| `structural` | object | — | Populated |
| `structural.core_variant` | enum `'A'–'E'` | — | From threshold lookup |
| `structural.foundation_type` | string | — | From threshold lookup |
| `structural.elevator_count` | integer 0–4 | — | From threshold lookup |
| `structural.stability_system` | string | — | From threshold lookup |
| `thresholds_crossed` | array of ThresholdEvent | — | Populated |
| `data_version` | string (semver) | — | From `DATA_VERSION` constant |
| `tolerance_note` | string | — | `'±5–10 kg CO2/m² (illustrative)'` |
| `floors` | integer | — | Derived from height_m / 3.5 |

---

### ThresholdEvent
A structural step-change triggered when floor count crosses a threshold. Drives advisory callouts and 3D model updates.

| Field | Type | Description |
|---|---|---|
| `threshold_reached` | string | Human-readable Dutch label (e.g. `'Vertical Transport Level 1'`) |
| `label` | string | Longer Dutch explanation shown in advisory callout |
| `field` | string | Which structural parameter changed (e.g. `'elevator_1'`) |
| `direction` | `'up'` or `'down'` | Whether floor count crossed upward or downward |
| `previous_value` | integer | Floor count before crossing |
| `new_value` | integer | Floor count after crossing |

---

### ThresholdEntry
One row in the structural threshold table. Stored inline in `getImpact.js`.

| Field | Type | Description |
|---|---|---|
| `floors` | integer | Floor count at which this threshold triggers |
| `height_m` | float | Equivalent height in metres (floors × 3.5m — assumed) |
| `gfa_m2` | integer | GFA per floor in m² (625 for Phase 1) |
| `effect` | string | Internal key for what changes (e.g. `'elevator_1'`) |
| `threshold_reached` | string | Non-empty human-readable label (required by Gate 3) |
| `label` | string | Longer Dutch advisory callout text |
| `confirmed` | boolean | Whether this threshold is verified (`true`) or assumed (`false`) |

**Current threshold table** (Phase 1 baseline):

| floors | height_m | effect | threshold_reached | confirmed |
|---|---|---|---|---|
| 9 | 31.5 | `elevator_1` | `'1e lift vereist'` | true |
| 16 | 56.0 | `elevator_2` | `'2e lift vereist'` | false (assumed) |
| 28 | 98.0 | `elevator_3` | `'3e lift vereist'` | true |
| 38 | 133.0 | `elevator_4` | `'4e lift vereist'` | false (assumed) |

---

### LookupTable
CO2 material values per bouwmethodiek. Stored inline in `getImpact.js` as control-point arrays. Interpolated linearly between points.

**Format**: array of `[floors, kg_CO2_m2]` control points, sorted ascending by floors.

**Four rows** (one per bouwmethodiek key): `business_as_usual`, `hoogwaardig_hybride`, `best_practice_biobased`, `max_innovatief`.

**Value shape** (illustrative, ±5–10 kg CO2/m² tolerance):
- All four curves are U-shaped — high at low floors (foundation dominates), minimum ~8–12 floors, rising thereafter.
- Threshold crossings produce spikes (marginal CO2 jumps at elevator/foundation steps).
- `business_as_usual` has the highest values; `max_innovatief` the lowest.
- Version field: `DATA_VERSION = '0.1.0-placeholder'` — bumped on any data edit.

---

## State Transitions

```
Page load
  → TowerConfiguration { floors: 10, bouwmethodiek: 'business_as_usual' }
  → getImpact() called
  → ImpactResult computed
  → UI renders (panel + 3D + chart)

User clicks "+" or "−"
  → store.setState({ floors: newValue })
  → All subscribers notified synchronously
  → getImpact() called with new TowerConfiguration
  → If floors crossed a threshold: ImpactResult.thresholds_crossed is non-empty
  → Tower.update() → 3D model updates
  → step1Panel.updateOutputs() → metric panel + advisory callout renders
  → co2MaterialChart.updateMarker() → vertical line moves

User selects different bouwmethodiek
  → store.setState({ bouwmethodiek: newValue })
  → getImpact() called — no threshold events (structural state unchanged)
  → CO2 metric updates; 3D model unchanged; chart marker stays; chart lines unchanged
```

---

## Validation Rules

- `floors` MUST be an integer between 2 and 71 inclusive. Values outside this range MUST be clamped at the store level before calling `getImpact()`.
- `bouwmethodiek` MUST be one of the four defined enum keys. Unknown values fall back to `'business_as_usual'`.
- `threshold_reached` in every ThresholdEntry MUST be a non-empty string. Verified by `tests/thresholdIntegrity.js`.
- `data_version` in ImpactResult MUST equal the `DATA_VERSION` constant. Verified by `tests/dataVersion.js`.
- `thresholds_crossed` is always an array (may be empty). Never null.
