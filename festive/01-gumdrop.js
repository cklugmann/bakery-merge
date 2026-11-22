'use strict';
// 1 ─ GUMDROP (sugared gumdrop dome)
FESTIVE_TIERS[1] = {
  key: 'gumdrop', name: 'Gumdrop', r: 19, outline: '#7a2a8c',
  // dome: round top, soft flat base (units of r)
  top: r => x => -1.06 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / (0.95 * r)), 2.3)), 1 / 2.3),
  bot: r => x => 0.44 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / (0.95 * r)), 4)), 1 / 4),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r), a = 0.95 * r;
    for (let i = 0; i <= 80; i++) { const x = lerp(-1, 1, i / 80) * a; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0, y: -0.2, s: 0.62 },
  crumbs: ['#d9a0ee', '#a44fc0', '#ffffff', '#f6e4ff'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#e9b6f5'], [1, '#a44fc0']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
