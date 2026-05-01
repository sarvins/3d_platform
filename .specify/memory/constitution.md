<!--
SYNC IMPACT REPORT
==================
Version change: 1.4.0 → 1.5.0 (MINOR — lift threshold inconsistency flagged, 3D purpose clarified, file structure added)
Modified principles:
  - II. Phase-Gated Scope: Phase 2 entry replaced with concrete checklist (no longer prose)
  - III. Parametric Integrity: threshold table re-expressed in meters (primary) + floors (proxy)
  - IV. Data Transparency: data file versioning specified (semver field + git-tracked)
  - IV. Data Transparency: getImpact() return type pinned (all fields named, nulls for Phase 1)
Added sections:
  - VI. Testing Requirements (new principle — threshold table + contract tests mandatory)
  - Governance: roles and decision authority defined; tie-breaking mechanism specified
  - Technology Constraints: state management committed (Central Store + Observer, no library)
  - Known Limitations: uncertainty propagation acknowledged as named limitation
Removed sections: none
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gate updated (gate 8 added)
  ✅ .specify/templates/spec-template.md — compatible as-is
  ✅ .specify/templates/tasks-template.md — testing principle now applies; test tasks required
Deferred TODOs (carried forward):
  - TODO(LOCATION_IMPACT): Location parameter effect on calculations not yet defined
  - TODO(BRAND_CO2): Fire safety CO2 calculation method not yet confirmed
  - TODO(MICROCLIMATE_INTEGRATION): External tool integration pattern TBD (Phase 2)
  - TODO(FLOOR_HEIGHT): Exact floor-to-floor height (used to convert floors→meters) needs
    confirmation from structural data. Phase 1 working assumption: 3.5m/floor.
-->

# 3D Platform — Microclimate & CO2 Constitution

## Core Principles

### I. Agile-First, Always Deployable

Every iteration MUST produce a deployable, functional product. No work-in-progress builds.
Feedback loops MUST be short: build a slice, ship it, validate it, build the next slice.
Features MUST be scoped so they can be demonstrated independently before the next one begins.
Complexity MUST NOT accumulate between deployable states.

**Rationale**: The platform is a client-facing advisory tool. A working demo at every stage
is more valuable than a feature-complete product that is never seen.

### II. Module & Layer Structure

The platform is organised into **three modules** and **two layers**. These are independent
axes: a module is a domain, a layer is a depth of implementation.

#### Modules

| Module | Domain | Groups into |
|---|---|---|
| **Material** | Embodied CO2 from construction materials | CO2 section |
| **Energie** | Operational energy use and CO2 | CO2 section |
| **Microclimate** | Heat stress, stay comfort, PET/UTCI metrics | Microclimate section |

Material and Energie together form the **CO2 section** of the platform.
Microclimate is a separate section, dependent on an external simulation tool.

#### Layers

Every module is developed through two layers in sequence:

**Layer 1 — Lookup (current target):**
The UI is fully parametric and interactive. In the background, all outputs are served from
hardcoded lookup tables. The user cannot tell the difference. The goal of Layer 1 is a
**stable, sellable platform** — not an internal milestone. Layer 1 IS the product for the
foreseeable future.

**Layer 2 — Calculation engine (strategic fork, decision deferred):**
A Python/Excel engine replaces the lookup tables with live computation. This may change
the product type — from a web platform to a desktop application or thick-client tool.
Whether a web platform remains the right delivery format at Layer 2 is an open strategic
decision that MUST NOT be made until Layer 1 of all three modules is complete and
in active use. This constitution MUST be amended with that decision when the time comes.
Premature Layer 2 investment risks over-engineering a product before its value is validated.

#### Development sequence

```
Material (Layer 1) ──┐
                     ├──> both complete ──> Microclimate (Layer 1)
Energie  (Layer 1) ──┘
```

Material and Energie MUST be developed in parallel (they are independent modules).
Microclimate MUST NOT begin until both Material and Energie Layer 1 are complete and stable.

**Layer 2 for any module**: decision deferred — requires a strategic amendment.

#### Location-awareness

- **Microclimate**: location is a **mandatory input**. The module MUST NOT be specced or
  built without a location model in scope.
- **CO2 (Material + Energie)**: location impact on calculations is **not yet decided**.
  This decision MUST be made after Layer 1 of both CO2 modules is complete and in use.
  Until then, location for CO2 is out of scope.

#### Microclimate module entry checklist

