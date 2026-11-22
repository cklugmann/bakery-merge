'use strict';
// 3 ─ TREE COOKIE (Christmas-tree cookie, a plump rounded triangle)
FESTIVE_TIERS[3] = {
  key: 'tree', name: 'Tree Cookie', r: 29, outline: '#1f6b3a',
  // plump rounded triangle: [x, y, radius] discs whose convex hull is the cookie (units of r)
  discs: [[0, -0.87, 0.2], [-0.51, 0, 0.2], [0.51, 0, 0.2], [-0.87, 0.79, 0.225], [0.87, 0.79, 0.225]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 40, x * r, y * r)); return [pts]; },
  face: { x: 0, y: 0.5, s: 0.5 },
  crumbs: ['#2f9a55', '#8fd9a0', '#ffd84a', '#e8c48a', '#e8334a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#8fd9a0'], [1, '#2f9a55']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
