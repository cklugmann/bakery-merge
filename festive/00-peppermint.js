'use strict';
// 0 ─ PEPPERMINT (round peppermint swirl candy — same collision shape as the classic Cookie)
FESTIVE_TIERS[0] = {
  key: 'peppermint', name: 'Peppermint', r: 14, outline: '#7a1424',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.02, s: 0.8 },
  crumbs: ['#e8334a', '#ffffff', '#ffd5db', '#b3122b'],
  // swirl: N curved red wedges between a calm white hub and a thin white candy rim (units of r).
  // 6 wedges, phased so both eyes sit in white gaps; the wedges stop short of the contour and a
  // light ring separates them from it, so the silhouette stays a clean circle at 1×.
  N: 6, hub: 0.38, rim: 0.85, twist: 1.25, spin: 0.145, fill: 0.52, ring: [0.88, 0.05, 0.7],
  wedge(r, i, grow = 0) {
    const { N, hub, rim, twist, spin, fill } = this, per = TAU / N, L = [], Rt = [], R1 = rim + grow * 0.5;
    for (let k = 0; k <= 36; k++) {
      const rho = lerp(hub, R1, k / 36), f = clamp((rho - hub) / (rim - 0.08 - hub), 0, 1);
      const hw = per * fill * 0.5 * Math.pow(f, 0.55) + grow, th = spin + i * per + twist * rho;
      L.push({ x: Math.cos(th - hw) * rho * r, y: Math.sin(th - hw) * rho * r });
      Rt.push({ x: Math.cos(th + hw) * rho * r, y: Math.sin(th + hw) * rho * r });
    }
    const p = new Path2D();
    p.moveTo(L[0].x, L[0].y);
    for (const q of L) p.lineTo(q.x, q.y);
    const a0 = Math.atan2(L[36].y, L[36].x), a1 = Math.atan2(Rt[36].y, Rt[36].x);
    p.arc(0, 0, R1 * r, a0, a1 < a0 ? a1 + TAU : a1);
    for (let k = Rt.length - 1; k >= 0; k--) p.lineTo(Rt[k].x, Rt[k].y);
    p.closePath();
    return p;
  },
  paint(c, r, R) {
    // white hard candy, milky towards the rim
    c.fillStyle = rg(c, -0.2 * r, -0.25 * r, 0, 0, 0, r, [[0, '#ffffff'], [0.55, '#fdf7f7'], [0.85, '#f4e6e9'], [1, '#e2c9ce']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // faint pink glow of the stripes seen through the milky candy
    for (let i = 0; i < this.N; i++) { c.fillStyle = 'rgba(240,80,100,0.12)'; c.fill(this.wedge(r, i, 0.07)); }
    // red swirl wedges: body, a light line on the lit edge, a dark line around
    for (let i = 0; i < this.N; i++) {
      const p = this.wedge(r, i);
      c.fillStyle = rg(c, 0, 0, this.hub * r, 0, 0, this.rim * r, [[0, '#ff5d70'], [0.5, '#e8223f'], [1, '#c0142f']]);
      c.fill(p);
      c.save(); c.clip(p); c.translate(0.035 * r, 0.045 * r);
      c.strokeStyle = 'rgba(255,175,188,0.45)'; c.lineWidth = 0.045 * r; c.stroke(p);
      c.restore();
      c.strokeStyle = 'rgba(140,10,30,0.45)'; c.lineWidth = 0.04 * r; c.stroke(p);
    }
    // light line of the candy edge, just inside the contour
    const [rr, rw, ra] = this.ring; c.strokeStyle = `rgba(255,248,250,${ra})`; c.lineWidth = rw * r; circ(c, 0, 0, rr * r); c.stroke();
    // gloss of hard candy: a crisp crescent across the stripes, top-left
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.09 * r;
    c.beginPath(); c.arc(0, 0, 0.66 * r, 3.5, 4.35); c.stroke();
    c.lineWidth = 0.065 * r; c.beginPath(); c.arc(0, 0, 0.66 * r, 4.55, 4.7); c.stroke();
  },
};
