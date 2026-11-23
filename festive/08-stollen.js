'use strict';
// 8 ─ STOLLEN (powdered-sugar Stollen loaf — same collision shape as the classic Bread)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#8a5a2c',
  top: r => x => -0.66 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.2)), 1 / 2.2),
  bot: r => x => 0.5 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.5)), 1 / 2.5),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r);
    for (let i = 0; i <= 120; i++) { const x = lerp(-1, 1, i / 120) * r; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0.3, y: 0.05, s: 0.36 },
  crumbs: ['#ffffff', '#f7deb0', '#c98646', '#e8334a'],
  // the cut end (left): an upright oval, seen at an angle; [cx, cy, rx, ry] in units of r
  end: [-0.6, -0.05, 0.37, 0.57],
  paint(c, r, R) {
    const top = this.top(r), bot = this.bot(r);
    c.lineCap = 'round'; c.lineJoin = 'round';
    // ── golden crust underneath ──
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.5 * r, [[0, '#f2bf74'], [0.55, '#dc9a4c'], [0.82, '#b87430'], [1, '#86481a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 70, R => ({ x: (R() * 2 - 1) * r, y: lerp(0.1, 0.5, R()) * r }), R => `rgba(110,50,12,${0.15 + R() * 0.2})`, r * 0.006, r * 0.014);

    // ── thick icing-sugar coat ──
    const sugarY = x => lerp(top(x), bot(x), 0.76) + Math.sin(x / r * 9 + 1) * 0.018 * r + Math.sin(x / r * 23) * 0.01 * r;
    const sugar = new Path2D();
    sugar.moveTo(-1.2 * r, -r);
    for (let i = 0; i <= 160; i++) { const x = lerp(-1.05, 1.05, i / 160) * r; sugar.lineTo(x, sugarY(x)); }
    sugar.lineTo(1.2 * r, -r); sugar.closePath();
    c.save(); c.translate(0, 0.025 * r); c.fillStyle = 'rgba(110,55,15,0.3)'; c.fill(sugar); c.restore();
    c.save(); c.clip(sugar);
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.32 * r, [[0, '#ffffff'], [0.3, '#fffdf9'], [0.68, '#f6efe6'], [1, '#e2d3c4']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // the right end turns away from the light
    c.fillStyle = lg(c, 0.4 * r, 0, r, 0, [[0, 'rgba(150,120,100,0)'], [1, 'rgba(150,120,100,0.4)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // the fold: a ridge along the top of the loaf with a soft groove under it
    const foldY = x => lerp(top(x), bot(x), 0.3) + 0.012 * r * Math.sin(x / r * 5);
    const fold = []; for (let i = 0; i <= 60; i++) { const x = lerp(-0.3, 0.86, i / 60) * r; fold.push({ x, y: foldY(x) }); }
    for (let k = 0; k < 14; k++) { c.save(); c.translate(0, (0.012 + k * 0.009) * r); c.strokeStyle = `rgba(160,125,100,${0.07 * (1 - k / 14)})`; c.lineWidth = 0.025 * r; strokePts(c, fold); c.restore(); }
    c.strokeStyle = 'rgba(150,110,85,0.45)'; c.lineWidth = 0.02 * r; strokePts(c, fold);
    c.save(); c.translate(0, -0.025 * r); c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 0.03 * r; strokePts(c, fold); c.restore();
    // a few raisins peeking through the sugar
    for (const [x, y, s] of [[0.7, -0.08, 0.042], [0.0, 0.18, 0.036], [0.6, 0.25, 0.034], [0.84, -0.3, 0.03], [0.26, -0.5, 0.03]]) {
      const X = x * r, Y = y * r, S = s * r;
      c.save(); c.translate(X, Y); c.rotate(R() * Math.PI); c.scale(1.25, 0.75);
      blobPath(c, 0, 0, S, R, 6, 0.5); c.fillStyle = '#4a2018'; c.fill();
      c.strokeStyle = 'rgba(150,90,80,0.8)'; c.lineWidth = 0.012 * r; c.beginPath(); c.moveTo(-S * 0.6, -S * 0.1); c.quadraticCurveTo(0, -S * 0.5, S * 0.55, -S * 0.05); c.stroke();
      c.restore();
      speckle(c, R, 3, R => { const p = inDisc(S * 0.8)(R); return { x: X + p.x, y: Y + p.y }; }, 'rgba(255,255,255,0.8)', r * 0.005, r * 0.009);
    }
    // soft lumps in the thick sugar coat
    for (let i = 0; i < 16; i++) {
      const x = lerp(-0.25, 0.92, R()) * r, y = lerp(top(x) + 0.12 * r, sugarY(x) - 0.08 * r, R()), s = lerp(0.07, 0.12, R()) * r;
      if (Math.abs(x - this.face.x * r) < 0.3 * r && Math.abs(y - this.face.y * r) < 0.16 * r) continue;
      ell(c, x + s * 0.25, y + s * 0.3, s, s * 0.55); c.fillStyle = 'rgba(165,135,120,0.06)'; c.fill();
      ell(c, x - s * 0.15, y - s * 0.15, s * 0.8, s * 0.4); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fill();
    }
    // powder texture
    speckle(c, R, 240, R => ({ x: (R() * 2 - 1) * r, y: lerp(-0.66, 0.3, R()) * r }), R => (R() < 0.6 ? `rgba(255,255,255,${0.55 + R() * 0.45})` : `rgba(165,140,125,${0.1 + R() * 0.12})`), r * 0.005, r * 0.013);
    c.restore();
    // powdery lower edge dusting the crust
    speckle(c, R, 90, R => { const x = (R() * 2 - 1) * r; return { x, y: sugarY(x) + Math.pow(R(), 2.5) * 0.09 * r }; }, R => `rgba(255,253,248,${0.3 + R() * 0.5})`, r * 0.004, r * 0.009);
    c.fillStyle = lg(c, 0, 0.3 * r, 0, 0.52 * r, [[0, 'rgba(70,30,5,0)'], [1, 'rgba(70,30,5,0.4)']]); c.fillRect(-2 * r, 0.3 * r, 4 * r, r);

    // ── the cut end: crust ring, yellow crumb with fruit, and the marzipan core ──
    const [ex, ey, erx, ery] = this.end.map(v => v * r);
    const facePts = [];
    for (let i = 0; i < 120; i++) {
      const t = (i / 120) * TAU; let x = ex + Math.cos(t) * erx, y = ey + Math.sin(t) * ery;
      x = Math.max(x, -0.97 * r); y = clamp(y, top(x) + 0.115 * r, bot(x) - 0.02 * r);
      facePts.push({ x, y });
    }
    const face = new Path2D(); pathFromPts(face, facePts);
    // shadow gap where the cut face meets the sugar side
    c.save(); c.translate(0.025 * r, 0.012 * r); c.fillStyle = 'rgba(110,70,40,0.35)'; c.fill(face); c.restore();
    c.save(); c.clip(face);
    c.fillStyle = rg(c, ex - 0.08 * r, ey - 0.14 * r, 0, ex, ey, 0.6 * r, [[0, '#fff0b8'], [0.55, '#fad88a'], [1, '#ecb862']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // airy crumb: little holes
    speckle(c, R, 80, R => ({ x: ex + (R() * 2 - 1) * erx, y: ey + (R() * 2 - 1) * ery }), R => (R() < 0.65 ? `rgba(200,140,50,${0.3 + R() * 0.3})` : 'rgba(255,252,235,0.85)'), r * 0.008, r * 0.02);
    // fruit: raisins, candied orange peel, green citron
    const bits = [[-0.42, -0.3, 'r'], [-0.7, -0.36, 'o'], [-0.36, 0.14, 'g'], [-0.86, 0.12, 'r'], [-0.52, 0.34, 'o'], [-0.34, -0.08, 'r'], [-0.58, -0.47, 'g'], [-0.88, -0.14, 'o'], [-0.74, 0.32, 'r'], [-0.46, -0.48, 'r'], [-0.84, -0.36, 'r'], [-0.3, 0.3, 'r']];
    for (const [x, y, k] of bits) {
      const X = x * r, Y = y * r, S = lerp(0.05, 0.062, R()) * r;
      if (k === 'r') {
        blobPath(c, X + 0.008 * r, Y + 0.01 * r, S, R, 6, 0.45); c.fillStyle = 'rgba(120,60,10,0.35)'; c.fill();
        blobPath(c, X, Y, S, R, 6, 0.45); c.fillStyle = '#3d1612'; c.fill();
        circ(c, X - S * 0.3, Y - S * 0.3, S * 0.25); c.fillStyle = 'rgba(255,200,180,0.55)'; c.fill();
      } else {
        c.save(); c.translate(X, Y); c.rotate(R() * 1.5);
        c.fillStyle = 'rgba(120,60,10,0.35)'; c.fillRect(-S * 0.8 + 0.008 * r, -S * 0.65 + 0.01 * r, S * 1.6, S * 1.3);
        c.fillStyle = k === 'o' ? '#ec7a1c' : '#5fae3a'; c.fillRect(-S * 0.8, -S * 0.65, S * 1.6, S * 1.3);
        c.fillStyle = k === 'o' ? '#ffb65a' : '#b4e274'; c.fillRect(-S * 0.8, -S * 0.65, S * 1.6, S * 0.45);
        c.restore();
      }
    }
    // marzipan core: a smooth, paler roll set low in the middle
    // (soft-edged, no hard ring or white highlight — those make it read as an egg)
    const mx = ex - 0.03 * r, my = ey + 0.06 * r, mrx = 0.14 * r, mry = 0.16 * r;
    ell(c, mx + 0.012 * r, my + 0.016 * r, mrx, mry); c.fillStyle = 'rgba(160,105,35,0.4)'; c.fill();
    ell(c, mx, my, mrx, mry); c.fillStyle = rg(c, mx - 0.035 * r, my - 0.05 * r, 0, mx, my, mry * 1.02, [[0, '#fbf1d2'], [0.55, '#f2e0b0'], [0.85, '#e6cc90'], [1, '#d2b06c']]); c.fill();
    c.save(); ell(c, mx, my, mrx, mry); c.clip(); speckle(c, R, 10, R => ({ x: mx + (R() * 2 - 1) * mrx, y: my + (R() * 2 - 1) * mry }), 'rgba(200,160,90,0.3)', 0.006 * r, 0.011 * r); c.restore();
    // soft shade toward the lower right of the cut face
    c.fillStyle = lg(c, ex - erx, ey - ery, ex + erx, ey + ery, [[0, 'rgba(130,75,20,0)'], [0.55, 'rgba(130,75,20,0)'], [1, 'rgba(130,75,20,0.32)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // thin crust ring
    c.strokeStyle = '#b06a26'; c.lineWidth = 0.075 * r; c.stroke(face);
    c.strokeStyle = 'rgba(255,215,150,0.6)'; c.lineWidth = 0.015 * r; c.save(); c.translate(0.004 * r, 0.004 * r);
    const inner = new Path2D(); pathFromPts(inner, facePts.map(p => ({ x: ex + (p.x - ex) * 0.9, y: ey + (p.y - ey) * 0.93 }))); c.stroke(inner); c.restore();
    c.restore();
    c.strokeStyle = 'rgba(105,60,25,0.75)'; c.lineWidth = 0.022 * r; c.stroke(face);
  },
};