Microclimate MUST NOT begin until ALL of the following are true:

- [ ] Material Layer 1 is complete, deployed, and stable.
- [ ] Energie Layer 1 is complete, deployed, and stable.
- [ ] The external microclimate simulation tool exposes a documented, stable API endpoint
      (not a prototype or local script).
- [ ] At least one successful programmatic test call has been made from this codebase.
- [ ] The tool's output schema (PET, UTCI format, grid structure) is agreed in writing.
- [ ] A team member with microclimate domain knowledge is designated as module owner.
- [ ] This constitution has been amended to include Microclimate data contracts and UI spec.

If client pressure pushes to start Microclimate before this checklist is met, the Product
Owner MUST document unmet items and accept the risk in writing. "Ready" means all items
checked — not a demo, not a verbal confirmation.

**Rationale**: CFD-based microclimate simulations are notorious sprint-killers. Layer 1 of
CO2 modules is the sellable foundation; Microclimate is the extension. Inverting this order
risks delivering nothing shippable while waiting on an external dependency.

### III. Parametric Integrity

All structural building components (core sizing, foundation type, elevator count, stability system)
MUST be derived automatically from the floor count and bouwmethodiek.
Users MUST NOT be able to manually override auto-computed structural values.
The threshold table is the single source of truth for structural decisions.
Any change to threshold logic MUST be treated as a breaking change and versioned accordingly.

**Threshold indexing**: Thresholds MUST be indexed by **height in meters** (primary) and
**Gross Floor Area (GFA) in m²**. Floor count is a Phase 1 input proxy and MUST be
converted to height before lookup: `height_m = floor_count × floor_height_m`.
Phase 1 working assumption: `floor_height_m = 3.5m` (TODO(FLOOR_HEIGHT): confirm from
structural data). The data model MUST store thresholds in meters and m², not floor counts,
so Phase 4+ non-standard footprints require no schema change.

**Threshold metadata**: Every threshold entry MUST include a `threshold_reached` flag with
a human-readable label. This metadata drives UI advisory moments — it is not optional.

**Threshold table** (Phase 1 baseline, heights derived from floor count × 3.5m):

| Floors | Height (m) | GFA/floor | Effect | threshold_reached label | Status |
|---|---|---|---|---|---|
| < 2 | < 7m | 625 m² | No elevator; shallow foundation | — | confirmed |
| 9 | ~31.5m | 625 m² | 1st elevator required | `"Vertical Transport Level 1"` | confirmed |
| ~16 | ~56m | 625 m² | 2nd elevator required | `"Vertical Transport Level 2"` | **assumed** |
| 28 | ~98m | 625 m² | 3rd elevator required | `"Vertical Transport Level 3"` | confirmed |
| ~38 | ~133m | 625 m² | 4th elevator required | `"Vertical Transport Level 4"` | assumed |
| ~71 | 250m | 625 m² | 5th elevator + shell stability (max) | `"Maximum Height Regime"` | confirmed |

*Floor count is primary input. Height = floors × 3.5m (TODO(FLOOR_HEIGHT): confirm floor height).*
*Rows marked **assumed** MUST be verified with the team before the lookup table is finalised.*
*Stability system threshold also needs confirmation — assumed to activate around 9–10 floors.*

**Rationale**: Allowing arbitrary overrides produces physically invalid outputs.
Threshold metadata ensures cliff edges are visible and drive advisory moments.

### IV. Data Transparency, Abstraction & Versioning

All CO2 and energy calculations MUST have a clearly documented data source.
Phase 1 lookup tables MUST be stored in a single, versioned data file per domain.
Approximate values MUST be flagged with their reading tolerance (±5–10 kg CO2/m²).
When lookup data is replaced by a calculation engine, the transition MUST be documented.
The UI MUST NOT imply false precision.

**Calculation abstraction layer (MANDATORY from line one of Phase 1):**
The UI MUST NEVER read from a data file or call a calculation engine directly.
All queries MUST go through:

```
getImpact(gfa_m2, height_m, bouwmethodiek, installatie, step2Params) → ImpactResult
```

**Pinned return type — `ImpactResult`:**

