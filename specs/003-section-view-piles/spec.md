# Feature Specification: Material Module — Floor Input, Consequence Panel & Section View

**Feature Branch**: `003-section-view-piles`
**Created**: 2026-05-19
**Status**: Draft
**Module**: CO2 Material (001) — Layer 1 enhancements

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Direct floor number input (Priority: P1)

An urban design professional is using the floor stepper to explore scenarios. Currently they can only increment or decrement one floor at a time using the + and − buttons. When jumping from 10 floors to 38 floors, clicking 28 times is impractical. The professional wants to type the floor number directly into the display field and see the model and charts update immediately.

**Why this priority**: A quick usability improvement with no dependencies. Alone it already saves significant time for users jumping between extreme scenarios. Does not require any other story to be implemented first.

**Independent Test**: Open the platform. Click on the floor number display. Type "38" and press Enter. Verify the 3D model, CO2 chart marker, and all output metrics update to reflect 38 floors. Type a value outside the valid range (e.g. 0 or 100) — verify the value is clamped to the allowed range (2–71) without an error state.

**Acceptance Scenarios**:

1. **Given** the platform is open, **When** the user clicks the floor number display and types a number between 2 and 71, **Then** all outputs update to reflect that floor count within 200ms of confirmation (Enter or focus loss).
2. **Given** a typed value below 2, **When** the user confirms, **Then** the value is clamped to 2 and outputs update accordingly.
3. **Given** a typed value above 71, **When** the user confirms, **Then** the value is clamped to 71 and outputs update accordingly.
4. **Given** the user types a non-numeric value, **When** the user confirms, **Then** the previous valid floor count is restored and no error is shown.
5. **Given** the user types a floor number and then uses the + or − buttons, **Then** both interaction modes work together correctly without conflict.

---

### User Story 2 — Consequence panel with threshold flash (Priority: P2)

An urban design professional adjusts the floor count and wants to immediately understand what structural or cost consequence that change implies — specifically when a design decision crosses a threshold (e.g. triggering a 2nd elevator). Currently the threshold alert appears briefly and disappears, and the chart shows the impact, but there is no persistent advisory text that explains the current design state in plain language. The professional wants a visible consequence panel in the output section that always shows the current design consequence, and a brief visual flash when a threshold is crossed.

**Why this priority**: Directly increases the advisory value of the platform. The consequence panel builds on the existing threshold system without requiring the 3D section view. Can be implemented and demonstrated independently.

**Independent Test**: Open the platform at 8 floors. The consequence panel shows text describing the current state (no elevator required, shallow foundation). Increase floors to 9 — the consequence panel text changes to describe the first elevator threshold and the panel briefly flashes in amber/orange for approximately 1.5 seconds, then returns to normal. Increase to 16 — same flash occurs for the second elevator. Decrease from 9 to 8 — verify the panel reverts to the lower-threshold state description with a flash.

**Acceptance Scenarios**:

1. **Given** the platform is open at any floor count, **When** the consequence panel is visible, **Then** it shows a Dutch text summary of the current design state: elevator count and reason, foundation type, and stability system.
2. **Given** the floor count crosses a threshold in either direction (up or down), **When** the consequence text updates, **Then** the panel displays a brief colour flash (amber/orange) lasting approximately 1.5 seconds, then returns to its normal styling.
3. **Given** the floor count moves within the same threshold zone (e.g. 10→11, both requiring 1 elevator), **When** the consequence text updates, **Then** no colour flash occurs.
4. **Given** the consequence panel is always visible, **When** the user scrolls or interacts with other controls, **Then** the panel remains in the output section and does not require scrolling to find.
5. **Given** the user decreases floors and crosses a threshold downward (e.g. 9→8), **When** the consequence text updates, **Then** the flash also occurs to signal the reversal.

---

### User Story 3 — Section view with pile depth (Priority: P3)

An urban design professional wants to show a client the structural consequence of adding floors — specifically how the foundation piles grow deeper as the building height increases. The current 3D perspective view shows the piles as cylinders under the building but the depth is hard to read. The professional wants to switch between a 3D perspective view and two section views (front section, left section) that clearly show the pile depth relative to the building height.

**Why this priority**: The largest new feature. Adds significant advisory value for foundation conversations with clients. Can be developed independently of US1 and US2.

**Independent Test**: Open the platform at 8 floors. Use the view toggle in the viewer area to switch to "Front sectie" — the viewer changes to a flat front-facing cut view showing building floors above grade and piles extending below grade with a depth label. Switch to "Links sectie" — same view from the perpendicular axis. Switch back to "3D" — the orbital perspective returns. Increase floors to 28 — observe that pile depth increases visually in section view. Verify depth annotation is legible in both section views.

**Acceptance Scenarios**:

1. **Given** the viewer is in default 3D mode, **When** the user selects "Front sectie", **Then** the viewer switches to a flat orthographic front section showing the building above grade and the piles below grade.
2. **Given** the viewer is in section view, **When** the user selects "Links sectie", **Then** the viewer rotates 90 degrees to show the left-side cross-section.
3. **Given** the viewer is in any section view, **When** the user selects "3D", **Then** the viewer returns to the orbital perspective view.
4. **Given** the section view is active and the floor count changes, **When** the model updates, **Then** both the building height and pile depth update within 200ms.
5. **Given** the pile depth increases due to a threshold crossing, **When** the section view is active, **Then** the deeper piles are clearly visible and the depth change is perceptible without explanation.
6. **Given** the section view is active, **When** the viewer renders, **Then** a depth annotation shows the approximate pile depth in metres, legible without tooltip interaction.

