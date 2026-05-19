# Feature Specification: Energie Module

**Feature Branch**: `002-energie-module`
**Created**: 2026-05-02
**Status**: Draft
**Module**: Energie (CO2 section) — Layer 1

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — See energy breakdown and PV neutrality at default settings (Priority: P1)

An urban design professional opens the platform (with the Material module already running) and sees a new energy chart — a stacked bar chart showing the breakdown of energy use by category (heating, cooling, ventilation, lighting, hot water, elevators, occupants) in kWh/m²/year across different building heights. The output panel now also shows a percentage: how much of the building's energy demand can be covered by rooftop solar panels. Both outputs reflect the energy system already selected in Step 1 (installatie/energie) and the default Step 2 settings.

**Why this priority**: This is the minimum deliverable for the Energie module. Without the chart and the PV percentage, the module has no visible output. This story alone makes the Energie module demonstrable.

**Independent Test**: Open the platform at default settings (10 floors, Business as usual, default Step 2 values). Verify the energy chart appears with all 7 colour-coded categories stacked. Verify a non-zero energie neutraliteit percentage is displayed in the output panel. Verify the chart highlights the bar corresponding to the current floor count.

**Acceptance Scenarios**:

1. **Given** the platform is open at default settings, **When** the Energie module loads, **Then** a stacked energy bar chart is visible showing at least 7 categories for each height scenario.
2. **Given** the platform is open at default settings, **When** the Energie module loads, **Then** the output panel shows a non-zero energie neutraliteit percentage labelled in Dutch.
3. **Given** any floor count, **When** the user changes floor count using the + / − stepper, **Then** the energy chart highlights the bar at the current floor's height and the PV percentage updates within 200ms.
4. **Given** the user selects "Natuurlijk" installatie in Step 1, **When** the chart updates, **Then** energy use totals are lower than with "Business as usual" at the same floor count.

---

### User Story 2 — Adjust envelope choices and see energy impact (Priority: P2)

An urban design professional uses the Step 2 discrete choice controls — balcony type and solar shading type — and observes how the energy chart updates. Choosing external solar shading reduces the cooling load. Choosing recessed balconies changes the thermal envelope. The professional can compare options by switching between them and watching the stacked chart update.

**Why this priority**: Discrete choices have a visible and understandable impact on the chart. They represent typical early-stage design decisions an urban design advisor would discuss with a client.

**Independent Test**: Select "Externe zonwering" then switch to "Intern". Verify the koeling (cooling) bar changes between the two settings. Select "Balkons buiten" then "Balkons binnen" — verify the chart updates. Verify both updates occur within 200ms.

**Acceptance Scenarios**:

1. **Given** zonwering is set to "Extern", **When** the user switches to "Intern", **Then** the koeling category in the chart increases (external shading is more effective at blocking solar gain).
2. **Given** any balcony setting, **When** the user switches balcony type, **Then** the energy chart updates to reflect the changed thermal envelope contribution.
3. **Given** any combination of discrete choices, **When** the chart is displayed, **Then** all 7 energy categories remain visible in the stacked bar for each height.

---

### User Story 3 — Fine-tune with sliders and see precise energy impact (Priority: P3)

An urban design professional adjusts the Step 2 continuous controls — window-to-wall ratio, insulation level, air tightness, and elevator efficiency — and observes how each affects the energy breakdown. The raam oppervlak slider moves in discrete 10% steps (matching data resolution). The isolatie slider moves Rc and Uglas values together. The professional can identify the most impactful lever for reducing energy use.

**Why this priority**: Sliders provide the most granular advisory value — they show quantitative sensitivity to design decisions. They depend on the discrete choices (US2) already being wired to the chart.

**Independent Test**: Move raam oppervlak from 30% to 80% in steps. Verify verwarming (heating) increases as glazing increases (more heat loss in winter). Move isolatie from minimum (Rc 3) to maximum (Rc 8) — verify verwarming decreases. Switch luchtdichtheid from "Norm" to "Hoog" — verify ventilatie (ventilation) changes. Switch lift from "Standaard" to "Zuinig" — verify lift category decreases.

**Acceptance Scenarios**:

1. **Given** raam oppervlak is at 30%, **When** the user moves it to 80%, **Then** the verwarming (heating) and koeling (cooling) values increase in the current height bar.
2. **Given** isolatie is at minimum (Rc 3, Uglas 1.2), **When** the user moves to maximum (Rc 8, Uglas 0.8), **Then** the verwarming value decreases in the chart and the energie neutraliteit percentage increases.
3. **Given** lift efficiency is "Standaard", **When** the user switches to "Zuinig", **Then** the lift category in the stacked bar decreases.
4. **Given** any slider position, **When** the slider changes, **Then** all chart updates occur within 200ms.

---

### Edge Cases

- What happens when energie neutraliteit exceeds 100%?
  → Cap the displayed value at 100% with a label "Energie positief" — the building produces more than it consumes.
- What happens at very low floor counts (2 floors) where PV roof covers a large percentage?
  → The percentage can reach or exceed 100% — cap and label accordingly.
- What happens when all Step 2 controls are at maximum efficiency simultaneously?
  → The chart shows minimum energy use; PV percentage may exceed 100%; normal behaviour — apply cap and label.
- What happens if the user changes installatie/energie in Step 1 while Step 2 is configured?
  → Step 2 values remain unchanged; only the base energy scenario changes; chart updates to reflect the new combination.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a stacked bar chart of energy use in kWh/m²/year vs building height (in metres), with one bar per discrete height scenario.
