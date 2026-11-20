lucide.createIcons();

/* --------------------------------------------------------------------------
   1. THEME TOGGLE
   -------------------------------------------------------------------------- */
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const themeText = document.getElementById('themeToggleText');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  themeText.textContent = theme === 'dark' ? 'INVERT' : 'REVERT';
  if (window.updateThreeTheme) {
    window.updateThreeTheme(theme);
  }
  if (window.currentChartKey) {
    renderChart(window.currentChartKey);
  }
}

const savedTheme = localStorage.getItem('portfolio-theme') || 
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

window.addEventListener('keydown', (e) => {
  if ((e.key === 't' || e.key === 'T') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }
});

/* --------------------------------------------------------------------------
   2. THREE.JS 3D WIREFRAME MANIFOLD
   -------------------------------------------------------------------------- */
(function initThreeBackground() {
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 36);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const xSize = 50, zSize = 50, segments = 38;
  const geometry = new THREE.PlaneGeometry(xSize, zSize, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 3.2 + Math.sin(Math.sqrt(x*x + z*z) * 0.3) * 1.5;
    pos.setY(i, y);
  }
  geometry.computeVertexNormals();

  let isDark = root.getAttribute('data-theme') === 'dark';
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0x282828 : 0xd8d8d8,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  const mesh = new THREE.Mesh(geometry, wireframeMat);
  scene.add(mesh);

  const pointsMat = new THREE.PointsMaterial({
    color: isDark ? 0x666666 : 0x444444,
    size: 0.11,
    transparent: true,
    opacity: 0.7
  });
  const points = new THREE.Points(geometry, pointsMat);
  scene.add(points);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.updateThreeTheme = function(theme) {
    const dark = theme === 'dark';
    wireframeMat.color.setHex(dark ? 0x282828 : 0xd8d8d8);
    pointsMat.color.setHex(dark ? 0x666666 : 0x444444);
  };

  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = Math.sin(x * 0.25 + elapsed * 0.35) * Math.cos(z * 0.25 + elapsed * 0.25) * 2.8 
              + Math.sin(Math.sqrt(x*x + z*z) * 0.3 - elapsed * 0.45) * 1.3;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;

    mesh.rotation.y += (mouseX * 0.18 - mesh.rotation.y) * 0.03;
    mesh.rotation.x += (mouseY * 0.1 - mesh.rotation.x) * 0.03;
    points.rotation.y = mesh.rotation.y;
    points.rotation.x = mesh.rotation.x;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* --------------------------------------------------------------------------
   3. EXPANDED VECTOR SVG CHARTS
   -------------------------------------------------------------------------- */
window.currentChartKey = 'muon';

function showChart(key, el) {
  document.querySelectorAll('.tel-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  window.currentChartKey = key;
  renderChart(key);
}

function renderChart(key) {
  const container = document.getElementById('chart-panel');
  const isDark = root.getAttribute('data-theme') === 'dark';

  const cMain = isDark ? '#ffffff' : '#000000';
  const cMuted = isDark ? '#666666' : '#999999';
  const cLight = isDark ? '#383838' : '#cccccc';

  if (key === 'muon') {
    container.innerHTML = `
      <div class="graph-card">
        <div class="graph-header">
          <span class="graph-title">FIGURE 16: VAL-LOSS TAIL — MUON VS ADAMW (STEPS 7K–15.2K)</span>
          <span class="graph-caption">FineWeb-Edu 1B Tokens // Single-Axis Ablation</span>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 760 280" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Grid Lines -->
            <line x1="60" y1="40" x2="520" y2="40" class="chart-grid" />
            <line x1="60" y1="90" x2="520" y2="90" class="chart-grid" />
            <line x1="60" y1="140" x2="520" y2="140" class="chart-grid" />
            <line x1="60" y1="190" x2="520" y2="190" class="chart-grid" />
            <line x1="60" y1="240" x2="520" y2="240" class="chart-grid" />

            <!-- Axes -->
            <line x1="60" y1="240" x2="520" y2="240" class="chart-axis" />
            <line x1="60" y1="30" x2="60" y2="240" class="chart-axis" />

            <!-- Y-Labels -->
            <text x="50" y="44" class="chart-label" text-anchor="end">3.60</text>
            <text x="50" y="94" class="chart-label" text-anchor="end">3.55</text>
            <text x="50" y="144" class="chart-label" text-anchor="end">3.50</text>
            <text x="50" y="194" class="chart-label" text-anchor="end">3.45</text>
            <text x="50" y="244" class="chart-label" text-anchor="end">3.40</text>

            <!-- X-Labels -->
            <text x="60" y="258" class="chart-label" text-anchor="middle">7k</text>
            <text x="175" y="258" class="chart-label" text-anchor="middle">9k</text>
            <text x="290" y="258" class="chart-label" text-anchor="middle">11k</text>
            <text x="405" y="258" class="chart-label" text-anchor="middle">13k</text>
            <text x="520" y="258" class="chart-label" text-anchor="middle">15.2k</text>

            <!-- M21: GQA+Muon-v2 lr=0.02 (Dashed line) -->
            <path d="M 60,65 Q 200,90 350,110 T 520,122" fill="none" stroke="${cMuted}" stroke-width="1.8" stroke-dasharray="4 3" />
            <text x="530" y="125" class="chart-label" text-anchor="start">M21 (lr 0.02, 32.57 PPL)</text>

            <!-- M08 / M12: GQA+AdamW & plain Muon (Solid Light line) -->
            <path d="M 60,78 Q 200,115 350,135 T 520,152" fill="none" stroke="${cLight}" stroke-width="2" />
            <text x="530" y="155" class="chart-label" text-anchor="start">M08 / M12 (32.10 PPL)</text>

            <!-- M28: GQA+Muon-v2 RETUNED lr=0.01 (Bold Solid line) -->
            <path d="M 60,95 Q 200,140 350,175 T 520,195" fill="none" stroke="${cMain}" stroke-width="2.5" />
            <text x="530" y="198" class="chart-label" text-anchor="start" style="font-weight:700; fill:${cMain};">M28 (lr 0.01, 31.08 PPL) ★</text>

            <!-- M11: MHA+RoPE+Muon (Dotted line) -->
            <path d="M 60,115 Q 200,165 350,205 T 520,225" fill="none" stroke="${cMain}" stroke-width="1.8" stroke-dasharray="2 2" />
            <text x="530" y="228" class="chart-label" text-anchor="start">M11 (MHA+Muon, 30.54 PPL)</text>
          </svg>
        </div>

        <div class="stat-row-grid">
          <div class="stat-item">
            <div class="stat-item-label">MHA+Muon Gain (M11)</div>
            <div class="stat-item-val">-0.73 PPL</div>
            <div class="stat-item-sub">31.27 → 30.54 PPL</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">GQA Muon-v2 Retuned (M28)</div>
            <div class="stat-item-val">-1.01 PPL</div>
            <div class="stat-item-sub">32.09 → 31.08 PPL (lr=0.01)</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">Sign-Flip Finding</div>
            <div class="stat-item-val">2-Knob Package</div>
            <div class="stat-item-sub">Shape scaling + step size</div>
          </div>
        </div>

        <div class="log-terminal">
          [PROPOSITION 1 VALIDATION] Correcting Muon update scaling for non-square 4:1 projections at untuned lr=0.02 caused regression (32.57 PPL). Halving muon_lr to 0.01 (M28) produced -1.01 PPL gain, proving shape correction and step size must move together.
        </div>
      </div>
    `;
  } else if (key === 'mla') {
    container.innerHTML = `
      <div class="graph-card">
        <div class="graph-header">
          <span class="graph-title">FIGURE 11 & 12: MLA LATENT CAPACITY VS. KV-CACHE COMPRESSION</span>
          <span class="graph-caption">Proposition 3 Direct Test // Rank 64 → Rank 256 → Decoupled RoPE</span>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 760 280" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Axes -->
            <line x1="70" y1="230" x2="710" y2="230" class="chart-axis" />
            <line x1="70" y1="30" x2="70" y2="230" class="chart-axis" />

            <!-- Grid -->
            <line x1="70" y1="70" x2="710" y2="70" class="chart-grid" />
            <line x1="70" y1="120" x2="710" y2="120" class="chart-grid" />
            <line x1="70" y1="170" x2="710" y2="170" class="chart-grid" />

            <!-- Y-Labels -->
            <text x="60" y="74" class="chart-label" text-anchor="end">38.0</text>
            <text x="60" y="124" class="chart-label" text-anchor="end">35.0</text>
            <text x="60" y="174" class="chart-label" text-anchor="end">32.0</text>
            <text x="60" y="224" class="chart-label" text-anchor="end">30.0</text>

            <!-- Bars -->
            <rect x="110" y="66" width="70" height="164" fill="${cMuted}" />
            <text x="145" y="58" class="chart-label" text-anchor="middle">38.28</text>
            <text x="145" y="248" class="chart-label" text-anchor="middle">M05 (r=64)</text>

            <rect x="240" y="139" width="70" height="91" fill="${cMuted}" />
            <text x="275" y="131" class="chart-label" text-anchor="middle">33.84</text>
            <text x="275" y="248" class="chart-label" text-anchor="middle">M09 (+RoPE)</text>

            <rect x="370" y="171" width="70" height="59" fill="${cLight}" stroke="${cMain}" stroke-width="1.5" />
            <text x="405" y="163" class="chart-label" text-anchor="middle">-1.94 ↓</text>
            <text x="405" y="248" class="chart-label" text-anchor="middle">M20 (r=256)</text>

            <rect x="500" y="183" width="70" height="47" fill="${cMain}" />
            <text x="535" y="175" class="chart-label" text-anchor="middle" style="font-weight:700; fill:${cMain};">31.22 ★</text>
            <text x="535" y="248" class="chart-label" text-anchor="middle" style="font-weight:700;">M29 (Decoupled)</text>

            <!-- GQA Baseline -->
            <line x1="70" y1="168" x2="710" y2="168" stroke="${cMain}" stroke-width="1.5" stroke-dasharray="3 3" />
            <text x="705" y="163" class="chart-label" text-anchor="end">GQA Baseline: 32.10 PPL</text>
          </svg>
        </div>

        <div class="stat-row-grid">
          <div class="stat-item">
            <div class="stat-item-label">Latent Capacity Recovery</div>
            <div class="stat-item-val">-1.94 PPL</div>
            <div class="stat-item-sub">r=64 (33.84) → r=256 (31.90)</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">Decoupled RoPE Branch</div>
            <div class="stat-item-val">31.22 PPL</div>
            <div class="stat-item-sub">Beats GQA at 384 cached dims</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">KV-Cache Footprint</div>
            <div class="stat-item-val">2.7× Smaller</div>
            <div class="stat-item-sub">384 vs 1024 dims/token of MHA</div>
          </div>
        </div>

        <div class="log-terminal">
          [PROPOSITION 3 VALIDATION] At r=64, composite key/value map is bounded at 6-8% of peak singular value at ceiling (rank-saturation). Widening to r=256 lowers trailing singular values to ~0.5% of peak, eliminating the capacity bottleneck.
        </div>
      </div>
    `;
  } else if (key === 'kda') {
    container.innerHTML = `
      <div class="graph-card">
        <div class="graph-header">
          <span class="graph-title">FIGURE 17 & 23: PROPOSITION 2 — KDA RECALL DISSOCIATION</span>
          <span class="graph-caption">Kimi Delta Attention (M19) vs Softmax Baselines (M11, M06, M10)</span>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 760 280" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Subplot 1: LAMBADA Recall -->
            <line x1="50" y1="230" x2="330" y2="230" class="chart-axis" />
            <line x1="50" y1="40" x2="50" y2="230" class="chart-axis" />
            <text x="190" y="30" class="chart-label" text-anchor="middle" style="font-weight:700; fill:${cMain};">LAMBADA (Exact Recall)</text>

            <rect x="75" y="86" width="55" height="144" fill="${cLight}" />
            <text x="102" y="78" class="chart-label" text-anchor="middle">.180</text>
            <text x="102" y="248" class="chart-label" text-anchor="middle">M11</text>

            <rect x="150" y="74" width="55" height="156" fill="${cLight}" />
            <text x="177" y="66" class="chart-label" text-anchor="middle">.196</text>
            <text x="177" y="248" class="chart-label" text-anchor="middle">M10</text>

            <rect x="225" y="137" width="55" height="93" fill="${cMain}" />
            <text x="252" y="129" class="chart-label" text-anchor="middle" style="font-weight:700; fill:${cMain};">.116 ↓</text>
            <text x="252" y="248" class="chart-label" text-anchor="middle" style="font-weight:700;">M19 (KDA)</text>

            <!-- Subplot 2: BLiMP Grammar -->
            <line x1="410" y1="230" x2="690" y2="230" class="chart-axis" />
            <line x1="410" y1="40" x2="410" y2="230" class="chart-axis" />
            <text x="550" y="30" class="chart-label" text-anchor="middle" style="font-weight:700; fill:${cMain};">BLiMP (Local Grammar)</text>

            <rect x="435" y="60" width="55" height="170" fill="${cLight}" />
            <text x="462" y="52" class="chart-label" text-anchor="middle">.772</text>
            <text x="462" y="248" class="chart-label" text-anchor="middle">M11</text>

            <rect x="510" y="53" width="55" height="177" fill="${cLight}" />
            <text x="537" y="45" class="chart-label" text-anchor="middle">.781</text>
            <text x="537" y="248" class="chart-label" text-anchor="middle">M10</text>

            <rect x="585" y="52" width="55" height="178" fill="${cMain}" />
            <text x="612" y="44" class="chart-label" text-anchor="middle" style="font-weight:700; fill:${cMain};">.782 ★</text>
            <text x="612" y="248" class="chart-label" text-anchor="middle" style="font-weight:700;">M19 (KDA)</text>
          </svg>
        </div>

        <div class="stat-row-grid">
          <div class="stat-item">
            <div class="stat-item-label">LAMBADA Accuracy</div>
            <div class="stat-item-val">0.116 (Worst)</div>
            <div class="stat-item-sub">Finite-state bottleneck (Prop 2)</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">BLiMP Grammar Accuracy</div>
            <div class="stat-item-val">0.782 (Top-Tier)</div>
            <div class="stat-item-sub">Beats standard softmax runs</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">Memory Complexity</div>
            <div class="stat-item-val">O(1) Fixed State</div>
            <div class="stat-item-sub">No growing K/V cache buffer</div>
          </div>
        </div>

        <div class="log-terminal">
          [PROPOSITION 2 VALIDATION] KDA's fixed d×d state factors associative retrieval through a d² bottleneck. Once stored keys exceed head dim d=64, exact recall suffers while local grammatical syntax remains completely intact.
        </div>
      </div>
    `;
  } else if (key === 'codemind') {
    container.innerHTML = `
      <div class="graph-card">
        <div class="graph-header">
          <span class="graph-title">CODEMIND-1B: PRE-TRAINING CONVERGENCE (147M TOKENS / $10 RUN)</span>
          <span class="graph-caption">PyTorch Vectorized Pipeline // 8GB RTX 5060 Smoke-Tested → A40 Cloud</span>
        </div>

        <div class="svg-container">
          <svg viewBox="0 0 760 280" class="chart-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Axes -->
            <line x1="60" y1="230" x2="680" y2="230" class="chart-axis" />
            <line x1="60" y1="30" x2="60" y2="230" class="chart-axis" />

            <!-- Grid -->
            <line x1="60" y1="50" x2="680" y2="50" class="chart-grid" />
            <line x1="60" y1="100" x2="680" y2="100" class="chart-grid" />
            <line x1="60" y1="150" x2="680" y2="150" class="chart-grid" />
            <line x1="60" y1="200" x2="680" y2="200" class="chart-grid" />

            <!-- Y-Labels -->
            <text x="50" y="54" class="chart-label" text-anchor="end">10.5</text>
            <text x="50" y="104" class="chart-label" text-anchor="end">8.0</text>
            <text x="50" y="154" class="chart-label" text-anchor="end">6.0</text>
            <text x="50" y="204" class="chart-label" text-anchor="end">4.0</text>

            <!-- X-Labels -->
            <text x="60" y="248" class="chart-label" text-anchor="middle">0M</text>
            <text x="215" y="248" class="chart-label" text-anchor="middle">40M</text>
            <text x="370" y="248" class="chart-label" text-anchor="middle">80M</text>
            <text x="525" y="248" class="chart-label" text-anchor="middle">120M</text>
            <text x="680" y="248" class="chart-label" text-anchor="middle">147M</text>

            <!-- Loss Curve -->
            <path d="M 60,50 Q 110,160 215,185 T 450,198 T 680,204" fill="none" stroke="${cMain}" stroke-width="2.5" />
            <text x="685" y="207" class="chart-label" text-anchor="start" style="font-weight:700; fill:${cMain};">Loss: ~4.0</text>

            <!-- MoE lb_loss -->
            <path d="M 60,225 Q 150,220 300,222 T 680,221" fill="none" stroke="${cMuted}" stroke-width="1.8" stroke-dasharray="3 3" />
            <text x="685" y="224" class="chart-label" text-anchor="start">lb_loss: 0.37</text>
          </svg>
        </div>

        <div class="stat-row-grid">
          <div class="stat-item">
            <div class="stat-item-label">Sustained Throughput</div>
            <div class="stat-item-val">1,940 Tok/s</div>
            <div class="stat-item-sub">PyArrow streaming + C-CE</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">Gradient Stability</div>
            <div class="stat-item-val">[1.0, 5.0]</div>
            <div class="stat-item-sub">Bounded grad norm under Muon</div>
          </div>
          <div class="stat-item">
            <div class="stat-item-label">MoE Routing Health</div>
            <div class="stat-item-val">H = 0.99</div>
            <div class="stat-item-sub">Zero expert collapse (lb_loss ~0.37)</div>
          </div>
        </div>

        <div class="log-terminal">
          [SYSTEM PERFORMANCE LOG] Phase-1 model trained across 3 continuous checkpointed runs on NVIDIA A40 (48GB) for 21 hours ($10 budget). Muon momentum state-dict loading perfectly preserved orthogonal buffers without loss spikes.
        </div>
      </div>
    `;
  }
}

renderChart('muon');

/* --------------------------------------------------------------------------
   4. BIBTEX ACTIONS
   -------------------------------------------------------------------------- */
const bibModal = document.getElementById('bibtexModal');
function openBibtex() {
  bibModal.classList.add('open');
}
function closeBibtex(e) {
  if (!e || e.target === bibModal || e.target.classList.contains('modal-close')) {
    bibModal.classList.remove('open');
  }
}
function copyBibtex() {
  const text = document.getElementById('bibtexContent').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBibBtn');
    btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> COPIED TO CLIPBOARD';
    lucide.createIcons();
    setTimeout(() => {
      btn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px;"></i> COPY TO CLIPBOARD';
      lucide.createIcons();
    }, 2000);
  });
}