---

### Edge Cases

- What happens when the user types a floor number while the view is in section mode? → Both section geometry and 3D geometry update; no mode reset occurs.
- What happens if the pile depth annotation overlaps with the building geometry? → The annotation is placed below grade or alongside the pile group, outside the building silhouette.
- What happens when the consequence panel text is long for complex threshold states? → Text wraps within the panel; panel height adjusts; no content is clipped.
- What happens when the user switches view modes rapidly? → The viewer shows the last selected mode; intermediate transitions are discarded gracefully.
- What happens when a typed floor value is a decimal (e.g. 9.5)? → Value is rounded to the nearest integer within range.
- What happens when the floor count is at the minimum (2) and the user presses −? → Value stays at 2; no change.

---

## Requirements *(mandatory)*

### Functional Requirements

**US1 — Floor input**

- **FR-001**: The floor number display MUST accept direct keyboard input in addition to the + and − buttons.
- **FR-002**: On confirmation (Enter key or loss of focus), the floor count MUST update and all outputs MUST refresh within 200ms.
- **FR-003**: Values entered outside the valid range (2–71) MUST be clamped silently to the nearest boundary. No error message is shown.
- **FR-004**: Non-numeric input MUST be rejected silently and the previous valid floor count MUST be restored.

**US2 — Consequence panel**

- **FR-005**: A consequence panel MUST be permanently visible in the output section of the left panel, below the metric cards and structural info block.
- **FR-006**: The consequence panel MUST display, in Dutch, the current design consequence: elevator count, foundation type, and stability system.
- **FR-007**: When the floor count crosses a threshold in either direction, the consequence panel MUST display a colour flash in amber/orange lasting approximately 1.5 seconds, then return to normal styling.
- **FR-008**: The colour flash MUST only occur when a threshold is actually crossed — not when the floor count changes within the same threshold zone.
- **FR-009**: The consequence panel MUST derive its state from the existing `getImpact()` output and MUST NOT duplicate threshold logic.

**US3 — Section view**

- **FR-010**: The viewer MUST offer a three-option view toggle: "3D", "Front sectie", "Links sectie". Default is "3D".
- **FR-011**: In "Front sectie" mode the viewer MUST render an orthographic front cross-section showing the building above grade and foundation piles below grade.
- **FR-012**: In "Links sectie" mode the viewer MUST render an orthographic left-side cross-section showing the same elements from the perpendicular axis.
- **FR-013**: Both section views MUST display a depth annotation showing the approximate pile depth in metres.
- **FR-014**: The view toggle MUST be located in or directly adjacent to the viewer area, not in the left control panel.
- **FR-015**: Switching view modes MUST NOT reset any parameter in the central store (floor count, bouwmethodiek, installatie, Step 2 values).
- **FR-016**: The 3D orbital controls (rotate, zoom, pan) MUST remain fully functional in "3D" mode. Section views use a fixed orthographic camera with no user rotation.
- **FR-017**: All view toggle labels and section view annotations MUST be in Dutch.

### Key Entities

- **ViewMode**: The currently selected viewer display mode — one of: `3d`, `front_sectie`, `links_sectie`. UI-only state, not stored in the central calculation store.
- **ConsequenceState**: Human-readable description of the current design consequence derived from ImpactResult — elevator count, foundation type, stability system, and whether a threshold was just crossed.
- **PileDepthAnnotation**: A text label in the section view indicating the pile depth in metres for the current floor count and foundation type.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate from 10 floors to any target floor count in a single interaction using direct text input, instead of repeated button clicks.
- **SC-002**: A first-time viewer can identify the current elevator count and foundation type by reading the consequence panel alone, within 30 seconds of opening the platform.
- **SC-003**: A first-time viewer notices that adding one floor caused a structural consequence change — without being told to look for it — within 5 seconds of the threshold crossing, due to the colour flash.
- **SC-004**: In section view, a first-time viewer can estimate the approximate pile depth relative to building height without tooltip interaction, within 1 minute of switching to section mode.
- **SC-005**: All three stories together MUST NOT break or degrade any existing Material module or Energie module output — CO2 chart, energy chart, all metric cards, and all Step 2 controls remain fully functional.

---

## Assumptions

- The pile geometry already exists in the 3D viewer (cylinder meshes under the building). Section view will render these same geometries from a fixed orthographic camera — no new pile data model is required.
- Pile depth values are derived from the existing foundation type logic in `getImpact()`. Approximate depths: shallow foundation ~8m, medium piles ~15m, deep piles ~25m. Exact values to be confirmed with the team during planning.
- The view toggle is UI-only state and does not affect any calculation. The central store (`store.js`) is not modified for this feature.
- The consequence panel provides persistent display of current structural state. The existing temporary threshold alert pop-ups may coexist with the consequence panel; whether to remove them is deferred to planning.
- Section views use a fixed orthographic camera. Users cannot pan or rotate in section mode — the view is fixed to show the full building and pile depth clearly.
- The colour flash in the consequence panel reuses the existing amber/orange alert colour already defined in the platform CSS (`#B85C00`).
- "Front sectie" looks at the building from the front face. "Links sectie" looks from the left face. Exact camera axes to be confirmed during planning.
- This feature is strictly additive to Module 001. No Energie module files (step2Panel.js, energyChart.js, energyData.json) are changed.
