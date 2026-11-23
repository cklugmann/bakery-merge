'use strict';
// 5 ─ MINCE PIE (mince pie seen from above, star lid — same collision shape as the classic Cinnamon Roll)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#8a4f22',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.03, s: 0.38 },
  crumbs: ['#e8b06c', '#f6d29b', '#ffffff', '#7a2b1a'],
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
    const N = 18, RIN = 0.77, rin = a => (RIN + 0.022 * Math.cos(N * a)) * r;   // fluted case: the flutes bulge into the filling
    // ── shortcrust case ──
    c.fillStyle = rg(c, -0.25 * r, -0.3 * r, 0, 0, 0, r, [[0, '#f9dca2'], [0.6, '#ecb96f'], [0.9, '#d69a52'], [1, '#bf7e3a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // fluted rim: every flute is a little rounded ridge, lit from the top left
    const M = 360;
    for (let i = 0; i < M; i++) {
      const a0 = (i / M) * TAU, a1 = ((i + 1.6) / M) * TAU, am = (a0 + a1) / 2;
      const ridge = Math.sin(N * am), lit = Math.cos(am + 2.3);   // ridge: which side of a flute; lit: facing the light
      const t = clamp(0.5 + 0.3 * ridge * (0.65 + 0.35 * lit) + 0.18 * lit, 0, 1);
      c.fillStyle = t < 0.5 ? mix('#b06c2c', '#e3ad64', t * 2) : mix('#e3ad64', '#f8d89e', (t - 0.5) * 2);
      c.beginPath(); c.moveTo(Math.cos(a0) * 1.05 * r, Math.sin(a0) * 1.05 * r); c.arc(0, 0, 1.05 * r, a0, a1); c.lineTo(Math.cos(a1) * 0.6 * r, Math.sin(a1) * 0.6 * r); c.lineTo(Math.cos(a0) * 0.6 * r, Math.sin(a0) * 0.6 * r); c.closePath(); c.fill();
    }
    // grooves between the flutes
    c.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.75) / N) * TAU, lit = Math.cos(a + 2.3);
      c.strokeStyle = `rgba(130,62,18,${0.38 - 0.14 * lit})`; c.lineWidth = 0.028 * r;
      c.beginPath(); c.moveTo(Math.cos(a) * (RIN + 0.02) * r, Math.sin(a) * (RIN + 0.02) * r); c.lineTo(Math.cos(a) * 0.96 * r, Math.sin(a) * 0.96 * r); c.stroke();
    }
    speckle(c, R, 50, R => { const a = R() * TAU, d = lerp(0.8, 0.97, R()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d }; }, R => `rgba(150,80,25,${0.15 + R() * 0.2})`, r * 0.006, r * 0.014);
    // ── dark fruit filling inside the rim ──
    const well = new Path2D();
    for (let i = 0; i <= 180; i++) { const a = (i / 180) * TAU, d = rin(a); i ? well.lineTo(Math.cos(a) * d, Math.sin(a) * d) : well.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
    well.closePath();
    c.fillStyle = rg(c, -0.1 * r, -0.15 * r, 0, 0, 0, RIN * r, [[0, '#6e2414'], [0.6, '#521709'], [1, '#2c0905']]); c.fill(well);
    c.save(); c.clip(well);
    // raisins, currants, a little peel and apple
    for (let i = 0; i < 70; i++) {
      const a = R() * TAU, d = lerp(0.3, 0.8, Math.sqrt(R())) * r, x = Math.cos(a) * d, y = Math.sin(a) * d, s = lerp(0.035, 0.065, R()) * r, k = R();
      const col = k < 0.55 ? ['#24060a', '#4a1418'] : k < 0.82 ? ['#5e1c0c', '#8a3418'] : k < 0.92 ? ['#a8501a', '#d07a30'] : ['#8a5a22', '#b88a44'];
      blobPath(c, x, y, s, R, 6, 0.4); c.fillStyle = col[0]; c.fill();
      blobPath(c, x - s * 0.2, y - s * 0.25, s * 0.55, R, 5, 0.3); c.fillStyle = col[1]; c.fill();
      if (k < 0.82 && R() < 0.6) { circ(c, x - s * 0.35, y - s * 0.4, s * 0.22); c.fillStyle = 'rgba(255,215,190,0.6)'; c.fill(); }
    }
    // the rim casts a little shadow onto the filling
    c.strokeStyle = 'rgba(20,4,0,0.55)'; c.lineWidth = 0.1 * r; c.save(); c.translate(0.015 * r, 0.03 * r); c.stroke(well); c.restore();
    c.restore();
    c.save(); c.scale(1.035, 1.035); c.strokeStyle = 'rgba(255,240,200,0.5)'; c.lineWidth = 0.02 * r; c.stroke(well); c.restore();
    c.strokeStyle = 'rgba(105,45,12,0.8)'; c.lineWidth = 0.028 * r; c.stroke(well);
    // ── star-shaped pastry lid ──
    const S = this.star(r, 0.71, 0.36);
    c.save(); c.translate(0.025 * r, 0.05 * r); c.fillStyle = 'rgba(20,4,0,0.6)'; c.fill(S); c.restore();
    c.fillStyle = rg(c, -0.18 * r, -0.22 * r, 0, 0, 0, 0.72 * r, [[0, '#fde3ac'], [0.45, '#f0bd72'], [0.8, '#dd9b50'], [1, '#c47c34']]); c.fill(S);
    c.save(); c.clip(S);
    // baked, darker edges of the lid
    c.strokeStyle = 'rgba(165,85,25,0.3)'; c.lineWidth = 0.18 * r; c.stroke(S);
    c.strokeStyle = 'rgba(165,85,25,0.35)'; c.lineWidth = 0.08 * r; c.stroke(S);
    // light line along the top-left edges
    c.save(); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(255,240,205,0.55)'; c.lineWidth = 0.035 * r; c.stroke(S); c.restore();
    speckle(c, R, 30, inDisc(0.6 * r), R => `rgba(160,85,30,${0.15 + R() * 0.2})`, r * 0.01, r * 0.02);
    // icing sugar settled on the lid
    c.fillStyle = rg(c, -0.15 * r, -0.2 * r, 0, -0.05 * r, -0.05 * r, 0.6 * r, [[0, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-r, -r, 2 * r, 2 * r);
    c.restore();
    c.strokeStyle = 'rgba(105,45,10,0.85)'; c.lineWidth = 0.03 * r; c.lineJoin = 'round'; c.stroke(S);
    // egg-wash gloss
    ell(c, -0.045 * r, -0.4 * r, 0.08 * r, 0.03 * r, -1.25); c.fillStyle = 'rgba(255,255,240,0.6)'; c.fill();
    ell(c, -0.36 * r, -0.17 * r, 0.06 * r, 0.025 * r, -0.2); c.fillStyle = 'rgba(255,255,240,0.45)'; c.fill();
    // ── icing-sugar dusting: soft drifts of powder, heaviest on the lid ──
    const drift = (x, y, s, a) => { c.fillStyle = rg(c, x * r, y * r, 0, x * r, y * r, s * r, [[0, `rgba(255,255,255,${a})`], [0.6, `rgba(255,255,255,${a * 0.5})`], [1, 'rgba(255,255,255,0)']]); circ(c, x * r, y * r, s * r); c.fill(); };
    c.save(); c.clip(S);
    drift(-0.22, -0.18, 0.3, 0.3); drift(0.2, -0.32, 0.18, 0.24); drift(0.32, 0.22, 0.18, 0.2); drift(-0.34, 0.28, 0.16, 0.2);
    c.restore();
    c.save(); const rim = new Path2D(); rim.rect(-2 * r, -2 * r, 4 * r, 4 * r); rim.addPath(well); c.clip(rim, 'evenodd');
    drift(-0.6, -0.55, 0.22, 0.32); drift(0.7, -0.4, 0.16, 0.24); drift(-0.86, 0.2, 0.16, 0.24); drift(0.42, 0.78, 0.15, 0.18);
    c.restore();
    // sugar caught on the fruit
    c.save(); c.clip(well);
    for (const [x, y] of [[-0.5, -0.38], [0.55, -0.12], [-0.1, 0.66], [0.42, 0.5], [-0.58, 0.32]]) speckle(c, R, 16, R => { const p = inDisc(0.11 * r)(R); return { x: x * r + p.x, y: y * r + p.y }; }, R => `rgba(255,255,255,${0.45 + R() * 0.45})`, r * 0.006, r * 0.012);
    c.restore();
    c.save(); c.clip(S);
    speckle(c, R, 220, inDisc(0.7 * r), R => `rgba(255,255,255,${0.35 + R() * 0.5})`, r * 0.005, r * 0.011);
    c.restore();
    speckle(c, R, 120, inDisc(0.98 * r), R => `rgba(255,255,255,${0.2 + R() * 0.4})`, r * 0.004, r * 0.009);
  },
};
