'use strict';
// 9 ─ YULE LOG (chocolate bûche de Noël lying on its side — same collision shape as the classic Black Forest)
FESTIVE_TIERS[9] = {
  key: 'yulelog', name: 'Yule Log', r: 72, outline: '#2a140a',
  shape: r => [ptsSuper(r, 0.6 * r, 3.2)],
  face: { x: 0.36, y: 0.2, s: 0.32, eye: 'light' },
  crumbs: ['#5c311c', '#ffffff', '#2f9a55', '#e8334a', '#f6e6c8'],
  // the cut end of the roll, seen a little from the left (ellipse, units of r)
  cut: { x: -0.62, y: 0.03, rx: 0.36, ry: 0.53 },
  paint(c, r, R) {
    const b = 0.6 * r, n = 3.2;
    const edge = x => b * Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(x / r)), n)), 1 / n);
    const K = this.cut, ex = K.x * r, ey = K.y * r, erx = K.rx * r, ery = K.ry * r;
    const fx = this.face.x * r, fy = this.face.y * r;
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── chocolate bark: a cylinder lying on its side ──
    c.fillStyle = lg(c, 0, -b, 0, b, [[0, '#a2633b'], [0.28, '#84492a'], [0.6, '#5f321b'], [1, '#2f170b']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, 0.5 * r, 0, r, 0, [[0, 'rgba(30,12,4,0)'], [1, 'rgba(30,12,4,0.5)']]);
    c.fillRect(0.5 * r, -2 * r, 2 * r, 4 * r);
    // soft sheen along the upper flank
    c.fillStyle = lg(c, 0, -0.35 * b, 0, 0.15 * b, [[0, 'rgba(255,200,150,0)'], [0.5, 'rgba(255,200,150,0.16)'], [1, 'rgba(255,200,150,0)']]);
    c.fillRect(-r, -0.35 * b, 2 * r, 0.5 * b);
    speckle(c, R, 70, R => ({ x: lerp(-0.4, 1, R()) * r, y: lerp(-0.6, 0.95, R()) * b }), R => `rgba(25,10,3,${0.12 + R() * 0.18})`, r * 0.006, r * 0.014);

    // fork-drawn grooves along the length: bundles of three tines, a dark furrow with a light ridge above it
    const rimX = y => { const t = (y - ey) / ery; return Math.abs(t) >= 1 ? ex : ex + erx * Math.sqrt(1 - t * t); };
    const calm = (x, y) => Math.hypot((x - fx) / (0.3 * r), (y - fy) / (0.17 * r)) > 1;
    const NB = 7;
    for (let i = 0; i < NB; i++) {
      const th = lerp(-1.05, 1.3, (i + 0.15 + R() * 0.7) / NB), yc = Math.sin(th) * b * 0.93;
      const ph = R() * TAU, amp = lerp(0.022, 0.04, R()) * r * Math.max(0.4, Math.cos(th)), fq = lerp(3, 5, R()) / r, ph2 = R() * TAU;
      const spread = 0.034 * r * Math.max(0.35, Math.cos(th));
      for (let tine = 0; tine < 3; tine++) {
        const yo = (tine - 1) * spread;
        const x0 = rimX(yc + yo) + lerp(0.03, 0.12, R()) * r, x1 = lerp(0.85, 1.1, R()) * r;
        const runs = [[]];
        for (let x = x0; x <= x1; x += 0.025 * r) {
          const y = yc + yo + Math.sin(x * fq + ph) * amp + Math.sin(x * fq * 2.3 + ph2) * amp * 0.35;
          if (calm(x, y)) runs[runs.length - 1].push({ x, y }); else if (runs[runs.length - 1].length) runs.push([]);
        }
        for (const p of runs) {
          if (p.length < 3) continue;
          c.strokeStyle = 'rgba(28,11,3,0.62)'; c.lineWidth = 0.026 * r; strokePts(c, p);
          c.save(); c.translate(0, -0.018 * r); c.strokeStyle = 'rgba(196,128,84,0.5)'; c.lineWidth = 0.014 * r; strokePts(c, p); c.restore();
        }
      }
    }

    // ── icing-sugar snow on top ──
    // a soft wavy blanket with a few rounded drips (centre, half-width, length — units of r)
    const drips = [[-0.29, 0.055, 0.13], [0.27, 0.048, 0.08], [0.56, 0.058, 0.15], [0.86, 0.048, 0.07]];
    const snowY = x => {
      const u = x / r;
      let y = -edge(x) + (0.5 + 0.07 * Math.sin(u * 5.5 + 0.8) + 0.03 * Math.sin(u * 13 + 2) + 0.012 * Math.sin(u * 31 + 1)) * b;
      for (const [cx, w, L] of drips) y += L * r / (1 + Math.pow((u - cx) / w, 4));
      return y;
    };
    // the lower edge, traced right → left; `connect` continues the current path instead of starting a new one
    const snowEdge = (dy, connect) => {
      for (let x = 1.2 * r, first = !connect; x >= -1.2 * r; x -= 0.006 * r, first = false) {
        if (first) c.moveTo(x, snowY(x) + dy); else c.lineTo(x, snowY(x) + dy);
      }
    };
    const snowPath = () => { c.beginPath(); c.moveTo(-1.2 * r, -1.3 * b); c.lineTo(1.2 * r, -1.3 * b); snowEdge(0, true); c.closePath(); };
    c.save(); c.translate(0, 0.02 * r); c.strokeStyle = 'rgba(20,8,2,0.45)'; c.lineWidth = 0.04 * r; c.beginPath(); snowEdge(0); c.stroke(); c.restore();
    snowPath(); c.fillStyle = lg(c, 0, -b, 0, -0.35 * b, [[0, '#ffffff'], [0.6, '#fbfbff'], [1, '#e6eaf6']]); c.fill();
    c.save(); snowPath(); c.clip();
    c.strokeStyle = 'rgba(150,160,200,0.5)'; c.lineWidth = 0.05 * r; c.beginPath(); snowEdge(0); c.stroke();
    c.restore();
    // dusting that thins out down the flank
    speckle(c, R, 70, R => { const x = lerp(-0.25, 1, R()) * r; return { x, y: snowY(x) + 0.03 * r + Math.pow(R(), 2.4) * 0.45 * b }; }, R => `rgba(255,255,255,${0.25 + R() * 0.45})`, r * 0.004, r * 0.009);

    // ── the cut end: chocolate sponge rolled up with cream ──
    ell(c, ex, ey, erx, ery); c.fillStyle = '#2c1408'; c.fill();
    ell(c, ex + 0.012 * r, ey, erx - 0.02 * r, ery - 0.02 * r); c.fillStyle = lg(c, 0, ey - ery, 0, ey + ery, [[0, '#6e3d22'], [1, '#3a1c0d']]); c.fill();
    const irx = erx - 0.06 * r, iry = ery - 0.06 * r, ix = ex + 0.02 * r;
    c.save();
    ell(c, ix, ey, irx, iry); c.clip();
    c.fillStyle = rg(c, ix - 0.08 * r, ey - 0.15 * r, 0, ix, ey, iry, [[0, '#a5694a'], [0.6, '#85502f'], [1, '#5f3520']]);
    c.fillRect(ix - irx, ey - iry, 2 * irx, 2 * iry);
    speckle(c, R, 60, R => { const a = R() * TAU, d = Math.sqrt(R()); return { x: ix + Math.cos(a) * d * irx, y: ey + Math.sin(a) * d * iry }; }, R => `rgba(50,22,8,${0.25 + R() * 0.25})`, r * 0.006, r * 0.013);
    const turns = 2.2, th0 = 0.5, thMax = turns * TAU, kk = 0.94 / thMax;
    const spiral = (off, from = th0) => { const p = []; for (let th = from; th <= thMax; th += 0.06) { const rr = kk * th + off; p.push({ x: ix + Math.cos(th) * rr * irx, y: ey + Math.sin(th) * rr * iry }); } return p; };
    c.save(); c.translate(0.008 * r, 0.016 * r); c.strokeStyle = 'rgba(40,15,4,0.5)'; c.lineWidth = 0.085 * r; strokePts(c, spiral(0)); c.restore();
    c.strokeStyle = '#f7ead3'; c.lineWidth = 0.075 * r; strokePts(c, spiral(0));
    c.save(); c.translate(-0.01 * r, -0.014 * r); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.025 * r; strokePts(c, spiral(0, th0 + 0.4)); c.restore();
    circ(c, ix + Math.cos(th0) * kk * th0 * irx, ey + Math.sin(th0) * kk * th0 * iry, 0.045 * r); c.fillStyle = '#f7ead3'; c.fill();
    // inner shadow at the rim of the cut
    c.lineWidth = 0.05 * r; c.strokeStyle = 'rgba(30,10,2,0.45)'; ell(c, ix, ey, irx, iry); c.stroke();
    c.restore();
    c.lineWidth = 0.014 * r; c.strokeStyle = 'rgba(210,150,105,0.6)'; c.beginPath(); c.ellipse(ex, ey, erx - 0.012 * r, ery - 0.012 * r, 0, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
    // a little sugar caught on the top of the cut
    c.save(); ell(c, ex, ey, erx + 0.01 * r, ery + 0.01 * r); c.clip();
    c.beginPath(); c.moveTo(ex - erx, ey - ery - 0.1 * r);
    for (let x = -1; x <= 1.0001; x += 0.05) c.lineTo(ex + x * erx, ey - ery + (0.05 + 0.025 * Math.sin(x * 9)) * r * (1 - x * x * 0.6));
    c.lineTo(ex + erx, ey - ery - 0.1 * r); c.closePath(); c.fillStyle = '#fbfcff'; c.fill();
    c.restore();

    // ── holly sprig on the snow ──
    this.holly(c, r, 0.06 * r, -0.36 * r);
  },
  holly(c, r, hx, hy) {
    const leaf = (ang, L, W) => {
      c.save(); c.translate(hx, hy); c.rotate(ang);
      const k = 3, w = t => W * Math.pow(Math.sin(Math.PI * t), 0.75);
      c.beginPath(); c.moveTo(0, 0);
      for (let i = 1; i <= k + 1; i++) { const t0 = (i - 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(L * tm, -w(tm) * 0.55, L * t1, i <= k ? -w(t1) : 0); }
      for (let i = k; i >= 0; i--) { const t0 = (i + 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(L * tm, w(tm) * 0.55, L * t1, i > 0 ? w(t1) : 0); }
      c.closePath();
      c.save(); c.translate(0.012 * r, 0.02 * r); c.fillStyle = 'rgba(30,20,10,0.35)'; c.fill(); c.restore();
      c.fillStyle = lg(c, 0, -W, 0, W, [[0, '#4fc06a'], [0.5, '#25873f'], [1, '#145a28']]); c.fill();
      c.strokeStyle = '#0e3d1b'; c.lineWidth = 0.018 * r; c.stroke();
      c.strokeStyle = 'rgba(200,255,200,0.75)'; c.lineWidth = 0.014 * r; c.beginPath(); c.moveTo(L * 0.08, 0); c.quadraticCurveTo(L * 0.5, -W * 0.08, L * 0.9, 0); c.stroke();
      c.restore();
    };
    leaf(Math.PI + 0.35, 0.36 * r, 0.12 * r);
    leaf(-0.3, 0.36 * r, 0.12 * r);
    for (const [dx, dy] of [[-0.05, 0.01], [0.05, 0.015], [0, -0.06]]) {
      const x = hx + dx * r, y = hy + dy * r, s = 0.058 * r;
      circ(c, x + 0.008 * r, y + 0.012 * r, s); c.fillStyle = 'rgba(40,0,5,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, '#ff7a7a'], [0.55, '#dc1f36'], [1, '#86061a']]); c.fill();
      c.strokeStyle = '#5a0410'; c.lineWidth = 0.014 * r; c.stroke();
      circ(c, x - s * 0.35, y - s * 0.38, s * 0.28); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    }
  },
};
