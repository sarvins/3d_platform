# Quickstart: CO2 Marginal Cost Bars

## Prerequisites

- Platform running via Live Server (ES modules require HTTP)
- All 5 tests passing before starting

---

## Scenario 1 — US2: Data extended to floor 71

**Goal**: Verify CO2 values no longer clamp at floor 50.

1. Open platform at default (10 floors, Business as usual)
2. Use floor input to set floors to 60
3. **Expected**: CO2 Materiaal card shows a value higher than at floor 50 (248 kg CO₂/m² for BAU). Should be approximately 270–272 kg CO₂/m²
4. Set floors to 71
5. **Expected**: CO2 value shows a spike — approximately 328 kg CO₂/m² for BAU, visibly higher than at floor 70 (~295)
6. Run all 5 tests: `node tests/thresholdIntegrity.js && node tests/dataVersion.js && node tests/getImpactSnapshot.js && node tests/abstractionBoundary.js && node tests/energySnapshot.js`
7. **Expected**: All 5 pass

---

## Scenario 2 — US1: Marginal bars visible at default settings

**Goal**: Verify bars appear behind lines at all floor counts.

1. Open platform at default (10 floors, Business as usual)
2. Observe the CO2 chart
3. **Expected**: Vertical bars are visible behind the 3 average lines. Bars are red-tinted (BAU colour), semi-transparent. The bar at floor 9 is visibly taller than bars at floors 7, 8, 10, 11 — the spike from the first elevator is visible
4. Similarly, bars at floors 16, 28, 38, 71 should be visibly taller than their neighbours

---

## Scenario 3 — US1: Bars update on bouwmethodiek change

**Goal**: Verify reactivity.

1. Open platform, observe bars (red-tinted, Business as usual)
2. Select "Hoogwaardig hybride" bouwmethodiek
3. **Expected**: Bars change to blue-tinted (hybride colour) within 200ms. Bar heights change to reflect hybride marginal costs (generally lower absolute values). The 3 average lines remain unchanged
4. Select "Best practice bio-based"
5. **Expected**: Bars change to green-tinted. Heights change again
6. Select "Business as usual"
7. **Expected**: Bars return to red-tinted

---

## Scenario 4 — Tooltip

**Goal**: Verify tooltip shows both values.

1. Open platform at Business as usual
2. Hover over a bar on the chart (e.g. around floor 9)
3. **Expected**: Tooltip shows:
   - `Marginale CO₂: X kg CO₂/m²` (for the bar)
   - `Conventioneel: Y kg CO₂/m²` (for the BAU line)
   - `Hybride: Z kg CO₂/m²` (for the hybride line)
   - `Biobased: W kg CO₂/m²` (for the biobased line)

---

## Scenario 5 — Y-axis auto-scaling

**Goal**: Verify tall bars at spike floors are not clipped.

1. Open platform, switch to "Business as usual"
2. Observe the y-axis maximum — it should accommodate both the average line peak (~328 at floor 71) and the marginal bars
3. The chart should not show any bars cut off at the top edge

---

## Regression Checks

After full implementation:
1. All 4 average lines still visible
2. Floor marker (vertical dashed line) still moves with floor count
3. Threshold annotations (1e lift, 2e lift, 3e lift, 4e lift, 5e lift) all visible
4. All 5 tests still pass
5. Energy chart and all Step 2 controls unchanged
