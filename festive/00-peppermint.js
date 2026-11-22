'use strict';
// 0 ─ PEPPERMINT (round peppermint swirl candy — same collision shape as the classic Cookie)
FESTIVE_TIERS[0] = {
  key: 'peppermint', name: 'Peppermint', r: 14, outline: '#a3182c',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.02, s: 0.8 },
  crumbs: ['#e8334a', '#ffffff', '#ffd5db', '#b3122b'],
  // swirl: N curved red wedges around a calm white hub (units of r)
  N: 7, hub: 0.44, twist: 1.25, spin: 0.25, fill: 0.52,
  wedge(r, i, grow = 0) {
    const { N, hub, twist, spin, fill } = this, per = TAU / N, L = [], Rt = [];
    for (let k = 0; k <= 36; k++) {
      const rho = lerp(hub, 1.1, k / 36), f = clamp((rho - hub) / (0.8 - hub), 0, 1);
      const hw = per * fill * 0.5 * Math.pow(f, 0.55) + grow, th = spin + i * per + twist * rho;
      L.push({ x: Math.cos(th - hw) * rho * r, y: Math.sin(th - hw) * rho * r });
      Rt.push({ x: Math.cos(th + hw) * rho * r, y: Math.sin(th + hw) * rho * r });
    }
    const p = new Path2D();
    p.moveTo(L[0].x, L[0].y);
    for (const q of L) p.lineTo(q.x, q.y);
    for (let k = Rt.length - 1; k >= 0; k--) p.lineTo(Rt[k].x, Rt[k].y);
    p.closePath();
    return p;
  },
  paint(c, r, R) {
    // white hard candy, milky towards the rim
    c.fillStyle = rg(c, -0.2 * r, -0.25 * r, 0, 0, 0, r, [[0, '#ffffff'], [0.5, '#fdf7f7'], [0.82, '#f2e2e5'], [1, '#dcbfc5']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // faint pink glow of the stripes seen through the milky candy
    for (let i = 0; i < this.N; i++) { c.fillStyle = 'rgba(240,80,100,0.12)'; c.fill(this.wedge(r, i, 0.09)); }
    // red swirl wedges: body, a light line on the lit edge, a dark line around
    for (let i = 0; i < this.N; i++) {
      const p = this.wedge(r, i);
      c.fillStyle = rg(c, 0, 0, this.hub * r, 0, 0, r, [[0, '#ff5d70'], [0.45, '#e8223f'], [1, '#b8112c']]);
      c.fill(p);
      c.save(); c.clip(p); c.translate(0.035 * r, 0.045 * r);
      c.strokeStyle = 'rgba(255,175,188,0.45)'; c.lineWidth = 0.045 * r; c.stroke(p);
      c.restore();
      c.strokeStyle = 'rgba(140,10,30,0.45)'; c.lineWidth = 0.04 * r; c.stroke(p);
    }
    // gloss of hard candy: a crisp crescent near the rim, a soft rim light opposite
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.1 * r;
    c.beginPath(); c.arc(0, 0, 0.78 * r, 3.45, 4.4); c.stroke();
    c.lineWidth = 0.07 * r; c.beginPath(); c.arc(0, 0, 0.78 * r, 4.58, 4.72); c.stroke();
    c.strokeStyle = 'rgba(255,225,230,0.4)'; c.lineWidth = 0.07 * r;
    c.beginPath(); c.arc(0, 0, 0.8 * r, 0.3, 1.2); c.stroke();
  },
};