```
{
  // CO2 & energy outputs
  co2_material_kg_m2: number,        // kg CO2/m² gross floor area; ±5–10 tolerance
  co2_energy_kwh_m2: number,         // kWh/m² per year
  energy_neutrality_pct: number,     // % of demand coverable by rooftop PV

  // CO2 breakdown (null in Phase 1; populated in Phase 3)
  co2_breakdown: {
    fundering: number | null,
    constructie: number | null,
    liften: number | null,
    brand: number | null,
  } | null,

  // Auto-computed structural state
  structural: {
    core_variant: 'A' | 'B' | 'C' | 'D' | 'E',
    foundation_type: string,
    elevator_count: number,
    stability_system: string,
  },

  // Threshold events — array is empty if no thresholds crossed vs. previous state
  thresholds_crossed: Array<{
    threshold_reached: string,   // human-readable label from threshold table
    field: string,               // which structural param changed
    previous_value: unknown,
    new_value: unknown,
  }>,

  // Provenance
  data_version: string,          // semver of the data file used (e.g. "1.0.0")
  tolerance_note: string,        // e.g. "±5–10 kg CO2/m² (graph-read Phase 1 data)"
}
```

Consumers that need threshold events for UI advisories MUST read from `thresholds_crossed`
in the `ImpactResult` — they MUST NOT call a separate function.

**Data file versioning**: Every data file MUST contain a `data_version` field in semver format.
Files MUST be git-tracked. `getImpact()` MUST return `data_version` in every response.
When Phase 3 replaces lookup data, the old file version MUST be retained in git history.
Clients may ask "what data was this recommendation based on?" — provenance must be answerable.

**Rationale**: Without the abstraction, Phase 1→3 forces a UI rewrite. Without pinned return
types, features implement inconsistently. Without versioning, advisory provenance is lost.

### V. Advisory Positioning & Visual Communication

Every UX and output decision MUST serve user comprehension, not just data display.
The tool MUST communicate the *implication* of choices, not just raw numbers.
Threshold crossings MUST be visually signalled — the `thresholds_crossed` array in
`ImpactResult` drives this; the UI MUST render an advisory callout for each non-empty entry.
The platform MUST naturally surface complexity to invite expert engagement — it is a
lead generation tool, not a self-service replacement for advisory.

**2D charting is a MANDATORY Phase 1 hard dependency.** A chart library capable of:
multi-line graphs, annotated vertical threshold bands, and dynamic reactive updates.
The CO2 vs. floor count curve with threshold annotations IS the primary product of Phase 1.
A table cannot fulfil this requirement.

**3D model is MANDATORY.** A Three.js parametric building viewer MUST ship as part of
the platform. It is the spatial counterpart to the chart — where the chart shows CO2 cost
over floors, the 3D model shows *what* is changing and *why*. Together they form the
complete advisory moment.

**Visual language — abstract and cubic, not BIM:**
The model MUST be a schematic parametric diagram, not an architectural model.
No facade detail, no materials textures, no window mullions. Simple extruded geometry only.
The goal is legibility of structural logic, not visual realism.

**Reactive elements and rendering rules:**

| Element | Update mode | Technique |
|---|---|---|
| Floor count | Continuous — updates on every stepper click | `InstancedMesh` (one draw call) |
| Foundation piles | Continuous — depth scales with floor count | Scaled cylinder geometry |
| Core variant | Updates at threshold crossing | Swap geometry at event |
| Elevator count | Updates at threshold crossing | Show/hide shaft geometry |
| Glazing ratio | Discrete steps of 10% (30–80%) | Facade shader uniform |
| Balcony type | Schematic — one representative floor shown | Swap module geometry |
| Solar shading | Schematic — one representative floor shown | Swap module geometry |

Glazing MUST use a **facade shader** — a custom Three.js material with `glazing_ratio`
as a uniform. No geometry rebuild on glazing change. Discrete 10% steps are used not for
performance reasons but because the lookup data does not support finer resolution —
a continuous slider would imply false precision the data cannot back.

Balcony type and solar shading MUST be shown on a single representative floor module,
not repeated across all floors. Repeating across all floors is computationally unnecessary
and visually noisy — the schematic intent is communicated by one instance.

Target scene complexity: **< 15k triangles total**. This keeps render time under 1ms
per frame regardless of floor count, on any modern device including low-end laptops.

**Purpose and scope of the 3D model — explicit:**
The 3D model is a **communication and advisory tool only**. It is not a design tool.
Users cannot draw, move, resize, or otherwise edit the building geometry. All geometry
is a direct consequence of parametric inputs (floor count, bouwmethodiek, Step 2 choices).
The model responds to inputs — it does not accept geometric input.

