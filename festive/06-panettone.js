'use strict';
// 6 ─ PANETTONE (panettone: tall domed loaf in a straight paper band, seen a little from above)
FESTIVE_TIERS[6] = {
  key: 'panettone', name: 'Panettone', r: 50, outline: '#6a3a14',
  // geometry in units of r: half-width W of the straight paper band; the dome rises from yJoin to yTop;
  // the band runs straight down to yBase, then rounds off (the cylinder's bottom rim seen in perspective) to yBot
  geo: { W: 0.81, yTop: -1.02, yJoin: -0.2, nDome: 2.2, yBase: 0.72, yBot: 0.96, nBot: 2.6 },
  shape(r) {
    const { W, yTop, yJoin, nDome, yBase, yBot, nBot } = this.geo, pts = [];
    for (let i = 0; i <= 80; i++) {
      const u = lerp(-1, 1, i / 80), x = u * W * r;
      pts.push({ x, y: (yJoin - (yJoin - yTop) * Math.pow(1 - Math.pow(Math.abs(u), nDome), 1 / nDome)) * r });
      pts.push({ x, y: (yBase + (yBot - yBase) * Math.pow(1 - Math.pow(Math.abs(u), nBot), 1 / nBot)) * r });
    }
    return [pts];
  },
  face: { x: 0, y: -0.37, s: 0.36 },
  crumbs: ['#e8b06c', '#b8752e', '#ffffff', '#e8334a', '#3d2a1a'],
  paint(c, r, R) {
    const { W, yTop, yJoin, nDome } = this.geo, w = W * r;
    const domeY = x => (yJoin - (yJoin - yTop) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / w), nDome)), 1 / nDome)) * r;
    const e = 0.12 * r;                                                      // perspective sag of horizontal rings
    const ring = (y0, x) => y0 + e * Math.sqrt(Math.max(0, 1 - Math.pow(x / w, 2)));
    const ringPts = (y0, a = -1, b = 1, n = 48) => { const p = []; for (let i = 0; i <= n; i++) { const x = lerp(a, b, i / n) * w; p.push({ x, y: ring(y0, x) }); } return p; };
    const lip0 = (yJoin + 0.02) * r, lipY = x => ring(lip0, x);                                                  // lower edge of the dome's overhang
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── paper band: dark brown, printed with gold stars ──
    c.fillStyle = lg(c, -w, 0, w, 0, [[0, '#2c1406'], [0.18, '#4a2610'], [0.4, '#633519'], [0.7, '#45230e'], [1, '#261104']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // gold print: staggered rows of little four-point stars that wrap round the band
    const star4 = (x, y, s, sx) => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU - Math.PI / 2, d = i % 2 ? s * 0.32 : s; c.lineTo(x + Math.cos(a) * d * sx, y + Math.sin(a) * d); } c.closePath(); c.fill(); };
    [yJoin + 0.16, yJoin + 0.33, yJoin + 0.5, 0.76, 0.91].filter(y0 => y0 < 0.36 || y0 > 0.7).forEach((y0, row) => {
      for (let j = -6; j <= 6; j++) {
        const a = (j + (row % 2 ? 0.5 : 0)) / 6 * (Math.PI / 2); if (Math.abs(a) > Math.PI / 2 * 0.92) continue;
        const x = Math.sin(a) * w, y = ring(y0 * r, x), sx = Math.max(0.35, Math.cos(a));
        c.fillStyle = `rgba(250,212,120,${0.45 + 0.45 * sx})`; star4(x, y, 0.065 * r, sx);
      }
    });
    // red ribbon round the band, bow at the front
    const rb0 = 0.44 * r, rb1 = 0.6 * r;
    const band = new Path2D();
    for (const p of ringPts(rb0, -1.05, 1.05)) band.lineTo(p.x, p.y);
    for (const p of ringPts(rb1, -1.05, 1.05).reverse()) band.lineTo(p.x, p.y);
    band.closePath();
    c.save(); c.translate(0, 0.03 * r); c.fillStyle = 'rgba(20,5,0,0.5)'; c.fill(band); c.restore();
    c.fillStyle = lg(c, 0, rb0 + e * 0.7, 0, rb1 + e, [[0, '#ff6f6f'], [0.35, '#e2283c'], [1, '#900d1d']]); c.fill(band);
    c.strokeStyle = 'rgba(80,0,10,0.75)'; c.lineWidth = 0.022 * r; c.stroke(band);
    c.strokeStyle = 'rgba(255,215,215,0.65)'; c.lineWidth = 0.025 * r; strokePts(c, ringPts(rb0 + 0.045 * r, -0.85, 0.85));
    const bx = 0, by = ring((rb0 + rb1) / 2, 0) - 0.01 * r;
    const tail = s => { c.beginPath(); c.moveTo(bx - 0.03 * r * s, by); c.quadraticCurveTo(bx + s * 0.08 * r, by + 0.14 * r, bx + s * 0.17 * r, by + 0.27 * r); c.lineTo(bx + s * 0.1 * r, by + 0.24 * r); c.lineTo(bx + s * 0.05 * r, by + 0.3 * r); c.quadraticCurveTo(bx + s * 0.02 * r, by + 0.14 * r, bx - s * 0.05 * r, by + 0.02 * r); c.closePath(); };
    const loop = s => { c.beginPath(); c.moveTo(bx, by); c.bezierCurveTo(bx + s * 0.08 * r, by - 0.22 * r, bx + s * 0.32 * r, by - 0.18 * r, bx + s * 0.28 * r, by - 0.02 * r); c.bezierCurveTo(bx + s * 0.26 * r, by + 0.1 * r, bx + s * 0.1 * r, by + 0.07 * r, bx, by); c.closePath(); };
    for (const s of [-1, 1]) { tail(s); c.save(); c.translate(0.01 * r, 0.025 * r); c.fillStyle = 'rgba(20,5,0,0.45)'; c.fill(); c.restore(); }
    for (const s of [-1, 1]) { tail(s); c.fillStyle = s < 0 ? '#b51427' : '#d01e33'; c.fill(); c.strokeStyle = 'rgba(80,0,10,0.8)'; c.lineWidth = 0.022 * r; c.stroke(); }
    for (const s of [-1, 1]) { loop(s); c.save(); c.translate(0.01 * r, 0.03 * r); c.fillStyle = 'rgba(20,5,0,0.45)'; c.fill(); c.restore(); }
    for (const s of [-1, 1]) {
      loop(s); c.fillStyle = rg(c, bx + s * 0.13 * r, by - 0.12 * r, 0, bx + s * 0.15 * r, by - 0.05 * r, 0.2 * r, [[0, '#ff8080'], [0.55, '#e2283c'], [1, '#98101f']]); c.fill();
      c.strokeStyle = 'rgba(80,0,10,0.85)'; c.lineWidth = 0.024 * r; c.stroke();
      c.strokeStyle = 'rgba(120,0,15,0.5)'; c.lineWidth = 0.02 * r; c.beginPath(); c.moveTo(bx + s * 0.05 * r, by - 0.02 * r); c.quadraticCurveTo(bx + s * 0.14 * r, by - 0.08 * r, bx + s * 0.22 * r, by - 0.05 * r); c.stroke();
      ell(c, bx + s * 0.15 * r, by - 0.13 * r, 0.05 * r, 0.022 * r, s * 0.25); c.fillStyle = 'rgba(255,235,235,0.75)'; c.fill();
    }
    ell(c, bx, by, 0.06 * r, 0.065 * r); c.fillStyle = rg(c, bx - 0.02 * r, by - 0.02 * r, 0, bx, by, 0.07 * r, [[0, '#ff7070'], [1, '#b0142a']]); c.fill(); c.strokeStyle = 'rgba(80,0,10,0.85)'; c.lineWidth = 0.022 * r; c.stroke();
    // bottom shading of the band
    c.fillStyle = lg(c, 0, 0.62 * r, 0, r, [[0, 'rgba(15,4,0,0)'], [1, 'rgba(15,4,0,0.5)']]); c.fillRect(-2 * r, 0.62 * r, 4 * r, r);

    // ── the dome ──
    const lipPath = new Path2D();
    lipPath.moveTo(-2 * r, -2 * r); lipPath.lineTo(2 * r, -2 * r); lipPath.lineTo(2 * r, lipY(w));
    for (const p of ringPts(lip0, 1, -1, 80)) lipPath.lineTo(p.x, p.y);
    lipPath.lineTo(-2 * r, lipY(-w)); lipPath.closePath();
    c.save(); c.translate(0, 0.06 * r); c.fillStyle = 'rgba(15,4,0,0.6)'; c.fill(lipPath); c.restore();
    c.save(); c.clip(lipPath);
    // baked colour: deep brown crown, golden sides where it rose out of the paper
    c.fillStyle = lg(c, 0, yTop * r, 0, lipY(0) + 0.02 * r, [[0, '#55210a'], [0.3, '#7e3a13'], [0.58, '#a95c22'], [0.82, '#d9933f'], [0.93, '#f0b862'], [1, '#c98236']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -w, 0, w, 0, [[0, 'rgba(80,30,5,0.5)'], [0.2, 'rgba(80,30,5,0)'], [0.75, 'rgba(80,30,5,0)'], [1, 'rgba(80,30,5,0.55)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = rg(c, -0.32 * r, -0.6 * r, 0, -0.32 * r, -0.6 * r, 0.42 * r, [[0, 'rgba(255,220,160,0.4)'], [1, 'rgba(255,220,160,0)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 110, R => ({ x: (R() * 2 - 1) * w, y: lerp(yTop, 0.05, R()) * r }), R => `rgba(70,25,5,${0.1 + R() * 0.2})`, 0.008 * r, 0.02 * r);
    // cross cut on the crown: the four crust flaps peel back and show the golden crumb
    const cx = 0, cy = -0.77 * r, ax = 0.4 * r, ay = 0.115 * r;
    // two gashes crossing in an X (flattened by the perspective), widest where they cross
    const gash = (x0, y0, x1, y1, hw) => {
      const p = new Path2D(), L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * hw, ny = (x1 - x0) / L * hw;
      const pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16, k = Math.pow(Math.sin(Math.PI * t), 0.8) * (1 + (R() - 0.5) * 0.35 * Math.sin(Math.PI * t)); pts.push({ x: lerp(x0, x1, t) + nx * k, y: lerp(y0, y1, t) + ny * k }); }
      for (let i = 16; i >= 0; i--) { const t = i / 16, k = Math.pow(Math.sin(Math.PI * t), 0.8) * (1 + (R() - 0.5) * 0.35 * Math.sin(Math.PI * t)); pts.push({ x: lerp(x0, x1, t) - nx * k, y: lerp(y0, y1, t) - ny * k }); }
      return pathFromPts(p, pts);
    };
    const g1 = gash(cx - ax, cy + ay, cx + ax * 0.88, cy - ay * 0.8, 0.075 * r), g2 = gash(cx + ax, cy + ay, cx - ax * 0.88, cy - ay * 0.8, 0.075 * r);
    for (const g of [g1, g2]) { c.save(); c.translate(0.012 * r, 0.03 * r); c.fillStyle = 'rgba(45,12,0,0.55)'; c.fill(g); c.restore(); }
    c.strokeStyle = '#4a1c06'; c.lineWidth = 0.06 * r; c.stroke(g1); c.stroke(g2);
    const crumb = rg(c, cx - 0.04 * r, cy - 0.02 * r, 0, cx, cy, 0.42 * r, [[0, '#ffeab0'], [0.45, '#f7cc78'], [1, '#dc9a44']]);
    c.fillStyle = crumb; c.fill(g1); c.fill(g2);
    c.save(); c.clip(g1); speckle(c, R, 18, R => ({ x: cx + (R() * 2 - 1) * ax, y: cy + (R() * 2 - 1) * ay }), 'rgba(180,110,35,0.45)', 0.008 * r, 0.018 * r); c.restore();
    c.save(); c.clip(g2); speckle(c, R, 18, R => ({ x: cx + (R() * 2 - 1) * ax, y: cy + (R() * 2 - 1) * ay }), 'rgba(180,110,35,0.45)', 0.008 * r, 0.018 * r); c.restore();
    // the raised flap edges catch the light
    c.strokeStyle = 'rgba(255,205,135,0.8)'; c.lineWidth = 0.022 * r;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * ax * 0.78, cy - ay * 0.95); c.quadraticCurveTo(cx + s * ax * 0.3, cy - ay * 0.75, cx + s * 0.04 * r, cy - 0.07 * r); c.stroke(); }
    // a few raisins and bits of candied orange peel pushing through the crust (kept clear of the face)
    const fx = this.face.x * r, fy = this.face.y * r;
    const spots = [];
    for (let k = 0; k < 400 && spots.length < 9; k++) {
      const x = (R() * 2 - 1) * 0.8 * w, y = lerp(domeY(x) + 0.1 * r, lipY(x) - 0.07 * r, R());
      if (Math.abs(x - fx) < 0.38 * r && Math.abs(y - fy) < 0.18 * r) continue;
      if (Math.abs(x - cx) < ax * 1.1 && Math.abs(y - cy) < ay * 1.4) continue;
      if (spots.some(q => Math.hypot(q.x - x, q.y - y) < 0.2 * r)) continue;
      spots.push({ x, y });
    }
    spots.forEach((p, i) => {
      const s = lerp(0.042, 0.052, R()) * r;
      // a little pocket in the crust: light rim below, shadow above
      ell(c, p.x, p.y + 0.008 * r, s * 1.35, s * 1.05); c.fillStyle = 'rgba(255,215,150,0.35)'; c.fill();
      ell(c, p.x, p.y - 0.006 * r, s * 1.25, s * 0.95); c.fillStyle = 'rgba(70,25,0,0.45)'; c.fill();
      if (i % 3 === 1) {
        // candied orange peel: translucent, glossy
        c.save(); c.translate(p.x, p.y); c.rotate((R() - 0.5) * 1.2);
        c.beginPath(); c.roundRect(-s * 0.95, -s * 0.6, 1.9 * s, 1.2 * s, s * 0.35); c.fillStyle = '#e37a18'; c.fill();
        c.strokeStyle = 'rgba(120,45,0,0.6)'; c.lineWidth = 0.014 * r; c.stroke();
        c.beginPath(); c.roundRect(-s * 0.7, -s * 0.45, 1.3 * s, 0.4 * s, s * 0.2); c.fillStyle = 'rgba(255,220,150,0.85)'; c.fill();
        c.restore();
      } else {
        // raisin: dark, wrinkled, half sunk into the crust
        blobPath(c, p.x, p.y, s, R, 7, 0.5); c.fillStyle = '#34120a'; c.fill();
        c.strokeStyle = 'rgba(15,4,0,0.7)'; c.lineWidth = 0.012 * r; c.beginPath(); c.moveTo(p.x - s * 0.55, p.y + s * 0.15); c.quadraticCurveTo(p.x - s * 0.1, p.y - s * 0.2, p.x + s * 0.5, p.y + s * 0.2); c.stroke();
        c.strokeStyle = 'rgba(150,75,60,0.75)'; c.lineWidth = 0.014 * r; c.beginPath(); c.moveTo(p.x - s * 0.5, p.y - s * 0.25); c.quadraticCurveTo(p.x, p.y - s * 0.6, p.x + s * 0.4, p.y - s * 0.25); c.stroke();
      }
    });
    // pearl sugar on the crown
    // (u, v) in units of the cut's half-extent: round the crown, never on the pale cut (it must stay a clean ✕)
    const pearls = [[0.0, -1.2], [-1.3, 0.75], [1.32, 0.8], [-1.2, -0.4], [1.18, -0.35], [-0.55, 1.95], [0.62, 1.8], [-0.04, 2.1], [-1.5, 1.7], [1.55, 1.6], [-0.95, 2.3], [1.0, 2.4]];
    for (const [u, v] of pearls) {
      const x = cx + (u + (R() - 0.5) * 0.08) * ax, y = cy + (v + (R() - 0.5) * 0.15) * ay, s = lerp(0.028, 0.038, R()) * r;
      if (y < domeY(x) + 0.065 * r) continue;
      blobPath(c, x + 0.006 * r, y + 0.01 * r, s, R, 5, 0.35); c.fillStyle = 'rgba(40,12,0,0.5)'; c.fill();
      blobPath(c, x, y, s, R, 5, 0.35); c.fillStyle = '#fffdf6'; c.fill();
      circ(c, x + s * 0.2, y + s * 0.25, s * 0.45); c.fillStyle = 'rgba(200,190,200,0.6)'; c.fill();
    }
    c.restore();
    // the overhang edge: dark under, light on the rounded lip
    c.strokeStyle = 'rgba(50,15,0,0.65)'; c.lineWidth = 0.03 * r; strokePts(c, ringPts(lip0));
    c.strokeStyle = 'rgba(255,225,160,0.55)'; c.lineWidth = 0.035 * r; strokePts(c, ringPts(lip0 - 0.05 * r, -0.75, 0.55));
  },
};
