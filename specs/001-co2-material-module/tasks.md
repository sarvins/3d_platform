# Tasks: CO2 Material Module

**Input**: Design documents from `/specs/001-co2-material-module/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Constitution-mandated tests are included (Gates 3–6). Tests for getImpact() snapshots and threshold integrity are in Phase 2 Foundational. Abstraction boundary test is in Polish (requires all UI files to exist first).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same phase)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All file paths are relative to repository root (`3d_platform/`)

---

## Phase 1: Setup

**Purpose**: Create directory structure and entry point files. No logic yet.

- [x] T001 Create all directories: `css/`, `js/`, `js/viewer/`, `js/viewer/shaders/`, `js/charts/`, `js/ui/`, `tests/`, `data/`
- [x] T002 [P] Create `package.json` in project root with `{ "type": "module" }` — enables Node.js ES module imports for test scripts without flags or `.mjs` extensions; no other fields required for Layer 1
- [x] T003 [P] Create `data/thresholds.json` — JSON object with top-level `data_version: "0.1.0-placeholder"` and `thresholds` array of 4 entries, each with: `floors` (integer), `height_m` (float, floors × 3.5), `gfa_m2: 625`, `effect` (string key), `threshold_reached` (non-empty Dutch label, e.g. `"1e lift vereist"`), `label` (longer Dutch advisory text), `confirmed` (boolean); entries for floors 9 (confirmed), 16 (assumed), 28 (confirmed), 38 (assumed); AND create `data/co2Material.json` — JSON object with `data_version: "0.1.0-placeholder"` and 4 keys (`business_as_usual`, `hoogwaardig_hybride`, `best_practice_biobased`, `max_innovatief`), each an array of `[floors, kg_CO2_m2]` control points approximating a U-curve with spikes at threshold floors (values from PowerPoint graphs, ±5–10 tolerance)
- [x] T004 [P] Create `index.html` — importmap pointing Three.js r163 and `three/addons/` to jsdelivr CDN; Chart.js 4.4.x UMD `<script>` tag; two-column grid layout (`<aside id="panel">`, `<section id="viewer-section">`, `<section id="chart-section">`); `<script type="module" src="js/main.js">` at bottom; no visible content yet
- [x] T005 [P] Create `css/main.css` — CSS custom properties for colour palette (background #B8D4E8, panel white/88%, blue-dark #2D5F8A, beige #C8B49A); 100vh body flex column; header 52px; main CSS grid `280px | 1fr` columns and `1fr | 1fr` rows with named areas `panel`, `viewer`, `chart`; floor stepper styles; metric card styles; threshold alert animation (`fadeIn`); viewer label positioning; chart canvas `flex: 1` with `min-height: 0`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. Nothing else starts until this phase is complete.

**⚠️ CRITICAL**: No user story work begins until all T006–T012 are done.

- [x] T006 Implement `js/store.js` — export `getState()` (returns shallow copy), `setState(updates)` (merges, clamps floors 2–71, validates bouwmethodiek against 4 keys, calls listeners synchronously), `subscribe(fn)` (adds to Set, calls fn immediately with current state, returns unsubscribe fn); default state `{ floors: 10, bouwmethodiek: 'business_as_usual', installatie: 'business_as_usual' }`; MUST NOT import from any other project file
- [x] T007 [P] Implement `js/getImpact.js` — import `THRESHOLDS` and threshold `data_version` from `./data/thresholds.json` (static import); import `CO2_MATERIAL_DATA` and co2 `data_version` from `./data/co2Material.json`; assert both `data_version` fields match (throw if not); define `DATA_VERSION` as the imported value; define `FLOOR_HEIGHT_M = 3.5`; implement `interpolate(table, x)` linear interpolation; implement `getCoreVariant(floors)` returning `'A'–'E'` by comparing against threshold floors; implement `getElevatorCount(floors)` returning 0–4; implement module-scoped `_prevFloors = null`; export `getImpact(gfa_m2, height_m, bouwmethodiek, installatie, step2Params)` returning full `ImpactResult` per contracts/getImpact.md; export `getChartData()` returning labels [2..50] and 4 dataset arrays (constitution gate: getImpact.js is the ONLY file that imports from `data/`)
- [x] T008 [P] Implement `js/viewer/scene.js` — export `initScene(container)`: create `THREE.Scene` with background colour #B8D4E8 and light fog; create `WebGLRenderer` with antialiasing, shadow maps, sized to container; create `PerspectiveCamera(40, aspect, 0.1, 200)` at position (14, 8, 14); create `OrbitControls` with damping, min/max distance, max polar angle; add `AmbientLight` and `DirectionalLight` with shadow map; add ground `PlaneGeometry(60,60)` mesh (colour #D8E8D0) rotated flat with `receiveShadow`; add `GridHelper`; attach `ResizeObserver` to container to keep renderer and camera aspect in sync; start `requestAnimationFrame` render loop; return `scene`; export `setCameraTarget(y)` to update OrbitControls target height
*Sub-batch: complete T007 first, then T009–T011 in parallel (all depend on T007's output files)*

- [x] T009 Write `tests/thresholdIntegrity.js` — import `THRESHOLDS` from `data/thresholds.json` directly (not via getImpact.js); assert every entry has a non-empty string `threshold_reached`; print pass/fail per entry and overall; exit code 0 on all pass, 1 on any fail (Gate 3)
- [x] T010 [P] Write `tests/dataVersion.js` — import `getImpact` and `DATA_VERSION` from `js/getImpact.js`; call `getImpact(625, 35, 'business_as_usual', 'business_as_usual', {})` and assert `result.data_version === DATA_VERSION`; print result; exit 0/1 (Gate 5)
- [x] T011 [P] Write `tests/getImpactSnapshot.js` — import `getImpact` from `js/getImpact.js`; define 10 known input/output pairs covering: floors below each threshold (8, 15, 27, 37), floors above each threshold (9, 16, 28, 38), and all 4 bouwmethodiek options at floor 20; assert each returns correct `co2_material_kg_m2` (±1 tolerance), correct `structural.elevator_count`, correct `structural.core_variant`, and that `ImpactResult` has all required fields (`data_version`, `tolerance_note`, `thresholds_crossed` array, `structural` object); exit 0/1 (Gate 6)
- [x] T012 Create `js/main.js` skeleton — import `subscribe`, `getState` from `./store.js`; import `getImpact` from `./getImpact.js`; import `initScene` from `./viewer/scene.js`; call `initScene(document.getElementById('three-container'))`; leave stubs commented with `// TODO: wired in T016` and `// TODO: wired in T018` so no stub is silent; this file will be completed in T016 and T018

