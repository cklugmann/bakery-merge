'use strict';
// 2 ─ SNOWFLAKE COOKIE (round iced cookie with a piped snowflake — same collision shape as the classic Donut)
FESTIVE_TIERS[2] = {
  key: 'snowflake', name: 'Snowflake Cookie', r: 24, outline: '#8a5523',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.57, s: 0.46 },
  crumbs: ['#bfe4fb', '#ffffff', '#e8c48a', '#6db7e8'],
  ice: 0.79,          // icing radius (units of r)
  fy: -0.13,          // snowflake centre (it sits high; the face lives below it)
  arm: 0.6,           // snowflake arm length
  rot: 0,             // arm angle offset (0 = horizontal arms, so the bottom gap opens towards the face)
  // the snowflake as a list of polylines (units of r)
  flake() {
    const lines = [], A = this.arm, cy = this.fy;
    for (let k = 0; k < 6; k++) {
      const a = this.rot + (k * TAU) / 6, ux = Math.cos(a), uy = Math.sin(a);
      lines.push({ pts: [[0, cy], [ux * A, cy + uy * A]], w: 1 });
      for (const [t, L] of [[0.46, 0.22], [0.72, 0.13]]) {
        const px = ux * A * t, py = cy + uy * A * t;
        for (const s of [-1, 1]) { const b = a + s * 0.95; lines.push({ pts: [[px + Math.cos(b) * L, py + Math.sin(b) * L], [px, py]], w: 0.8 }); }
      }
    }
    return lines;
  },
  paint(c, r, R) {
    // golden-brown biscuit
    c.fillStyle = rg(c, -0.25 * r, -0.3 * r, 0, 0, 0, r, [[0, '#f6d79c'], [0.6, '#e8b56e'], [0.88, '#d4954c'], [1, '#b8763a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 40, inDisc(0.95 * r), R => `rgba(140,78,28,${0.15 + R() * 0.2})`, r * 0.012, r * 0.025);
    c.strokeStyle = 'rgba(255,236,196,0.55)'; c.lineWidth = 0.04 * r; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, 0.87 * r, 3.3, 4.75); c.stroke();
    // icing edge path (slightly organic)
    const ice = new Path2D();
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * TAU, g = (this.ice + 0.008 * Math.sin(5 * a + 1) + 0.005 * Math.sin(9 * a)) * r;
      i ? ice.lineTo(Math.cos(a) * g, Math.sin(a) * g) : ice.moveTo(Math.cos(a) * g, Math.sin(a) * g);
    }
    ice.closePath();
    // shadow the icing casts on the biscuit
    c.save(); c.translate(0.02 * r, 0.04 * r); c.fillStyle = 'rgba(110,60,15,0.45)'; c.fill(ice); c.restore();
    c.fillStyle = rg(c, -0.25 * r, -0.3 * r, 0, 0, 0, this.ice * r, [[0, '#c6eafd'], [0.55, '#86c9f1'], [1, '#4f9fd8']]);
    c.fill(ice);
    c.save(); c.clip(ice);
    // piped border bead just inside the edge, lit top-left
    c.strokeStyle = 'rgba(160,215,248,0.7)'; c.lineWidth = 0.06 * r; circ(c, 0, 0, (this.ice - 0.035) * r); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.045 * r; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, (this.ice - 0.045) * r, 3.4, 4.6); c.stroke();
    // a few sugar sparkles on the icing
    const fx = this.face.x * r, fy = this.face.y * r;
    speckle(c, R, 22, R => { const p = inDisc(0.72 * r)(R); return Math.hypot((p.x - fx) / 1.6, p.y - fy) < 0.28 * r ? null : p; }, 'rgba(255,255,255,0.7)', 0.012 * r, 0.022 * r);
    c.restore();
    c.strokeStyle = 'rgba(40,105,160,0.6)'; c.lineWidth = 0.035 * r; c.stroke(ice);
    // piped snowflake: shadow, body, highlight
    const lines = this.flake(), W = 0.12 * r;
    const run = (dx, dy, wk, col) => {
      c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      for (const l of lines) { c.lineWidth = W * l.w * wk; c.beginPath(); l.pts.forEach(([x, y], i) => (i ? c.lineTo(x * r + dx, y * r + dy) : c.moveTo(x * r + dx, y * r + dy))); c.stroke(); }
    };
    run(0.025 * r, 0.04 * r, 1.15, 'rgba(25,80,135,0.55)');
    run(0, 0, 1, '#eaf5fc');
    run(-0.012 * r, -0.016 * r, 0.55, '#ffffff');
    // centre and tip dots
    const dot = (x, y, s) => {
      circ(c, x + 0.025 * r, y + 0.04 * r, s * 1.08); c.fillStyle = 'rgba(25,80,135,0.55)'; c.fill();
      circ(c, x, y, s); c.fillStyle = '#eaf5fc'; c.fill();
      circ(c, x - s * 0.25, y - s * 0.3, s * 0.5); c.fillStyle = '#ffffff'; c.fill();
    };
    dot(0, this.fy * r, 0.13 * r);
    for (let k = 0; k < 6; k++) { const a = this.rot + (k * TAU) / 6; dot(Math.cos(a) * this.arm * r, (this.fy + Math.sin(a) * this.arm) * r, 0.085 * r); }
  },
};
