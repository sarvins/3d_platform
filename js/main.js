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
