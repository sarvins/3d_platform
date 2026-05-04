# Contract: getEnergyChartData()

**File**: `js/getImpact.js` (new export, same file as Material module)
**Role**: Pre-computes energy breakdown for all floor scenarios (2–71) for the given configuration. Called by `energyChart.js` on init and whenever installatie or Step 2 params change.

---

## Signature

```javascript
getEnergyChartData(installatie, step2Params) → EnergyChartData
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `installatie` | string | Installatie type key from store (e.g. `'business_as_usual'`) |
| `step2Params` | Step2Params object | Full step2 sub-object from store state |

### Return: EnergyChartData

```javascript
{
  labels: string[],     // 70 labels: ['7m', '10.5m', ..., '248.5m'] (floors 2–71 × 3.5m)

  datasets: {
    verwarming:    number[],  // 70 values, kWh/m²/year
    koeling:       number[],
    ventilatie:    number[],
    verlichting:   number[],
    warmtapwater:  number[],
    lift:          number[],
    gebruikers:    number[],
  },

  data_version: string,  // from energyData.json, e.g. '0.1.0-placeholder'
}
```

---

## Behaviour rules

- All 70 floor scenarios (floors 2–71) are computed in a single call. The chart pre-loads all scenarios on init so bar updates are instant.
- Lift values in `datasets.lift` are scaled per the `lift_scale` table (lower for floors < 9, higher for floors ≥ 28).
- Step 2 adjustment factors are applied to all 70 scenarios consistently.
- All values are rounded to 1 decimal place.
- Returns `data_version` so the chart can display data provenance if needed.

---

## Extended getImpact() return fields

`getImpact()` now returns non-null energy fields:

```javascript
{
  co2_energy_kwh_m2:     number,           // total kWh/m²/year at current floors
  energy_neutrality_pct: number,           // 0–100, capped; computed from 56,250 kWh PV / demand
  energy_breakdown: {
    verwarming:    number,
    koeling:       number,
    ventilatie:    number,
    verlichting:   number,
    warmtapwater:  number,
    lift:          number,
    gebruikers:    number,
    total:         number,
  },
  energy_is_positive: boolean,  // true when neutrality would exceed 100%
  // ... all existing Material module fields unchanged
}
```

`step2Params` is now used by `getImpact()`. When called with `{}` or default step2, defaults are applied internally.
