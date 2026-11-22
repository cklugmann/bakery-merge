'use strict';
// 8 ─ STOLLEN (powdered-sugar Stollen loaf — same collision shape as the classic Bread)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#8a5a2c',
  top: r => x => -0.66 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.2)), 1 / 2.2),
  bot: r => x => 0.5 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.5)), 1 / 2.5),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r);
    for (let i = 0; i <= 120; i++) { const x = lerp(-1, 1, i / 120) * r; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0, y: 0.17, s: 0.36 },
  crumbs: ['#ffffff', '#f7deb0', '#c98646', '#e8334a'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#fffaf0'], [1, '#e0c9a0']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
