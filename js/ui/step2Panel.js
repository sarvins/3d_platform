import { setState } from '../store.js';

const RC_TO_UGLAS = { 3: '1,2', 4: '1,1', 5: '1,0', 6: '0,95', 7: '0,85', 8: '0,80' };
const RC_POSITIONS = [3, 4, 5, 6, 7, 8];

const LUCHT_LABELS = { 0: 'Hoog', 1: 'Hoog+', 2: 'Midden', 3: 'Norm−', 4: 'Norm' };
const LIFT_LABELS  = { 0: 'Zuinig', 1: 'Zuinig+', 2: 'Midden', 3: 'Standaard−', 4: 'Standaard' };

function setFill(el, pct) {
  el.style.setProperty('--fill', pct.toFixed(1) + '%');
}

export function initStep2Panel(container) {
  const section = document.createElement('div');
  section.innerHTML = `
    <div class="divider"></div>

    <div class="section-header">
      <h2><span style="color:var(--c-mid);margin-right:6px">Stap 2 —</span>Gevelparameters</h2>
    </div>
    <div class="section-body">

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Balkons</span>
          <span class="val" id="balkons-val" style="color:var(--c-muted);font-weight:400;font-size:10px;font-style:italic">Uitkragend</span>
        </div>
        <div class="segmented" id="balkons-seg">
          <button class="sel" data-value="buiten">Buiten</button>
          <button data-value="binnen">Binnen</button>
          <button data-value="gevellijn">Gevellijn</button>
        </div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Zonwering</span>
          <span class="val" id="zonwering-val" style="color:var(--c-muted);font-weight:400;font-size:10px;font-style:italic">Buitenscreens</span>
        </div>
        <div class="segmented" id="zonwering-seg">
          <button class="sel" data-value="extern">Extern</button>
          <button data-value="intern">Intern</button>
          <button data-value="zonwerend_glas">Zonwerend glas</button>
        </div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Raam­oppervlak</span>
          <span class="val" id="raam-val">50%</span>
        </div>
        <input type="range" class="slider" id="slider-raam" min="30" max="80" step="10" value="50">
        <div class="slider-scale"><span>30%</span><span>80%</span></div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Isolatie</span>
          <span class="val" id="isolatie-val">Rc 5 / Uglas 1,0</span>
        </div>
        <input type="range" class="slider" id="slider-isolatie" min="0" max="5" step="1" value="2">
        <div class="slider-scale"><span>Rc 3 / U 1,2</span><span>Rc 8 / U 0,80</span></div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Lucht­dichtheid</span>
          <span class="val" id="lucht-val">Norm</span>
        </div>
        <input type="range" class="slider" id="slider-lucht" min="0" max="4" step="1" value="4">
        <div class="slider-scale"><span>Hoog</span><span>Norm</span></div>
      </div>

      <div class="ctrl">
        <div class="ctrl-label">
          <span class="lbl">Lift rendement</span>
          <span class="val" id="lift-val">Standaard</span>
        </div>
        <input type="range" class="slider" id="slider-lift" min="0" max="4" step="1" value="4">
        <div class="slider-scale"><span>Zuinig</span><span>Standaard</span></div>
      </div>

      <div class="tolerance" style="margin-top:12px">
        Gevelparameters beïnvloeden energieverbruik. Indicatieve aanpassingsfactoren — verificatie vereist.
      </div>
    </div>
  `;
  container.appendChild(section);

  // Balkons segmented
  const balkonDesc = { buiten: 'Uitkragend', binnen: 'Loggia', gevellijn: 'Vlak in gevelvlak' };
  section.querySelectorAll('#balkons-seg button').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('#balkons-seg button').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      setState({ step2: { balkons: btn.dataset.value } });
      section.querySelector('#balkons-val').textContent = balkonDesc[btn.dataset.value] || '';
    });
  });

  // Zonwering segmented
  const zonDesc = { extern: 'Buitenscreens', intern: 'Binnenrolgordijn', zonwerend_glas: 'Coating in glas' };
  section.querySelectorAll('#zonwering-seg button').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('#zonwering-seg button').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      setState({ step2: { zonwering: btn.dataset.value } });
      section.querySelector('#zonwering-val').textContent = zonDesc[btn.dataset.value] || '';
    });
  });

  // Raam slider
  const raamSlider = section.querySelector('#slider-raam');
  const raamVal = section.querySelector('#raam-val');
  function updateRaam() {
    const v = parseInt(raamSlider.value);
    raamVal.textContent = v + '%';
    setFill(raamSlider, ((v - 30) / 50) * 100);
  }
  updateRaam();
  raamSlider.addEventListener('input', e => {
    updateRaam();
    setState({ step2: { raamOppervlak: parseInt(e.target.value) } });
  });

  // Isolatie slider
  const isolatieSlider = section.querySelector('#slider-isolatie');
  const isolatieVal = section.querySelector('#isolatie-val');
  function updateIsolatie() {
    const pos = parseInt(isolatieSlider.value);
    const rc = RC_POSITIONS[pos];
    isolatieVal.textContent = `Rc ${rc} / Uglas ${RC_TO_UGLAS[rc]}`;
    setFill(isolatieSlider, (pos / 5) * 100);
  }
  updateIsolatie();
  isolatieSlider.addEventListener('input', e => {
    updateIsolatie();
    setState({ step2: { isolatieRc: RC_POSITIONS[parseInt(e.target.value)] } });
  });

  // Luchtdichtheid slider
  const luchtSlider = section.querySelector('#slider-lucht');
  const luchtVal = section.querySelector('#lucht-val');
  function updateLucht() {
    const v = parseInt(luchtSlider.value);
    luchtVal.textContent = LUCHT_LABELS[v];
    setFill(luchtSlider, (v / 4) * 100);
  }
  updateLucht();
  luchtSlider.addEventListener('input', e => {
    updateLucht();
    setState({ step2: { luchtdichtheid: parseInt(e.target.value) } });
  });

  // Lift rendement slider
  const liftSlider = section.querySelector('#slider-lift');
  const liftVal = section.querySelector('#lift-val');
  function updateLift() {
    const v = parseInt(liftSlider.value);
    liftVal.textContent = LIFT_LABELS[v];
    setFill(liftSlider, (v / 4) * 100);
  }
  updateLift();
  liftSlider.addEventListener('input', e => {
    updateLift();
    setState({ step2: { liftEfficiency: parseInt(e.target.value) } });
  });
}
