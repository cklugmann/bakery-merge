'use strict';
// 10 ─ GINGERBREAD HOUSE (gingerbread house: soft walls and a snowy roof)
FESTIVE_TIERS[10] = {
  key: 'house', name: 'Gingerbread House', r: 82, outline: '#6e3a14',
  // two soft convex parts (units of r): the walls [centreY, halfWidth, halfHeight] and the roof discs [x, y, radius]
  walls: [0.52, 0.69, 0.385], roof: [[0, -0.67, 0.12], [-0.75, 0.10, 0.12], [0.75, 0.10, 0.12]],
  shape(r) {
    const [cy, hw, hh] = this.walls, roof = [];
    for (const [x, y, d] of this.roof) roof.push(...ptsCircle(d * r, 40, x * r, y * r));
    return [ptsSuper(hw * r, hh * r, 3.4, 160, 0, cy * r), roof];
  },
  face: { x: -0.02, y: 0.55, s: 0.3 },
  crumbs: ['#c98646', '#ffffff', '#e8334a', '#2f9a55', '#ffd84a'],
  // The two parts overlap, so the engine's shading (an even-odd fill of frame + parts) would paint the overlap
  // black and its outline would draw the hidden wall top through the roof. This tier shades itself (noShade)
  // and strokes only the outer contour of the union (outlineFn).
  noShade: true,
  hulls(r) { return this.shape(r).map(convexHull); },
  // Sutherland–Hodgman: the part of convex polygon P inside convex polygon Q
  clipConvex(P, Q) {
    const s = Math.sign(polyArea(Q)) || 1;
    let out = P;
    for (let i = 0; i < Q.length && out.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length], side = p => s * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
      const src = out; out = [];
      for (let j = 0; j < src.length; j++) {
        const p = src[j], q = src[(j + 1) % src.length], dp = side(p), dq = side(q);
        if (dp >= 0) out.push(p);
        if ((dp >= 0) !== (dq >= 0)) { const t = dp / (dp - dq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); }
      }
    }
    return out;
  },
  outlineFn(c, path, r, ow) {
    const H = this.hulls(r);
    c.lineWidth = ow * 2; c.strokeStyle = this.outline;
    for (let i = 0; i < H.length; i++) {
      c.save();
      const outside = new Path2D(); outside.rect(-4 * r, -4 * r, 8 * r, 8 * r);
      for (let j = 0; j < H.length; j++) if (j !== i) pathFromPts(outside, H[j]);
      c.clip(outside, 'evenodd');
      c.stroke(pathFromPts(new Path2D(), H[i]));
      c.restore();
    }
  },

  paint(c, r, R, T, pr) {
    pr = pr || (c.getTransform ? c.getTransform().a : 1) || 1;
    const [WP, FP] = this.hulls(r), wallPath = pathFromPts(new Path2D(), WP), roofPath = pathFromPts(new Path2D(), FP);
    const [wcyU, whwU, whhU] = this.walls, wcy = wcyU * r, whw = whwU * r, whh = whhU * r;
    const eaveY = (this.roof[1][1] + this.roof[1][2]) * r;      // underside of the roof
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── walls: ginger-brown gingerbread ──
    c.fillStyle = lg(c, 0, wcy - whh, 0, wcy + whh, [[0, '#dc9a58'], [0.45, '#c47e3f'], [1, '#9a5524']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -whw, 0, whw, 0, [[0, 'rgba(110,50,10,0.3)'], [0.18, 'rgba(110,50,10,0)'], [0.82, 'rgba(110,50,10,0)'], [1, 'rgba(110,50,10,0.32)']]);
    c.fillRect(-whw, wcy - whh, 2 * whw, 2 * whh);
    speckle(c, R, 150, R => ({ x: (R() * 2 - 1) * whw, y: wcy + (R() * 2 - 1) * whh }), R => (R() < 0.7 ? `rgba(120,58,18,${0.18 + R() * 0.2})` : `rgba(255,225,170,${0.25 + R() * 0.2})`), r * 0.006, r * 0.014);
    // shadow under the eaves
    c.fillStyle = lg(c, 0, eaveY, 0, eaveY + 0.16 * r, [[0, 'rgba(80,32,6,0.45)'], [1, 'rgba(80,32,6,0)']]);
    c.fillRect(-r, eaveY - 0.1 * r, 2 * r, 0.26 * r);

    this.window(c, r, -0.385 * r, 0.47 * r);
    this.door(c, r, 0.36 * r, 0.43 * r);
    for (const s of [-1, 1]) this.cane(c, r, s * 0.585 * r, 0.22 * r, 0.95 * r, 0.075 * r);
    // a piped icing heart under the window
    {
      const hx = -0.385 * r, hy = 0.715 * r, hs = 0.06 * r;
      const heart = () => { c.beginPath(); c.moveTo(hx, hy + hs * 0.85); c.bezierCurveTo(hx - hs * 1.5, hy - hs * 0.15, hx - hs * 0.75, hy - hs * 1.15, hx, hy - hs * 0.4); c.bezierCurveTo(hx + hs * 0.75, hy - hs * 1.15, hx + hs * 1.5, hy - hs * 0.15, hx, hy + hs * 0.85); c.closePath(); };
      c.save(); c.translate(0.006 * r, 0.012 * r); heart(); c.strokeStyle = 'rgba(80,30,5,0.45)'; c.lineWidth = 0.028 * r; c.stroke(); c.restore();
      heart(); c.fillStyle = '#e8334a'; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 0.026 * r; c.stroke();
      ell(c, hx - hs * 0.45, hy - hs * 0.35, hs * 0.2, hs * 0.13, -0.6); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
    }
    // snow bank along the foot of the walls
    c.beginPath(); c.moveTo(-r, 1.1 * r);
    const bankY = x => (0.785 - 0.025 * Math.cos(x * 9) - 0.018 * Math.sin(x * 23 + 1)) * r;
    for (let x = -1; x <= 1.0001; x += 0.02) c.lineTo(x * r, bankY(x));
    c.lineTo(r, 1.1 * r); c.closePath();
    c.fillStyle = 'rgba(80,30,5,0.35)'; c.save(); c.translate(0, -0.018 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, 0.76 * r, 0, 0.9 * r, [[0, '#ffffff'], [0.5, '#f4f6fd'], [1, '#cfd6ec']]); c.fill();
    { const p = []; for (let x = -1; x <= 1.0001; x += 0.02) p.push({ x: x * r, y: bankY(x) + 0.018 * r }); c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.02 * r; strokePts(c, p); }
    this.gumdrop(c, r, -0.2 * r, 0.82 * r, 0.06 * r, '#2fae5a');
    this.gumdrop(c, r, 0.07 * r, 0.825 * r, 0.055 * r, '#a44fc0');

    // ── roof: chocolate shingles piped with icing, thick snow on top ──
    c.save(); c.clip(roofPath);
    c.fillStyle = lg(c, 0, -0.8 * r, 0, eaveY, [[0, '#8e4c24'], [1, '#5e2e12']]); c.fillRect(-r, -r, 2 * r, 1.3 * r);
    const rowH = 0.12 * r, sw = 0.16 * r;
    for (let row = 0, y = 0.12 * r; y > -0.6 * r; row++, y -= rowH) {
      for (let x = -r + (row % 2) * sw / 2; x < r; x += sw) {
        c.beginPath(); c.moveTo(x - sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 0.45);
        c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45); c.closePath();
        c.fillStyle = 'rgba(40,14,2,0.45)'; c.save(); c.translate(0, 0.02 * r); c.fill(); c.restore();
        c.fillStyle = lg(c, 0, y - rowH, 0, y, [[0, '#55260e'], [0.65, '#87451f'], [1, '#a35e2c']]); c.fill();
        c.beginPath(); c.moveTo(x + sw / 2, y - rowH * 0.45); c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45);
        c.strokeStyle = '#ffffff'; c.lineWidth = 0.03 * r; c.stroke();
      }
    }
    // piped bead border just inside the roof's slopes
    {
      const [ax, ay, ad] = this.roof[0], [bx, by] = this.roof[2], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
      const inset = ad - 0.075;    // centre line of the beads, measured from the disc centres along the outward normal
      for (const s of [-1, 1]) {
        const nx = s * uy, ny = -ux;   // outward normal of this slope (mirrored for the left one)
        for (let t = 0.1; t <= L - 0.02; t += 0.058) {
          const x = (s * ux * t + nx * inset) * r, y = (ay + uy * t + ny * inset) * r, q = 0.03 * r;
          circ(c, x + 0.006 * r, y + 0.012 * r, q); c.fillStyle = 'rgba(40,14,2,0.45)'; c.fill();
          circ(c, x, y, q); c.fillStyle = rg(c, x - q * 0.35, y - q * 0.4, 0, x, y, q, [[0, '#ffffff'], [0.6, '#f6f7fd'], [1, '#d4daee']]); c.fill();
        }
      }
    }
    // snow cap
    const capLobes = [[-0.62, 0.09, 0.05], [-0.48, 0.08, 0.11], [-0.33, 0.09, 0.06], [-0.17, 0.1, 0.14], [0, 0.09, 0.07], [0.16, 0.09, 0.12], [0.32, 0.09, 0.06], [0.47, 0.08, 0.13], [0.62, 0.09, 0.05]];
    const capY = x => { const u = x / r; let d = 0; for (const [cx, w, h] of capLobes) { const t = (u - cx) / w; if (Math.abs(t) < 1) d = Math.max(d, h * Math.sqrt(1 - t * t)); } return (-0.3 + d) * r; };
    const capPath = () => { c.beginPath(); c.moveTo(-r, -r); c.lineTo(r, -r); for (let x = r; x >= -r; x -= 0.01 * r) c.lineTo(x, capY(x)); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.025 * r); capPath(); c.fillStyle = 'rgba(40,14,2,0.45)'; c.fill(); c.restore();
    capPath(); c.fillStyle = lg(c, 0, -0.8 * r, 0, -0.15 * r, [[0, '#ffffff'], [0.6, '#fbfcff'], [1, '#e8ecf8']]); c.fill();
    c.save(); capPath(); c.clip();
    c.fillStyle = lg(c, -0.6 * r, 0, 0.6 * r, 0, [[0, 'rgba(255,255,255,0)'], [0.55, 'rgba(255,255,255,0)'], [1, 'rgba(140,150,200,0.32)']]); c.fillRect(-r, -r, 2 * r, r);
    const capEdge = dy => { const p = []; for (let x = -r; x <= r; x += 0.01 * r) p.push({ x, y: capY(x) + dy }); return p; };
    c.strokeStyle = 'rgba(150,160,205,0.55)'; c.lineWidth = 0.06 * r; strokePts(c, capEdge(0));
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.025 * r; strokePts(c, capEdge(-0.07 * r));
    // soft drifts in the snow
    for (const [x0, y0, x1, y1, cy] of [[-0.42, -0.36, -0.05, -0.43, -0.47], [0.08, -0.5, 0.42, -0.4, -0.56], [-0.2, -0.6, 0.1, -0.66, -0.7]]) {
      c.strokeStyle = 'rgba(150,162,210,0.4)'; c.lineWidth = 0.03 * r;
      c.beginPath(); c.moveTo(x0 * r, y0 * r); c.quadraticCurveTo((x0 + x1) / 2 * r, cy * r, x1 * r, y1 * r); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.02 * r;
      c.beginPath(); c.moveTo(x0 * r, (y0 - 0.03) * r); c.quadraticCurveTo((x0 + x1) / 2 * r, (cy - 0.03) * r, x1 * r, (y1 - 0.03) * r); c.stroke();
    }
    c.restore();
    c.restore();

    // eave: a thick rope of icing with scalloped drips hanging over the walls
    const ey = eaveY - 0.055 * r;
    c.beginPath();
    c.moveTo(-r, ey - 0.05 * r); c.lineTo(r, ey - 0.05 * r); c.lineTo(r, ey + 0.04 * r);
    const N = 13;
    for (let i = N; i >= 0; i--) {
      // one drip between x0 and x2, its rounded tip at x1; lengths vary in a 3-step pattern
      const x0 = lerp(-0.9, 0.9, i / N) * r, x1 = lerp(-0.9, 0.9, (i - 0.5) / N) * r, x2 = lerp(-0.9, 0.9, (i - 1) / N) * r, L = (0.08 + 0.05 * ((i * 7) % 3) / 2) * r;
      c.lineTo(x0, ey + 0.04 * r);
      if (i > 0) {
        c.bezierCurveTo(x0 - 0.01 * r, ey + L, x1 + 0.045 * r, ey + L + 0.02 * r, x1, ey + L + 0.02 * r);
        c.bezierCurveTo(x1 - 0.045 * r, ey + L + 0.02 * r, x2 + 0.01 * r, ey + L, x2, ey + 0.04 * r);
      }
    }
    c.lineTo(-r, ey + 0.04 * r); c.closePath();
    c.fillStyle = 'rgba(60,20,2,0.4)'; c.save(); c.translate(0.008 * r, 0.022 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, ey - 0.05 * r, 0, ey + 0.16 * r, [[0, '#ffffff'], [0.6, '#f7f8ff'], [1, '#dde2f2']]); c.fill();
    c.strokeStyle = 'rgba(150,160,205,0.6)'; c.lineWidth = 0.014 * r; c.stroke();
    // candies along the eave: the bottom of the ladder decorates the top
    const cand = [['p', -0.47], ['g', -0.235, '#e8334a'], ['p', 0], ['g', 0.235, '#2fae5a'], ['p', 0.47]];
    for (const [k, x, col] of cand) {
      if (k === 'p') this.peppermint(c, r, x * r, ey, 0.062 * r, x * 3);
      else this.gumdrop(c, r, x * r, ey + 0.045 * r, 0.065 * r, col);
    }
    this.peppermint(c, r, 0, -0.5 * r, 0.085 * r, 0.4);

    // ── self-shading (see noShade above) ──
    const I = this.clipConvex(WP, FP);
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); pathFromPts(frame, WP); pathFromPts(frame, FP); if (I.length > 2) pathFromPts(frame, I);
    c.save();
    c.shadowColor = 'rgba(60,22,0,0.38)'; c.shadowBlur = r * 0.32 * pr; c.shadowOffsetX = -r * 0.09 * pr; c.shadowOffsetY = -r * 0.14 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    const C = (T && T.C) || { x: 0, y: 0.2 * r };
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, C.x - 0.4 * r, C.y - 0.5 * r, 0, C.x - 0.2 * r, C.y - 0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
  },

  window(c, r, x, y) {
    const hw = 0.115 * r, hh = 0.13 * r, pad = 0.04 * r;
    const arch = (p) => { c.beginPath(); c.moveTo(x - hw - p, y + hh + p); c.lineTo(x - hw - p, y - hh + hw); c.arc(x, y - hh + hw, hw + p, Math.PI, 0); c.lineTo(x + hw + p, y + hh + p); c.closePath(); };
    circ(c, x, y, 0.3 * r); c.fillStyle = rg(c, x, y, 0, x, y, 0.3 * r, [[0, 'rgba(255,214,110,0.45)'], [1, 'rgba(255,214,110,0)']]); c.fill();
    c.save(); c.translate(0.01 * r, 0.02 * r); arch(pad); c.fillStyle = 'rgba(70,28,4,0.4)'; c.fill(); c.restore();
    arch(pad); c.fillStyle = '#fffaf2'; c.fill(); c.strokeStyle = 'rgba(120,70,40,0.45)'; c.lineWidth = 0.012 * r; c.stroke();
    arch(0); c.fillStyle = rg(c, x - 0.02 * r, y + 0.03 * r, 0, x, y, hh * 1.35, [[0, '#fffde6'], [0.4, '#ffe57e'], [0.8, '#f7b23c'], [1, '#e08824']]); c.fill();
    c.strokeStyle = '#7a3a12'; c.lineWidth = 0.024 * r; c.stroke();
    const bars = () => { c.beginPath(); c.moveTo(x, y - hh - 0.01 * r); c.lineTo(x, y + hh); c.moveTo(x - hw, y + 0.015 * r); c.lineTo(x + hw, y + 0.015 * r); };
    c.save(); arch(0); c.clip();
    c.save(); c.translate(0.006 * r, 0.01 * r); c.strokeStyle = 'rgba(150,70,10,0.55)'; c.lineWidth = 0.036 * r; bars(); c.stroke(); c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.032 * r; bars(); c.stroke();
    c.restore();
    // snowy sill
    c.beginPath(); c.moveTo(x - hw - 0.07 * r, y + hh + 0.02 * r); c.quadraticCurveTo(x, y + hh - 0.03 * r, x + hw + 0.07 * r, y + hh + 0.02 * r);
    c.quadraticCurveTo(x + hw + 0.08 * r, y + hh + 0.075 * r, x + hw + 0.04 * r, y + hh + 0.07 * r); c.lineTo(x - hw - 0.04 * r, y + hh + 0.07 * r); c.quadraticCurveTo(x - hw - 0.08 * r, y + hh + 0.075 * r, x - hw - 0.07 * r, y + hh + 0.02 * r);
    c.fillStyle = 'rgba(70,28,4,0.35)'; c.save(); c.translate(0, 0.015 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, y + hh - 0.02 * r, 0, y + hh + 0.07 * r, [[0, '#ffffff'], [1, '#dfe4f2']]); c.fill();
  },

  door(c, r, x, top) {
    const hw = 0.135 * r, bot = 1.0 * r, pad = 0.035 * r;
    const arch = p => { c.beginPath(); c.moveTo(x - hw - p, bot); c.lineTo(x - hw - p, top + hw); c.arc(x, top + hw, hw + p, Math.PI, 0); c.lineTo(x + hw + p, bot); c.closePath(); };
    c.save(); c.translate(0.012 * r, 0.02 * r); arch(pad); c.fillStyle = 'rgba(70,28,4,0.4)'; c.fill(); c.restore();
    arch(pad); c.fillStyle = '#fffaf2'; c.fill();
    arch(0); c.fillStyle = lg(c, x - hw, 0, x + hw, 0, [[0, '#4a1d0b'], [0.4, '#6e2f14'], [1, '#3e1708']]); c.fill();
    c.save(); arch(0); c.clip();
    c.strokeStyle = 'rgba(25,8,2,0.5)'; c.lineWidth = 0.014 * r;
    for (const f of [-0.33, 0.33]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.strokeStyle = 'rgba(255,190,140,0.18)'; c.lineWidth = 0.01 * r;
    for (const f of [-0.28, 0.38]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.restore();
    // piped icing dots around the frame
    for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, px = x + Math.cos(a) * (hw + pad * 0.5), py = top + hw + Math.sin(a) * (hw + pad * 0.5); circ(c, px, py, 0.022 * r); c.fillStyle = '#ffffff'; c.fill(); }
    // wreath
    const wx = x, wy = top + hw + 0.02 * r, wr = 0.06 * r;
    c.strokeStyle = '#0f4a20'; c.lineWidth = 0.05 * r; circ(c, wx, wy, wr); c.stroke();
    c.strokeStyle = '#2c9a4a'; c.lineWidth = 0.034 * r; circ(c, wx, wy, wr); c.stroke();
    for (let i = 0; i < 3; i++) { const a = 0.6 + i * 2.1; circ(c, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, 0.017 * r); c.fillStyle = '#e8334a'; c.fill(); }
    c.fillStyle = '#e8334a'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(wx, wy + wr); c.lineTo(wx + s * 0.05 * r, wy + wr - 0.03 * r); c.lineTo(wx + s * 0.05 * r, wy + wr + 0.03 * r); c.closePath(); c.fill(); }
    // knob
    circ(c, x + hw * 0.6, top + 0.27 * r, 0.026 * r); c.fillStyle = rg(c, x + hw * 0.55, top + 0.26 * r, 0, x + hw * 0.6, top + 0.27 * r, 0.026 * r, [[0, '#fff3a0'], [1, '#d99a1e']]); c.fill();
  },

  cane(c, r, x, y0, y1, w) {
    const path = () => { c.beginPath(); c.moveTo(x - w / 2, y1); c.lineTo(x - w / 2, y0 + w / 2); c.arc(x, y0 + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, y1); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.015 * r); path(); c.fillStyle = 'rgba(70,28,4,0.35)'; c.fill(); c.restore();
    c.save(); path(); c.clip();
    c.fillStyle = '#fffaf6'; c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.fillStyle = '#e8334a';
    for (let t = y0 - w; t < y1 + w; t += w * 1.15) { c.beginPath(); c.moveTo(x - w, t + w * 0.55); c.lineTo(x + w, t - w * 0.55); c.lineTo(x + w, t - w * 0.05); c.lineTo(x - w, t + w * 1.05); c.closePath(); c.fill(); }
    c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, 'rgba(90,10,20,0.35)'], [0.35, 'rgba(255,255,255,0.35)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(90,10,20,0.4)']]);
    c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.restore();
    path(); c.strokeStyle = 'rgba(120,20,30,0.6)'; c.lineWidth = 0.012 * r; c.stroke();
  },

  peppermint(c, r, x, y, s, rot) {
    circ(c, x + 0.008 * r, y + 0.016 * r, s); c.fillStyle = 'rgba(60,15,5,0.35)'; c.fill();
    circ(c, x, y, s); c.fillStyle = '#ffffff'; c.fill();
    c.save(); circ(c, x, y, s); c.clip();
    c.fillStyle = '#e8334a';
    for (let i = 0; i < 6; i++) {
      const a = rot + (i / 6) * TAU, P = (ang, d) => [x + Math.cos(ang) * d, y + Math.sin(ang) * d];
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(...P(a + 0.55, s * 0.6), ...P(a, s * 1.2));
      c.lineTo(...P(a + 0.48, s * 1.2));
      c.quadraticCurveTo(...P(a + 0.95, s * 0.6), x, y);
      c.fill();
    }
    c.fillStyle = rg(c, x - s * 0.3, y - s * 0.35, 0, x, y, s, [[0, 'rgba(255,255,255,0.35)'], [0.7, 'rgba(255,255,255,0)'], [1, 'rgba(120,20,30,0.35)']]); c.fillRect(x - s, y - s, 2 * s, 2 * s);
    c.restore();
    circ(c, x, y, s); c.strokeStyle = '#a3182c'; c.lineWidth = 0.014 * r; c.stroke();
    ell(c, x - s * 0.38, y - s * 0.42, s * 0.28, s * 0.16, -0.6); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  },

  gumdrop(c, r, x, y, s, col) {
    // y = base line; s = half-width
    const dome = () => { c.beginPath(); c.moveTo(x - s, y); c.bezierCurveTo(x - s, y - s * 1.45, x + s, y - s * 1.45, x + s, y); c.quadraticCurveTo(x, y + s * 0.22, x - s, y); c.closePath(); };
    c.save(); c.translate(0.008 * r, 0.014 * r); dome(); c.fillStyle = 'rgba(60,15,5,0.35)'; c.fill(); c.restore();
    dome(); c.fillStyle = rg(c, x - s * 0.3, y - s * 0.8, 0, x, y - s * 0.4, s * 1.3, [[0, mix(col, '#ffffff', 0.55)], [0.5, col], [1, mix(col, '#000000', 0.45)]]); c.fill();
    c.strokeStyle = mix(col, '#000000', 0.55); c.lineWidth = 0.012 * r; c.stroke();
    for (const [dx, dy] of [[-0.4, -0.5], [0.2, -0.75], [0.5, -0.35], [-0.1, -0.25], [0.05, -0.55]]) { circ(c, x + dx * s, y + dy * s, s * 0.09); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill(); }
    ell(c, x - s * 0.4, y - s * 0.7, s * 0.22, s * 0.13, -0.7); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
  },
};
