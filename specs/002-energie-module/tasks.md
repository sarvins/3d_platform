# Tasks: Energie Module

**Input**: Design documents from `/specs/002-energie-module/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: One new constitution test (`tests/energySnapshot.js`) in Phase 2 Foundational. Existing 4 Material module tests must continue to pass throughout.

**Organization**: Strictly additive — tasks extend existing files or create new ones. No existing Material module file is deleted or restructured.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same phase)
- **[Story]**: US1 / US2 / US3
- All file paths relative to `3d_platform/`

---

## Phase 1: Setup

**Purpose**: Create the new energy data file. All other tasks depend on this.

- [x] T001 Create `data/energyData.json` — JSON object with `data_version: "0.1.0-placeholder"` (must match existing data files); `base` object with 3 installatie keys (`business_as_usual`, `high_tech`, `natuurlijk`), each containing 7 category values in kWh/m²/year: `business_as_usual`: verwarming 15, koeling 5, ventilatie 6, verlichting 8, warmtapwater 7, lift 2, gebruikers 2; `high_tech`: verwarming 8, koeling 4, ventilatie 4, verlichting 5, warmtapwater 5, lift 2, gebruikers 2; `natuurlijk`: verwarming 5, koeling 3, ventilatie 8, verlichting 4, warmtapwater 3, lift 1, gebruikers 1; `lift_scale` object with floor thresholds: `below_9: 0.5`, `9_to_27: 1.0`, `28_to_37: 1.3`, `above_38: 1.6`; `adjustments` object with 6 Step 2 keys — `zonwering`: extern {koeling:0.70}, intern {koeling:0.90}, zonwerend_glas {koeling:0.85}; `balkons`: buiten {verwarming:0.97}, binnen {verwarming:1.00}, gevellijn {verwarming:0.99}; `raamOppervlak`: "30" {verwarming:0.80,koeling:0.70}, "40" {verwarming:0.88,koeling:0.80}, "50" {} (neutral), "60" {verwarming:1.10,koeling:1.15}, "70" {verwarming:1.20,koeling:1.28}, "80" {verwarming:1.30,koeling:1.40}; `isolatieRc`: "3" {verwarming:1.30}, "4" {verwarming:1.15}, "5" {} (neutral), "6" {verwarming:0.90}, "7" {verwarming:0.80}, "8" {verwarming:0.70}; `luchtdichtheid`: hoog {ventilatie:0.85}, norm {} (neutral); `liftEfficiency`: zuinig {lift:0.60}, standaard {} (neutral)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the calculation layer and add the energy snapshot test. All user story work blocks on this phase.

**⚠️ CRITICAL**: No user story work begins until T002–T004 are complete and T004 passes.

- [x] T002 Extend `js/store.js` — add `step2` sub-object to `_state` default: `{ balkons: 'buiten', zonwering: 'extern', raamOppervlak: 50, isolatieRc: 5, luchtdichtheid: 'norm', liftEfficiency: 'standaard' }`; update `setState(updates)` to deep-merge partial `step2` updates (if `updates.step2` exists, merge into `_state.step2` field by field rather than replacing); add `UGLAS_MAP` constant: `{3:1.2, 4:1.1, 5:1.0, 6:0.95, 7:0.85, 8:0.80}`; add `RC_VALUES` and validation for step2 enum fields with fallback to defaults; backward compatible — existing subscribers receive new `step2` field but are not required to use it
- [x] T003 [P] Extend `js/getImpact.js` — add `import energyData from '../data/energyData.json' with { type: 'json' };` after existing imports; validate `energyData.data_version === DATA_VERSION` (throw on mismatch); implement `function computeEnergyBreakdown(installatie, floors, step2Params)`: get base values from `energyData.base[installatie]` (fallback to `business_as_usual`); apply lift scale based on floor thresholds from `energyData.lift_scale`; for each of 6 step2 param fields, look up adjustment factors in `energyData.adjustments[field][value]` and multiply relevant category values; round all values to 1 decimal; compute `total = sum of all 7 categories`; in `getImpact()`, call `computeEnergyBreakdown(installatie, floors, step2Params)`; populate `co2_energy_kwh_m2 = breakdown.total`, `energy_breakdown = { ...breakdown }`, `energy_neutrality_pct = Math.min(100, Math.round(56250 / (breakdown.total * floors * 625) * 100))`, `energy_is_positive = (56250 / (breakdown.total * floors * 625)) > 1.0`; export new function `getEnergyChartData(installatie, step2Params)` returning `{ labels: string[], datasets: { verwarming, koeling, ventilatie, verlichting, warmtapwater, lift, gebruikers }, data_version }` computed for all floors 2–71 (each label = `Math.round(floor * 3.5) + 'm'`)
- [x] T004 [P] Write `tests/energySnapshot.js` — import `getImpact` and `getEnergyChartData` from `../js/getImpact.js`; define 10 snapshot pairs: (1) default settings floor 10 → energy_breakdown has all 7 keys and total > 0; (2) default settings floor 2 → energy_is_positive === true (tiny building, large roof); (3) default settings floor 71 → energy_neutrality_pct < 30 (tall building); (4) installatie high_tech floor 20 → total lower than business_as_usual at same floor; (5) installatie natuurlijk floor 20 → total lowest of 3 scenarios; (6) step2.liftEfficiency='zuinig' vs 'standaard' floor 28 → zuinig has lower lift value; (7) step2.isolatieRc=8 vs 3 floor 20 → Rc8 has lower verwarming; (8) step2.zonwering='intern' vs 'extern' floor 20 → intern has higher koeling; (9) getEnergyChartData returns datasets with 70 values per category; (10) energy_breakdown.total = sum of all 7 categories (±0.5 tolerance for rounding); assert ImpactResult shape includes `energy_breakdown`, `co2_energy_kwh_m2`, `energy_neutrality_pct`, `energy_is_positive`; exit 0/1

**Checkpoint**: Run `node tests/energySnapshot.js` — must pass before proceeding to user stories. Also run all 4 existing tests to confirm no regression.

---

## Phase 3: User Story 1 — Energy chart + PV percentage (Priority: P1) 🎯 MVP

**Goal**: Platform shows stacked energy breakdown chart and energie neutraliteit % at default settings, updating when floor count or installatie changes.

**Independent Test**: Open platform, verify energy chart appears with 7 colour-coded stacked bars. Verify energie neutraliteit % is non-zero in output panel. Switch installatie to "Natuurlijk" — verify chart redraws with lower totals. Add floors to 71 — verify % drops. Set floors to 2 — verify "Energie positief" label appears.

- [x] T005 [P] [US1] Implement `js/charts/energyChart.js` — `const Chart = globalThis.Chart`; define `CATEGORIES` array in display order: `['verwarming','koeling','ventilatie','verlichting','warmtapwater','lift','gebruikers']`; define `COLORS` map: verwarming #C0392B, koeling #5DADE2, ventilatie #85929E, verlichting #F4D03F, warmtapwater #E67E22, lift #566573, gebruikers #82E0AA; define Dutch `LABELS_NL` map; define `FLOOR_MARKER_STYLE` for current-floor bar highlight (`borderColor: '#2D5F8A'`, `borderWidth: 3`); module-scoped `_chart = null`, `_currentFloorIndex = 8` (floor 10 = index 8 in 2–71 range); export `initEnergyChart(canvas)`: call `getEnergyChartData('business_as_usual', defaultStep2)` (import default step2 from store or use hardcoded defaults); create Chart 'bar' type with `stacked:true`; 7 datasets; x-axis title 'Hoogte (m)', y-axis title 'kWh/m²/jaar'; `animation:false`, `responsive:true`, `maintainAspectRatio:false`; export `updateEnergyChart(state, impact)`: import getEnergyChartData; call with `state.installatie` and `state.step2`; update each dataset's `data` array; set current floor bar backgroundColor with highlight border (all other bars no border); call `_chart.update('none')`
- [x] T006 [P] [US1] Extend `js/ui/step1Panel.js` — add 'Energie neutraliteit' metric card to the `initStep1Panel` HTML output grid (5th card, spanning full width or 2 columns): label "Energie neutraliteit (dak)", value id `out-pv`, unit "% via dakpanelen"; in `updateOutputs(state, impact)`: set `out-pv` to `impact.energy_neutrality_pct ?? '—'`; if `impact.energy_is_positive` is true, show text "Energie positief 🌱" instead of percentage; if null (not yet computed), show '—'
- [x] T007 [US1] Update `index.html` — inside `#chart-section`, wrap existing chart in `<div class="chart-half">` with heading `<h3>CO₂ &amp; hoogte — materiaal <span class="chart-unit">kg CO₂/m²</span></h3>`; add second `<div class="chart-half">` with heading `<h3>Energie gebruik <span class="chart-unit">kWh/m²/jaar</span></h3>` and `<canvas id="energy-chart"></canvas>`; update `css/main.css` — set `#chart-section { display:flex; flex-direction:column; padding:0; }` and add `.chart-half { flex:1; min-height:0; display:flex; flex-direction:column; padding:8px 12px 8px 8px; } .chart-half:first-child { border-bottom:1px solid var(--border); } .chart-half h3 { font-size:13px; font-weight:600; color:var(--blue-dark); margin-bottom:6px; flex-shrink:0; } .chart-half canvas { flex:1; min-height:0; }`; extend `js/main.js` — import `initEnergyChart`, `updateEnergyChart` from `./charts/energyChart.js`; call `initEnergyChart(document.getElementById('energy-chart'))` in setup; add `updateEnergyChart(state, impact)` to the `subscribe` callback

