'use strict';
// 5 ─ MINCE PIE (mince pie seen from above, star lid — same collision shape as the classic Cinnamon Roll)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#8a4f22',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.5, s: 0.4 },
  crumbs: ['#e8b06c', '#f6d29b', '#ffffff', '#7a2b1a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#f6d79a'], [1, '#d49a4e']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
