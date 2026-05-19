# Implementation Plan: Material Module — Floor Input, Consequence Panel & Section View

**Branch**: `003-section-view-piles` | **Date**: 2026-05-19 | **Spec**: [spec.md](spec.md)

## Summary

Three additive enhancements to the CO2 Material module (001), each independently deployable:
1. Floor number input field — replaces div with editable input, `change` event clamped to 2–71
2. Persistent consequence panel — always-visible Dutch text describing current structural state, with 1.5s amber flash on threshold crossings
3. Section view toggle — three-button overlay switching between 3D perspective and two orthographic section views, showing pile depth with metre annotation

No new data files. No store.js changes. No Energie module files touched.

## Technical Context

**Language/Version**: JavaScript ES2022+ (ES Modules, native browser)
**Primary Dependencies**: Three.js r163 (CDN importmap), Chart.js 4.4.x (CDN UMD), OrbitControls (Three.js addons CDN)
**Storage**: N/A
**Testing**: Plain Node.js assertion scripts (no framework), `package.json` `"type":"module"`
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Edge)
**Project Type**: Static web application, no build system, CDN-only dependencies
**Performance Goals**: <200ms UI updates; 3D viewer <15k triangles; 60fps render loop
**Constraints**: No backend, no build step, single HTML entry point, all state in store.js
**Scale/Scope**: Single-page tool, single user session

## Constitution Check

| Gate | Check | Result |
|---|---|---|
| 1 | Work within current phase scope (Layer 1 Material enhancements)? | ✅ PASS |
| 2 | Structural values derived from threshold table indexed by height/GFA? | ✅ PASS — consequence panel reads ImpactResult.structural, no new logic |
| 3 | All threshold entries have non-empty `threshold_reached`? | ✅ PASS — 5 tests passing |
| 4 | All data access through `getImpact()` with pinned return type? | ✅ PASS — no new data imports |
| 5 | Data files versioned (semver field, git-tracked)? | ✅ PASS |
| 6 | Mandatory tests exist and pass? | ✅ PASS — 5 tests all green |
| 7 | UI renders advisory callouts for `thresholds_crossed`? | ✅ PASS — existing alerts + new consequence panel |
| 8 | Tolerance disclaimer on all CO2/energy output values? | ✅ PASS — existing disclaimers untouched |
| 9 | Deliverable independently deployable? | ✅ PASS — each US ships independently |

**No violations. No complexity justification required.**

**One pre-existing bug fixed by this feature**: `tower.js` only builds 4 elevator meshes (indices 0–3) but the threshold table now has 5 elevators (floors ≥ 71). The 5th elevator is never shown. This plan adds the 5th mesh.

## Project Structure

### Documentation (this feature)

```text
specs/003-section-view-piles/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← entities
├── quickstart.md        ← test scenarios
├── contracts/
│   ├── setViewMode.md
│   └── consequencePanel.md
└── tasks.md             ← /speckit.tasks output (not yet created)
```

### Source Code (files touched by this feature)

```text
js/
├── ui/
│   └── step1Panel.js       ← floor input (US1) + consequence panel (US2)
├── viewer/
│   ├── scene.js            ← add OrthographicCamera, setViewMode(), updateOrthoCamera()
│   └── tower.js            ← add 5th elevator mesh, expose getPileDepthM()
├── main.js                 ← wire view toggle buttons to setViewMode()
css/
└── main.css                ← consequence panel styles, flash keyframe, view toggle button styles
index.html                  ← view toggle button group in #viewer-section, pile depth annotation div
tests/
└── (existing 5 tests — must still pass; no new test required for UI-only changes)
```

## Scale of Change per File

| File | Change type | Key additions |
|---|---|---|
| `js/ui/step1Panel.js` | Extend | `<input type="number">` replacing div; consequence panel div; flash logic |
| `js/viewer/scene.js` | Extend | `_orthoCamera`, `_activeCamera`, `setViewMode(mode)`, `updateOrthoCamera(towerH, pileD)` |
| `js/viewer/tower.js` | Extend | 5th elevator mesh; `getPileDepthM(floors)` export |
| `js/main.js` | Extend | Import `setViewMode`; wire view toggle button events |
| `css/main.css` | Extend | `.consequence-panel`, `.consequence-flash` keyframe, `.view-toggle` button styles |
| `index.html` | Extend | View toggle button group overlay; `#pile-depth-label` div |

