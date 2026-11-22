'use strict';
// 4 ─ GINGERBREAD MAN (gingerbread man)
FESTIVE_TIERS[4] = {
  key: 'gingerbread', name: 'Gingerbread Man', plural: 'Gingerbread men', r: 39, outline: '#6e3a14',
  // four convex parts (units of r): head, arm bar, two legs — a chubby compound body like the classic Pretzel / Wedding Cake
  head: [0, -0.605, 0.355], arms: [0.667, -0.107, 0.185], legs: [[0.151, 0.127], [0.365, 0.77], 0.214],
  shape(r) {
    const [hx, hy, hr] = this.head, [ax, ay, ar] = this.arms, [[lx0, ly0], [lx1, ly1], lr] = this.legs;
    const stadium = (x0, y0, x1, y1, rad) => [...ptsCircle(rad * r, 32, x0 * r, y0 * r), ...ptsCircle(rad * r, 32, x1 * r, y1 * r)];
    return [ptsCircle(hr * r, 48, hx * r, hy * r), stadium(-ax, ay, ax, ay, ar), stadium(-lx0, ly0, -lx1, ly1, lr), stadium(lx0, ly0, lx1, ly1, lr)];
  },
  face: { x: 0, y: -0.6, s: 0.36 },
  crumbs: ['#c98646', '#a8642c', '#ffffff', '#e8334a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#d99a5a'], [1, '#a8642c']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
