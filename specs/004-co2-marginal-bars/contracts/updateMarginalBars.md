# Contract: updateMarginalBars

**File**: `js/charts/co2MaterialChart.js`
**Type**: Exported function

## Signature

```javascript
export function updateMarginalBars(bouwmethodiek: string): void
```

## Behaviour

- Calls `getChartData()` to get the current interpolated average CO2 values for all bouwmethodiek variants
- Computes the marginal series for `bouwmethodiek` using the formula:
  ```javascript
  const avg = datasets[bouwmethodiek];
  const marginals = avg.map((v, i) => {
    if (i === 0) return +(v * labels[i]).toFixed(1);
    return +(v * labels[i] - avg[i-1] * labels[i-1]).toFixed(1);
  });
  ```
- Updates `_chart.data.datasets[0]` (the bar dataset, at index 0):
  - `.data = marginals`
  - `.backgroundColor = COLORS[bouwmethodiek] + '66'`
- Calls `_chart.update('none')` to redraw without animation
- If `_chart` is null (not yet initialised), returns immediately

## Invariants

- The bar dataset is ALWAYS at index 0 in `_chart.data.datasets`; the 3 line datasets are at indices 1, 2, 3
- `bouwmethodiek` MUST be one of the 4 valid keys; if an unknown key is passed, the function uses `'business_as_usual'` as fallback via `datasets[bouwmethodiek] || datasets['business_as_usual']`
- `_chart.update('none')` is always used — never `_chart.update()` (no animation)

## Called by

- `js/main.js` → subscribe callback, on every store state change

---

# Contract: initCo2MaterialChart (amended)

The existing `initCo2MaterialChart(canvas)` is amended to:

1. Create the bar dataset as the **first** dataset (index 0):
   ```javascript
   {
     type: 'bar',
     label: 'Marginale CO₂/m²',
     data: initialMarginals,        // computed for 'business_as_usual' at init
     backgroundColor: COLORS['business_as_usual'] + '66',
     borderWidth: 0,
     order: 2,                      // rendered behind lines
     barPercentage: 0.85,
     categoryPercentage: 0.9,
   }
   ```

2. Add `order: 1` to each of the 3 line datasets (rendered on top of bars)

3. Remove `min: 0` from y-axis to allow auto-scaling

4. Update `THRESHOLD_FLOORS` to `[9, 16, 28, 38, 71]` and `THRESHOLD_LABELS` to `['1e lift', '2e lift', '3e lift', '4e lift', '5e lift']`

5. Update tooltip `callbacks.label` to distinguish bars from lines:
   ```javascript
   label: ctx => {
     if (ctx.dataset.type === 'bar')
       return `Marginale CO₂: ${ctx.parsed.y} kg CO₂/m²`;
     return `${ctx.dataset.label}: ${ctx.parsed.y} kg CO₂/m²`;
   }
   ```
