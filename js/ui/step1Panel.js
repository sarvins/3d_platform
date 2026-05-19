import { getState, setState } from '../store.js';

const BOUWMETHODIEK = [
  { value: 'business_as_usual',      label: 'Business as usual',       delta: 'ref.' },
  { value: 'hoogwaardig_hybride',    label: 'Hoogwaardig hybride',      delta: '−28%' },
  { value: 'best_practice_biobased', label: 'Best practice bio-based',  delta: '−52%' },
  { value: 'max_innovatief',         label: 'Max innovatief',           delta: '−71%' },
];

const INSTALLATIE = [
  { value: 'business_as_usual', label: 'Business as usual'     },
  { value: 'high_tech',         label: 'High-tech installatie' },
  { value: 'natuurlijk',        label: 'Natuurlijk'            },
];

const CORE_DATA = {
  A: { area: 60,  desc: '6×10 m' },
  B: { area: 80,  desc: '8×10 m' },
  C: { area: 100, desc: '10×10 m' },
  D: { area: 144, desc: '12×12 m' },
  E: { area: 196, desc: '14×14 m' },
};

const ELEV_DESC = {
  0: 'geen lift', 1: '1 personenlift', 2: '2 liften',
  3: '3 liften', 4: '4 liften', 5: '5 liften — max',
};

function consequenceLevel(floors) {
  if (floors <= 6)  return 'I';
  if (floors <= 15) return 'II';
  if (floors <= 28) return 'III';
  if (floors <= 45) return 'IV';
  return 'V';
}

function gaugePath(pct) {
  const cl = Math.max(0, Math.min(100, pct));
  const r = 26, cx = 32, cy = 32;
  const angle = Math.PI * (1 - cl / 100);
  const ex = cx + r * Math.cos(angle);
  const ey = cy - r * Math.sin(angle);
  const large = cl > 50 ? 1 : 0;
  return { d: `M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`, ex, ey };
}

const _dismissTimers = {};

