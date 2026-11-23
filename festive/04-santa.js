'use strict';
// 4 ─ CHOCOLATE SANTA (a foil-wrapped chocolate Santa; one soft convex bell shape)
FESTIVE_TIERS[4] = {
  key: 'santa', name: 'Chocolate Santa', plural: 'Chocolate Santas', r: 39, k: 0.7643, outline: '#7a1424',
  // bell / egg: [x, y, radius] discs whose convex hull is the figure (units of r)
  discs: [[0, -0.727, 0.353], [-0.507, 0.551, 0.485], [0.507, 0.551, 0.485]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 48, x * r, y * r)); return [pts]; },
  face: { x: 0, y: -0.16, s: 0.37 },
  crumbs: ['#d8323f', '#ffffff', '#5c311c', '#ffd84a'],
  paint(c, r, R) {
    // ── little helpers (all coordinates in units of r) ──
    const loop = (pts, seg = 10) => {   // closed Catmull-Rom curve through [x, y] points → Path2D
      const n = pts.length, p = new Path2D();
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        for (let j = 0; j < seg; j++) {
          const t = j / seg, t2 = t * t, t3 = t2 * t;
          const f = k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
          (i || j) ? p.lineTo(f(0) * r, f(1) * r) : p.moveTo(f(0) * r, f(1) * r);
        }
      }
      p.closePath(); return p;
    };
    const poly = pts => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x * r, y * r) : p.moveTo(x * r, y * r))); p.closePath(); return p; };
    const disc = (p, x, y, s) => { p.moveTo((x + s) * r, y * r); p.arc(x * r, y * r, s * r, 0, TAU); return p; };
    // white print on the foil: a dark rim behind (stroke-then-fill leaves only the outer contour), silvery white
    const silver = (p, x0, y0, x1, y1, rim = 0.045, drop = 0.03) => {
      if (drop) { c.save(); c.translate(0.012 * r, drop * r); c.fillStyle = 'rgba(70,0,10,0.35)'; c.fill(p); c.restore(); }
      c.lineJoin = 'round'; c.strokeStyle = '#86606a'; c.lineWidth = rim * r; c.stroke(p);
      c.fillStyle = lg(c, x0 * r, y0 * r, x1 * r, y1 * r, [[0, '#ffffff'], [0.45, '#fbf9f8'], [0.78, '#e8e5ee'], [1, '#c8c3d4']]); c.fill(p);
    };
    const curl = (x, y, s, a, sweep = 3.4) => {
      c.strokeStyle = 'rgba(140,128,160,0.55)'; c.lineWidth = 0.028 * r;
      c.beginPath(); c.arc(x * r, y * r, s * r, a, a + sweep); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.02 * r;
      c.beginPath(); c.arc((x - 0.012) * r, (y - 0.02) * r, s * 0.78 * r, a + 0.5, a + sweep * 0.7); c.stroke();
    };

    // ── crumpled foil: a jittered triangle mesh; every facet catches the light a little differently ──
    const N = 17, G = 2.4 / N, V = [];
    for (let j = 0; j <= N; j++) { V.push([]); for (let i = 0; i <= N; i++) V[j].push([-1.2 + i * G + (i && i < N ? (R() - 0.5) * 0.75 * G : 0), -1.2 + j * G + (j && j < N ? (R() - 0.5) * 0.75 * G : 0)]); }
    const facets = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = V[j][i], b = V[j][i + 1], d = V[j + 1][i], e = V[j + 1][i + 1];
      const tris = R() < 0.5 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
      for (const t of tris) facets.push({ t, k: R() * 2 - 1, s: R() });
    }
    // where the light lands on a bell lit from the top left: a broad band left of centre, a thin rim on the right
    const band = (x, y) => Math.exp(-Math.pow((x + 0.36 + 0.1 * y) / 0.17, 2)) * (y < 0.95 ? 1 : 0.4);
    const rim = (x, y) => Math.exp(-Math.pow((x - 0.78 - 0.12 * y) / 0.08, 2));
    // the crinkles show mostly where the light falls; elsewhere the foil stays calm
    const foil = (dark, light, shine) => {
      for (const f of facets) {
        const [p, q, s] = f.t, cx = (p[0] + q[0] + s[0]) / 3, cy = (p[1] + q[1] + s[1]) / 3;
        const tri = poly(f.t), L = band(cx, cy) + 0.7 * rim(cx, cy), w = 0.3 + 0.7 * Math.min(1, L);
        if (f.k < 0) { c.fillStyle = `rgba(70,0,12,${-f.k * dark * w})`; c.fill(tri); }
        else { c.fillStyle = `rgba(255,215,215,${f.k * light * w})`; c.fill(tri); }
        const hl = shine * L * f.s * f.s;
        if (hl > 0.02) { c.fillStyle = `rgba(255,238,238,${hl})`; c.fill(tri); }
      }
    };
    // a few crinkle lines: a dark crease with a lit lip beside it
    const crinkle = pts => {
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(0.008 * r, 0.014 * r); c.strokeStyle = 'rgba(70,0,12,0.35)'; c.lineWidth = 0.03 * r; strokePts(c, pts.map(([x, y]) => ({ x: x * r, y: y * r }))); c.restore();
      c.strokeStyle = 'rgba(255,205,205,0.3)'; c.lineWidth = 0.02 * r; strokePts(c, pts.map(([x, y]) => ({ x: x * r, y: y * r })));
    };

    // ── red foil, everywhere ──
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, '#86101f'], [0.12, '#b8192c'], [0.3, '#e23646'], [0.45, '#d42536'], [0.66, '#b8192c'], [0.85, '#8f0f1f'], [0.93, '#b02536'], [1, '#6e0a17']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, 0, -1.1 * r, 0, 1.1 * r, [[0, 'rgba(255,200,200,0.1)'], [0.5, 'rgba(90,0,10,0)'], [1, 'rgba(70,0,10,0.25)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    foil(0.2, 0.14, 0.5);
    for (const k of [[[-0.34, -0.47], [-0.27, -0.55], [-0.28, -0.62]], [[0.26, 0.84], [0.36, 0.87], [0.46, 0.85], [0.56, 0.89]], [[0.5, 0.94], [0.6, 0.95], [0.7, 0.91]], [[-0.3, 0.88], [-0.22, 0.92]]]) crinkle(k);

    // ── hat: the cone bends a little to the right; a fold shadow and a lit ridge ──
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(80,0,12,0.5)'; c.lineWidth = 0.05 * r;
    c.beginPath(); c.moveTo(0.34 * r, -0.44 * r); c.quadraticCurveTo(0.26 * r, -0.62 * r, 0.12 * r, -0.74 * r); c.stroke();
    c.strokeStyle = 'rgba(255,190,190,0.45)'; c.lineWidth = 0.025 * r;
    c.beginPath(); c.moveTo(0.3 * r, -0.44 * r); c.quadraticCurveTo(0.22 * r, -0.6 * r, 0.1 * r, -0.71 * r); c.stroke();

    // ── arms: the forearms come round the tummy; a white cuff and a dark mitten at the end of each ──
    for (const s of [-1, 1]) {
      const ex = s * 0.95, ey = 0.2, wx = s * 0.6, wy = 0.42, a = Math.atan2(wy - ey, wx - ex);
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(70,0,12,0.65)'; c.lineWidth = 0.25 * r;
      c.beginPath(); c.moveTo(ex * r, ey * r); c.lineTo(wx * r, wy * r); c.stroke();
      c.strokeStyle = lg(c, 0, (wy - 0.12) * r, 0, (wy + 0.1) * r, [[0, '#e8404f'], [0.5, '#c11d2f'], [1, '#8a0f1f']]); c.lineWidth = 0.2 * r;
      c.beginPath(); c.moveTo(ex * r, ey * r); c.lineTo(wx * r, wy * r); c.stroke();
      c.strokeStyle = 'rgba(255,200,200,0.45)'; c.lineWidth = 0.03 * r;
      c.beginPath(); c.moveTo((ex - s * 0.02) * r, (ey - 0.07) * r); c.lineTo((wx + s * 0.06) * r, (wy - 0.08) * r); c.stroke();
      c.save(); c.translate(wx * r, wy * r); c.rotate(a);
      // mitten (along the arm, thumb on top)
      const mit = new Path2D();
      mit.ellipse(0.13 * r, 0, 0.11 * r, 0.095 * r, 0, 0, TAU);
      mit.moveTo(0.14 * r, s * 0.085 * r); mit.ellipse(0.1 * r, s * 0.088 * r, 0.052 * r, 0.04 * r, s * 0.5, 0, TAU);
      c.save(); c.translate(0, 0.02 * r); c.fillStyle = 'rgba(40,0,8,0.4)'; c.fill(mit); c.restore();
      c.strokeStyle = '#120a0e'; c.lineWidth = 0.04 * r; c.stroke(mit);
      c.fillStyle = rg(c, 0.11 * r, s * 0.035 * r, 0, 0.13 * r, 0, 0.13 * r, [[0, '#615a60'], [0.5, '#2c262a'], [1, '#100b0e']]); c.fill(mit);
      ell(c, 0.12 * r, s * 0.04 * r, 0.04 * r, 0.017 * r, 0); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
      // fur cuff: a puffy band round the wrist
      const cuff = new Path2D();
      cuff.ellipse(0, 0, 0.042 * r, 0.11 * r, 0, 0, TAU);
      for (const t of [-0.07, 0, 0.07]) disc(cuff, 0.008, t, 0.04);
      silver(cuff, -0.04, -0.11, 0.04, 0.11, 0.032, 0.015);
      c.restore();
    }

    // ── beard: a big white cloud with wavy locks at the bottom ──
    const beard = loop([[-0.4, -0.34], [-0.5, -0.2], [-0.56, 0.0], [-0.55, 0.17], [-0.5, 0.3], [-0.44, 0.36], [-0.38, 0.45], [-0.28, 0.46], [-0.2, 0.53], [-0.1, 0.53], [0, 0.6], [0.1, 0.53], [0.2, 0.53], [0.28, 0.46], [0.38, 0.45], [0.44, 0.36], [0.5, 0.3], [0.55, 0.17], [0.56, 0.0], [0.5, -0.2], [0.4, -0.34], [0, -0.3]], 8);
    silver(beard, -0.5, -0.3, 0.5, 0.55, 0.05);
    c.save(); c.clip(beard);
    // volume: the beard bulges, so its edges turn away into a cool shade
    c.fillStyle = rg(c, -0.12 * r, 0.02 * r, 0.1 * r, 0, 0.12 * r, 0.62 * r, [[0, 'rgba(150,140,180,0)'], [0.65, 'rgba(150,140,180,0.1)'], [1, 'rgba(140,128,172,0.42)']]); c.fill(beard);
    // the locks: grooves running up from the dips of the wavy hem
    c.lineCap = 'round';
    for (const [x0, y0, x1, y1] of [[-0.42, 0.37, -0.34, 0.24], [-0.24, 0.49, -0.2, 0.34], [-0.05, 0.55, -0.04, 0.4], [0.05, 0.55, 0.04, 0.4], [0.24, 0.49, 0.2, 0.34], [0.42, 0.37, 0.34, 0.24]]) {
      c.strokeStyle = 'rgba(140,128,165,0.5)'; c.lineWidth = 0.03 * r;
      c.beginPath(); c.moveTo(x0 * r, y0 * r); c.quadraticCurveTo((x0 + x1) / 2 * r + 0.03 * r * Math.sign(x0), (y0 + y1) / 2 * r, x1 * r, y1 * r); c.stroke();
    }
    for (const [x, y, s, a] of [[-0.42, 0.06, 0.075, 0.5], [-0.26, 0.2, 0.08, 1.0], [0, 0.28, 0.08, 1.3], [0.26, 0.2, 0.08, 1.9], [0.42, 0.06, 0.075, 2.4], [-0.45, -0.15, 0.065, 0.2], [0.45, -0.15, 0.065, 2.7]]) curl(x, y, s, a);
    // a bright rim along the lit upper left
    c.save(); c.translate(0.025 * r, 0.03 * r); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.035 * r; c.stroke(beard); c.restore();
    c.restore();

    // ── face: skin between the fur brim and the beard (the game draws eyes, mouth and blush on it) ──
    const skin = new Path2D(); skin.ellipse(0, -0.17 * r, 0.36 * r, 0.18 * r, 0, 0, TAU);
    c.strokeStyle = 'rgba(165,100,90,0.6)'; c.lineWidth = 0.03 * r; c.stroke(skin);
    c.fillStyle = rg(c, -0.06 * r, -0.22 * r, 0, 0, -0.17 * r, 0.37 * r, [[0, '#ffe7d4'], [0.6, '#fbcfae'], [1, '#e9a585']]); c.fill(skin);
    // moustache: two plump locks just under the mouth, sweeping out and curling up at the ends
    const lobe = s => loop([[0.015 * s, -0.04], [0.1 * s, -0.055], [0.2 * s, -0.06], [0.28 * s, -0.08], [0.33 * s, -0.12], [0.37 * s, -0.09], [0.34 * s, -0.03], [0.24 * s, 0.015], [0.12 * s, 0.035], [0.03 * s, 0.03]], 8);
    for (const s of [-1, 1]) {
      const m = lobe(s); silver(m, -0.15, -0.09, 0.15, 0.04, 0.032, 0.022);
      c.save(); c.clip(m);
      c.fillStyle = lg(c, 0, -0.06 * r, 0, 0.04 * r, [[0, 'rgba(150,140,180,0)'], [0.5, 'rgba(150,140,180,0)'], [1, 'rgba(140,128,172,0.4)']]); c.fill(m);
      c.strokeStyle = 'rgba(140,128,165,0.5)'; c.lineWidth = 0.022 * r; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s * 0.08 * r, 0.0); c.quadraticCurveTo(s * 0.2 * r, -0.005 * r, s * 0.3 * r, -0.06 * r); c.stroke();
      c.restore();
    }

    // ── fur brim of the hat: a puffy band, slightly arched ──
    const by = x => -0.37 + 0.06 * x * x;
    const brim = new Path2D();
    brim.moveTo(-1.2 * r, (by(-1.2) - 0.07) * r);
    for (let x = -1.2; x <= 1.2001; x += 0.05) brim.lineTo(x * r, (by(x) - 0.07) * r);
    for (let x = 1.2; x >= -1.2001; x -= 0.05) brim.lineTo(x * r, (by(x) + 0.07) * r);
    brim.closePath();
    for (let x = -0.95, i = 0; x <= 0.95; x += 0.13 + 0.03 * Math.sin(i * 2.3), i++) {
      disc(brim, x, by(x) - 0.07 + 0.01 * Math.sin(i * 1.7), 0.045 + 0.012 * Math.sin(i * 3.1));
      disc(brim, x + 0.06, by(x + 0.06) + 0.07 - 0.008 * Math.sin(i * 2.1), 0.045 + 0.012 * Math.cos(i * 2.7));
    }
    silver(brim, -0.6, -0.48, 0.6, -0.26, 0.045);
    c.save(); c.clip(brim);
    c.fillStyle = lg(c, 0, (by(0) - 0.12) * r, 0, (by(0) + 0.14) * r, [[0, 'rgba(255,255,255,0)'], [0.55, 'rgba(160,150,180,0)'], [1, 'rgba(160,150,180,0.4)']]); c.fillRect(-r, -r, 2 * r, r);
    c.restore();

    // ── pompom ──
    const pom = new Path2D(), px = 0.07, py = -0.83, ps = 0.14;
    disc(pom, px, py, ps);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU + 0.2; disc(pom, px + Math.cos(a) * ps * 0.86, py + Math.sin(a) * ps * 0.86, ps * (0.34 + 0.06 * Math.sin(k * 2.4))); }
    silver(pom, px - ps, py - ps, px + ps, py + ps, 0.04);
    c.save(); c.clip(pom);
    c.fillStyle = rg(c, (px - 0.05) * r, (py - 0.06) * r, 0.04 * r, px * r, py * r, ps * 1.3 * r, [[0, 'rgba(160,150,180,0)'], [0.6, 'rgba(160,150,180,0.12)'], [1, 'rgba(150,140,175,0.5)']]); c.fill(pom);
    ell(c, (px - 0.05) * r, (py - 0.06) * r, 0.05 * r, 0.03 * r, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    c.restore();

    // ── coat: white trim down the front, belt with a gold buckle ──
    const trim = loop([[-0.1, 0.62], [0.1, 0.62], [0.11, 0.8], [0.12, 1.1], [-0.12, 1.1], [-0.11, 0.8]], 6);
    for (let y = 0.74, i = 0; y < 1.05; y += 0.085, i++) for (const s of [-1, 1]) disc(trim, s * (0.105 + 0.004 * i), y + (s > 0 ? 0.04 : 0), 0.04);
    silver(trim, -0.1, 0.6, 0.12, 1.0, 0.04);
    const beltY = x => 0.62 + 0.05 * (1 - x * x);
    const belt = new Path2D();
    belt.moveTo(-1.2 * r, (beltY(-1.2) - 0.075) * r);
    for (let x = -1.2; x <= 1.2001; x += 0.05) belt.lineTo(x * r, (beltY(x) - 0.075) * r);
    for (let x = 1.2; x >= -1.2001; x -= 0.05) belt.lineTo(x * r, (beltY(x) + 0.075) * r);
    belt.closePath();
    c.save(); c.translate(0, 0.03 * r); c.fillStyle = 'rgba(60,0,10,0.4)'; c.fill(belt); c.restore();
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, '#0e0a0c'], [0.28, '#3b3237'], [0.34, '#625a60'], [0.42, '#262024'], [1, '#0b0709']]); c.fill(belt);
    c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 0.02 * r;
    c.beginPath(); for (let x = -1; x <= 1.0001; x += 0.05) c.lineTo(x * r, (beltY(x) - 0.052) * r); c.stroke();
    const bk = new Path2D(), bw = 0.16, bh = 0.12, bcy = beltY(0);
    bk.roundRect(-bw * r, (bcy - bh) * r, 2 * bw * r, 2 * bh * r, 0.05 * r);
    bk.roundRect(-bw * 0.5 * r, (bcy - bh * 0.45) * r, bw * r, bh * 0.9 * r, 0.02 * r);
    c.save(); c.translate(0.01 * r, 0.025 * r); c.fillStyle = 'rgba(0,0,0,0.45)'; c.fill(bk, 'evenodd'); c.restore();
    c.fillStyle = lg(c, -bw * r, (bcy - bh) * r, bw * r, (bcy + bh) * r, [[0, '#fff3b0'], [0.35, '#ffd34a'], [0.7, '#d99a1c'], [1, '#9c6208']]); c.fill(bk, 'evenodd');
    c.strokeStyle = '#6e4206'; c.lineWidth = 0.022 * r; c.stroke(bk);

    // ── torn foil at the bottom left: milk chocolate shows through, the foil edge is silver ──
    // a ragged tear along a curve bowing into the corner
    const edge = [[-1.2, 0.34]];
    for (let i = 0, n = 15; i <= n; i++) {
      const t = i / n, u = 1 - t, A = [-1.02, 0.38], C = [-0.6, 0.62], B = [-0.3, 1.0];
      const x = u * u * A[0] + 2 * u * t * C[0] + t * t * B[0], y = u * u * A[1] + 2 * u * t * C[1] + t * t * B[1];
      const tx = 2 * u * (C[0] - A[0]) + 2 * t * (B[0] - C[0]), ty = 2 * u * (C[1] - A[1]) + 2 * t * (B[1] - C[1]), tl = Math.hypot(tx, ty);
      const j = (R() - 0.5) * 0.06 + (i % 3 === 1 ? 0.025 : 0);
      edge.push([x - (ty / tl) * j, y + (tx / tl) * j]);
    }
    edge.push([-0.28, 1.2]);
    const hole = poly([...edge, [-1.2, 1.2]]);
    c.save(); c.clip(hole);
    c.fillStyle = rg(c, -0.78 * r, 0.7 * r, 0, -0.68 * r, 0.82 * r, 0.48 * r, [[0, '#c4875a'], [0.35, '#9a5a32'], [0.75, '#6a3519'], [1, '#4a230d']]); c.fillRect(-1.2 * r, 0.3 * r, 0.9 * r, 0.95 * r);
    // the belt is moulded into the chocolate too
    c.beginPath(); for (let x = -1.2; x <= -0.2; x += 0.05) c.lineTo(x * r, (beltY(x) - 0.075) * r); for (let x = -0.2; x >= -1.2; x -= 0.05) c.lineTo(x * r, (beltY(x) + 0.075) * r); c.closePath();
    c.fillStyle = 'rgba(70,30,8,0.22)'; c.fill();
    c.strokeStyle = 'rgba(255,220,180,0.35)'; c.lineWidth = 0.022 * r;
    c.beginPath(); for (let x = -1.2; x <= -0.2; x += 0.05) c.lineTo(x * r, (beltY(x) - 0.07) * r); c.stroke();
    c.save(); c.translate(0.02 * r, 0.04 * r); c.strokeStyle = 'rgba(40,12,0,0.55)'; c.lineWidth = 0.06 * r; c.lineJoin = 'round'; c.stroke(poly(edge)); c.restore();
    // glossy chocolate: a soft sheen and a crisp glint
    c.lineCap = 'round'; c.strokeStyle = 'rgba(255,235,210,0.35)'; c.lineWidth = 0.07 * r;
    c.beginPath(); c.moveTo(-0.9 * r, 0.68 * r); c.quadraticCurveTo(-0.84 * r, 0.8 * r, -0.72 * r, 0.88 * r); c.stroke();
    c.strokeStyle = 'rgba(255,248,235,0.85)'; c.lineWidth = 0.026 * r;
    c.beginPath(); c.moveTo(-0.86 * r, 0.72 * r); c.quadraticCurveTo(-0.82 * r, 0.79 * r, -0.76 * r, 0.83 * r); c.stroke();
    c.restore();
    // the torn edge curls up and shows the silver back of the foil
    const lip = new Path2D(); edge.forEach(([x, y], i) => (i ? lip.lineTo(x * r, y * r) : lip.moveTo(x * r, y * r)));
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = '#5a4a56'; c.lineWidth = 0.05 * r; c.stroke(lip);
    const silverLG = lg(c, -0.9 * r, 0.5 * r, -0.4 * r, 1.0 * r, [[0, '#ffffff'], [0.5, '#d4d3de'], [1, '#f4f4f8']]);
    c.strokeStyle = silverLG; c.lineWidth = 0.026 * r; c.stroke(lip);
    // a little flap of foil folded back, silver side up
    const fp = edge[7], fq = edge[9];
    const flap = poly([fp, [fp[0] + 0.07, fp[1] - 0.07], [fq[0] + 0.06, fq[1] - 0.03], fq]);
    c.save(); c.translate(0.015 * r, 0.03 * r); c.fillStyle = 'rgba(60,0,10,0.45)'; c.fill(flap); c.restore();
    c.strokeStyle = '#5a4a56'; c.lineWidth = 0.03 * r; c.stroke(flap);
    c.fillStyle = lg(c, -0.72 * r, 0.6 * r, -0.56 * r, 0.74 * r, [[0, '#ffffff'], [0.45, '#e6e5ee'], [0.7, '#b9b7c6'], [1, '#efeff4']]); c.fill(flap);

    // ── the crinkles and the shine run over the print as well ──
    foil(0.06, 0.04, 0.25);
    // crisp glints where the foil faces the light
    for (const [x, y, a, b, rot, al] of [[-0.24, -0.62, 0.11, 0.026, -1.15, 0.85], [-0.8, 0.16, 0.1, 0.024, -1.3, 0.7], [0.84, 0.36, 0.06, 0.016, -1.2, 0.45]]) {
      ell(c, x * r, y * r, a * r, b * r, rot); c.fillStyle = `rgba(255,255,255,${al})`; c.fill();
    }
  },
};
