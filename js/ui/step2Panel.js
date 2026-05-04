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
        <div class="s2-toggle" id="toggle-lucht">
          <button class="s2-btn" data-value="hoog">Hoog</button>
          <button class="s2-btn active" data-value="norm">Norm</button>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label">Lift rendement</span>
        <div class="s2-toggle" id="toggle-lift">
          <button class="s2-btn" data-value="zuinig">Zuinig</button>
          <button class="s2-btn active" data-value="standaard">Standaard</button>
        </div>
      </div>

      <p class="tolerance-disclaimer">
        Indicatieve aanpassingsfactoren — verificatie vereist.
      </p>
    </div>

    <style>
      .s2-toggle { display:flex; gap:4px; }
      .s2-btn {
        flex:1; padding:5px 0; font-size:11px; font-weight:500;
        border:1px solid var(--border); border-radius:5px;
        background:white; color:var(--blue-text); cursor:pointer;
        transition:background 0.15s, color 0.15s;
      }
      .s2-btn:hover { background:rgba(45,95,138,0.06); }
      .s2-btn.active { background:var(--blue-dark); color:white; border-color:var(--blue-dark); }
    </style>
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

  // Luchtdichtheid toggle
  section.querySelectorAll('#toggle-lucht .s2-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('#toggle-lucht .s2-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setState({ step2: { luchtdichtheid: btn.dataset.value } });
    });
  });

  // Lift rendement toggle
  section.querySelectorAll('#toggle-lift .s2-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('#toggle-lift .s2-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setState({ step2: { liftEfficiency: btn.dataset.value } });
    });
  });
}
