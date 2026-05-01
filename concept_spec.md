# Microclimate & CO2 Web Platform — Concept Specification

**Status:** Draft — based on PowerPoint walkthrough sessions  
**Language:** English (Dutch terms preserved where domain-specific)  
**Last updated:** 2026-05-01

---

## 1. Purpose & Positioning

An interactive, publicly accessible web platform that allows potential clients and collaborators in urban design to explore and understand the CO2 and microclimate impact of early-stage masterplan decisions. The platform serves as a lead generation and advisory positioning tool: users engage with the tool independently, and the results naturally surface the need for more concrete, customized advice from the advisory team.

The platform is agile by design — built iteratively in small feedback loops, always functional, progressively enriched.

---

## 2. Scope

### Modules

| Module | Section | Status |
|---|---|---|
| Material | CO2 | Active — Layer 1 (lookup tables) |
| Energie | CO2 | Active — Layer 1 (lookup tables), parallel with Material |
| Microclimate | Microclimate | Deferred — begins after both CO2 modules are stable |

### Layers (per module)

**Layer 1 — Lookup (current target for all modules):**
Parametric UI backed by hardcoded lookup tables. Goal: stable, sellable platform.
This IS the product — not a stepping stone.

**Layer 2 — Calculation engine (strategic decision deferred):**
Python/Excel engine replacing lookup tables. May change product type (web → software).
Decision made only after Layer 1 of all three modules is in active use.

### Development sequence
Material + Energie Layer 1 in parallel → Microclimate Layer 1 → Layer 2 decision (TBD)

### Microclimate module
- Dependent on an external simulation tool currently under development
- Will cover: heat stress (hittestress) and stay comfort (verblijfscomfort)
- Metrics: PETmax, PETdag, PETnacht, UTCI (by activity: walking, sitting, playing)
- Green scenarios: none / 30% random / >60% wrongly placed / >60% correctly placed
- Output at grid level (spatial heatmap)
- **Location is a mandatory input** for this module

### Location-awareness for CO2 modules
Decision deferred until Layer 1 of Material + Energie is complete and in use.

---

## 3. Tech Stack

- **Frontend:** Three.js + HTML/CSS/JavaScript
- **Calculations:** Python (converted from Excel, initially hardcoded)
- **Optional 3D/2D preview:** Three.js building module (nice-to-have, toggle on/off)

---

## 4. Building Typology (Fixed for Phase 1)

All scenarios use a fixed 25×25m footprint = **625 m² gross floor area per floor**.

The core (kern) dimensions are auto-selected based on floor count thresholds. Five core variants exist:

| Variant | Core dimensions | Core area (net) |
|---------|----------------|-----------------|
| A       | 6 × 10 m       | 60 m²           |
| B       | 8 × 10 m       | 80 m²           |
| C       | 10 × 10 m      | 100 m²          |
| D       | 12 × 12 m      | 144 m²          |
| E       | 14 × 14 m      | 196 m²          |

Core selection, foundation type, elevator count, and stability system are all **automatically determined by the number of floors**, following structural threshold rules (see Section 6).

---

## 5. Platform Structure — Two Steps

### Step 1 — Global Scenario Settings

The user sets the overall scenario for the tower. All structural components are computed automatically from these inputs.

#### 5.1.1 Inputs

**Building type:** Standard woontoren (fixed in Phase 1)

**Location:** To be defined — either map-based selection or preset cities. Impact on calculations TBD.

**Number of floors:** Stepper control (+ / − buttons), range approx. 2–50 floors.

**Bouwmethodiek (Construction methodology):** Single-select, 4 options:
- Max innovatief (maximum innovative)
- Best practice bio-based
- Hoogwaardig hybride (high-quality hybrid)
- Business as usual

**Installatie/energie (Installation & energy system):** Single-select, 3 options:
- Natuurlijk (natural/passive)
- High-tech
- Business as usual

#### 5.1.2 Auto-computed from floor count + bouwmethodiek

These five structural components are derived automatically — the user does not set them directly:

| Component | Calculation logic |
|---|---|
| Bodem schematisering (soil/ground) | Fixed or based on location |
| Dak + begane grondvloer (roof + ground floor) | Driven by bouwmethodiek |
| Kern dimensionering (core sizing) | Threshold-based (selects one of 5 core variants above) + bouwmethodiek |
| Fundering (foundation) | Linear scaling with floor count + bouwmethodiek |
| Liften (elevators) | Threshold-based step-ups at specific floor counts |

Known structural thresholds (from diagrams):
- < 2 floors: no elevator, shallow foundation (wooden piles or steel)
- < 10m / < 20m: stepped foundation types
- ~9 floors / ~35m: first elevator threshold
- ~35m: stability system activates
- ~28 floors: 3rd elevator required
- ~38 floors: 4th elevator required
- Max height: ~250m (5 elevators + shell stability system)

#### 5.1.3 Step 1 Outputs

Displayed reactively as the user changes floor count or scenario:
- Impact on core (kern) — which core variant is active
- CO2 material impact — kg CO2/m²
- Energy use impact — kWh/m²
- Energy neutrality (dak) — potential of rooftop PV to offset energy demand (metric TBD: %, kWh, or yes/no indicator)

---

### Step 2 — Detail Parameters

Fine-grained parameters that affect energy consumption and envelope performance. These feed primarily into the energy calculation.

#### 5.2.1 Choices (discrete options)

| Parameter | Options |
|---|---|
| Balkons | Binnen (recessed) / Buiten (external) / Gevellijn (flush with facade) |
| Zonwering (solar shading) | Extern / Intern / Zonwerend glas (solar-control glazing) |

#### 5.2.2 Sliders (continuous range)