This distinction MUST be communicated in the UI (e.g. a label: "Parametric preview —
not a design environment") to set correct expectations for users from architectural
or BIM backgrounds who may expect to interact with the geometry directly.

**Justification for mandatory 3D:**
Early-stage masterplan decisions have spatial consequences that numbers alone cannot
communicate. A user who sees the foundation piles grow deeper as they add floors
understands foundation cost intuitively — faster and more durably than reading a
kg CO2/m² figure. The 3D model makes structural engineering logic spatially legible
to non-engineers, which is the primary audience of this advisory platform.
This is not a feature — it is the medium through which the advisory message is delivered.

**Rationale**: The chart shows cost over floors. The 3D model shows what physically
changes and why. Together they make the non-linear CO2 curve spatially self-explanatory.
A BIM-level model would obscure structural logic under architectural detail — the
opposite of advisory clarity. A numbers-only UI would require the user to already
understand what they are learning.

### VI. Testing Requirements

The threshold table and `getImpact()` contract are the load-bearing core of the platform.
Errors here produce structurally invalid outputs with no visible warning.

**Mandatory tests (MUST exist before Phase 1 ships):**

1. **Threshold table integrity**: For every entry in the threshold table, validate that
   `threshold_reached` is a non-empty string. This test MUST run on every data file edit.

2. **`getImpact()` snapshot tests**: Minimum 10 input/output pairs covering:
   - At least one scenario below every major threshold (elevator, stability, max height)
   - At least one scenario above every major threshold
   - Each of the 4 bouwmethodiek options
   Tests MUST freeze the expected `ImpactResult` shape. A field added or removed MUST
   cause a test failure.

3. **Abstraction boundary test**: A linting rule or import check MUST verify that no
   UI file imports directly from a data file. All data access MUST flow through `getImpact()`.

4. **Data version consistency**: A test MUST verify that the `data_version` in the data file
   matches the version returned by `getImpact()`.

**Rationale**: The threshold table drives everything — elevator count, foundation type,
stability system, CO2 cliff edges. An off-by-one in height bands produces invalid outputs
silently. Tests are the only defence.

## Known Limitations

**Uncertainty propagation (Phase 1):** Each CO2 component value carries ±5–10 kg CO2/m²
reading tolerance (graph-read data). Compounding across components (fundering + constructie
+ liften + brand) may produce total uncertainty of ±20–40 kg CO2/m². Phase 1 MUST display
a tolerance disclaimer on all outputs. Phase 3 MUST quantify compound error margins before
outputs are used in client-facing recommendations without qualification. The platform is
an order-of-magnitude advisory tool in Phase 1 — not a precision calculator.

## Technology Constraints

- **Frontend**: HTML/CSS/JavaScript. No heavy frontend framework.
- **2D Charting**: Mandatory Phase 1 dependency. Must support multi-line graphs, annotated
  vertical bands, and reactive updates. Recommended: Chart.js (lightweight, CDN-available,
  sufficient for this use case). Decision MUST be locked before Phase 1 code begins.
- **State management**: **Central State Store pattern (plain JS module).**
  A single `store.js` module holds all parametric state (floors, bouwmethodiek, installatie,
  step2 params). UI components subscribe to store changes via a simple Observer/callback
  pattern. DOM updates are triggered only by store notifications — never imperatively inline.
  No reactive library (Vue, Alpine, Preact) is used. This avoids VDOM/Three.js conflicts
  and keeps the bundle lean. This is a committed architectural decision, not a suggestion.
  If this proves insufficient, an amendment is required before changing it.
- **Calculation abstraction**: All data access through `getImpact()` — see Principle IV.
- **Calculations**: Phase 1 — JSON lookup. Phase 3 — Excel-backed or formula engine.
  Calculation logic MUST be separated from rendering logic at all times.
- **Data files**: Single versioned JSON file per domain. Must contain `data_version` field.
- **3D model**: Mandatory Three.js parametric viewer. Abstract cubic geometry only —
  no BIM detail. InstancedMesh for floors, scaled geometry for piles, facade shader
  for glazing, swappable module geometry for balcony/shading. Target: < 15k triangles.
  Glazing ratio input MUST be discrete (10% steps) to match data resolution.
- **No backend server in Phase 1**: All computation client-side via static data.
- **External dependencies**: Microclimate tool (Microclimate module only) — integration pattern TBD.

### Canonical File & Folder Structure

Every feature MUST place files according to this structure. Deviations require an amendment.

```
3d_platform/
├── index.html                        # Entry point
├── css/
│   └── main.css
├── js/
│   ├── store.js                      # Central State Store — single source of parametric state
│   ├── getImpact.js                  # Calculation abstraction layer — ONLY file that reads data/
│   ├── viewer/                       # Three.js 3D parametric viewer
│   │   ├── scene.js                  # Scene setup, camera, lighting, render loop
│   │   ├── tower.js                  # InstancedMesh floors, piles, core, elevator geometry
│   │   ├── modules.js                # Swappable balcony / solar shading modules (1 floor)
│   │   └── shaders/
│   │       └── facade.glsl           # Glazing ratio shader (uniform-driven)
│   ├── charts/                       # 2D charting (Chart.js)
│   │   ├── co2MaterialChart.js       # Graph 1: CO2 vs floors (3 lines + threshold bands)
│   │   ├── co2MarginalChart.js       # Graph 2: CO2 per m² per extra floor
│   │   └── energyChart.js            # Graph 3: Energy breakdown vs height
│   ├── ui/                           # Input panels — read from store, write to store
│   │   ├── step1Panel.js             # Bouwmethodiek, installatie, floor stepper
│   │   └── step2Panel.js             # Balkons, zonwering, sliders
│   └── data/                         # Raw data files — imported ONLY by getImpact.js
│       ├── thresholds.json           # Structural threshold table (versioned)
│       ├── co2Material.json          # CO2 material lookup table (versioned)
│       └── co2Energy.json            # Energy use lookup table (versioned)
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   └── templates/
├── concept_spec.md
└── main.py                           # Placeholder — future calculation engine
```

**Enforcement rules derived from this structure:**
- `data/` files MUST only be imported inside `getImpact.js`. Any other import is a violation.
- `store.js` is the only file that holds state. UI panels read from and write to `store.js` only.
- `viewer/` files MUST NOT import from `charts/` or `ui/` — they subscribe to `store.js` only.
- `charts/` files MUST NOT import from `viewer/` — they subscribe to `store.js` only.
- New modules (Energie, Microclimate) extend this structure — they do not restructure it.

## Development Workflow

- Each feature MUST have a spec (`/speckit.specify`) before implementation begins.
- Implementation plans (`/speckit.plan`) MUST reference the spec and pass all Constitution
  Check gates below.
- Tasks (`/speckit.tasks`) MUST be independently completable and mapped to user stories.
- Commits MUST be made after each logical unit of work — not in bulk at the end.
- Phase boundaries MUST be reviewed and signed off by both roles (see Governance).
- Open questions (see `concept_spec.md §8`) MUST be resolved before they become
  implementation blockers — not deferred silently as `TODO` comments in code.

**Constitution Check Gates** (all MUST pass before a plan is approved):

1. Is the work within the current phase scope?
2. Are structural values derived from the threshold table, indexed by height (m) and GFA (m²)?
3. Does every threshold entry in the data file contain a non-empty `threshold_reached` field?
4. Does all data/calculation access flow through `getImpact()` with the pinned return type?
5. Is the data file versioned (semver field present, git-tracked)?
6. Do all mandatory tests exist and pass (snapshot, integrity, boundary, version)?
7. Does the UI render advisory callouts for `thresholds_crossed` events?
8. Is the tolerance disclaimer displayed on all CO2/energy output values?
9. Is the deliverable independently deployable?

## Governance

**Roles and decision authority:**

- **Product Owner** (domain expert / urban design advisor): holds veto on scope decisions,
  advisory positioning, output interpretation, and phase entry. Responsible for signing off
  the Phase 2 entry checklist.
- **Technical Lead** (developer): holds veto on architecture, abstraction boundaries,
  state management, and testing requirements. Responsible for constitution check gates.

**Tie-breaking**: If Product Owner and Technical Lead disagree on whether a constitution
check passes, the disagreement MUST be documented, both positions recorded, and an
amendment to this constitution proposed to close the ambiguity. No work proceeds on the
disputed item until the amendment is merged.

**Amendment process**: Amendments MUST be proposed as a diff to this file, reviewed by
both roles, merged with a version bump, and `concept_spec.md` updated if scope or data
is affected. Compliance MUST be reviewed at every phase boundary.

Use `concept_spec.md` as the living runtime reference for product decisions.
Use `.specify/memory/constitution.md` (this file) as the governing principles document.

**Version**: 1.5.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-05-01
