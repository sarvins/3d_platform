import { subscribe } from './store.js';
import { getImpact } from './getImpact.js';
import { initScene } from './viewer/scene.js';
import { Tower } from './viewer/tower.js';
import { initCo2MaterialChart, updateMarker } from './charts/co2MaterialChart.js';
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

subscribe((state) => {
  const impact = getImpact(625, state.floors * 3.5, state.bouwmethodiek, state.installatie, state.step2);
  tower.update(state.floors, impact);
  updateOutputs(state, impact);
  updateMarker(state.floors);
  updateEnergyChart(state, impact);
});