**Checkpoint**: US1 fully functional. Energy chart visible, energie neutraliteit % in output panel, both update on floor count and installatie changes.

---

## Phase 4: User Story 2 — Discrete envelope choices (Priority: P2)

**Goal**: Step 2 panel appears with balkons and zonwering radio buttons; changing them updates the energy chart.

**Independent Test**: Step 2 panel visible in left panel. Switch zonwering from "Extern" to "Intern" — verify koeling bar increases in chart. Switch balkons — verify chart updates. Verify all 7 energy categories still visible after any change.

- [x] T008 [US2] Implement `js/ui/step2Panel.js` — import `setState` from `../store.js`; export `initStep2Panel(container)`: create and append a `<div>` with Dutch section heading "Stap 2 — Gevelparameters" and subsection `<hr class="divider">`; render balkons radio group: label "Balkons", 3 options (value/label): buiten/"Buiten", binnen/"Binnen", gevellijn/"Gevellijn"; default checked: buiten; render zonwering radio group: label "Zonwering", 3 options: extern/"Extern", intern/"Intern", zonwerend_glas/"Zonwerend glas"; default checked: extern; each radio `onChange`: `setState({ step2: { balkons: value } })` or `setState({ step2: { zonwering: value } })`; use existing `.radio-group` and `.control-group` CSS classes from `css/main.css` (no new CSS needed for radio buttons)
- [x] T009 [US2] Extend `js/main.js` — import `initStep2Panel` from `./ui/step2Panel.js`; call `initStep2Panel(document.getElementById('panel'))` after `initStep1Panel(...)` call

