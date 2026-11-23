'use strict';
// 5 ─ MINCE PIE (mince pie seen from above, star lid — same collision shape as the classic Cinnamon Roll)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#8a4f22',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.03, s: 0.32 },
  crumbs: ['#e8b06c', '#f6d29b', '#ffffff', '#a8341c', '#e8782a'],
  RIN: 0.73,   // inner edge of the pastry rim (units of r)
  // rounded star outline (design units): 5 points, one pointing up
  star(r, R0, R1, tip = 0.2, notch = 0.16) {
    const pts = [];
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = (k % 2 ? R1 : R0) * r; pts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d }); }
    const path = new Path2D(), n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? notch : tip;
      const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
      i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
    }
    path.closePath();
    return path;
  },
  paint(c, r, R) {
    const RIN = this.RIN;
    // ── the pastry rim: one continuous, rounded band of shortcrust ──
    c.fillStyle = rg(c, 0, 0, RIN * r, 0, 0, r, [[0, '#f6d394'], [0.35, '#eebf78'], [0.75, '#dba25a'], [1, '#c4843e']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // lit from the top left, shaded bottom right
    c.fillStyle = lg(c, -0.8 * r, -0.8 * r, 0.8 * r, 0.8 * r, [[0, 'rgba(255,246,215,0.45)'], [0.5, 'rgba(255,246,215,0)'], [0.62, 'rgba(120,55,12,0)'], [1, 'rgba(120,55,12,0.3)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // a soft ridge along the middle of the band
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,240,205,0.4)'; c.lineWidth = 0.05 * r; c.beginPath(); c.arc(0, 0, 0.84 * r, 2.4, 5.4); c.stroke();
    // pinched crimp: soft slanted dents pressed into the outer half of the band
    const N = 22;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU, lit = Math.cos(a + 2.36);
      c.save(); c.rotate(a);
      const dent = new Path2D(); dent.moveTo(0.8 * r, -0.02 * r); dent.quadraticCurveTo(0.9 * r, 0.03 * r, 0.985 * r, 0.1 * r);
      c.strokeStyle = `rgba(125,58,14,${0.42 - 0.1 * lit})`; c.lineWidth = 0.05 * r; c.stroke(dent);
      c.save(); c.translate(-0.012 * r, -0.03 * r); c.strokeStyle = `rgba(255,238,200,${0.35 + 0.15 * lit})`; c.lineWidth = 0.028 * r; c.stroke(dent); c.restore();
      c.restore();
    }
    speckle(c, R, 40, R => { const a = R() * TAU, d = lerp(RIN + 0.04, 0.95, R()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d }; }, R => `rgba(150,80,25,${0.12 + R() * 0.15})`, r * 0.006, r * 0.013);
    // ── fruit mince: a clear mid red, darker than the pastry, lighter than a chocolate filling ──
    circ(c, 0, 0, RIN * r); c.fillStyle = rg(c, -0.1 * r, -0.12 * r, 0, 0, 0, RIN * r, [[0, '#a8452c'], [0.6, '#913424'], [1, '#7a2a1e']]); c.fill();
    c.save(); circ(c, 0, 0, RIN * r); c.clip();
    // chunky mince texture: currants, bits of apple and peel in a dark syrup
    for (let i = 0; i < 110; i++) {
      const a = R() * TAU, d = lerp(0.25, 0.75, Math.sqrt(R())) * r, x = Math.cos(a) * d, y = Math.sin(a) * d, s = lerp(0.022, 0.04, R()) * r, k = R();
      blobPath(c, x, y, s, R, 6, 0.45); c.fillStyle = k < 0.42 ? 'rgba(70,16,24,0.6)' : k < 0.7 ? 'rgba(196,96,52,0.5)' : k < 0.88 ? 'rgba(150,50,30,0.6)' : 'rgba(214,150,70,0.55)'; c.fill();
    }
    // a few big, readable pieces in the gaps of the star: raisins, glacé cherries, candied peel, sultanas
    // raisins: lumpy and wrinkled (smooth dark ovals would read as olives)
    const raisin = (x, y, s, rot) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      blobPath(c, 0.01 * r, 0.02 * r, s, R, 7, 0.4); c.fillStyle = 'rgba(50,8,0,0.4)'; c.fill();
      blobPath(c, 0, 0, s, R, 7, 0.4); c.fillStyle = '#3e1420'; c.fill();
      blobPath(c, -s * 0.15, -s * 0.2, s * 0.6, R, 6, 0.35); c.fillStyle = 'rgba(120,56,62,0.8)'; c.fill();
      circ(c, -s * 0.3, -s * 0.35, s * 0.16); c.fillStyle = 'rgba(255,225,215,0.6)'; c.fill();
      c.restore();
    };
    const cherry = (x, y, s) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.012 * r, y + 0.022 * r, s); c.fillStyle = 'rgba(50,8,0,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.35, 0, x, y, s, [[0, '#ff9a9a'], [0.45, '#ec2a42'], [1, '#a00e22']]); c.fill();
      c.strokeStyle = '#7a0818'; c.lineWidth = 0.016 * r; c.stroke();
      ell(c, x - s * 0.35, y - s * 0.38, s * 0.32, s * 0.2, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    };
    const peel = (x, y, s, rot, col = ['#ffb84e', '#f2801e', '#b44e0a']) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      c.fillStyle = 'rgba(50,8,0,0.35)'; c.beginPath(); c.roundRect(-s + 0.01 * r, -s * 0.7 + 0.02 * r, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.fillStyle = lg(c, 0, -s * 0.7, 0, s * 0.7, [[0, col[0]], [0.5, col[1]], [1, col[2]]]); c.beginPath(); c.roundRect(-s, -s * 0.7, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.strokeStyle = col[2]; c.lineWidth = 0.014 * r; c.stroke();
      c.fillStyle = 'rgba(255,250,220,0.7)'; c.fillRect(-s * 0.7, -s * 0.5, s * 0.8, s * 0.22);
      c.restore();
    };
    const SULTANA = ['#f4c662', '#cc8a2c', '#7e4c10'];
    // gaps open towards -54°, 18°, 90°, 162°, 234°: raisins up top and at the bottom, bright fruit beside the face
    raisin(0.36, -0.47, 0.07, 0.6); peel(0.5, -0.3, 0.05, -0.4, SULTANA);
    cherry(0.53, 0.12, 0.075); peel(0.44, 0.33, 0.05, -0.5);
    raisin(-0.06, 0.53, 0.07, 0.2); cherry(0.14, 0.55, 0.05);
    peel(-0.52, 0.14, 0.055, 0.3); cherry(-0.44, 0.34, 0.05);
    cherry(-0.43, -0.4, 0.065); raisin(-0.22, -0.55, 0.06, -0.4);
    // syrup gloss
    for (const [a0, a1, d] of [[-2.85, -2.5, 0.6], [-1.85, -1.55, 0.62], [2.55, 2.85, 0.58]]) {
      c.strokeStyle = 'rgba(255,225,200,0.25)'; c.lineWidth = 0.035 * r; c.beginPath(); c.arc(0, 0, d * r, a0, a1); c.stroke();
    }
    // the rim casts a thin shadow onto the filling
    c.strokeStyle = 'rgba(40,8,0,0.35)'; c.lineWidth = 0.05 * r; circ(c, 0.008 * r, 0.018 * r, RIN * r); c.stroke();
    c.restore();
    // pastry lip: a light inner edge against the filling
    c.strokeStyle = 'rgba(110,45,12,0.75)'; c.lineWidth = 0.025 * r; circ(c, 0, 0, RIN * r); c.stroke();
    c.strokeStyle = '#fbe3b0'; c.lineWidth = 0.04 * r; circ(c, 0, 0, (RIN + 0.03) * r); c.stroke();
    c.strokeStyle = 'rgba(255,255,240,0.7)'; c.lineWidth = 0.02 * r; c.beginPath(); c.arc(0, 0, (RIN + 0.025) * r, 2.6, 5.0); c.stroke();
    // ── star-shaped pastry lid ──
    const S = this.star(r, 0.66, 0.3);
    c.save(); c.translate(0.025 * r, 0.045 * r); c.fillStyle = 'rgba(50,8,0,0.5)'; c.fill(S); c.restore();
    c.fillStyle = rg(c, -0.16 * r, -0.2 * r, 0, 0, 0, 0.66 * r, [[0, '#fde6b6'], [0.45, '#f3c47c'], [0.8, '#e2a258'], [1, '#cf8a40']]); c.fill(S);
    c.save(); c.clip(S);
    c.strokeStyle = 'rgba(170,88,26,0.3)'; c.lineWidth = 0.16 * r; c.stroke(S);
    c.strokeStyle = 'rgba(170,88,26,0.4)'; c.lineWidth = 0.07 * r; c.stroke(S);
    c.save(); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(255,240,205,0.55)'; c.lineWidth = 0.035 * r; c.stroke(S); c.restore();
    speckle(c, R, 20, inDisc(0.5 * r), R => `rgba(160,85,30,${0.12 + R() * 0.18})`, r * 0.01, r * 0.018);
    // icing sugar: a soft dusting on the lid only
    for (const [x, y, s, a] of [[-0.1, -0.1, 0.42, 0.5], [0.22, 0.16, 0.3, 0.38], [0.02, -0.42, 0.22, 0.44], [-0.42, -0.12, 0.22, 0.4], [0.42, -0.12, 0.18, 0.3], [-0.22, 0.38, 0.2, 0.3], [0.24, 0.42, 0.16, 0.26]]) {
      c.fillStyle = rg(c, x * r, y * r, 0, x * r, y * r, s * r, [[0, `rgba(255,255,255,${a})`], [0.55, `rgba(255,255,255,${a * 0.55})`], [1, 'rgba(255,255,255,0)']]); circ(c, x * r, y * r, s * r); c.fill();
    }
    speckle(c, R, 90, inDisc(0.6 * r), R => `rgba(255,255,255,${0.4 + R() * 0.4})`, r * 0.005, r * 0.011);
    c.restore();
    c.strokeStyle = 'rgba(100,42,8,0.9)'; c.lineWidth = 0.035 * r; c.lineJoin = 'round'; c.stroke(S);
    ell(c, -0.04 * r, -0.4 * r, 0.07 * r, 0.026 * r, -1.25); c.fillStyle = 'rgba(255,255,240,0.6)'; c.fill();
  },
};
