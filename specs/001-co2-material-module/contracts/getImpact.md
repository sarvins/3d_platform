# Contract: getImpact()

**File**: `js/getImpact.js`
**Role**: The single abstraction boundary between UI and data. Every CO2 and structural query MUST go through this function. No other file may read inline data or call a calculation engine directly.

---

## Signature

```javascript
getImpact(gfa_m2, height_m, bouwmethodiek, installatie, step2Params) → ImpactResult
```

### Parameters

| Parameter | Type | Description | Phase 1 value |
|---|---|---|---|
| `gfa_m2` | number | Gross floor area per floor in m² | Always 625 |
| `height_m` | number | Building height in metres (floors × 3.5) | Derived from store |
| `bouwmethodiek` | string | One of the four bouwmethodiek keys | From store |
| `installatie` | string | Installation/energy type key | `'business_as_usual'` (Energie module) |
| `step2Params` | object | Step 2 parameters (balkons, zonwering, sliders) | `{}` (Step 2 not yet built) |

### Return: ImpactResult

```javascript
{
  co2_material_kg_m2:   number,         // kg CO2/m²; from lookup table
  co2_energy_kwh_m2:    null,           // Energie module — null in Material module
  energy_neutrality_pct: null,          // Energie module — null in Material module

  co2_breakdown: null,                  // null in Layer 1

  structural: {
    core_variant:      'A'|'B'|'C'|'D'|'E',
    foundation_type:   string,          // Dutch description
    elevator_count:    0|1|2|3|4,
    stability_system:  string,          // Dutch description
  },

  thresholds_crossed: Array<{
    threshold_reached: string,          // Non-empty Dutch label
    label:             string,          // Longer Dutch advisory text
    field:             string,          // Internal key (e.g. 'elevator_1')
    direction:         'up'|'down',
    previous_value:    number,          // Previous floor count
    new_value:         number,          // Current floor count
  }>,

  data_version:   string,               // semver, e.g. '0.1.0-placeholder'
  tolerance_note: string,               // English disclaimer string
  floors:         number,               // Derived: Math.round(height_m / 3.5)
}
```

---

## Behaviour rules

- `getImpact()` is a **pure function** with one exception: it maintains a module-scoped `_prevFloors` variable to detect threshold crossings between calls. This is the only internal state permitted.
- If `bouwmethodiek` is not one of the four valid keys, the function falls back to `'business_as_usual'` without throwing.
- `height_m` is converted to `floors` internally: `floors = Math.round(height_m / FLOOR_HEIGHT_M)` where `FLOOR_HEIGHT_M = 3.5`.
- `thresholds_crossed` compares the derived `floors` value against `_prevFloors`. If this is the first call (`_prevFloors === null`), no thresholds are reported.
- `thresholds_crossed` reports crossings in **both directions** (adding or removing floors past a threshold).

---

## Also exported

```javascript
getChartData() → {
  labels:   number[],   // [2, 3, 4, ..., 50]
  datasets: {
    business_as_usual:      number[],
    hoogwaardig_hybride:    number[],
    best_practice_biobased: number[],
    max_innovatief:         number[],
  }
}
```

Used by `co2MaterialChart.js` to pre-compute all four curves on init. Returns interpolated values for every integer floor from 2 to 50.

---

## Abstraction boundary enforcement

The abstraction boundary test (`tests/abstractionBoundary.js`) verifies that:
- No file other than `getImpact.js` contains the inline data literals (lookup arrays or threshold table).
- All UI files (`viewer/`, `charts/`, `ui/`) only call `getImpact()` or `getChartData()` — they never access the data structures directly.