**Checkpoint**: US2 fully functional. Step 2 discrete choices update the energy chart within 200ms.

---

## Phase 5: User Story 3 — Slider controls (Priority: P3)

**Goal**: Sliders for raam oppervlak, isolatie, luchtdichtheid, and lift efficiency appear in Step 2 panel and update the energy chart.

**Independent Test**: Move raam oppervlak to 80% — verify verwarming and koeling bars increase. Move isolatie to Rc 8 — verify verwarming decreases and the display shows both "Rc 8" and "Uglas 0.80". Switch luchtdichtheid to "Hoog" — verify ventilatie decreases. Switch lift to "Zuinig" — verify lift bar decreases.

- [x] T010 [US3] Extend `js/ui/step2Panel.js` — append slider controls to the Step 2 section HTML: (1) raam oppervlak — `<input type="range" min="30" max="80" step="10" value="50" id="slider-raam">` with label "Raam oppervlak", current value display showing `50%`; onChange: `setState({ step2: { raamOppervlak: parseInt(e.target.value) } })`, update display; (2) isolatie — `<input type="range" min="0" max="5" step="1" value="2" id="slider-isolatie">` with label "Isolatie", display showing both Rc and Uglas from `RC_TO_UGLAS` lookup `{0:'Rc 3 / Uglas 1,2', 1:'Rc 4 / Uglas 1,1', 2:'Rc 5 / Uglas 1,0', 3:'Rc 6 / Uglas 0,95', 4:'Rc 7 / Uglas 0,85', 5:'Rc 8 / Uglas 0,80'}`; onChange: `setState({ step2: { isolatieRc: [3,4,5,6,7,8][parseInt(e.target.value)] } })`, update display; (3) luchtdichtheid — two-option button toggle (not a range), buttons "Hoog" and "Norm", default "Norm" active; onClick: `setState({ step2: { luchtdichtheid: value } })`; (4) lift rendement — two-option button toggle "Zuinig" and "Standaard", default "Standaard" active; onClick: `setState({ step2: { liftEfficiency: value } })`; style toggles with existing `.metric-card` + active class; add minimal CSS if needed inside a `<style>` block in the panel HTML (not in main.css to avoid file conflict during parallel work)

