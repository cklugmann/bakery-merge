'use strict';
// 3 ─ TREE COOKIE (Christmas-tree iced sugar cookie, a plump rounded triangle)
FESTIVE_TIERS[3] = {
  key: 'tree', name: 'Tree Cookie', r: 29, outline: '#7a3f14',
  // plump rounded triangle: [x, y, radius] discs whose convex hull is the cookie (units of r)
  discs: [[0, -0.98, 0.2], [-0.47, -0.05, 0.2], [0.47, -0.05, 0.2], [-0.8, 0.8, 0.228], [0.8, 0.8, 0.228]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 40, x * r, y * r)); return [pts]; },
  face: { x: 0, y: 0.46, s: 0.48 },
  crumbs: ['#2f9a55', '#8fd9a0', '#ffd84a', '#e0a860', '#e8334a'],
  // the cookie outline pulled in by d (units of r): the exact inset of the convex hull of the discs
  inset(r, d) { const pts = []; for (const [x, y, rad] of this.discs) pts.push(...ptsCircle(Math.max(0.01, rad - d) * r, 40, x * r, y * r)); return pathFromPts(new Path2D(), convexHull(pts)); },
  // icing tiers, top → bottom: side line from (top x, top y) to the tip (x, y), number of scallops (units of r).
  // The icing is flooded up to a thin biscuit border; only small notches under each tip show the tree's steps.
  tiers: [[0, -0.93, 0.4, -0.32, 3], [0.05, -0.55, 0.62, 0.18, 4], [0.25, -0.05, 0.85, 0.65, 5]],
  paint(c, r, R) {
    const BORDER = 0.165;   // outline (≈0.075) + the visible baked rim
    const edge = pathFromPts(new Path2D(), convexHull(this.shape(r)[0])), inner = this.inset(r, BORDER);
    // ── sugar-cookie dough with a browned, crumbly edge ──
    c.fillStyle = rg(c, -0.2 * r, -0.1 * r, 0, 0, 0.1 * r, 1.1 * r, [[0, '#f6d699'], [0.6, '#eab873'], [1, '#d39a52']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.lineJoin = 'round';
    for (const [w, a] of [[0.5, 0.1], [0.38, 0.12], [0.28, 0.14]]) { c.lineWidth = w * r; c.strokeStyle = `rgba(150,72,18,${a})`; c.stroke(edge); }
    speckle(c, R, 70, R => ({ x: (R() * 2 - 1) * 1.05 * r, y: lerp(-1.15, 1.03, R()) * r }), R => `rgba(120,55,12,${0.2 + R() * 0.25})`, r * 0.01, r * 0.024);
    speckle(c, R, 30, R => ({ x: (R() * 2 - 1) * 1.05 * r, y: lerp(-1.15, 1.03, R()) * r }), R => `rgba(255,236,190,${0.35 + R() * 0.3})`, r * 0.008, r * 0.016);
    c.save(); c.translate(0.025 * r, 0.035 * r); c.strokeStyle = 'rgba(255,236,195,0.6)'; c.lineWidth = 0.15 * r + 0.035 * r; c.stroke(edge); c.restore();
    // ── trunk (chocolate icing) ──
    {
      const x0 = -0.16 * r, x1 = 0.16 * r, y0 = 0.5 * r, y1 = 1.05 * r;
      c.fillStyle = 'rgba(90,40,8,0.4)'; c.beginPath(); c.roundRect(x0 + 0.025 * r, y0, x1 - x0, y1 - y0, 0.06 * r); c.fill();
      c.fillStyle = lg(c, x0, 0, x1, 0, [[0, '#a2602f'], [0.4, '#83461f'], [1, '#55290f']]); c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, 0.06 * r); c.fill();
      c.strokeStyle = '#3e1c08'; c.lineWidth = 0.035 * r; c.stroke();
      c.lineCap = 'round'; c.lineWidth = 0.028 * r;
      c.strokeStyle = 'rgba(40,15,3,0.55)'; c.beginPath(); c.moveTo(0.04 * r, 0.8 * r); c.lineTo(0.05 * r, 0.92 * r); c.stroke();
      c.strokeStyle = 'rgba(235,175,120,0.6)'; c.beginPath(); c.moveTo(-0.08 * r, 0.78 * r); c.lineTo(-0.08 * r, 0.93 * r); c.stroke();
    }
    // ── green icing ──
    const tierPath = ([xt, yt, xb, yb, n]) => {
      const p = new Path2D(), X0 = xt * r, Y0 = yt * r, X1 = xb * r, Y1 = yb * r, sag = 0.035 * r;
      p.moveTo(-X0, Y0);
      p.quadraticCurveTo(-lerp(X0, X1, 0.42), lerp(Y0, Y1, 0.62), -X1, Y1 - 0.03 * r);
      for (let i = 0; i < n; i++) {
        const xa = lerp(-X1, X1, i / n), xc = lerp(-X1, X1, (i + 1) / n), ym = Y1 + sag * (1 - Math.pow((xa + xc) / 2 / X1, 2));
        const yc = Y1 + sag * (1 - Math.pow(xc / X1, 2)) - (i === n - 1 ? 0.03 * r : 0);
        p.bezierCurveTo(xa + (xc - xa) * 0.04, ym + 0.13 * r, xc - (xc - xa) * 0.04, ym + 0.13 * r, xc, yc);
      }
      p.quadraticCurveTo(lerp(X0, X1, 0.42), lerp(Y0, Y1, 0.62), X0, Y0);
      if (X0 > 0.001) p.lineTo(-X0, Y0);
      p.closePath();
      return p;
    };
    const tiers = this.tiers, paths = tiers.map(tierPath), icing = new Path2D();
    for (const p of paths) icing.addPath(p);
    // the icing stands a little proud of the biscuit
    c.save(); c.translate(0.02 * r, 0.04 * r); c.clip(inner); c.fillStyle = 'rgba(80,40,8,0.4)'; c.fill(icing); c.restore();
    c.save(); c.clip(inner);
    for (let k = tiers.length - 1; k >= 0; k--) {
      const [, yt, xb, yb] = tiers[k], path = paths[k];
      c.save(); c.clip(path);
      c.fillStyle = lg(c, -xb * r, yt * r, xb * 0.6 * r, yb * r + 0.12 * r, [[0, '#5ec673'], [0.35, '#2f9e50'], [0.75, '#1e8040'], [1, '#135f30']]);
      c.fillRect(-r, (yt - 0.1) * r, 2 * r, (yb - yt + 0.35) * r);
      // shade where the tier above overhangs
      if (k > 0) { c.save(); c.translate(0.02 * r, 0.05 * r); c.fillStyle = 'rgba(5,45,18,0.45)'; c.fill(paths[k - 1]); c.restore(); }
      // glossy streak on the lit side (not on the bottom tier, where the face sits)
      if (k < 2) {
        c.strokeStyle = 'rgba(210,255,215,0.45)'; c.lineWidth = 0.05 * r; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-xb * 0.62 * r, lerp(yt, yb, 0.62) * r + (k ? 0.08 * r : 0)); c.quadraticCurveTo(-xb * 0.42 * r, lerp(yt, yb, 0.8) * r, -xb * 0.2 * r, lerp(yt, yb, 0.86) * r); c.stroke();
      } else { c.strokeStyle = 'rgba(210,255,215,0.4)'; c.lineWidth = 0.045 * r; c.lineCap = 'round'; c.beginPath(); c.moveTo(-0.66 * r, 0.5 * r); c.quadraticCurveTo(-0.6 * r, 0.42 * r, -0.5 * r, 0.38 * r); c.stroke(); }
      c.restore();
      c.strokeStyle = '#0d4720'; c.lineWidth = 0.05 * r; c.stroke(path);
      c.save(); c.clip(path); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(190,255,195,0.5)'; c.lineWidth = 0.03 * r; c.stroke(path); c.restore();
    }
    c.restore();
    // the icing's edge along the biscuit border
    c.save(); c.clip(inner); c.clip(icing); c.strokeStyle = '#0d4720'; c.lineWidth = 0.1 * r; c.stroke(inner); c.restore();
    // ── one bold white garland ──
    {
      const pts = [], [x0, y0, x1, y1, sag] = [-0.44, -0.12, 0.56, 0.05, 0.13];
      for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push({ x: lerp(x0, x1, t) * r, y: (lerp(y0, y1, t) + sag * 4 * t * (1 - t)) * r }); }
      c.save(); c.clip(inner); c.clip(paths[1]); c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(0.015 * r, 0.035 * r); c.strokeStyle = 'rgba(5,40,15,0.45)'; c.lineWidth = 0.1 * r; strokePts(c, pts); c.restore();
      c.strokeStyle = '#d9d2c4'; c.lineWidth = 0.095 * r; strokePts(c, pts);
      c.strokeStyle = '#fffdf7'; c.lineWidth = 0.075 * r; c.save(); c.translate(-0.006 * r, -0.008 * r); strokePts(c, pts); c.restore();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.025 * r; c.save(); c.translate(-0.012 * r, -0.022 * r); strokePts(c, pts); c.restore();
      c.restore();
    }
    // ── big sugar-pearl baubles ──
    const bauble = (x, y, s, col, dark, light) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.015 * r, y + 0.03 * r, s); c.fillStyle = 'rgba(5,35,12,0.45)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, light], [0.5, col], [1, dark]]); c.fill();
      c.strokeStyle = dark; c.lineWidth = 0.028 * r; c.stroke();
      ell(c, x - s * 0.35, y - s * 0.38, s * 0.32, s * 0.22, -0.6); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    };
    const RED = ['#ec2f48', '#7e0a1c', '#ffa2ae'], GOLD = ['#ffcc2e', '#9a5f05', '#fff4b8'], BLUE = ['#3d9cf0', '#123f80', '#c8e8ff'];
    bauble(0.03, -0.5, 0.09, ...RED);
    bauble(0.3, -0.15, 0.09, ...BLUE);
    bauble(-0.12, 0.06, 0.095, ...GOLD);
    bauble(-0.52, 0.29, 0.095, ...RED); bauble(0.53, 0.3, 0.095, ...GOLD);
    bauble(-0.6, 0.63, 0.095, ...BLUE); bauble(0.6, 0.63, 0.095, ...RED);
    // ── the star on top ──
    {
      const x = 0, y = -0.76 * r, R0 = 0.235 * r, R1 = 0.11 * r, pts = [];
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = k % 2 ? R1 : R0; pts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }); }
      const path = new Path2D(); const n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? 0.12 : 0.22;
        const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
        i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
      }
      path.closePath();
      c.save(); c.translate(0.018 * r, 0.035 * r); c.fillStyle = 'rgba(70,35,5,0.45)'; c.fill(path); c.restore();
      c.fillStyle = rg(c, x - 0.06 * r, y - 0.07 * r, 0, x, y, R0, [[0, '#fff8c4'], [0.45, '#ffd935'], [1, '#e8960c']]); c.fill(path);
      c.strokeStyle = '#8a4a04'; c.lineWidth = 0.04 * r; c.lineJoin = 'round'; c.stroke(path);
      ell(c, x - 0.05 * r, y - 0.06 * r, 0.045 * r, 0.028 * r, -0.6); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    }
  },
};
