# Research: Material Module — Floor Input, Consequence Panel & Section View

## Decision 1 — Floor input: `change` event vs `input` event

**Decision**: Use the `change` event (fires on Enter or loss of focus), not the `input` event (fires on every keystroke).

**Rationale**: The store triggers all subscribers on every `setState` call. Using `input` would fire a full 3D redraw and chart update for every character typed (e.g. typing "71" fires for "7" then "71"). The `change` event fires once on confirmation, matching the existing stepper behaviour exactly.

**Alternatives considered**: `input` event with debounce — rejected because debouncing adds complexity and a delay that the `change` event handles naturally.

---

## Decision 2 — Floor input: `<input type="number">` vs `contenteditable` div

**Decision**: Replace `<div class="floor-value">` with `<input type="number" min="2" max="71">`. Style it to match the existing floor stepper (same font, no visible border, centred).

**Rationale**: `<input type="number">` gives browser-native keyboard handling (arrow keys, Enter, numeric keyboard on mobile) with zero custom code. `contenteditable` requires manual cursor management and paste handling.

**Alternatives considered**: `contenteditable` — rejected due to implementation complexity and inconsistent browser behaviour.

---

## Decision 3 — Section view: two cameras vs camera type swap

**Decision**: Maintain two camera instances — `_perspCamera` (existing PerspectiveCamera) and `_orthoCamera` (new OrthographicCamera). Swap `_activeCamera` between them. Render loop uses `_activeCamera`.

**Rationale**: Three.js does not support changing a camera's type at runtime. Two camera instances is the standard pattern. The perspective camera and its OrbitControls are preserved untouched in 3D mode.

**Alternatives considered**: Single camera with manual projection matrix — rejected because it requires manual frustum math that `OrthographicCamera` handles automatically.

---

## Decision 4 — Orthographic frustum: dynamic vs static

**Decision**: Dynamic frustum, updated via `updateOrthoCamera(towerH, pileDepth)` called from `tower.update()`. Horizontal half-width fixed at 7 scene units (covers building + margin for all floor counts). Vertical: top = towerH + 2, bottom = -(pileDepth + 1.5).

**Rationale**: A static frustum large enough for 71 floors shows excessive empty space at 2 floors. Dynamic frustum keeps the building filling the view and makes pile depth differences visible at low floor counts.

**Alternatives considered**: Static frustum sized for max height — rejected because pile depth at 2 floors (~7m) would be invisible against a 250m building-height scale.

---

## Decision 5 — Pile depth annotation: Three.js sprite vs CSS div

**Decision**: CSS `<div id="pile-depth-label">` absolutely positioned in `#viewer-section`, bottom-left. Updated via JavaScript from the subscribe callback in `main.js`.

**Rationale**: A CSS div is simpler, always crisp at any resolution, and doesn't require Three.js text geometry or a texture atlas. The annotation is a fixed overlay, not a world-space label, so screen-space positioning is correct.

**Alternatives considered**: Three.js `Sprite` with canvas texture — rejected due to blurring at non-native resolution and implementation complexity. Three.js CSS2DRenderer — rejected as a new dependency.

---

## Decision 6 — Consequence panel flash: CSS animation vs JS colour interpolation

**Decision**: CSS `@keyframes` animation on a `.consequence-flash` class. JavaScript adds the class, removes it after 1500ms via `setTimeout`. The animation transitions background-color from amber to transparent.

**Rationale**: CSS animations are GPU-accelerated and require no frame-by-frame JavaScript. The `setTimeout` removal pattern is standard and reliable. Matches the existing `threshold-alert` animation pattern already in `main.css`.

**Alternatives considered**: JS-driven colour interpolation with `requestAnimationFrame` — rejected as unnecessary complexity when CSS handles it cleanly.

---

## Decision 7 — Ground plane and grid in section mode

**Decision**: Set `ground.visible = false` and `grid.visible = false` in section modes. Scene background changes to near-white (`0xF5F5F5`). Restored in 3D mode.

**Rationale**: A section view is a technical diagram. The decorative ground plane and grid create visual noise that obscures the pile depth geometry. Near-white background makes the dark pile cylinders and depth annotation legible.

**Alternatives considered**: Keep ground plane — rejected because it intersects the pile annotation area and obscures pile tips.

---

## Decision 8 — Fifth elevator mesh

**Decision**: Extend `_buildElevators()` in tower.js from 4 to 5 meshes. Adjust X positions to distribute 5 evenly: `[-0.6, -0.3, 0, 0.3, 0.6]`. Update `_elevatorMeshes.forEach` loop bound from `i < elevCount` (already dynamic via the loop — no change needed there).

**Rationale**: The threshold table has 5 elevator thresholds (floors 9, 16, 28, 38, 71) but tower.js only builds 4 meshes. At 71 floors the 5th elevator is never rendered. This is a pre-existing bug in the Material module that this feature corrects.

**Alternatives considered**: None — the fix is straightforward.

---

## Confirmed Pile Depth Values (metres)

Derived from `tower.js` formula `depth = max(0.8, floors × 0.12)` and scale factor 7 (1 scene unit = 7m):

| Floors | Scene depth | Approx. metres |
|--------|------------|----------------|
| 2      | 0.80       | ~6m            |
| 8      | 0.96       | ~7m            |
| 9      | 1.08       | ~8m            |
| 16     | 1.92       | ~13m           |
| 28     | 3.36       | ~24m           |
| 38     | 4.56       | ~32m           |
| 71     | 8.52       | ~60m           |

These values are indicative (Layer 1). Structural verification required before advisory use.
