import { setState } from '../store.js';

const RC_TO_UGLAS = { 3: '1,2', 4: '1,1', 5: '1,0', 6: '0,95', 7: '0,85', 8: '0,80' };
const RC_POSITIONS = [3, 4, 5, 6, 7, 8]; // index → Rc value

export function initStep2Panel(container) {
  const section = document.createElement('div');
  section.innerHTML = `
    <hr class="divider">

    <div class="panel-section">
      <div class="panel-section-title">Stap 2 — Gevelparameters</div>

      <div class="control-group">
        <span class="control-label">Balkons</span>
        <div class="radio-group" id="balkons-group">
          <label class="active"><input type="radio" name="balkons" value="buiten" checked> Buiten</label>
          <label><input type="radio" name="balkons" value="binnen"> Binnen</label>
          <label><input type="radio" name="balkons" value="gevellijn"> Gevellijn</label>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Zonwering</span>
        <div class="radio-group" id="zonwering-group">
          <label class="active"><input type="radio" name="zonwering" value="extern" checked> Extern</label>
          <label><input type="radio" name="zonwering" value="intern"> Intern</label>
          <label><input type="radio" name="zonwering" value="zonwerend_glas"> Zonwerend glas</label>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Raam oppervlak <span id="raam-val" style="font-weight:700;color:var(--blue-dark)">50%</span></span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--blue-mid)">30%</span>
          <input type="range" id="slider-raam" min="30" max="80" step="10" value="50"
            style="flex:1;accent-color:var(--blue-dark)">
          <span style="font-size:11px;color:var(--blue-mid)">80%</span>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Isolatie <span id="isolatie-val" style="font-weight:700;color:var(--blue-dark)">Rc 5 / Uglas 1,0</span></span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--blue-mid)">Rc 3</span>
          <input type="range" id="slider-isolatie" min="0" max="5" step="1" value="2"
            style="flex:1;accent-color:var(--blue-dark)">
          <span style="font-size:11px;color:var(--blue-mid)">Rc 8</span>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Luchtdichtheid</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--blue-mid)">Hoog</span>
          <input type="range" id="slider-lucht" min="0" max="4" step="1" value="4"
            style="flex:1;accent-color:var(--blue-dark)">
          <span style="font-size:11px;color:var(--blue-mid)">Norm</span>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Lift rendement</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--blue-mid)">Zuinig</span>
          <input type="range" id="slider-lift" min="0" max="4" step="1" value="4"
            style="flex:1;accent-color:var(--blue-dark)">
          <span style="font-size:11px;color:var(--blue-mid)">Standaard</span>
        </div>
      </div>

      <p class="tolerance-disclaimer">
        Indicatieve aanpassingsfactoren — verificatie vereist.
      </p>
    </div>

  `;
  container.appendChild(section);

  // Balkons
  section.querySelectorAll('input[name="balkons"]').forEach(el => {
    el.addEventListener('change', e => {
      setState({ step2: { balkons: e.target.value } });
      section.querySelectorAll('#balkons-group label').forEach(l => l.classList.remove('active'));
      e.target.closest('label').classList.add('active');
    });
  });

  // Zonwering
  section.querySelectorAll('input[name="zonwering"]').forEach(el => {
    el.addEventListener('change', e => {
      setState({ step2: { zonwering: e.target.value } });
      section.querySelectorAll('#zonwering-group label').forEach(l => l.classList.remove('active'));
      e.target.closest('label').classList.add('active');
    });
  });

  // Raam oppervlak slider
  const raamSlider = section.querySelector('#slider-raam');
  const raamVal = section.querySelector('#raam-val');
  raamSlider.addEventListener('input', e => {
    const v = parseInt(e.target.value);
    raamVal.textContent = v + '%';
    setState({ step2: { raamOppervlak: v } });
  });

  // Isolatie slider
  const isolatieSlider = section.querySelector('#slider-isolatie');
  const isolatieVal = section.querySelector('#isolatie-val');
  isolatieSlider.addEventListener('input', e => {
    const pos = parseInt(e.target.value);
    const rc = RC_POSITIONS[pos];
    isolatieVal.textContent = `Rc ${rc} / Uglas ${RC_TO_UGLAS[rc]}`;
    setState({ step2: { isolatieRc: rc } });
  });

  // Luchtdichtheid slider (0 = hoog, 4 = norm)
  section.querySelector('#slider-lucht').addEventListener('input', e => {
    setState({ step2: { luchtdichtheid: parseInt(e.target.value) } });
  });

  // Lift rendement slider (0 = zuinig, 4 = standaard)
  section.querySelector('#slider-lift').addEventListener('input', e => {
    setState({ step2: { liftEfficiency: parseInt(e.target.value) } });
  });
}