- **FR-002**: The stacked chart MUST show 7 energy categories: verwarming (heating), koeling (cooling), ventilatie (ventilation), verlichting (lighting), warmtapwater (hot water), lift, gebruikers (occupants).
- **FR-003**: Each energy category MUST have a distinct, consistent colour and a Dutch legend label.
- **FR-004**: The chart MUST highlight the bar corresponding to the user's current floor count, updating within 200ms of any floor count change.
- **FR-005**: The output panel MUST display the energie neutraliteit (dak) percentage — the share of annual energy demand coverable by rooftop PV on the 625m² roof area.
- **FR-006**: The energie neutraliteit percentage MUST update within 200ms of any input change (floor count, installatie, or any Step 2 parameter).
- **FR-007**: When energie neutraliteit exceeds 100%, the display MUST cap at 100% and show the label "Energie positief".
- **FR-008**: The system MUST offer three discrete balkons options in Dutch: Binnen (recessed), Buiten (external), Gevellijn (flush with facade).
- **FR-009**: The system MUST offer three discrete zonwering options in Dutch: Extern, Intern, Zonwerend glas.
- **FR-010**: The system MUST offer a raam oppervlak slider from 30% to 80% in discrete steps of 10% (7 positions: 30, 40, 50, 60, 70, 80%). Current value MUST be displayed numerically.
- **FR-011**: The system MUST offer a single isolatie slider controlling Rc value (3 to 8) and Uglas value (1.2 to 0.8) simultaneously. Both current values MUST be displayed numerically alongside the slider.
- **FR-012**: The system MUST offer a luchtdichtheid slider with Hoog as the minimum label and Norm as the maximum label (two discrete positions).
- **FR-013**: The system MUST offer a lift efficiency slider with Zuinig as the minimum label and Standaard as the maximum label (two discrete positions).
- **FR-014**: The system MUST offer an installatie / energie selector in Step 1 with three options: Business as usual, High-tech installatie, and Natuurlijk. Changing the selection MUST update the energy chart and PV percentage within 200ms.
- **FR-015**: All energy output values MUST be labelled with a tolerance disclaimer (indicatieve data, verificatie vereist).
- **FR-016**: All Step 2 control labels, option names, chart axis titles, legend labels, and the energie neutraliteit label MUST be in Dutch.
- **FR-017**: The Energie module MUST be additive — it MUST NOT break or replace any existing Material module output (CO2 chart, 3D viewer, CO2 metric, floor stepper, bouwmethodiek selector).
- **FR-018**: All energy calculations MUST flow through the existing `getImpact()` abstraction layer. No UI file may read energy lookup data directly.

### Key Entities

- **Step2Params**: The user's Step 2 configuration — balkons (one of three options), zonwering (one of three options), raamOppervlak (integer 30–80 in steps of 10), isolatieRc (3–8), luchtdichtheid (hoog/norm), liftEfficiency (zuinig/standaard). Stored in the central state store.
- **EnergyBreakdown**: The energy use per category for a given configuration — verwarming, koeling, ventilatie, verlichting, warmtapwater, lift, gebruikers, all in kWh/m²/year. Part of the ImpactResult.
- **EnergyScenario**: The complete set of energy values for all height scenarios (2–71 floors), used to pre-populate the stacked bar chart. Derived from the lookup table for the current configuration.
- **EnergyLookupTable**: Maps (installatie, step2Params combination) → EnergyBreakdown per floor/height range. Versioned, indicative values for Layer 1.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can change any Step 2 control and see the energy chart and PV percentage update within 200ms.
- **SC-002**: A user with no prior training can identify which energy category contributes most to total energy use at their current floor count within 2 minutes of first seeing the chart.
- **SC-003**: A user can identify the Step 2 setting change that most reduces energy use by exploring the controls, within 5 minutes, without documentation.
- **SC-004**: The energie neutraliteit percentage is always visible in the output panel alongside the CO2 material metric — a user comparing two scenarios can read both on one screen without scrolling.
- **SC-005**: The Energie module is fully functional on current stable versions of Chrome, Firefox, and Edge on desktop without any degradation to the existing Material module outputs.
- **SC-006**: All energy output values display the tolerance disclaimer; no value is presented as a precise figure without qualification.

---

## Assumptions

- Building footprint is fixed at 25×25m = 625m² GFA per floor and 625m² roof area. No variation in scope.
- Rooftop PV yield: 150 kWh/m²/year (Netherlands average irradiation). Effective PV coverage: 60% of roof area (accounting for structural constraints and ventilation spacing) = 375m² active panels. Annual PV production: 56,250 kWh.
- Energie neutraliteit % = (56,250 kWh) / (total energy kWh/m²/year × floors × 625m²) × 100, capped at 100%.
- Energy lookup data is manually approximated for Layer 1. Values represent order-of-magnitude estimates and MUST be verified with the team and cross-referenced against the source Excel before advisory use.
- Step 2 controls act as multipliers/offsets on the base energy scenario defined by installatie/energie (Step 1). The base scenario provides the dominant signal; Step 2 provides fine-tuning.
- Default Step 2 state on first load: balkons = buiten, zonwering = extern, raam oppervlak = 50%, isolatie = Rc 5 / Uglas 1.0 (mid-range), luchtdichtheid = norm, lift = standaard.
- The Energie module extends the existing platform. It does not replace, duplicate, or restructure any Material module component.
- No new 3D viewer changes are required for the Energie module core delivery. The facade.glsl shader groundwork exists for the raam oppervlak visual (Step 2 groundwork); wiring it is optional for this module.
- Floor-to-floor height is 3.5m (assumed, consistent with Material module).
- Gebruikers (occupants) energy is a fixed base load per m² GFA, independent of envelope choices.
