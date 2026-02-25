/**
 * Archivo: script.js
 * Descripción: Lógica corregida y robusta para análisis estadístico y diagramas.
 * Autor: Lalo 
 * Fecha: 24/02/2026
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos
    const elements = {
        calculateBtn: document.getElementById('calculate-btn'),
        generateDataBtn: document.getElementById('generate-data-btn'),
        unionBtn: document.getElementById('union-btn'),
        intersectionBtn: document.getElementById('intersection-btn'),
        differenceBtn: document.getElementById('difference-btn'),
        permBtn: document.getElementById('perm-btn'),
        combBtn: document.getElementById('comb-btn'),
        randomPermBtn: document.getElementById('random-perm-btn'),
        randomSetsBtn: document.getElementById('random-sets-btn'),
        treeBtn: document.getElementById('tree-btn'),
        randomTreeBtn: document.getElementById('random-tree-btn')
    };

    // Asignación segura de eventos
    if (elements.calculateBtn) elements.calculateBtn.addEventListener('click', runFullAnalysis);
    if (elements.generateDataBtn) elements.generateDataBtn.addEventListener('click', () => {
        const randomData = generateRandomData(20, 1, 100);
        document.getElementById('data-input').value = randomData.join(', ');
    });

    if (elements.unionBtn) elements.unionBtn.addEventListener('click', handleUnion);
    if (elements.intersectionBtn) elements.intersectionBtn.addEventListener('click', handleIntersection);
    if (elements.differenceBtn) elements.differenceBtn.addEventListener('click', handleDifference);
    if (elements.randomSetsBtn) elements.randomSetsBtn.addEventListener('click', generateRandomSets);
    
    if (elements.permBtn) elements.permBtn.addEventListener('click', handlePermutation);
    if (elements.combBtn) elements.combBtn.addEventListener('click', handleCombination);
    if (elements.randomPermBtn) elements.randomPermBtn.addEventListener('click', generateRandomPermInputs);
    
    if (elements.treeBtn) elements.treeBtn.addEventListener('click', handleMultiplicativeRule);
    if (elements.randomTreeBtn) elements.randomTreeBtn.addEventListener('click', generateRandomTreeInputs);

    console.log("Sistema inicializado correctamente.");
});

// --- FUNCIONES DE DATOS ALEATORIOS ADICIONALES ---

function generateRandomSets() {
    const generateSet = () => {
        const size = Math.floor(Math.random() * 5) + 3; // 3 a 7 elementos
        const items = [];
        for(let i=0; i<size; i++) items.push(Math.floor(Math.random() * 20) + 1);
        return [...new Set(items)].join(', ');
    };
    document.getElementById('set-a').value = generateSet();
    document.getElementById('set-b').value = generateSet();
}

function generateRandomPermInputs() {
    const n = Math.floor(Math.random() * 10) + 5; // n entre 5 y 15
    const r = Math.floor(Math.random() * (n - 1)) + 1; // r < n
    document.getElementById('n-input').value = n;
    document.getElementById('r-input').value = r;
}

// --- FUNCIONES DE ANÁLISIS PRINCIPAL ---

function runFullAnalysis() {
    const data = parseDataInput();
    if (data.length < 20) {
        alert("Por favor, ingresa al menos 20 datos para un análisis completo.");
        return;
    }

    cleanUpUI();

    const freqTableData = createFrequencyTable(data);
    const k = Math.round(1 + 3.322 * Math.log10(data.length));
    const range = data[data.length - 1] - data[0];
    const classWidthValue = Math.ceil(range / k);

    calculateAndDisplayStats(data, classWidthValue);
    displayFrequencyTable(freqTableData);
    drawAllCharts(freqTableData);
}

function cleanUpUI() {
    const ids = ['mean', 'median', 'mode', 'min', 'max', 'range', 'class-width', 'set-result', 'perm-result', 'comb-result', 'tree-total'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
    
    const body = document.getElementById('freq-table-body');
    if (body) body.innerHTML = '';
    
    const treeDiagram = document.getElementById('tree-diagram-text');
    if (treeDiagram) treeDiagram.textContent = '';
    
    const charts = ['histogram-chart', 'polygon-chart', 'ogive-chart', 'pareto-chart'];
    charts.forEach(clearCanvas);
}

function parseDataInput() {
    const input = document.getElementById('data-input');
    if (!input) return [];
    const rawData = input.value.trim();
    if (!rawData) return [];
    return rawData.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
}

function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function calculateAndDisplayStats(data, classWidth) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const mid = Math.floor(data.length / 2);
    const median = data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];
    
    const freq = {};
    let maxFreq = 0;
    data.forEach(n => { freq[n] = (freq[n] || 0) + 1; if (freq[n] > maxFreq) maxFreq = freq[n]; });
    const mode = maxFreq === 1 ? "Sin moda" : Object.keys(freq).filter(k => freq[k] === maxFreq).join(', ');

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    setVal('mean', mean.toFixed(2));
    setVal('median', median.toFixed(2));
    setVal('mode', mode);
    setVal('min', data[0]);
    setVal('max', data[data.length - 1]);
    setVal('range', data[data.length - 1] - data[0]);
    setVal('class-width', classWidth);
}

function createFrequencyTable(data) {
    const n = data.length;
    const min = data[0], max = data[n - 1];
    const range = max - min;
    if (range === 0) return [{ class: `[${min}]`, fi: n, Fi: n, fr: 1, Fr: 1, midPoint: min }];

    const k = Math.round(1 + 3.322 * Math.log10(n));
    const width = Math.ceil(range / k);
    const table = [];
    let lower = min;
    let cumFi = 0, cumFr = 0;

    for (let i = 0; i < k; i++) {
        const upper = lower + width;
        const fi = i === k - 1 ? data.filter(d => d >= lower && d <= upper).length : data.filter(d => d >= lower && d < upper).length;
        cumFi += fi;
        const fr = fi / n;
        cumFr += fr;
        table.push({ class: `[${lower} - ${upper})`, fi, Fi: cumFi, fr, Fr: cumFr, midPoint: (lower + upper) / 2 });
        lower = upper;
        if (cumFi >= n) break;
    }
    return table;
}

function displayFrequencyTable(tableData) {
    const body = document.getElementById('freq-table-body');
    if (!body) return;
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.class}</td><td>${row.fi}</td><td>${row.Fi}</td><td>${(row.fr * 100).toFixed(2)}%</td><td>${(row.Fr * 100).toFixed(2)}%</td>`;
        body.appendChild(tr);
    });
}

// --- GRÁFICAS ---

function drawAllCharts(freqTableData) {
    drawHistogram(freqTableData);
    drawFrequencyPolygon(freqTableData);
    drawOgive(freqTableData);
    drawParetoChart(freqTableData);
}

function clearCanvas(id) {
    const canvas = document.getElementById(id);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function drawAxes(ctx, padding, originY, endX, yAxisLabel, xAxisLabel, yTickValues = [], xTickLabels = []) {
    const textColor = '#f1f5f9';
    const axisColor = '#475569';
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = textColor;

    // Dibujar Ejes
    ctx.beginPath();
    ctx.moveTo(padding, originY); ctx.lineTo(endX, originY);
    ctx.moveTo(padding, originY); ctx.lineTo(padding, padding);
    ctx.stroke();

    // Etiqueta Eje X
    ctx.textAlign = 'center';
    ctx.fillText(xAxisLabel, padding + (endX - padding) / 2, originY + 45);
    
    // Etiqueta Eje Y
    ctx.save();
    ctx.translate(padding - 45, originY / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisLabel, 0, 0);
    ctx.restore();

    // Ticks Y
    ctx.textAlign = 'right';
    const yMax = Math.max(...yTickValues) || 1;
    yTickValues.forEach(v => {
        const yPos = originY - (v / yMax) * (originY - padding);
        ctx.fillText(v.toString(), padding - 10, yPos + 4);
    });

    // Ticks X
    ctx.textAlign = 'center';
    const xRange = endX - padding;
    const xStep = xRange / (xTickLabels.length > 0 ? xTickLabels.length : 1);
    xTickLabels.forEach((label, i) => {
        const xPos = padding + (i * xStep) + (xStep / 2);
        const shortLabel = label.length > 10 ? label.substring(0, 8) + '..' : label;
        ctx.fillText(shortLabel, xPos, originY + 20);
    });
}

function drawHistogram(tableData) {
    const canvas = document.getElementById('histogram-chart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); clearCanvas('histogram-chart');
    const data = tableData.map(r => r.fi);
    const labels = tableData.map(r => r.class);
    const p = 60, oy = canvas.height - p, cw = canvas.width - 2*p, ch = canvas.height - 2*p;
    const max = Math.max(...data) || 1;
    
    drawAxes(ctx, p, oy, canvas.width - p, 'Frecuencia (fi)', 'Clases', [0, Math.ceil(max/2), max], labels);
    
    const bw = cw / data.length;
    ctx.fillStyle = 'rgba(129, 140, 248, 0.7)';
    ctx.strokeStyle = '#818cf8';
    data.forEach((v, i) => {
        const bh = (v / max) * ch;
        const bx = p + i * bw;
        ctx.fillRect(bx, oy - bh, bw - 2, bh);
        ctx.strokeRect(bx, oy - bh, bw - 2, bh);
    });
}

function drawFrequencyPolygon(tableData) {
    const canvas = document.getElementById('polygon-chart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); clearCanvas('polygon-chart');
    const data = tableData.map(r => r.fi);
    const max = Math.max(...data) || 1;
    const p = 60, oy = canvas.height - p, cw = canvas.width - 2*p, ch = canvas.height - 2*p;
    
    drawAxes(ctx, p, oy, canvas.width - p, 'Frecuencia', 'Puntos Medios', [0, Math.ceil(max/2), max], tableData.map(r => r.midPoint.toFixed(1)));
    
    const step = cw / data.length;
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = p + (i * step) + (step / 2);
        const y = oy - (v / max) * ch;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Puntos
    ctx.fillStyle = '#fff';
    data.forEach((v, i) => {
        const x = p + (i * step) + (step / 2);
        const y = oy - (v / max) * ch;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    });
}

function drawOgive(tableData) {
    const canvas = document.getElementById('ogive-chart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); clearCanvas('ogive-chart');
    const data = tableData.map(r => r.Fi);
    const total = data[data.length - 1] || 1;
    const p = 60, oy = canvas.height - p, cw = canvas.width - 2*p, ch = canvas.height - 2*p;
    
    const xLabels = tableData.map(r => r.class.split('-')[1].replace(')', '').trim());
    drawAxes(ctx, p, oy, canvas.width - p, 'Frec. Acumulada', 'Límites Superiores', [0, Math.ceil(total/2), total], xLabels);
    
    const step = cw / data.length;
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p, oy);
    data.forEach((v, i) => {
        const x = p + ((i + 1) * step);
        const y = oy - (v / total) * ch;
        ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function drawParetoChart(tableData) {
    const canvas = document.getElementById('pareto-chart'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); clearCanvas('pareto-chart');
    const sorted = [...tableData].sort((a,b) => b.fi - a.fi);
    const vals = sorted.map(r => r.fi);
    const max = Math.max(...vals) || 1;
    const total = vals.reduce((a,b) => a+b, 0) || 1;
    const p = 60, oy = canvas.height - p, cw = canvas.width - 2*p, ch = canvas.height - 2*p;
    
    drawAxes(ctx, p, oy, canvas.width - p, 'Fi', 'Clases (Ord)', [0, Math.ceil(max/2), max], sorted.map(r => r.class));
    
    const bw = cw / vals.length;
    ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
    vals.forEach((v, i) => {
        const bh = (v / max) * ch;
        ctx.fillRect(p + i * bw, oy - bh, bw - 2, bh);
    });
    
    // Línea de Pareto
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
    let cum = 0;
    ctx.beginPath();
    vals.forEach((v, i) => {
        cum += v;
        const x = p + (i * bw) + (bw / 2);
        const y = oy - (cum / total) * ch;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        
        // Círculo y etiqueta
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${((cum/total)*100).toFixed(0)}%`, x, y - 10);
    });
    ctx.stroke();
}

// --- REGLA MULTIPLICATIVA ---

function handleMultiplicativeRule() {
    const steps = [];
    for (let i = 1; i <= 3; i++) {
        const n = document.getElementById(`step-${i}-name`)?.value.trim();
        const o = document.getElementById(`step-${i}-options`)?.value.trim();
        if (n && o) steps.push({ name: n, options: o.split(',').map(s => s.trim()).filter(Boolean) });
    }

    if (steps.length < 2) { return alert("Mínimo Paso 1 y 2."); }

    const container = document.getElementById('tree-results-container');
    if (container) container.style.display = 'block';

    let total = 1;
    let html = '<ul>';
    steps.forEach((s, i) => { total *= s.options.length; html += `<li>${s.name}: ${s.options.length}</li>`; });
    html += `<li>Total: ${total}</li></ul>`;
    
    const proc = document.getElementById('tree-procedure'); if (proc) proc.innerHTML = html;
    const tot = document.getElementById('tree-total'); if (tot) tot.textContent = total;
    const diag = document.getElementById('tree-diagram-text'); if (diag) diag.textContent = generateTreeText(steps);
}

function generateTreeText(steps) {
    let t = "Inicio\n";
    steps[0].options.forEach((o1, i1) => {
        const isL1 = i1 === steps[0].options.length - 1;
        t += `${isL1 ? '└── ' : '├── '}${o1}\n`;
        steps[1].options.forEach((o2, i2) => {
            const isL2 = i2 === steps[1].options.length - 1;
            t += `${isL1 ? '    ' : '│   '}${isL2 ? '└── ' : '├── '}${o2}\n`;
            if (steps[2]) {
                steps[2].options.forEach((o3, i3) => {
                    const isL3 = i3 === steps[2].options.length - 1;
                    t += `${isL1 ? '    ' : '│   '}${isL2 ? '    ' : '│   '}${isL3 ? '└── ' : '├── '}${o3}\n`;
                });
            }
        });
    });
    return t;
}

function generateRandomTreeInputs() {
    const sets = [[{n:"Moneda", o:"Cara,Cruz"}, {n:"Dado", o:"1,2,3"}, {n:"Color", o:"R,V"}]];
    const s = sets[0];
    s.forEach((x, i) => { 
        const nInput = document.getElementById(`step-${i+1}-name`);
        const oInput = document.getElementById(`step-${i+1}-options`);
        if (nInput) nInput.value = x.n;
        if (oInput) oInput.value = x.o;
    });
}

// --- OTROS ---
function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
function handlePermutation() { 
    const n = parseInt(document.getElementById('n-input').value);
    const r = parseInt(document.getElementById('r-input').value);
    document.getElementById('perm-result').textContent = (factorial(n)/factorial(n-r)).toLocaleString();
}
function handleCombination() {
    const n = parseInt(document.getElementById('n-input').value);
    const r = parseInt(document.getElementById('r-input').value);
    document.getElementById('comb-result').textContent = (factorial(n)/(factorial(r)*factorial(n-r))).toLocaleString();
}
function handleUnion() { const a = new Set(document.getElementById('set-a').value.split(',').map(s=>s.trim())), b = new Set(document.getElementById('set-b').value.split(',').map(s=>s.trim())); document.getElementById('set-result').textContent = `{${[...new Set([...a, ...b])].join(', ')}}`; }
function handleIntersection() { const a = new Set(document.getElementById('set-a').value.split(',').map(s=>s.trim())), b = new Set(document.getElementById('set-b').value.split(',').map(s=>s.trim())); document.getElementById('set-result').textContent = `{${[...a].filter(x => b.has(x)).join(', ')}}`; }
function handleDifference() { const a = new Set(document.getElementById('set-a').value.split(',').map(s=>s.trim())), b = new Set(document.getElementById('set-b').value.split(',').map(s=>s.trim())); document.getElementById('set-result').textContent = `{${[...a].filter(x => !b.has(x)).join(', ')}}`; }
