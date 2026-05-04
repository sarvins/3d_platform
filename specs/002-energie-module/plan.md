# Implementation Plan: Energie Module

**Branch**: `002-energie-module` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-energie-module/spec.md`

---

## Summary

Extend the existing Material module platform with the Energie module: adds Step 2 controls (balkons, zonwering, raam oppervlak, isolatie, luchtdichtheid, lift efficiency), a stacked energy breakdown chart (kWh/m²/year per category vs height), and a populated energie neutraliteit (dak) percentage in the output panel. All new work is strictly additive — no existing Material module output is modified or removed. Energy data flows through the existing `getImpact()` abstraction layer, extended to import `data/energyData.json` and populate the currently-null energy fields.

---

## Technical Context

**Language/Version**: JavaScript ES2022+ (ES Modules, native browser), HTML5, CSS3 — unchanged from Material module
**Primary Dependencies**: Chart.js 4.4.x (CDN UMD, already loaded) — no new CDN dependencies
**Storage**: N/A — no persistence; all state in-memory
**Testing**: Extend existing Node.js assertion scripts; add `tests/energySnapshot.js`
**Target Platform**: Desktop browser — Chrome, Firefox, Edge (current stable) — unchanged
**Project Type**: Additive extension of existing static web application
**Performance Goals**: All energy outputs update ≤200ms on any input change
**Constraints**: Strictly additive — zero breaking changes to Material module; no build system; no backend
**Scale/Scope**: 3 new files, 3 extended files, 1 new test script, 1 new data file

---

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| 1. Work within current module scope (Energie, Layer 1) | ✅ Pass | No Microclimate or Layer 2 work; Material module unchanged |
| 2. Structural values from threshold table (height m + GFA m²) | ✅ Pass | Energie module does not change structural lookup |
| 3. Every threshold entry has non-empty `threshold_reached` | ✅ Pass | Existing `tests/thresholdIntegrity.js` covers this |
| 4. All energy data through `getImpact()` | ✅ Pass | `step2Panel.js` and `energyChart.js` only call exported functions from `getImpact.js` |
| 5. Data file versioned (semver, git-tracked) | ✅ Pass | `data/energyData.json` has `data_version` field |
| 6. Mandatory tests exist and pass | ✅ Pass | Existing 4 tests continue; `tests/energySnapshot.js` added |
| 7. UI renders advisory callouts for `thresholds_crossed` | ✅ Pass | Already implemented in Material module; unchanged |
| 8. Tolerance disclaimer on all energy output values | ✅ Pass | FR-014; step2Panel and PV metric both show disclaimer |
| 9. Deliverable independently deployable | ✅ Pass | Same static file deployment; Material module functions without Step 2 |

**No violations. No Complexity Tracking required.**

---

## Project Structure

### Documentation (this feature)

```
specs/002-energie-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── getEnergyChartData.md
│   └── step2Panel.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code Changes (repository root)

```
3d_platform/
├── data/
│   └── energyData.json               ← NEW
├── js/
│   ├── store.js                      ← EXTEND: add step2 sub-object to state
│   ├── getImpact.js                  ← EXTEND: import energyData.json, compute energy fields
│   ├── main.js                       ← EXTEND: init step2Panel and energyChart
│   ├── charts/
│   │   └── energyChart.js            ← NEW
│   └── ui/
│       └── step2Panel.js             ← NEW
└── tests/
    └── energySnapshot.js             ← NEW
```

**Structure Decision**: Strictly follows the constitution's canonical file structure. All new files add to existing directories. Extensions to existing files are backward-compatible — the Material module continues to work without Step 2 interaction.