| Parameter | Min | Max |
|---|---|---|
| Raam oppervlak (window-to-wall ratio) | 30% | 80% |
| Isolatie (Rc + Uglas — single slider, both values move together) | Min: Rc = 3, Uglas = 1.2 | Max: Rc = 8, Uglas = 0.8 |
| Luchtdichtheid (air tightness) | Hoog (high = tight) | Norm (standard) |
| Lift energy use | Zuinig (efficient) | Standaard (standard) |

#### 5.2.3 Optional: Building Preview

A 2D or 3D visual representation of the tower module that updates based on Step 2 choices (e.g. balcony type, glazing ratio). Toggled on/off by the user. This is a **nice-to-have**, not a must-have for the first iteration.

---

## 6. Calculation Methodology (Berekeningmethodiek)

### 6.1 CO2 Material (Stap 1 Materiaal)

CO2 from embodied carbon in physical construction materials. Components included:

| Component | Dutch term | Calculation logic |
|---|---|---|
| Foundation | Fundering | Linear scaling with floor count, modified by bouwmethodiek |
| Structure / construction | Constructie | Per-floor factor, modified by bouwmethodiek and core variant |
| Elevators | Liften | Step-function at floor count thresholds |
| Fire safety | Brand | Fixed or threshold-based (TBD) |

Output unit: **kg CO2/m² (hoogte gerelateerd)** — normalised to gross floor area.

**Data source (Phase 1):** Hardcoded lookup table, values manually read from the "Stap 1 materiaal — CO2 en hoogte" graph in the concept PowerPoint. These are approximate (±5–10 kg CO2/m² reading tolerance) and will be replaced by the Python/Excel engine in a later iteration.

The lookup table maps: `number_of_floors → { conventioneel, hybride, biobased }` in kg CO2/m².

**Three construction scenario lines:**
- Conventioneel (red) — highest CO2
- Hybride (blue) — mid
- Biobased (green) — lowest

Curve shape: U-shaped — high CO2 for very low buildings (foundation cost dominates), drops to minimum around 8–12 floors, then rises again as structural complexity increases.

### 6.2 CO2 Energy (Stap 2 Energie)

CO2 from operational energy use. Categories:

| Category | Dutch term |
|---|---|
| Heating | Verwarming |
| Cooling | Koeling |
| Ventilation | Ventilatie |
| Lighting | Verlichting |
| Hot water | Warmtapwater |
| Elevator energy | Lift |
| Occupant-related | Gebruikers |

Output unit: **kWh/m²** per category, stacked.

**Data source (Phase 1):** Hardcoded lookup table, values manually entered per height scenario and installatie/energie option. Same approach as CO2 material data — to be replaced by Python/Excel engine in a later iteration.

**Energie neutraliteit (dak):** Displayed as a **percentage** — the share of the building's total energy demand that can be covered by rooftop PV, given the available roof area (25×25m = 625m²) and the selected installatie/energie scenario. Shown as a single indicator in the Step 1 output panel.

---

## 7. Output Graphs

### Graph 1 — CO2 en hoogte (material)

| Property | Value |
|---|---|
| Title | CO2 en hoogte — fundering, constructie, liften, brand |
| X-axis | Aantal verdiepingen (number of floors), 2–50 |
| Y-axis | kg CO2/m² hoogte gerelateerd |
| Lines | Conventioneel (red), Hybride (blue), Biobased (green) |
| Shape | U-curve, minimum ~8–12 floors |

### Graph 2 — CO2 per m² bruto per extra verdieping (marginal)

| Property | Value |
|---|---|
| Title | CO2 per m² bruto per extra verdieping |
| X-axis | Aantal verdiepingen (number of floors), 2–50 |
| Y-axis | kg CO2/m² |
| Lines | Conventioneel, Hybride, Biobased (same colours) |
| Annotations | Gray shaded bands at structural threshold zones: foundation to 2nd layer (~12–18 floors), 3rd elevator (~28–32 floors), 4th elevator (~38–42 floors) |
| Extra | Dashed trend lines per construction type |

This graph shows the *marginal CO2 cost* of each additional floor — spikes appear at structural threshold crossings.

### Graph 3 — Energie vs hoogte

| Property | Value |
|---|---|
| Title | Stap 2 Energie |
| X-axis | m hoogte (building height in metres), 0–250 |
| Y-axis | kWh/m² (approx. 0–60+) |
| Display | Stacked bars per height scenario |
| Categories | Verwarming, Koeling, Ventilatie, Verlichting, Warmtapwater, Lift, Gebruikers |

---

## 8. Open Questions

### Resolved

- **CO2 material data source** — Hardcoded lookup table, read manually from the "Stap 1 materiaal" graph. ✓
- **Energy data source** — Hardcoded manually for Phase 1, same pattern as material CO2. ✓
- **Energie neutraliteit (dak)** — Output is a percentage: share of energy demand coverable by rooftop PV (625m² roof). ✓

### Still open (to resolve before or during development)

1. **Brand (fire safety CO2)** — Calculation method unknown. Placeholder for now; include as a line item in Graph 1 but mark as TBD in the data.

2. **Location parameter** — Does it affect climate zone, foundation assumption, or is it informational only in Phase 1?

3. **The 14 numbered height scenarios** — Fixed benchmark reference points shown above the graph, or dynamically generated from the user's floor count input?

4. **Microclimate module integration** — When the external tool is ready: API call, pre-computed lookup, or direct embed?

---

## 9. Development Approach

- Agile, iterative — small feedback loops, always deployable
- **Now**: Material + Energie modules in parallel, Layer 1 (lookup tables)
- **Next**: Microclimate module Layer 1, once both CO2 modules are stable
- **Later (strategic decision deferred)**: Layer 2 calculation engine — may change product type
- Location for CO2: decided after Layer 1 CO2 is in use
- Location for Microclimate: mandatory from the start
