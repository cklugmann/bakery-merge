'use strict';
// 3 ─ TREE COOKIE (Christmas-tree iced sugar cookie, a plump rounded triangle)
FESTIVE_TIERS[3] = {
  key: 'tree', name: 'Tree Cookie', r: 29, outline: '#80461a',
  // plump rounded triangle: [x, y, radius] discs whose convex hull is the cookie (units of r)
  discs: [[0, -0.98, 0.2], [-0.47, -0.05, 0.2], [0.47, -0.05, 0.2], [-0.8, 0.8, 0.228], [0.8, 0.8, 0.228]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 40, x * r, y * r)); return [pts]; },
  face: { x: 0, y: 0.43, s: 0.48 },
  crumbs: ['#2f9a55', '#8fd9a0', '#ffd84a', '#e8c48a', '#e8334a'],
  // icing tiers, top → bottom: [top y, top half-width, bottom y, bottom half-width] (units of r)
  tiers: [[-0.84, 0, -0.26, 0.38], [-0.44, 0.06, 0.2, 0.58], [0.0, 0.1, 0.63, 0.78]],
  paint(c, r, R) {
    // ── biscuit ──
    c.fillStyle = rg(c, -0.25 * r, -0.2 * r, 0, 0, 0.1 * r, 1.15 * r, [[0, '#f6d9a0'], [0.55, '#e8b973'], [0.85, '#d39a53'], [1, '#b97c3a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 40, R => ({ x: (R() * 2 - 1) * r, y: lerp(-1.1, 1, R()) * r }), R => `rgba(150,85,30,${0.12 + R() * 0.15})`, r * 0.012, r * 0.026);
    // light line just inside the contour on the lit side
    const edge = pathFromPts(new Path2D(), convexHull(this.shape(r)[0]));
    c.save(); c.translate(0.025 * r, 0.035 * r); c.strokeStyle = 'rgba(255,240,205,0.6)'; c.lineWidth = (this.ow || 0.075 * r) * 2 + 0.04 * r; c.stroke(edge); c.restore();
    // ── trunk (chocolate icing) ──
    {
      const x0 = -0.15 * r, x1 = 0.15 * r, y0 = 0.5 * r, y1 = 1.05 * r;
      c.fillStyle = 'rgba(90,45,10,0.35)'; c.beginPath(); c.roundRect(x0 + 0.02 * r, y0, x1 - x0, y1 - y0, 0.06 * r); c.fill();
      c.fillStyle = lg(c, x0, 0, x1, 0, [[0, '#a86434'], [0.4, '#8a4b22'], [1, '#5e2e12']]); c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, 0.06 * r); c.fill();
      c.strokeStyle = '#4a220b'; c.lineWidth = 0.03 * r; c.stroke();
      c.strokeStyle = 'rgba(50,20,5,0.5)'; c.lineWidth = 0.025 * r; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0.02 * r, 0.78 * r); c.lineTo(0.03 * r, 0.9 * r); c.stroke();
      c.strokeStyle = 'rgba(230,170,120,0.55)'; c.beginPath(); c.moveTo(-0.07 * r, 0.76 * r); c.lineTo(-0.07 * r, 0.92 * r); c.stroke();
    }
    // ── green icing in three scalloped tiers ──
    const tierPath = ([yt, wt, yb, wb], scale = 1) => {
      const p = new Path2D(), Y0 = yt * r, Y1 = yb * r, W0 = wt * r, W1 = wb * r;
      const n = Math.max(3, Math.round(wb / 0.17)), sag = 0.04 * r;
      // left side (slightly concave), from the top down to the left tip
      p.moveTo(-W0, Y0);
      if (W0 < 0.02 * r) { p.moveTo(0, Y0 - 0.02 * r); }
      p.quadraticCurveTo(-lerp(W0, W1, 0.35), lerp(Y0, Y1, 0.75), -W1, Y1 - 0.03 * r);
      // scalloped bottom edge, sagging a little in the middle
      for (let i = 0; i < n; i++) {
        const xa = lerp(-W1, W1, i / n), xb = lerp(-W1, W1, (i + 1) / n), xm = (xa + xb) / 2;
        const ya = Y1 + sag * (1 - Math.pow(xa / W1, 2)) - (i === 0 ? 0.03 * r : 0), yb2 = Y1 + sag * (1 - Math.pow(xb / W1, 2)) - (i === n - 1 ? 0.03 * r : 0);
        const ym = Y1 + sag * (1 - Math.pow(xm / W1, 2));
        p.bezierCurveTo(xa + (xb - xa) * 0.05, ym + 0.12 * r, xb - (xb - xa) * 0.05, ym + 0.12 * r, xb, yb2);
      }
      p.quadraticCurveTo(lerp(W0, W1, 0.35), lerp(Y0, Y1, 0.75), W0, Y0);
      if (W0 < 0.02 * r) p.lineTo(0, Y0 - 0.02 * r);
      p.closePath();
      return p;
    };
    const tiers = this.tiers;
    for (let k = tiers.length - 1; k >= 0; k--) {
      const t = tiers[k], path = tierPath(t), [yt, , yb, wb] = t;
      // cast shadow on what lies below
      c.save(); c.translate(0.025 * r, 0.05 * r); c.fillStyle = 'rgba(60,40,10,0.35)'; c.fill(path); c.restore();
      c.save(); c.clip(path);
      c.fillStyle = lg(c, -wb * r, yt * r, wb * 0.6 * r, yb * r + 0.1 * r, [[0, '#66cc7c'], [0.35, '#32a355'], [0.75, '#208543'], [1, '#156633']]);
      c.fillRect(-r, (yt - 0.1) * r, 2 * r, (yb - yt + 0.3) * r);
      // shade where the upper tier overhangs, soft light on the scallops
      if (k > 0) { const up = tiers[k - 1]; c.fillStyle = lg(c, 0, up[2] * r, 0, (up[2] + 0.2) * r, [[0, 'rgba(10,60,25,0.45)'], [1, 'rgba(10,60,25,0)']]); c.fillRect(-r, (up[2] - 0.1) * r, 2 * r, 0.32 * r); }
      speckle(c, R, 10, R => ({ x: (R() * 2 - 1) * wb * 0.8 * r, y: lerp(yt, yb, 0.3 + R() * 0.6) * r }), 'rgba(220,255,225,0.35)', r * 0.012, r * 0.022);
      c.restore();
      c.strokeStyle = '#0f4d24'; c.lineWidth = 0.04 * r; c.lineJoin = 'round'; c.stroke(path);
      // light line along the top-left of the tier
      c.save(); c.clip(path); c.translate(0.025 * r, 0.03 * r); c.strokeStyle = 'rgba(200,255,200,0.55)'; c.lineWidth = 0.03 * r; c.stroke(path); c.restore();
    }
    // ── white icing garlands ──
    const garland = (x0, y0, x1, y1, sag) => {
      const pts = [], n = 16;
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ x: lerp(x0, x1, t) * r, y: (lerp(y0, y1, t) + sag * 4 * t * (1 - t)) * r }); }
      c.lineCap = 'round';
      c.save(); c.translate(0.012 * r, 0.025 * r); c.strokeStyle = 'rgba(10,50,20,0.4)'; c.lineWidth = 0.075 * r; strokePts(c, pts); c.restore();
      c.strokeStyle = '#fffdf6'; c.lineWidth = 0.06 * r; strokePts(c, pts);
      c.save(); c.translate(-0.008 * r, -0.012 * r); c.strokeStyle = '#ffffff'; c.lineWidth = 0.02 * r; strokePts(c, pts); c.restore();
    };
    garland(-0.17, -0.56, 0.21, -0.46, 0.08);
    garland(-0.35, -0.1, 0.43, 0.06, 0.1);
    // ── sugar-pearl baubles ──
    const bauble = (x, y, s, col, dark, light) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.012 * r, y + 0.022 * r, s); c.fillStyle = 'rgba(10,40,15,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, light], [0.5, col], [1, dark]]); c.fill();
      c.strokeStyle = dark; c.lineWidth = 0.02 * r; c.stroke();
      circ(c, x - s * 0.35, y - s * 0.38, s * 0.28); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    };
    const RED = ['#e8334a', '#8e0f22', '#ff9aa6'], GOLD = ['#ffcf3a', '#b07410', '#fff3b0'], BLUE = ['#4aa3f0', '#1d5a9e', '#c4e6ff'];
    bauble(-0.34, -0.24, 0.075, ...RED); bauble(0.34, -0.24, 0.075, ...GOLD);
    bauble(0.03, -0.44, 0.06, ...BLUE);
    bauble(-0.54, 0.19, 0.08, ...GOLD); bauble(0.54, 0.19, 0.08, ...RED);
    bauble(0.06, 0.03, 0.065, ...RED); bauble(-0.2, -0.02, 0.06, ...BLUE);
    bauble(-0.72, 0.62, 0.08, ...BLUE); bauble(0.72, 0.62, 0.08, ...GOLD);
    // ── the star on top ──
    {
      const x = 0, y = -0.81 * r, R0 = 0.2 * r, R1 = 0.095 * r, pts = [];
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = k % 2 ? R1 : R0; pts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }); }
      const path = new Path2D(); const n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? 0.12 : 0.22;
        const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
        i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
      }
      path.closePath();
      c.save(); c.translate(0.015 * r, 0.03 * r); c.fillStyle = 'rgba(70,40,5,0.4)'; c.fill(path); c.restore();
      c.fillStyle = rg(c, x - 0.06 * r, y - 0.07 * r, 0, x, y, R0, [[0, '#fff6b8'], [0.45, '#ffd83a'], [1, '#e89a10']]); c.fill(path);
      c.strokeStyle = '#a35f06'; c.lineWidth = 0.035 * r; c.lineJoin = 'round'; c.stroke(path);
      ell(c, x - 0.05 * r, y - 0.06 * r, 0.04 * r, 0.025 * r, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    }
  },
};
