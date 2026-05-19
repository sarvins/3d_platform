# Feature Specification: CO2 Marginal Cost Bars

**Feature Branch**: `004-co2-marginal-bars`
**Created**: 2026-05-19
**Status**: Draft
**Module**: CO2 Material (001) — Layer 1 chart enhancement

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Marginal CO2 bars on the material chart (Priority: P1)

An urban design professional is looking at the CO2 vs. floor count chart and wants to understand not just the average CO2 per m² at a given height, but specifically how much CO2 each additional floor contributes. The average line already shows the cumulative picture; the professional wants to see the marginal cost — the CO2 "price" of adding one more floor — as vertical bars behind the existing lines. This makes threshold crossings (e.g. the elevator-induced spikes at floors 9, 16, 28, 38) immediately legible as sharp bar peaks, even before the user hovers or reads a number. Switching between bouwmethodiek scenarios updates the bars to reflect the selected scenario.

**Why this priority**: The marginal view is the primary new insight this feature delivers. It explains *why* the average CO2 curve has its shape — the spikes are caused by specific floors with very high marginal costs. This is the core advisory message of the chart. It can be implemented and demonstrated independently of any other change.

**Independent Test**: Open the platform at default settings (Business as usual). Observe the CO2 chart — bars are visible behind the average line, taller at threshold floors (9, 16, 28, 38) and lower in between. Switch bouwmethodiek to "Max innovatief" — bars update to reflect that scenario's marginal values. Switch back to "Business as usual" — bars revert. The average lines for all four scenarios remain unchanged and fully visible through the bars.

**Acceptance Scenarios**:

1. **Given** the platform is open at any bouwmethodiek setting, **When** the CO2 chart is visible, **Then** vertical bars are rendered behind the average CO2 lines, one bar per floor from 2 to 71.
2. **Given** the bars are visible, **When** the user inspects the chart, **Then** bars at threshold floors (9, 16, 28, 38) are visibly taller than bars at non-threshold floors in the same scenario, reflecting the spike in marginal CO2 cost.
3. **Given** the bars are visible, **When** the user selects a different bouwmethodiek, **Then** the bars update within 200ms to show the marginal costs for the newly selected scenario.
4. **Given** all four average lines are drawn, **When** bars are shown, **Then** all four lines remain fully visible — bars are rendered behind the lines and are semi-transparent so they do not obscure the line data.
5. **Given** the user hovers over a bar, **When** the chart tooltip appears, **Then** the tooltip shows both the marginal CO2 value for that floor and the average CO2 value, clearly labelled in Dutch.

---

### User Story 2 — CO2 data extended to floor 71 (Priority: P2)

The platform's floor stepper allows up to 71 floors, but the CO2 material lookup data currently only covers up to floor 50. For floors 51–71, the chart clamps to the floor 50 value — producing a flat, misleading line that implies no further CO2 increase. Extending the data to floor 71 corrects this: the chart and all CO2 outputs accurately reflect high-rise scenarios including the 5th elevator threshold at floor 71.

**Why this priority**: Without the data extension, the marginal bars for floors 51–71 would all be zero (no change from the clamped value), making US1 incomplete for the full floor range. US2 is a prerequisite for US1 to work correctly across the full range, but it can also be validated independently by checking that CO2 values change between floors 50 and 71.

**Independent Test**: Set floor count to 60. Verify the CO2 Materiaal metric card shows a value higher than at floor 50. Set floor count to 71. Verify CO2 value is higher still and reflects the 5th elevator threshold spike. Verify the snapshot tests still pass with the updated data.

**Acceptance Scenarios**:

1. **Given** the CO2 data is extended to floor 71, **When** the user sets the floor count to any value between 51 and 71, **Then** the CO2 Materiaal output shows a value that increases with floor count (not a flat line).
2. **Given** floor 71 is the 5th elevator threshold, **When** the user sets the floor count to 71, **Then** the CO2 value reflects a spike consistent with the threshold effect visible at floors 9, 16, 28, and 38.
3. **Given** the extended data, **When** all existing snapshot tests are run, **Then** all tests continue to pass — no regression in existing floor 2–50 values.

---

### Edge Cases

- What happens at floor 2 (minimum)? → Marginal bar for floor 2 = average[2] × 2 − average[1] × 1. Since floor 1 is not a valid input, the bar at floor 2 equals average[2] × 2 (treat floor 1 as having zero total CO2).
- What happens when bars are very tall at threshold floors? → Bars should not overflow the chart area; Chart.js handles this via the y-axis scale, which auto-scales to the maximum bar value. The y-axis scale MUST accommodate both line values and bar values.
- What happens when the user switches bouwmethodiek rapidly? → The chart updates to the last selected scenario; intermediate transitions are discarded gracefully.
- What happens at floor 71 where co2Material.json has a threshold spike? → The bar at floor 71 will be tall (high marginal cost due to elevator), matching the spike visible in the average line.
- What if the marginal value is negative (average decreases)? → Theoretically possible if the running average dips between control points. Negative bars should be rendered downward (below zero baseline) without clipping, and the y-axis should extend below zero if needed.

