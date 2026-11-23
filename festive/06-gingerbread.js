'use strict';
// 6 ─ GINGERBREAD MAN (a chubby iced gingerbread man)
FESTIVE_TIERS[6] = {
  key: 'gingerbread', name: 'Gingerbread Man', plural: 'Gingerbread men', r: 50, k: 1.2984, outline: '#5f2f10',
  // four convex parts (units of r): head; arms + tummy (one part: two hand discs and a tummy disc); two legs (hip disc → foot disc)
  head: [0, -0.55, 0.41], hand: [0.58, -0.11, 0.2], tummy: [0, 0, 0.28], hip: [0.165, 0.3, 0.226], foot: [0.34, 0.69, 0.22],
  shape(r) {
    const [hx, hy, hr] = this.head, [ax, ay, ar] = this.hand, [tx, ty, tr] = this.tummy, [px, py, pr] = this.hip, [fx, fy, fr] = this.foot;
    const C = (x, y, d, n = 32) => ptsCircle(d * r, n, x * r, y * r);
    return [C(hx, hy, hr, 48), [...C(-ax, ay, ar), ...C(ax, ay, ar), ...C(tx, ty, tr, 40)], [...C(-px, py, pr), ...C(-fx, fy, fr)], [...C(px, py, pr), ...C(fx, fy, fr)]];
  },
  face: { x: 0, y: -0.54, s: 0.41 },
  crumbs: ['#c98646', '#8c4a1e', '#ffffff', '#e8334a', '#3fae5a'],
  noShade: true,   // the engine's inner shadow would darken the overlaps of the parts; paint() shades along the true outline instead
  // the outer contour of the union of the parts, as one closed loop (so overlaps never show seams)
  union(r) {
    if (this._u && this._u.r === r) return this._u;
    const hulls = this.shape(r).map(convexHull);
    const inside = (h, x, y, eps) => {
      for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; if (((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x)) / L < eps) return false; }
      return true;
    };
    const runs = [];
    hulls.forEach((h, i) => {
      const P = resample(h, Math.max(32, Math.round(perimeter(h) / (0.012 * r)))), n = P.length;
      const out = P.map(p => !hulls.some((g, j) => j !== i && inside(g, p.x, p.y, 0.002 * r)));
      if (out.every(Boolean)) { runs.push(P); return; }
      for (let k = 0; k < n; k++) if (out[k] && !out[(k + n - 1) % n]) { const run = []; for (let m = k; out[m % n] && run.length < n; m++) run.push(P[m % n]); runs.push(run); }
    });
    const loop = [], used = new Set();
    for (let cur = 0; cur >= 0 && !used.has(cur);) {
      used.add(cur); loop.push(...runs[cur]);
      const e = runs[cur][runs[cur].length - 1]; let best = -1, bd = 1e9;
      runs.forEach((ru, k) => { if (k === cur) return; const d = Math.hypot(ru[0].x - e.x, ru[0].y - e.y); if (d < bd) { bd = d; best = k; } });
      cur = best;
    }
    return (this._u = { r, hulls, loop, path: pathFromPts(new Path2D(), loop), inside: (x, y, eps = 0) => hulls.some(h => inside(h, x, y, eps)) });
  },
  paint(c, r, R, T, pr = 1) {
    const U = this.union(r), P = (x, y) => ({ x: x * r, y: y * r });
    // ── biscuit ──
    c.fillStyle = lg(c, 0, -r, 0, r, [[0, '#dc9a55'], [0.5, '#c67d3d'], [1, '#a9612a']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // baked, darker rim: soft bands along the true outline
    c.lineJoin = 'round';
    for (const [w, a] of [[0.42, 0.07], [0.3, 0.08], [0.2, 0.1], [0.12, 0.12]]) { c.lineWidth = w * r; c.strokeStyle = `rgba(120,55,15,${a})`; c.stroke(U.path); }
    // puffy highlights on every limb
    const glow = (x, y, rx, ry, rot, a) => { c.save(); c.translate(x * r, y * r); c.rotate(rot); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(255,214,150,${a})`], [1, 'rgba(255,214,150,0)']]); c.fillRect(-rx * r, -rx * r, 2 * rx * r, 2 * rx * r); c.restore(); };
    glow(-0.1, -0.67, 0.31, 0.23, -0.4, 0.55);
    glow(-0.4, -0.19, 0.3, 0.12, -0.05, 0.45); glow(0.4, -0.19, 0.3, 0.12, 0.05, 0.4);
    glow(-0.25, 0.5, 0.22, 0.1, 1.15, 0.35); glow(0.23, 0.5, 0.22, 0.1, -1.15, 0.3);
    glow(-0.06, 0.06, 0.22, 0.18, 0, 0.3);
    // baked texture
    const inU = R => { for (let k = 0; k < 20; k++) { const x = (R() * 2 - 1) * 0.85 * r, y = lerp(-0.96, 0.95, R()) * r; if (U.inside(x, y, 0.05 * r)) return { x, y }; } return null; };
    speckle(c, R, 70, inU, R => `rgba(110,48,12,${0.12 + R() * 0.18})`, r * 0.008, r * 0.02);
    speckle(c, R, 30, inU, R => `rgba(255,226,170,${0.15 + R() * 0.2})`, r * 0.008, r * 0.016);
    // ── icing squiggles at wrists and ankles ──
    const squiggle = (cx, cy, ang, half, amp, waves) => {
      const pts = [], n = waves * 2;
      for (let i = 0; i <= n; i++) { const t = lerp(-half, half, i / n), o = (i % 2 ? amp : -amp); pts.push({ x: (cx + Math.cos(ang) * t + Math.cos(ang + Math.PI / 2) * o) * r, y: (cy + Math.sin(ang) * t + Math.sin(ang + Math.PI / 2) * o) * r }); }
      const line = spline(pts, 8);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(0.014 * r, 0.024 * r); c.strokeStyle = 'rgba(90,35,8,0.38)'; c.lineWidth = 0.085 * r; strokePts(c, line); c.restore();
      c.strokeStyle = '#fffaf2'; c.lineWidth = 0.068 * r; strokePts(c, line);
      c.strokeStyle = 'rgba(205,190,175,0.7)'; c.lineWidth = 0.022 * r; c.save(); c.translate(0.012 * r, 0.016 * r); strokePts(c, line); c.restore();
      c.strokeStyle = 'rgba(255,255,255,1)'; c.lineWidth = 0.022 * r; c.save(); c.translate(-0.01 * r, -0.014 * r); strokePts(c, line); c.restore();
    };
    for (const s of [-1, 1]) {
      squiggle(s * 0.44, -0.09, Math.PI / 2 + s * 0.12, 0.17, 0.045, 3);
      squiggle(s * 0.29, 0.575, s * -0.42, 0.15, 0.042, 3);
    }
    // ── gumdrop buttons ──
    const gumdrop = (x, y, s, col, dark, light) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.014 * r, y + 0.03 * r, s * 1.04); c.fillStyle = 'rgba(80,30,5,0.42)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, light], [0.5, col], [1, dark]]); c.fill();
      c.strokeStyle = dark; c.lineWidth = 0.024 * r; c.stroke();
      speckle(c, R, 7, R => { const a = R() * TAU, d = Math.sqrt(R()) * s * 0.75; return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }; }, 'rgba(255,255,255,0.55)', 0.008 * r, 0.013 * r);
      ell(c, x - s * 0.36, y - s * 0.38, s * 0.3, s * 0.2, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    };
    gumdrop(0, 0.07, 0.082, '#36b15a', '#165f2c', '#b4f5c0');
    gumdrop(0, 0.29, 0.082, '#e8334a', '#8e0f22', '#ffb0b8');
    // ── bow tie ──
    {
      const x = 0, y = -0.15 * r, w = 0.19 * r, h = 0.11 * r;
      c.fillStyle = 'rgba(80,30,5,0.35)';
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + 0.012 * r, y + 0.025 * r); c.quadraticCurveTo(x + s * w * 0.5, y - h * 1.1 + 0.025 * r, x + s * w + 0.012 * r, y - h * 0.8 + 0.025 * r); c.quadraticCurveTo(x + s * w * 1.12, y + 0.025 * r, x + s * w + 0.012 * r, y + h * 0.8 + 0.025 * r); c.quadraticCurveTo(x + s * w * 0.5, y + h * 1.1 + 0.025 * r, x + 0.012 * r, y + 0.025 * r); c.fill(); }
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * w * 0.5, y - h * 1.1, x + s * w, y - h * 0.8); c.quadraticCurveTo(x + s * w * 1.12, y, x + s * w, y + h * 0.8); c.quadraticCurveTo(x + s * w * 0.5, y + h * 1.1, x, y); c.closePath();
        c.fillStyle = lg(c, x, y - h, x, y + h, [[0, '#ff6b7c'], [0.5, '#e02a40'], [1, '#a8132a']]); c.fill();
        c.strokeStyle = '#7d0a1c'; c.lineWidth = 0.022 * r; c.stroke();
        circ(c, x + s * w * 0.55, y - h * 0.15, 0.022 * r); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
        circ(c, x + s * w * 0.75, y + h * 0.4, 0.017 * r); c.fill();
      }
      ell(c, x, y, 0.05 * r, 0.06 * r); c.fillStyle = '#c71d34'; c.fill(); c.strokeStyle = '#7d0a1c'; c.lineWidth = 0.022 * r; c.stroke();
      ell(c, x - 0.015 * r, y - 0.02 * r, 0.018 * r, 0.014 * r); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
    }
    // ── volume (instead of the engine's shading, which would show the part overlaps) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(U.path);
    c.shadowColor = 'rgba(60,22,0,0.38)'; c.shadowBlur = r * 0.32 * pr; c.shadowOffsetX = -r * 0.09 * pr; c.shadowOffsetY = -r * 0.14 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    const C = this.C || { x: 0, y: 0 };
    c.fillStyle = rg(c, C.x - 0.4 * r, C.y - 0.5 * r, 0, C.x - 0.2 * r, C.y - 0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    // light rim just inside the contour, on the lit (top-left) side
    // (kept faint: a strong light rim reads as a cream icing outline at icon size)
    c.save(); c.translate(0.014 * r, 0.02 * r); c.strokeStyle = 'rgba(255,226,175,0.32)'; c.lineWidth = (this.ow || 0.075 * r) * 2 + 0.02 * r; c.stroke(U.path); c.restore();
  },
  outlineFn(c, path, r, ow) { c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(this.union(r).path); },
};
