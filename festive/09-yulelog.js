'use strict';
// 9 ─ YULE LOG (chocolate Yule log, side view — same collision shape as the classic Black Forest)
FESTIVE_TIERS[9] = {
  key: 'yulelog', name: 'Yule Log', r: 72, outline: '#2a140a',
  shape: r => [ptsSuper(r, 0.6 * r, 3.2)],
  face: { x: 0.3, y: 0.2, s: 0.32, eye: 'light' },
  crumbs: ['#5c311c', '#ffffff', '#2f9a55', '#e8334a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#7a4a2c'], [1, '#3f2212']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
