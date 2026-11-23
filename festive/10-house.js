'use strict';
// 10 ─ GINGERBREAD HOUSE (gingerbread house: soft walls and a snowy roof)
FESTIVE_TIERS[10] = {
  key: 'house', name: 'Gingerbread House', r: 82, outline: '#5e300f',
  // two soft convex parts (units of r): the walls [centreY, halfWidth, halfHeight] and the roof discs [x, y, radius]
  walls: [0.52, 0.69, 0.385], roof: [[0, -0.67, 0.12], [-0.75, 0.10, 0.12], [0.75, 0.10, 0.12]],
  shape(r) {
    const [cy, hw, hh] = this.walls, roof = [];
    for (const [x, y, d] of this.roof) roof.push(...ptsCircle(d * r, 40, x * r, y * r));
    return [ptsSuper(hw * r, hh * r, 3.4, 160, 0, cy * r), roof];
  },
  // the wall holds only the door and the face; the glowing window sits up in the gable
  face: { x: -0.22, y: 0.53, s: 0.32 },
  door: { x: 0.31, top: 0.4, hw: 0.145 },
  attic: { x: 0, y: -0.1, r: 0.125 },
  crumbs: ['#b8692e', '#ffffff', '#e8334a', '#2f9a55', '#ffd84a'],
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
    const [WP, FP] = this.hulls(r), roofPath = pathFromPts(new Path2D(), FP);
    const [wcyU, whwU, whhU] = this.walls, wcy = wcyU * r, whw = whwU * r, whh = whhU * r;
    const eaveY = (this.roof[1][1] + this.roof[1][2]) * r;      // underside of the roof
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── walls: deep ginger-brown gingerbread ──
    c.fillStyle = lg(c, 0, wcy - whh, 0, wcy + whh, [[0, '#c27434'], [0.45, '#a95f26'], [1, '#7c3f14']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -whw, 0, whw, 0, [[0, 'rgba(90,38,6,0.32)'], [0.18, 'rgba(90,38,6,0)'], [0.82, 'rgba(90,38,6,0)'], [1, 'rgba(90,38,6,0.35)']]);
    c.fillRect(-whw, wcy - whh, 2 * whw, 2 * whh);
    speckle(c, R, 130, R => ({ x: (R() * 2 - 1) * whw, y: wcy + (R() * 2 - 1) * whh }), R => (R() < 0.7 ? `rgba(90,40,10,${0.2 + R() * 0.2})` : `rgba(255,215,160,${0.22 + R() * 0.2})`), r * 0.006, r * 0.014);
    // shadow under the eaves
    c.fillStyle = lg(c, 0, eaveY, 0, eaveY + 0.16 * r, [[0, 'rgba(60,22,3,0.5)'], [1, 'rgba(60,22,3,0)']]);
    c.fillRect(-r, eaveY - 0.1 * r, 2 * r, 0.26 * r);

    this.doorway(c, r);
    for (const s of [-1, 1]) this.cane(c, r, s * 0.585 * r, 0.22 * r, 0.95 * r, 0.075 * r);
    // snow bank along the foot of the walls
    const bankY = x => (0.8 - 0.022 * Math.cos(x * 9) - 0.015 * Math.sin(x * 23 + 1)) * r;
    c.beginPath(); c.moveTo(-r, 1.1 * r);
    for (let x = -1; x <= 1.0001; x += 0.02) c.lineTo(x * r, bankY(x));
    c.lineTo(r, 1.1 * r); c.closePath();
    c.fillStyle = 'rgba(60,22,3,0.4)'; c.save(); c.translate(0, -0.018 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, 0.77 * r, 0, 0.9 * r, [[0, '#ffffff'], [0.5, '#f4f6fd'], [1, '#cfd6ec']]); c.fill();

    // ── roof: brown gingerbread shingles, each piped with a line of icing; snow on top ──
    c.save(); c.clip(roofPath);
    c.fillStyle = lg(c, 0, -0.8 * r, 0, eaveY, [[0, '#7a3e1a'], [1, '#4e230b']]); c.fillRect(-r, -r, 2 * r, 1.3 * r);
    const rowH = 0.125 * r, sw = 0.17 * r;
    for (let row = 0, y = 0.115 * r; y > -0.5 * r; row++, y -= rowH) {
      for (let x = -r + (row % 2) * sw / 2; x < r; x += sw) {
        const lip = () => { c.moveTo(x + sw / 2, y - rowH * 0.45); c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45); };
        c.beginPath(); c.moveTo(x - sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 0.45);
        c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45); c.closePath();
        c.fillStyle = 'rgba(30,10,1,0.5)'; c.save(); c.translate(0, 0.02 * r); c.fill(); c.restore();
        c.fillStyle = lg(c, 0, y - rowH, 0, y, [[0, '#5a2a0f'], [0.6, '#8a4a20'], [1, '#a8622f']]); c.fill();
        c.beginPath(); lip(); c.strokeStyle = '#fff8ee'; c.lineWidth = 0.022 * r; c.stroke();
      }
    }
    // snow cap on the ridge
    const capLobes = [[-0.42, 0.09, 0.07], [-0.27, 0.08, 0.12], [-0.12, 0.09, 0.06], [0.03, 0.09, 0.13], [0.18, 0.08, 0.06], [0.32, 0.09, 0.11], [0.46, 0.08, 0.05]];
    const capY = x => { const u = x / r; let d = 0; for (const [cx, w, h] of capLobes) { const t = (u - cx) / w; if (Math.abs(t) < 1) d = Math.max(d, h * Math.sqrt(1 - t * t)); } return (-0.43 + d) * r; };
    const capPath = () => { c.beginPath(); c.moveTo(-r, -r); c.lineTo(r, -r); for (let x = r; x >= -r; x -= 0.01 * r) c.lineTo(x, capY(x)); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.025 * r); capPath(); c.fillStyle = 'rgba(30,10,1,0.5)'; c.fill(); c.restore();
    capPath(); c.fillStyle = lg(c, 0, -0.8 * r, 0, -0.3 * r, [[0, '#ffffff'], [0.6, '#fbfcff'], [1, '#e8ecf8']]); c.fill();
    c.save(); capPath(); c.clip();
    c.fillStyle = lg(c, -0.4 * r, 0, 0.4 * r, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(140,150,200,0.35)']]); c.fillRect(-r, -r, 2 * r, r);
    const capEdge = dy => { const p = []; for (let x = -r; x <= r; x += 0.01 * r) p.push({ x, y: capY(x) + dy }); return p; };
    c.strokeStyle = 'rgba(150,160,205,0.55)'; c.lineWidth = 0.055 * r; strokePts(c, capEdge(0));
    c.strokeStyle = 'rgba(150,162,210,0.4)'; c.lineWidth = 0.028 * r;
    c.beginPath(); c.moveTo(-0.2 * r, -0.56 * r); c.quadraticCurveTo(0, -0.64 * r, 0.18 * r, -0.57 * r); c.stroke();
    c.restore();
    this.atticWindow(c, r);
    c.restore();

    // eave: a thick rope of icing with big scalloped drips hanging over the walls
    const ey = eaveY - 0.055 * r;
    c.beginPath();
    c.moveTo(-r, ey - 0.05 * r); c.lineTo(r, ey - 0.05 * r); c.lineTo(r, ey + 0.04 * r);
    const N = 9;
    for (let i = N; i >= 0; i--) {
      // one drip between x0 and x2, its rounded tip at x1; lengths vary in a 3-step pattern
      const x0 = lerp(-0.9, 0.9, i / N) * r, x1 = lerp(-0.9, 0.9, (i - 0.5) / N) * r, x2 = lerp(-0.9, 0.9, (i - 1) / N) * r, L = (0.09 + 0.06 * ((i * 7) % 3) / 2) * r;
      c.lineTo(x0, ey + 0.04 * r);
      if (i > 0) {
        c.bezierCurveTo(x0 - 0.015 * r, ey + L, x1 + 0.065 * r, ey + L + 0.03 * r, x1, ey + L + 0.03 * r);
        c.bezierCurveTo(x1 - 0.065 * r, ey + L + 0.03 * r, x2 + 0.015 * r, ey + L, x2, ey + 0.04 * r);
      }
    }
    c.lineTo(-r, ey + 0.04 * r); c.closePath();
    c.fillStyle = 'rgba(50,16,1,0.45)'; c.save(); c.translate(0.008 * r, 0.022 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, ey - 0.05 * r, 0, ey + 0.18 * r, [[0, '#ffffff'], [0.6, '#f7f8ff'], [1, '#dde2f2']]); c.fill();
    c.strokeStyle = 'rgba(140,150,200,0.7)'; c.lineWidth = 0.016 * r; c.stroke();
    // three big candies on the eave: the bottom of the ladder decorates the top
    this.peppermint(c, r, -0.44 * r, ey + 0.005 * r, 0.085 * r, 0.3);
    this.gumdrop(c, r, 0, ey + 0.055 * r, 0.09 * r, '#2fae5a');
    this.peppermint(c, r, 0.44 * r, ey + 0.005 * r, 0.085 * r, 1.1);

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

  // round window in the gable, glowing warm yellow, in a piped icing frame
  atticWindow(c, r) {
    const A = this.attic, x = A.x * r, y = A.y * r, wr = A.r * r, fr = wr + 0.04 * r;
    circ(c, x, y, wr * 2.1); c.fillStyle = rg(c, x, y, wr * 0.8, x, y, wr * 2.1, [[0, 'rgba(255,200,90,0.45)'], [1, 'rgba(255,200,90,0)']]); c.fill();
    circ(c, x + 0.01 * r, y + 0.022 * r, fr); c.fillStyle = 'rgba(30,10,1,0.5)'; c.fill();
    circ(c, x, y, fr); c.fillStyle = '#fffaf2'; c.fill();
    circ(c, x, y, wr); c.fillStyle = rg(c, x - 0.02 * r, y + 0.02 * r, 0, x, y, wr, [[0, '#fffde6'], [0.45, '#ffe57e'], [0.85, '#f7b23c'], [1, '#e08824']]); c.fill();
    c.strokeStyle = '#6e3210'; c.lineWidth = 0.024 * r; c.stroke();
    c.save(); circ(c, x, y, wr); c.clip();
    const bars = () => { c.beginPath(); c.moveTo(x, y - wr); c.lineTo(x, y + wr); c.moveTo(x - wr, y); c.lineTo(x + wr, y); };
    c.save(); c.translate(0.006 * r, 0.01 * r); c.strokeStyle = 'rgba(150,70,10,0.55)'; c.lineWidth = 0.036 * r; bars(); c.stroke(); c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.032 * r; bars(); c.stroke();
    c.restore();
    // icing ring highlight and a little snowy sill
    c.strokeStyle = 'rgba(160,170,210,0.6)'; c.lineWidth = 0.012 * r; circ(c, x, y, fr - 0.004 * r); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.014 * r; c.beginPath(); c.arc(x, y, fr - 0.016 * r, Math.PI * 1.05, Math.PI * 1.55); c.stroke();
    const sy = y + wr + 0.03 * r;
    c.beginPath(); c.moveTo(x - wr - 0.06 * r, sy); c.quadraticCurveTo(x, sy - 0.05 * r, x + wr + 0.06 * r, sy);
    c.quadraticCurveTo(x + wr + 0.07 * r, sy + 0.045 * r, x + wr + 0.03 * r, sy + 0.045 * r); c.lineTo(x - wr - 0.03 * r, sy + 0.045 * r); c.quadraticCurveTo(x - wr - 0.07 * r, sy + 0.045 * r, x - wr - 0.06 * r, sy);
    c.fillStyle = 'rgba(30,10,1,0.45)'; c.save(); c.translate(0, 0.015 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, sy - 0.03 * r, 0, sy + 0.045 * r, [[0, '#ffffff'], [1, '#dfe4f2']]); c.fill();
  },

  doorway(c, r) {
    const D = this.door, x = D.x * r, top = D.top * r, hw = D.hw * r, bot = 1.0 * r, pad = 0.04 * r;
    const arch = p => { c.beginPath(); c.moveTo(x - hw - p, bot); c.lineTo(x - hw - p, top + hw); c.arc(x, top + hw, hw + p, Math.PI, 0); c.lineTo(x + hw + p, bot); c.closePath(); };
    c.save(); c.translate(0.012 * r, 0.02 * r); arch(pad); c.fillStyle = 'rgba(50,18,2,0.45)'; c.fill(); c.restore();
    arch(pad); c.fillStyle = '#fffaf2'; c.fill();
    arch(0); c.fillStyle = lg(c, x - hw, 0, x + hw, 0, [[0, '#3e1607'], [0.4, '#5e2510'], [1, '#331205']]); c.fill();
    c.save(); arch(0); c.clip();
    c.strokeStyle = 'rgba(20,6,1,0.5)'; c.lineWidth = 0.015 * r;
    for (const f of [-0.33, 0.33]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.strokeStyle = 'rgba(255,190,140,0.16)'; c.lineWidth = 0.01 * r;
    for (const f of [-0.28, 0.38]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.restore();
    // piped icing dots around the frame
    for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, px = x + Math.cos(a) * (hw + pad * 0.5), py = top + hw + Math.sin(a) * (hw + pad * 0.5); circ(c, px, py, 0.024 * r); c.fillStyle = '#ffffff'; c.fill(); }
    // wreath
    const wx = x, wy = top + hw + 0.03 * r, wr = 0.068 * r;
    c.strokeStyle = '#0f4a20'; c.lineWidth = 0.056 * r; circ(c, wx, wy, wr); c.stroke();
    c.strokeStyle = '#2c9a4a'; c.lineWidth = 0.038 * r; circ(c, wx, wy, wr); c.stroke();
    for (let i = 0; i < 3; i++) { const a = 0.6 + i * 2.1; circ(c, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, 0.019 * r); c.fillStyle = '#e8334a'; c.fill(); }
    c.fillStyle = '#e8334a'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(wx, wy + wr); c.lineTo(wx + s * 0.055 * r, wy + wr - 0.033 * r); c.lineTo(wx + s * 0.055 * r, wy + wr + 0.033 * r); c.closePath(); c.fill(); }
    // knob
    circ(c, x + hw * 0.6, top + 0.3 * r, 0.028 * r); c.fillStyle = rg(c, x + hw * 0.55, top + 0.29 * r, 0, x + hw * 0.6, top + 0.3 * r, 0.028 * r, [[0, '#fff3a0'], [1, '#d99a1e']]); c.fill();
  },

  // a candy-cane post at a corner of the walls
  cane(c, r, x, y0, y1, w) {
    const path = () => { c.beginPath(); c.moveTo(x - w / 2, y1); c.lineTo(x - w / 2, y0 + w / 2); c.arc(x, y0 + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, y1); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.015 * r); path(); c.fillStyle = 'rgba(50,18,2,0.4)'; c.fill(); c.restore();
    c.save(); path(); c.clip();
    c.fillStyle = '#fffaf6'; c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.fillStyle = '#e02a42';
    for (let t = y0 - w; t < y1 + w; t += w * 1.15) { c.beginPath(); c.moveTo(x - w, t + w * 0.55); c.lineTo(x + w, t - w * 0.55); c.lineTo(x + w, t - w * 0.05); c.lineTo(x - w, t + w * 1.05); c.closePath(); c.fill(); }
    c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, 'rgba(90,10,20,0.35)'], [0.35, 'rgba(255,255,255,0.35)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(90,10,20,0.4)']]);
    c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.restore();
    path(); c.strokeStyle = 'rgba(110,16,28,0.65)'; c.lineWidth = 0.013 * r; c.stroke();
  },

  peppermint(c, r, x, y, s, rot) {
    circ(c, x + 0.008 * r, y + 0.016 * r, s); c.fillStyle = 'rgba(50,12,4,0.4)'; c.fill();
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
    circ(c, x, y, s); c.strokeStyle = '#a3182c'; c.lineWidth = 0.016 * r; c.stroke();
    ell(c, x - s * 0.38, y - s * 0.42, s * 0.28, s * 0.16, -0.6); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  },

  gumdrop(c, r, x, y, s, col) {
    // y = base line; s = half-width
    const dome = () => { c.beginPath(); c.moveTo(x - s, y); c.bezierCurveTo(x - s, y - s * 1.45, x + s, y - s * 1.45, x + s, y); c.quadraticCurveTo(x, y + s * 0.22, x - s, y); c.closePath(); };
    c.save(); c.translate(0.008 * r, 0.014 * r); dome(); c.fillStyle = 'rgba(50,12,4,0.4)'; c.fill(); c.restore();
    dome(); c.fillStyle = rg(c, x - s * 0.3, y - s * 0.8, 0, x, y - s * 0.4, s * 1.3, [[0, mix(col, '#ffffff', 0.55)], [0.5, col], [1, mix(col, '#000000', 0.45)]]); c.fill();
    c.strokeStyle = mix(col, '#000000', 0.55); c.lineWidth = 0.014 * r; c.stroke();
    for (const [dx, dy] of [[-0.4, -0.5], [0.2, -0.75], [0.5, -0.35], [-0.1, -0.25], [0.05, -0.55], [-0.55, -0.2], [0.35, -0.6]]) { circ(c, x + dx * s, y + dy * s, s * 0.08); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
    ell(c, x - s * 0.4, y - s * 0.7, s * 0.22, s * 0.13, -0.7); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
  },
};