## Key Technical Decisions (from research.md)

### US1 — Floor input
- Replace `<div class="floor-value" id="floor-display">` with `<input type="number" id="floor-display" min="2" max="71">`
- Use `change` event (fires on Enter / blur) — NOT `input` event — to avoid state updates on partial numbers mid-type
- On change: parse → clamp to [2, 71] → round → `setState({ floors: value })`; also set `input.value` to the clamped value so the display corrects itself
- Style the input to visually match the existing floor stepper (same font size, colour, no border)

### US2 — Consequence panel
- A permanently visible `<div id="consequence-panel">` placed in step1Panel.js, below the structural-info block
- Text content built in `updateOutputs(state, impact)` from `impact.structural`:
  - elevator_count → Dutch phrase ("Geen lift vereist" / "1 lift vereist" / etc.)
  - foundation_type → pass-through from impact.structural.foundation_type
  - stability_system → pass-through from impact.structural.stability_system
- Flash trigger: if `impact.thresholds_crossed.length > 0`, add CSS class `consequence-flash` to the panel, then remove it after 1500ms using `setTimeout`
- Flash colour: `#B85C00` (existing amber, already in CSS design system)
- No new data reads; no new store fields

### US3 — Section view
**Two-camera approach:**
- `_perspCamera` = existing PerspectiveCamera (unchanged)
- `_orthoCamera` = new OrthographicCamera, created at init time alongside `_perspCamera`
- `_activeCamera` variable, starts as `_perspCamera`
- Render loop: `_renderer.render(scene, _activeCamera)` (change from hard-coded `_camera`)
- OrbitControls attached to `_perspCamera` only. In ortho modes, controls are disabled

**Camera positions (scene coordinates):**
- Front sectie: camera at `(0, midY, 30)`, looking at `(0, midY, 0)`. Shows XY plane. "Front" = positive Z direction.
- Links sectie: camera at `(30, midY, 0)`, looking at `(0, midY, 0)`. Shows ZY plane. "Left" = positive X direction.
- `midY` is dynamic: `(towerH - pileDepth) / 2` — centres the view on the full vertical extent including piles

**Ortho frustum — updated dynamically via `updateOrthoCamera(towerH, pileD)`:**
```
half_w = 7                         // fixed horizontal — covers 5-wide building + margin
top    = towerH + 2                // 2 scene units above roof
bottom = -(pileD + 1.5)            // below pile tips
left   = -half_w
right  = +half_w
```
The ResizeObserver in scene.js must also recompute `aspect` scaling for the ortho camera on resize.

**Pile depth in metres — formula:**
```javascript
export function getPileDepthM(floors) {
  const sceneUnits = Math.max(0.8, floors * 0.12);
  return Math.round(sceneUnits * 7);  // 1 scene unit = 7m (0.5 scene units = 3.5m/floor)
}
```
Values: floors=8 → ~7m, floors=9 → ~8m, floors=28 → ~24m, floors=71 → ~60m

**Pile depth annotation:**
- A `<div id="pile-depth-label">` absolutely positioned in `#viewer-section`, bottom-left
- Text: `"Paaldiepte: ~${pileDepthM}m"`, updated from `updateEnergyChart` or a new `updateViewer` call in `main.js` subscribe callback
- Only visible when view mode is front or left sectie; hidden in 3D mode

**View toggle buttons:**
- A `<div class="view-toggle">` absolutely positioned top-right of `#viewer-section`
- Three `<button>` elements: "3D" / "Front sectie" / "Links sectie"
- Active button has `.active` class (same pattern as existing .s2-btn in step2Panel)
- Click → calls `setViewMode(mode)` → switches camera → shows/hides pile-depth-label

**Ground plane + grid visibility in section mode:**
- Ground plane and grid: set `visible = false` in section modes, `visible = true` in 3D
- This gives a cleaner section diagram without the distracting green ground

**Scene background in section mode:**
- Section background: white or light grey (`0xF5F5F5`) instead of blue-light. Makes pile depth annotation legible.
- 3D mode: restore original blue-light background (`0xB8D4E8`)

## Complexity Tracking

No constitution violations. No complexity justification needed.
