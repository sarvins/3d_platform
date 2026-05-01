# Implementation Plan: CO2 Material Module

**Branch**: `001-co2-material-module` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-co2-material-module/spec.md`

---

## Summary

Build the Material module Layer 1 of the CO2 platform: a client-side web application (no build system, no backend) that allows urban design professionals to explore embodied CO2 impact of floor count and construction methodology on a standard 25×25m residential tower. The UI is in Dutch. All outputs — a reactive CO2 metric, a Three.js 3D parametric viewer, and a Chart.js CO2 chart — update within 200ms of any input change. All data access flows through a `getImpact()` abstraction layer over hardcoded lookup tables, making the Layer 1→Layer 2 engine transition a drop-in replacement.

---

## Technical Context

**Language/Version**: JavaScript ES2022+ (ES Modules, native browser), HTML5, CSS3
**Primary Dependencies**: Three.js r163 (CDN via importmap), Chart.js 4.4.x (CDN UMD), OrbitControls (Three.js addons CDN)
**Storage**: N/A — no persistence; all state is in-memory, resets on page reload
**Testing**: Plain Node.js assertion scripts (no framework); run with `node tests/<file>.js`
**Target Platform**: Desktop browser — Chrome, Firefox, Edge (current stable versions)
**Project Type**: Static client-side web application
**Performance Goals**: All outputs update ≤200ms on input change; advisory callouts ≤500ms; 3D scene <15k triangles; render loop <1ms per frame
**Constraints**: No build system (no npm, no bundler, no transpiler); no backend server; data loaded inline in `getImpact.js` to avoid CORS issues on `file://` protocol; no external fonts or images
**Scale/Scope**: Single-user, single page; ~10 JS files; served via VS Code Live Server or `npx serve .`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Status | Notes |
|---|---|---|
| 1. Work within current module scope (Material, Layer 1) | ✅ Pass | No Energie, Microclimate, or Layer 2 work in scope |
| 2. Structural values derived from threshold table (height m + GFA m²) | ✅ Pass | `getImpact()` converts floor count → height_m before lookup |
| 3. Every threshold entry contains non-empty `threshold_reached` | ✅ Pass | Enforced by threshold integrity test (mandatory) |
| 4. All data/calculation access through `getImpact()` | ✅ Pass | Import boundary enforced by abstraction boundary test |
| 5. Data file versioned (semver, git-tracked) | ✅ Pass | `data_version` field in inline data; bumped on any data edit |
| 6. Mandatory tests exist and pass | ✅ Pass | 4 test scripts defined in this plan (see research.md) |
| 7. UI renders advisory callouts for `thresholds_crossed` events | ✅ Pass | FR-006; step1Panel reads `thresholds_crossed` from ImpactResult |
| 8. Tolerance disclaimer on all CO2 output values | ✅ Pass | FR-013; hardcoded in output panel template |
| 9. Deliverable independently deployable | ✅ Pass | Static files; no dependencies beyond CDN |

**No violations. No Complexity Tracking required.**

---

## Project Structure

### Documentation (this feature)

```
specs/001-co2-material-module/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── getImpact.md     ← Phase 1 output
│   └── store.md         ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← /speckit.tasks output (not yet created)
```

### Source Code (repository root)

```
3d_platform/
├── index.html                        ← Entry point; importmap; Chart.js CDN script
├── css/
│   └── main.css                      ← Layout, panel, chart, 3D container styles
├── js/
│   ├── main.js                       ← Orchestrator: init all modules, subscribe to store
│   ├── store.js                      ← Central State Store (getState, setState, subscribe)
│   ├── getImpact.js                  ← Abstraction layer + inline lookup data
│   ├── viewer/
│   │   ├── scene.js                  ← Three.js scene, camera, lights, OrbitControls, loop
│   │   ├── tower.js                  ← Tower class: floors (InstancedMesh), piles, core, elevators
│   │   └── shaders/
│   │       └── facade.glsl           ← Glazing ratio shader (uniform-driven)
│   ├── charts/
│   │   └── co2MaterialChart.js       ← Chart.js CO2 vs floors; vertical floor marker
│   └── ui/
│       └── step1Panel.js             ← Dutch-language input panel + output metrics + callouts
├── tests/
│   ├── thresholdIntegrity.js         ← All threshold entries have non-empty threshold_reached
│   ├── getImpactSnapshot.js          ← 10 input/output pairs; freezes ImpactResult shape
│   ├── abstractionBoundary.js        ← No JS file other than getImpact.js imports data inline
│   └── dataVersion.js                ← data_version in inline data matches ImpactResult return
├── .specify/
├── specs/
├── concept_spec.md
└── main.py                           ← Placeholder for future calculation engine
```

**Structure Decision**: Single static web app — no backend, no build artifacts. `js/` mirrors the constitution's canonical file structure exactly. Tests live in `tests/` and run with Node.js directly, requiring no test framework.
