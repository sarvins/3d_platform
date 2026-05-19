import { getChartData } from '../getImpact.js';

const Chart = globalThis.Chart;

const FLOOR_H = 3.5; // metres per floor

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

// Threshold heights in metres (floors × 3.5, rounded)
const THRESHOLD_M  = [32, 56, 98, 133, 249]; // floors 9,16,28,38,71
const THRESHOLD_LBL = ['1e lift', '2e lift', '3e lift', '4e lift', '5e lift'];

let _chart = null;
let _currentHeight = Math.round(10 * FLOOR_H) + 'm'; // default floor 10
let _selectedKey = 'business_as_usual';

const SCENARIOS = ['business_as_usual', 'hoogwaardig_hybride', 'best_practice_biobased'];

// marginal[N] = avg[N]×N − avg[N-1]×(N-1); clamp to 0 (negatives are data artifacts at threshold downslopes)
function computeMarginals(avgValues) {
  return avgValues.map((avg, i) => {
    const floor = i + 2;
    const cur = avg * floor;
    const prevAvg = i === 0 ? avg : avgValues[i - 1];
    const prev = prevAvg * (floor - 1);
    return Math.max(0, Math.round(cur - prev));
  });
}

const floorMarkerPlugin = {
  id: 'floorMarker',
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    ctx.save();

    // Threshold lines
    for (let i = 0; i < THRESHOLD_M.length; i++) {
      const tx = scales.x.getPixelForValue(THRESHOLD_M[i] + 'm');
      if (!tx) continue;
      ctx.beginPath();
      ctx.moveTo(tx, chartArea.top);
      ctx.lineTo(tx, chartArea.bottom);
      ctx.strokeStyle = 'rgba(184,92,0,0.30)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(184,92,0,0.65)';
      ctx.font = '9px system-ui';
      ctx.fillText(THRESHOLD_LBL[i], tx + 2, chartArea.top + 10);
    }

    // Current floor marker
    const x = scales.x.getPixelForValue(_currentHeight);
    if (x) {
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.strokeStyle = 'rgba(45,95,138,0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
    }

    ctx.restore();
  },
};

function makeDatasets(datasets, selectedKey) {
  const marginals = computeMarginals(datasets[selectedKey]);
  const barDs = {
    type: 'bar',
    label: 'Marginale CO₂',
    data: marginals,
    backgroundColor: COLORS[selectedKey] + '40',
    borderWidth: 0,
    order: 3,
    pointRadius: 0,
    fill: false,
  };
  const lineDs = SCENARIOS.map(key => {
    const isSel = key === selectedKey;
    return {
      label: LABELS_NL[key],
      data: datasets[key],
      borderColor: COLORS[key],
      backgroundColor: 'transparent',
      borderWidth: isSel ? 2.5 : 1.2,
      borderDash: isSel ? [] : [5, 3],
      pointRadius: 0,
      tension: 0.3,
      fill: false,
      order: isSel ? 1 : 2,
    };
  });
  return [barDs, ...lineDs];
}

export function initCo2MaterialChart(canvas) {
  const { labels, datasets } = getChartData();

  _chart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: makeDatasets(datasets, _selectedKey) },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 20,
            font: { size: 10 },
            padding: 8,
            generateLabels(chart) {
              return chart.data.datasets.map((ds, i) => ({
                text: ds.label,
                fillStyle: ds.borderColor || ds.backgroundColor,
                strokeStyle: ds.borderColor || ds.backgroundColor,
                lineWidth: ds.borderWidth || 0,
                lineDash: ds.borderDash || [],
                hidden: false,
                datasetIndex: i,
              }));
            },
          },
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
          title: { display: true, text: 'Hoogte (m)', font: { size: 11 } },
          ticks: {
            font: { size: 9 },
            maxTicksLimit: 14,
            callback: (val, idx) => idx % 5 === 0 ? val : '',
          },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
        y: {
          title: { display: true, text: 'kg CO₂/m²', font: { size: 11 } },
          ticks: { font: { size: 10 } },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
      },
    },
    plugins: [floorMarkerPlugin],
  });
}

export function updateMarker(floors) {
  _currentHeight = Math.round(floors * FLOOR_H) + 'm';
  if (_chart) _chart.update('none');
}

export function updateCo2Chart(bouwmethodiek) {
  if (!_chart) return;
  _selectedKey = bouwmethodiek;
  const { datasets } = getChartData();
  // dataset[0] = marginal bar, datasets[1..3] = scenario lines
  const bar = _chart.data.datasets[0];
  bar.data = computeMarginals(datasets[bouwmethodiek]);
  bar.backgroundColor = COLORS[bouwmethodiek] + '40';
  _chart.data.datasets.slice(1).forEach((ds, i) => {
    const key = SCENARIOS[i];
    const isSel = key === bouwmethodiek;
    ds.borderWidth = isSel ? 2.5 : 1.2;
    ds.borderDash = isSel ? [] : [5, 3];
    ds.order = isSel ? 1 : 2;
  });
  _chart.update('none');
}
