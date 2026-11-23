'use strict';
// 6 ─ CHOCOLATE SANTA (a foil-wrapped chocolate Santa; one soft convex bell shape)
FESTIVE_TIERS[6] = {
  key: 'santa', name: 'Chocolate Santa', r: 50, outline: '#7a1424',
  // bell / egg: [x, y, radius] discs whose convex hull is the figure (units of r)
  discs: [[0, -0.727, 0.353], [-0.507, 0.551, 0.485], [0.507, 0.551, 0.485]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 48, x * r, y * r)); return [pts]; },
  face: { x: 0, y: -0.08, s: 0.36 },
  crumbs: ['#d8323f', '#ffffff', '#5c311c', '#ffd84a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#e8545c'], [1, '#b3202e']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
