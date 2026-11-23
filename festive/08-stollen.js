'use strict';
// 8 ─ STOLLEN (powdered-sugar Stollen loaf — same collision shape as the classic Bread)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#5a3010',
  top: r => x => -0.66 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.2)), 1 / 2.2),
  bot: r => x => 0.5 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.5)), 1 / 2.5),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r);
    for (let i = 0; i <= 120; i++) { const x = lerp(-1, 1, i / 120) * r; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0.32, y: 0.28, s: 0.34 },
  crumbs: ['#ffffff', '#f7deb0', '#c98646', '#e8334a'],
  // The cut end (left) is the loaf's cross-section, facing left and a little toward us. Its boundary with the
  // side of the loaf is the front half of the loaf's profile, so it bulges to the right where the loaf is thickest.
  cutX: r => y => (-0.44 + 0.15 * Math.sqrt(Math.max(0, 1 - Math.pow((y / r + 0.06) / 0.6, 2)))) * r,
  paint(c, r, R) {
    const top = this.top(r), bot = this.bot(r), cutX = this.cutX(r);
    const at = (x, k) => lerp(top(x), bot(x), k);                         // a line along the loaf, k = 0 top … 1 bottom
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── golden-brown baked crust, darker toward the bottom where it sits ──
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.5 * r, [[0, '#f0b664'], [0.5, '#d88e3c'], [0.78, '#b0641f'], [1, '#6e3810']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(80,35,5,0.35)'], [0.25, 'rgba(80,35,5,0)'], [0.8, 'rgba(80,35,5,0)'], [1, 'rgba(80,35,5,0.4)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 90, R => ({ x: (R() * 2 - 1) * r, y: lerp(0.0, 0.5, R()) * r }), R => `rgba(95,40,8,${0.15 + R() * 0.2})`, r * 0.006, r * 0.015);

    // ── powdered sugar: a thick, matte, uneven blanket on top that thins out into a dusting over the crust ──
    const k0 = x => 0.47 + 0.035 * Math.sin(x / r * 4.3 + 1.2) + 0.02 * Math.sin(x / r * 9.7 + 0.4);   // where the blanket stops being solid
    const band = 0.2;                                                                                   // depth of the dusted fade (in k)
    const region = k => { const p = new Path2D(); p.moveTo(-1.2 * r, -r); for (let i = 0; i <= 120; i++) { const x = lerp(-1.05, 1.05, i / 120) * r; p.lineTo(x, at(x, k(x))); } p.lineTo(1.2 * r, -r); p.closePath(); return p; };
    const blanket = region(k0);
    c.save(); c.clip(blanket);
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.1 * r, [[0, '#ffffff'], [0.45, '#fdfcfa'], [1, '#ece8e8']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // matte, cool shading: the right end turns away, soft hollows in the uneven coat
    c.fillStyle = lg(c, 0.4 * r, 0, r, 0, [[0, 'rgba(130,130,160,0)'], [1, 'rgba(130,130,160,0.32)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    for (const [xu, ku, s] of [[-0.05, 0.22, 0.2], [0.42, 0.14, 0.18], [0.7, 0.3, 0.16], [0.15, 0.36, 0.17]]) {
      const x = xu * r, y = at(x, ku);
      c.fillStyle = rg(c, x + 0.04 * r, y + 0.03 * r, 0, x + 0.04 * r, y + 0.03 * r, s * r, [[0, 'rgba(140,140,170,0.13)'], [1, 'rgba(140,140,170,0)']]);
      c.fillRect(x - s * r, y - s * r, 2 * s * r + 0.1 * r, 2 * s * r + 0.1 * r);
    }
    // the Stollen's ridge: one soft fold running along the loaf (a matte groove, no shine)
    { const fold = []; for (let i = 0; i <= 40; i++) { const x = lerp(-0.4, 0.9, i / 40) * r; fold.push({ x, y: at(x, 0.32) + 0.012 * r * Math.sin(x / r * 5) }); }
      const fade = al => lg(c, -0.4 * r, 0, 0.9 * r, 0, [[0, `rgba(125,120,150,0)`], [0.2, `rgba(125,120,150,${al})`], [0.8, `rgba(125,120,150,${al})`], [1, `rgba(125,120,150,0)`]]);
      for (let j = 0; j < 14; j++) { c.save(); c.translate(0, (j * 0.009) * r); c.strokeStyle = fade(0.11 * (1 - j / 14)); c.lineWidth = 0.03 * r; strokePts(c, fold); c.restore(); }
      c.strokeStyle = fade(0.38); c.lineWidth = 0.022 * r; strokePts(c, fold); }
    // raisins peeking through, half buried in powder
    for (const [xu, ku, s] of [[0.66, 0.42, 0.06], [0.05, 0.47, 0.055], [-0.18, 0.18, 0.05], [0.4, 0.14, 0.05], [0.86, 0.36, 0.045]]) {
      const X = xu * r, Y = at(X, ku), S = s * r;
      c.save(); c.translate(X, Y); c.rotate(R() * Math.PI); c.scale(1.2, 0.8);
      blobPath(c, 0, 0, S, R, 6, 0.45); c.fillStyle = '#3a140c'; c.fill();
      c.strokeStyle = 'rgba(150,85,75,0.8)'; c.lineWidth = 0.014 * r; c.beginPath(); c.moveTo(-S * 0.55, -S * 0.1); c.quadraticCurveTo(0, -S * 0.5, S * 0.5, -S * 0.05); c.stroke();
      c.restore();
      speckle(c, R, 9, R => { const p = inDisc(S * 0.9)(R); return { x: X + p.x, y: Y + p.y - S * 0.25 }; }, R => `rgba(255,255,255,${0.6 + R() * 0.4})`, r * 0.006, r * 0.012);
    }
    // dry powder grain
    speckle(c, R, 260, R => ({ x: (R() * 2 - 1) * r, y: lerp(-0.66, 0.15, R()) * r }), R => (R() < 0.5 ? `rgba(255,255,255,${0.6 + R() * 0.4})` : `rgba(165,160,180,${0.1 + R() * 0.12})`), r * 0.005, r * 0.012);
    c.restore();
    // the dusted fade: stacked thin veils of sugar, then stippled powder, densest near the blanket
    { const fadeBand = new Path2D(); fadeBand.moveTo(-1.2 * r, at(-1.05 * r, k0(-1.05 * r)));
      for (let i = 0; i <= 120; i++) { const x = lerp(-1.05, 1.05, i / 120) * r; fadeBand.lineTo(x, at(x, k0(x)) - 0.004 * r); }
      for (let i = 120; i >= 0; i--) { const x = lerp(-1.05, 1.05, i / 120) * r; fadeBand.lineTo(x, at(x, k0(x) + band + 0.02)); }
      fadeBand.closePath();
      c.save(); c.clip(fadeBand);
      for (let j = 1; j <= 12; j++) { c.fillStyle = 'rgba(255,255,255,0.075)'; c.fill(region(x => k0(x) + band * j / 12)); }
      c.restore(); }
    speckle(c, R, 800, R => { const x = (R() * 2 - 1) * r; return { x, y: at(x, k0(x) - 0.01 + (band + 0.03) * Math.pow(R(), 1.8)) }; }, R => `rgba(255,255,255,${0.45 + R() * 0.5})`, r * 0.003, r * 0.009);
    // contact shadow along the bottom
    c.fillStyle = lg(c, 0, 0.3 * r, 0, 0.52 * r, [[0, 'rgba(60,25,0,0)'], [1, 'rgba(60,25,0,0.5)']]); c.fillRect(-2 * r, 0.3 * r, 4 * r, r);

    // ── the cut end: the end face of a solid loaf, turned away from the top light ──
    const edgePts = []; for (let i = 0; i <= 60; i++) { const y = lerp(-0.8, 0.62, i / 60) * r; edgePts.push({ x: cutX(y), y }); }
    const cut = new Path2D(); cut.moveTo(-1.3 * r, -0.8 * r); for (const p of edgePts) cut.lineTo(p.x, p.y); cut.lineTo(-1.3 * r, 0.62 * r); cut.closePath();
    c.save(); c.clip(cut);
    // its own warmer, slightly darker light: brightest top-left, deepening toward the bottom and the edge
    c.fillStyle = rg(c, -0.74 * r, -0.22 * r, 0, -0.62 * r, -0.05 * r, 0.72 * r, [[0, '#f8d88e'], [0.5, '#eab868'], [1, '#c98a3c']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 60, R => ({ x: lerp(-1, -0.3, R()) * r, y: lerp(-0.55, 0.45, R()) * r }), R => (R() < 0.7 ? `rgba(185,120,40,${0.3 + R() * 0.3})` : 'rgba(255,245,215,0.7)'), r * 0.01, r * 0.024);
    // a few big, bold pieces of fruit: raisins, candied orange peel, green citron
    const bits = [[-0.6, -0.24, 'o', 0.11], [-0.4, -0.06, 'r', 0.11], [-0.78, 0.06, 'r', 0.1], [-0.55, 0.22, 'g', 0.1], [-0.36, 0.3, 'o', 0.085]];
    for (const [xu, yu, k, su] of bits) {
      const X = xu * r, Y = yu * r, S = su * r;
      if (k === 'r') {
        blobPath(c, X + 0.012 * r, Y + 0.016 * r, S, R, 6, 0.35); c.fillStyle = 'rgba(120,60,10,0.35)'; c.fill();
        blobPath(c, X, Y, S, R, 6, 0.35); c.fillStyle = '#2e0e08'; c.fill();
        c.strokeStyle = 'rgba(140,70,60,0.85)'; c.lineWidth = 0.02 * r; c.beginPath(); c.moveTo(X - S * 0.5, Y - S * 0.15); c.quadraticCurveTo(X, Y - S * 0.55, X + S * 0.45, Y - S * 0.1); c.stroke();
      } else {
        c.save(); c.translate(X, Y); c.rotate((R() - 0.5) * 1.0);
        c.beginPath(); c.roundRect(-S * 0.85 + 0.012 * r, -S * 0.7 + 0.016 * r, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = 'rgba(120,60,10,0.35)'; c.fill();
        c.beginPath(); c.roundRect(-S * 0.85, -S * 0.7, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = k === 'o' ? '#ea6e10' : '#3f9a26'; c.fill();
        c.strokeStyle = k === 'o' ? 'rgba(115,40,0,0.75)' : 'rgba(25,65,5,0.75)'; c.lineWidth = 0.016 * r; c.stroke();
        c.beginPath(); c.roundRect(-S * 0.62, -S * 0.5, S * 1.24, S * 0.42, S * 0.2); c.fillStyle = k === 'o' ? 'rgba(255,195,110,0.9)' : 'rgba(180,230,120,0.9)'; c.fill();
        c.restore();
      }
    }
    // the loaf's skin in section: a crust ring all round the face, the sugar coat a thin white line on top of it
    c.strokeStyle = '#8a4614'; c.lineWidth = 0.255 * r; c.stroke(this.pathDesign);
    c.strokeStyle = '#c27a30'; c.lineWidth = 0.225 * r; c.stroke(this.pathDesign);
    c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r + 0.0 * r); c.clip();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.165 * r; c.stroke(this.pathDesign);
    c.restore();
    c.restore();
    // the ring continues along the edge where the end face meets the side of the loaf
    const inset = (d) => edgePts.map(p => ({ x: p.x - d * r, y: p.y }));
    c.save(); c.clip(cut);
    c.strokeStyle = '#8a4614'; c.lineWidth = 0.055 * r; strokePts(c, inset(0.022));
    c.strokeStyle = '#c27a30'; c.lineWidth = 0.032 * r; strokePts(c, inset(0.02));
    c.restore();
    // the edge itself: a crisp white line of sugar where the coat is cut (upper part), the crust's lip below it
    { const xe = cutX(-0.1 * r), ye = at(xe, k0(xe));
      c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r + ye); c.clip();
      c.strokeStyle = lg(c, 0, ye - 0.15 * r, 0, ye, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]); c.lineWidth = 0.028 * r; strokePts(c, edgePts);
      c.restore(); }
    c.strokeStyle = 'rgba(70,35,10,0.5)'; c.lineWidth = 0.012 * r; strokePts(c, inset(0.05));
  },
};