---

## Requirements *(mandatory)*

### Functional Requirements

**US1 — Marginal CO2 bars**

- **FR-001**: The CO2 material chart MUST display vertical bars for each floor from 2 to 71, showing the marginal CO2 cost of that floor in kg CO₂/m².
- **FR-002**: The marginal CO2 value for floor N MUST be calculated as: `average_co2[N] × N − average_co2[N−1] × (N−1)`, where `average_co2[N]` is the interpolated average CO2/m² for the currently selected bouwmethodiek at floor N.
- **FR-003**: Bars MUST be rendered behind (below in z-order) all four average CO2 lines.
- **FR-004**: Bars MUST be semi-transparent so the average lines remain clearly visible through them.
- **FR-005**: Bars MUST use the same colour as the currently selected bouwmethodiek's average line, at reduced opacity.
- **FR-006**: When the user changes bouwmethodiek, bars MUST update to reflect the marginal costs of the newly selected scenario within 200ms.
- **FR-007**: The chart tooltip MUST show both the marginal CO2 value and the average CO2 value for the hovered floor, labelled in Dutch.
- **FR-008**: The y-axis scale MUST auto-adjust to accommodate both the average line values and the bar values without clipping.
- **FR-009**: All four average CO2 lines MUST remain visible and unchanged when bars are added.

**US2 — Data extension to floor 71**

- **FR-010**: The CO2 material lookup data MUST include control points covering the full floor range 2–71 for all four bouwmethodiek scenarios.
- **FR-011**: CO2 values for floors 51–71 MUST increase monotonically (or spike at the floor 71 threshold) — they MUST NOT be flat or identical to the floor 50 value.
- **FR-012**: The floor 71 data point MUST reflect a threshold spike consistent with the 5th elevator effect, analogous to the spikes at floors 9, 16, 28, and 38.
- **FR-013**: All existing snapshot tests MUST continue to pass after the data extension — no floor 2–50 values may change.

### Key Entities

- **MarginalCO2Value**: The CO2 cost of adding one specific floor, in kg CO₂/m². Computed at runtime from the interpolated average CO2 data. Not stored — derived on demand from `co2Material.json` via the existing `getImpact()` interpolation.
- **ExtendedCO2LookupTable**: The updated `co2Material.json` with control points for floors 2–71 across all four bouwmethodiek scenarios. Versioned and git-tracked per constitution requirements.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time viewer can identify which floors have the highest marginal CO2 cost by reading the bar heights, within 30 seconds of seeing the chart, without explanation.
- **SC-002**: A professional can confirm that threshold floors (9, 16, 28, 38, 71) correspond to visibly taller bars than adjacent floors, across all four bouwmethodiek scenarios.
- **SC-003**: Switching bouwmethodiek updates both the active bar set and the existing average lines within 200ms — no visible lag.
- **SC-004**: All existing chart functionality (average lines, vertical floor marker, threshold annotations) remains fully intact after bars are added — zero regression.
- **SC-005**: CO2 values at floors 51–71 differ from the floor 50 value, correctly representing the continued increase in embodied carbon for high-rise buildings.

---

## Assumptions

- The marginal CO2 formula `average[N] × N − average[N-1] × (N-1)` matches the source Excel exactly. This was confirmed by reading the Excel formulas.
- Floor 1 is not a valid building scenario. The marginal value at floor 2 is computed as `average[2] × 2` (treating the floor 1 total as zero).
- The bar colour for each bouwmethodiek matches that scenario's existing line colour in the chart, at approximately 40% opacity. Exact opacity is a visual judgment to be finalised during implementation.
- Control point values for floors 51–71 are indicative Layer 1 estimates, extrapolated from the existing curve shape and threshold logic. They MUST be flagged with the existing tolerance disclaimer and verified with the team before advisory use.
- The floor 71 spike magnitude is proportional to the spikes at earlier elevator thresholds (floors 9, 16, 28, 38). Exact values to be confirmed during planning.
- Adding bars does not require a new data file. Marginal values are computed in the chart from interpolated average CO2 values already available via the existing calculation abstraction.
- The existing `getChartData()` export from `getImpact.js` provides the average CO2 values per floor per bouwmethodiek. This is sufficient to compute marginals — no new `getImpact()` signature change is needed.
- This feature is additive to the Material module chart only. No Energie module files, no Step 2 controls, and no 3D viewer files are changed.