export function initStep1Panel(container) {
  container.innerHTML = `
    <div class="section-header">
      <h2><span style="color:var(--c-mid);margin-right:6px">Stap 1 —</span>Scenario</h2>
    </div>
    <div class="section-body">

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Aantal verdiepingen</span>
          <span class="val" id="floor-count-val">10<span style="color:var(--c-muted);font-weight:400;margin-left:4px">/ 71</span></span>
        </div>
        <div class="stepper">
          <button id="btn-minus" aria-label="Verdieping verwijderen">−</button>
          <input type="number" id="floor-display" class="floor-value" min="2" max="71" value="10">
          <button id="btn-plus" aria-label="Verdieping toevoegen">+</button>
        </div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Bouwmethodiek</span>
          <span style="font-size:10px;color:var(--c-muted)">CO₂ materiaal</span>
        </div>
        <div class="radio-group" id="bouwmethodiek-group">
          ${BOUWMETHODIEK.map(o => `
            <label class="opt${o.value === 'business_as_usual' ? ' sel' : ''}">
              <input type="radio" name="bouwmethodiek" value="${o.value}"
                ${o.value === 'business_as_usual' ? 'checked' : ''} style="display:none">
              <span class="dot"></span>
              <span class="name">${o.label}</span>
              <span class="delta">${o.delta}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Installatie / Energie</span>
          <span style="font-size:10px;color:var(--c-muted)">kWh / m²·jr</span>
        </div>
        <div class="radio-group" id="installatie-group">
          ${INSTALLATIE.map(o => `
            <label class="opt${o.value === 'business_as_usual' ? ' sel' : ''}">
              <input type="radio" name="installatie" value="${o.value}"
                ${o.value === 'business_as_usual' ? 'checked' : ''} style="display:none">
              <span class="dot"></span>
              <span class="name">${o.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-header">
      <h2>Resultaten</h2>
      <span class="tag">berekend</span>
    </div>
    <div class="section-body" style="padding-top:8px">

      <div class="metric-grid">
        <div class="metric-card">
          <div class="mlabel"><span>CO₂ Materiaal</span><span class="unit">kg/m²</span></div>
          <div><div class="mval" id="out-co2">—</div><div class="msub">bouw + fundering</div></div>
        </div>
        <div class="metric-card">
          <div class="mlabel"><span>Verdiepingen</span></div>
          <div><div class="mval" id="out-floors">10</div><div class="msub" id="out-floors-sub">35 m totaal</div></div>
        </div>
        <div class="metric-card">
          <div class="mlabel"><span>Kern</span><span class="unit">m²</span></div>
          <div><div class="mval" id="out-core">—</div><div class="msub" id="out-core-sub">—</div></div>
        </div>
        <div class="metric-card">
          <div class="mlabel"><span>Liften</span></div>
          <div><div class="mval" id="out-elevators">—</div><div class="msub" id="out-elevators-sub">—</div></div>
        </div>
      </div>

      <div class="metric-wide">
        <div>
          <div class="mlabel">Energie neutraliteit (dak)</div>
          <div class="mval" id="out-pv">—</div>
          <div class="msub" id="out-pv-unit">% PV-dekking vs. vraag</div>
        </div>
        <svg class="gauge" viewBox="0 0 64 38">
          <path d="M 6 32 A 26 26 0 0 1 58 32" fill="none" stroke="#E2E7EC" stroke-width="6"/>
          <path id="gauge-arc" d="M 6 32 A 26 26 0 0 1 6 32" fill="none" stroke="#2D5F8A" stroke-width="6"/>
          <circle id="gauge-dot" cx="6" cy="32" r="2.2" fill="#2D5F8A"/>
        </svg>
      </div>

      <div class="info-block">
        <div class="info-row">
          <span class="key">Fundering</span>
          <span class="val" id="out-foundation">—</span>
        </div>
        <div class="info-row">
          <span class="key">Stabiliteit</span>
          <span class="val" id="out-stability">—</span>
        </div>
      </div>

      <div class="consequence" id="consequence-panel">
        <div class="title">
          <span>Constructieve consequentie</span>
          <span class="level" id="consequence-level">Cat. —</span>
        </div>
        <div id="consequence-text">—</div>
      </div>

      <div class="tolerance">
        ±5–10 kg CO₂/m² (indicatieve data, brongrafiek)<br>
        Energie neutraliteit: indicatieve schatting — verificatie vereist.
      </div>

      <div id="threshold-alerts"></div>
    </div>
  `;

  // Floor stepper buttons
  document.getElementById('btn-minus').addEventListener('click', () => {
    const { floors } = getState();
    if (floors > 2) setState({ floors: floors - 1 });
  });
  document.getElementById('btn-plus').addEventListener('click', () => {
    const { floors } = getState();
    if (floors < 71) setState({ floors: floors + 1 });
  });

  // Floor typed input
  const floorInput = document.getElementById('floor-display');
  floorInput.addEventListener('change', e => {
    const { floors: prev } = getState();
    const parsed = parseInt(e.target.value);
    const clamped = isNaN(parsed) ? prev : Math.max(2, Math.min(71, Math.round(parsed)));
    e.target.value = clamped;
    setState({ floors: clamped });
  });

  // Bouwmethodiek radio
  document.querySelectorAll('#bouwmethodiek-group .opt').forEach(label => {
    label.addEventListener('click', () => {
      setState({ bouwmethodiek: label.querySelector('input').value });
    });
  });

  // Installatie radio
  document.querySelectorAll('#installatie-group .opt').forEach(label => {
    label.addEventListener('click', () => {
      setState({ installatie: label.querySelector('input').value });
    });
  });
}

export function updateOutputs(state, impact) {
  // Floor stepper
  const floorInput = document.getElementById('floor-display');
  if (floorInput) floorInput.value = state.floors;
  const floorCountVal = document.getElementById('floor-count-val');
  if (floorCountVal) floorCountVal.innerHTML =
    `${state.floors}<span style="color:var(--c-muted);font-weight:400;margin-left:4px">/ 71</span>`;

  document.getElementById('out-floors').textContent = state.floors;
  const floorsSub = document.getElementById('out-floors-sub');
  if (floorsSub) floorsSub.textContent = `${(state.floors * 3.5).toFixed(0)} m totaal`;

  // CO2
  document.getElementById('out-co2').textContent = impact.co2_material_kg_m2 ?? '—';

  // Core
  const core = CORE_DATA[impact.structural.core_variant];
  if (core) {
    document.getElementById('out-core').textContent = core.area;
    document.getElementById('out-core-sub').textContent = core.desc;
  }

  // Elevators
  const elev = impact.structural.elevator_count;
  document.getElementById('out-elevators').textContent = elev ?? '—';
  const elevSub = document.getElementById('out-elevators-sub');
  if (elevSub) elevSub.textContent = ELEV_DESC[elev] ?? '—';

  // Foundation / stability
  document.getElementById('out-foundation').textContent = impact.structural.foundation_type ?? '—';
  document.getElementById('out-stability').textContent = impact.structural.stability_system ?? '—';

  // Energie neutraliteit + gauge
  const pvEl  = document.getElementById('out-pv');
  const pvUnit = document.getElementById('out-pv-unit');
  if (impact.energy_neutrality_pct != null) {
    if (impact.energy_is_positive) {
      pvEl.textContent = '100';
      pvUnit.textContent = '% — Energie positief 🌱';
      const { d, ex, ey } = gaugePath(100);
      document.getElementById('gauge-arc').setAttribute('d', d);
      document.getElementById('gauge-dot').setAttribute('cx', ex.toFixed(2));
      document.getElementById('gauge-dot').setAttribute('cy', ey.toFixed(2));
    } else {
      pvEl.textContent = impact.energy_neutrality_pct;
      pvUnit.textContent = '% PV-dekking vs. vraag';
      const { d, ex, ey } = gaugePath(impact.energy_neutrality_pct);
      document.getElementById('gauge-arc').setAttribute('d', d);
      document.getElementById('gauge-dot').setAttribute('cx', ex.toFixed(2));
      document.getElementById('gauge-dot').setAttribute('cy', ey.toFixed(2));
    }
  } else {
    pvEl.textContent = '—';
  }

  // Consequence panel
  const elevMap = {
    0: 'Geen lift vereist', 1: '1 lift vereist', 2: '2 liften vereist',
    3: '3 liften vereist', 4: '4 liften vereist', 5: '5 liften — maximale hoogte',
  };
  const conseqText = `${elevMap[elev] ?? '—'} · ${impact.structural.foundation_type ?? '—'} · ${impact.structural.stability_system ?? '—'}`;
  document.getElementById('consequence-text').textContent = conseqText;
  document.getElementById('consequence-level').textContent = `Cat. ${consequenceLevel(state.floors)}`;

  if (impact.thresholds_crossed.length > 0) {
    const panel = document.getElementById('consequence-panel');
    panel.classList.remove('consequence-flash');
    void panel.offsetWidth;
    panel.classList.add('consequence-flash');
    setTimeout(() => panel.classList.remove('consequence-flash'), 1500);
  }

  // Active radio highlights
  document.querySelectorAll('#bouwmethodiek-group .opt').forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('sel', input && input.value === state.bouwmethodiek);
  });
  document.querySelectorAll('#installatie-group .opt').forEach(label => {
    const input = label.querySelector('input');
    label.classList.toggle('sel', input && input.value === state.installatie);
  });

  // Threshold alerts
  const alertsEl = document.getElementById('threshold-alerts');
  if (impact.thresholds_crossed.length > 0) {
    for (const event of impact.thresholds_crossed) {
      if (_dismissTimers[event.field]) {
        clearTimeout(_dismissTimers[event.field]);
        delete _dismissTimers[event.field];
      }
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
