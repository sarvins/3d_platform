# Data Model: Material Module — Floor Input, Consequence Panel & Section View

## Overview

This feature introduces no new data files and no changes to the central store schema. All entities are either UI-only state or derived from the existing `ImpactResult` type.

---

## Entity 1 — ViewMode

**Description**: The currently selected viewer display mode. UI-only — not persisted in `store.js` and does not affect any calculation.

**Values**: `'perspective'` | `'front_sectie'` | `'links_sectie'`

**Default**: `'perspective'`

**Scope**: Module-scoped variable in `scene.js`. Set via `setViewMode(mode)` export. Read by the render loop and by `updateOrthoCamera()`.

**State transitions**:
```
perspective ──► front_sectie ──► links_sectie
     ▲               │                │
     └───────────────┴────────────────┘
```
Any mode can transition to any other mode on button click.

---

## Entity 2 — ConsequenceState

**Description**: Human-readable Dutch description of the current design consequence, derived from `ImpactResult` on every store update. Not stored — recomputed on each `updateOutputs()` call.

**Fields** (all derived, never stored):

| Field | Source | Example value |
|---|---|---|
| `elevatorText` | `impact.structural.elevator_count` | `"3 liften vereist"` |
| `foundationText` | `impact.structural.foundation_type` | `"Betonpalen (1e laag)"` |
| `stabilityText` | `impact.structural.stability_system` | `"Kern + skelet stabiliteit"` |
| `isThresholdCrossed` | `impact.thresholds_crossed.length > 0` | `true` |

**Elevator count → Dutch text mapping**:

| elevator_count | Dutch text |
|---|---|
| 0 | Geen lift vereist |
| 1 | 1 lift vereist |
| 2 | 2 liften vereist |
| 3 | 3 liften vereist |
| 4 | 4 liften vereist |
| 5 | 5 liften vereist — maximale hoogte |

---

## Entity 3 — PileDepthAnnotation

**Description**: The pile depth in metres shown as a text overlay in section views. Derived from floor count, not stored.

**Formula**: `pileDepthM = Math.round(Math.max(0.8, floors × 0.12) × 7)`

**Display format**: `"Paaldiepte: ~{n}m"` (tilde indicates approximate/indicative value)

**Visibility**: Shown only when `viewMode !== 'perspective'`. Hidden in 3D mode.

---

## Entity 4 — FloorInput (UI state)

**Description**: The editable floor count field. Replaces the non-editable div. The underlying value is stored in `store.js` as `state.floors` (unchanged). The input element itself holds a transient display value during typing.

**Validation rules**:
- Min: 2
- Max: 71
- Type: integer (decimal input is rounded)
- Non-numeric input: rejected, previous value restored
- Out-of-range input: clamped silently to [2, 71]

---

## Unchanged Entities

The following existing entities are read but not modified:

- `ImpactResult.structural` — elevator_count, foundation_type, stability_system, core_variant
- `ImpactResult.thresholds_crossed` — array of threshold crossing events
- `store.floors` — floor count, validated and stored as before
- `data/thresholds.json` — unchanged
- `data/co2Material.json` — unchanged
- `data/energyData.json` — unchanged