**Checkpoint**: US3 fully functional. All 4 slider/toggle controls update the energy chart within 200ms. All existing Material module outputs unchanged.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 Run all 5 tests to confirm no regression — `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js`; open platform via Live Server and manually verify: CO2 chart still shows 3 lines, 3D model still responds to floor count, bouwmethodiek selector still works (FR-016 no regression check)
- [x] T012 [P] Dutch language audit of `js/ui/step2Panel.js` and `js/charts/energyChart.js` — verify all visible labels, headings, radio options, toggle options, and chart legend labels are in Dutch; verify tolerance disclaimer on energie neutraliteit output is in English per constitution; fix any English labels found
- [x] T013 [P] Verify FR-014 tolerance disclaimer — confirm the text "indicatieve data, verificatie vereist" (or equivalent) is visible on the energie neutraliteit percentage display in `js/ui/step1Panel.js` output panel; add if missing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on T001 (energyData.json). T002, T003 [P] can run in parallel. T004 [P] after T003 (needs getImpact exports).
- **US1 (Phase 3)**: Depends on Foundational. T005 [P] and T006 [P] can run in parallel. T007 depends on T005 and T006.
- **US2 (Phase 4)**: Depends on US1. T008 then T009 sequential.
- **US3 (Phase 5)**: Depends on US2. T010 extends T008's file.
- **Polish (Phase 6)**: Depends on US3. T011 sequential first, then T012 [P] and T013 [P].

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (main.js already wired; step2Panel must be inited)
- **US3 (P3)**: Depends on US2 (extends the same step2Panel.js file)

### Parallel Opportunities

```
Phase 2 sub-batch A (parallel after T001):
  T002 extend store.js
  T003 extend getImpact.js
Phase 2 sub-batch B (after T003):
  T004 tests/energySnapshot.js

Phase 3 parallel batch:
  T005 energyChart.js
  T006 extend step1Panel.js (energie neutraliteit card)
  → T007 index.html + css + main.js    ← after T005 + T006
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) — Tasks T001–T007

1. T001 (data file)
2. T002–T003 in parallel, then T004
3. T005–T006 in parallel, then T007
4. **STOP and VALIDATE**: Open platform via Live Server. Verify energy chart and PV % appear. Run all 5 tests.

### Incremental Delivery

1. MVP (T001–T007) → energy chart + PV %, updates on floor/installatie changes
2. Add US2 (T008–T009) → balkons and zonwering discrete choices
3. Add US3 (T010) → sliders for precise fine-tuning
4. Polish (T011–T013) → regression check, language audit, disclaimer

---

## Notes

- T003 extends `getImpact.js` — when `step2Params` is `{}` or missing fields, defaults must be applied internally (fallback to the same defaults as store.js) so existing snapshot tests (which call getImpact with `{}`) continue to pass.
- T010 uses inline `<style>` for toggle button styles rather than editing `css/main.css`, to avoid merge conflicts if US2 and US3 tasks are worked in parallel.
- The abstraction boundary test (`tests/abstractionBoundary.js`) automatically validates the new `energyChart.js` and `step2Panel.js` files — no test updates needed.
- `data_version` in `energyData.json` MUST match `thresholds.json` and `co2Material.json` — all three are currently `"0.1.0-placeholder"`. The existing `tests/dataVersion.js` checks the version chain through getImpact.
