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
  paint(c, r, R) {
    const { W, y0, yb, yt } = this.G, hull = convexHull(this.outlinePts(r));
    const scaled = (f, cx, cy) => { const p = new Path2D(); pathFromPts(p, hull.map(v => ({ x: cx + (v.x - cx) * f, y: cy + (v.y - cy) * f }))); return p; };
    // translucent jelly: deep violet at the top and rim, glowing magenta low inside
    c.fillStyle = lg(c, 0, yt * r, 0, yb * r, [[0, '#7a1f9e'], [0.45, '#9b2cbd'], [1, '#c44bd2']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = rg(c, 0, 0.02 * r, 0, 0, 0.02 * r, 0.75 * r, [[0, 'rgba(250,135,240,0.8)'], [0.5, 'rgba(220,95,230,0.42)'], [1, 'rgba(190,60,215,0)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // darker jelly towards the silhouette (thicker there)
    c.fillStyle = rg(c, 0, -0.3 * r, 0.45 * r, 0, -0.3 * r, 1.1 * r, [[0, 'rgba(70,10,100,0)'], [1, 'rgba(70,10,100,0.55)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // light leaving the jelly along the lower-right rim
    c.save(); c.beginPath(); c.rect(0.05 * r, -0.45 * r, 2 * r, 2 * r); c.clip();
    c.strokeStyle = lg(c, 0.1 * r, -0.4 * r, 0.6 * r, 0.3 * r, [[0, 'rgba(255,160,245,0)'], [1, 'rgba(255,165,245,0.6)']]);
    c.lineWidth = 0.07 * r; c.stroke(scaled(0.8, 0, -0.3 * r));
    c.restore();
    // flat base: darker footing band
    c.fillStyle = lg(c, 0, (y0 + 0.02) * r, 0, yb * r, [[0, 'rgba(60,8,80,0)'], [1, 'rgba(60,8,80,0.5)']]); c.fillRect(-2 * r, (y0 + 0.02) * r, 4 * r, r);
    // frosted sugar veil (thicker on top) and soft sheen top-left
    c.fillStyle = lg(c, 0, yt * r, 0, 0.1 * r, [[0, 'rgba(255,235,255,0.28)'], [1, 'rgba(255,235,255,0)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 2.1 * r);
    ell(c, -0.38 * r, -0.66 * r, 0.22 * r, 0.12 * r, -0.75); c.fillStyle = 'rgba(255,245,255,0.5)'; c.fill();
    // sugar coating: a fine frosted grain, then coarse crystals, evenly over the dome
    const inner = hull.map(v => ({ x: v.x * 0.97, y: -0.3 * r + (v.y + 0.3 * r) * 0.97 }));
    const inDome = R => { for (let j = 0; j < 30; j++) { const x = (R() * 2 - 1) * W * r, y = lerp(yt, yb, R()) * r; if (inConvex(inner, x, y)) return { x, y }; } return null; };
    speckle(c, R, 160, inDome, R => `rgba(255,235,255,${0.2 + R() * 0.3})`, 0.012 * r, 0.024 * r);
    const fx = this.face.x * r, fy = this.face.y * r;
    for (let n = 0; n < 135; n++) {
      const p = inDome(R); if (!p) continue;
      const s = lerp(0.024, 0.052, R()) * r, rot = R() * TAU, k = R();
      if (Math.hypot((p.x - fx) / 1.5, p.y - fy) < 0.3 * r && k < 0.75) continue;
      const q = [0, 1, 2, 3].map(j => { const a = rot + j * Math.PI / 2 + (R() - 0.5) * 0.6, d = s * lerp(0.75, 1.25, R()); return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d }; });
      const poly = (dx, dy, pts) => { c.beginPath(); pts.forEach((v, j) => (j ? c.lineTo(v.x + dx, v.y + dy) : c.moveTo(v.x + dx, v.y + dy))); c.closePath(); c.fill(); };
      c.fillStyle = 'rgba(60,5,80,0.3)'; poly(0.018 * r, 0.022 * r, q);
      c.fillStyle = k < 0.5 ? 'rgba(255,238,255,0.8)' : 'rgba(245,200,255,0.55)'; poly(0, 0, q);
      c.fillStyle = 'rgba(255,255,255,0.95)'; poly(0, 0, [q[2], q[3], p]);
    }
    // a few sparkle glints
    for (const [x, y, s] of [[-0.5, -0.52, 0.12], [0.36, -0.8, 0.09], [0.62, -0.02, 0.08]]) {
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(x * r, (y - s) * r); c.quadraticCurveTo(x * r, y * r, (x + s) * r, y * r); c.quadraticCurveTo(x * r, y * r, x * r, (y + s) * r);
      c.quadraticCurveTo(x * r, y * r, (x - s) * r, y * r); c.quadraticCurveTo(x * r, y * r, x * r, (y - s) * r); c.fill();
    }
  },
};
