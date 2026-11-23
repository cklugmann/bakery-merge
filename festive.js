'use strict';
// ═══════════════════════════════════════════════════════════════════
//  BAKERY MERGE — THE CHRISTMAS LADDER (festive mode, 23 November – 6 January)
//
//  Eleven Christmas bakes and treats that take the place of the classic pastries while festive
//  mode is on. Same rules, same sizes: every tier has the collision area of its classic
//  counterpart (six of them the identical shape), so the game plays the same.
//
//  Loaded by index.html before the main script. Each entry has the same form as the classic
//  tiers in index.html (key, name, r, outline, shape, face, crumbs, paint) and uses the drawing
//  helpers defined there (lg, rg, circ, ell, speckle, ptsCircle …), which exist by the time the
//  game calls shape() and paint(). If this file is missing the game is simply the classic one.
// ═══════════════════════════════════════════════════════════════════
const FESTIVE_TIERS = [];

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

// 1 ─ GINGERBREAD HEART (a plump Christmas-market gingerbread heart with a white piped border; one convex collision outline around it)
FESTIVE_TIERS[1] = {
  key: 'heart', name: 'Gingerbread Heart', r: 19, outline: '#5a2810',
  k: 0.8955,   // drawn 0.90 × its nominal r: the collision outline (the convex hull of the heart) has the classic Macaron's area
  // The heart (units of the drawing radius): each side is one convex half, the hull of a lobe, a flank and the rounded
  // point [x, y, radius]; a small fillet circle rounds off the cleft between the lobes. The collision is ONE convex part,
  // the hull of the heart: the shallow sliver over the cleft stays transparent (figurePath, noShade, outlineFn).
  lobe: [0.5, -0.3, 0.56], flank: [0.4, 0.2, 0.5], tip: [0, 0.74, 0.26], fillet: 0.11,
  // the outline, pulled in by d (units of r); memoised
  pts(r, d = 0) {
    const key = r + '|' + d; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (d) {
      // every point moved in along its normal; where that would fold over itself (d beyond the local radius) it is dropped
      const B = this.pts(r), n = B.length, s = (polyArea(B) > 0 ? 1 : -1) * d * r;
      const Q = B.map((p, i) => { const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: p.x - ((b.y - a.y) / L) * s, y: p.y + ((b.x - a.x) / L) * s }; });
      P = Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; });
    } else {
      // cast rays from the centre (inside both halves): the outline is the farther of the two halves' edges,
      // or, inside the cleft, the near side of the fillet circle
      const [la, ly, lr] = this.lobe, [fa, fy, fr] = this.flank, [, ty, tr] = this.tip, f = this.fillet * r;
      const halves = [-1, 1].map(s => convexHull([...ptsCircle(lr * r, 64, s * la * r, ly * r), ...ptsCircle(fr * r, 64, s * fa * r, fy * r), ...ptsCircle(tr * r, 32, 0, ty * r)]));
      const ray = (H, dx, dy) => {
        let best = 1e9;
        for (let i = 0; i < H.length; i++) {
          const A = H[i], B = H[(i + 1) % H.length], ex = B.x - A.x, ey = B.y - A.y, den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-12) continue;
          const t = (A.x * ey - A.y * ex) / den, u = (A.x * dy - A.y * dx) / den;
          if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, t);
        }
        return best;
      };
      const yc = (ly - Math.sqrt((lr + this.fillet) ** 2 - la * la)) * r, q = lr / (lr + this.fillet);
      const tx = -la * r * (1 - q), tyy = ly * r + (yc - ly * r) * q, aL = Math.atan2(tyy, tx), aR = Math.atan2(tyy, -tx);
      P = [];
      for (let i = 0; i < 240; i++) {
        const a = -Math.PI / 2 + (i / 240) * TAU, dx = Math.cos(a), dy = Math.sin(a), an = Math.atan2(dy, dx);
        let t;
        if (an >= aL && an <= aR) { const b = dy * yc; t = b - Math.sqrt(Math.max(0, b * b - yc * yc + f * f)); }
        else t = Math.max(ray(halves[0], dx, dy), ray(halves[1], dx, dy));
        P.push({ x: dx * t, y: dy * t });
      }
    }
    return (this._m[key] = P);
  },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the heart
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the heart itself
  face: { x: 0, y: 0.04, s: 0.5 },
  crumbs: ['#b8692f', '#7e3c16', '#ffffff', '#e8334a'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r);
    c.save(); c.clip(fig);
    // ── gingerbread: a warm, rich brown, lit from the top left ──
    c.fillStyle = lg(c, -0.7 * r, -0.9 * r, 0.6 * r, 1.0 * r, [[0, '#cf8a4e'], [0.45, '#b06530'], [1, '#8a461a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // the baked edge: darker bands along the outline
    c.lineJoin = 'round';
    for (const [w, a] of [[0.5, 0.07], [0.34, 0.1], [0.2, 0.14]]) { c.lineWidth = w * r; c.strokeStyle = `rgba(100,42,10,${a})`; c.stroke(fig); }
    // puffy lobes
    const glow = (x, y, rx, ry, rot, col, a) => { c.save(); c.translate(x * r, y * r); c.rotate(rot); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(${col},${a})`], [1, `rgba(${col},0)`]]); c.fillRect(-rx * r, -rx * r, 2 * rx * r, 2 * rx * r); c.restore(); };
    glow(-0.45, -0.4, 0.42, 0.3, -0.5, '255,214,150', 0.5); glow(0.5, -0.4, 0.36, 0.26, 0.5, '255,214,150', 0.3);
    // baked texture
    const inside = R => ({ x: (R() * 2 - 1) * 0.9 * r, y: lerp(-0.75, 0.7, R()) * r });
    speckle(c, R, 40, inside, R => `rgba(95,40,10,${0.12 + R() * 0.18})`, r * 0.012, r * 0.026);
    speckle(c, R, 16, inside, R => `rgba(255,226,170,${0.15 + R() * 0.2})`, r * 0.01, r * 0.02);
    // the sugar glaze on gingerbread: one soft sheen across the left lobe
    glow(-0.36, -0.3, 0.3, 0.09, -0.75, '255,246,225', 0.55);
    // ── white piped border: plump beads of royal icing just inside the edge ──
    const line = this.pts(r, 0.27), step = 0.15 * r, br = 0.095 * r, beads = [];
    for (const p of resample(line, Math.round(perimeter(line) / step))) if (!beads.some(q => Math.hypot(q.x - p.x, q.y - p.y) < step * 0.7)) beads.push(p);
    c.fillStyle = 'rgba(70,25,5,0.42)'; for (const p of beads) { circ(c, p.x + 0.02 * r, p.y + 0.04 * r, br * 1.05); c.fill(); }
    for (const p of beads) { circ(c, p.x, p.y, br); c.fillStyle = rg(c, p.x - br * 0.4, p.y - br * 0.45, 0, p.x, p.y, br, [[0, '#ffffff'], [0.6, '#fbf6ee'], [1, '#e2d6c8']]); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.95)'; for (const p of beads) { circ(c, p.x - br * 0.35, p.y - br * 0.4, br * 0.32); c.fill(); }
    // ── two tiny red sugar pearls on the lobes ──
    for (const s of [-1, 1]) {
      const x = s * 0.47 * r, y = -0.36 * r, s0 = 0.075 * r;
      circ(c, x + 0.015 * r, y + 0.03 * r, s0); c.fillStyle = 'rgba(70,20,5,0.45)'; c.fill();
      circ(c, x, y, s0); c.fillStyle = rg(c, x - s0 * 0.35, y - s0 * 0.4, 0, x, y, s0, [[0, '#ffb0b8'], [0.5, '#e8334a'], [1, '#8e0f22']]); c.fill();
      circ(c, x - s0 * 0.35, y - s0 * 0.38, s0 * 0.3); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    }
    // ── volume (instead of the engine's shading, which would follow the hull) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(fig);
    c.shadowColor = 'rgba(60,22,0,0.38)'; c.shadowBlur = r * 0.32 * pr; c.shadowOffsetX = -r * 0.09 * pr; c.shadowOffsetY = -r * 0.14 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    c.restore();   // the heart clip
  },
  // contour along the heart, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const f = this.figurePath(r); c.save(); c.clip(f); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(f); c.restore(); },
};

// 2 ─ CINNAMON STAR (a Zimtstern: a plump five-pointed cinnamon-almond star under a thick white meringue glaze)
FESTIVE_TIERS[2] = {
  key: 'star', name: 'Cinnamon Star', r: 24, outline: '#6b3814',
  k: 1.3453,   // drawn 1.35 × its nominal r: the collision outline (the convex hull of the star) has the classic Donut's area
  // The star (units of the drawing radius): N points at Ro, inner corners at Ri, the points rounded with radius tipR and
  // the inner corners filled with radius cornerR. The collision is ONE convex part, the hull of the star: the shallow
  // slivers between the points stay transparent (figurePath, noShade, outlineFn).
  N: 5, Ro: 1, Ri: 0.56, tipR: 0.2, cornerR: 0.13,
  glaze: 0.14,   // the glaze stops this far inside the outline (units of r): the dough shows as a rim all round
  // the outline, pulled in by d (units of r); memoised
  pts(r, d = 0) {
    const key = r + '|' + d; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (d) {
      // every point moved in along its normal; where that would fold over itself (d beyond the local radius) it is dropped
      const B = resample(this.pts(r), 300), n = B.length, s = polyArea(B) > 0 ? 1 : -1;
      // the glaze is spread by hand: its edge wanders a little
      const Q = B.map((p, i) => { const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, e = s * r * (d + 0.008 * Math.sin(i * 0.13) + 0.006 * Math.sin(i * 0.37 + 2)); return { x: p.x - ((b.y - a.y) / L) * e, y: p.y + ((b.x - a.x) / L) * e }; });
      P = Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; });
    } else {
      const { N, Ro, Ri, tipR, cornerR } = this, V = [];
      for (let k = 0; k < 2 * N; k++) { const a = -Math.PI / 2 + (k * Math.PI) / N, d0 = k % 2 ? Ri : Ro; V.push([Math.cos(a) * d0, Math.sin(a) * d0, k % 2 ? cornerR : tipR]); }
      P = [];
      V.forEach(([x1, y1, rad], i) => {   // every corner replaced by the arc of a circle that touches both of its edges
        const [x0, y0] = V[(i + V.length - 1) % V.length], [x2, y2] = V[(i + 1) % V.length];
        let ux = x0 - x1, uy = y0 - y1, L = Math.hypot(ux, uy); ux /= L; uy /= L;
        let vx = x2 - x1, vy = y2 - y1; L = Math.hypot(vx, vy); vx /= L; vy /= L;
        const ang = Math.acos(clamp(ux * vx + uy * vy, -1, 1)), t = rad / Math.tan(ang / 2), h = rad / Math.sin(ang / 2);
        let bx = ux + vx, by = uy + vy; L = Math.hypot(bx, by); bx /= L; by /= L;
        const cx = x1 + bx * h, cy = y1 + by * h;
        const a0 = Math.atan2(y1 + uy * t - cy, x1 + ux * t - cx), a1 = Math.atan2(y1 + vy * t - cy, x1 + vx * t - cx), da = ((a1 - a0 + 3 * Math.PI) % TAU) - Math.PI;
        for (let j = 0; j <= 10; j++) P.push({ x: (cx + Math.cos(a0 + (da * j) / 10) * rad) * r, y: (cy + Math.sin(a0 + (da * j) / 10) * rad) * r });
      });
    }
    return (this._m[key] = P);
  },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the star
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the star itself
  face: { x: 0, y: 0.08, s: 0.46 },
  crumbs: ['#fffaf0', '#f1e2c6', '#b07440', '#7a4318'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r), glaze = pathFromPts(new Path2D(), this.pts(r, this.glaze));
    c.save(); c.clip(fig);
    // ── cinnamon-almond dough: nut brown and matte, baked a little darker at the very edge ──
    c.fillStyle = lg(c, -0.7 * r, -0.8 * r, 0.7 * r, 0.9 * r, [[0, '#dba36a'], [0.5, '#c0844c'], [1, '#9c5f2f']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.lineJoin = 'round'; c.lineWidth = 0.22 * r; c.strokeStyle = 'rgba(90,40,10,0.14)'; c.stroke(fig);
    // ground almonds and cinnamon: dark and pale flecks
    speckle(c, R, 90, R => ({ x: (R() * 2 - 1) * r, y: (R() * 2 - 1) * r }), R => `rgba(80,35,8,${0.3 + R() * 0.35})`, r * 0.012, r * 0.026);
    speckle(c, R, 40, R => ({ x: (R() * 2 - 1) * r, y: (R() * 2 - 1) * r }), R => `rgba(255,232,190,${0.35 + R() * 0.3})`, r * 0.01, r * 0.02);
    // ── the meringue glaze: thick, it stands proud and casts a soft shadow on the dough ──
    c.save(); c.shadowColor = 'rgba(60,25,5,0.6)'; c.shadowBlur = 0.06 * r * pr; c.shadowOffsetX = 0.02 * r * pr; c.shadowOffsetY = 0.045 * r * pr;
    c.fillStyle = '#f6ecda'; c.fill(glaze); c.restore();
    c.save(); c.clip(glaze);
    // satin-white, warm, a little domed: lightest in the middle and towards the light
    c.fillStyle = rg(c, -0.22 * r, -0.26 * r, 0, -0.05 * r, -0.05 * r, 0.95 * r, [[0, '#fffcf4'], [0.5, '#fbf2e0'], [0.85, '#f2e2c6'], [1, '#e8d4b2']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // toasted a little at the points
    for (let k = 0; k < this.N; k++) {
      const a = -Math.PI / 2 + (k * TAU) / this.N, x = Math.cos(a) * 0.8 * r, y = Math.sin(a) * 0.8 * r;
      c.fillStyle = rg(c, x, y, 0, x, y, 0.32 * r, [[0, 'rgba(214,152,80,0.62)'], [0.6, 'rgba(225,175,110,0.24)'], [1, 'rgba(225,175,110,0)']]); c.fillRect(x - 0.32 * r, y - 0.32 * r, 0.64 * r, 0.64 * r);
    }
    // the rounded lip: the glaze curves down into a soft shade on the lower right, catches the light on the upper left
    const rim = new Path2D(); rim.rect(-4 * r, -4 * r, 8 * r, 8 * r); rim.addPath(glaze);
    c.save(); c.shadowColor = 'rgba(150,100,50,0.55)'; c.shadowBlur = 0.12 * r * pr; c.shadowOffsetX = -0.03 * r * pr; c.shadowOffsetY = -0.05 * r * pr;
    c.fillStyle = '#000'; c.fill(rim, 'evenodd'); c.restore();
    c.save(); c.shadowColor = 'rgba(255,255,255,0.9)'; c.shadowBlur = 0.04 * r * pr; c.shadowOffsetX = 0.025 * r * pr; c.shadowOffsetY = 0.035 * r * pr;
    c.fillStyle = '#000'; c.fill(rim, 'evenodd'); c.restore();
    // a few tiny air bubbles and a dusting of cinnamon
    speckle(c, R, 26, inDisc(0.8 * r), R => `rgba(170,110,55,${0.12 + R() * 0.15})`, r * 0.008, r * 0.016);
    speckle(c, R, 18, inDisc(0.8 * r), 'rgba(255,255,255,0.9)', r * 0.01, r * 0.02);
    // sheen: one soft glossy streak along the upper-left point and a crisp glint
    c.save(); c.translate(-0.34 * r, -0.3 * r); c.rotate(-0.62); c.scale(1, 0.32);
    c.fillStyle = rg(c, 0, 0, 0, 0, 0, 0.3 * r, [[0, 'rgba(255,255,255,0.95)'], [0.5, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-0.3 * r, -0.3 * r, 0.6 * r, 0.6 * r);
    c.restore();
    ell(c, -0.5 * r, -0.14 * r, 0.055 * r, 0.028 * r, -0.9); c.fillStyle = '#ffffff'; c.fill();
    c.restore();
    c.strokeStyle = 'rgba(150,100,50,0.4)'; c.lineWidth = 0.025 * r; c.stroke(glaze);
    // ── volume (instead of the engine's shading, which would follow the hull) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(fig);
    c.shadowColor = 'rgba(70,30,0,0.3)'; c.shadowBlur = r * 0.3 * pr; c.shadowOffsetX = -r * 0.08 * pr; c.shadowOffsetY = -r * 0.12 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    c.restore();   // the star clip
  },
  // contour along the star, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const f = this.figurePath(r); c.save(); c.clip(f); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(f); c.restore(); },
};

// 3 ─ TREE COOKIE (a sugar cookie cut out as a Christmas tree: three plump branch tiers and a stout trunk, flooded with green icing)
FESTIVE_TIERS[3] = {
  key: 'tree', name: 'Tree Cookie', r: 29, outline: '#6e3a12',
  k: 0.9835,   // drawn 0.98 × its nominal r: the collision outline (the convex hull of the tree) has 2.8 % more area than the classic Cupcake, because this compact cookie packs tighter (the same area would take up less room on the board)
  // The cutter (units of the drawing radius): three branch tiers, each a rounded triangle (the hull of a disc at its apex
  // and one at each branch tip), over a short, wide trunk (the hull of four small discs). The outline is the contour of
  // their union with the notches softly rounded. The collision is ONE convex part, the hull of the tree: the shallow
  // notches stay transparent (figurePath, noShade, outlineFn).
  tiers: [[-0.97, 0.17, 0.42, -0.38, 0.16], [-0.52, 0.1, 0.68, 0.21, 0.17], [0.0, 0.1, 0.9, 0.74, 0.18]],   // [apex y, apex radius, tip x, tip y, tip radius]
  trunk: [0.28, 0.6, 1.12, 0.08],   // [half width, top, bottom, corner radius]
  ice: 0.125,   // the green icing stops this far inside the outline (units of r): the baked rim shows all round
  // the outline, pulled in by d (units of r); memoised
  pts(r, d = 0) {
    const key = r + '|' + d; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (d) {
      // every point moved in along its normal; where that would fold over itself (d beyond the local radius) it is dropped
      const B = this.pts(r), n = B.length, s = (polyArea(B) > 0 ? 1 : -1) * d * r;
      const Q = B.map((p, i) => { const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: p.x - ((b.y - a.y) / L) * s, y: p.y + ((b.x - a.x) / L) * s }; });
      P = Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; });
    } else {
      const C = (x, y, s) => ptsCircle(s * r, 40, x * r, y * r), [w, y0, y1, cr] = this.trunk;
      const parts = this.tiers.map(([ay, ar, tx, ty, tr]) => convexHull([...C(0, ay, ar), ...C(-tx, ty, tr), ...C(tx, ty, tr)]));
      parts.push(convexHull([...C(-w + cr, y0 + cr, cr), ...C(w - cr, y0 + cr, cr), ...C(-w + cr, y1 - cr, cr), ...C(w - cr, y1 - cr, cr)]));
      // the contour of the union: the runs of each part's outline that lie outside all the others, chained into one loop
      const inside = (h, x, y, eps) => {
        for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; if (((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x)) / L < eps) return false; }
        return true;
      };
      const runs = [];
      parts.forEach((h, i) => {
        const Q = resample(h, Math.max(32, Math.round(perimeter(h) / (0.012 * r)))), n = Q.length;
        const out = Q.map(p => !parts.some((g, j) => j !== i && inside(g, p.x, p.y, 0.002 * r)));
        if (out.every(Boolean)) { runs.push(Q); return; }
        for (let k = 0; k < n; k++) if (out[k] && !out[(k + n - 1) % n]) { const run = []; for (let m = k; out[m % n] && run.length < n; m++) run.push(Q[m % n]); runs.push(run); }
      });
      const loop = [], used = new Set();
      for (let cur = 0; cur >= 0 && !used.has(cur);) {
        used.add(cur); loop.push(...runs[cur]);
        const e = runs[cur][runs[cur].length - 1]; let best = -1, bd = 1e9;
        runs.forEach((ru, k) => { if (k === cur) return; const dd = Math.hypot(ru[0].x - e.x, ru[0].y - e.y); if (dd < bd) { bd = dd; best = k; } });
        cur = best;
      }
      // soften the notches: even spacing, then a short moving average
      const Q = resample(loop, 480), n = Q.length;
      P = Q.map((_, i) => { let x = 0, y = 0; for (let k = -3; k <= 3; k++) { const q = Q[(i + k + n) % n]; x += q.x; y += q.y; } return { x: x / 7, y: y / 7 }; });
    }
    return (this._m[key] = P);
  },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the tree
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the tree itself
  face: { x: 0, y: 0.5, s: 0.46, blush: 'rgba(250,120,140,0.92)' },   // an opaque pink: the usual translucent blush turns olive on dark green
  crumbs: ['#2f9a55', '#8fd9a0', '#ffd84a', '#e0a860', '#e8334a'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r), ice = pathFromPts(new Path2D(), this.pts(r, this.ice)), [tw, , ty1] = this.trunk;
    c.save(); c.clip(fig);
    // ── sugar-cookie dough: golden, baked darker towards the edge ──
    c.fillStyle = lg(c, -0.6 * r, -1.0 * r, 0.6 * r, 1.1 * r, [[0, '#f3cc8e'], [0.5, '#e2aa62'], [1, '#c98a45']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.lineJoin = 'round'; c.lineWidth = 0.22 * r; c.strokeStyle = 'rgba(140,62,12,0.16)'; c.stroke(fig);
    speckle(c, R, 70, R => ({ x: (R() * 2 - 1) * 1.1 * r, y: lerp(-1.15, 1.1, R()) * r }), R => `rgba(140,70,20,${0.18 + R() * 0.22})`, r * 0.01, r * 0.022);
    // ── chocolate icing on the trunk ──
    const tY = this.tiers[2][3] + this.tiers[2][4] - this.ice - 0.02, trunkIce = new Path2D(); trunkIce.roundRect(-tw * r, tY * r, 2 * tw * r, (ty1 - tY + 0.2) * r, [0.1 * r, 0.1 * r, 0, 0]);
    c.save(); c.clip(ice); c.clip(trunkIce);
    c.save(); c.translate(0.02 * r, 0.04 * r); c.fillStyle = 'rgba(90,40,8,0.45)'; c.fill(ice); c.restore();
    c.fillStyle = lg(c, -tw * r, 0, tw * r, 0, [[0, '#93552a'], [0.4, '#723a17'], [1, '#4a230a']]); c.fillRect(-tw * r, tY * r, 2 * tw * r, r);
    c.strokeStyle = 'rgba(235,175,120,0.5)'; c.lineWidth = 0.03 * r; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.07 * r, (tY + 0.06) * r); c.lineTo(-0.07 * r, (ty1 - 0.16) * r); c.stroke();
    c.restore();
    // ── green icing, flooded almost to the edge (everything but the trunk) ──
    const green = new Path2D(); green.rect(-3 * r, -3 * r, 6 * r, 6 * r); green.addPath(trunkIce);
    c.save(); c.clip(green, 'evenodd');
    c.save(); c.translate(0.025 * r, 0.05 * r); c.fillStyle = 'rgba(90,45,8,0.5)'; c.fill(ice); c.restore();
    c.save(); c.clip(ice);
    c.fillStyle = lg(c, -0.8 * r, -1.0 * r, 0.6 * r, 0.9 * r, [[0, '#56c272'], [0.35, '#2a9447'], [0.75, '#1a7337'], [1, '#105a2a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // each branch tier casts a soft shadow on the one below; its lower edge catches the light
    for (let k = 0; k < 2; k++) {
      const [, , tx, ty, tr] = this.tiers[k], y = ty + tr - this.ice, x = tx + tr * 0.4;
      const curve = () => { c.beginPath(); c.moveTo(-x * r, (y - 0.02) * r); c.quadraticCurveTo(0, (y + 0.16) * r, x * r, (y - 0.02) * r); };
      c.save(); c.translate(0, 0.045 * r); curve(); c.strokeStyle = 'rgba(5,45,18,0.5)'; c.lineWidth = 0.07 * r; c.stroke(); c.restore();
      curve(); c.strokeStyle = 'rgba(160,240,170,0.5)'; c.lineWidth = 0.03 * r; c.stroke();
    }
    // its rounded lip: lit along the upper left inner edge, shaded along the lower right
    c.save(); c.translate(-0.03 * r, -0.05 * r); c.strokeStyle = 'rgba(5,40,15,0.45)'; c.lineWidth = 0.1 * r; c.stroke(ice); c.restore();
    c.save(); c.translate(0.025 * r, 0.04 * r); c.strokeStyle = 'rgba(200,255,205,0.55)'; c.lineWidth = 0.05 * r; c.stroke(ice); c.restore();
    c.restore();
    // the green edge over the trunk casts a shadow on the chocolate
    c.save(); c.clip(ice); c.translate(0, 0.035 * r); c.strokeStyle = 'rgba(20,8,0,0.45)'; c.lineWidth = 0.05 * r; c.stroke(trunkIce); c.restore();
    c.strokeStyle = 'rgba(8,50,20,0.7)'; c.lineWidth = 0.03 * r; c.stroke(ice);
    c.restore();
    // ── one bold white icing garland across the middle tier ──
    {
      const pts = [], [x0, y0, x1, y1, sag] = [-0.48, -0.02, 0.56, 0.12, 0.13];
      for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push({ x: lerp(x0, x1, t) * r, y: (lerp(y0, y1, t) + sag * 4 * t * (1 - t)) * r }); }
      c.save(); c.clip(ice); c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(0.015 * r, 0.04 * r); c.strokeStyle = 'rgba(5,40,15,0.5)'; c.lineWidth = 0.11 * r; strokePts(c, pts); c.restore();
      c.strokeStyle = '#dcd5c6'; c.lineWidth = 0.1 * r; strokePts(c, pts);
      c.strokeStyle = '#fffdf7'; c.lineWidth = 0.075 * r; c.save(); c.translate(-0.008 * r, -0.01 * r); strokePts(c, pts); c.restore();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.025 * r; c.save(); c.translate(-0.014 * r, -0.024 * r); strokePts(c, pts); c.restore();
      c.restore();
    }
    // ── bold sugar-pearl baubles, none near the face ──
    const bauble = (x, y, s, col, dark, light) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.015 * r, y + 0.035 * r, s); c.fillStyle = 'rgba(5,35,12,0.45)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.4, 0, x, y, s, [[0, light], [0.5, col], [1, dark]]); c.fill();
      c.strokeStyle = dark; c.lineWidth = 0.025 * r; c.stroke();
      ell(c, x - s * 0.35, y - s * 0.38, s * 0.32, s * 0.22, -0.6); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    };
    const RED = ['#ee3048', '#9a1426', '#ffa8b2'], GOLD = ['#ffcc2e', '#b07408', '#fff4b8'];
    bauble(0.1, -0.5, 0.09, ...RED);
    bauble(-0.34, 0.24, 0.1, ...GOLD);
    bauble(0.34, -0.08, 0.09, ...RED);
    bauble(-0.64, 0.62, 0.1, ...RED);
    bauble(0.64, 0.62, 0.1, ...GOLD);
    // ── a small yellow star on the top ──
    {
      const x = 0, y = -0.86 * r, R0 = 0.22 * r, R1 = 0.1 * r, pts = [];
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = k % 2 ? R1 : R0; pts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }); }
      const path = new Path2D(), n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? 0.12 : 0.2;
        const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
        i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
      }
      path.closePath();
      c.save(); c.translate(0.018 * r, 0.04 * r); c.fillStyle = 'rgba(30,40,5,0.5)'; c.fill(path); c.restore();
      c.fillStyle = rg(c, x - 0.05 * r, y - 0.06 * r, 0, x, y, R0, [[0, '#fff07a'], [0.5, '#ffcf1c'], [1, '#ec9306']]); c.fill(path);
      c.strokeStyle = '#7a4202'; c.lineWidth = 0.04 * r; c.lineJoin = 'round'; c.stroke(path);
      ell(c, x - 0.05 * r, y - 0.05 * r, 0.045 * r, 0.025 * r, -0.6); c.fillStyle = 'rgba(255,255,235,0.9)'; c.fill();
    }
    // ── volume (instead of the engine's shading, which would follow the hull) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(fig);
    c.shadowColor = 'rgba(60,22,0,0.38)'; c.shadowBlur = r * 0.32 * pr; c.shadowOffsetX = -r * 0.09 * pr; c.shadowOffsetY = -r * 0.14 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    c.restore();   // the tree clip
  },
  // contour along the tree, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const f = this.figurePath(r); c.save(); c.clip(f); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(f); c.restore(); },
};

// 4 ─ CHOCOLATE SANTA (a foil-wrapped chocolate Santa; one soft convex bell shape)
FESTIVE_TIERS[4] = {
  key: 'santa', name: 'Chocolate Santa', plural: 'Chocolate Santas', r: 39, outline: '#9a2232',
  k: 0.7750,   // drawn 0.78 × its nominal r: a compact bell fills its box far better than the classic Croissant's crescent. Its collision area is 2.8 % above the Croissant's, because it also packs about 4 % tighter (the same area would take up less room on the board)
  // bell / egg: [x, y, radius] discs whose convex hull is the figure (units of r)
  discs: [[0, -0.727, 0.353], [-0.507, 0.551, 0.485], [0.507, 0.551, 0.485]],
  shape(r) { const pts = []; for (const [x, y, d] of this.discs) pts.push(...ptsCircle(d * r, 48, x * r, y * r)); return [pts]; },
  face: { x: 0, y: -0.155, s: 0.42 },
  crumbs: ['#d8323f', '#ffffff', '#5c311c', '#ffd84a'],
  // big shapes only (units of r): at play size the figure is ~60 px tall
  beltY(x) { return 0.62 + 0.05 * (1 - x * x); },
  brimY(x) { return -0.36 + 0.05 * x * x; },
  paint(c, r, R) {
    const disc = (p, x, y, s) => { p.moveTo((x + s) * r, y * r); p.arc(x * r, y * r, s * r, 0, TAU); return p; };
    // a soft white volume, painted like cream: soft shadow below, faint warm edge, white → cool shade, lit rim top left
    const cream = (p, cx, cy, rad, opts = {}) => {
      const { shadow = 0.035, edge = 0.3, rim = true } = opts;
      if (shadow) { c.save(); c.translate(0.01 * r, shadow * r); c.fillStyle = 'rgba(80,5,15,0.32)'; c.fill(p); c.restore(); }
      c.lineJoin = 'round'; c.strokeStyle = `rgba(120,80,95,${edge})`; c.lineWidth = 0.03 * r; c.stroke(p);
      c.fillStyle = rg(c, (cx - 0.35 * rad) * r, (cy - 0.4 * rad) * r, 0, cx * r, cy * r, rad * 1.15 * r, [[0, '#ffffff'], [0.5, '#fbf8f7'], [0.82, '#ebe5ec'], [1, '#d6cdd9']]);
      c.fill(p);
      if (rim) { c.save(); c.clip(p); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.03 * r; c.stroke(p); c.restore(); }
    };
    // one opaque cotton puff of the beard: it casts a soft shade on the puffs behind it, then shows its own roundness
    const puff = (x, y, rx, ry, rot) => {
      c.save(); c.translate(0.012 * r, 0.028 * r); ell(c, x * r, y * r, rx * r, ry * r, rot); c.fillStyle = 'rgba(150,130,160,0.16)'; c.fill(); c.restore();
      ell(c, x * r, y * r, rx * r, ry * r, rot);
      c.fillStyle = rg(c, (x - 0.3 * rx) * r, (y - 0.4 * ry) * r, 0, x * r, y * r, Math.max(rx, ry) * 1.05 * r, [[0, '#ffffff'], [0.55, '#fcf9f9'], [0.85, '#efe9ef'], [1, '#e2dae3']]);
      c.fill();
    };
    const glow = (x, y, rx, ry, rot, col, a) => {   // a soft elliptical highlight
      c.save(); c.translate(x * r, y * r); c.rotate(rot); c.scale(1, ry / rx);
      c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(${col},${a})`], [1, `rgba(${col},0)`]]); c.fillRect(-rx * r, -rx * r, 2 * rx * r, 2 * rx * r);
      c.restore();
    };

    // ── red foil: a smooth metallic gradient, a soft sheen down the lit side ──
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, '#8e1222'], [0.14, '#c01d30'], [0.32, '#e2394a'], [0.48, '#d0293a'], [0.7, '#b51a2d'], [0.88, '#8c1020'], [1, '#6e0a17']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, 0, -1.1 * r, 0, 1.1 * r, [[0, 'rgba(255,190,190,0.12)'], [0.45, 'rgba(90,0,10,0)'], [1, 'rgba(70,0,10,0.28)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    glow(-0.6, 0.3, 0.42, 0.13, 1.35, '255,215,215', 0.45);     // body, lit side
    glow(-0.2, -0.62, 0.3, 0.07, -1.18, '255,220,220', 0.55);   // hat, lit side
    glow(0.8, 0.45, 0.3, 0.05, 1.25, '255,200,200', 0.25);      // thin rim light on the right
    // two crisp glints where the foil faces the light
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [x0, y0, cx, cy, x1, y1, w, a] of [[-0.15, -0.8, -0.25, -0.66, -0.27, -0.52, 0.05, 0.85], [-0.73, 0.02, -0.8, 0.16, -0.8, 0.32, 0.05, 0.6]]) {
      c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = w * r;
      c.beginPath(); c.moveTo(x0 * r, y0 * r); c.quadraticCurveTo(cx * r, cy * r, x1 * r, y1 * r); c.stroke();
    }
    // one soft crease on the shaded side of the coat
    c.save(); c.translate(0.012 * r, 0.02 * r); c.strokeStyle = 'rgba(70,0,12,0.3)'; c.lineWidth = 0.05 * r;
    c.beginPath(); c.moveTo(0.6 * r, 0.1 * r); c.quadraticCurveTo(0.7 * r, 0.24 * r, 0.66 * r, 0.42 * r); c.stroke(); c.restore();
    c.strokeStyle = 'rgba(255,190,190,0.35)'; c.lineWidth = 0.035 * r;
    c.beginPath(); c.moveTo(0.6 * r, 0.1 * r); c.quadraticCurveTo(0.7 * r, 0.24 * r, 0.66 * r, 0.42 * r); c.stroke();

    // ── beard: one big soft volume made of round lobes ──
    // back to front: cheeks, sides, lower sides, the middle lock in front
    // locks: [x, y, rx, ry, rot] — rounded, a little longer than wide, leaning in towards the chin
    const lobes = [[-0.44, -0.1, 0.14, 0.17, 0.1], [0.44, -0.1, 0.14, 0.17, -0.1], [-0.41, 0.16, 0.16, 0.2, 0.25], [0.41, 0.16, 0.16, 0.2, -0.25], [-0.22, 0.34, 0.16, 0.21, 0.35], [0.22, 0.34, 0.16, 0.21, -0.35], [0, 0.4, 0.17, 0.22, 0]];
    const beard = new Path2D();
    beard.ellipse(0, 0.06 * r, 0.46 * r, 0.36 * r, 0, 0, TAU);
    beard.moveTo(-0.3 * r, -0.33 * r); beard.lineTo(0.3 * r, -0.33 * r); beard.lineTo(0.5 * r, -0.12 * r); beard.lineTo(-0.5 * r, -0.12 * r); beard.closePath();
    for (const [x, y, rx, ry, rot] of lobes) { beard.moveTo(x * r + Math.cos(rot) * rx * r, y * r + Math.sin(rot) * rx * r); beard.ellipse(x * r, y * r, rx * r, ry * r, rot, 0, TAU); }
    cream(beard, -0.05, 0.05, 0.6, { shadow: 0.04 });
    c.save(); c.clip(beard);
    for (const l of lobes) puff(...l);
    c.restore();

    // ── face: skin between the fur brim and the beard (the game draws eyes, mouth and blush on it) ──
    const skin = new Path2D(); skin.ellipse(0, -0.17 * r, 0.37 * r, 0.19 * r, 0, 0, TAU);
    c.fillStyle = rg(c, -0.08 * r, -0.24 * r, 0, 0, -0.17 * r, 0.4 * r, [[0, '#ffe6d2'], [0.6, '#fbcdab'], [1, '#e9a485']]); c.fill(skin);
    // moustache: two plump soft lobes under the mouth, tilting up at the outer ends, a notch between them
    for (const s of [-1, 1]) {
      const m = new Path2D(); m.ellipse(s * 0.155 * r, -0.005 * r, 0.165 * r, 0.085 * r, -s * 0.28, 0, TAU);
      cream(m, s * 0.12, -0.03, 0.18, { shadow: 0.03, edge: 0.25 });
    }

    // ── fur brim of the hat: a fat, softly puffed band ──
    const by = this.brimY, brim = new Path2D();
    brim.moveTo(-1.2 * r, (by(-1.2) - 0.075) * r);
    for (let x = -1.2; x <= 1.2001; x += 0.05) brim.lineTo(x * r, (by(x) - 0.075) * r);
    for (let x = 1.2; x >= -1.2001; x -= 0.05) brim.lineTo(x * r, (by(x) + 0.075) * r);
    brim.closePath();
    const bpuffs = [];
    for (let x = -0.84; x <= 0.85; x += 0.21) bpuffs.push([x, by(x), 0.105]);
    for (const [x, y, s] of bpuffs) disc(brim, x, y, s);
    cream(brim, -0.15, -0.42, 0.7, { shadow: 0.04, rim: false });
    // a fur roll: lit along its top, a cool shade along its underside
    c.save(); c.clip(brim);
    c.fillStyle = lg(c, 0, (by(0) - 0.1) * r, 0, (by(0) + 0.11) * r, [[0, 'rgba(255,255,255,0.6)'], [0.45, 'rgba(255,255,255,0)'], [0.7, 'rgba(170,155,180,0)'], [1, 'rgba(170,155,180,0.45)']]);
    c.fillRect(-1.2 * r, -0.7 * r, 2.4 * r, 0.6 * r);
    c.restore();

    // ── pompom ──
    const pom = new Path2D(), px = 0.06, py = -0.83, ps = 0.155;
    disc(pom, px, py, ps);
    cream(pom, px, py, ps, { shadow: 0.03 });

    // ── belt with a gold buckle ──
    const bY = this.beltY, belt = new Path2D();
    belt.moveTo(-1.2 * r, (bY(-1.2) - 0.08) * r);
    for (let x = -1.2; x <= 1.2001; x += 0.05) belt.lineTo(x * r, (bY(x) - 0.08) * r);
    for (let x = 1.2; x >= -1.2001; x -= 0.05) belt.lineTo(x * r, (bY(x) + 0.08) * r);
    belt.closePath();
    c.save(); c.translate(0, 0.03 * r); c.fillStyle = 'rgba(60,0,10,0.35)'; c.fill(belt); c.restore();
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, '#120d10'], [0.26, '#3a3236'], [0.34, '#5a5257'], [0.44, '#262024'], [1, '#0d090b']]); c.fill(belt);
    c.save(); c.clip(belt); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.03 * r;
    c.beginPath(); for (let x = -1; x <= 1.0001; x += 0.05) c.lineTo(x * r, (bY(x) - 0.06) * r); c.stroke(); c.restore();
    const bk = new Path2D(), bw = 0.17, bh = 0.13, bcy = bY(0);
    bk.roundRect(-bw * r, (bcy - bh) * r, 2 * bw * r, 2 * bh * r, 0.055 * r);
    bk.roundRect(-bw * 0.48 * r, (bcy - bh * 0.42) * r, bw * 0.96 * r, bh * 0.84 * r, 0.02 * r);
    c.save(); c.translate(0.01 * r, 0.025 * r); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fill(bk, 'evenodd'); c.restore();
    c.fillStyle = lg(c, -bw * r, (bcy - bh) * r, bw * r, (bcy + bh) * r, [[0, '#fff4b8'], [0.35, '#ffd447'], [0.7, '#dc9d1e'], [1, '#a0660a']]); c.fill(bk, 'evenodd');
    c.strokeStyle = 'rgba(110,62,6,0.8)'; c.lineWidth = 0.025 * r; c.stroke(bk);

    // ── chocolate: the foil is torn off one bottom corner, a clean diagonal with a bright silver edge ──
    const T = this.tear, n = [-Math.SQRT1_2, Math.SQRT1_2], d = [Math.SQRT1_2, Math.SQRT1_2];
    const o = [T.cx + n[0] * T.d, T.cy + n[1] * T.d];
    const edge = [];
    for (let i = 0; i <= 10; i++) { const t = lerp(-0.75, 0.75, i / 10), j = (i % 2 ? 0.012 : -0.008); edge.push([o[0] + d[0] * t + n[0] * j, o[1] + d[1] * t + n[1] * j]); }
    const hole = new Path2D(); edge.forEach(([x, y], i) => (i ? hole.lineTo(x * r, y * r) : hole.moveTo(x * r, y * r)));
    hole.lineTo(-0.2 * r, 1.4 * r); hole.lineTo(-1.4 * r, 1.4 * r); hole.lineTo(-1.4 * r, -0.2 * r); hole.closePath();
    c.save(); c.clip(hole);
    c.fillStyle = '#4e260f'; c.fillRect(-1.4 * r, -0.2 * r, 1.4 * r, 1.6 * r);   // the grooves
    // chocolate-bar squares: each a little raised pillow, lit top left, darker bottom right
    const G = 0.22, g = 0.03;
    for (let gx = -1.16; gx < -0.2; gx += G) for (let gy = 0.36; gy < 1.1; gy += G) {
      const x = (gx + g) * r, y = (gy + g) * r, s = (G - 2 * g) * r;
      c.beginPath(); c.roundRect(x, y, s, s, 0.035 * r);
      c.fillStyle = lg(c, x, y, x + s, y + s, [[0, '#d39563'], [0.35, '#a7683a'], [1, '#6e3b1c']]); c.fill();
      c.strokeStyle = 'rgba(255,215,170,0.55)'; c.lineWidth = 0.025 * r;
      c.beginPath(); c.moveTo(x + 0.03 * r, y + s - 0.02 * r); c.lineTo(x + 0.03 * r, y + 0.03 * r); c.lineTo(x + s - 0.02 * r, y + 0.03 * r); c.stroke();
    }
    // gloss
    glow(-0.84, 0.6, 0.16, 0.05, 1.0, '255,240,220', 0.75);
    // the foil's edge lifts a little: a dark gap, then the silver lip
    c.save(); c.translate(0.02 * r, 0.03 * r); c.lineJoin = 'round'; c.strokeStyle = 'rgba(35,12,2,0.6)'; c.lineWidth = 0.08 * r; c.stroke(hole); c.restore();
    c.restore();
    const lip = new Path2D(); edge.forEach(([x, y], i) => (i ? lip.lineTo(x * r, y * r) : lip.moveTo(x * r, y * r)));
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = 'rgba(90,60,75,0.7)'; c.lineWidth = 0.075 * r; c.stroke(lip);
    c.strokeStyle = lg(c, (o[0] - 0.4) * r, (o[1] - 0.4) * r, (o[0] + 0.4) * r, (o[1] + 0.4) * r, [[0, '#ffffff'], [0.5, '#dcdbe6'], [1, '#ffffff']]); c.lineWidth = 0.045 * r; c.stroke(lip);
  },
  // the torn corner: centre of the bottom-left corner disc, and how far towards the corner the tear runs (units of r)
  tear: { cx: -0.507, cy: 0.551, d: 0.1 },
};

