# Research: CO2 Material Module

**Branch**: `001-co2-material-module` | **Date**: 2026-05-02

All decisions below are derived from the constitution, spec, and clarifications. No external research was required — the stack is fully pre-determined. This file documents rationale and alternatives considered.

---

## Decision 1 — Three.js delivery via importmap

**Decision**: Three.js r163 loaded via ES module importmap in `index.html`. OrbitControls loaded from the same CDN via `three/addons/` path alias.

**Rationale**: Importmap is the native browser mechanism for ES module aliasing — no bundler required. r163 is a stable release with InstancedMesh, ShaderMaterial, and OrbitControls fully supported. The `three/addons/` alias pattern is the official Three.js recommendation for CDN use.

**Alternatives considered**:
- Global `<script>` UMD build: rejected — does not support ES module imports across files.
- Local copy of Three.js: rejected — unnecessary for a demo; CDN is sufficient for Layer 1.
- r165+: not chosen — r163 confirmed stable; upgrade can happen as a patch when needed.

---

## Decision 2 — Chart.js delivery and floor marker

**Decision**: Chart.js 4.4.x loaded via CDN UMD `<script>` tag. Floor count marker implemented as a custom `afterDraw` plugin registered inline — no annotation plugin dependency.

**Rationale**: UMD build auto-registers and is available as `window.Chart`. The vertical dashed line marker requires only canvas drawing in `afterDraw` — a standard Chart.js plugin pattern. Adding `chartjs-plugin-annotation` for a single vertical line is an unnecessary dependency.

**Alternatives considered**:
- chartjs-plugin-annotation: rejected — adds a CDN dependency for functionality achievable with 10 lines of canvas code.
- D3.js: rejected — overkill; Chart.js is sufficient for two line charts.

---

## Decision 3 — State management: Central Store + Observer

**Decision**: A single `store.js` module exports `getState()`, `setState(updates)`, and `subscribe(fn)`. Listeners are stored in a `Set`. `setState` calls all listeners synchronously with the new state. No reactive library.

**Rationale**: The parametric state is small (floors + bouwmethodiek, later installatie + step2). Synchronous observer calls are predictable and debuggable. Three.js has its own render loop — a VDOM-based reactive library would conflict with it. A hand-rolled observer with ~20 lines is the simplest solution that cannot break.

**Alternatives considered**:
- Vue via CDN: rejected — VDOM conflicts with Three.js; adds a reactive layer that fights the render loop.
- Alpine.js: rejected — same VDOM conflict risk; adds complexity for no gain.
- Preact: rejected — requires a build step or JSX pragma.

---

## Decision 4 — getImpact() data: inline vs JSON fetch

**Decision**: Lookup data and threshold table are defined as JavaScript objects inline in `getImpact.js`. No `fetch()` call, no JSON file import.

**Rationale**: When opened from `file://` (without a local server), `fetch()` calls fail due to CORS policy. Inlining the data in the JS module avoids this entirely and allows the demo to run by simply opening `index.html` in a browser. Data is still versioned via the `DATA_VERSION` constant in `getImpact.js`.

**Alternatives considered**:
- JSON files fetched on load: rejected for Layer 1 — requires a server; breaks file:// opening.
- JSON static import (`import data from './data.json' assert {type: 'json'}`): rejected — browser support is inconsistent without a bundler.
- Move to JSON files in Layer 2: this is the correct approach when a local server is established.

---

## Decision 5 — Three.js tower rendering approach

**Decision**:
- Floors: `InstancedMesh` of `BoxGeometry(5, 0.38, 5)`, max 80 instances. Update `count` and `setMatrixAt()` per floor change. One draw call regardless of floor count.
- Foundation piles: `CylinderGeometry` meshes in a `Group`; rebuilt at threshold crossings (pile count changes). Depth scales with floor count.
- Core: Single `Mesh` with `BoxGeometry(1,1,1)`, scaled per frame via `mesh.scale.set(w, height, d)`.
- Elevators: 4 pre-created `Mesh` instances; visibility toggled at threshold crossings.
- Glazing: `ShaderMaterial` with `glazing_ratio` uniform; no geometry rebuild on change.

**Rationale**: InstancedMesh reduces floor rendering to one GPU draw call regardless of floor count. Pre-creating elevator meshes and toggling visibility avoids geometry allocation at runtime. ShaderMaterial uniform update is a single GPU call — the cheapest possible update. Total triangle budget: floors (80 × 60 = 4,800) + core (12) + piles (max 25 × 48 = 1,200) + elevators (4 × 12 = 48) ≈ 6,060 triangles — well within the 15k limit.

**Alternatives considered**:
- Separate Mesh per floor: rejected — O(n) draw calls; unacceptable for 50+ floors.
- Geometry rebuild for glazing: rejected — triggers GC and GPU re-upload on every slider tick.

---

## Decision 6 — Testing approach (no framework)

**Decision**: Four plain Node.js scripts in `tests/`. Each file imports only what it needs, runs assertions, prints pass/fail to stdout, and exits with code 0 (pass) or 1 (fail). Run with `node tests/<file>.js`.

**Mandatory test scripts**:

| File | What it verifies | Spec gate |
|---|---|---|
| `thresholdIntegrity.js` | Every threshold entry has a non-empty `threshold_reached` string | Gate 3 |
| `getImpactSnapshot.js` | 10 known input/output pairs; ImpactResult shape frozen | Gate 6 |
| `abstractionBoundary.js` | No file other than `getImpact.js` contains inline data literals | Gate 4 |
| `dataVersion.js` | `DATA_VERSION` constant matches `data_version` in ImpactResult | Gate 5 |

**Rationale**: No test framework means no `npm install`, no `package.json`, no build step. Runs anywhere with Node.js. Passes the "no build system" constitution constraint. Framework can be added in Layer 2 if needed.

**Alternatives considered**:
- Jest: rejected — requires npm + config; violates no-build-system constraint.
- Vitest: rejected — same issue.
- Browser-based test runner: rejected — harder to run in CI or terminal.

---

## Decision 7 — Local development server

**Decision**: VS Code Live Server extension (port 5500) is the primary dev server. `npx serve .` is documented as the fallback for contributors without VS Code.

**Rationale**: Live Server auto-reloads on file save, requires no configuration, and is already part of the VS Code ecosystem the project uses. `npx serve .` requires only Node.js — no install.

**Alternatives considered**:
- Python `http.server`: valid fallback but not documented as primary (Live Server is faster).
- Vite dev server: rejected — introduces a build dependency.
