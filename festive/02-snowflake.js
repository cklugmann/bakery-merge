'use strict';
// 2 ─ SNOWFLAKE COOKIE (round iced cookie with a piped snowflake — same collision shape as the classic Donut)
FESTIVE_TIERS[2] = {
  key: 'snowflake', name: 'Snowflake Cookie', r: 24, outline: '#7c461b',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.6, s: 0.46 },
  crumbs: ['#bfe4fb', '#ffffff', '#e8c48a', '#6db7e8'],
  ice: 0.77,          // mean icing radius (units of r); the edge wobbles softly around it
  fy: -0.16,          // snowflake centre (it sits high; the face lives below it, in the gap of the lower arms)
  arm: 0.56,          // snowflake arm length
  rot: 0,             // arm angle offset (0 = horizontal arms, so the bottom gap opens towards the face)
  vee: [0.6, 0.2, 0.82],     // one bold V of branches per arm: position along the arm, length, angle to the arm
  aw: 0.15, bw: 0.125,       // arm / branch line width (bold, so the flake survives a 35 px icon at 1×)
  tip: 0,                    // tip dot radius (0 = plain round ends; dots blur the arms at small sizes)
  iceR(a) { return this.ice + 0.02 * Math.sin(3 * a + 0.5) + 0.013 * Math.sin(7 * a + 2) + 0.007 * Math.sin(12 * a + 1); },
  // the snowflake as a list of polylines (units of r)
  flake() {
    const lines = [], A = this.arm, cy = this.fy, [t, L, ang] = this.vee;
    for (let k = 0; k < 6; k++) {
      const a = this.rot + (k * TAU) / 6, ux = Math.cos(a), uy = Math.sin(a);
      lines.push({ pts: [[0, cy], [ux * A, cy + uy * A]], w: this.aw });
      const px = ux * A * t, py = cy + uy * A * t;
      for (const s of [-1, 1]) { const b = a + s * ang; lines.push({ pts: [[px + Math.cos(b) * L, py + Math.sin(b) * L], [px, py]], w: this.bw }); }
    }
    return lines;
  },
  paint(c, r, R) {
    // golden biscuit, browner towards the baked edge
    c.fillStyle = rg(c, -0.15 * r, -0.2 * r, 0, 0, 0, r, [[0, '#f3cf8e'], [0.6, '#e8b067'], [0.82, '#d48f45'], [1, '#a7632a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // uneven browning: darker and paler patches around the rim
    const onRim = (d0, d1) => R => { const a = R() * TAU, d = lerp(d0, d1, R()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d }; };
    for (let i = 0; i < 16; i++) {
      const p = onRim(0.8, 0.98)(R), s = lerp(0.09, 0.17, R()) * r, dark = R() < 0.6;
      blobPath(c, p.x, p.y, s, R, 7, 0.45);
      c.fillStyle = dark ? `rgba(145,72,20,${0.2 + R() * 0.2})` : `rgba(255,226,165,${0.25 + R() * 0.2})`; c.fill();
    }
    // the lit side of the dough (top-left) is paler, the far side toastier
    c.fillStyle = rg(c, -0.55 * r, -0.6 * r, 0, -0.55 * r, -0.6 * r, 0.7 * r, [[0, 'rgba(255,232,180,0.55)'], [1, 'rgba(255,232,180,0)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // crumb speckle, pores and a few sugar grains
    speckle(c, R, 55, onRim(0.74, 0.97), R => `rgba(105,52,14,${0.18 + R() * 0.3})`, 0.014 * r, 0.034 * r);
    speckle(c, R, 14, onRim(0.76, 0.95), 'rgba(255,242,215,0.6)', 0.012 * r, 0.022 * r);
    // icing: a soft, slightly irregular flood
    const ice = new Path2D();
    for (let i = 0; i <= 120; i++) { const a = (i / 120) * TAU, g = this.iceR(a) * r; i ? ice.lineTo(Math.cos(a) * g, Math.sin(a) * g) : ice.moveTo(Math.cos(a) * g, Math.sin(a) * g); }
    ice.closePath();
    c.save(); c.translate(0.02 * r, 0.045 * r); c.fillStyle = 'rgba(100,52,12,0.45)'; c.fill(ice); c.restore();   // its shadow on the biscuit
    c.fillStyle = rg(c, -0.25 * r, -0.3 * r, 0, 0, 0, this.ice * r, [[0, '#c6eafd'], [0.55, '#86c9f1'], [1, '#4f9fd8']]);
    c.fill(ice);
    c.save(); c.clip(ice);
    c.save(); c.translate(0.035 * r, 0.05 * r); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.06 * r; c.stroke(ice); c.restore();   // lit inner edge
    c.save(); c.translate(-0.03 * r, -0.04 * r); c.strokeStyle = 'rgba(30,90,150,0.25)'; c.lineWidth = 0.06 * r; c.stroke(ice); c.restore();   // shaded inner edge
    const fx = this.face.x * r, fy = this.face.y * r;
    speckle(c, R, 18, R => { const p = inDisc(0.7 * r)(R); return Math.hypot((p.x - fx) / 1.6, p.y - fy) < 0.3 * r ? null : p; }, 'rgba(255,255,255,0.7)', 0.012 * r, 0.022 * r);
    c.restore();
    c.strokeStyle = 'rgba(40,105,160,0.6)'; c.lineWidth = 0.035 * r; c.stroke(ice);
    // piped snowflake: shadow, body, highlight
    const lines = this.flake();
    const run = (dx, dy, wk, col) => {
      c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const l of lines) { c.lineWidth = l.w * r * wk; c.beginPath(); l.pts.forEach(([x, y], i) => (i ? c.lineTo(x * r + dx, y * r + dy) : c.moveTo(x * r + dx, y * r + dy))); c.stroke(); }
    };
    run(0.025 * r, 0.04 * r, 1.15, 'rgba(25,80,135,0.55)');
    run(0, 0, 1, '#eaf5fc');
    run(-0.012 * r, -0.016 * r, 0.5, '#ffffff');
    // centre and tip dots
    const dot = (x, y, s) => {
      circ(c, x + 0.025 * r, y + 0.04 * r, s * 1.08); c.fillStyle = 'rgba(25,80,135,0.55)'; c.fill();
      circ(c, x, y, s); c.fillStyle = '#eaf5fc'; c.fill();
      circ(c, x - s * 0.25, y - s * 0.3, s * 0.5); c.fillStyle = '#ffffff'; c.fill();
    };
    dot(0, this.fy * r, 0.12 * r);
    if (this.tip) for (let k = 0; k < 6; k++) { const a = this.rot + (k * TAU) / 6; dot(Math.cos(a) * this.arm * r, (this.fy + Math.sin(a) * this.arm) * r, this.tip * r); }
  },
};
