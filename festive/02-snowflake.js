'use strict';
// 2 ─ SNOWFLAKE COOKIE (round iced cookie with a piped snowflake — same collision shape as the classic Donut)
FESTIVE_TIERS[2] = {
  key: 'snowflake', name: 'Snowflake Cookie', r: 24, outline: '#2f6f9e',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.5, s: 0.5 },
  crumbs: ['#bfe4fb', '#ffffff', '#e8c48a', '#6db7e8'],
  paint(c, r, R) {
    // PLACEHOLDER — flat colour until the tier is painted
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#d8f0ff'], [1, '#6db7e8']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
  },
};
