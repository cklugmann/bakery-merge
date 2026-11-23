'use strict';
// 8 ─ STOLLEN (powdered-sugar Stollen loaf — same collision shape as the classic Bread)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#7a4a1e',
  top: r => x => -0.66 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.2)), 1 / 2.2),
  bot: r => x => 0.5 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.5)), 1 / 2.5),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r);
    for (let i = 0; i <= 120; i++) { const x = lerp(-1, 1, i / 120) * r; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0.3, y: 0.27, s: 0.34 },
  crumbs: ['#ffffff', '#f7deb0', '#c98646', '#e8334a'],
  // the cut end (left): everything left of cutX(y) is the cross-section of the loaf
  cutX: r => y => (-0.36 + 0.07 * (1 - Math.pow(clamp((y / r + 0.08) / 0.62, -1, 1), 2))) * r,
  paint(c, r, R) {
    const top = this.top(r), bot = this.bot(r), cutX = this.cutX(r);
    c.lineCap = 'round'; c.lineJoin = 'round';
    // ── golden-brown baked crust (shows broadly along the bottom) ──
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.5 * r, [[0, '#eeb466'], [0.55, '#d48e40'], [0.8, '#b46a28'], [1, '#7e4216']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(90,40,10,0.3)'], [0.25, 'rgba(90,40,10,0)'], [0.8, 'rgba(90,40,10,0)'], [1, 'rgba(90,40,10,0.35)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 90, R => ({ x: (R() * 2 - 1) * r, y: lerp(0.0, 0.5, R()) * r }), R => `rgba(100,45,10,${0.15 + R() * 0.2})`, r * 0.006, r * 0.015);

    // ── the thick icing-sugar coat over the top ──
    const sugarY = x => lerp(top(x), bot(x), 0.6) + 0.03 * r * Math.sin(x / r * 11 + 0.5) + 0.015 * r * Math.sin(x / r * 27);
    const sugarPts = []; for (let i = 0; i <= 160; i++) { const x = lerp(-1.05, 1.05, i / 160) * r; sugarPts.push({ x, y: sugarY(x) }); }
    const sugar = new Path2D(); sugar.moveTo(-1.2 * r, -r); for (const p of sugarPts) sugar.lineTo(p.x, p.y); sugar.lineTo(1.2 * r, -r); sugar.closePath();
    // shadow of the thick coat on the crust
    c.save(); c.translate(0.01 * r, 0.045 * r); c.fillStyle = 'rgba(80,35,5,0.45)'; c.fill(sugar); c.restore();
    c.save(); c.clip(sugar);
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.1 * r, [[0, '#ffffff'], [0.35, '#fdfaf6'], [0.75, '#efe6dc'], [1, '#d9cabd']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // the right end turns away from the light
    c.fillStyle = lg(c, 0.45 * r, 0, r, 0, [[0, 'rgba(140,115,105,0)'], [1, 'rgba(140,115,105,0.4)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // drifts: soft ridges of sugar along the loaf, a cool shadow under each and a bright crest
    const drift = (k, x0, x1, amp, ph) => { const p = []; for (let i = 0; i <= 40; i++) { const x = lerp(x0, x1, i / 40) * r; p.push({ x, y: lerp(top(x), sugarY(x), k) + amp * r * Math.sin(x / r * 6 + ph) }); } return p; };
    for (const [k, x0, x1, amp, ph, a] of [[0.36, -0.3, 0.88, 0.015, 0, 1], [0.7, -0.1, 0.3, 0.02, 2, 0.55], [0.64, 0.5, 0.86, 0.02, 1, 0.5], [0.16, 0.0, 0.45, 0.012, 4, 0.45]]) {
      const p = drift(k, x0, x1, amp, ph);
      // every stroke fades out toward both ends, so a drift melts into the coat instead of ending as a bar
      const fade = (rgb, al) => lg(c, x0 * r, 0, x1 * r, 0, [[0, `rgba(${rgb},0)`], [0.22, `rgba(${rgb},${al})`], [0.78, `rgba(${rgb},${al})`], [1, `rgba(${rgb},0)`]]);
      for (let j = 0; j < 12; j++) { c.save(); c.translate(0, (0.01 + j * 0.009) * r); c.strokeStyle = fade('130,115,150', 0.085 * a * (1 - j / 12)); c.lineWidth = 0.026 * r; strokePts(c, p); c.restore(); }
      c.strokeStyle = fade('140,110,105', 0.5 * a); c.lineWidth = 0.02 * r; strokePts(c, p);
      c.save(); c.translate(0, -0.024 * r); c.strokeStyle = fade('255,255,255', 0.95 * a); c.lineWidth = 0.03 * r; strokePts(c, p); c.restore();
    }
    // where the sugar has thinned and cracked along the ridge, the golden crust shows through
    // (narrow, ragged fissures that taper at both ends — wide ovals read as windows)
    for (const [x0, x1, w] of [[-0.22, 0.12, 0.042], [0.3, 0.62, 0.038], [0.7, 0.86, 0.028]]) {
      const n = 10, upper = [], lower = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = lerp(x0, x1, t) * r, yc = lerp(top(x), sugarY(x), 0.36) - 0.03 * r + (R() - 0.5) * 0.025 * r;
        const hw = w * r * Math.pow(Math.sin(Math.PI * t), 0.7) * (0.6 + R() * 0.7);
        upper.push({ x, y: yc - hw }); lower.push({ x, y: yc + hw });
      }
      const fis = new Path2D(); pathFromPts(fis, [...upper, ...lower.reverse()]);
      c.save(); c.translate(0, 0.012 * r); c.fillStyle = 'rgba(120,95,90,0.35)'; c.fill(fis); c.restore();
      c.fillStyle = '#d58e42'; c.fill(fis);
      c.save(); c.clip(fis); c.strokeStyle = 'rgba(105,45,8,0.75)'; c.lineWidth = 0.014 * r; strokePts(c, upper.map((p, i) => ({ x: p.x, y: (p.y + lower[lower.length - 1 - i].y) / 2 }))); c.restore();
      c.strokeStyle = 'rgba(150,110,90,0.45)'; c.lineWidth = 0.01 * r; c.stroke(fis);
    }
    // raisins peeking through the sugar
    for (const [xu, yu, s] of [[0.66, -0.12, 0.06], [0.04, -0.06, 0.055], [0.86, -0.02, 0.045], [-0.18, -0.46, 0.05], [0.38, -0.55, 0.05], [0.4, 0.0, 0.045]]) {
      const X = xu * r, Y = yu * r, S = s * r;
      c.save(); c.translate(X, Y); c.rotate(R() * Math.PI); c.scale(1.2, 0.8);
      blobPath(c, 0, 0.12 * S, S * 1.05, R, 6, 0.4); c.fillStyle = 'rgba(120,90,90,0.3)'; c.fill();
      blobPath(c, 0, 0, S, R, 6, 0.45); c.fillStyle = '#3a140c'; c.fill();
      c.strokeStyle = 'rgba(150,85,75,0.85)'; c.lineWidth = 0.014 * r; c.beginPath(); c.moveTo(-S * 0.55, -S * 0.1); c.quadraticCurveTo(0, -S * 0.5, S * 0.5, -S * 0.05); c.stroke();
      c.restore();
      speckle(c, R, 3, R => { const p = inDisc(S * 0.7)(R); return { x: X + p.x, y: Y + p.y - S * 0.2 }; }, 'rgba(255,255,255,0.85)', r * 0.006, r * 0.01);
    }
    // powder texture
    speckle(c, R, 220, R => ({ x: (R() * 2 - 1) * r, y: lerp(-0.66, 0.15, R()) * r }), R => (R() < 0.6 ? `rgba(255,255,255,${0.55 + R() * 0.45})` : `rgba(160,140,140,${0.1 + R() * 0.12})`), r * 0.005, r * 0.013);
    c.restore();
    // the coat's thick lower edge: bright rim, dusting spilling onto the crust
    c.strokeStyle = 'rgba(190,170,165,0.8)'; c.lineWidth = 0.022 * r; strokePts(c, sugarPts);
    c.save(); c.translate(0, -0.025 * r); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.026 * r; strokePts(c, sugarPts.slice(10, 150)); c.restore();
    speckle(c, R, 60, R => { const x = (R() * 2 - 1) * r; return { x, y: sugarY(x) + 0.02 * r + Math.pow(R(), 2.5) * 0.08 * r }; }, R => `rgba(255,253,248,${0.3 + R() * 0.5})`, r * 0.004, r * 0.009);
    c.fillStyle = lg(c, 0, 0.32 * r, 0, 0.52 * r, [[0, 'rgba(70,30,5,0)'], [1, 'rgba(70,30,5,0.4)']]); c.fillRect(-2 * r, 0.32 * r, 4 * r, r);

    // ── the cut end: a real cross-section of the loaf ──
    const edgePts = []; for (let i = 0; i <= 60; i++) { const y = lerp(-0.8, 0.6, i / 60) * r; edgePts.push({ x: cutX(y), y }); }
    const cut = new Path2D(); cut.moveTo(-1.3 * r, -0.8 * r); for (const p of edgePts) cut.lineTo(p.x, p.y); cut.lineTo(-1.3 * r, 0.6 * r); cut.closePath();
    c.save(); c.clip(cut);
    c.fillStyle = rg(c, -0.66 * r, -0.12 * r, 0, -0.62 * r, 0, 0.7 * r, [[0, '#fff1c0'], [0.55, '#fadc8e'], [1, '#eebc66']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // airy crumb
    speckle(c, R, 70, R => ({ x: lerp(-1, -0.3, R()) * r, y: lerp(-0.55, 0.45, R()) * r }), R => (R() < 0.65 ? `rgba(200,140,50,${0.3 + R() * 0.3})` : 'rgba(255,252,235,0.85)'), r * 0.009, r * 0.022);
    // the fold seam swirling through the crumb
    c.strokeStyle = 'rgba(190,125,50,0.55)'; c.lineWidth = 0.02 * r;
    c.beginPath(); c.moveTo(-0.33 * r, -0.36 * r); c.bezierCurveTo(-0.5 * r, -0.36 * r, -0.62 * r, -0.2 * r, -0.56 * r, -0.04 * r); c.stroke();
    // few, bold pieces of fruit: raisins, candied orange peel, green citron
    const bits = [[-0.5, -0.24, 'r', 0.085], [-0.76, -0.1, 'o', 0.08], [-0.42, 0.12, 'r', 0.085], [-0.63, 0.16, 'g', 0.075], [-0.86, 0.1, 'r', 0.07], [-0.52, 0.32, 'o', 0.07], [-0.68, -0.33, 'g', 0.065]];
    for (const [xu, yu, k, su] of bits) {
      const X = xu * r, Y = yu * r, S = su * r;
      if (k === 'r') {
        blobPath(c, X + 0.01 * r, Y + 0.014 * r, S, R, 6, 0.4); c.fillStyle = 'rgba(130,70,10,0.35)'; c.fill();
        blobPath(c, X, Y, S, R, 6, 0.4); c.fillStyle = '#34100a'; c.fill();
        c.strokeStyle = 'rgba(140,70,60,0.85)'; c.lineWidth = 0.016 * r; c.beginPath(); c.moveTo(X - S * 0.5, Y - S * 0.15); c.quadraticCurveTo(X, Y - S * 0.55, X + S * 0.45, Y - S * 0.1); c.stroke();
      } else {
        c.save(); c.translate(X, Y); c.rotate((R() - 0.5) * 1.2);
        c.beginPath(); c.roundRect(-S * 0.85 + 0.01 * r, -S * 0.7 + 0.014 * r, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = 'rgba(130,70,10,0.35)'; c.fill();
        c.beginPath(); c.roundRect(-S * 0.85, -S * 0.7, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = k === 'o' ? '#ec7414' : '#4f9e2c'; c.fill();
        c.strokeStyle = k === 'o' ? 'rgba(120,45,0,0.7)' : 'rgba(30,70,10,0.7)'; c.lineWidth = 0.014 * r; c.stroke();
        c.beginPath(); c.roundRect(-S * 0.65, -S * 0.52, S * 1.3, S * 0.45, S * 0.2); c.fillStyle = k === 'o' ? 'rgba(255,200,120,0.9)' : 'rgba(190,235,130,0.9)'; c.fill();
        c.restore();
      }
    }
    // crust ring round the section, with the sugar coat on its upper half
    c.strokeStyle = 'rgba(130,70,20,0.6)'; c.lineWidth = 0.295 * r; c.stroke(this.pathDesign);
    c.strokeStyle = '#b36a26'; c.lineWidth = 0.27 * r; c.stroke(this.pathDesign);
    c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r + 0.04 * r); c.clip();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.19 * r; c.stroke(this.pathDesign);
    c.restore();
    // soft shade toward the cut edge
    c.fillStyle = lg(c, -0.45 * r, 0, -0.29 * r, 0, [[0, 'rgba(140,80,20,0)'], [1, 'rgba(140,80,20,0.3)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.restore();
    // the cut edge itself: crust ring on the section side, a bright edge on the loaf side
    c.strokeStyle = '#b06a26'; c.lineWidth = 0.05 * r; strokePts(c, edgePts);
    c.strokeStyle = 'rgba(95,50,15,0.8)'; c.lineWidth = 0.018 * r; strokePts(c, edgePts.map(p => ({ x: p.x - 0.025 * r, y: p.y })));
    c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r); c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.022 * r; strokePts(c, edgePts.map(p => ({ x: p.x + 0.03 * r, y: p.y })));
    c.restore();
  },
};
