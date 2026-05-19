# Tasks: Material Module — Floor Input, Consequence Panel & Section View

**Input**: Design documents from `/specs/003-section-view-piles/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: No new test files. Existing 5 tests must pass throughout. Manual validation via quickstart.md.

**Organization**: Strictly additive — no existing file is deleted or restructured. US1 and US2 both touch `step1Panel.js` so they run sequentially. US3 is independent and can run in parallel with US1+US2 across different files.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies in same phase)
- **[Story]**: US1 / US2 / US3
- All file paths relative to `3d_platform/`

---

## Phase 1: Setup

**Purpose**: Verify baseline before touching any file.

- [ ] T001 Run all 5 existing tests — `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js` — all must pass before any implementation begins

---

## Phase 2: User Story 1 — Direct floor number input (Priority: P1) 🎯 MVP

**Goal**: User can type a floor count directly into the stepper display, not only click + / −.

**Independent Test**: Open platform, click floor display, type "38", press Enter — all outputs update to 38 floors. Type "0" — value clamps to 2. Type "abc" — previous value restored.

- [ ] T002 [US1] Replace `<div class="floor-value" id="floor-display">10</div>` with `<input type="number" id="floor-display" min="2" max="71" value="10">` in `initStep1Panel` HTML in `js/ui/step1Panel.js`; add `change` event listener on `#floor-display` that parses the typed value, clamps it to [2, 71] via `Math.max(2, Math.min(71, Math.round(parseInt(e.target.value) || prev)))`, calls `setState({ floors: clamped })`, and sets `e.target.value = clamped` to correct partial input; the existing `btn-minus` and `btn-plus` listeners remain unchanged; in `updateOutputs`, update `document.getElementById('floor-display').value = state.floors` instead of `.textContent`

**Checkpoint**: US1 complete and independently testable. + / − buttons and typed input both work.

---

## Phase 3: User Story 2 — Consequence panel with threshold flash (Priority: P2)

**Goal**: Persistent Dutch consequence text always visible below metric cards; flashes amber when any threshold is crossed.

**Independent Test**: At 8 floors, panel shows "Geen lift vereist". Go to 9 floors — text changes and panel flashes amber for ~1.5s. Go to 10 floors — text updates, no flash. Go back to 8 — flash again.

- [ ] T003 [US2] Extend `js/ui/step1Panel.js` — in `initStep1Panel` HTML, add after `#out-structural` div and before `.tolerance-disclaimer`:
  ```html
  <div id="consequence-panel" class="consequence-panel">
    <div class="consequence-label">Constructieve consequentie</div>
    <div id="consequence-text" class="consequence-text">—</div>
  </div>
  ```
  In `updateOutputs(state, impact)`, add consequence text logic: define `elevMap = { 0:'Geen lift vereist', 1:'1 lift vereist', 2:'2 liften vereist', 3:'3 liften vereist', 4:'4 liften vereist', 5:'5 liften vereist — maximale hoogte' }`; build text as `` `${elevMap[impact.structural.elevator_count] ?? '—'} · ${impact.structural.foundation_type ?? '—'} · ${impact.structural.stability_system ?? '—'}` ``; set `document.getElementById('consequence-text').textContent`; if `impact.thresholds_crossed.length > 0`, get `#consequence-panel` element, remove class `consequence-flash`, force reflow via `void panel.offsetWidth`, add class `consequence-flash`, `setTimeout(() => panel.classList.remove('consequence-flash'), 1500)`

- [ ] T004 [P] [US2] Add to `css/main.css`: `.consequence-panel { margin-top:10px; padding:8px 10px; background:rgba(45,95,138,0.05); border-radius:6px; font-size:11px; border-left:3px solid var(--blue-mid); }` · `.consequence-label { font-weight:600; color:var(--blue-mid); font-size:10px; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px; }` · `.consequence-text { color:var(--blue-text); line-height:1.4; }` · `@keyframes consequenceFlash { 0% { background:rgba(184,92,0,0.18); border-left-color:#B85C00; } 60% { background:rgba(184,92,0,0.10); border-left-color:#B85C00; } 100% { background:rgba(45,95,138,0.05); border-left-color:var(--blue-mid); } }` · `.consequence-flash { animation:consequenceFlash 1.5s ease-out forwards; }`

**Checkpoint**: US2 complete. Consequence panel visible at all times, flashes correctly on threshold crossings in both directions.

