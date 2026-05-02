import { subscribe } from './store.js';
import { getImpact } from './getImpact.js';
import { initScene } from './viewer/scene.js';
import { Tower } from './viewer/tower.js';
import { initCo2MaterialChart, updateMarker } from './charts/co2MaterialChart.js';
import { initStep1Panel, updateOutputs } from './ui/step1Panel.js';

const container = document.getElementById('three-container');
const scene = initScene(container);
const tower = new Tower(scene);

initStep1Panel(document.getElementById('panel'));
initCo2MaterialChart(document.getElementById('co2-chart'));

subscribe((state) => {
  const impact = getImpact(625, state.floors * 3.5, state.bouwmethodiek, state.installatie, {});
  tower.update(state.floors, impact);
  updateOutputs(state, impact);
  updateMarker(state.floors);
});
