import { getState, setState } from '../store.js';

const BOUWMETHODIEK = [
  { value: 'business_as_usual',      label: 'Business as usual' },
  { value: 'hoogwaardig_hybride',    label: 'Hoogwaardig hybride' },
  { value: 'best_practice_biobased', label: 'Best practice bio-based' },
  { value: 'max_innovatief',         label: 'Max innovatief' },
];

const INSTALLATIE = [
  { value: 'business_as_usual', label: 'Business as usual' },
  { value: 'high_tech',         label: 'High-tech installatie' },
  { value: 'natuurlijk',        label: 'Natuurlijk' },
];

const CORE_LABELS = {
  A: 'Variant A — 6×10m — 60m²',
  B: 'Variant B — 8×10m — 80m²',
  C: 'Variant C — 10×10m — 100m²',
  D: 'Variant D — 12×12m — 144m²',
  E: 'Variant E — 14×14m — 196m²',
};

// Pending dismiss timeouts per threshold field
const _dismissTimers = {};

export function initStep1Panel(container) {
  container.innerHTML = `
    <div class="panel-section">
      <div class="panel-section-title">Stap 1 — Scenario</div>

      <div class="control-group">
        <span class="control-label">Verdiepingen</span>
        <div class="floor-stepper">
          <button id="btn-minus" aria-label="Verdieping verwijderen">−</button>
          <input type="number" id="floor-display" class="floor-value" min="2" max="71" value="10">
          <button id="btn-plus" aria-label="Verdieping toevoegen">+</button>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Bouwmethodiek</span>
        <div class="radio-group" id="bouwmethodiek-group">
          ${BOUWMETHODIEK.map(o => `
            <label class="${o.value === 'business_as_usual' ? 'active' : ''}">
              <input type="radio" name="bouwmethodiek" value="${o.value}"
                ${o.value === 'business_as_usual' ? 'checked' : ''}>
              ${o.label}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Installatie / Energie</span>
        <div class="radio-group" id="installatie-group">
          ${INSTALLATIE.map(o => `
            <label class="${o.value === 'business_as_usual' ? 'active' : ''}">
              <input type="radio" name="installatie" value="${o.value}"
                ${o.value === 'business_as_usual' ? 'checked' : ''}>
              ${o.label}
            </label>
          `).join('')}
        </div>
      </div>
    </div>

    <hr class="divider">

    <div class="panel-section">
      <div class="panel-section-title">Resultaten</div>

      <div class="output-grid">
        <div class="metric-card">
          <div class="metric-label">CO₂ Materiaal</div>
          <div class="metric-value" id="out-co2">—</div>
          <span class="metric-unit">kg CO₂/m²</span>
        </div>
        <div class="metric-card">
          <div class="metric-label">Verdiepingen</div>
          <div class="metric-value" id="out-floors">10</div>
          <span class="metric-unit">lagen</span>
        </div>
        <div class="metric-card">
          <div class="metric-label">Kern</div>
          <div class="metric-value" style="font-size:13px;line-height:1.3" id="out-core">—</div>
          <span class="metric-unit">&nbsp;</span>
        </div>
        <div class="metric-card">
          <div class="metric-label">Liften</div>
          <div class="metric-value" id="out-elevators">—</div>
          <span class="metric-unit">aantal</span>
        </div>
        <div class="metric-card" style="grid-column:1/-1">
          <div class="metric-label">Energie neutraliteit (dak)</div>
          <div class="metric-value" id="out-pv">—</div>
          <span class="metric-unit" id="out-pv-unit">% via dakpanelen</span>
        </div>
      </div>

      <div class="structural-info" id="out-structural">
        <div class="si-row">
          <span class="si-label">Fundering</span>
          <span class="si-value" id="out-foundation">—</span>
        </div>
        <div class="si-row">
          <span class="si-label">Stabiliteit</span>
          <span class="si-value" id="out-stability">—</span>
        </div>
      </div>

      <div id="consequence-panel" class="consequence-panel">
        <div class="consequence-label">Constructieve consequentie</div>
        <div id="consequence-text" class="consequence-text">—</div>
      </div>

      <p class="tolerance-disclaimer">
        ±5–10 kg CO₂/m² (indicatieve data, brongrafiek)<br>
        Energie neutraliteit: indicatieve schatting — verificatie vereist.<br>
        Verificatie met team vereist voor adviesgebruik.
      </p>

      <div id="threshold-alerts"></div>
    </div>
  `;

  document.getElementById('btn-minus').addEventListener('click', () => {
    const { floors } = getState();
    if (floors > 2) setState({ floors: floors - 1 });
  });

  document.getElementById('btn-plus').addEventListener('click', () => {
    const { floors } = getState();
    if (floors < 71) setState({ floors: floors + 1 });
  });

  const floorInput = document.getElementById('floor-display');
  floorInput.addEventListener('change', e => {
    const { floors: prev } = getState();
    const parsed = parseInt(e.target.value);
    const clamped = isNaN(parsed) ? prev : Math.max(2, Math.min(71, Math.round(parsed)));
    e.target.value = clamped;
    setState({ floors: clamped });
  });

  document.querySelectorAll('input[name="bouwmethodiek"]').forEach(el => {
    el.addEventListener('change', e => setState({ bouwmethodiek: e.target.value }));
  });

  document.querySelectorAll('input[name="installatie"]').forEach(el => {
    el.addEventListener('change', e => setState({ installatie: e.target.value }));
  });
}

export function updateOutputs(state, impact) {
  document.getElementById('floor-display').value = state.floors;
  document.getElementById('out-floors').textContent = state.floors;
  document.getElementById('out-co2').textContent = impact.co2_material_kg_m2 ?? '—';
  document.getElementById('out-core').textContent = CORE_LABELS[impact.structural.core_variant] ?? '—';
  document.getElementById('out-elevators').textContent = impact.structural.elevator_count ?? '—';
  document.getElementById('out-foundation').textContent = impact.structural.foundation_type ?? '—';
  document.getElementById('out-stability').textContent = impact.structural.stability_system ?? '—';

  // Energie neutraliteit
  const pvEl = document.getElementById('out-pv');
  const pvUnit = document.getElementById('out-pv-unit');
  if (impact.energy_neutrality_pct != null) {
    if (impact.energy_is_positive) {
      pvEl.textContent = '100';
      pvUnit.textContent = '% — Energie positief 🌱';
    } else {
      pvEl.textContent = impact.energy_neutrality_pct;
      pvUnit.textContent = '% via dakpanelen';
    }
  } else {
    pvEl.textContent = '—';
  }

  // Consequence panel
  const elevMap = {
    0: 'Geen lift vereist', 1: '1 lift vereist', 2: '2 liften vereist',
    3: '3 liften vereist', 4: '4 liften vereist', 5: '5 liften vereist — maximale hoogte',
  };
  const elevText  = elevMap[impact.structural.elevator_count] ?? '—';
  const foundText = impact.structural.foundation_type ?? '—';
  const stabText  = impact.structural.stability_system ?? '—';
  document.getElementById('consequence-text').textContent = `${elevText} · ${foundText} · ${stabText}`;
  if (impact.thresholds_crossed.length > 0) {
    const panel = document.getElementById('consequence-panel');
    panel.classList.remove('consequence-flash');
    void panel.offsetWidth;
    panel.classList.add('consequence-flash');
    setTimeout(() => panel.classList.remove('consequence-flash'), 1500);
  }

  // Highlight active bouwmethodiek radio label
  document.querySelectorAll('#bouwmethodiek-group label').forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('active', input && input.value === state.bouwmethodiek);
  });

  // Highlight active installatie radio label
  document.querySelectorAll('#installatie-group label').forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('active', input && input.value === state.installatie);
  });

  // Advisory callouts for threshold crossings
  const alertsEl = document.getElementById('threshold-alerts');
  if (impact.thresholds_crossed.length > 0) {
    for (const event of impact.thresholds_crossed) {
      // Clear any pending dismiss for this field
      if (_dismissTimers[event.field]) {
        clearTimeout(_dismissTimers[event.field]);
        delete _dismissTimers[event.field];
      }
      // Remove existing callout for this field
      const existing = alertsEl.querySelector(`[data-field="${event.field}"]`);
      if (existing) existing.remove();

      const div = document.createElement('div');
      div.className = 'threshold-alert';
      div.dataset.field = event.field;
      div.textContent = event.label;
      alertsEl.appendChild(div);

      _dismissTimers[event.field] = setTimeout(() => {
        div.remove();
        delete _dismissTimers[event.field];
      }, 3000);
    }
  }
}