---

## Phase 4: User Story 3 — Section view with pile depth (Priority: P3)

**Goal**: Three-button view toggle switches between 3D perspective and two orthographic section views; pile depth annotation visible in section modes.

**Independent Test**: Click "Front sectie" — flat orthographic view, piles visible below grade, "Paaldiepte: ~Xm" annotation, near-white background. Click "Links sectie" — 90° rotation, same elements. Click "3D" — orbital view returns. Change to 28 floors in section — depth updates. 71 floors in 3D — 5 elevators visible.

### Sub-batch A (run in parallel — all different files)

- [ ] T005 [P] [US3] Extend `js/viewer/tower.js` — fix `_buildElevators()`: change `xPositions` from 4 entries to 5: `[-0.6, -0.3, 0, 0.3, 0.6]`; change `for (let i = 0; i < 4; i++)` to `for (let i = 0; i < 5; i++)`; update `this._elevatorMeshes` to hold 5 meshes; add export `export function getPileDepthM(floors) { return Math.round(Math.max(0.8, floors * 0.12) * 7); }`; in `tower.update()`, after `_updatePiles(floors)`, add call to `updateOrthoCamera(towerH, Math.max(0.8, floors * 0.12))` (import this from `./scene.js`)

- [ ] T006 [P] [US3] Extend `js/viewer/scene.js` — add module-level refs: `let _orthoCamera, _activeCamera, _ground, _grid, _midY = 4`; in `initScene()`, after creating `_camera` (rename to `_perspCamera`), create `_orthoCamera = new THREE.OrthographicCamera(-7, 7, 10, -5, 0.1, 200)` (initial frustum — updated dynamically); set `_activeCamera = _perspCamera`; store refs to ground mesh (`_ground`) and grid (`_grid`); change render loop from `_renderer.render(scene, _camera)` to `_renderer.render(scene, _activeCamera)`; update ResizeObserver to also call `_orthoCamera.updateProjectionMatrix()` after resize; add `export function setViewMode(mode)`: if `'perspective'` → `_activeCamera = _perspCamera`, `_controls.enabled = true`, `scene.background.set(0xB8D4E8)`, `_ground.visible = true`, `_grid.visible = true`; if `'front_sectie'` → `_activeCamera = _orthoCamera`, `_controls.enabled = false`, `_orthoCamera.position.set(0, _midY, 30)`, `_orthoCamera.lookAt(0, _midY, 0)`, `scene.background.set(0xF5F5F5)`, `_ground.visible = false`, `_grid.visible = false`; if `'links_sectie'` → same but `_orthoCamera.position.set(30, _midY, 0)`, `_orthoCamera.lookAt(0, _midY, 0)`; call `_orthoCamera.updateProjectionMatrix()`; add `export function updateOrthoCamera(towerH, pileDepthScene)`: update `_midY = (towerH - pileDepthScene) / 2`; set `_orthoCamera.top = towerH + 2`, `_orthoCamera.bottom = -(pileDepthScene + 1.5)`, `_orthoCamera.left = -7`, `_orthoCamera.right = 7`; call `_orthoCamera.updateProjectionMatrix()`; if current view is not perspective, also update `_orthoCamera.position.y = _midY` and call `_orthoCamera.lookAt(0, _midY, 0)`

- [ ] T007 [P] [US3] Extend `index.html` — in `#viewer-section`, add view toggle overlay directly before the `#three-container` div: `<div class="view-toggle" id="view-toggle"><button class="view-btn active" data-mode="perspective">3D</button><button class="view-btn" data-mode="front_sectie">Front sectie</button><button class="view-btn" data-mode="links_sectie">Links sectie</button></div>`; add pile depth annotation div inside `#viewer-section` after `#three-container`: `<div id="pile-depth-label" class="pile-depth-label" style="display:none">Paaldiepte: ~—m</div>`

