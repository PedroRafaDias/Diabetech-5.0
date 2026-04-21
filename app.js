// =============================================
//   DiabeTech — app.js
//   Pedro Rafael Lima Dias · PEX V · ADS
// =============================================

let medicoes = JSON.parse(localStorage.getItem('diabetech_medicoes') || '[]');
let chart = null;
let currentFilter = 'hoje';

// ---- INIT ----
function init() {
  const now = new Date();
  document.getElementById('inp-hora').value = now.toTimeString().slice(0, 5);
  document.getElementById('inp-data').value = now.toISOString().slice(0, 10);
  render();

  document.getElementById('navToggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
}

// ---- SAVE ----
function save() {
  localStorage.setItem('diabetech_medicoes', JSON.stringify(medicoes));
}

// ---- STATUS ----
function getStatus(v) {
  if (v < 70) return 'low';
  if (v > 180) return 'high';
  return 'ok';
}

function getStatusLabel(v) {
  if (v < 70) return 'Hipoglicemia';
  if (v > 180) return 'Hiperglicemia';
  return 'Normal';
}

function badgeHtml(v) {
  const s = getStatus(v);
  const label = getStatusLabel(v);
  return `<span class="badge badge-${s}">${label}</span>`;
}

function pointColor(v) {
  if (v < 70) return '#dc2626';
  if (v > 180) return '#d97706';
  return '#16a34a';
}

// ---- ADD MEDIÇÃO ----
function addMedicao() {
  const val = parseInt(document.getElementById('inp-valor').value);
  const hora = document.getElementById('inp-hora').value;
  const data = document.getElementById('inp-data').value;
  const ref = document.getElementById('inp-ref').value;
  const obs = document.getElementById('inp-obs').value.trim();

  if (!val || isNaN(val) || val < 20 || val > 600) {
    showAlert('Por favor, insira um valor válido entre 20 e 600 mg/dL.', 'low');
    return;
  }
  if (!hora || !data) {
    showAlert('Preencha o horário e a data da medição.', 'low');
    return;
  }

  const id = Date.now();
  medicoes.push({ id, val, hora, data, ref, obs });
  medicoes.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  save();

  document.getElementById('inp-valor').value = '';
  document.getElementById('inp-obs').value = '';

  const s = getStatus(val);
  if (s === 'low') {
    showAlert(`⚠ Hipoglicemia detectada (${val} mg/dL) — Consuma carboidratos de ação rápida (suco, mel, glicose) e avise o Dr. Fabrício imediatamente.`, 'low');
  } else if (s === 'high') {
    showAlert(`⚠ Hiperglicemia detectada (${val} mg/dL) — Verifique a dose de insulina, hidrate-se bem e consulte o Dr. Fabrício se o valor persistir.`, 'high');
  } else {
    showAlert(`✓ Medição registrada com sucesso — ${val} mg/dL, valor dentro da faixa ideal.`, 'ok');
  }

  render();
}

// ---- DELETE ----
function deleteMedicao(id) {
  if (!confirm('Deseja excluir esta medição?')) return;
  medicoes = medicoes.filter(m => m.id !== id);
  save();
  render();
}

// ---- ALERT ----
function showAlert(msg, type) {
  const banner = document.getElementById('alertBanner');
  const msgEl = document.getElementById('alertMsg');
  banner.className = 'alert-banner ' + type;
  msgEl.textContent = msg;
  banner.style.display = 'block';
  setTimeout(closeAlert, 7000);
}

function closeAlert() {
  document.getElementById('alertBanner').style.display = 'none';
}

// ---- FILTERS ----
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderChart();
}

function getFilteredForChart() {
  const today = new Date().toISOString().slice(0, 10);
  if (currentFilter === 'hoje') return medicoes.filter(m => m.data === today);
  if (currentFilter === '7d') {
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    const from = d7.toISOString().slice(0, 10);
    return medicoes.filter(m => m.data >= from);
  }
  return medicoes;
}

// ---- RENDER ----
function render() {
  renderMetrics();
  renderChart();
  renderHistory();
  renderDoctor();
  renderHeroStats();
}

function renderHeroStats() {
  const total = medicoes.length;
  document.getElementById('hs-total').textContent = total;
  if (total === 0) {
    document.getElementById('hs-media').textContent = '--';
    document.getElementById('hs-ultima').textContent = '--';
    return;
  }
  const vals = medicoes.map(m => m.val);
  const media = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const ultima = medicoes[medicoes.length - 1].val;
  document.getElementById('hs-media').textContent = media;
  document.getElementById('hs-ultima').textContent = ultima;
}

function renderMetrics() {
  const ids = ['mv-ultima', 'mv-media', 'mv-min', 'mv-max'];
  const cids = ['mc-ultima', 'mc-media', 'mc-min', 'mc-max'];

  if (medicoes.length === 0) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      el.textContent = '--';
      el.className = 'metric-value';
    });
    cids.forEach(id => {
      const el = document.getElementById(id);
      el.className = 'metric-card';
    });
    return;
  }

  const vals = medicoes.map(m => m.val);
  const ultima = medicoes[medicoes.length - 1].val;
  const media = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  const pairs = [[ultima, 'mv-ultima', 'mc-ultima'], [media, 'mv-media', 'mc-media'], [min, 'mv-min', 'mc-min'], [max, 'mv-max', 'mc-max']];
  pairs.forEach(([v, vid, cid]) => {
    const s = getStatus(v);
    document.getElementById(vid).textContent = v;
    document.getElementById(vid).className = 'metric-value ' + s;
    document.getElementById(cid).className = 'metric-card ' + s;
  });
}

