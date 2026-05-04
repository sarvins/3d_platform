import { getEnergyChartData } from '../getImpact.js';
import { DEFAULT_STEP2 } from '../store.js';

const Chart = globalThis.Chart;

const CATEGORIES = ['verwarming','koeling','ventilatie','verlichting','warmtapwater','lift','gebruikers'];

const COLORS = {
  verwarming:   '#C0392B',
  koeling:      '#5DADE2',
  ventilatie:   '#85929E',
  verlichting:  '#F4D03F',
  warmtapwater: '#E67E22',
  lift:         '#566573',
  gebruikers:   '#82E0AA',
};

const LABELS_NL = {
  verwarming:   'Verwarming',
  koeling:      'Koeling',
  ventilatie:   'Ventilatie',
  verlichting:  'Verlichting',
  warmtapwater: 'Warmtapwater',
  lift:         'Lift',
  gebruikers:   'Gebruikers',
};

let _chart = null;
let _currentFloorIndex = 8; // floor 10 = index 8 (floors 2-71, index 0-69)

const currentBarPlugin = {
  id: 'currentBarHighlight',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales.x) return;
    const x = scales.x.getPixelForValue(_currentFloorIndex);
    const barWidth = scales.x.width / 70;
    ctx.save();
    ctx.strokeStyle = '#2D5F8A';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - barWidth / 2, chartArea.top, barWidth, chartArea.bottom - chartArea.top);
    ctx.restore();
  },
};

export function initEnergyChart(canvas) {
  const { labels, datasets } = getEnergyChartData('business_as_usual', DEFAULT_STEP2);

  _chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: CATEGORIES.map(cat => ({
        label: LABELS_NL[cat],
        data: datasets[cat],
        backgroundColor: COLORS[cat] + 'CC', // 80% opacity
        borderWidth: 0,
        stack: 'energy',
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 10, font: { size: 10 }, padding: 6 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} kWh/m²/jaar`,
            footer: items => {
              const total = items.reduce((s, i) => s + i.parsed.y, 0);
              return `Totaal: ${total.toFixed(1)} kWh/m²/jaar`;
            },
          },
        },
        currentBarHighlight: {},
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: 'Hoogte (m)', font: { size: 11 } },
          ticks: {
            font: { size: 9 },
            maxTicksLimit: 15,
            callback: (val, idx) => idx % 5 === 0 ? labels[idx] : '',
          },
          grid: { display: false },
        },
        y: {
          stacked: true,
          title: { display: true, text: 'kWh/m²/jaar', font: { size: 11 } },
          min: 0,
          ticks: { font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
    },
    plugins: [currentBarPlugin],
  });
}

export function updateEnergyChart(state, impact) {
  if (!_chart) return;
  _currentFloorIndex = Math.max(0, Math.min(69, state.floors - 2));
  const { datasets } = getEnergyChartData(state.installatie, state.step2 || {});
  CATEGORIES.forEach((cat, i) => {
    _chart.data.datasets[i].data = datasets[cat];
  });
  _chart.update('none');
}