- [ ] T008 [P] [US3] Add to `css/main.css`: `#viewer-section { position:relative; }` (ensure it is set); `.view-toggle { position:absolute; top:8px; right:8px; z-index:10; display:flex; gap:4px; }` · `.view-btn { padding:4px 10px; font-size:11px; font-weight:500; border:1px solid var(--border); border-radius:5px; background:rgba(255,255,255,0.85); color:var(--blue-text); cursor:pointer; transition:background 0.15s, color 0.15s; }` · `.view-btn:hover { background:rgba(45,95,138,0.08); }` · `.view-btn.active { background:var(--blue-dark); color:white; border-color:var(--blue-dark); }` · `.pile-depth-label { position:absolute; bottom:32px; left:12px; z-index:10; font-size:11px; font-weight:600; color:var(--blue-text); background:rgba(255,255,255,0.85); padding:3px 8px; border-radius:4px; border:1px solid var(--border); pointer-events:none; }`

### Sub-batch B (after T005–T008)

- [ ] T009 [US3] Extend `js/main.js` — add `import { setViewMode, updateOrthoCamera } from './viewer/scene.js'` (updateOrthoCamera already called from tower.js; setViewMode needed here); add `import { getPileDepthM } from './viewer/tower.js'`; after `initStep2Panel(panel)`, wire view toggle: `document.querySelectorAll('.view-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); const mode = btn.dataset.mode; setViewMode(mode); const label = document.getElementById('pile-depth-label'); label.style.display = mode === 'perspective' ? 'none' : 'block'; }); })`; in the `subscribe` callback, after `tower.update(state.floors, impact)`, add: `document.getElementById('pile-depth-label').textContent = \`Paaldiepte: ~\${getPileDepthM(state.floors)}m\``

**Checkpoint**: US3 complete. All three views switch correctly. Pile depth label updates with floor count. 5th elevator visible at floor 71. Existing 3D orbital controls fully functional.

---

## Phase 5: Polish

- [ ] T010 Run all 5 tests to confirm no regression — `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js`; then open platform via Live Server and manually validate all three quickstart.md scenarios; confirm CO2 chart, energy chart, all metric cards, and all Step 2 controls still function correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately.
- **Phase 2 (US1)**: Depends on Phase 1 passing. T002 sequential (step1Panel.js).
- **Phase 3 (US2)**: Depends on Phase 2 (US1) complete — T003 and T004 extend the same file (step1Panel.js) that T002 changed. T003 sequential after T002. T004 [P] can run alongside T003 (different file: main.css).
- **Phase 4 (US3)**: Independent of US1 and US2 at the file level. T005–T008 can all run in parallel (different files). T009 must follow T005–T008.
- **Phase 5 (Polish)**: Depends on all phases complete.

### User Story Dependencies

- **US1 (P1)**: No dependencies — start immediately after setup.
- **US2 (P2)**: Depends on US1 (both touch step1Panel.js — must be sequential on that file). T004 (css only) can run in parallel with T003.
- **US3 (P3)**: Independent of US1 and US2. Can start in parallel with US1/US2 since it touches viewer/ files primarily.

### Parallel Opportunities

```
Phase 1:
  T001 (baseline check)

Phase 2 (US1):
  T002 (step1Panel.js)

Phase 3 (US2) — after T002:
  T003 (step1Panel.js)    ← sequential after T002
  T004 [P] (main.css)     ← can run alongside T003

Phase 4 (US3) — can overlap with Phase 2+3:
  Sub-batch A (all parallel):
    T005 [P] (tower.js)
    T006 [P] (scene.js)
    T007 [P] (index.html)
    T008 [P] (main.css)
  Sub-batch B (after A):
    T009 (main.js)

Phase 5:
  T010 (validation)
```

---

## Implementation Strategy

### MVP First — US1 only (Tasks T001–T002)

1. T001 — verify tests pass
2. T002 — floor input
3. **STOP and validate**: Type floor numbers directly, check clamping and coexistence with buttons

### Incremental Delivery

1. T001–T002 → US1 complete → demo floor input
2. T003–T004 → US2 complete → demo consequence panel + flash
3. T005–T009 → US3 complete → demo section views
4. T010 → full regression check

---

## Notes

- T002 and T003 both edit `step1Panel.js` — they MUST be sequential, not parallel.
- T005 imports `updateOrthoCamera` from `scene.js` — T006 must export it before T005 references it (or write T005 first and test after T006 is done).
- T008 and T004 both edit `main.css` — if worked simultaneously, merge carefully. In sequential execution, T004 runs before T008 (US2 before US3).
- The abstraction boundary test (`tests/abstractionBoundary.js`) automatically covers new files if any are added — the current 8-file list is explicit, so no update needed unless new JS files in `js/` import from `data/`.
