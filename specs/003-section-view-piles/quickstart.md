# Quickstart: Material Module — Floor Input, Consequence Panel & Section View

## Prerequisites

- Platform running via Live Server or `python -m http.server` (ES modules require HTTP)
- All 5 existing tests passing: `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js`

---

## Scenario 1 — US1: Direct floor input

**Goal**: Navigate from 10 to 38 floors in one interaction.

1. Open platform at default (10 floors)
2. Click on the floor number in the stepper
3. Clear the field and type `38`, press Enter
4. **Expected**: 3D model updates to 38 floors, CO2 chart marker moves to 38, elevator count shows 4, consequence panel updates — all within 200ms

**Edge case A — clamping:**
1. Click floor input, type `0`, press Enter
2. **Expected**: value corrects to `2`, model updates to 2 floors

**Edge case B — clamping high:**
1. Click floor input, type `99`, press Enter
2. **Expected**: value corrects to `71`, model updates to 71 floors

**Edge case C — non-numeric:**
1. Click floor input, type `abc`, press Enter
2. **Expected**: previous floor count is restored, no error shown

**Edge case D — coexistence:**
1. Type `20` and press Enter
2. Then click `+` three times
3. **Expected**: floor count goes from 20 to 23 correctly

---

## Scenario 2 — US2: Consequence panel and threshold flash

**Goal**: Observe persistent advisory text and visual flash on threshold crossing.

1. Open platform at 8 floors
2. **Expected**: Consequence panel shows "Geen lift vereist · Houten palen · Skeletbouw" (or equivalent Dutch text)
3. Click `+` to go to 9 floors
4. **Expected**: Consequence panel text changes to "1 lift vereist · Betonpalen (1e laag) · ..."  AND panel flashes amber/orange for ~1.5 seconds
5. Click `+` once more to 10 floors
6. **Expected**: Consequence text updates (floor count shown in stepper) but NO flash (still in same threshold zone — 1 elevator)
7. Navigate to 16 floors (via input or clicking)
8. **Expected**: Panel flashes again (2nd elevator threshold crossed), text updates to "2 liften vereist · ..."
9. Navigate back to 15 floors
10. **Expected**: Panel flashes again (threshold crossed downward), text reverts to "1 lift vereist · ..."

---

## Scenario 3 — US3: Section view with pile depth

**Goal**: Switch views and observe pile depth annotation.

1. Open platform at 8 floors in default 3D mode
2. Note pile cylinders visible below the building
3. Click "Front sectie" button in viewer area
4. **Expected**: View changes to flat orthographic front section. Building shows as a rectangular cross-section. Piles visible below grade. Background is near-white. Ground plane and grid are hidden. Pile depth annotation reads "Paaldiepte: ~7m" (approximate)
5. Click "Links sectie"
6. **Expected**: View rotates 90° to left-side section. Piles still visible. Same depth annotation.
7. Click "3D"
8. **Expected**: Orbital perspective view returns. Ground plane, grid, and blue background restored. OrbitControls active again.
9. While in "Front sectie", use the floor input to change to 28 floors
10. **Expected**: Section view updates — building is taller, piles are deeper. Annotation updates to "Paaldiepte: ~24m"
11. Continue to 71 floors
12. **Expected**: Annotation reads "Paaldiepte: ~60m". Fifth elevator is visible in 3D mode (switch back to check).

---

## Regression Checks

After all US3 implementation is complete:

1. Switch back to 3D mode — verify orbital controls still work (rotate, zoom, pan)
2. Change bouwmethodiek — verify CO2 chart still updates
3. Change installatie — verify energy chart still updates
4. Adjust Step 2 sliders — verify energy calculations still flow correctly
5. Run all 5 tests — must still pass with no changes to test assertions

---

## Known Limitation

Pile depth values are indicative (Layer 1 formula: `max(0.8, floors × 0.12) × 7`). The tilde (~) in the annotation signals this. Structural verification required before advisory use.
