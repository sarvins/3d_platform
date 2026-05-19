# Contract: setViewMode

**File**: `js/viewer/scene.js`
**Type**: Exported function

## Signature

```javascript
export function setViewMode(mode: 'perspective' | 'front_sectie' | 'links_sectie'): void
```

## Behaviour

- Switches `_activeCamera` between `_perspCamera` (PerspectiveCamera) and `_orthoCamera` (OrthographicCamera)
- Enables OrbitControls (`_controls.enabled = true`) when mode is `'perspective'`
- Disables OrbitControls (`_controls.enabled = false`) when mode is `'front_sectie'` or `'links_sectie'`
- Positions and orients `_orthoCamera` based on mode:
  - `'front_sectie'`: camera at `(0, midY, 30)`, looking at `(0, midY, 0)`
  - `'links_sectie'`: camera at `(30, midY, 0)`, looking at `(0, midY, 0)`
  - `midY` is the last known vertical midpoint `(towerH - pileD) / 2`
- Sets scene background colour: `0xB8D4E8` for perspective, `0xF5F5F5` for section modes
- Sets ground plane and grid visibility: `true` for perspective, `false` for section modes

## Contract: updateOrthoCamera

```javascript
export function updateOrthoCamera(towerH: number, pileDepth: number): void
```

- Called from `tower.update()` on every floor count change
- Updates `_orthoCamera` frustum: top = towerH + 2, bottom = -(pileDepth + 1.5), left = -7, right = 7
- Updates `midY` used by `setViewMode` for camera positioning
- Calls `_orthoCamera.updateProjectionMatrix()`

## Invariants

- `_activeCamera` is always one of `_perspCamera` or `_orthoCamera` — never null
- OrbitControls are always disabled when `_activeCamera === _orthoCamera`
- The render loop always calls `_renderer.render(scene, _activeCamera)` — never a hard-coded camera reference

## Called by

- `js/main.js` — on view toggle button click
- `js/viewer/tower.js` — `updateOrthoCamera()` called inside `tower.update()` on every floor change
