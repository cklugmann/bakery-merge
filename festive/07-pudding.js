'use strict';
// 7 ─ CHRISTMAS PUDDING (round Christmas pudding with white icing and holly — same collision shape as the classic Cherry Pie)
FESTIVE_TIERS[7] = {
  key: 'pudding', name: 'Christmas Pudding', r: 56, outline: '#3a1c0e',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.43, s: 0.4, eye: 'light' },
  crumbs: ['#5c311c', '#ffffff', '#2f9a55', '#e8334a'],
  // icing drips: [x, length, half-width] in units of r
  drips: [[-0.74, 0.16, 0.1], [-0.44, 0.3, 0.115], [-0.13, 0.15, 0.1], [0.19, 0.27, 0.11], [0.5, 0.2, 0.115], [0.8, 0.12, 0.09]],
  icingEdge(r) {
    return x => {
      const u = x / r;
      let y = -0.2 + 0.2 * Math.sqrt(Math.max(0, 1 - Math.pow(u / 0.99, 2)));
      let d = 0;
      for (const [dx, L, w] of this.drips) {
        const t = (u - dx) / w;
        if (Math.abs(t) < 1) d = Math.max(d, L * Math.sqrt(1 - t * t));
        d = Math.max(d, 0.05 * Math.exp(-Math.pow((Math.abs(t) - 1) / 0.45, 2)) * (Math.abs(t) > 1 ? 1 : 0));
      }
      return (y + d) * r;
    };
  },
  paint(c, r, R) {
    // ── the dark, fruity pudding ──
    c.fillStyle = rg(c, -0.32 * r, -0.2 * r, 0, -0.05 * r, 0.05 * r, 1.02 * r, [[0, '#9a5e37'], [0.4, '#71401f'], [0.75, '#512a14'], [1, '#33180a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // mottled crumb
    speckle(c, R, 160, inDisc(0.97 * r), R => (R() < 0.5 ? `rgba(170,110,65,${0.18 + R() * 0.25})` : `rgba(35,14,5,${0.25 + R() * 0.3})`), 0.012 * r, 0.032 * r);
    // a calmer, slightly lighter patch behind the face, so its white-rimmed eyes and blush read on the dark crumb
    const fx = this.face.x * r, fy = this.face.y * r;
    ell(c, fx, fy + 0.03 * r, 0.5 * r, 0.3 * r); c.fillStyle = rg(c, fx, fy + 0.03 * r, 0, fx, fy + 0.03 * r, 0.5 * r, [[0, 'rgba(150,92,52,0.85)'], [0.55, 'rgba(140,85,48,0.5)'], [1, 'rgba(120,70,40,0)']]); c.fill();
    // fruit: raisins, candied peel, glacé cherries — keep the face area calm and red fruit well away from it
    const fruit = [];
    for (let k = 0; k < 400 && fruit.length < 34; k++) {
      const p = inDisc(0.9 * r)(R);
      if (Math.abs(p.x - fx) < 0.46 * r && Math.abs(p.y - fy) < 0.24 * r) continue;
      if (fruit.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 0.15 * r)) continue;
      fruit.push(p);
    }
    const nearFace = p => Math.abs(p.x - fx) < 0.4 * r && p.y - fy > -0.55 * r && p.y - fy < 0.45 * r;
    fruit.forEach((p, i) => {
      let kind = i % 6; const s = lerp(0.05, 0.075, R()) * r;
      if (kind === 4 && nearFace(p)) kind = 0;   // a red cherry near the mouth reads as a tongue or a nose
      if (kind <= 2) {            // raisin
        blobPath(c, p.x + 0.012 * r, p.y + 0.016 * r, s, R, 6, 0.4); c.fillStyle = 'rgba(20,6,0,0.45)'; c.fill();
        blobPath(c, p.x, p.y, s, R, 6, 0.4); c.fillStyle = '#24100a'; c.fill();
        blobPath(c, p.x - s * 0.2, p.y - s * 0.25, s * 0.5, R, 5, 0.3); c.fillStyle = 'rgba(120,60,50,0.7)'; c.fill();
        circ(c, p.x - s * 0.35, p.y - s * 0.4, s * 0.18); c.fillStyle = 'rgba(255,220,200,0.55)'; c.fill();
      } else if (kind === 3 || kind === 5) {   // candied orange peel
        c.save(); c.translate(p.x, p.y); c.rotate(R() * TAU);
        const q = s * 0.7;
        c.beginPath(); c.roundRect(-q + 0.012 * r, -q * 0.7 + 0.016 * r, 2 * q, 1.4 * q, q * 0.35); c.fillStyle = 'rgba(20,6,0,0.45)'; c.fill();
        c.beginPath(); c.roundRect(-q, -q * 0.7, 2 * q, 1.4 * q, q * 0.35); c.fillStyle = '#c8681c'; c.fill();
        c.beginPath(); c.roundRect(-q * 0.8, -q * 0.55, 1.6 * q, 0.5 * q, q * 0.25); c.fillStyle = 'rgba(255,190,100,0.75)'; c.fill();
        c.restore();
      } else {                    // glacé cherry
        circ(c, p.x + 0.012 * r, p.y + 0.016 * r, s); c.fillStyle = 'rgba(20,6,0,0.45)'; c.fill();
        circ(c, p.x, p.y, s); c.fillStyle = rg(c, p.x - s * 0.3, p.y - s * 0.3, 0, p.x, p.y, s, [[0, '#ff6070'], [0.6, '#c3182c'], [1, '#7a0716']]); c.fill();
        circ(c, p.x - s * 0.35, p.y - s * 0.38, s * 0.24); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
      }
    });
    // currants and glints
    for (let k = 0; k < 40; k++) {
      const p = inDisc(0.92 * r)(R), s = lerp(0.022, 0.034, R()) * r;
      if (Math.abs(p.x - fx) < 0.46 * r && Math.abs(p.y - fy) < 0.22 * r) continue;
      circ(c, p.x, p.y, s); c.fillStyle = '#1c0a04'; c.fill();
      circ(c, p.x - s * 0.35, p.y - s * 0.35, s * 0.35); c.fillStyle = 'rgba(200,130,100,0.6)'; c.fill();
    }
    // soft rim light bottom-left, so the ball stays round on dark backgrounds
    c.beginPath(); c.arc(0, 0, 0.97 * r, 0, TAU); c.arc(0.1 * r, -0.08 * r, 0.95 * r, 0, TAU, true);
    c.fillStyle = rg(c, -0.6 * r, 0.55 * r, 0, -0.6 * r, 0.55 * r, 0.7 * r, [[0, 'rgba(255,190,140,0.3)'], [1, 'rgba(255,190,140,0)']]); c.fill('evenodd');

    // ── the white icing cap with drips ──
    const edge = this.icingEdge(r);
    const icing = new Path2D();
    icing.moveTo(-1.2 * r, -1.2 * r);
    for (let i = 0; i <= 240; i++) { const x = lerp(-1.05, 1.05, i / 240) * r; icing.lineTo(x, edge(x)); }
    icing.lineTo(1.2 * r, -1.2 * r); icing.closePath();
    // cast shadow on the pudding
    c.save(); c.translate(0.025 * r, 0.05 * r); c.fillStyle = 'rgba(20,6,0,0.5)'; c.fill(icing); c.restore();
    // dark edge
    c.lineJoin = 'round'; c.strokeStyle = '#5e4a4c'; c.lineWidth = 0.04 * r; c.stroke(icing);
    c.fillStyle = rg(c, -0.3 * r, -0.65 * r, 0, -0.1 * r, -0.35 * r, 1.05 * r, [[0, '#ffffff'], [0.55, '#fcfaf7'], [0.85, '#efecf2'], [1, '#dcd9e4']]);
    c.fill(icing);
    // thickness: cool shading just inside the lower edge, a bright rim just above it
    c.save(); c.clip(icing);
    c.fillStyle = rg(c, -0.32 * r, -0.5 * r, 0.2 * r, -0.2 * r, -0.35 * r, 1.12 * r, [[0, 'rgba(150,145,190,0)'], [0.7, 'rgba(150,145,190,0.08)'], [1, 'rgba(150,145,190,0.32)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.save(); c.translate(0, -0.02 * r); c.strokeStyle = 'rgba(150,145,185,0.3)'; c.lineWidth = 0.06 * r; c.stroke(icing); c.restore();
    c.save(); c.translate(-0.01 * r, -0.06 * r); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.03 * r; c.stroke(icing); c.restore();
    c.restore();
    // glossy highlights
    ell(c, -0.36 * r, -0.66 * r, 0.24 * r, 0.08 * r, -0.5); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
    for (const [dx, L] of this.drips) {
      const x = (dx - 0.03) * r, y = edge(dx * r) - 0.09 * r;
      if (L > 0.13) { ell(c, x, y, 0.025 * r, 0.05 * r, 0.1); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill(); }
    }

    // ── holly sprig on top ──
    const leaf = (bx, by, ang, len, wid) => {
      c.save(); c.translate(bx, by); c.rotate(ang);
      // spiky holly outline: spine tips joined by concave scallops
      const prof = t => wid * Math.pow(Math.sin(Math.PI * t), 0.7), ts = [0.22, 0.47, 0.72];
      const upper = [{ x: 0, y: 0 }, ...ts.map(t => ({ x: t * len, y: -prof(t) * 1.08 })), { x: len, y: 0 }];
      const lower = [{ x: len, y: 0 }, ...ts.slice().reverse().map(t => ({ x: t * len, y: prof(t) * 1.08 })), { x: 0, y: 0 }];
      const seg = (a, b, side) => { const mx = (a.x + b.x) / 2; c.quadraticCurveTo(mx, side * prof(mx / len) * 0.5, b.x, b.y); };
      c.beginPath(); c.moveTo(0, 0);
      for (let i = 0; i < upper.length - 1; i++) seg(upper[i], upper[i + 1], -1);
      for (let i = 0; i < lower.length - 1; i++) seg(lower[i], lower[i + 1], 1);
      c.closePath();
      c.save(); c.translate(0.01 * r, 0.035 * r); c.fillStyle = 'rgba(40,30,40,0.35)'; c.fill(); c.restore();
      c.fillStyle = lg(c, 0, -wid, 0, wid, [[0, '#4fc06a'], [0.45, '#2a8f45'], [1, '#13592c']]); c.fill();
      c.strokeStyle = '#0c3a1c'; c.lineWidth = 0.03 * r; c.stroke();
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(190,255,190,0.75)'; c.lineWidth = 0.022 * r;
      c.beginPath(); c.moveTo(len * 0.05, 0); c.quadraticCurveTo(len * 0.5, -wid * 0.08, len * 0.88, 0); c.stroke();
      ell(c, len * 0.45, -wid * 0.45, len * 0.2, wid * 0.16, -0.05); c.fillStyle = 'rgba(220,255,220,0.45)'; c.fill();
      c.restore();
    };
    const hx = 0, hy = -0.56 * r;
    leaf(hx - 0.03 * r, hy + 0.01 * r, Math.PI + 0.42, 0.44 * r, 0.15 * r);
    leaf(hx + 0.03 * r, hy + 0.01 * r, -0.42, 0.44 * r, 0.15 * r);
    for (const [x, y] of [[-0.075, -0.035], [0.075, -0.035], [0, 0.06]]) {
      const bx = hx + x * r, by = hy + y * r, s = 0.085 * r;
      circ(c, bx + 0.012 * r, by + 0.02 * r, s); c.fillStyle = 'rgba(40,10,10,0.4)'; c.fill();
      circ(c, bx, by, s); c.fillStyle = rg(c, bx - s * 0.35, by - s * 0.35, 0, bx, by, s, [[0, '#ff7a7a'], [0.5, '#e01f33'], [1, '#8c0618']]); c.fill();
      c.strokeStyle = 'rgba(90,0,12,0.8)'; c.lineWidth = 0.022 * r; c.stroke();
      circ(c, bx - s * 0.35, by - s * 0.38, s * 0.28); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
      circ(c, bx + s * 0.3, by + s * 0.3, s * 0.12); c.fillStyle = 'rgba(70,0,10,0.7)'; c.fill();
    }
  },
};