**Checkpoint**: Run `node tests/thresholdIntegrity.js`, `node tests/dataVersion.js`, `node tests/getImpactSnapshot.js` — all must pass before proceeding.

---

## Phase 3: User Story 1 — Reactive floor count, 3D model, chart (Priority: P1) 🎯 MVP

**Goal**: User opens platform at 10 floors Business as usual, clicks + / − and sees CO2 metric, 3D model, and chart marker all update within 200ms.

**Independent Test**: Open platform, verify default state (10 floors, Business as usual). Click + five times to 15 floors — verify CO2 value changes, 3D model grows 5 floors, chart marker moves right. Click − to 5 floors — verify all outputs update. Check tolerance disclaimer is visible on CO2 value.

- [x] T013 [P] [US1] Implement `js/viewer/tower.js` — export `Tower` class; constructor takes `scene`, creates `THREE.Group`; `_buildFloors()`: `InstancedMesh` of `BoxGeometry(5, 0.38, 5)` with `MATERIALS.floor` (colour #C8B49A), `MAX_FLOORS = 80`, `castShadow = true`, `count = 0`; `_buildFoundation()`: `BoxGeometry(5.4, 0.25, 5.4)` at y = -0.125; `_buildCore()`: `BoxGeometry(1,1,1)` scaled per core variant via `CORE_SIZES` map (A→[1.2,2.0], B→[1.6,2.0], C→[2.0,2.0], D→[2.4,2.4], E→[2.8,2.8]); `_buildPiles()`: empty `Group`, populated in `_updatePiles(floors)` — grid of `CylinderGeometry(0.06, 0.072, depth, 8)` meshes (colour #4A4A5A), grid size scales with floor count (5 piles for <9 floors, 16 for <28, 25 for ≥28), depth = `Math.max(0.8, floors * 0.12)`; `_buildElevators()`: 4 pre-created `BoxGeometry(0.22, 1, 0.22)` meshes (colour #D0E4F0) at x positions [-0.45, -0.15, 0.15, 0.45], all `visible = false`; export `update(floors, impact)`: update `InstancedMesh.count`, `setMatrixAt` for each floor at `y = i * 0.5 + 0.19`, call `instanceMatrix.needsUpdate`, scale core to `[cw, floors*0.5, cd]` at `y = floors*0.25`, toggle elevator visibility per `impact.structural.elevator_count`, call `_updatePiles(floors)`, call `setCameraTarget(floors * 0.25)`
- [x] T014 [P] [US1] Implement `js/charts/co2MaterialChart.js` — import `getChartData` from `../getImpact.js`; export `initCo2MaterialChart(canvas)`: call `getChartData()`, create `Chart` (type `'line'`) with 3 datasets (business_as_usual→conventioneel red #C0392B, hoogwaardig_hybride→hybride blue #2D6BA4, best_practice_biobased→biobased green #27AE60), `borderWidth: 2`, `pointRadius: 0`, `tension: 0.3`, `fill: false`; x-axis label `'Aantal verdiepingen'`, y-axis label `'kg CO₂/m²'`; `animation: false`; `responsive: true`, `maintainAspectRatio: false`; register a custom `afterDraw` plugin that draws a vertical dashed line (colour rgba(45,95,138,0.7), dash [5,3], width 2) at the x-pixel for the current floor from `chartArea.top` to `chartArea.bottom`; store current floor in `plugin.options.currentFloor`; export `updateMarker(floors)`: update `plugin.options.currentFloor` and call `chart.update('none')`
- [x] T015 [P] [US1] Implement `js/ui/step1Panel.js` — export `initStep1Panel(container)`: render Dutch HTML with sections "Stap 1 — Scenario" (floor stepper with − / + buttons and floor count display), outputs grid (4 metric cards: CO2 Materiaal `kg CO₂/m²`, Verdiepingen, Kern variant, Liften), structural summary block below grid showing `foundation_type` (Dutch string) and `stability_system` (Dutch string) from `impact.structural` (FR-008), tolerance disclaimer `'±5–10 kg CO₂/m² (indicatieve data)'`, threshold alerts div; wire `btn-minus` and `btn-plus` click handlers calling `setState({ floors: ... })` with clamp 2–71; export `updateOutputs(state, impact)`: update floor display, CO2 metric card value, kern variant card (`Variant A — 6×10m — 60m²` etc.), elevator count card, foundation type label, stability system label, disclaimer always visible; metric cards show `'—'` when value is null
- [x] T016 [US1] Complete `js/main.js` for US1 — import `Tower` from `./viewer/tower.js`; import `initCo2MaterialChart`, `updateMarker` from `./charts/co2MaterialChart.js`; import `initStep1Panel`, `updateOutputs` from `./ui/step1Panel.js`; initialise `Tower(scene)`, `initCo2MaterialChart(document.getElementById('co2-chart'))`, `initStep1Panel(document.getElementById('panel'))`; call `subscribe((state) => { const impact = getImpact(625, state.floors * 3.5, state.bouwmethodiek, state.installatie, {}); tower.update(state.floors, impact); updateOutputs(state, impact); updateMarker(state.floors); })`

**Checkpoint**: US1 is fully functional. Open platform, click + / − to change floors, verify all three output areas update within 200ms. Verify tolerance disclaimer is visible.

---

## Phase 4: User Story 2 — Compare construction methodologies (Priority: P2)

**Goal**: User selects different bouwmethodiek options and sees CO2 metric update; chart always shows all 3 principal lines simultaneously.

**Independent Test**: Select "Best practice bio-based" at floor 20 — verify CO2 metric is lower than with "Business as usual" at same floor. Select each of the 4 options in turn — verify the chart's 3 lines remain unchanged and only the metric panel updates.

- [x] T017 [US2] Extend `js/ui/step1Panel.js` — add Dutch bouwmethodiek radio button group below floor stepper with heading `'Bouwmethodiek'`: options `Business as usual`, `Hoogwaardig hybride`, `Best practice bio-based`, `Max innovatief`; default checked = `business_as_usual`; each radio `onChange` calls `setState({ bouwmethodiek: value })`; update `updateOutputs` to highlight the active bouwmethodiek option label
- [x] T018 [US2] Wire bouwmethodiek in `js/main.js` — ensure the existing `subscribe` callback passes `state.bouwmethodiek` to `getImpact()` and calls `updateOutputs(state, impact)`; if not already present from T016, add the bouwmethodiek pass-through; add Dutch section heading `'Bouwmethodiek'` to panel HTML if missing from T017

**Checkpoint**: US2 fully functional. All 4 bouwmethodiek options selectable. CO2 metric updates on selection. Chart 3 lines always visible. SC-005 testable (colleague identifies lowest CO2 method from chart).

---

## Phase 5: User Story 3 — Structural threshold consequences (Priority: P3)

**Goal**: User crossing a threshold floor count (e.g. 9th floor) sees an advisory callout naming what changed and the 3D model shows the structural change visually.

**Independent Test**: Start at 8 floors, click + to 9 — verify advisory callout appears within 500ms naming the elevator threshold in Dutch, remains visible for 3s, and the 3D model shows a new elevator shaft. Then click − back to 8 — verify callout fires again describing removal.

- [x] T019 [US3] Extend `js/ui/step1Panel.js` — implement advisory callout: in `updateOutputs`, read `impact.thresholds_crossed`; if non-empty, for each event create a `<div class="threshold-alert">` with Dutch text from `event.label`, append to `#threshold-alerts` div; set a `setTimeout(3000)` to remove each callout; if `thresholds_crossed` is empty, do not clear any existing callouts (they self-dismiss); ensure rapid floor changes do not queue stacked callouts — clear pending timeouts on new threshold event from the same field
- [x] T020 [P] [US3] Extend `js/viewer/tower.js` — in `update(floors, impact)`: detect core variant change (`impact.structural.core_variant !== this._coreVariant`) and immediately apply new core scale from `CORE_SIZES` (this is already done in T011 but the update must occur on every call where variant differs, not just at first render); ensure elevator visibility changes are applied per `impact.structural.elevator_count` — show exactly N elevator meshes where N = elevator_count, always synchronised to the impact result; scale each visible elevator mesh height to `floors * 0.5` and position `y = floors * 0.25`; store `this._coreVariant` and `this._elevatorCount` to avoid unnecessary re-renders when nothing changed

**Checkpoint**: US3 fully functional. Advisory callouts fire within 500ms of threshold crossing. 3D model shows elevator shaft change. Callouts auto-dismiss after 3s.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution compliance, test coverage, language audit, and Step 2 groundwork.

- [x] T021 Write `tests/abstractionBoundary.js` — read all JS files in `js/` recursively (excluding `js/getImpact.js`); assert none contain an import path matching `from '*/data/'` or `from '../data/'` or `fetch(` (direct data file access); print each file checked and its result; exit 0/1 (Gate 4 — can only run after all UI files exist; checks import paths rather than internal identifiers for robustness)
- [x] T022 [P] Verify FR-013 tolerance disclaimer in `js/ui/step1Panel.js` — confirm the text `'±5–10 kg CO₂/m² (indicatieve data)'` is always visible in the output panel regardless of selected bouwmethodiek or floor count; add a second disclaimer line for the overall output panel if missing
- [x] T023 [P] Add FR-016 label to `index.html` — inside `#three-container`, add `<div class="viewer-label">Parametric preview — not a design environment</div>` positioned absolutely at bottom-center; ensure it is always visible and does not interfere with OrbitControls mouse events (`pointer-events: none`)
- [x] T024 [P] Dutch language audit — review all visible text in `step1Panel.js`, `index.html` header, chart axis labels in `co2MaterialChart.js`; verify FR-017: all domain-facing labels in Dutch, only tolerance disclaimer and viewer label in English; fix any English labels found
- [x] T025 [P] Create `js/viewer/shaders/facade.glsl` — vertex shader: pass `vUv` varying; fragment shader: accept `uniform float glazing_ratio`; render pixel as glass colour (rgba(180,210,240,0.7)) if `vUv.y` within a glazing band pattern based on `glazing_ratio`, otherwise wall colour (#C8B49A); this shader is Step 2 groundwork — not yet wired to any UI control but must be syntactically valid GLSL
- [x] T026 Run `specs/001-co2-material-module/quickstart.md` validation — also verify SC-001 (≤200ms) and SC-003 (≤500ms callout) using browser DevTools Performance tab; verify on Chrome, Firefox, and Edge (SC-004); document any browser-specific differences — follow all 4 "Try it" steps manually; verify each behaviour matches the spec acceptance scenarios; document any discrepancies as issues in this tasks.md Notes section below

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T002, T003, T004, T005 are parallel.
- **Foundational (Phase 2)**: Depends on Setup. T006, T007, T008 parallel first; then T009, T010, T011 parallel after T007; T012 after T006+T007+T008.
- **US1 (Phase 3)**: Depends on Foundational complete. T013, T014, T015 are parallel. T016 waits for T013+T014+T015.
- **US2 (Phase 4)**: Depends on US1 complete. T017 then T018 sequential.
- **US3 (Phase 5)**: Depends on US2 complete. T019 and T020 are parallel (different files).
- **Polish (Phase 6)**: Depends on US3 complete. T021–T025 all parallel. T026 sequential last.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (extends step1Panel.js; needs floor stepper already working)
- **US3 (P3)**: Depends on US2 (extends step1Panel.js and tower.js; needs bouwmethodiek working)

### Within Each Phase — Parallel Opportunities

```
Phase 1 parallel batch:
  T002 package.json
  T003 data/thresholds.json + data/co2Material.json
  T004 index.html
  T005 css/main.css

Phase 2 sub-batch A (parallel):
  T006 js/store.js
  T007 js/getImpact.js       ← depends on T003 (data files)
  T008 js/viewer/scene.js
Phase 2 sub-batch B (parallel, after T007):
  T009 tests/thresholdIntegrity.js
  T010 tests/dataVersion.js
  T011 tests/getImpactSnapshot.js
  → T012 js/main.js skeleton  ← after T006+T007+T008

Phase 3 parallel batch:
  T013 js/viewer/tower.js
  T014 js/charts/co2MaterialChart.js
  T015 js/ui/step1Panel.js
  → T016 js/main.js complete  ← after T013+T014+T015

Phase 6 parallel batch:
  T021 tests/abstractionBoundary.js
  T022 tolerance disclaimer check
  T023 viewer label
  T024 Dutch language audit
  T025 facade.glsl
  → T026 quickstart + browser validation  ← after all T021–T025
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) — Tasks T001–T016

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational — T006–T008 parallel, then T009–T011 parallel, then T012
3. Complete Phase 3: US1 — T013–T015 in parallel, then T016
4. **STOP and VALIDATE**: Open `index.html` via Live Server. Click + / − and verify floor count, CO2 metric, 3D model, and chart marker all update within 200ms. Run all 3 test scripts (node tests/*.js).
5. Demo to team if ready.

### Incremental Delivery

1. MVP (T001–T016) → demo with floor count + CO2 + 3D + chart
2. Add US2 (T017–T018) → bouwmethodiek comparison
3. Add US3 (T019–T020) → threshold callouts, structural visual changes
4. Polish (T021–T026) → compliance, audit, browser verification, Step 2 groundwork

---

## Notes

- Assumed threshold floor counts (~16 for 2nd elevator, ~38 for 4th) are used in `getImpact.js` (T005). These MUST be updated after team verification. Bump `DATA_VERSION` when values change.
- `facade.glsl` (T023) is created but not yet wired — it is groundwork for the Energie/Step 2 module.
- `co2_energy_kwh_m2` and `energy_neutrality_pct` are null in all ImpactResults in this module. The output panel shows `'—'` (Dutch dash) for these values.