function renderChart() {
  const data = getFilteredForChart();
  const chartEmpty = document.getElementById('chartEmpty');
  const canvas = document.getElementById('glicChart');

  if (data.length === 0) {
    chartEmpty.style.display = 'block';
    canvas.style.display = 'none';
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  chartEmpty.style.display = 'none';
  canvas.style.display = 'block';

  const labels = data.map(m => {
    if (currentFilter === 'todos' || currentFilter === '7d') {
      return m.data.slice(5) + ' ' + m.hora;
    }
    return m.hora;
  });
  const vals = data.map(m => m.val);
  const colors = vals.map(pointColor);

  if (chart) { chart.destroy(); }

  chart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Glicemia (mg/dL)',
        data: vals,
        borderColor: '#1d6fcf',
        borderWidth: 2,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.35,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y} mg/dL — ${getStatusLabel(ctx.parsed.y)}`,
            afterLabel: ctx => {
              const m = data[ctx.dataIndex];
              return `${m.ref}${m.obs ? ' · ' + m.obs : ''}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 40,
          max: Math.max(220, ...vals) + 30,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 11, family: "'DM Mono', monospace" },
            color: '#94a3b8',
            callback: v => v + ' mg/dL'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#94a3b8',
            autoSkip: true,
            maxRotation: 30
          }
        }
      }
    }
  });
}

function renderHistory() {
  const cont = document.getElementById('hist-content');
  const filterVal = document.getElementById('hist-filter').value;

  let filtered = [...medicoes].reverse();
  if (filterVal !== 'todos') {
    filtered = filtered.filter(m => getStatus(m.val) === filterVal);
  }

  if (filtered.length === 0) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>${medicoes.length === 0 ? 'Nenhuma medição registrada ainda.' : 'Nenhuma medição nesta categoria.'}</p></div>`;
    return;
  }

  const rows = filtered.map(m => `
    <tr>
      <td>${m.data ? m.data.slice(5).replace('-', '/') : '--'}</td>
      <td>${m.hora}</td>
      <td><span class="hist-val ${getStatus(m.val)}">${m.val}</span> <span style="font-size:11px;color:#94a3b8;">mg/dL</span></td>
      <td>${m.ref}</td>
      <td>${badgeHtml(m.val)}</td>
      <td style="color:#94a3b8;font-size:12px;">${m.obs || '—'}</td>
      <td><button class="del-btn" onclick="deleteMedicao(${m.id})" title="Excluir">✕</button></td>
    </tr>`).join('');

  cont.innerHTML = `
    <table class="hist-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Horário</th>
          <th>Valor</th>
          <th>Momento</th>
          <th>Status</th>
          <th>Observação</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderDoctor() {
  const total = medicoes.length;
  document.getElementById('d-total').textContent = total;

  if (total === 0) {
    document.getElementById('d-media').textContent = '--';
    document.getElementById('d-hipo').textContent = '0';
    document.getElementById('d-hiper').textContent = '0';
    ['bar-ok', 'bar-hipo', 'bar-hiper'].forEach(id => document.getElementById(id).style.width = '0%');
    ['pct-ok', 'pct-hipo', 'pct-hiper'].forEach(id => document.getElementById(id).textContent = '0%');
    document.getElementById('medico-obs').innerHTML = '<p>Nenhum dado disponível ainda.</p>';
    return;
  }

  const vals = medicoes.map(m => m.val);
  const media = Math.round(vals.reduce((a, b) => a + b, 0) / total);
  const hipo = vals.filter(v => v < 70).length;
  const hiper = vals.filter(v => v > 180).length;
  const ok = total - hipo - hiper;

  const pctOk = Math.round((ok / total) * 100);
  const pctHipo = Math.round((hipo / total) * 100);
  const pctHiper = Math.round((hiper / total) * 100);

  document.getElementById('d-media').textContent = media + ' mg/dL';
  document.getElementById('d-hipo').textContent = hipo;
  document.getElementById('d-hiper').textContent = hiper;

  document.getElementById('bar-ok').style.width = pctOk + '%';
  document.getElementById('bar-hipo').style.width = pctHipo + '%';
  document.getElementById('bar-hiper').style.width = pctHiper + '%';
  document.getElementById('pct-ok').textContent = pctOk + '%';
  document.getElementById('pct-hipo').textContent = pctHipo + '%';
  document.getElementById('pct-hiper').textContent = pctHiper + '%';

  let obs = '';
  if (hipo > 0) obs += `<p>⚠ <strong>${hipo} episódio(s) de hipoglicemia</strong> registrado(s). Avaliar ajuste de insulina ou plano alimentar.</p>`;
  if (hiper > 0) obs += `<p>⚠ <strong>${hiper} episódio(s) de hiperglicemia</strong> registrado(s). Verificar adesão ao tratamento.</p>`;
  if (hipo === 0 && hiper === 0) obs = '<p>✓ Todos os registros estão dentro da faixa glicêmica ideal. Manter o tratamento atual.</p>';
  document.getElementById('medico-obs').innerHTML = obs;
}

// ---- EXPORT CSV ----
function exportCSV() {
  if (medicoes.length === 0) {
    alert('Nenhuma medição para exportar.');
    return;
  }
  const header = 'Data,Horário,Valor (mg/dL),Momento,Status,Observação';
  const rows = medicoes.map(m =>
    `${m.data || ''},${m.hora},${m.val},${m.ref},${getStatusLabel(m.val)},${m.obs || ''}`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diabetech_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- START ----
document.addEventListener('DOMContentLoaded', init);
