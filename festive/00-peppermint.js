'use strict';
// 0 ─ PEPPERMINT (round peppermint swirl candy — same collision shape as the classic Cookie)
FESTIVE_TIERS[0] = {
  key: 'peppermint', name: 'Peppermint', r: 14, outline: '#a3182c',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.02, s: 0.8 },
  crumbs: ['#e8334a', '#ffffff', '#ffd5db', '#b3122b'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#ffffff'], [1, '#e8334a']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
