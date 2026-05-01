# Feature Specification: CO2 Material Module

**Feature Branch**: `001-co2-material-module`
**Created**: 2026-05-01
**Status**: Draft
**Module**: Material (CO2 section) — Layer 1

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Explore CO2 impact by floor count (Priority: P1)

An urban design professional opens the platform and adjusts the number of floors on a standard residential tower. As they increase or decrease floors, all outputs — the CO2 material figure, the 3D building model, and the chart position marker — update immediately. They can see that CO2 per m² is not linear: high for very low buildings, drops to a minimum around 8–12 floors, then rises as structural complexity increases.

**Why this priority**: This is the core interaction. Without a reactive floor count control and live CO2 output, nothing else delivers value. This story alone constitutes a viable MVP.

**Independent Test**: Set floor count to 5, record CO2 value. Set to 12, record. Set to 30, record. Verify the 12-floor value is the lowest of the three. Verify the 3D model height changes visibly at each setting.

**Acceptance Scenarios**:

1. **Given** the platform is open at the default floor count (10), **When** the user clicks "+", **Then** floor count increments by 1, CO2 value updates, the 3D model adds a floor, and the chart marker moves — all within 200ms.
2. **Given** floor count is 2 (minimum), **When** the user clicks "−", **Then** the floor count does not decrease below 2.
3. **Given** floor count is 71 (maximum), **When** the user clicks "+", **Then** the floor count does not increase above 71.
4. **Given** any floor count, **When** the CO2 output is displayed, **Then** a tolerance disclaimer (±5–10 kg CO2/m², illustrative data) is visible alongside the value.

---

### User Story 2 — Compare construction methodologies (Priority: P2)

An urban design professional selects different bouwmethodiek options and observes how the CO2 material impact changes. The chart always shows all three principal scenario lines simultaneously, allowing the professional to understand the range of outcomes and the benefit of choosing a less carbon-intensive approach — without switching views.

**Why this priority**: The methodology comparison is the primary advisory value of the module. A single-number view is informative; a comparative view is decision-support.

**Independent Test**: Select "Business as usual" at 20 floors, record CO2. Select "Best practice bio-based" at 20 floors, record CO2. Verify bio-based value is lower. Verify the chart continues to show three lines regardless of the selected methodology.

**Acceptance Scenarios**:

1. **Given** the user selects "Business as usual", **When** viewing the CO2 metric at any floor count, **Then** the value is higher than the value shown for "Best practice bio-based" at the same floor count.
2. **Given** the user selects "Best practice bio-based", **When** viewing the CO2 metric, **Then** the value is lower than both "Business as usual" and "Hoogwaardig hybride" at the same floor count.
3. **Given** the chart is displayed, **When** any bouwmethodiek is selected, **Then** all three principal scenario lines (conventioneel, hybride, biobased) remain visible simultaneously.

---

### User Story 3 — Understand structural threshold consequences (Priority: P3)

An urban design professional increases floor count past a structural threshold (e.g. the 9th floor triggers the first elevator). An advisory callout appears, naming what changed and why. The 3D model simultaneously shows the new elevator shaft appearing inside the core. The professional understands, without explanation, that this floor added disproportionate CO2 cost.

**Why this priority**: This is the advisory positioning layer — making structural complexity legible to non-engineers. Without it the tool shows numbers; with it, it shows consequences.

**Independent Test**: Start at 8 floors, click "+" to reach 9. Verify advisory callout appears and names the threshold event. Verify callout is visible for at least 3 seconds. Verify the 3D model shows a new elevator shaft. Verify the CO2 value at floor 9 is higher than at floor 8.

**Acceptance Scenarios**:

1. **Given** floor count crosses an elevator threshold upward, **When** the new floor count is displayed, **Then** an advisory callout naming the threshold event appears within 500ms.
2. **Given** floor count crosses a threshold upward, **When** the 3D model updates, **Then** the structural change (elevator shaft, pile depth, core size) is visibly different from the previous state.
3. **Given** floor count crosses a threshold downward, **When** the model updates, **Then** the advisory callout describes what was removed (not added), if applicable.
4. **Given** the user rapidly clicks "+" through multiple thresholds, **When** clicking stops, **Then** only the final structural state is shown — no stacked or queued callouts from intermediate states.

---

### Edge Cases

- What happens when floor count is set to exactly a threshold value (e.g. floor 9)?
  → The threshold is triggered; the output reflects the post-threshold structural state.
- How does the system handle rapid repeated clicks?
  → Outputs reflect only the final state; intermediate states do not accumulate or queue.
- What is shown for "Max innovatief" on the chart?
  → "Max innovatief" is a fourth bouwmethodiek option available in the input panel. Its CO2 metric value is shown in the output panel. The chart plots only the three principal lines (conventioneel, hybride, biobased) — "Max innovatief" is not added as a fourth chart line in Layer 1.
