<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0 (MINOR — four blocking gaps resolved, two table corrections)
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

### II. Phase-Gated Scope

Development is organised into explicit phases with locked scope:

- **Phase 1** — CO2 impact only; standard woontoren (25×25m); hardcoded data from lookup tables.
- **Phase 2** — Microclimate module (hittestress, verblijfscomfort).
- **Phase 3** — Python/Excel calculation engine replaces hardcoded data.
- **Phase 4+** — Location-aware context, expanded building types, masterplan aggregation.

No phase MUST be started before its predecessor is validated and the phase entry checklist
is signed off. Scope expansion into a later phase REQUIRES explicit decision, documented
as an amendment to this constitution.

**Phase 2 entry checklist** — ALL of the following MUST be true before any Phase 2 work begins:

- [ ] The external microclimate simulation tool exposes a documented, stable API endpoint
      (not a prototype or local script).
- [ ] At least one successful programmatic test call has been made from this codebase,
      with a real response parsed and logged.
- [ ] The tool's output schema (PET, UTCI format, spatial grid structure) is documented
      and agreed in writing with the tool owner.
- [ ] A team member has been designated as Phase 2 module owner, with domain knowledge
      of microclimate metrics.
- [ ] This constitution has been amended to include Phase 2 data contracts and UI spec.

If client pressure creates urgency to start Phase 2 before this checklist is met,
the Product Owner MUST document the unmet items and accept the risk in writing.
"Available" means all five items checked — not a demo, not a verbal confirmation.

**Rationale**: CFD-based microclimate simulations are notorious sprint-killers. An unclear
entry gate is the single most likely point of scope violation under client pressure.

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

| Height (m) | (~floors) | GFA/floor | Effect | threshold_reached label |
|---|---|---|---|---|
| < 7m | < 2 | 625 m² | No elevator; shallow foundation | — |
| < 35m | < 10 | 625 m² | First elevator required at ~31.5m | `"Vertical Transport Level 1"` |
| ~35m | ~10 | 625 m² | Stability system activates | `"Structural Stability System Activated"` |
| ~98m | ~28 | 625 m² | 3rd elevator required | `"Vertical Transport Level 2"` |
| ~133m | ~38 | 625 m² | 4th elevator required | `"Vertical Transport Level 3"` |
| ~250m | ~71 | 625 m² | 5 elevators + shell stability (max) | `"Maximum Height Regime"` |

*Note: floor count approximations assume 3.5m floor-to-floor. Authoritative values are meters.*

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

**3D model is optional.** The Three.js building preview MAY be deferred or toggled off.
It MUST NOT gate any Phase 1 delivery milestone.

**Rationale**: The chart is the product. Threshold annotations turn a data plot into an
advisory moment. A flat table of numbers produces no insight about non-linear structural cost.

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
- **3D model**: Optional Three.js building preview; toggleable. MUST NOT block delivery.
- **No backend server in Phase 1**: All computation client-side via static data.
- **External dependencies**: Microclimate tool (Phase 2 only) — integration pattern TBD.

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

**Version**: 1.2.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-05-01
