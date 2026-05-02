import { getChartData } from '../getImpact.js';

const Chart = globalThis.Chart;

const COLORS = {
  business_as_usual:      '#C0392B',
  hoogwaardig_hybride:    '#2D6BA4',
  best_practice_biobased: '#27AE60',
};

const LABELS_NL = {
  business_as_usual:      'Conventioneel',
  hoogwaardig_hybride:    'Hybride',
  best_practice_biobased: 'Biobased',
};

const THRESHOLD_FLOORS = [9, 16, 28, 38];
const THRESHOLD_LABELS = ['1e lift', '2e lift', '3e lift', '4e lift'];

let _chart = null;
let _currentFloors = 10;

const floorMarkerPlugin = {
  id: 'floorMarker',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const x = scales.x.getPixelForValue(_currentFloors);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.strokeStyle = 'rgba(45,95,138,0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.stroke();

    for (let i = 0; i < THRESHOLD_FLOORS.length; i++) {
      const tx = scales.x.getPixelForValue(THRESHOLD_FLOORS[i]);
      ctx.beginPath();
      ctx.moveTo(tx, chartArea.top);
      ctx.lineTo(tx, chartArea.bottom);
      ctx.strokeStyle = 'rgba(184,92,0,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(184,92,0,0.7)';
      ctx.font = '9px system-ui';
      ctx.fillText(THRESHOLD_LABELS[i], tx + 2, chartArea.top + 10);
    }
    ctx.restore();
  },
};

export function initCo2MaterialChart(canvas) {
  const { labels, datasets } = getChartData();

  _chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: ['business_as_usual', 'hoogwaardig_hybride', 'best_practice_biobased'].map(key => ({
        label: LABELS_NL[key],
        data: datasets[key],
        borderColor: COLORS[key],
        backgroundColor: COLORS[key] + '14',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 }, padding: 8 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} kg CO₂/m²` },
        },
        floorMarker: {},
      },
      scales: {
        x: {
          title: { display: true, text: 'Aantal verdiepingen', font: { size: 11 } },
          ticks: { font: { size: 10 }, maxTicksLimit: 20 },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          title: { display: true, text: 'kg CO₂/m²', font: { size: 11 } },
          min: 0,
          ticks: { font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
    },
    plugins: [floorMarkerPlugin],
  });
}

export function updateMarker(floors) {
  _currentFloors = floors;
  if (_chart) _chart.update('none');
}