// 5 ─ MINCE PIE (mince pie seen from above, star lid — same collision shape as the classic Cinnamon Roll)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#8a4f22',
  shape: r => [ptsCircle(r)],
  face: { x: 0, y: 0.03, s: 0.32 },
  crumbs: ['#e8b06c', '#f6d29b', '#ffffff', '#a8341c', '#e8782a'],
  RIN: 0.73,   // inner edge of the pastry rim (units of r)
  // rounded star outline (design units): 5 points, one pointing up
  star(r, R0, R1, tip = 0.2, notch = 0.16) {
    const pts = [];
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = (k % 2 ? R1 : R0) * r; pts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d }); }
    const path = new Path2D(), n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? notch : tip;
      const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
      i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
    }
    path.closePath();
    return path;
  },
  paint(c, r, R) {
    const RIN = this.RIN;
    // ── the pastry rim: one continuous, rounded band of shortcrust ──
    c.fillStyle = rg(c, 0, 0, RIN * r, 0, 0, r, [[0, '#f6d394'], [0.35, '#eebf78'], [0.75, '#dba25a'], [1, '#c4843e']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // lit from the top left, shaded bottom right
    c.fillStyle = lg(c, -0.8 * r, -0.8 * r, 0.8 * r, 0.8 * r, [[0, 'rgba(255,246,215,0.45)'], [0.5, 'rgba(255,246,215,0)'], [0.62, 'rgba(120,55,12,0)'], [1, 'rgba(120,55,12,0.3)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // a soft ridge along the middle of the band
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(255,240,205,0.4)'; c.lineWidth = 0.05 * r; c.beginPath(); c.arc(0, 0, 0.84 * r, 2.4, 5.4); c.stroke();
    // pinched crimp: soft slanted dents pressed into the outer half of the band
    const N = 22;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU, lit = Math.cos(a + 2.36);
      c.save(); c.rotate(a);
      const dent = new Path2D(); dent.moveTo(0.8 * r, -0.02 * r); dent.quadraticCurveTo(0.9 * r, 0.03 * r, 0.985 * r, 0.1 * r);
      c.strokeStyle = `rgba(125,58,14,${0.42 - 0.1 * lit})`; c.lineWidth = 0.05 * r; c.stroke(dent);
      c.save(); c.translate(-0.012 * r, -0.03 * r); c.strokeStyle = `rgba(255,238,200,${0.35 + 0.15 * lit})`; c.lineWidth = 0.028 * r; c.stroke(dent); c.restore();
      c.restore();
    }
    speckle(c, R, 40, R => { const a = R() * TAU, d = lerp(RIN + 0.04, 0.95, R()) * r; return { x: Math.cos(a) * d, y: Math.sin(a) * d }; }, R => `rgba(150,80,25,${0.12 + R() * 0.15})`, r * 0.006, r * 0.013);
    // ── fruit mince: a clear mid red, darker than the pastry, lighter than a chocolate filling ──
    circ(c, 0, 0, RIN * r); c.fillStyle = rg(c, -0.1 * r, -0.12 * r, 0, 0, 0, RIN * r, [[0, '#a8452c'], [0.6, '#913424'], [1, '#7a2a1e']]); c.fill();
    c.save(); circ(c, 0, 0, RIN * r); c.clip();
    // chunky mince texture: currants, bits of apple and peel in a dark syrup
    for (let i = 0; i < 110; i++) {
      const a = R() * TAU, d = lerp(0.25, 0.75, Math.sqrt(R())) * r, x = Math.cos(a) * d, y = Math.sin(a) * d, s = lerp(0.022, 0.04, R()) * r, k = R();
      blobPath(c, x, y, s, R, 6, 0.45); c.fillStyle = k < 0.42 ? 'rgba(70,16,24,0.6)' : k < 0.7 ? 'rgba(196,96,52,0.5)' : k < 0.88 ? 'rgba(150,50,30,0.6)' : 'rgba(214,150,70,0.55)'; c.fill();
    }
    // a few big, readable pieces in the gaps of the star: raisins, glacé cherries, candied peel, sultanas
    // raisins: lumpy and wrinkled (smooth dark ovals would read as olives)
    const raisin = (x, y, s, rot) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      blobPath(c, 0.01 * r, 0.02 * r, s, R, 7, 0.4); c.fillStyle = 'rgba(50,8,0,0.4)'; c.fill();
      blobPath(c, 0, 0, s, R, 7, 0.4); c.fillStyle = '#3e1420'; c.fill();
      blobPath(c, -s * 0.15, -s * 0.2, s * 0.6, R, 6, 0.35); c.fillStyle = 'rgba(120,56,62,0.8)'; c.fill();
      circ(c, -s * 0.3, -s * 0.35, s * 0.16); c.fillStyle = 'rgba(255,225,215,0.6)'; c.fill();
      c.restore();
    };
    const cherry = (x, y, s) => {
      x *= r; y *= r; s *= r;
      circ(c, x + 0.012 * r, y + 0.022 * r, s); c.fillStyle = 'rgba(50,8,0,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.35, y - s * 0.35, 0, x, y, s, [[0, '#ff9a9a'], [0.45, '#ec2a42'], [1, '#a00e22']]); c.fill();
      c.strokeStyle = '#7a0818'; c.lineWidth = 0.016 * r; c.stroke();
      ell(c, x - s * 0.35, y - s * 0.38, s * 0.32, s * 0.2, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
    };
    const peel = (x, y, s, rot, col = ['#ffb84e', '#f2801e', '#b44e0a']) => {
      c.save(); c.translate(x * r, y * r); c.rotate(rot); s *= r;
      c.fillStyle = 'rgba(50,8,0,0.35)'; c.beginPath(); c.roundRect(-s + 0.01 * r, -s * 0.7 + 0.02 * r, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.fillStyle = lg(c, 0, -s * 0.7, 0, s * 0.7, [[0, col[0]], [0.5, col[1]], [1, col[2]]]); c.beginPath(); c.roundRect(-s, -s * 0.7, 2 * s, 1.4 * s, s * 0.35); c.fill();
      c.strokeStyle = col[2]; c.lineWidth = 0.014 * r; c.stroke();
      c.fillStyle = 'rgba(255,250,220,0.7)'; c.fillRect(-s * 0.7, -s * 0.5, s * 0.8, s * 0.22);
      c.restore();
    };
    const SULTANA = ['#f4c662', '#cc8a2c', '#7e4c10'];
    // gaps open towards -54°, 18°, 90°, 162°, 234°: raisins up top and at the bottom, bright fruit beside the face
    raisin(0.36, -0.47, 0.07, 0.6); peel(0.5, -0.3, 0.05, -0.4, SULTANA);
    cherry(0.53, 0.12, 0.075); peel(0.44, 0.33, 0.05, -0.5);
    raisin(-0.06, 0.53, 0.07, 0.2); cherry(0.14, 0.55, 0.05);
    peel(-0.52, 0.14, 0.055, 0.3); cherry(-0.44, 0.34, 0.05);
    cherry(-0.43, -0.4, 0.065); raisin(-0.22, -0.55, 0.06, -0.4);
    // syrup gloss
    for (const [a0, a1, d] of [[-2.85, -2.5, 0.6], [-1.85, -1.55, 0.62], [2.55, 2.85, 0.58]]) {
      c.strokeStyle = 'rgba(255,225,200,0.25)'; c.lineWidth = 0.035 * r; c.beginPath(); c.arc(0, 0, d * r, a0, a1); c.stroke();
    }
    // the rim casts a thin shadow onto the filling
    c.strokeStyle = 'rgba(40,8,0,0.35)'; c.lineWidth = 0.05 * r; circ(c, 0.008 * r, 0.018 * r, RIN * r); c.stroke();
    c.restore();
    // pastry lip: a light inner edge against the filling
    c.strokeStyle = 'rgba(110,45,12,0.75)'; c.lineWidth = 0.025 * r; circ(c, 0, 0, RIN * r); c.stroke();
    c.strokeStyle = '#fbe3b0'; c.lineWidth = 0.04 * r; circ(c, 0, 0, (RIN + 0.03) * r); c.stroke();
    c.strokeStyle = 'rgba(255,255,240,0.7)'; c.lineWidth = 0.02 * r; c.beginPath(); c.arc(0, 0, (RIN + 0.025) * r, 2.6, 5.0); c.stroke();
    // ── star-shaped pastry lid ──
    const S = this.star(r, 0.66, 0.3);
    c.save(); c.translate(0.025 * r, 0.045 * r); c.fillStyle = 'rgba(50,8,0,0.5)'; c.fill(S); c.restore();
    c.fillStyle = rg(c, -0.16 * r, -0.2 * r, 0, 0, 0, 0.66 * r, [[0, '#fde6b6'], [0.45, '#f3c47c'], [0.8, '#e2a258'], [1, '#cf8a40']]); c.fill(S);
    c.save(); c.clip(S);
    c.strokeStyle = 'rgba(170,88,26,0.3)'; c.lineWidth = 0.16 * r; c.stroke(S);
    c.strokeStyle = 'rgba(170,88,26,0.4)'; c.lineWidth = 0.07 * r; c.stroke(S);
    c.save(); c.translate(0.02 * r, 0.03 * r); c.strokeStyle = 'rgba(255,240,205,0.55)'; c.lineWidth = 0.035 * r; c.stroke(S); c.restore();
    speckle(c, R, 20, inDisc(0.5 * r), R => `rgba(160,85,30,${0.12 + R() * 0.18})`, r * 0.01, r * 0.018);
    // icing sugar: a soft dusting on the lid only
    for (const [x, y, s, a] of [[-0.1, -0.1, 0.42, 0.5], [0.22, 0.16, 0.3, 0.38], [0.02, -0.42, 0.22, 0.44], [-0.42, -0.12, 0.22, 0.4], [0.42, -0.12, 0.18, 0.3], [-0.22, 0.38, 0.2, 0.3], [0.24, 0.42, 0.16, 0.26]]) {
      c.fillStyle = rg(c, x * r, y * r, 0, x * r, y * r, s * r, [[0, `rgba(255,255,255,${a})`], [0.55, `rgba(255,255,255,${a * 0.55})`], [1, 'rgba(255,255,255,0)']]); circ(c, x * r, y * r, s * r); c.fill();
    }
    speckle(c, R, 90, inDisc(0.6 * r), R => `rgba(255,255,255,${0.4 + R() * 0.4})`, r * 0.005, r * 0.011);
    c.restore();
    c.strokeStyle = 'rgba(100,42,8,0.9)'; c.lineWidth = 0.035 * r; c.lineJoin = 'round'; c.stroke(S);
    ell(c, -0.04 * r, -0.4 * r, 0.07 * r, 0.026 * r, -1.25); c.fillStyle = 'rgba(255,255,240,0.6)'; c.fill();
  },
};

// 6 ─ GINGERBREAD MAN (a squat, chubby "chibi" iced gingerbread man)
FESTIVE_TIERS[6] = {
  key: 'gingerbread', name: 'Gingerbread Man', plural: 'Gingerbread men', r: 50, outline: '#5f2f10',
  // k: drawing scale; the collision area (the hull of the whole figure) equals the classic Pretzel's.
  // inertiaK: the Pretzel is built from two parts, for which Matter computes a lower rotational inertia than for
  // one solid piece of the same size; this factor gives the man the Pretzel's, so he turns and tips like it.
  k: 1.1756, inertiaK: 0.634,
  // The visible figure is four convex parts (units of the drawing radius): head; arms + shoulders + belly (one part);
  // two short fat legs (hip disc → foot disc). It is squat (≈1.3 : 1) and fills ≈90 % of its own convex hull, so the
  // collision is ONE convex part — the hull — and the few slivers between figure and hull stay small and transparent.
  head: [0, -0.31, 0.47], hand: [0.77, -0.09, 0.235], shoulder: [0, -0.15, 0.4], belly: [0, 0.11, 0.52], hip: [0.335, 0.33, 0.29], foot: [0.385, 0.485, 0.21],
  figurePath(r) { return this.union(r).path; },   // what is painted: effects over the piece (golden sweep, danger tint) keep to it
  figure(r) {
    const [hx, hy, hr] = this.head, [ax, ay, ar] = this.hand, [, sy, sr] = this.shoulder, [, by, br] = this.belly, [px, py, pr] = this.hip, [fx, fy, fr] = this.foot;
    const C = (x, y, d, n = 32) => ptsCircle(d * r, n, x * r, y * r);
    return [C(hx, hy, hr, 48), [...C(-ax, ay, ar), ...C(ax, ay, ar), ...C(0, sy, sr, 40), ...C(0, by, br, 48)], [...C(-px, py, pr), ...C(-fx, fy, fr)], [...C(px, py, pr), ...C(fx, fy, fr)]];
  },
  shape(r) { return [[].concat(...this.figure(r))]; },   // one convex part: the engine takes the hull of all the figure's points
  face: { x: 0, y: -0.29, s: 0.46 },
  crumbs: ['#c98646', '#8c4a1e', '#ffffff', '#e8334a', '#3fae5a'],
  noShade: true,   // the engine would shade the hull; paint() shades along the figure's true outline instead
  // the outer contour of the union of the figure's parts, as one closed loop (so overlaps never show seams)
  union(r) {
    if (this._u && this._u.r === r) return this._u;
    const hulls = this.figure(r).map(convexHull);
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
    const U = this.union(r);
    // the collision hull is bigger than the figure: paint only the figure, the slivers around it stay transparent
    c.save(); c.clip(U.path);
    // ── biscuit ──
    c.fillStyle = lg(c, 0, -0.85 * r, 0, 0.75 * r, [[0, '#dc9a55'], [0.5, '#c67d3d'], [1, '#a9612a']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // baked, darker rim: soft bands along the true outline
    c.lineJoin = 'round';
    for (const [w, a] of [[0.4, 0.07], [0.28, 0.08], [0.19, 0.1], [0.11, 0.12]]) { c.lineWidth = w * r; c.strokeStyle = `rgba(120,55,15,${a})`; c.stroke(U.path); }
    // puffy highlights: head, arms, belly, legs
    const glow = (x, y, rx, ry, rot, a) => { c.save(); c.translate(x * r, y * r); c.rotate(rot); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(255,214,150,${a})`], [1, 'rgba(255,214,150,0)']]); c.fillRect(-rx * r, -rx * r, 2 * rx * r, 2 * rx * r); c.restore(); };
    glow(-0.12, -0.5, 0.36, 0.26, -0.4, 0.55);
    glow(-0.6, -0.17, 0.28, 0.13, -0.08, 0.45); glow(0.6, -0.17, 0.28, 0.13, 0.08, 0.4);
    glow(-0.36, 0.42, 0.16, 0.12, 0.3, 0.32); glow(0.36, 0.42, 0.16, 0.12, -0.3, 0.28);
    glow(-0.05, 0.3, 0.24, 0.16, 0, 0.28);
    // baked texture
    const inU = R => { for (let k = 0; k < 20; k++) { const x = (R() * 2 - 1) * 1.0 * r, y = lerp(-0.8, 0.72, R()) * r; if (U.inside(x, y, 0.05 * r)) return { x, y }; } return null; };
    speckle(c, R, 70, inU, R => `rgba(110,48,12,${0.12 + R() * 0.18})`, r * 0.008, r * 0.02);
    speckle(c, R, 30, inU, R => `rgba(255,226,170,${0.15 + R() * 0.2})`, r * 0.008, r * 0.016);
    // ── creases that draw the head, arms and legs inside the squat silhouette (dark line + light line) ──
    const crease = (pts, lx, ly, a = 0.6) => {
      const line = spline(pts.map(([x, y]) => ({ x: x * r, y: y * r })), 10);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(lx * r, ly * r); c.strokeStyle = 'rgba(255,222,168,0.42)'; c.lineWidth = 0.03 * r; strokePts(c, line); c.restore();
      c.strokeStyle = `rgba(95,47,16,${a})`; c.lineWidth = 0.034 * r; strokePts(c, line);
    };
    { const [hx, hy] = this.head, chin = []; for (let i = 0; i <= 8; i++) { const a = lerp(0.68, Math.PI - 0.68, i / 8); chin.push([hx + Math.cos(a) * 0.41, hy + Math.sin(a) * 0.41]); } crease(chin, 0, -0.016, 0.5); }
    for (const s of [-1, 1]) {
      crease([[s * 0.6, 0.2], [s * 0.52, 0.18], [s * 0.44, 0.14]], 0, -0.016, 0.5);                // under the arm
      crease([[s * 0.17, 0.62], [s * 0.13, 0.51], [s * 0.15, 0.4], [s * 0.21, 0.32]], s * 0.016, 0);    // inner side of the leg
    }
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
      squiggle(s * 0.61, -0.08, Math.PI / 2 + s * 0.1, 0.19, 0.045, 3);
      squiggle(s * 0.38, 0.485, s * -0.12, 0.155, 0.042, 3);
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
    gumdrop(0, 0.285, 0.074, '#36b15a', '#165f2c', '#b4f5c0');
    gumdrop(0, 0.46, 0.074, '#e8334a', '#8e0f22', '#ffb0b8');
    // ── bow tie under the chin ──
    {
      const x = 0, y = 0.1 * r, w = 0.17 * r, h = 0.095 * r;
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
    c.restore();   // the figure clip
  },
  // contour along the figure, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const U = this.union(r); c.save(); c.clip(U.path); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(U.path); c.restore(); },
};

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

// 8 ─ STOLLEN (powdered-sugar Stollen loaf — same collision shape as the classic Bread)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#5a3010',
  top: r => x => -0.66 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.2)), 1 / 2.2),
  bot: r => x => 0.5 * r * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x / r), 2.5)), 1 / 2.5),
  shape(r) {
    const pts = [], top = this.top(r), bot = this.bot(r);
    for (let i = 0; i <= 120; i++) { const x = lerp(-1, 1, i / 120) * r; pts.push({ x, y: top(x) }, { x, y: bot(x) }); }
    return [pts];
  },
  face: { x: 0.32, y: 0.28, s: 0.34 },
  crumbs: ['#ffffff', '#f7deb0', '#c98646', '#e8334a'],
  // The cut end (left) is the loaf's cross-section, facing left and a little toward us. Its boundary with the
  // side of the loaf is the front half of the loaf's profile, so it bulges to the right where the loaf is thickest.
  cutX: r => y => (-0.44 + 0.15 * Math.sqrt(Math.max(0, 1 - Math.pow((y / r + 0.06) / 0.6, 2)))) * r,
  paint(c, r, R) {
    const top = this.top(r), bot = this.bot(r), cutX = this.cutX(r);
    const at = (x, k) => lerp(top(x), bot(x), k);                         // a line along the loaf, k = 0 top … 1 bottom
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── golden-brown baked crust, darker toward the bottom where it sits ──
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.5 * r, [[0, '#f0b664'], [0.5, '#d88e3c'], [0.78, '#b0641f'], [1, '#6e3810']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(80,35,5,0.35)'], [0.25, 'rgba(80,35,5,0)'], [0.8, 'rgba(80,35,5,0)'], [1, 'rgba(80,35,5,0.4)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 90, R => ({ x: (R() * 2 - 1) * r, y: lerp(0.0, 0.5, R()) * r }), R => `rgba(95,40,8,${0.15 + R() * 0.2})`, r * 0.006, r * 0.015);

    // ── powdered sugar: a thick, matte, uneven blanket on top that thins out into a dusting over the crust ──
    const k0 = x => 0.47 + 0.035 * Math.sin(x / r * 4.3 + 1.2) + 0.02 * Math.sin(x / r * 9.7 + 0.4);   // where the blanket stops being solid
    const band = 0.2;                                                                                   // depth of the dusted fade (in k)
    const region = k => { const p = new Path2D(); p.moveTo(-1.2 * r, -r); for (let i = 0; i <= 120; i++) { const x = lerp(-1.05, 1.05, i / 120) * r; p.lineTo(x, at(x, k(x))); } p.lineTo(1.2 * r, -r); p.closePath(); return p; };
    const blanket = region(k0);
    c.save(); c.clip(blanket);
    c.fillStyle = lg(c, 0, -0.66 * r, 0, 0.1 * r, [[0, '#ffffff'], [0.45, '#fdfcfa'], [1, '#ece8e8']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // matte, cool shading: the right end turns away, soft hollows in the uneven coat
    c.fillStyle = lg(c, 0.4 * r, 0, r, 0, [[0, 'rgba(130,130,160,0)'], [1, 'rgba(130,130,160,0.32)']]); c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    for (const [xu, ku, s] of [[-0.05, 0.22, 0.2], [0.42, 0.14, 0.18], [0.7, 0.3, 0.16], [0.15, 0.36, 0.17]]) {
      const x = xu * r, y = at(x, ku);
      c.fillStyle = rg(c, x + 0.04 * r, y + 0.03 * r, 0, x + 0.04 * r, y + 0.03 * r, s * r, [[0, 'rgba(140,140,170,0.13)'], [1, 'rgba(140,140,170,0)']]);
      c.fillRect(x - s * r, y - s * r, 2 * s * r + 0.1 * r, 2 * s * r + 0.1 * r);
    }
    // the Stollen's ridge: one soft fold running along the loaf (a matte groove, no shine)
    { const fold = []; for (let i = 0; i <= 40; i++) { const x = lerp(-0.4, 0.9, i / 40) * r; fold.push({ x, y: at(x, 0.32) + 0.012 * r * Math.sin(x / r * 5) }); }
      const fade = al => lg(c, -0.4 * r, 0, 0.9 * r, 0, [[0, `rgba(125,120,150,0)`], [0.2, `rgba(125,120,150,${al})`], [0.8, `rgba(125,120,150,${al})`], [1, `rgba(125,120,150,0)`]]);
      for (let j = 0; j < 14; j++) { c.save(); c.translate(0, (j * 0.009) * r); c.strokeStyle = fade(0.11 * (1 - j / 14)); c.lineWidth = 0.03 * r; strokePts(c, fold); c.restore(); }
      c.strokeStyle = fade(0.38); c.lineWidth = 0.022 * r; strokePts(c, fold); }
    // raisins peeking through, half buried in powder
    for (const [xu, ku, s] of [[0.66, 0.42, 0.06], [0.05, 0.47, 0.055], [-0.18, 0.18, 0.05], [0.4, 0.14, 0.05], [0.86, 0.36, 0.045]]) {
      const X = xu * r, Y = at(X, ku), S = s * r;
      c.save(); c.translate(X, Y); c.rotate(R() * Math.PI); c.scale(1.2, 0.8);
      blobPath(c, 0, 0, S, R, 6, 0.45); c.fillStyle = '#3a140c'; c.fill();
      c.strokeStyle = 'rgba(150,85,75,0.8)'; c.lineWidth = 0.014 * r; c.beginPath(); c.moveTo(-S * 0.55, -S * 0.1); c.quadraticCurveTo(0, -S * 0.5, S * 0.5, -S * 0.05); c.stroke();
      c.restore();
      speckle(c, R, 9, R => { const p = inDisc(S * 0.9)(R); return { x: X + p.x, y: Y + p.y - S * 0.25 }; }, R => `rgba(255,255,255,${0.6 + R() * 0.4})`, r * 0.006, r * 0.012);
    }
    // dry powder grain
    speckle(c, R, 260, R => ({ x: (R() * 2 - 1) * r, y: lerp(-0.66, 0.15, R()) * r }), R => (R() < 0.5 ? `rgba(255,255,255,${0.6 + R() * 0.4})` : `rgba(165,160,180,${0.1 + R() * 0.12})`), r * 0.005, r * 0.012);
    c.restore();
    // the dusted fade: stacked thin veils of sugar, then stippled powder, densest near the blanket
    { const fadeBand = new Path2D(); fadeBand.moveTo(-1.2 * r, at(-1.05 * r, k0(-1.05 * r)));
      for (let i = 0; i <= 120; i++) { const x = lerp(-1.05, 1.05, i / 120) * r; fadeBand.lineTo(x, at(x, k0(x)) - 0.004 * r); }
      for (let i = 120; i >= 0; i--) { const x = lerp(-1.05, 1.05, i / 120) * r; fadeBand.lineTo(x, at(x, k0(x) + band + 0.02)); }
      fadeBand.closePath();
      c.save(); c.clip(fadeBand);
      for (let j = 1; j <= 12; j++) { c.fillStyle = 'rgba(255,255,255,0.075)'; c.fill(region(x => k0(x) + band * j / 12)); }
      c.restore(); }
    speckle(c, R, 800, R => { const x = (R() * 2 - 1) * r; return { x, y: at(x, k0(x) - 0.01 + (band + 0.03) * Math.pow(R(), 1.8)) }; }, R => `rgba(255,255,255,${0.45 + R() * 0.5})`, r * 0.003, r * 0.009);
    // contact shadow along the bottom
    c.fillStyle = lg(c, 0, 0.3 * r, 0, 0.52 * r, [[0, 'rgba(60,25,0,0)'], [1, 'rgba(60,25,0,0.5)']]); c.fillRect(-2 * r, 0.3 * r, 4 * r, r);

    // ── the cut end: the end face of a solid loaf, turned away from the top light ──
    const edgePts = []; for (let i = 0; i <= 60; i++) { const y = lerp(-0.8, 0.62, i / 60) * r; edgePts.push({ x: cutX(y), y }); }
    const cut = new Path2D(); cut.moveTo(-1.3 * r, -0.8 * r); for (const p of edgePts) cut.lineTo(p.x, p.y); cut.lineTo(-1.3 * r, 0.62 * r); cut.closePath();
    c.save(); c.clip(cut);
    // its own warmer, slightly darker light: brightest top-left, deepening toward the bottom and the edge
    c.fillStyle = rg(c, -0.74 * r, -0.22 * r, 0, -0.62 * r, -0.05 * r, 0.72 * r, [[0, '#f8d88e'], [0.5, '#eab868'], [1, '#c98a3c']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 60, R => ({ x: lerp(-1, -0.3, R()) * r, y: lerp(-0.55, 0.45, R()) * r }), R => (R() < 0.7 ? `rgba(185,120,40,${0.3 + R() * 0.3})` : 'rgba(255,245,215,0.7)'), r * 0.01, r * 0.024);
    // a few big, bold pieces of fruit: raisins, candied orange peel, green citron
    const bits = [[-0.6, -0.24, 'o', 0.11], [-0.4, -0.06, 'r', 0.11], [-0.78, 0.06, 'r', 0.1], [-0.55, 0.22, 'g', 0.1], [-0.36, 0.3, 'o', 0.085]];
    for (const [xu, yu, k, su] of bits) {
      const X = xu * r, Y = yu * r, S = su * r;
      if (k === 'r') {
        blobPath(c, X + 0.012 * r, Y + 0.016 * r, S, R, 6, 0.35); c.fillStyle = 'rgba(120,60,10,0.35)'; c.fill();
        blobPath(c, X, Y, S, R, 6, 0.35); c.fillStyle = '#2e0e08'; c.fill();
        c.strokeStyle = 'rgba(140,70,60,0.85)'; c.lineWidth = 0.02 * r; c.beginPath(); c.moveTo(X - S * 0.5, Y - S * 0.15); c.quadraticCurveTo(X, Y - S * 0.55, X + S * 0.45, Y - S * 0.1); c.stroke();
      } else {
        c.save(); c.translate(X, Y); c.rotate((R() - 0.5) * 1.0);
        c.beginPath(); c.roundRect(-S * 0.85 + 0.012 * r, -S * 0.7 + 0.016 * r, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = 'rgba(120,60,10,0.35)'; c.fill();
        c.beginPath(); c.roundRect(-S * 0.85, -S * 0.7, S * 1.7, S * 1.4, S * 0.25); c.fillStyle = k === 'o' ? '#ea6e10' : '#3f9a26'; c.fill();
        c.strokeStyle = k === 'o' ? 'rgba(115,40,0,0.75)' : 'rgba(25,65,5,0.75)'; c.lineWidth = 0.016 * r; c.stroke();
        c.beginPath(); c.roundRect(-S * 0.62, -S * 0.5, S * 1.24, S * 0.42, S * 0.2); c.fillStyle = k === 'o' ? 'rgba(255,195,110,0.9)' : 'rgba(180,230,120,0.9)'; c.fill();
        c.restore();
      }
    }
    // the loaf's skin in section: a crust ring all round the face, the sugar coat a thin white line on top of it
    c.strokeStyle = '#8a4614'; c.lineWidth = 0.255 * r; c.stroke(this.pathDesign);
    c.strokeStyle = '#c27a30'; c.lineWidth = 0.225 * r; c.stroke(this.pathDesign);
    c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r + 0.0 * r); c.clip();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.165 * r; c.stroke(this.pathDesign);
    c.restore();
    c.restore();
    // the ring continues along the edge where the end face meets the side of the loaf
    const inset = (d) => edgePts.map(p => ({ x: p.x - d * r, y: p.y }));
    c.save(); c.clip(cut);
    c.strokeStyle = '#8a4614'; c.lineWidth = 0.055 * r; strokePts(c, inset(0.022));
    c.strokeStyle = '#c27a30'; c.lineWidth = 0.032 * r; strokePts(c, inset(0.02));
    c.restore();
    // the edge itself: a crisp white line of sugar where the coat is cut (upper part), the crust's lip below it
    { const xe = cutX(-0.1 * r), ye = at(xe, k0(xe));
      c.save(); c.beginPath(); c.rect(-2 * r, -2 * r, 4 * r, 2 * r + ye); c.clip();
      c.strokeStyle = lg(c, 0, ye - 0.15 * r, 0, ye, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]); c.lineWidth = 0.028 * r; strokePts(c, edgePts);
      c.restore(); }
    c.strokeStyle = 'rgba(70,35,10,0.5)'; c.lineWidth = 0.012 * r; strokePts(c, inset(0.05));
  },
};

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

// 10 ─ GINGERBREAD HOUSE (gingerbread house: soft walls and a snowy roof)
FESTIVE_TIERS[10] = {
  key: 'house', name: 'Gingerbread House', r: 82, outline: '#5e300f',
  inertiaK: 1.11,   // two parts instead of the Wedding Cake's three: this gives the house the cake's rotational inertia (see the Gingerbread Man)
  // two soft convex parts (units of r): the walls [centreY, halfWidth, halfHeight] and the roof discs [x, y, radius]
  walls: [0.52, 0.69, 0.385], roof: [[0, -0.67, 0.12], [-0.75, 0.10, 0.12], [0.75, 0.10, 0.12]],
  shape(r) {
    const [cy, hw, hh] = this.walls, roof = [];
    for (const [x, y, d] of this.roof) roof.push(...ptsCircle(d * r, 40, x * r, y * r));
    return [ptsSuper(hw * r, hh * r, 3.4, 160, 0, cy * r), roof];
  },
  // the wall holds only the door and the face; the glowing window sits up in the gable
  face: { x: -0.22, y: 0.53, s: 0.32 },
  door: { x: 0.31, top: 0.4, hw: 0.145 },
  attic: { x: 0, y: -0.1, r: 0.125 },
  crumbs: ['#b8692e', '#ffffff', '#e8334a', '#2f9a55', '#ffd84a'],
  // The two parts overlap, so the engine's shading (an even-odd fill of frame + parts) would paint the overlap
  // black and its outline would draw the hidden wall top through the roof. This tier shades itself (noShade)
  // and strokes only the outer contour of the union (outlineFn).
  noShade: true,
  hulls(r) { return this.shape(r).map(convexHull); },
  // Sutherland–Hodgman: the part of convex polygon P inside convex polygon Q
  clipConvex(P, Q) {
    const s = Math.sign(polyArea(Q)) || 1;
    let out = P;
    for (let i = 0; i < Q.length && out.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length], side = p => s * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
      const src = out; out = [];
      for (let j = 0; j < src.length; j++) {
        const p = src[j], q = src[(j + 1) % src.length], dp = side(p), dq = side(q);
        if (dp >= 0) out.push(p);
        if ((dp >= 0) !== (dq >= 0)) { const t = dp / (dp - dq); out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }); }
      }
    }
    return out;
  },
  outlineFn(c, path, r, ow) {
    const H = this.hulls(r);
    c.lineWidth = ow * 2; c.strokeStyle = this.outline;
    for (let i = 0; i < H.length; i++) {
      c.save();
      const outside = new Path2D(); outside.rect(-4 * r, -4 * r, 8 * r, 8 * r);
      for (let j = 0; j < H.length; j++) if (j !== i) pathFromPts(outside, H[j]);
      c.clip(outside, 'evenodd');
      c.stroke(pathFromPts(new Path2D(), H[i]));
      c.restore();
    }
  },

  paint(c, r, R, T, pr) {
    pr = pr || (c.getTransform ? c.getTransform().a : 1) || 1;
    const [WP, FP] = this.hulls(r), roofPath = pathFromPts(new Path2D(), FP);
    const [wcyU, whwU, whhU] = this.walls, wcy = wcyU * r, whw = whwU * r, whh = whhU * r;
    const eaveY = (this.roof[1][1] + this.roof[1][2]) * r;      // underside of the roof
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── walls: deep ginger-brown gingerbread ──
    c.fillStyle = lg(c, 0, wcy - whh, 0, wcy + whh, [[0, '#c27434'], [0.45, '#a95f26'], [1, '#7c3f14']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, -whw, 0, whw, 0, [[0, 'rgba(90,38,6,0.32)'], [0.18, 'rgba(90,38,6,0)'], [0.82, 'rgba(90,38,6,0)'], [1, 'rgba(90,38,6,0.35)']]);
    c.fillRect(-whw, wcy - whh, 2 * whw, 2 * whh);
    speckle(c, R, 130, R => ({ x: (R() * 2 - 1) * whw, y: wcy + (R() * 2 - 1) * whh }), R => (R() < 0.7 ? `rgba(90,40,10,${0.2 + R() * 0.2})` : `rgba(255,215,160,${0.22 + R() * 0.2})`), r * 0.006, r * 0.014);
    // shadow under the eaves
    c.fillStyle = lg(c, 0, eaveY, 0, eaveY + 0.16 * r, [[0, 'rgba(60,22,3,0.5)'], [1, 'rgba(60,22,3,0)']]);
    c.fillRect(-r, eaveY - 0.1 * r, 2 * r, 0.26 * r);

    this.doorway(c, r);
    for (const s of [-1, 1]) this.cane(c, r, s * 0.585 * r, 0.22 * r, 0.95 * r, 0.075 * r);
    // snow bank along the foot of the walls
    const bankY = x => (0.8 - 0.022 * Math.cos(x * 9) - 0.015 * Math.sin(x * 23 + 1)) * r;
    c.beginPath(); c.moveTo(-r, 1.1 * r);
    for (let x = -1; x <= 1.0001; x += 0.02) c.lineTo(x * r, bankY(x));
    c.lineTo(r, 1.1 * r); c.closePath();
    c.fillStyle = 'rgba(60,22,3,0.4)'; c.save(); c.translate(0, -0.018 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, 0.77 * r, 0, 0.9 * r, [[0, '#ffffff'], [0.5, '#f4f6fd'], [1, '#cfd6ec']]); c.fill();

    // ── roof: brown gingerbread shingles, each piped with a line of icing; snow on top ──
    c.save(); c.clip(roofPath);
    c.fillStyle = lg(c, 0, -0.8 * r, 0, eaveY, [[0, '#7a3e1a'], [1, '#4e230b']]); c.fillRect(-r, -r, 2 * r, 1.3 * r);
    const rowH = 0.125 * r, sw = 0.17 * r;
    for (let row = 0, y = 0.115 * r; y > -0.5 * r; row++, y -= rowH) {
      for (let x = -r + (row % 2) * sw / 2; x < r; x += sw) {
        const lip = () => { c.moveTo(x + sw / 2, y - rowH * 0.45); c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45); };
        c.beginPath(); c.moveTo(x - sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 1.3); c.lineTo(x + sw / 2, y - rowH * 0.45);
        c.quadraticCurveTo(x + sw / 2, y + rowH * 0.05, x, y + rowH * 0.05); c.quadraticCurveTo(x - sw / 2, y + rowH * 0.05, x - sw / 2, y - rowH * 0.45); c.closePath();
        c.fillStyle = 'rgba(30,10,1,0.5)'; c.save(); c.translate(0, 0.02 * r); c.fill(); c.restore();
        c.fillStyle = lg(c, 0, y - rowH, 0, y, [[0, '#5a2a0f'], [0.6, '#8a4a20'], [1, '#a8622f']]); c.fill();
        c.beginPath(); lip(); c.strokeStyle = '#fff8ee'; c.lineWidth = 0.022 * r; c.stroke();
      }
    }
    // snow cap on the ridge
    const capLobes = [[-0.42, 0.09, 0.07], [-0.27, 0.08, 0.12], [-0.12, 0.09, 0.06], [0.03, 0.09, 0.13], [0.18, 0.08, 0.06], [0.32, 0.09, 0.11], [0.46, 0.08, 0.05]];
    const capY = x => { const u = x / r; let d = 0; for (const [cx, w, h] of capLobes) { const t = (u - cx) / w; if (Math.abs(t) < 1) d = Math.max(d, h * Math.sqrt(1 - t * t)); } return (-0.43 + d) * r; };
    const capPath = () => { c.beginPath(); c.moveTo(-r, -r); c.lineTo(r, -r); for (let x = r; x >= -r; x -= 0.01 * r) c.lineTo(x, capY(x)); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.025 * r); capPath(); c.fillStyle = 'rgba(30,10,1,0.5)'; c.fill(); c.restore();
    capPath(); c.fillStyle = lg(c, 0, -0.8 * r, 0, -0.3 * r, [[0, '#ffffff'], [0.6, '#fbfcff'], [1, '#e8ecf8']]); c.fill();
    c.save(); capPath(); c.clip();
    c.fillStyle = lg(c, -0.4 * r, 0, 0.4 * r, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(140,150,200,0.35)']]); c.fillRect(-r, -r, 2 * r, r);
    const capEdge = dy => { const p = []; for (let x = -r; x <= r; x += 0.01 * r) p.push({ x, y: capY(x) + dy }); return p; };
    c.strokeStyle = 'rgba(150,160,205,0.55)'; c.lineWidth = 0.055 * r; strokePts(c, capEdge(0));
    c.strokeStyle = 'rgba(150,162,210,0.4)'; c.lineWidth = 0.028 * r;
    c.beginPath(); c.moveTo(-0.2 * r, -0.56 * r); c.quadraticCurveTo(0, -0.64 * r, 0.18 * r, -0.57 * r); c.stroke();
    c.restore();
    this.atticWindow(c, r);
    c.restore();

    // eave: a thick rope of icing with big scalloped drips hanging over the walls
    const ey = eaveY - 0.055 * r;
    c.beginPath();
    c.moveTo(-r, ey - 0.05 * r); c.lineTo(r, ey - 0.05 * r); c.lineTo(r, ey + 0.04 * r);
    const N = 9;
    for (let i = N; i >= 0; i--) {
      // one drip between x0 and x2, its rounded tip at x1; lengths vary in a 3-step pattern
      const x0 = lerp(-0.9, 0.9, i / N) * r, x1 = lerp(-0.9, 0.9, (i - 0.5) / N) * r, x2 = lerp(-0.9, 0.9, (i - 1) / N) * r, L = (0.09 + 0.06 * ((i * 7) % 3) / 2) * r;
      c.lineTo(x0, ey + 0.04 * r);
      if (i > 0) {
        c.bezierCurveTo(x0 - 0.015 * r, ey + L, x1 + 0.065 * r, ey + L + 0.03 * r, x1, ey + L + 0.03 * r);
        c.bezierCurveTo(x1 - 0.065 * r, ey + L + 0.03 * r, x2 + 0.015 * r, ey + L, x2, ey + 0.04 * r);
      }
    }
    c.lineTo(-r, ey + 0.04 * r); c.closePath();
    c.fillStyle = 'rgba(50,16,1,0.45)'; c.save(); c.translate(0.008 * r, 0.022 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, ey - 0.05 * r, 0, ey + 0.18 * r, [[0, '#ffffff'], [0.6, '#f7f8ff'], [1, '#dde2f2']]); c.fill();
    c.strokeStyle = 'rgba(140,150,200,0.7)'; c.lineWidth = 0.016 * r; c.stroke();
    // three big candies on the eave: the bottom of the ladder decorates the top
    this.peppermint(c, r, -0.44 * r, ey + 0.005 * r, 0.085 * r, 0.3);
    this.gumdrop(c, r, 0, ey + 0.055 * r, 0.09 * r, '#2fae5a');
    this.peppermint(c, r, 0.44 * r, ey + 0.005 * r, 0.085 * r, 1.1);

    // ── self-shading (see noShade above) ──
    const I = this.clipConvex(WP, FP);
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); pathFromPts(frame, WP); pathFromPts(frame, FP); if (I.length > 2) pathFromPts(frame, I);
    c.save();
    c.shadowColor = 'rgba(60,22,0,0.38)'; c.shadowBlur = r * 0.32 * pr; c.shadowOffsetX = -r * 0.09 * pr; c.shadowOffsetY = -r * 0.14 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    const C = (T && T.C) || { x: 0, y: 0.2 * r };
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, C.x - 0.4 * r, C.y - 0.5 * r, 0, C.x - 0.2 * r, C.y - 0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
  },

  // round window in the gable, glowing warm yellow, in a piped icing frame
  atticWindow(c, r) {
    const A = this.attic, x = A.x * r, y = A.y * r, wr = A.r * r, fr = wr + 0.04 * r;
    circ(c, x, y, wr * 2.1); c.fillStyle = rg(c, x, y, wr * 0.8, x, y, wr * 2.1, [[0, 'rgba(255,200,90,0.45)'], [1, 'rgba(255,200,90,0)']]); c.fill();
    circ(c, x + 0.01 * r, y + 0.022 * r, fr); c.fillStyle = 'rgba(30,10,1,0.5)'; c.fill();
    circ(c, x, y, fr); c.fillStyle = '#fffaf2'; c.fill();
    circ(c, x, y, wr); c.fillStyle = rg(c, x - 0.02 * r, y + 0.02 * r, 0, x, y, wr, [[0, '#fffde6'], [0.45, '#ffe57e'], [0.85, '#f7b23c'], [1, '#e08824']]); c.fill();
    c.strokeStyle = '#6e3210'; c.lineWidth = 0.024 * r; c.stroke();
    c.save(); circ(c, x, y, wr); c.clip();
    const bars = () => { c.beginPath(); c.moveTo(x, y - wr); c.lineTo(x, y + wr); c.moveTo(x - wr, y); c.lineTo(x + wr, y); };
    c.save(); c.translate(0.006 * r, 0.01 * r); c.strokeStyle = 'rgba(150,70,10,0.55)'; c.lineWidth = 0.036 * r; bars(); c.stroke(); c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.032 * r; bars(); c.stroke();
    c.restore();
    // icing ring highlight and a little snowy sill
    c.strokeStyle = 'rgba(160,170,210,0.6)'; c.lineWidth = 0.012 * r; circ(c, x, y, fr - 0.004 * r); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 0.014 * r; c.beginPath(); c.arc(x, y, fr - 0.016 * r, Math.PI * 1.05, Math.PI * 1.55); c.stroke();
    const sy = y + wr + 0.03 * r;
    c.beginPath(); c.moveTo(x - wr - 0.06 * r, sy); c.quadraticCurveTo(x, sy - 0.05 * r, x + wr + 0.06 * r, sy);
    c.quadraticCurveTo(x + wr + 0.07 * r, sy + 0.045 * r, x + wr + 0.03 * r, sy + 0.045 * r); c.lineTo(x - wr - 0.03 * r, sy + 0.045 * r); c.quadraticCurveTo(x - wr - 0.07 * r, sy + 0.045 * r, x - wr - 0.06 * r, sy);
    c.fillStyle = 'rgba(30,10,1,0.45)'; c.save(); c.translate(0, 0.015 * r); c.fill(); c.restore();
    c.fillStyle = lg(c, 0, sy - 0.03 * r, 0, sy + 0.045 * r, [[0, '#ffffff'], [1, '#dfe4f2']]); c.fill();
  },

  doorway(c, r) {
    const D = this.door, x = D.x * r, top = D.top * r, hw = D.hw * r, bot = 1.0 * r, pad = 0.04 * r;
    const arch = p => { c.beginPath(); c.moveTo(x - hw - p, bot); c.lineTo(x - hw - p, top + hw); c.arc(x, top + hw, hw + p, Math.PI, 0); c.lineTo(x + hw + p, bot); c.closePath(); };
    c.save(); c.translate(0.012 * r, 0.02 * r); arch(pad); c.fillStyle = 'rgba(50,18,2,0.45)'; c.fill(); c.restore();
    arch(pad); c.fillStyle = '#fffaf2'; c.fill();
    arch(0); c.fillStyle = lg(c, x - hw, 0, x + hw, 0, [[0, '#3e1607'], [0.4, '#5e2510'], [1, '#331205']]); c.fill();
    c.save(); arch(0); c.clip();
    c.strokeStyle = 'rgba(20,6,1,0.5)'; c.lineWidth = 0.015 * r;
    for (const f of [-0.33, 0.33]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.strokeStyle = 'rgba(255,190,140,0.16)'; c.lineWidth = 0.01 * r;
    for (const f of [-0.28, 0.38]) { c.beginPath(); c.moveTo(x + f * hw, top); c.lineTo(x + f * hw, bot); c.stroke(); }
    c.restore();
    // piped icing dots around the frame
    for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI, px = x + Math.cos(a) * (hw + pad * 0.5), py = top + hw + Math.sin(a) * (hw + pad * 0.5); circ(c, px, py, 0.024 * r); c.fillStyle = '#ffffff'; c.fill(); }
    // wreath
    const wx = x, wy = top + hw + 0.03 * r, wr = 0.068 * r;
    c.strokeStyle = '#0f4a20'; c.lineWidth = 0.056 * r; circ(c, wx, wy, wr); c.stroke();
    c.strokeStyle = '#2c9a4a'; c.lineWidth = 0.038 * r; circ(c, wx, wy, wr); c.stroke();
    for (let i = 0; i < 3; i++) { const a = 0.6 + i * 2.1; circ(c, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, 0.019 * r); c.fillStyle = '#e8334a'; c.fill(); }
    c.fillStyle = '#e8334a'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(wx, wy + wr); c.lineTo(wx + s * 0.055 * r, wy + wr - 0.033 * r); c.lineTo(wx + s * 0.055 * r, wy + wr + 0.033 * r); c.closePath(); c.fill(); }
    // knob
    circ(c, x + hw * 0.6, top + 0.3 * r, 0.028 * r); c.fillStyle = rg(c, x + hw * 0.55, top + 0.29 * r, 0, x + hw * 0.6, top + 0.3 * r, 0.028 * r, [[0, '#fff3a0'], [1, '#d99a1e']]); c.fill();
  },

  // a candy-cane post at a corner of the walls
  cane(c, r, x, y0, y1, w) {
    const path = () => { c.beginPath(); c.moveTo(x - w / 2, y1); c.lineTo(x - w / 2, y0 + w / 2); c.arc(x, y0 + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w / 2, y1); c.closePath(); };
    c.save(); c.translate(0.01 * r, 0.015 * r); path(); c.fillStyle = 'rgba(50,18,2,0.4)'; c.fill(); c.restore();
    c.save(); path(); c.clip();
    c.fillStyle = '#fffaf6'; c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.fillStyle = '#e02a42';
    for (let t = y0 - w; t < y1 + w; t += w * 1.15) { c.beginPath(); c.moveTo(x - w, t + w * 0.55); c.lineTo(x + w, t - w * 0.55); c.lineTo(x + w, t - w * 0.05); c.lineTo(x - w, t + w * 1.05); c.closePath(); c.fill(); }
    c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, 'rgba(90,10,20,0.35)'], [0.35, 'rgba(255,255,255,0.35)'], [0.6, 'rgba(255,255,255,0)'], [1, 'rgba(90,10,20,0.4)']]);
    c.fillRect(x - w, y0 - w, 2 * w, y1 - y0 + 2 * w);
    c.restore();
    path(); c.strokeStyle = 'rgba(110,16,28,0.65)'; c.lineWidth = 0.013 * r; c.stroke();
  },

  peppermint(c, r, x, y, s, rot) {
    circ(c, x + 0.008 * r, y + 0.016 * r, s); c.fillStyle = 'rgba(50,12,4,0.4)'; c.fill();
    circ(c, x, y, s); c.fillStyle = '#ffffff'; c.fill();
    c.save(); circ(c, x, y, s); c.clip();
    c.fillStyle = '#e8334a';
    for (let i = 0; i < 6; i++) {
      const a = rot + (i / 6) * TAU, P = (ang, d) => [x + Math.cos(ang) * d, y + Math.sin(ang) * d];
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(...P(a + 0.55, s * 0.6), ...P(a, s * 1.2));
      c.lineTo(...P(a + 0.48, s * 1.2));
      c.quadraticCurveTo(...P(a + 0.95, s * 0.6), x, y);
      c.fill();
    }
    c.fillStyle = rg(c, x - s * 0.3, y - s * 0.35, 0, x, y, s, [[0, 'rgba(255,255,255,0.35)'], [0.7, 'rgba(255,255,255,0)'], [1, 'rgba(120,20,30,0.35)']]); c.fillRect(x - s, y - s, 2 * s, 2 * s);
    c.restore();
    circ(c, x, y, s); c.strokeStyle = '#a3182c'; c.lineWidth = 0.016 * r; c.stroke();
    ell(c, x - s * 0.38, y - s * 0.42, s * 0.28, s * 0.16, -0.6); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  },

  gumdrop(c, r, x, y, s, col) {
    // y = base line; s = half-width
    const dome = () => { c.beginPath(); c.moveTo(x - s, y); c.bezierCurveTo(x - s, y - s * 1.45, x + s, y - s * 1.45, x + s, y); c.quadraticCurveTo(x, y + s * 0.22, x - s, y); c.closePath(); };
    c.save(); c.translate(0.008 * r, 0.014 * r); dome(); c.fillStyle = 'rgba(50,12,4,0.4)'; c.fill(); c.restore();
    dome(); c.fillStyle = rg(c, x - s * 0.3, y - s * 0.8, 0, x, y - s * 0.4, s * 1.3, [[0, mix(col, '#ffffff', 0.55)], [0.5, col], [1, mix(col, '#000000', 0.45)]]); c.fill();
    c.strokeStyle = mix(col, '#000000', 0.55); c.lineWidth = 0.014 * r; c.stroke();
    for (const [dx, dy] of [[-0.4, -0.5], [0.2, -0.75], [0.5, -0.35], [-0.1, -0.25], [0.05, -0.55], [-0.55, -0.2], [0.35, -0.6]]) { circ(c, x + dx * s, y + dy * s, s * 0.08); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
    ell(c, x - s * 0.4, y - s * 0.7, s * 0.22, s * 0.13, -0.7); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
  },
};