- What is shown for the "brand" (fire safety) CO2 component?
  → Brand is excluded from Layer 1. The output panel shows a placeholder or TBD note where the brand component would appear. The calculation method is not yet confirmed.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the CO2 material impact in kg CO2/m² for the current floor count and selected bouwmethodiek, updating reactively without page reload.
- **FR-002**: The system MUST allow users to set floor count between 2 and 71 using a + / − stepper control.
- **FR-003**: The system MUST offer four bouwmethodiek options: Business as usual, Hoogwaardig hybride, Best practice bio-based, Max innovatief.
- **FR-004**: The system MUST display a chart showing CO2 material impact (kg CO2/m²) vs floor count (2–50) for the three principal scenarios (conventioneel, hybride, biobased) simultaneously at all times.
- **FR-005**: The system MUST indicate the user's current floor count on the chart with a visible marker.
- **FR-006**: The system MUST display an advisory callout when a structural threshold is crossed (elevator step-up, foundation depth change, core variant change, stability system activation).
- **FR-007**: The system MUST show the active core variant (label A–E, dimensions in metres, net area in m²) in the output panel.
- **FR-008**: The system MUST show the active elevator count, foundation type, and stability system description in the output panel.
- **FR-009**: The system MUST display a 3D abstract parametric model of the tower that updates reactively as floor count changes.
- **FR-010**: The 3D model MUST show foundation piles that visibly increase in depth as floor count increases.
- **FR-011**: The 3D model MUST show elevator shaft geometry appearing or disappearing when the elevator count changes at threshold crossings.
- **FR-012**: The 3D model MUST update the core geometry (size) when the core variant changes at a threshold crossing.
- **FR-013**: All CO2 output values MUST be labelled with a tolerance disclaimer (±5–10 kg CO2/m², illustrative data).
- **FR-014**: All structural decisions (core variant, foundation type, elevator count, stability system) MUST be derived automatically from floor count. Users MUST NOT be able to manually override these values.
- **FR-015**: The system MUST be accessible in a standard desktop browser without installation, login, or account creation.
- **FR-016**: The 3D model MUST carry a persistent visible label identifying it as a parametric preview, not a design environment.

### Key Entities

- **TowerConfiguration**: The user's current input state — floor count (integer, 2–71) and bouwmethodiek (one of four options). This is the sole input to the calculation layer.
- **ImpactResult**: The computed output for a given TowerConfiguration — includes co2_material_kg_m2, structural state (core_variant, elevator_count, foundation_type, stability_system), thresholds_crossed (list of threshold events), data_version, and tolerance_note.
- **ThresholdEvent**: A structural step-change triggered by a floor count crossing — includes a human-readable label, the affected structural parameter, and the direction of change (up or down). Drives both advisory callouts and 3D model updates.
- **LookupTable**: Maps floor count to co2_material_kg_m2 per bouwmethodiek. Versioned, illustrative values read from source graphs (Layer 1). Replaced by a calculation engine in a later layer.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can change floor count and see all outputs (CO2 metric, 3D model, chart marker) update within 200ms on a standard laptop with a current desktop browser.
- **SC-002**: A user with no prior training can identify the floor count range with the lowest CO2 impact within 2 minutes of first opening the platform, without reading any documentation.
- **SC-003**: Advisory callouts appear within 500ms of a threshold crossing and remain visible for at least 3 seconds without further user interaction.
- **SC-004**: The platform is fully functional on current stable versions of Chrome, Firefox, and Edge on desktop.
- **SC-005**: A colleague shown only the CO2 chart can correctly identify which construction methodology produces the lowest embodied CO2 at 20 floors, without verbal explanation.
- **SC-006**: Every CO2 output value displayed carries the tolerance disclaimer; no value is presented as a precise figure without qualification.

---

## Assumptions

- Building footprint is fixed at 25×25m = 625 m² GFA per floor. No footprint variation is in scope for this module.
- Lookup table values are approximate (±5–10 kg CO2/m² per component), manually read from the source PowerPoint graphs. These are the best available data for Layer 1 and must be verified with the team before the lookup table is finalised.
- Structural threshold floor counts used in Layer 1: 1st elevator at 9 floors, 2nd elevator at ~16 floors (assumed), 3rd elevator at 28 floors, 4th elevator at ~38 floors (assumed). These must be confirmed with the team.
- Floor-to-floor height is assumed at 3.5m for any height-based display or conversion. To be confirmed from structural source data.
- The 3D model is a schematic parametric diagram — it responds to user inputs but does not accept geometric input. Users cannot draw, move, or resize any geometry.
- No session state is persisted between page loads. Refreshing the browser resets all inputs to their defaults.
- No user authentication, analytics, or tracking is in scope for Layer 1.
- "Max innovatief" is available as a bouwmethodiek input but is not plotted as a fourth chart line in Layer 1. Its CO2 metric value is shown in the output panel only.
- Brand (fire safety CO2) component is excluded from Layer 1 outputs. A placeholder is shown where it would appear. The calculation method must be confirmed before Layer 2.
- Users are urban design professionals or collaborators accessing the platform on a desktop device with a stable internet connection.
