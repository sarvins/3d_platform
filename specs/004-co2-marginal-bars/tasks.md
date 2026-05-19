# Tasks: CO2 Marginal Cost Bars

**Input**: Design documents from `/specs/004-co2-marginal-bars/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: No new test files. Existing 5 tests must pass throughout.

**Organization**: US2 (data extension) is a prerequisite for US1 (chart bars) since the bars need the full 2–71 dataset. US2 tasks touch `co2Material.json` and `getImpact.js`. US1 tasks touch `co2MaterialChart.js` and `main.js`. No file is shared between stories — US1 and US2 can be worked in parallel if needed, but US1 should be validated after US2.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1 / US2
- All file paths relative to `3d_platform/`

---

## Phase 1: Setup

- [x] T001 Run all 5 existing tests to confirm baseline — `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js` — all must pass before any changes

---

## Phase 2: User Story 2 — CO2 data extended to floor 71 (Priority: P2, prerequisite for US1)

**Goal**: `co2Material.json` covers floors 2–71; `getChartData()` returns 70 values per variant; CO2 outputs at floors 51–71 are no longer flat.

**Independent Test**: Set floor count to 60 — CO2 Materiaal card shows a value above the floor 50 value (248 kg CO₂/m² for BAU). Set floor count to 71 — value spikes visibly above floor 70. Run all 5 tests — all pass.

- [x] T002 [US2] Extend `data/co2Material.json` — append 6 control points to each of the 4 bouwmethodiek arrays after the existing `[50, x]` entry: `business_as_usual`: add `[51,250],[55,258],[60,271],[65,283],[70,295],[71,328]`; `hoogwaardig_hybride`: add `[51,177],[55,182],[60,191],[65,200],[70,208],[71,232]`; `best_practice_biobased`: add `[51,160],[55,165],[60,173],[65,180],[70,188],[71,210]`; `max_innovatief`: add `[51,150],[55,155],[60,162],[65,170],[70,176],[71,198]`; do NOT change `data_version` or any existing control points

- [x] T003 [US2] Extend `js/getImpact.js` — in `getChartData()`, change `for (let f = 2; f <= 50; f++)` to `for (let f = 2; f <= 71; f++)` (line 183); no other changes to this function or its return type

**Checkpoint**: Run all 5 tests — must still pass. Open platform, set floors to 60, verify CO2 card shows ~271 kg CO₂/m² (BAU). Set floors to 71, verify value is ~328 and higher than at floor 70.

---

## Phase 3: User Story 1 — Marginal CO2 bars on the material chart (Priority: P1)

**Goal**: Semi-transparent marginal CO2 bars appear behind the average lines, reactive to bouwmethodiek selection, with correct tooltip labels and floor 71 threshold annotation.

**Independent Test**: Open platform — bars visible behind lines. Bars at floors 9, 16, 28, 38, 71 are taller than neighbours. Switch bouwmethodiek — bars update colour and height within 200ms. Tooltip shows "Marginale CO₂: X kg CO₂/m²" for bars. Floor 71 amber threshold line appears on chart.

- [x] T004 [US1] Rewrite `js/charts/co2MaterialChart.js` — make these changes to `initCo2MaterialChart(canvas)`:

  (1) Update `THRESHOLD_FLOORS` from `[9, 16, 28, 38]` to `[9, 16, 28, 38, 71]` and `THRESHOLD_LABELS` from `['1e lift', '2e lift', '3e lift', '4e lift']` to `['1e lift', '2e lift', '3e lift', '4e lift', '5e lift']`

  (2) Compute initial marginal series for `'business_as_usual'`: call `getChartData()`, get `avg = datasets['business_as_usual']` and `labels`; compute `initialMarginals = avg.map((v, i) => i === 0 ? +(v * labels[i]).toFixed(1) : +(v * labels[i] - avg[i-1] * labels[i-1]).toFixed(1))`

  (3) Prepend a bar dataset as the **first** entry (index 0) in the `datasets` array passed to `new Chart(...)`:
  ```javascript
  {
    type: 'bar',
    label: 'Marginale CO₂/m²',
    data: initialMarginals,
    backgroundColor: COLORS['business_as_usual'] + '66',
    borderWidth: 0,
    order: 2,
    barPercentage: 0.85,
    categoryPercentage: 0.9,
  }
  ```

  (4) Add `order: 1` to each of the 3 existing line datasets so they render on top of bars

  (5) Remove `min: 0` from the y-axis options (let Chart.js auto-scale to fit both bars and lines)

  (6) Update `tooltip.callbacks.label`:
  ```javascript
  label: ctx => {
    if (ctx.dataset.type === 'bar') return `Marginale CO₂: ${ctx.parsed.y} kg CO₂/m²`;
    return `${ctx.dataset.label}: ${ctx.parsed.y} kg CO₂/m²`;
  }
  ```

- [x] T005 [US1] Add `export function updateMarginalBars(bouwmethodiek)` to `js/charts/co2MaterialChart.js` — after `updateMarker`:
  ```javascript
  export function updateMarginalBars(bouwmethodiek) {
    if (!_chart) return;
    const { labels, datasets } = getChartData();
    const avg = datasets[bouwmethodiek] || datasets['business_as_usual'];
    const marginals = avg.map((v, i) =>
      i === 0 ? +(v * labels[i]).toFixed(1) : +(v * labels[i] - avg[i-1] * labels[i-1]).toFixed(1)
    );
    _chart.data.datasets[0].data = marginals;
    _chart.data.datasets[0].backgroundColor = (COLORS[bouwmethodiek] || COLORS['business_as_usual']) + '66';
    _chart.update('none');
  }
  ```

- [x] T006 [US1] Extend `js/main.js` — add `updateMarginalBars` to the import from `./charts/co2MaterialChart.js`; add `updateMarginalBars(state.bouwmethodiek)` call inside the `subscribe` callback, after the existing `updateMarker(state.floors)` call

**Checkpoint**: Open platform — bars visible, reactive to bouwmethodiek, tooltip shows marginal label, floor 71 threshold annotation present.

---

## Phase 4: Polish

- [x] T007 Run all 5 tests to confirm no regression — `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js`; then open platform and manually validate all 5 quickstart.md scenarios; confirm energy chart, 3D viewer, consequence panel, section view toggle, and all Step 2 controls still function correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately.
- **Phase 2 (US2)**: Depends on Phase 1. T002 then T003 sequential (T003 imports from the file T002 extends, but they are different files — can run in parallel if needed).
- **Phase 3 (US1)**: Depends on Phase 2 complete (needs 70 values from `getChartData()`). T004 and T005 both touch `co2MaterialChart.js` — sequential. T006 depends on T005 (imports `updateMarginalBars`).
- **Phase 4 (Polish)**: Depends on all phases complete.

### User Story Dependencies

- **US2 (P2)**: Must complete before US1 can be fully validated (bars need 70-point dataset). Can be implemented first.
- **US1 (P1)**: Depends on US2 for correct chart data range. T004, T005 sequential (same file). T006 after T005.

### Parallel Opportunities

```
Phase 2:
  T002 [P] (co2Material.json)
  T003 [P] (getImpact.js)       ← different files, can run alongside T002

Phase 3 (after Phase 2):
  T004 (co2MaterialChart.js)    ← sequential
  T005 (co2MaterialChart.js)    ← sequential after T004 (same file)
  T006 (main.js)                ← after T005
```

---

## Implementation Strategy

### MVP First (US2 only — Tasks T001–T003)

1. T001 — verify tests
2. T002–T003 in parallel — extend JSON + getChartData loop
3. **STOP and validate**: floor 60 and 71 CO2 values are no longer flat

### Full Delivery

1. T001–T003 → US2 complete
2. T004–T006 → US1 complete
3. T007 → full regression check

---

## Notes

- T002 and T003 touch different files and can run in parallel, but T003's change is trivial (one number in a loop bound) — sequential is fine.
- T004 and T005 both edit `co2MaterialChart.js` — they MUST be sequential.
- The bar dataset MUST be at index 0 in `_chart.data.datasets`. The 3 line datasets are at indices 1, 2, 3. `updateMarginalBars` relies on this index to update the correct dataset.
- COLORS map in `co2MaterialChart.js` has no entry for `max_innovatief` (pre-existing omission). The fallback in `updateMarginalBars` (`|| COLORS['business_as_usual']`) handles this gracefully if the user ever selects that variant.
