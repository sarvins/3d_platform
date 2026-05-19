# Contract: Consequence Panel

**File**: `js/ui/step1Panel.js`
**Type**: DOM element + update logic within `updateOutputs()`

## HTML Structure

```html
<div id="consequence-panel" class="consequence-panel">
  <div class="consequence-label">Constructieve consequentie</div>
  <div id="consequence-text" class="consequence-text">—</div>
</div>
```

Placed in `initStep1Panel()` HTML, after `#out-structural` and before the tolerance disclaimer.

## Update contract (inside `updateOutputs(state, impact)`)

```javascript
// Build Dutch consequence text
const elevMap = {
  0: 'Geen lift vereist',
  1: '1 lift vereist',
  2: '2 liften vereist',
  3: '3 liften vereist',
  4: '4 liften vereist',
  5: '5 liften vereist — maximale hoogte',
};
const elevText  = elevMap[impact.structural.elevator_count] ?? '—';
const foundText = impact.structural.foundation_type ?? '—';
const stabText  = impact.structural.stability_system ?? '—';
document.getElementById('consequence-text').textContent =
  `${elevText} · ${foundText} · ${stabText}`;

// Flash on threshold crossing
if (impact.thresholds_crossed.length > 0) {
  const panel = document.getElementById('consequence-panel');
  panel.classList.remove('consequence-flash');          // reset if already animating
  void panel.offsetWidth;                              // force reflow to restart animation
  panel.classList.add('consequence-flash');
  setTimeout(() => panel.classList.remove('consequence-flash'), 1500);
}
```

## CSS contract

```css
.consequence-panel {
  margin-top: 10px;
  padding: 8px 10px;
  background: rgba(45,95,138,0.05);
  border-radius: 6px;
  font-size: 11px;
  border-left: 3px solid var(--blue-mid);
}
.consequence-label {
  font-weight: 600;
  color: var(--blue-mid);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.consequence-text {
  color: var(--blue-text);
  line-height: 1.4;
}
@keyframes consequenceFlash {
  0%   { background: rgba(184,92,0,0.18); border-left-color: #B85C00; }
  60%  { background: rgba(184,92,0,0.10); border-left-color: #B85C00; }
  100% { background: rgba(45,95,138,0.05); border-left-color: var(--blue-mid); }
}
.consequence-flash {
  animation: consequenceFlash 1.5s ease-out forwards;
}
```

## Invariants

- Text is always derived from `ImpactResult.structural` — never hard-coded
- Flash fires for threshold crossings in BOTH directions (up and down)
- Flash does NOT fire when the floor count changes within the same threshold zone
  (this is automatically handled because `thresholds_crossed` is empty when no zone change occurs)
- The panel is always visible — it does not appear/disappear

## Called by

- `js/ui/step1Panel.js` → `updateOutputs(state, impact)` — called on every store change via `main.js` subscribe
