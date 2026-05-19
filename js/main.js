import { subscribe } from './store.js';
import { getImpact } from './getImpact.js';
import { initScene, setViewMode } from './viewer/scene.js';
import { Tower, getPileDepthM } from './viewer/tower.js';
import { initCo2MaterialChart, updateMarker, updateMarginalBars } from './charts/co2MaterialChart.js';
import { initEnergyChart, updateEnergyChart } from './charts/energyChart.js';
import { initStep1Panel, updateOutputs } from './ui/step1Panel.js';
import { initStep2Panel } from './ui/step2Panel.js';

const container = document.getElementById('three-container');
const scene = initScene(container);
const tower = new Tower(scene);

const panel = document.getElementById('panel');
initStep1Panel(panel);
initStep2Panel(panel);

initCo2MaterialChart(document.getElementById('co2-chart'));
initEnergyChart(document.getElementById('energy-chart'));

// Resizable layout
const rightCol = document.querySelector('.right-col');
const viewerSection = document.getElementById('viewer-section');
const chartsSection = document.querySelector('.charts');

const handle = document.createElement('div');
handle.className = 'resize-handle';
handle.innerHTML = `
  <button class="collapse-btn" id="btn-collapse-viewer" title="3D verbergen">▲</button>
  <div class="grip">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
  <button class="collapse-btn" id="btn-collapse-charts" title="Grafieken verbergen">▼</button>
`;
rightCol.insertBefore(handle, chartsSection);

let _viewerCollapsed = false;
let _chartsCollapsed = false;
const CHARTS_DEFAULT = 380;
const VIEWER_MIN = 60;
const CHARTS_MIN = 80;

function applyRows(viewerH, chartsH) {
  rightCol.style.gridTemplateRows = `${viewerH}px 10px ${chartsH}px`;
}

document.getElementById('btn-collapse-viewer').addEventListener('click', e => {
  e.stopPropagation();
  _viewerCollapsed = !_viewerCollapsed;
  _chartsCollapsed = false;
  const totalH = rightCol.getBoundingClientRect().height;
  if (_viewerCollapsed) {
    applyRows(VIEWER_MIN, totalH - VIEWER_MIN - 10 - 8);
    document.getElementById('btn-collapse-viewer').textContent = '▼';
    document.getElementById('btn-collapse-charts').textContent = '▼';
  } else {
    applyRows('1fr'.valueOf(), CHARTS_DEFAULT);
    rightCol.style.gridTemplateRows = `1fr 10px ${CHARTS_DEFAULT}px`;
    document.getElementById('btn-collapse-viewer').textContent = '▲';
    document.getElementById('btn-collapse-charts').textContent = '▼';
  }
});

document.getElementById('btn-collapse-charts').addEventListener('click', e => {
  e.stopPropagation();
  _chartsCollapsed = !_chartsCollapsed;
  _viewerCollapsed = false;
  const totalH = rightCol.getBoundingClientRect().height;
  if (_chartsCollapsed) {
    applyRows(totalH - CHARTS_MIN - 10 - 8, CHARTS_MIN);
    document.getElementById('btn-collapse-charts').textContent = '▲';
    document.getElementById('btn-collapse-viewer').textContent = '▲';
  } else {
    rightCol.style.gridTemplateRows = `1fr 10px ${CHARTS_DEFAULT}px`;
    document.getElementById('btn-collapse-charts').textContent = '▼';
    document.getElementById('btn-collapse-viewer').textContent = '▲';
  }
});

// Drag to resize
let _dragging = false, _startY = 0, _startViewerH = 0, _startChartsH = 0;

handle.addEventListener('mousedown', e => {
  if (e.target.classList.contains('collapse-btn')) return;
  _dragging = true;
  _startY = e.clientY;
  _startViewerH = viewerSection.getBoundingClientRect().height;
  _startChartsH = chartsSection.getBoundingClientRect().height;
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!_dragging) return;
  const delta = e.clientY - _startY;
  const newViewerH = Math.max(VIEWER_MIN, _startViewerH + delta);
  const newChartsH = Math.max(CHARTS_MIN, _startChartsH - delta);
  applyRows(newViewerH, newChartsH);
  _viewerCollapsed = false;
  _chartsCollapsed = false;
});

document.addEventListener('mouseup', () => {
  if (!_dragging) return;
  _dragging = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// View toggle
const pileLabel = document.getElementById('pile-depth-label');
document.querySelectorAll('#view-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#view-toggle button').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    const mode = btn.dataset.mode;
    setViewMode(mode);
    pileLabel.style.display = mode === 'perspective' ? 'none' : 'block';
  });
});

subscribe((state) => {
  const impact = getImpact(625, state.floors * 3.5, state.bouwmethodiek, state.installatie, state.step2);
  tower.update(state.floors, impact);
  updateOutputs(state, impact);
  updateMarker(state.floors);
  updateMarginalBars(state.bouwmethodiek);
  updateEnergyChart(state, impact);
  pileLabel.textContent = `Paaldiepte: ~${getPileDepthM(state.floors)}m`;
});
