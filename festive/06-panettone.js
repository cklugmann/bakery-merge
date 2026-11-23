'use strict';
// 6 ─ PANETTONE (panettone: a big puffed crown overhanging its tall paper band, seen a little from above)
FESTIVE_TIERS[6] = {
  key: 'panettone', name: 'Panettone', r: 50, outline: '#5e2f10',
  // geometry in units of r. The crown is widest (half-width Wc) at yW, well above the middle, and rises to yTop.
  // The paper band runs from yP (half-width Wp0) and tapers to the foot (half-width Wp1), whose rim is rounded
  // off in perspective down to yFoot. The convex hull runs straight from the crown's widest point to the foot;
  // the sliver between that line and the paper is painted as the deep shadow under the overhang.
  geo: { Wc: 0.95, yW: -0.42, yTop: -0.98, nC: 2.1, Wp0: 0.72, yP: -0.26, Wp1: 0.63, yFoot: 0.94, hb: 0.18, nB: 2.6 },
  shape(r) {
    const g = this.geo, pts = [];
    for (let i = 0; i <= 80; i++) {
      const u = lerp(-1, 1, i / 80);
      pts.push({ x: u * g.Wc * r, y: (g.yW - (g.yW - g.yTop) * Math.pow(1 - Math.pow(Math.abs(u), g.nC), 1 / g.nC)) * r });
      pts.push({ x: u * g.Wp1 * r, y: (g.yFoot - g.hb + g.hb * Math.pow(1 - Math.pow(Math.abs(u), g.nB), 1 / g.nB)) * r });
    }
    return [pts];
  },
  face: { x: 0, y: 0.36, s: 0.36 },
  crumbs: ['#e8b06c', '#9a521c', '#f2d394', '#ffffff', '#3d2a1a'],
  paint(c, r, R) {
    const g = this.geo, Wc = g.Wc * r, yW = g.yW * r, yTop = g.yTop * r, Wp0 = g.Wp0 * r, yP = g.yP * r, Wp1 = g.Wp1 * r;
    const yF0 = (g.yFoot - g.hb) * r, hb = g.hb * r;
    const crownY = x => yW - (yW - yTop) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / Wc), g.nC)), 1 / g.nC);
    const paperW = y => lerp(Wp0, Wp1, clamp((y - yP) / (yF0 - yP), 0, 1));        // half-width of the paper at height y
    const e = 0.1 * r;                                                               // perspective sag of horizontal rings
    const ring = (y0, x, hw) => y0 + e * Math.sqrt(Math.max(0, 1 - Math.pow(x / hw, 2)));
    const ringPts = (y0, f = 1, n = 48) => { const p = [], hw = paperW(y0) * f; for (let i = 0; i <= n; i++) { const x = lerp(-1, 1, i / n) * hw; p.push({ x, y: ring(y0, x, paperW(y0)) }); } return p; };
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── the deep shadow under the overhang (fills the hull outside the paper) ──
    c.fillStyle = lg(c, 0, yW, 0, yF0, [[0, '#2e1204'], [0.35, '#4e260e'], [1, '#7a4a20']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);

    // ── the paper band: light kraft-gold, one bold printed band, a seam ──
    const paper = new Path2D();
    paper.moveTo(-Wp0, yP - 0.2 * r); paper.lineTo(Wp0, yP - 0.2 * r);
    for (let i = 0; i <= 20; i++) { const y = lerp(yP, yF0, i / 20); paper.lineTo(paperW(y), y); }
    for (let i = 0; i <= 40; i++) { const u = lerp(1, -1, i / 40); paper.lineTo(u * Wp1, yF0 + hb * Math.pow(1 - Math.pow(Math.abs(u), g.nB), 1 / g.nB)); }
    for (let i = 20; i >= 0; i--) { const y = lerp(yP, yF0, i / 20); paper.lineTo(-paperW(y), y); }
    paper.closePath();
    c.save(); c.clip(paper);
    c.fillStyle = lg(c, -Wp0, 0, Wp0, 0, [[0, '#94602a'], [0.14, '#c99550'], [0.38, '#f0cc86'], [0.58, '#e6bd74'], [0.84, '#b88040'], [1, '#8a5826']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // faint paper grain
    speckle(c, R, 50, R => ({ x: (R() * 2 - 1) * Wp0, y: lerp(yP, yF0 + hb, R()) }), 'rgba(150,100,40,0.12)', 0.006 * r, 0.014 * r);
    // a vertical seam where the paper overlaps (no pleats)
    { const a = 0.95, top = yP + 0.1 * r, bot = yF0 + 0.08 * r, pts = [];
      for (let i = 0; i <= 16; i++) { const y = lerp(top, bot, i / 16); pts.push({ x: Math.sin(a) * paperW(y), y: y + e * Math.cos(a) }); }
      c.strokeStyle = 'rgba(120,75,30,0.45)'; c.lineWidth = 0.025 * r; strokePts(c, pts);
      c.save(); c.translate(-0.022 * r, 0); c.strokeStyle = 'rgba(255,240,205,0.5)'; c.lineWidth = 0.018 * r; strokePts(c, pts); c.restore(); }
    // one bold printed border along the top of the paper: chocolate brown, gold scalloped lower edge, big gold dots
    const b0 = yP + 0.04 * r, b1 = yP + 0.22 * r;
    const band = new Path2D();
    for (const p of ringPts(b0, 1.1)) band.lineTo(p.x, p.y);
    const lower = []; for (let i = 0; i <= 96; i++) { const t = i / 96, x = lerp(1.1, -1.1, t) * paperW(b1); lower.push({ x, y: ring(b1, x, paperW(b1)) + 0.04 * r * Math.abs(Math.sin(t * Math.PI * 7)) }); }
    for (const p of lower) band.lineTo(p.x, p.y);
    band.closePath();
    c.fillStyle = lg(c, -Wp0, 0, Wp0, 0, [[0, '#3c1c08'], [0.4, '#6e3716'], [1, '#341806']]); c.fill(band);
    c.strokeStyle = '#e8c068'; c.lineWidth = 0.03 * r; strokePts(c, lower);
    for (let j = -3; j <= 3; j++) {
      const a = j / 3.4 * (Math.PI / 2), hw = paperW((b0 + b1) / 2), x = Math.sin(a) * hw, y = ring((b0 + b1) / 2 + 0.03 * r, x, hw);
      ell(c, x, y, 0.036 * r * Math.max(0.35, Math.cos(a)), 0.036 * r); c.fillStyle = '#f2cf78'; c.fill();
    }
    // foot line
    c.strokeStyle = 'rgba(120,65,25,0.6)'; c.lineWidth = 0.028 * r; strokePts(c, ringPts(0.74 * r, 1.1));
    // shading: under the crown and toward the foot
    c.fillStyle = lg(c, 0, yP, 0, yP + 0.3 * r, [[0, 'rgba(70,30,5,0.4)'], [1, 'rgba(70,30,5,0)']]); c.fillRect(-2 * r, yP, 4 * r, 0.3 * r);
    c.fillStyle = lg(c, 0, 0.62 * r, 0, r, [[0, 'rgba(90,45,10,0)'], [1, 'rgba(90,45,10,0.45)']]); c.fillRect(-2 * r, 0.62 * r, 4 * r, r);
    c.restore();
    // crisp paper edges against the shadow, and the paper's top rim standing off the loaf
    c.lineWidth = 0.025 * r;
    for (const s of [-1, 1]) {
      const p = []; for (let i = 0; i <= 16; i++) { const y = lerp(yP, yF0 + 0.04 * r, i / 16); p.push({ x: s * (paperW(y) - 0.012 * r), y }); }
      c.strokeStyle = s < 0 ? 'rgba(255,232,180,0.75)' : 'rgba(255,225,170,0.4)'; strokePts(c, p);
    }
    c.strokeStyle = 'rgba(255,238,195,0.95)'; c.lineWidth = 0.032 * r;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (Wp0 - 0.008 * r), yP + 0.004 * r); c.lineTo(s * (Wp0 - 0.14 * r), ring(yP, Wp0 - 0.14 * r, Wp0)); c.stroke(); }

    // ── the crown ──
    const lipSide = yP - 0.015 * r, lipW = Wp0 - 0.015 * r;
    const crown = new Path2D();
    crown.moveTo(-Wc, yW);
    for (let i = 0; i <= 80; i++) { const x = lerp(-1, 1, i / 80) * Wc; crown.lineTo(x, crownY(x)); }
    crown.bezierCurveTo(Wc, yW + 0.13 * r, lipW + 0.12 * r, lipSide + 0.01 * r, lipW, lipSide);
    for (let i = 0; i <= 48; i++) { const x = lerp(1, -1, i / 48) * lipW; crown.lineTo(x, lipSide + e * Math.sqrt(Math.max(0, 1 - Math.pow(x / lipW, 2)))); }
    crown.bezierCurveTo(-lipW - 0.12 * r, lipSide + 0.01 * r, -Wc, yW + 0.13 * r, -Wc, yW);
    crown.closePath();
    // shadow it casts on the paper
    c.save(); c.clip(paper); c.translate(0, 0.07 * r); c.fillStyle = 'rgba(40,15,0,0.55)'; c.fill(crown); c.restore();
    c.save(); c.clip(crown);
    // baked colour: deep brown top, golden puffed sides
    c.fillStyle = lg(c, 0, yTop, 0, lipSide + e, [[0, '#4e1c06'], [0.3, '#7c3a10'], [0.62, '#b06a28'], [0.86, '#dc9c4c'], [1, '#c8823a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -Wc, 0, Wc, 0, [[0, 'rgba(70,25,0,0.6)'], [0.16, 'rgba(70,25,0,0)'], [0.8, 'rgba(70,25,0,0)'], [1, 'rgba(70,25,0,0.65)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = rg(c, -0.35 * r, -0.62 * r, 0, -0.35 * r, -0.62 * r, 0.5 * r, [[0, 'rgba(255,220,160,0.4)'], [1, 'rgba(255,220,160,0)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 120, R => ({ x: (R() * 2 - 1) * Wc, y: lerp(g.yTop, 0.05, R()) * r }), R => `rgba(70,25,5,${0.1 + R() * 0.2})`, 0.008 * r, 0.02 * r);
    // cross cut: two bold gashes crossing in a flattened X, widest where they cross
    const cx = 0, cy = (g.yTop + 0.3) * r, ax = 0.49 * r, ay = 0.14 * r;
    const gash = (x0, y0, x1, y1, hw) => {
      const p = new Path2D(), L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * hw, ny = (x1 - x0) / L * hw, pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16, k = Math.pow(Math.sin(Math.PI * t), 0.7) * (1 + (R() - 0.5) * 0.3 * Math.sin(Math.PI * t)); pts.push({ x: lerp(x0, x1, t) + nx * k, y: lerp(y0, y1, t) + ny * k }); }
      for (let i = 16; i >= 0; i--) { const t = i / 16, k = Math.pow(Math.sin(Math.PI * t), 0.7) * (1 + (R() - 0.5) * 0.3 * Math.sin(Math.PI * t)); pts.push({ x: lerp(x0, x1, t) - nx * k, y: lerp(y0, y1, t) - ny * k }); }
      return pathFromPts(p, pts);
    };
    const g1 = gash(cx - ax, cy + ay, cx + ax * 0.9, cy - ay * 0.85, 0.108 * r), g2 = gash(cx + ax, cy + ay, cx - ax * 0.9, cy - ay * 0.85, 0.108 * r);
    for (const q of [g1, g2]) { c.save(); c.translate(0.012 * r, 0.035 * r); c.fillStyle = 'rgba(40,10,0,0.6)'; c.fill(q); c.restore(); }
    c.strokeStyle = '#3e1604'; c.lineWidth = 0.07 * r; c.stroke(g1); c.stroke(g2);
    c.fillStyle = rg(c, cx - 0.04 * r, cy - 0.03 * r, 0, cx, cy, 0.5 * r, [[0, '#fff2c4'], [0.45, '#fbd888'], [1, '#e4a650']]); c.fill(g1); c.fill(g2);
    for (const q of [g1, g2]) { c.save(); c.clip(q); speckle(c, R, 16, R => ({ x: cx + (R() * 2 - 1) * ax, y: cy + (R() * 2 - 1) * ay }), 'rgba(185,115,40,0.45)', 0.01 * r, 0.02 * r); c.restore(); }
    c.strokeStyle = 'rgba(255,205,135,0.85)'; c.lineWidth = 0.026 * r;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * ax * 0.78, cy - ay * 1.05); c.quadraticCurveTo(cx + s * ax * 0.3, cy - ay * 0.8, cx + s * 0.05 * r, cy - 0.09 * r); c.stroke(); }
    // bold fruit pushing through the crust: raisins and candied orange
    const fruit = [[-0.62, -0.47, 'r'], [-0.2, -0.45, 'o'], [0.22, -0.47, 'r'], [0.62, -0.45, 'o'], [-0.78, -0.64, 'o'], [0.8, -0.64, 'r'], [-0.4, -0.3, 'r'], [0.04, -0.28, 'o'], [0.44, -0.3, 'r']];
    for (const [fxu, fyu, k] of fruit) {
      const x = fxu * r + (R() - 0.5) * 0.04 * r, y = fyu * r + (R() - 0.5) * 0.04 * r, s = lerp(0.065, 0.075, R()) * r;
      ell(c, x, y + 0.012 * r, s * 1.25, s * 0.95); c.fillStyle = 'rgba(255,215,150,0.35)'; c.fill();
      ell(c, x, y - 0.008 * r, s * 1.15, s * 0.9); c.fillStyle = 'rgba(60,20,0,0.5)'; c.fill();
      if (k === 'o') {
        c.save(); c.translate(x, y); c.rotate((R() - 0.5) * 1.2);
        c.beginPath(); c.roundRect(-s, -s * 0.66, 2 * s, 1.32 * s, s * 0.35); c.fillStyle = '#ee7d14'; c.fill();
        c.strokeStyle = 'rgba(110,40,0,0.75)'; c.lineWidth = 0.016 * r; c.stroke();
        c.beginPath(); c.roundRect(-s * 0.72, -s * 0.48, 1.4 * s, 0.42 * s, s * 0.2); c.fillStyle = 'rgba(255,225,160,0.9)'; c.fill();
        c.restore();
      } else {
        blobPath(c, x, y, s, R, 7, 0.4); c.fillStyle = '#2a0d05'; c.fill();
        c.strokeStyle = 'rgba(150,80,65,0.8)'; c.lineWidth = 0.016 * r; c.beginPath(); c.moveTo(x - s * 0.5, y - s * 0.2); c.quadraticCurveTo(x, y - s * 0.6, x + s * 0.45, y - s * 0.2); c.stroke();
      }
    }
    // pearl sugar round the cut
    for (const [u, v] of [[0.0, -1.25], [-1.25, 0.85], [1.28, 0.9], [-1.2, -0.45], [1.15, -0.4], [-0.55, 1.9], [0.62, 1.85], [-1.45, 1.9], [1.5, 1.8], [0.05, 2.35]]) {
      const x = cx + (u + (R() - 0.5) * 0.08) * ax, y = cy + (v + (R() - 0.5) * 0.15) * ay, s = lerp(0.034, 0.044, R()) * r;
      if (y < crownY(x) + 0.075 * r || fruit.some(([a, b]) => Math.hypot(a * r - x, b * r - y) < 0.13 * r)) continue;
      blobPath(c, x + 0.008 * r, y + 0.012 * r, s, R, 5, 0.35); c.fillStyle = 'rgba(40,12,0,0.5)'; c.fill();
      blobPath(c, x, y, s, R, 5, 0.35); c.fillStyle = '#fffdf6'; c.fill();
      circ(c, x + s * 0.2, y + s * 0.25, s * 0.45); c.fillStyle = 'rgba(200,190,200,0.6)'; c.fill();
    }
    // the underside of the overhang turns away from the light
    for (const s of [-1, 1]) {
      const ux = s * 0.86 * r, uy = yW + 0.16 * r;
      c.fillStyle = rg(c, ux, uy, 0, ux, uy, 0.34 * r, [[0, 'rgba(50,15,0,0.5)'], [1, 'rgba(50,15,0,0)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    }
    c.restore();
    // crown edge: dark line round the overhang, light line on the rounded lip
    c.strokeStyle = 'rgba(45,15,0,0.75)'; c.lineWidth = 0.035 * r; c.stroke(crown);
    { const p = []; for (let i = 0; i <= 40; i++) { const x = lerp(-0.75, 0.6, i / 40) * lipW; p.push({ x, y: lipSide - 0.045 * r + e * Math.sqrt(Math.max(0, 1 - Math.pow(x / lipW, 2))) }); }
      c.strokeStyle = 'rgba(255,225,160,0.6)'; c.lineWidth = 0.035 * r; strokePts(c, p); }
  },
};
