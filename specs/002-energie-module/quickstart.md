# Quickstart: Energie Module

**Branch**: `002-energie-module`
**Prerequisite**: Material module (001-co2-material-module) fully implemented and passing all tests.

---

## Run the platform

Same as Material module — open via VS Code Live Server or `npx serve .`.
No additional setup required.

---

## What's new on load

After the Energie module is implemented, the platform shows:
- **Step 2 section** in the left panel (below the existing bouwmethodiek selector): balkons radio buttons, zonwering radio buttons, raam oppervlak slider, isolatie slider, luchtdichtheid toggle, lift rendement toggle.
- **Energie neutraliteit** percentage in the output panel (previously shown as "—").
- **Energy breakdown chart** in a new tab or below the CO2 chart (layout decision in tasks).

---

## Try it

1. **Change installatie (Step 1)** — switch from "Business as usual" to "Natuurlijk". Verify the energy chart redraws with lower total energy use.
2. **Switch zonwering** — change from "Extern" to "Intern". Verify the koeling (cooling) bar in the energy chart increases.
3. **Move raam oppervlak slider** from 50% to 80%. Verify verwarming and koeling bars increase (more glazing = more heat loss/gain).
4. **Move isolatie slider** to maximum (Rc 8 / Uglas 0.80). Verify verwarming bar decreases and energie neutraliteit % increases.
5. **Switch lift rendement** to "Zuinig". Verify the lift bar in the energy chart decreases.
6. **Add floors to 71** (max). Verify energie neutraliteit % drops significantly (large building, fixed roof).
7. **Set floors to 2** (min). Verify energie neutraliteit % is at or near 100% / "Energie positief".

---

## Run the tests

Existing tests (all must still pass):
```bash
node tests/thresholdIntegrity.js
node tests/dataVersion.js
node tests/getImpactSnapshot.js
node tests/abstractionBoundary.js
```

New Energie module test:
```bash
node tests/energySnapshot.js
```

---

## Update energy data

If energy base values need adjusting (after team verification):

1. Edit `data/energyData.json` — update values in `base` or `adjustments`.
2. Bump `data_version` consistently across all three data files (`thresholds.json`, `co2Material.json`, `energyData.json`).
3. Update expected values in `tests/energySnapshot.js`.
4. Run all 5 tests and verify all pass.
5. Commit: `data: update energy lookup values to vX.Y.Z`.

---

## Known limitations (Layer 1)

- Energy values are manually approximated order-of-magnitude estimates. Must be verified against source Excel before advisory use.
- Step 2 adjustment factors are multiplicative simplifications — real energy interactions are non-linear.
- Gebruikers (occupant) energy is a fixed base load, not adjusted by any Step 2 parameter.
- CO2 equivalent of energy use (kg CO2 per kWh) is not yet calculated — that depends on energy mix, which is out of scope for Layer 1.
