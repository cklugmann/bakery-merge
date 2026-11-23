'use strict';
// 1 ─ GUMDROP (sugared gumdrop: a jelly dome with sloping sides and a flat base)
FESTIVE_TIERS[1] = {
  key: 'gumdrop', name: 'Gumdrop', r: 19, outline: '#6a1f7e',
  // profile (units of r): widest (W) at y0, sides taper (k) into a round top at yt; soft rounded base down to yb
  G: { W: 0.95, y0: 0.22, yb: 0.46, yt: -1.18, k: 0.15, p: 2.2 },
  outlinePts(r) {
    const { W, y0, yb, yt, k, p } = this.G, pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, w = W * (1 - k * t) * Math.pow(Math.max(0, 1 - Math.pow(t, p)), 1 / p), y = lerp(y0, yt, t);
      pts.push({ x: w * r, y: y * r }, { x: -w * r, y: y * r });
    }
    for (let i = 0; i <= 60; i++) {
      const x = lerp(-1, 1, i / 60);
      pts.push({ x: x * W * r, y: (y0 + (yb - y0) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 4)), 1 / 4)) * r });
    }
    return pts;
  },
  shape(r) { return [this.outlinePts(r)]; },
  face: { x: 0, y: -0.24, s: 0.62 },
  crumbs: ['#c44bd2', '#8e27b0', '#ffffff', '#f3d6ff'],
  // sugar coat: veil = matte frosted layer over the whole dome, frost = alpha of the paler band inside the upper
  // contour (seen at a grazing angle the coat looks thicker), band = its depth (units of r), grain = granular crust
  // dots, crystals = bigger crystals on the shoulders, body = faint crystals lower down, edge = crystals sitting on
  // the contour line (see outlineFn)
  sugar: { veil: 0.34, frost: 0.5, band: 0.3, grain: 260, crystals: 28, body: 14, edge: 12 },
  // one sugar crystal: a soft-cornered pale quad with a shadow and a bright lit corner
  crystal(c, x, y, s, R, r, a = 1) {
    const rot = R() * TAU, q = [];
    for (let j = 0; j < 4; j++) { const t = rot + (j * Math.PI) / 2 + (R() - 0.5) * 0.45, d = s * lerp(0.8, 1.15, R()); q.push({ x: x + Math.cos(t) * d, y: y + Math.sin(t) * d }); }
    const poly = (dx, dy) => { c.beginPath(); q.forEach((v, j) => (j ? c.lineTo(v.x + dx, v.y + dy) : c.moveTo(v.x + dx, v.y + dy))); c.closePath(); c.fill(); };
    c.fillStyle = `rgba(55,5,85,${0.32 * a})`; poly(0.02 * r, 0.026 * r);
    c.fillStyle = `rgba(250,238,255,${0.85 * a})`; poly(0, 0);
    const lit = q.reduce((m, v) => (v.x + v.y < m.x + m.y ? v : m));
    circ(c, lerp(x, lit.x, 0.45), lerp(y, lit.y, 0.45), s * 0.4); c.fillStyle = `rgba(255,255,255,${a})`; c.fill();
  },
  // points just inside the upper contour; d0..d1 = depth inside (units of r, biased shallow); shoulders = favour the shoulders
  rimPts(r, R, n, d0, d1, shoulders) {
    const { W, y0 } = this.G, rim = resample(convexHull(this.outlinePts(r)), 200).filter(v => v.y < (y0 + 0.06) * r), out = [];
    for (let k = 0; k < n * 20 && out.length < n; k++) {
      const v = rim[Math.floor(R() * rim.length)], ax = Math.abs(v.x) / (W * r);
      if (shoulders) {
        if (ax > 0.22 && Math.sign(v.x) !== (out.length % 2 ? 1 : -1)) continue;   // alternate the shoulders so both get their share
        if (R() > (ax > 0.22 && ax < 0.94 ? 1 : 0.3)) continue;
      }
      const d = lerp(d0, d1, Math.pow(R(), 1.5)) * r, dx = -v.x, dy = -0.3 * r - v.y, L = Math.hypot(dx, dy) || 1;
      out.push({ x: v.x + (dx / L) * d, y: v.y + (dy / L) * d });
    }
    return out;
  },
  paint(c, r, R) {
    const { W, y0, yb, yt } = this.G, S = this.sugar, hull = convexHull(this.outlinePts(r)), hullPath = new Path2D();
    pathFromPts(hullPath, hull);
    const fx = this.face.x * r, fy = this.face.y * r, nearFace = p => Math.hypot((p.x - fx) / 1.5, p.y - fy) < 0.32 * r;
    const inDome = R => { for (let j = 0; j < 30; j++) { const x = (R() * 2 - 1) * W * r, y = lerp(yt, yb, R()) * r; if (inConvex(hull, x, y)) return { x, y }; } return null; };
    // ── the jelly: lit from the top-left, a dark thick core, light glowing through the lower edge
    c.fillStyle = rg(c, -0.4 * r, -0.7 * r, 0, -0.25 * r, -0.45 * r, 1.5 * r, [[0, '#d488ee'], [0.32, '#b046d6'], [0.65, '#8524b2'], [1, '#57107c']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = rg(c, 0.24 * r, -0.02 * r, 0, 0.24 * r, -0.02 * r, 0.6 * r, [[0, 'rgba(50,4,80,0.5)'], [1, 'rgba(50,4,80,0)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // ── the sugar coat: a matte frosted veil over everything (no gloss — gloss would make it a slime), paler on the
    // lit side, and a frostier band along the upper contour (soft falloff from stacked strokes)
    const lit = (a0, a1) => rg(c, -0.4 * r, -0.85 * r, 0, -0.4 * r, -0.85 * r, 1.65 * r, [[0, `rgba(246,232,255,${a0})`], [0.45, `rgba(246,232,255,${(a0 + a1) / 2})`], [1, `rgba(246,232,255,${a1})`]]);
    c.fillStyle = lit(S.veil, S.veil * 0.25); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // form shadow: the side turned away from the light stays deep and saturated (gives the dome its volume)
    c.fillStyle = rg(c, -0.38 * r, -0.6 * r, 0, -0.38 * r, -0.6 * r, 1.45 * r, [[0, 'rgba(45,4,75,0)'], [0.55, 'rgba(45,4,75,0)'], [0.85, 'rgba(45,4,75,0.3)'], [1, 'rgba(45,4,75,0.5)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, (2 + y0 + 0.1) * r); c.clip();
    for (let k = 1; k <= 6; k++) { c.strokeStyle = lit(S.frost / 6, S.frost / 18); c.lineWidth = (2 * S.band * r * k) / 6; c.stroke(hullPath); }
    c.restore();
    // light glowing through the jelly near the base (drawn over the veil: the lower edge stays translucent)
    c.save(); c.globalCompositeOperation = 'lighter';
    c.translate(0.08 * r, 0.34 * r); c.scale(1.4, 0.55);
    c.fillStyle = rg(c, 0, 0, 0, 0, 0, 0.62 * r, [[0, 'rgba(255,80,195,0.48)'], [0.55, 'rgba(210,50,185,0.2)'], [1, 'rgba(200,50,180,0)']]);
    c.fillRect(-3 * r, -3 * r, 6 * r, 6 * r);
    c.restore();
    // bright line where light leaves the lower edge
    const inner = new Path2D(); pathFromPts(inner, hull.map(v => ({ x: v.x * 0.86, y: -0.35 * r + (v.y + 0.35 * r) * 0.86 })));
    c.save(); c.beginPath(); c.rect(-2 * r, 0.02 * r, 4 * r, 2 * r); c.clip();
    c.strokeStyle = lg(c, -0.8 * r, 0, 0.8 * r, 0, [[0, 'rgba(255,150,235,0.2)'], [0.6, 'rgba(255,170,240,0.65)'], [1, 'rgba(255,170,240,0.4)']]);
    c.lineWidth = 0.075 * r; c.stroke(inner);
    c.restore();
    // granular crust all over: little square grains and small dark gaps between them; denser in the frosty band
    const grain = (p, s, col) => { c.save(); c.translate(p.x, p.y); c.rotate(R() * TAU); c.fillStyle = col; c.fillRect(-s, -s, 2 * s, 2 * s); c.restore(); };
    for (let i = 0; i < S.grain; i++) {
      const p = inDome(R); if (!p || (nearFace(p) && R() < 0.65)) continue;
      grain(p, lerp(0.012, 0.026, R()) * r, R() < 0.78 ? `rgba(255,242,255,${0.22 + R() * 0.33})` : `rgba(60,8,95,${0.18 + R() * 0.15})`);
    }
    for (const p of this.rimPts(r, R, 140, 0.02, S.band + 0.04, false)) grain(p, lerp(0.012, 0.026, R()) * r, `rgba(255,242,255,${0.3 + R() * 0.35})`);
    // coarse crystals: faint ones lower down, bright ones clustered on the shoulders and crown
    for (let i = 0; i < S.body; i++) { const p = inDome(R); if (p && !nearFace(p)) this.crystal(c, p.x, p.y, lerp(0.035, 0.055, R()) * r, R, r, 0.45); }
    for (const p of this.rimPts(r, R, S.crystals, 0.05, 0.3, true)) { if (!nearFace(p)) this.crystal(c, p.x, p.y, lerp(0.04, 0.075, R()) * r, R, r); }
    // a few sparkle glints on the shoulders
    for (const [x, y, s] of [[-0.58, -0.5, 0.13], [0.3, -0.94, 0.1], [0.68, -0.3, 0.09]]) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(x * r, (y - s) * r); c.quadraticCurveTo(x * r, y * r, (x + s) * r, y * r); c.quadraticCurveTo(x * r, y * r, x * r, (y + s) * r);
      c.quadraticCurveTo(x * r, y * r, (x - s) * r, y * r); c.quadraticCurveTo(x * r, y * r, x * r, (y - s) * r); c.fill();
    }
  },
  // the contour line, then sugar crystals sitting on it along the top (clipped to the silhouette by the engine),
  // so the upper edge reads as a sugar crust rather than a sticker outline
  outlineFn(c, path, r, ow) {
    c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(path);
    const R = mulberry32(4242);
    for (const p of this.rimPts(r, R, this.sugar.edge, 0, 0.04, true)) this.crystal(c, p.x, p.y, lerp(0.045, 0.075, R()) * r, R, r);
  },
};
