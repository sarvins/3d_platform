# Contract: step2Panel.js

**File**: `js/ui/step2Panel.js`
**Role**: Renders Step 2 controls in the panel below Step 1. Writes to store only via `setState({ step2: {...} })`. Never reads data directly.

---

## API

### initStep2Panel(container) → void

Appends the Step 2 section HTML to `container` (the `#panel` aside element). Wires all control change handlers.

```javascript
initStep2Panel(document.getElementById('panel'))
```

**Rendered controls (all labels in Dutch):**

| Control | Type | Dutch label | Options / Range |
|---|---|---|---|
| Balkons | 3-option radio | "Balkons" | Buiten / Binnen / Gevellijn |
| Zonwering | 3-option radio | "Zonwering" | Extern / Intern / Zonwerend glas |
| Raam oppervlak | Range slider (step 10) | "Raam oppervlak" | 30%–80%; displays current % |
| Isolatie | Range slider (step 1, positions 0–5) | "Isolatie" | Displays Rc and Uglas values |
| Luchtdichtheid | 2-option toggle | "Luchtdichtheid" | Hoog / Norm |
| Lift | 2-option toggle | "Lift rendement" | Zuinig / Standaard |

Each control on change calls:
```javascript
setState({ step2: { [field]: newValue } })
```

The store deep-merges the partial `step2` update, preserving other step2 fields.

---

## Constraints

- `step2Panel.js` MUST NOT import from `data/` directly.
- `step2Panel.js` MUST NOT maintain local state — all state lives in `store.js`.
- `step2Panel.js` MUST NOT call `getImpact()` — that is `main.js`'s responsibility.
- The energie neutraliteit percentage and energy breakdown values are displayed in the **Step 1 output panel** (already managed by `step1Panel.js`), not in `step2Panel.js`. Step 2 panel is inputs only.
- All text visible to the user MUST be in Dutch. The tolerance disclaimer is in English (per constitution FR-017 equivalent).
