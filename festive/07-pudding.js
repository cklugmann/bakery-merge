'use strict';
// 7 ─ CHRISTMAS PUDDING (round Christmas pudding with white icing and holly — same collision shape as the classic Cherry Pie)
FESTIVE_TIERS[7] = {
  key: 'pudding', name: 'Christmas Pudding', r: 56, outline: '#3a1c0e',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.25, s: 0.36, eye: 'light' },
  crumbs: ['#5c311c', '#ffffff', '#2f9a55', '#e8334a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#7a4a2c'], [1, '#3f2212']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
