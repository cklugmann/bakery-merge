'use strict';
// 9 ─ YULE LOG (chocolate bûche de Noël lying on its side — same collision shape as the classic Black Forest)
FESTIVE_TIERS[9] = {
  key: 'yulelog', name: 'Yule Log', r: 72, outline: '#2a140a',
  shape: r => [ptsSuper(r, 0.6 * r, 3.2)],
  face: { x: 0.4, y: 0.2, s: 0.32, eye: 'light' },
  crumbs: ['#5c311c', '#ffffff', '#2f9a55', '#e8334a', '#fff1d8'],
  // the cut end of the roll, seen a little from the left (ellipse, units of r) — big, so the spiral survives 35 px
  cut: { x: -0.57, y: 0.03, rx: 0.42, ry: 0.53 },
  paint(c, r, R) {
    const b = 0.6 * r, n = 3.2;
    const edge = x => b * Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(x / r)), n)), 1 / n);
    const K = this.cut, ex = K.x * r, ey = K.y * r, erx = K.rx * r, ery = K.ry * r;
    const fx = this.face.x * r, fy = this.face.y * r;
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── chocolate buttercream bark: a cylinder lying on its side ──
    c.fillStyle = lg(c, 0, -b, 0, b, [[0, '#9a5733'], [0.3, '#7c4224'], [0.62, '#5a2c15'], [1, '#2c1408']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, 0.55 * r, 0, r, 0, [[0, 'rgba(30,12,4,0)'], [1, 'rgba(30,12,4,0.45)']]);
    c.fillRect(0.55 * r, -2 * r, 2 * r, 4 * r);
    // fork-swept buttercream: soft, rounded ripples flowing along the log — shaded, not outlined, so it reads as
    // satiny frosting rather than wood grain
    const calm = (x, y) => Math.hypot((x - fx) / (0.31 * r), (y - fy) / (0.18 * r)) > 1;
    const ripples = [];
    const NB = 9;
    for (let i = 0; i < NB; i++) {
      const th = lerp(-1.0, 1.32, (i + 0.5) / NB), yc = Math.sin(th) * b * 0.95, sq = Math.max(0.45, Math.cos(th));
      const ph = R() * TAU, ph2 = R() * TAU, amp = lerp(0.035, 0.05, R()) * r * sq, fq = lerp(3.5, 5, R()) / r;
      const runs = [[]];
      for (let x = -0.6 * r; x <= 1.1 * r; x += 0.02 * r) {
        const y = yc + Math.sin(x * fq + ph) * amp + Math.sin(x * fq * 2.2 + ph2) * amp * 0.3;
        if (calm(x, y)) runs[runs.length - 1].push({ x, y }); else if (runs[runs.length - 1].length) runs.push([]);
      }
      for (const p of runs) if (p.length > 3) ripples.push([p, sq]);
    }
    for (const [p, sq] of ripples) { c.save(); c.translate(0, 0.024 * r * sq); c.strokeStyle = 'rgba(28,10,2,0.42)'; c.lineWidth = 0.055 * r * sq; strokePts(c, p); c.restore(); }
    for (const [p, sq] of ripples) { c.strokeStyle = 'rgba(176,108,66,0.5)'; c.lineWidth = 0.036 * r * sq; strokePts(c, p); }
    for (const [p, sq] of ripples) { c.save(); c.translate(0, -0.012 * r * sq); c.strokeStyle = 'rgba(255,214,170,0.4)'; c.lineWidth = 0.012 * r * sq; strokePts(c, p); c.restore(); }
    // satin sheen along the upper flank
    ell(c, 0.32 * r, -0.12 * r, 0.6 * r, 0.07 * r, -0.02); c.fillStyle = rg(c, 0.32 * r, -0.12 * r, 0, 0.32 * r, -0.12 * r, 0.6 * r, [[0, 'rgba(255,225,190,0.22)'], [1, 'rgba(255,225,190,0)']]); c.fill();

    // ── icing-sugar snow on top (thins out towards both ends, so the round right end stays chocolate) ──
    const drips = [[-0.08, 0.05, 0.1], [0.62, 0.055, 0.12]];   // centre, half-width, length (units of r)
    const snowY = x => {
      const u = x / r, e = edge(x);
      let y = -e + (0.5 + 0.06 * Math.sin(u * 5.5 + 0.8) + 0.025 * Math.sin(u * 13 + 2)) * b * Math.pow(e / b, 1.6);
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
    c.save(); c.translate(0, 0.022 * r); c.strokeStyle = 'rgba(20,8,2,0.5)'; c.lineWidth = 0.045 * r; c.beginPath(); snowEdge(0); c.stroke(); c.restore();
    snowPath(); c.fillStyle = lg(c, 0, -b, 0, -0.35 * b, [[0, '#ffffff'], [0.6, '#fbfbff'], [1, '#e8ecf8']]); c.fill();
    c.save(); snowPath(); c.clip();
    c.strokeStyle = 'rgba(150,160,200,0.5)'; c.lineWidth = 0.05 * r; c.beginPath(); snowEdge(0); c.stroke();
    c.restore();
    speckle(c, R, 45, R => { const x = lerp(-0.1, 0.9, R()) * r; return { x, y: snowY(x) + 0.04 * r + Math.pow(R(), 2.4) * 0.35 * b }; }, R => `rgba(255,255,255,${0.3 + R() * 0.4})`, r * 0.005, r * 0.01);

    // ── the cut end: dark chocolate sponge rolled up with a thick band of cream ──
    // ganache rim, and the thickness of the bark showing on the far side of the cut
    ell(c, ex, ey, erx, ery); c.fillStyle = '#211006'; c.fill();
    ell(c, ex + 0.02 * r, ey, erx - 0.025 * r, ery - 0.025 * r); c.fillStyle = lg(c, ex, 0, ex + erx, 0, [[0, '#3a1c0c'], [0.7, '#5e3119'], [1, '#7a4426']]); c.fill();
    const irx = erx - 0.075 * r, iry = ery - 0.07 * r, ix = ex + 0.0 * r;
    c.save();
    ell(c, ix, ey, irx, iry); c.clip();
    c.fillStyle = rg(c, ix - 0.06 * r, ey - 0.12 * r, 0, ix, ey, iry, [[0, '#6e3a1f'], [0.6, '#552a14'], [1, '#3a1a0a']]);
    c.fillRect(ix - irx, ey - iry, 2 * irx, 2 * iry);
    speckle(c, R, 45, R => { const a = R() * TAU, d = Math.sqrt(R()); return { x: ix + Math.cos(a) * d * irx, y: ey + Math.sin(a) * d * iry }; }, R => `rgba(25,10,3,${0.3 + R() * 0.3})`, r * 0.006, r * 0.012);
    // 1⅓ bold turns: wide cream band, wide sponge gap
    const th0 = 0.35, thMax = th0 + 1.3 * TAU, kk = 0.95 / thMax;
    const spiral = (off, from = th0, to = thMax) => { const p = []; for (let th = from; th <= to + 1e-9; th += 0.05) { const rr = kk * th + off; p.push({ x: ix + Math.cos(th) * rr * irx, y: ey + Math.sin(th) * rr * iry }); } return p; };
    c.save(); c.translate(0.01 * r, 0.02 * r); c.strokeStyle = 'rgba(15,5,1,0.6)'; c.lineWidth = 0.145 * r; strokePts(c, spiral(0)); c.restore();
    c.strokeStyle = '#fff3dc'; c.lineWidth = 0.135 * r; strokePts(c, spiral(0));
    c.save(); c.translate(-0.012 * r, -0.016 * r); c.strokeStyle = '#ffffff'; c.lineWidth = 0.04 * r; strokePts(c, spiral(0, th0 + 0.5, thMax - 0.3)); c.restore();
    circ(c, ix + Math.cos(th0) * kk * th0 * irx, ey + Math.sin(th0) * kk * th0 * iry, 0.06 * r); c.fillStyle = '#fff3dc'; c.fill();
    // inner shadow at the rim of the cut
    c.lineWidth = 0.05 * r; c.strokeStyle = 'rgba(20,6,1,0.5)'; ell(c, ix, ey, irx, iry); c.stroke();
    c.restore();
    c.lineWidth = 0.016 * r; c.strokeStyle = 'rgba(214,150,104,0.7)'; c.beginPath(); c.ellipse(ex, ey, erx - 0.012 * r, ery - 0.012 * r, 0, Math.PI * 1.08, Math.PI * 1.55); c.stroke();
    // a little sugar caught on the top of the cut
    c.save(); ell(c, ex, ey, erx + 0.01 * r, ery + 0.01 * r); c.clip();
    c.beginPath(); c.moveTo(ex - erx, ey - ery - 0.1 * r);
    for (let x = -1; x <= 1.0001; x += 0.05) c.lineTo(ex + x * erx, ey - ery + (0.045 + 0.02 * Math.sin(x * 9)) * r * (1 - x * x * 0.6));
    c.lineTo(ex + erx, ey - ery - 0.1 * r); c.closePath(); c.fillStyle = '#fbfcff'; c.fill();
    c.restore();

    // ── a big holly sprig on the snow ──
    this.holly(c, r, 0.2 * r, -0.36 * r);
  },
  holly(c, r, hx, hy) {
    const leaf = (ang, L, W) => {
      c.save(); c.translate(hx, hy); c.rotate(ang);
      const k = 3, w = t => W * Math.pow(Math.sin(Math.PI * t), 0.7);
      c.beginPath(); c.moveTo(0, 0);
      for (let i = 1; i <= k + 1; i++) { const t0 = (i - 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(L * tm, -w(tm) * 0.6, L * t1, i <= k ? -w(t1) : 0); }
      for (let i = k; i >= 0; i--) { const t0 = (i + 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(L * tm, w(tm) * 0.6, L * t1, i > 0 ? w(t1) : 0); }
      c.closePath();
      c.save(); c.translate(0.012 * r, 0.022 * r); c.fillStyle = 'rgba(30,20,10,0.35)'; c.fill(); c.restore();
      c.fillStyle = lg(c, 0, -W, 0, W, [[0, '#56c872'], [0.5, '#25903f'], [1, '#125526']]); c.fill();
      c.strokeStyle = '#0b3517'; c.lineWidth = 0.022 * r; c.stroke();
      c.strokeStyle = 'rgba(205,255,205,0.8)'; c.lineWidth = 0.016 * r; c.beginPath(); c.moveTo(L * 0.08, 0); c.quadraticCurveTo(L * 0.5, -W * 0.1, L * 0.9, 0); c.stroke();
      c.restore();
    };
    leaf(Math.PI - 0.12, 0.44 * r, 0.15 * r);
    leaf(0.12, 0.44 * r, 0.15 * r);
    for (const [dx, dy] of [[-0.065, 0.015], [0.065, 0.02], [0, -0.075]]) {
      const x = hx + dx * r, y = hy + dy * r, s = 0.078 * r;
      circ(c, x + 0.01 * r, y + 0.014 * r, s); c.fillStyle = 'rgba(40,0,5,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, '#ff8080'], [0.5, '#e01f38'], [1, '#8a0619']]); c.fill();
      c.strokeStyle = '#540310'; c.lineWidth = 0.016 * r; c.stroke();
      circ(c, x - s * 0.35, y - s * 0.38, s * 0.28); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    }
  },
};
