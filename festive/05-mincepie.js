'use strict';
// 5 ─ MINCE PIE (mince pie seen from above, star lid — same collision shape as the classic Cinnamon Roll)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#8a4f22',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.03, s: 0.36 },
  crumbs: ['#e8b06c', '#f6d29b', '#ffffff', '#a8341c', '#e8782a'],
  // fluted pastry case: N rounded flutes pushing into the filling, sharp little cusps between them
  N: 12, RW: 0.69, FA: 0.075,
  rin(a) { const t = ((((this.N * a) / TAU + 0.5) % 1) + 1) % 1 * 2 - 1; return this.RW + this.FA * (1 - Math.sqrt(Math.max(0, 1 - t * t))); },   // t: −1 … 1 across one flute
  // rounded star outline (design units): 5 points, one pointing up
  star(r, R0, R1, tip = 0.26, notch = 0.16) {
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
    const N = this.N, LIGHT = -2.36;   // light comes from the top left
    const lit = a => Math.cos(a - LIGHT);
    // ── shortcrust case ──
    c.fillStyle = rg(c, -0.25 * r, -0.3 * r, 0, 0, 0, r, [[0, '#f9dca2'], [0.6, '#ecb96f'], [0.9, '#d69a52'], [1, '#bf7e3a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // every flute is a plump rounded rib: dark at its sides, light along its middle, lighter towards the light
    for (let k = 0; k < N; k++) {
      const am = (k / N) * TAU, a0 = am - Math.PI / N, a1 = am + Math.PI / N, L = lit(am);
      const p = new Path2D();
      p.moveTo(Math.cos(a0) * 1.06 * r, Math.sin(a0) * 1.06 * r); p.arc(0, 0, 1.06 * r, a0, a1);
      for (let i = 0; i <= 16; i++) { const a = lerp(a1, a0, i / 16), d = this.rin(a) * r; p.lineTo(Math.cos(a) * d, Math.sin(a) * d); }
      p.closePath();
      const q0 = { x: Math.cos(a0) * 0.86 * r, y: Math.sin(a0) * 0.86 * r }, q1 = { x: Math.cos(a1) * 0.86 * r, y: Math.sin(a1) * 0.86 * r };
      const hi = mix('#f0c47e', '#fde9be', 0.5 + 0.5 * L), mid = mix('#d89850', '#eab56a', 0.5 + 0.5 * L), lo = mix('#9c5a22', '#c07c38', 0.5 + 0.5 * L);
      c.fillStyle = lg(c, q0.x, q0.y, q1.x, q1.y, [[0, lo], [0.22, mid], [0.5 - 0.12 * L * Math.sign(Math.sin(am - LIGHT)), hi], [0.8, mid], [1, lo]]);
      c.fill(p);
    }
    // deep grooves at the cusps, so the crimp survives at icon size
    c.lineCap = 'round';
    for (let k = 0; k < N; k++) {
      const a = ((k + 0.5) / N) * TAU, L = lit(a), d0 = (this.RW + this.FA - 0.01) * r;
      c.strokeStyle = `rgba(110,48,12,${0.62 - 0.12 * L})`; c.lineWidth = 0.05 * r;
      c.beginPath(); c.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); c.lineTo(Math.cos(a) * 0.97 * r, Math.sin(a) * 0.97 * r); c.stroke();
    }
    speckle(c, R, 60, R => { const a = R() * TAU, d = lerp(0.78, 0.97, R()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d }; }, R => `rgba(150,80,25,${0.15 + R() * 0.2})`, r * 0.006, r * 0.014);
    // ── fruit mince inside the case: warm, red and glossy ──
    const well = new Path2D();
    for (let i = 0; i <= 240; i++) { const a = (i / 240) * TAU, d = this.rin(a) * r; i ? well.lineTo(Math.cos(a) * d, Math.sin(a) * d) : well.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
    well.closePath();
    c.fillStyle = rg(c, -0.12 * r, -0.16 * r, 0, 0, 0, 0.78 * r, [[0, '#cc5e34'], [0.5, '#ac3c1f'], [0.85, '#862814'], [1, '#64190c']]); c.fill(well);
    c.save(); c.clip(well);
    // the jammy base texture: little bits of fruit in many reds and browns
    for (let i = 0; i < 90; i++) {
      const a = R() * TAU, d = lerp(0.25, 0.8, Math.sqrt(R())) * r, x = Math.cos(a) * d, y = Math.sin(a) * d, s = lerp(0.025, 0.045, R()) * r, k = R();
      const col = k < 0.3 ? '#6a1a0e' : k < 0.62 ? '#c24e2e' : k < 0.84 ? '#8c2c16' : '#de7c40';
      blobPath(c, x, y, s, R, 6, 0.4); c.fillStyle = col; c.fill();
    }
    // a few big, readable pieces in every gap of the star: raisins, glacé cherries, candied peel, sultanas
    const raisin = (x, y, s, rot) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      ell(c, 0.01 * r, 0.02 * r, s * 1.1, s * 0.8); c.fillStyle = 'rgba(40,5,0,0.45)'; c.fill();
      ell(c, 0, 0, s * 1.1, s * 0.8); c.fillStyle = rg(c, -s * 0.3, -s * 0.3, 0, 0, 0, s * 1.1, [[0, '#6a2a3a'], [0.6, '#3a0e18'], [1, '#22060c']]); c.fill();
      c.strokeStyle = 'rgba(15,0,5,0.6)'; c.lineWidth = 0.018 * r; c.beginPath(); c.moveTo(-s * 0.6, -s * 0.1); c.quadraticCurveTo(0, s * 0.25, s * 0.55, -s * 0.15); c.stroke();
      ell(c, -s * 0.4, -s * 0.35, s * 0.3, s * 0.16, -0.3); c.fillStyle = 'rgba(255,225,230,0.75)'; c.fill();
      c.restore();
    };
    const cherry = (x, y, s) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.012 * r, y + 0.022 * r, s); c.fillStyle = 'rgba(40,5,0,0.45)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.35, 0, x, y, s, [[0, '#ff8a8a'], [0.45, '#e8203a'], [1, '#8e0a1c']]); c.fill();
      c.strokeStyle = '#6e0614'; c.lineWidth = 0.018 * r; c.stroke();
      ell(c, x - s * 0.35, y - s * 0.38, s * 0.32, s * 0.2, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    };
    const peel = (x, y, s, rot, col = ['#ffb347', '#f07a1a', '#b04a08']) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      c.fillStyle = 'rgba(40,5,0,0.4)'; c.beginPath(); c.roundRect(-s + 0.01 * r, -s * 0.7 + 0.02 * r, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.fillStyle = lg(c, 0, -s * 0.7, 0, s * 0.7, [[0, col[0]], [0.5, col[1]], [1, col[2]]]); c.beginPath(); c.roundRect(-s, -s * 0.7, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.strokeStyle = col[2]; c.lineWidth = 0.015 * r; c.stroke();
      c.fillStyle = 'rgba(255,250,220,0.75)'; c.fillRect(-s * 0.7, -s * 0.5, s * 0.8, s * 0.22);
      c.restore();
    };
    const SULTANA = ['#f2c060', '#c8862a', '#7a4a10'];
    // gaps of the star open towards -54°, 18°, 90°, 162°, 234°
    raisin(0.34, -0.44, 0.075, 0.6); peel(0.46, -0.27, 0.06, -0.4);
    cherry(0.53, 0.06, 0.08); raisin(0.4, 0.28, 0.07, -0.5);
    raisin(-0.08, 0.5, 0.075, 0.2); peel(0.14, 0.54, 0.055, 0.5, SULTANA); cherry(-0.02, 0.62, 0.055);
    peel(-0.5, 0.08, 0.06, 0.3); raisin(-0.4, 0.3, 0.07, 0.9);
    cherry(-0.42, -0.36, 0.07); raisin(-0.24, -0.5, 0.065, -0.4); peel(-0.56, -0.2, 0.05, 1.1, SULTANA);
    // small fruit in the ring outside the star tips
    raisin(0.0, -0.66, 0.05, 0); raisin(0.62, -0.22, 0.05, 1.2); peel(0.4, 0.55, 0.045, 0.9); raisin(-0.38, 0.56, 0.05, 2.2); peel(-0.63, -0.16, 0.04, 0.4);
    // syrup gloss
    c.lineCap = 'round';
    for (const [a0, a1, d] of [[-2.9, -2.5, 0.6], [-1.9, -1.55, 0.62], [2.5, 2.9, 0.58], [-0.9, -0.6, 0.58], [0.25, 0.45, 0.6]]) {
      c.strokeStyle = 'rgba(255,225,200,0.28)'; c.lineWidth = 0.035 * r; c.beginPath(); c.arc(0, 0, d * r, a0, a1 - 0.08); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 0.012 * r; c.beginPath(); c.arc(0, 0, d * r, a0 + 0.04, (a0 + a1) / 2 - 0.04); c.stroke();
    }
    // the rim casts a little shadow onto the filling
    c.strokeStyle = 'rgba(30,5,0,0.4)'; c.lineWidth = 0.07 * r; c.save(); c.translate(0.012 * r, 0.025 * r); c.stroke(well); c.restore();
    c.restore();
    // pastry lip: light edge on the crust, dark line where it drops into the filling
    c.save(); c.scale(1.04, 1.04); c.strokeStyle = 'rgba(255,240,205,0.55)'; c.lineWidth = 0.024 * r; c.stroke(well); c.restore();
    c.strokeStyle = 'rgba(100,40,10,0.85)'; c.lineWidth = 0.03 * r; c.lineJoin = 'round'; c.stroke(well);
    // ── star-shaped pastry lid ──
    const S = this.star(r, 0.6, 0.29);
    c.save(); c.translate(0.025 * r, 0.045 * r); c.fillStyle = 'rgba(40,6,0,0.55)'; c.fill(S); c.restore();
    c.fillStyle = rg(c, -0.16 * r, -0.2 * r, 0, 0, 0, 0.62 * r, [[0, '#fde3ac'], [0.45, '#f0bd72'], [0.8, '#dd9b50'], [1, '#c47c34']]); c.fill(S);
    c.save(); c.clip(S);
    c.strokeStyle = 'rgba(165,85,25,0.3)'; c.lineWidth = 0.16 * r; c.stroke(S);
    c.strokeStyle = 'rgba(165,85,25,0.35)'; c.lineWidth = 0.07 * r; c.stroke(S);
    c.save(); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(255,240,205,0.55)'; c.lineWidth = 0.035 * r; c.stroke(S); c.restore();
    speckle(c, R, 24, inDisc(0.5 * r), R => `rgba(160,85,30,${0.15 + R() * 0.2})`, r * 0.01, r * 0.02);
    c.restore();
    c.strokeStyle = 'rgba(105,45,10,0.85)'; c.lineWidth = 0.03 * r; c.lineJoin = 'round'; c.stroke(S);
    ell(c, -0.04 * r, -0.36 * r, 0.07 * r, 0.026 * r, -1.25); c.fillStyle = 'rgba(255,255,240,0.6)'; c.fill();
    // ── a generous dusting of icing sugar ──
    const drift = (x, y, s, a) => { c.fillStyle = rg(c, x * r, y * r, 0, x * r, y * r, s * r, [[0, `rgba(255,255,255,${a})`], [0.55, `rgba(255,255,255,${a * 0.55})`], [1, 'rgba(255,255,255,0)']]); circ(c, x * r, y * r, s * r); c.fill(); };
    c.save(); c.clip(S);
    drift(-0.12, -0.1, 0.42, 0.5); drift(0.22, 0.18, 0.3, 0.35); drift(0.05, -0.38, 0.2, 0.4); drift(-0.36, -0.08, 0.2, 0.35);
    speckle(c, R, 260, inDisc(0.6 * r), R => `rgba(255,255,255,${0.55 + R() * 0.45})`, r * 0.006, r * 0.013);
    c.restore();
    c.save(); const rim = new Path2D(); rim.rect(-2 * r, -2 * r, 4 * r, 4 * r); rim.addPath(well); c.clip(rim, 'evenodd');
    for (let k = 0; k < N; k++) { const a = (k / N) * TAU; drift(Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0.11, 0.22 + 0.2 * Math.max(0, lit(a))); }
    c.restore();
    speckle(c, R, 300, inDisc(0.97 * r), R => `rgba(255,255,255,${0.45 + R() * 0.45})`, r * 0.006, r * 0.013);
    speckle(c, R, 14, inDisc(0.95 * r), 'rgba(255,255,255,0.9)', r * 0.014, r * 0.018);
  },
};
