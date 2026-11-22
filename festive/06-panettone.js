'use strict';
// 6 ─ PANETTONE (panettone: tall domed loaf in a paper band)
FESTIVE_TIERS[6] = {
  key: 'panettone', name: 'Panettone', r: 50, outline: '#7a4416',
  // tall dome over a paper band (units of r); the convex hull of both is the collision shape
  dome: [0.88, 0.98, 0.18, -0.02], paper: [0.76, 0.68, 0.05, 0.94],
  shape(r) {
    const [dw, dt, db, dy] = this.dome, [pw0, pw1, py0, py1] = this.paper, pts = [];
    for (let i = 0; i <= 80; i++) { const x = lerp(-1, 1, i / 80) * dw * r, k = Math.max(0, 1 - Math.pow(Math.abs(x / (dw * r)), 2.3)); pts.push({ x, y: (dy - dt * Math.pow(k, 1 / 2.3)) * r }, { x, y: (dy + db * Math.sqrt(Math.max(0, 1 - Math.pow(x / (dw * r), 2)))) * r }); }
    pts.push({ x: -pw0 * r, y: py0 * r }, { x: pw0 * r, y: py0 * r }, ...ptsCircle(0.1 * r, 24, -(pw1 - 0.1) * r, (py1 - 0.1) * r), ...ptsCircle(0.1 * r, 24, (pw1 - 0.1) * r, (py1 - 0.1) * r));
    return [pts];
  },
  face: { x: 0, y: 0.45, s: 0.36 },
  crumbs: ['#e8b06c', '#b8752e', '#ffffff', '#e8334a', '#3d2a1a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#f2c27a'], [1, '#b8752e']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
