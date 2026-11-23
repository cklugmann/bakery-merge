'use strict';
// ═══════════════════════════════════════════════════════════════════
//  BAKERY MERGE — THE CHRISTMAS LADDER (festive mode, 23 November – 6 January)
//
//  Eleven Christmas bakes and treats that take the place of the classic pastries while festive
//  mode is on. Same rules, same sizes: every tier has the collision area of its classic
//  counterpart (within 3 %; the Peppermint and the Stollen the identical shape), so the game plays the same.
//
//  The other tiers have outlines of their own. Tiers 1 to 3, 5 to 7 and 9 are built the same way: the collision is ONE
//  convex hull around the painted figure; paint() clips to the figure itself and leaves the slivers
//  between figure and hull transparent; figurePath(r) hands that figure to the effects painted over a
//  piece (golden sweep, danger tint); noShade + own shading; outlineFn strokes the contour along the figure.
//  House rules for such a figure: it fills at least 85 % of its hull and no sliver is deeper than 6 units,
//  so that a neighbour resting on the hull never visibly hovers. `k` scales a tier to its target area.
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

// 1 ─ GINGERBREAD HEART (a thick Christmas-market gingerbread heart seen a little from above: two round lobes, a pointed tip, a white piped border)
FESTIVE_TIERS[1] = {
  key: 'heart', name: 'Gingerbread Heart', r: 19, outline: '#5a2810',
  k: 0.958,   // drawn 0.96 × its nominal r: the collision outline (the convex hull of the cookie) has the classic Macaron's area
  // The top face (units of the drawing radius): each side is one convex half, the hull of a lobe, a flank and the pointed
  // tip [x, y, radius]; a small fillet circle rounds the bottom of the deep cleft between the lobes. It is squashed to
  // `tilt` of its height because we look at the cookie a little from above, and below it the cookie's side wall shows,
  // `wall` deep: the outline is the top face swept down over the wall. The collision is ONE convex part, the hull of that
  // outline: the sliver over the cleft stays transparent (figurePath, noShade, outlineFn).
  lobe: [0.5, -0.36, 0.48], flank: [0.34, 0.12, 0.44], tip: [0, 0.88, 0.11], fillet: 0.06, tilt: 0.9, wall: 0.17,
  // the top face pulled in by d (units of r); memoised
  top(r, d = 0) {
    const key = 't' + r + '|' + d; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (d) {
      // every point moved in along its normal; where that would fold over itself (d beyond the local radius, at the tip)
      // the folded points are dropped and the little loop that remains is cut off where the line crosses itself
      const B = this.top(r), n = B.length, s = (polyArea(B) > 0 ? 1 : -1) * d * r;
      const Q = B.map((p, i) => { const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: p.x - ((b.y - a.y) / L) * s, y: p.y + ((b.x - a.x) / L) * s }; });
      P = Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; });
      const hit = (a, b, p, q) => {
        const ux = b.x - a.x, uy = b.y - a.y, vx = q.x - p.x, vy = q.y - p.y, den = ux * vy - uy * vx;
        if (Math.abs(den) < 1e-12) return null;
        const t = ((p.x - a.x) * vy - (p.y - a.y) * vx) / den, u = ((p.x - a.x) * uy - (p.y - a.y) * ux) / den;
        return t > 0 && t < 1 && u > 0 && u < 1 ? { x: a.x + t * ux, y: a.y + t * uy } : null;
      };
      for (let i = 0, m = P.length; i < m - 3; i++) for (let j = i + 2; j < Math.min(m - 1, i + m / 2); j++) {
        const x = hit(P[i], P[i + 1], P[j], P[j + 1]);
        if (x) { P = [...P.slice(0, i + 1), x, ...P.slice(j + 1)]; m = P.length; break; }
      }
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
        P.push({ x: dx * t, y: dy * t * this.tilt - (this.wall / 2) * r });
      }
    }
    return (this._m[key] = P);
  },
  // the whole cookie: rays from the centre, along each the farthest edge of the top face swept down over the wall
  pts(r) {
    const key = 'o' + r; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    const T0 = this.top(r), copies = []; for (let i = 0; i <= 8; i++) { const t = (this.wall * i * r) / 8; copies.push(T0.map(p => ({ x: p.x, y: p.y + t }))); }
    const P = [];
    for (let i = 0; i < 360; i++) {
      const a = -Math.PI / 2 + (i / 360) * TAU, dx = Math.cos(a), dy = Math.sin(a); let best = 0;
      for (const Q of copies) for (let k = 0; k < Q.length; k++) {
        const A = Q[k], B = Q[(k + 1) % Q.length], ex = B.x - A.x, ey = B.y - A.y, den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-12) continue;
        const t = (A.x * ey - A.y * ex) / den, u = (A.x * dy - A.y * dx) / den;
        if (t > best && u >= -1e-9 && u <= 1 + 1e-9) best = t;
      }
      P.push({ x: dx * best, y: dy * best });
    }
    return (this._m[key] = P);
  },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the cookie
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the cookie itself
  face: { x: 0, y: -0.03, s: 0.44 },
  crumbs: ['#c67d3d', '#8a4a1c', '#ffffff', '#e8334a'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r), top = pathFromPts(new Path2D(), this.top(r)), W = this.wall;
    const inFig = R => ({ x: (R() * 2 - 1) * r, y: lerp(-0.85, 0.95, R()) * r });
    c.save(); c.clip(fig);
    // ── the side wall: the top face swept down, light just under the edge, darkest where it meets the board ──
    for (let i = 20; i >= 0; i--) {
      const f = Math.pow(i / 20, 1.4);
      c.save(); c.translate(0, (W * i * r) / 20);
      c.fillStyle = `rgb(${Math.round(lerp(176, 104, f))},${Math.round(lerp(98, 50, f))},${Math.round(lerp(44, 18, f))})`; c.fill(top);
      c.restore();
    }
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(255,215,160,0.25)'], [0.45, 'rgba(255,215,160,0)'], [0.6, 'rgba(50,20,0,0)'], [1, 'rgba(50,20,0,0.3)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 50, inFig, R => `rgba(70,28,6,${0.3 + R() * 0.3})`, r * 0.012, r * 0.026);
    // ── the top face: the Gingerbread Man's warm gingerbread brown, lit from the top left ──
    c.save(); c.clip(top);
    c.fillStyle = lg(c, -0.5 * r, -0.85 * r, 0.4 * r, 0.8 * r, [[0, '#dc9a55'], [0.5, '#c67d3d'], [1, '#a9612a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.lineJoin = 'round';
    for (const [w, a] of [[0.3, 0.08], [0.16, 0.12]]) { c.lineWidth = w * r; c.strokeStyle = `rgba(120,55,15,${a})`; c.stroke(top); }   // the baked edge
    const glow = (x, y, rx, ry, rot, a) => { c.save(); c.translate(x * r, y * r); c.rotate(rot); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(255,214,150,${a})`], [1, 'rgba(255,214,150,0)']]); c.fillRect(-rx * r, -rx * r, 2 * rx * r, 2 * rx * r); c.restore(); };
    glow(-0.42, -0.45, 0.32, 0.22, -0.5, 0.45); glow(0.45, -0.45, 0.28, 0.2, 0.5, 0.3); glow(-0.05, 0.02, 0.4, 0.3, 0, 0.3);
    speckle(c, R, 40, inFig, R => `rgba(110,48,12,${0.12 + R() * 0.18})`, r * 0.012, r * 0.026);
    speckle(c, R, 16, inFig, R => `rgba(255,226,170,${0.15 + R() * 0.2})`, r * 0.01, r * 0.02);
    c.strokeStyle = 'rgba(255,220,165,0.5)'; c.lineWidth = 0.05 * r; c.stroke(top);   // its edge catches the light where it turns down into the wall
    c.restore();
    // ── the piped border: a solid line of white royal icing, small scallops along its inner side ──
    const outer = this.top(r, 0.14), inner = this.top(r, 0.26), sc = 0.05 * r, scal = [];
    const B = this.top(r), deep = p => B.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 0.24 * r);   // (not where the inset folded at the tip)
    const ring = this.top(r, 0.27);
    for (const p of resample(ring, Math.round(perimeter(ring) / (0.12 * r)))) if (deep(p) && !scal.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 0.09 * r)) scal.push(p);
    const pipe = new Path2D(); pathFromPts(pipe, outer); pathFromPts(pipe, inner.slice().reverse());
    for (const p of scal) { pipe.moveTo(p.x + sc, p.y); pipe.arc(p.x, p.y, sc, 0, TAU); }
    c.save(); c.translate(0.018 * r, 0.04 * r); c.fillStyle = 'rgba(80,30,5,0.5)'; c.fill(pipe); c.restore();
    c.fillStyle = rg(c, -0.3 * r, -0.4 * r, 0, 0, 0, 1.2 * r, [[0, '#ffffff'], [0.6, '#fdf9f2'], [1, '#e9dfd2']]); c.fill(pipe);
    c.save(); c.clip(pipe);
    c.strokeStyle = 'rgba(170,150,135,0.45)'; c.lineWidth = 0.035 * r; c.save(); c.translate(0.01 * r, 0.018 * r); c.stroke(pathFromPts(new Path2D(), inner)); c.restore();
    c.fillStyle = 'rgba(255,255,255,1)'; for (const p of scal) { circ(c, p.x - sc * 0.3, p.y - sc * 0.35, sc * 0.35); c.fill(); }
    c.restore();
    // (no sugar pearls: next to the live face two in the lobes read as a teddy bear's ears, one below it as a tongue)
    // ── volume (instead of the engine's shading, which would follow the hull) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(fig);
    c.shadowColor = 'rgba(60,22,0,0.34)'; c.shadowBlur = r * 0.3 * pr; c.shadowOffsetX = -r * 0.08 * pr; c.shadowOffsetY = -r * 0.12 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    c.restore();   // the cookie clip
  },
  // contour along the cookie, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const f = this.figurePath(r); c.save(); c.clip(f); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(f); c.restore(); },
};

// 2 ─ CINNAMON STAR (a thick Zimtstern seen a little from above: a glossy meringue top over a speckled cinnamon-almond side wall)
FESTIVE_TIERS[2] = {
  key: 'star', name: 'Cinnamon Star', r: 24, outline: '#5e2f10',
  k: 1.3184,   // drawn 1.32 × its nominal r: the collision outline (the convex hull of the cookie) has the classic Donut's area
  // The top face (units of the drawing radius): N points at Ro, inner corners at Ri, the points rounded with radius tipR,
  // the inner corners filled with radius cornerR, squashed to `tilt` of its height because we look at the cookie a little
  // from above. Below it the cookie's side wall shows, `wall` deep: the outline is the top face swept down over the wall.
  // The collision is ONE convex part, the hull of that outline: the shallow slivers between the points stay transparent
  // (figurePath, noShade, outlineFn).
  N: 5, Ro: 1, Ri: 0.56, tipR: 0.2, cornerR: 0.13, tilt: 0.88, wall: 0.18,
  // the outline of the top face moved down by t (units of r); memoised
  top(r, t = 0) {
    const key = 't' + r + '|' + t; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (t) P = this.top(r).map(p => ({ x: p.x, y: p.y + t * r }));
    else {
      const { N, Ro, Ri, tipR, cornerR, tilt, wall } = this, V = [];
      for (let k = 0; k < 2 * N; k++) { const a = -Math.PI / 2 + (k * Math.PI) / N, d0 = k % 2 ? Ri : Ro; V.push([Math.cos(a) * d0, Math.sin(a) * d0, k % 2 ? cornerR : tipR]); }
      P = [];
      V.forEach(([x1, y1, rad], i) => {   // every corner replaced by the arc of a circle that touches both of its edges
        const [x0, y0] = V[(i + V.length - 1) % V.length], [x2, y2] = V[(i + 1) % V.length];
        let ux = x0 - x1, uy = y0 - y1, L = Math.hypot(ux, uy); ux /= L; uy /= L;
        let vx = x2 - x1, vy = y2 - y1; L = Math.hypot(vx, vy); vx /= L; vy /= L;
        const ang = Math.acos(clamp(ux * vx + uy * vy, -1, 1)), t0 = rad / Math.tan(ang / 2), h = rad / Math.sin(ang / 2);
        let bx = ux + vx, by = uy + vy; L = Math.hypot(bx, by); bx /= L; by /= L;
        const cx = x1 + bx * h, cy = y1 + by * h;
        const a0 = Math.atan2(y1 + uy * t0 - cy, x1 + ux * t0 - cx), a1 = Math.atan2(y1 + vy * t0 - cy, x1 + vx * t0 - cx), da = ((a1 - a0 + 3 * Math.PI) % TAU) - Math.PI;
        for (let j = 0; j <= 10; j++) P.push({ x: (cx + Math.cos(a0 + (da * j) / 10) * rad) * r, y: ((cy + Math.sin(a0 + (da * j) / 10) * rad) * tilt - wall / 2) * r });
      });
    }
    return (this._m[key] = P);
  },
  // the whole cookie: rays from the centre (inside every copy of the top face), along each the farthest copy's edge
  pts(r) {
    const key = 'o' + r; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    const copies = []; for (let i = 0; i <= 8; i++) copies.push(this.top(r, (this.wall * i) / 8));
    const P = [];
    for (let i = 0; i < 360; i++) {
      const a = (i / 360) * TAU, dx = Math.cos(a), dy = Math.sin(a); let best = 0;
      for (const Q of copies) for (let k = 0; k < Q.length; k++) {
        const A = Q[k], B = Q[(k + 1) % Q.length], ex = B.x - A.x, ey = B.y - A.y, den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-12) continue;
        const t = (A.x * ey - A.y * ex) / den, u = (A.x * dy - A.y * dx) / den;
        if (t > best && u >= -1e-9 && u <= 1 + 1e-9) best = t;
      }
      P.push({ x: dx * best, y: dy * best });
    }
    return (this._m[key] = P);
  },
  // the meringue glaze on the top face: spread by hand, so its edge wanders and leaves an uneven rim of dough; memoised
  glaze(r) {
    const key = 'g' + r; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    const B = resample(this.top(r), 300), n = B.length, s = polyArea(B) > 0 ? 1 : -1;
    const Q = B.map((p, i) => {
      const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const e = s * r * (0.11 + 0.012 * Math.sin(i * 0.087 + 1) + 0.008 * Math.sin(i * 0.23) + 0.004 * Math.sin(i * 0.61 + 2));
      return { x: p.x - ((b.y - a.y) / L) * e, y: p.y + ((b.x - a.x) / L) * e };
    });
    return (this._m[key] = Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; }));
  },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the cookie
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the cookie itself
  face: { x: 0, y: -0.04, s: 0.44 },
  crumbs: ['#fff8ea', '#f1e2c6', '#b07440', '#7a4318'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r), top = pathFromPts(new Path2D(), this.top(r)), glaze = pathFromPts(new Path2D(), this.glaze(r)), W = this.wall;
    const inFig = R => ({ x: (R() * 2 - 1) * 1.05 * r, y: lerp(-1.0, 1.0, R()) * r });
    c.save(); c.clip(fig);
    // ── the side wall: the top face's outline swept down, light just under the edge, darkest where it meets the board ──
    for (let i = 24; i >= 0; i--) {
      const t = (W * i) / 24, f = Math.pow(i / 24, 1.4);
      c.fillStyle = `rgb(${Math.round(lerp(178, 118, f))},${Math.round(lerp(112, 64, f))},${Math.round(lerp(60, 28, f))})`;
      c.fill(pathFromPts(new Path2D(), this.top(r, t)));
    }
    // lit from the left: the walls facing left are paler, those facing right fall into shade
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(255,225,180,0.3)'], [0.45, 'rgba(255,225,180,0)'], [0.6, 'rgba(50,20,0,0)'], [1, 'rgba(50,20,0,0.32)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // almond and cinnamon specks in the dough
    speckle(c, R, 120, inFig, R => `rgba(70,30,6,${0.35 + R() * 0.35})`, r * 0.012, r * 0.028);
    speckle(c, R, 60, inFig, R => `rgba(255,228,180,${0.4 + R() * 0.35})`, r * 0.01, r * 0.022);
    // ── the top face: the same dough, lighter, under the glaze ──
    c.fillStyle = lg(c, -0.7 * r, -0.9 * r, 0.7 * r, 0.7 * r, [[0, '#e2ab70'], [0.5, '#c98c52'], [1, '#a9683a']]);
    c.fill(top);
    c.save(); c.clip(top);
    speckle(c, R, 70, inFig, R => `rgba(80,34,6,${0.3 + R() * 0.35})`, r * 0.012, r * 0.026);
    speckle(c, R, 30, inFig, R => `rgba(255,232,190,${0.4 + R() * 0.3})`, r * 0.01, r * 0.02);
    c.restore();
    // its edge catches the light where it turns down into the wall
    c.save(); c.clip(top); c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,226,180,0.5)'; c.lineWidth = 0.05 * r; c.stroke(top); c.restore();
    // ── the meringue glaze: thick and glossy, it stands proud and casts a soft shadow on the dough ──
    c.save(); c.shadowColor = 'rgba(60,25,5,0.65)'; c.shadowBlur = 0.07 * r * pr; c.shadowOffsetX = 0.02 * r * pr; c.shadowOffsetY = 0.05 * r * pr;
    c.fillStyle = '#f3e6cc'; c.fill(glaze); c.restore();
    c.save(); c.clip(glaze);
    // ivory, a little domed: lightest towards the light
    c.fillStyle = rg(c, -0.25 * r, -0.35 * r, 0, -0.05 * r, -0.1 * r, 0.95 * r, [[0, '#fffbf1'], [0.5, '#f9eed8'], [0.85, '#efdcbc'], [1, '#e2c99f']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    // toasted a little at the points
    for (let k = 0; k < this.N; k++) {
      const a = -Math.PI / 2 + (k * TAU) / this.N, x = Math.cos(a) * 0.84 * r, y = (Math.sin(a) * 0.84 * this.tilt - W / 2) * r;
      c.fillStyle = rg(c, x, y, 0, x, y, 0.36 * r, [[0, 'rgba(204,138,66,0.75)'], [0.55, 'rgba(218,162,95,0.3)'], [1, 'rgba(222,170,105,0)']]); c.fillRect(x - 0.36 * r, y - 0.36 * r, 0.72 * r, 0.72 * r);
    }
    // fine baking cracks in the meringue, out on the points (the middle stays calm for the face)
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < this.N; k++) {
      const a = -Math.PI / 2 + (k * TAU) / this.N + (R() - 0.5) * 0.5, d0 = lerp(0.42, 0.55, R()), pts = [];
      let x = Math.cos(a) * d0, y = Math.sin(a) * d0 * this.tilt - W / 2, dir = a + (R() - 0.5) * 1.2;
      for (let j = 0; j < 4; j++) { pts.push({ x: x * r, y: y * r }); dir += (R() - 0.5) * 1.4; const L = lerp(0.05, 0.08, R()); x += Math.cos(dir) * L; y += Math.sin(dir) * L * this.tilt; }
      pts.push({ x: x * r, y: y * r });
      c.save(); c.translate(0.008 * r, 0.014 * r); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.02 * r; strokePts(c, pts); c.restore();
      c.strokeStyle = 'rgba(165,115,62,0.45)'; c.lineWidth = 0.02 * r; strokePts(c, pts);
    }
    // the rounded lip: the glaze curves down into a soft shade on the lower right and catches the light on the upper left
    const rim = new Path2D(); rim.rect(-4 * r, -4 * r, 8 * r, 8 * r); rim.addPath(glaze);
    c.save(); c.shadowColor = 'rgba(150,98,45,0.6)'; c.shadowBlur = 0.12 * r * pr; c.shadowOffsetX = -0.035 * r * pr; c.shadowOffsetY = -0.06 * r * pr;
    c.fillStyle = '#000'; c.fill(rim, 'evenodd'); c.restore();
    c.save(); c.shadowColor = 'rgba(255,255,255,0.95)'; c.shadowBlur = 0.04 * r * pr; c.shadowOffsetX = 0.025 * r * pr; c.shadowOffsetY = 0.035 * r * pr;
    c.fillStyle = '#000'; c.fill(rim, 'evenodd'); c.restore();
    // a few air bubbles
    speckle(c, R, 14, R => { const p = inDisc(0.7 * r)(R); return { x: p.x, y: p.y * this.tilt - (W / 2) * r }; }, 'rgba(255,255,255,0.95)', r * 0.012, r * 0.022);
    // gloss: one strong streak along the upper-left points and a crisp glint
    c.save(); c.translate(-0.36 * r, -0.34 * r); c.rotate(-0.55); c.scale(1, 0.3);
    c.fillStyle = rg(c, 0, 0, 0, 0, 0, 0.34 * r, [[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-0.4 * r, -0.4 * r, 0.8 * r, 0.8 * r);
    c.restore();
    ell(c, -0.52 * r, -0.24 * r, 0.07 * r, 0.032 * r, -0.85); c.fillStyle = '#ffffff'; c.fill();
    ell(c, 0.05 * r, -0.72 * r, 0.035 * r, 0.02 * r, -1.2); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(140,90,40,0.45)'; c.lineWidth = 0.025 * r; c.stroke(glaze);
    // ── volume (instead of the engine's shading, which would follow the hull) ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(fig);
    c.shadowColor = 'rgba(60,24,0,0.35)'; c.shadowBlur = r * 0.3 * pr; c.shadowOffsetX = -r * 0.08 * pr; c.shadowOffsetY = -r * 0.12 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-r * 3, -r * 3, r * 6, r * 6);
    c.restore();
    c.restore();   // the cookie clip
  },
  // contour along the cookie, inside it only (the hull around it stays transparent)
  outlineFn(c, path, r, ow) { const f = this.figurePath(r); c.save(); c.clip(f); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(f); c.restore(); },
};

// 3 ─ TREE COOKIE (a thick sugar cookie cut out as a Christmas tree, seen a little from above: three plump branch tiers and a stout trunk, flooded with green icing)
FESTIVE_TIERS[3] = {
  key: 'tree', name: 'Tree Cookie', r: 29, outline: '#6e3a12',
  k: 0.9789,   // drawn 0.98 × its nominal r: the collision outline (the convex hull of the cookie) has 2.8 % more area than the classic Cupcake, because this compact cookie packs tighter (the same area would take up less room on the board)
  // The cutter (units of the drawing radius): three branch tiers, each a rounded triangle (the hull of a disc at its apex
  // and one at each branch tip), over a short, wide trunk (the hull of four small discs). The top face is the contour of
  // their union with the notches softly rounded, squashed to `tilt` of its height because we look at the cookie a little
  // from above; below it the cookie's side wall shows, `wall` deep (each part swept down is still convex, so the outline
  // is the contour of the swept parts). The collision is ONE convex part, the hull of that outline: the shallow notches
  // stay transparent (figurePath, noShade, outlineFn).
  tiers: [[-0.97, 0.17, 0.42, -0.38, 0.16], [-0.52, 0.1, 0.68, 0.21, 0.17], [0.0, 0.1, 0.9, 0.74, 0.18]],   // [apex y, apex radius, tip x, tip y, tip radius]
  trunk: [0.28, 0.6, 1.12, 0.08],   // [half width, top, bottom, corner radius]
  tilt: 0.9, wall: 0.15,
  ice: 0.16,   // the green icing stops this far inside the top face (units of r): a band of baked biscuit shows all round
  Y(y) { return y * this.tilt - this.wall / 2; },   // a height on the cutter → the same height on the (squashed, lifted) top face
  // the contour of the cutter's parts (swept down over the wall or not), notches softened
  contour(r, swept) {
    const C = (x, y, s) => ptsCircle(s * r, 40, x * r, y * r), [w, y0, y1, cr] = this.trunk;
    let parts = this.tiers.map(([ay, ar, tx, ty, tr]) => [...C(0, ay, ar), ...C(-tx, ty, tr), ...C(tx, ty, tr)]);
    parts.push([...C(-w + cr, y0 + cr, cr), ...C(w - cr, y0 + cr, cr), ...C(-w + cr, y1 - cr, cr), ...C(w - cr, y1 - cr, cr)]);
    parts = parts.map(P => { const Q = P.map(p => ({ x: p.x, y: p.y * this.tilt - (this.wall / 2) * r })); return convexHull(swept ? [...Q, ...Q.map(p => ({ x: p.x, y: p.y + this.wall * r }))] : Q); });
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
    return Q.map((_, i) => { let x = 0, y = 0; for (let k = -3; k <= 3; k++) { const q = Q[(i + k + n) % n]; x += q.x; y += q.y; } return { x: x / 7, y: y / 7 }; });
  },
  // the top face, pulled in by d (units of r); memoised
  top(r, d = 0) {
    const key = 't' + r + '|' + d; this._m = this._m || {};
    if (this._m[key]) return this._m[key];
    let P;
    if (d) {
      // every point moved in along its normal; where that would fold over itself (d beyond the local radius) it is dropped,
      // then the corners are softened again (the branch tips are rounder than the icing is wide)
      const B = this.top(r), n = B.length, s = (polyArea(B) > 0 ? 1 : -1) * d * r;
      const Q = B.map((p, i) => { const a = B[(i + n - 1) % n], b = B[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: p.x - ((b.y - a.y) / L) * s, y: p.y + ((b.x - a.x) / L) * s }; });
      const E = resample(Q.filter((q, i) => { const a = (i + n - 1) % n, b = (i + 1) % n; return (Q[b].x - Q[a].x) * (B[b].x - B[a].x) + (Q[b].y - Q[a].y) * (B[b].y - B[a].y) > 0; }), 400), m = E.length;
      P = E.map((_, i) => { let x = 0, y = 0; for (let k = -4; k <= 4; k++) { const q = E[(i + k + m) % m]; x += q.x; y += q.y; } return { x: x / 9, y: y / 9 }; });
    } else P = this.contour(r, false);
    return (this._m[key] = P);
  },
  // the whole cookie: the top face swept down over the wall; memoised
  pts(r) { const key = 'o' + r; this._m = this._m || {}; return this._m[key] || (this._m[key] = this.contour(r, true)); },
  shape(r) { return [this.pts(r)]; },   // one convex part: the engine takes the hull of the cookie
  figurePath(r) { return pathFromPts(new Path2D(), this.pts(r)); },
  noShade: true,   // the engine would shade the hull; paint() shades along the cookie itself
  face: { x: 0, y: 0.39, s: 0.5, blush: 'rgba(250,120,140,0.92)' },   // an opaque pink: the usual translucent blush turns olive on dark green
  crumbs: ['#2f9a55', '#8fd9a0', '#ffffff', '#e0a860', '#e8334a'],
  paint(c, r, R, T, pr = 1) {
    const fig = this.figurePath(r), top = pathFromPts(new Path2D(), this.top(r)), ice = pathFromPts(new Path2D(), this.top(r, this.ice));
    const W = this.wall, Y = y => this.Y(y) * r, [tw, , ty1] = this.trunk;
    const inFig = R => ({ x: (R() * 2 - 1) * 1.1 * r, y: lerp(-1.1, 1.1, R()) * r });
    c.save(); c.clip(fig);
    // ── the side wall: warm golden-brown baked dough, the top face swept down, darkest where it meets the board ──
    for (let i = 20; i >= 0; i--) {
      const f = Math.pow(i / 20, 1.4);
      c.save(); c.translate(0, (W * i * r) / 20);
      c.fillStyle = `rgb(${Math.round(lerp(214, 132, f))},${Math.round(lerp(146, 76, f))},${Math.round(lerp(78, 30, f))})`; c.fill(top);
      c.restore();
    }
    c.fillStyle = lg(c, -r, 0, r, 0, [[0, 'rgba(255,225,180,0.25)'], [0.45, 'rgba(255,225,180,0)'], [0.6, 'rgba(60,25,0,0)'], [1, 'rgba(60,25,0,0.3)']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 80, inFig, R => `rgba(110,50,12,${0.3 + R() * 0.3})`, r * 0.01, r * 0.022);
    // ── the top face: light golden sugar-cookie dough, clearly lighter than the dark contour line ──
    c.save(); c.clip(top);
    c.fillStyle = lg(c, -0.6 * r, -1.0 * r, 0.6 * r, 1.0 * r, [[0, '#f9d79e'], [0.5, '#efbd78'], [1, '#de9f58']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    speckle(c, R, 80, inFig, R => `rgba(150,78,22,${0.2 + R() * 0.25})`, r * 0.01, r * 0.022);
    c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,236,195,0.6)'; c.lineWidth = 0.05 * r; c.stroke(top);   // its edge catches the light where it turns down into the wall
    c.restore();
    // ── chocolate icing on the trunk ──
    const tY = (Y(this.tiers[2][3] + this.tiers[2][4]) / r - this.ice - 0.02), trunkIce = new Path2D(); trunkIce.roundRect(-tw * r, tY * r, 2 * tw * r, r, [0.1 * r, 0.1 * r, 0, 0]);
    const choc = pathFromPts(new Path2D(), this.top(r, 0.11));
    c.save(); c.clip(trunkIce);
    c.save(); c.translate(0.02 * r, 0.035 * r); c.fillStyle = 'rgba(110,50,10,0.4)'; c.fill(choc); c.restore();
    c.clip(choc);
    c.fillStyle = lg(c, -tw * r, 0, tw * r, 0, [[0, '#93552a'], [0.4, '#723a17'], [1, '#4a230a']]); c.fillRect(-tw * r, tY * r, 2 * tw * r, r);
    c.restore();
    // ── green icing, flooded almost to the edge (everything but the trunk): smooth, satin, standing a little proud ──
    const green = new Path2D(); green.rect(-3 * r, -3 * r, 6 * r, 6 * r); green.addPath(trunkIce);
    c.save(); c.clip(green, 'evenodd');
    c.save(); c.translate(0.02 * r, 0.035 * r); c.fillStyle = 'rgba(120,58,12,0.42)'; c.fill(ice); c.restore();
    c.save(); c.clip(ice);
    c.fillStyle = lg(c, -0.8 * r, -1.0 * r, 0.6 * r, 0.9 * r, [[0, '#4fb86b'], [0.35, '#2a9447'], [0.75, '#1c7639'], [1, '#13602d']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.save(); c.translate(-0.03 * r, -0.045 * r); c.strokeStyle = 'rgba(5,40,15,0.4)'; c.lineWidth = 0.09 * r; c.stroke(ice); c.restore();
    c.save(); c.translate(0.02 * r, 0.035 * r); c.strokeStyle = 'rgba(200,255,205,0.35)'; c.lineWidth = 0.045 * r; c.stroke(ice); c.restore();
    c.restore();
    c.save(); c.clip(ice); c.translate(0, 0.03 * r); c.strokeStyle = 'rgba(20,8,0,0.4)'; c.lineWidth = 0.045 * r; c.stroke(trunkIce); c.restore();
    c.strokeStyle = 'rgba(8,50,20,0.6)'; c.lineWidth = 0.025 * r; c.stroke(ice);
    c.restore();
    // ── one zigzag of matte white piped icing across the middle tier ──
    {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const x = lerp(-0.4, 0.44, i / 8); pts.push({ x: x * r, y: Y(lerp(-0.02, 0.1, i / 8) + (i % 2 ? 0.07 : -0.05)) }); }
      c.save(); c.clip(ice); c.lineCap = 'round'; c.lineJoin = 'round';
      c.save(); c.translate(0.012 * r, 0.03 * r); c.strokeStyle = 'rgba(5,40,15,0.45)'; c.lineWidth = 0.09 * r; strokePts(c, pts); c.restore();
      c.strokeStyle = '#e6dfd2'; c.lineWidth = 0.085 * r; strokePts(c, pts);
      c.strokeStyle = '#fbf8f1'; c.lineWidth = 0.06 * r; c.save(); c.translate(-0.006 * r, -0.01 * r); strokePts(c, pts); c.restore();
      c.restore();
    }
    // ── a few flat sugar pearls (matte, no glassy shine), none near the face ──
    const pearl = (x, y, s, col, dark) => {
      x *= r; y = Y(y); s *= r;
      circ(c, x + 0.012 * r, y + 0.028 * r, s); c.fillStyle = 'rgba(5,35,12,0.4)'; c.fill();
      circ(c, x, y, s); c.fillStyle = rg(c, x - s * 0.3, y - s * 0.35, 0, x, y, s * 1.05, [[0, col], [0.7, col], [1, dark]]); c.fill();
    };
    pearl(0.08, -0.52, 0.085, '#e8475c', '#a81c33');
    pearl(-0.3, -0.16, 0.085, '#fbe7a0', '#d0a13c');
    pearl(0.34, 0.26, 0.085, '#e8475c', '#a81c33');
    // ── a small yellow icing star on the top ──
    {
      const x = 0, y = Y(-0.84), R0 = 0.19 * r, R1 = 0.09 * r, pts = [];
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = k % 2 ? R1 : R0; pts.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * this.tilt }); }
      const path = new Path2D(), n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], f = i % 2 ? 0.12 : 0.22;
        const a = { x: lerp(p1.x, p0.x, f), y: lerp(p1.y, p0.y, f) }, b = { x: lerp(p1.x, p2.x, f), y: lerp(p1.y, p2.y, f) };
        i ? path.lineTo(a.x, a.y) : path.moveTo(a.x, a.y); path.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
      }
      path.closePath();
      c.save(); c.translate(0.015 * r, 0.03 * r); c.fillStyle = 'rgba(30,40,5,0.45)'; c.fill(path); c.restore();
      c.fillStyle = rg(c, x - 0.04 * r, y - 0.05 * r, 0, x, y, R0, [[0, '#ffe680'], [0.6, '#ffcc33'], [1, '#e8a417']]); c.fill(path);
      c.strokeStyle = '#a86a08'; c.lineWidth = 0.03 * r; c.lineJoin = 'round'; c.stroke(path);
    }
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
    c.restore();   // the cookie clip
  },
  // contour along the cookie, inside it only (the hull around it stays transparent)
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

// 5 ─ MINCE PIE (a homely little pie seen from the side, a little from above: plain pastry wall, hand-pinched crimp, sugar-dusted lid with steam slits)
FESTIVE_TIERS[5] = {
  key: 'mincepie', name: 'Mince Pie', plural: 'Mince pies', r: 41, outline: '#7a4316',
  k: 1.302,   // drawing scale: the collision area (the hull of the pie) equals the classic Cinnamon Roll's
  // the pie in units of its drawing radius
  rim: { cy: -0.2, rx: 0.85, ry: 0.3 },                      // the crimped rim runs along this ellipse
  // the crimp: hand-pinched waves of pastry of uneven length all round the rim (relative lengths, the first one at the front)
  waves: [1, 0.82, 1.14, 0.9, 1.06, 0.78, 1.1, 0.94, 1.02, 0.86, 1.12],
  lid: { cy: -0.2, rx: 0.76, ry: 0.3 },                      // the lid inside the rim
  wall: { y: -0.14, x: 0.9 },                                // the fluted case: its top corners, tucked under the rim …
  base: { cy: 0.4, rx: 0.72, ry: 0.22, n: 12, dip: 0.018 },  // … and its foot (n flutes all round, scalloped `dip` deep)
  // steam slits cut into the lid, red filling showing: [x, y, tilt (degrees), length] (units of r)
  slits: [[-0.4, -0.19, -22, 0.22], [-0.16, -0.29, 8, 0.22], [0.08, -0.17, 28, 0.2]],
  face: { x: 0, y: 0.36, s: 0.4 },
  crumbs: ['#f6d29b', '#e2a050', '#ffffff', '#9a1c1c', '#c97a34'],
  // The collision outline is the convex hull of the pie; the painted pie is a little smaller (the rim overhangs the
  // case, the crimp and the foot are scalloped), so paint() clips to the pie itself and shades along its outline.
  noShade: true,
  // a flute of the case: 1 on its crest, 0 in the groove between two flutes
  lobe(ph) { const u = ph * this.base.n / TAU + 0.5, t = u - Math.floor(u) - 0.5; return Math.sqrt(Math.max(0, 1 - 4 * t * t)); },
  // the crimp waves: [x, y, half length along the rim, half depth across it, tilt, angle round the rim] (units of r)
  lumps() {
    if (this._lumps) return this._lumps;
    const { cy, rx, ry } = this.rim, M = 1440, P = [], L = [0], f = this.waves, sum = f.reduce((a, b) => a + b, 0);
    for (let i = 0; i <= M; i++) {
      const t = Math.PI / 2 + (i / M) * TAU; P.push([Math.cos(t) * rx, cy + Math.sin(t) * ry, t]);
      if (i) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    }
    const out = []; let s = -f[0] / sum * L[M] / 2;
    for (const fk of f) {
      const len = (fk / sum) * L[M], goal = (s + len / 2 + L[M]) % L[M]; s += len;
      let j = 0; while (j < M && L[j + 1] < goal) j++;
      const [x, y, t] = P[j];
      out.push([x, y, len * 0.6, 0.085 + 0.03 * (fk - 0.78), Math.atan2(Math.cos(t) * ry, -Math.sin(t) * rx), t]);
    }
    return (this._lumps = out);
  },
  // the outline of the pie (every vertical line crosses it in one piece): top and bottom edge, x by x
  contour(r) {
    if (this._c && this._c.r === r) return this._c.pts;
    const E = (cx, cy, rx, ry) => x => { const u = (x - cx) / rx; if (Math.abs(u) > 1) return null; const d = ry * Math.sqrt(1 - u * u); return [cy - d, cy + d]; };
    const rotE = (cx, cy, rx, ry, rot) => x => {   // a tilted ellipse: solve for y
      const cs = Math.cos(rot), sn = Math.sin(rot), dx = x - cx;
      const A = sn * sn / (rx * rx) + cs * cs / (ry * ry), B = 2 * dx * cs * sn * (1 / (rx * rx) - 1 / (ry * ry)), C = dx * dx * (cs * cs / (rx * rx) + sn * sn / (ry * ry)) - 1;
      const D = B * B - 4 * A * C; if (D < 0) return null;
      const q = Math.sqrt(D); return [cy + (-B - q) / (2 * A), cy + (-B + q) / (2 * A)];
    };
    const w = this.wall, b = this.base;
    const wallPart = x => { const ax = Math.abs(x); if (ax > w.x) return null; return [w.y, ax <= b.rx ? b.cy : lerp(w.y, b.cy, (w.x - ax) / (w.x - b.rx))]; };
    const footPart = x => { const u = x / b.rx; if (Math.abs(u) > 1) return null; const ph = Math.asin(u); return [b.cy, b.cy + b.ry * Math.cos(ph) - b.dip * (1 - this.lobe(ph))]; };
    const parts = [...this.lumps().map(([x, y, hl, hr, rot]) => rotE(x, y, hl, hr, rot)), E(0, this.lid.cy, this.lid.rx, this.lid.ry), wallPart, footPart];
    const X1 = Math.max(...this.lumps().map(([x, , hl, hr, rot]) => Math.abs(x) + Math.hypot(hl * Math.cos(rot), hr * Math.sin(rot)))) - 1e-6, n = 300, top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const x = -X1 * Math.cos((i / n) * Math.PI); let a = Infinity, z = -Infinity;
      for (const p of parts) { const s = p(x); if (s) { if (s[0] < a) a = s[0]; if (s[1] > z) z = s[1]; } }
      if (a <= z) { top.push({ x: x * r, y: a * r }); bot.push({ x: x * r, y: z * r }); }
    }
    const pts = top.concat(bot.reverse());
    this._c = { r, pts, path: pathFromPts(new Path2D(), pts) };
    return pts;
  },
  shape(r) { return [this.contour(r)]; },   // one convex part: the engine takes the hull of the pie's outline
  figurePath(r) { this.contour(r); return this._c.path; },
  outlineFn(c, path, r, ow) { const F = this.figurePath(r); c.save(); c.clip(F); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(F); c.restore(); },
  paint(c, r, R, T, pr = 1) {
    const F = this.figurePath(r), w = this.wall, b = this.base, L = this.lid, M = this.rim;
    c.save(); c.clip(F);
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── a plain, hand-raised pastry wall: smooth, golden brown, a shade more baked than the lid, darker at the foot ──
    c.fillStyle = lg(c, -w.x * r, 0, w.x * r, 0, [[0, '#c17a34'], [0.14, '#dc9a4c'], [0.3, '#ebb466'], [0.46, '#e2a456'], [0.7, '#cf8a3e'], [0.88, '#bd7632'], [1, '#a8662a']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    c.fillStyle = lg(c, 0, 0.1 * r, 0, (b.cy + b.ry) * r, [[0, 'rgba(110,50,10,0)'], [0.6, 'rgba(110,50,10,0.12)'], [1, 'rgba(100,44,8,0.42)']]);
    c.fillRect(-2 * r, 0.1 * r, 4 * r, 2 * r);
    // two faint dents where it was pressed into shape by hand, and a baked speckle
    for (const [x, y, s] of [[-0.5, 0.36, 0.09], [0.52, 0.3, 0.08]]) {
      c.save(); c.translate(x * r, y * r); c.scale(0.6, 1);
      c.fillStyle = rg(c, 0.02 * r, 0.02 * r, 0, 0, 0, s * r, [[0, 'rgba(120,55,12,0.22)'], [1, 'rgba(120,55,12,0)']]); circ(c, 0, 0, s * r); c.fill();
      c.fillStyle = rg(c, -0.025 * r, -0.03 * r, 0, -0.025 * r, -0.03 * r, s * 0.7 * r, [[0, 'rgba(255,228,170,0.3)'], [1, 'rgba(255,228,170,0)']]); circ(c, -0.025 * r, -0.03 * r, s * 0.7 * r); c.fill();
      c.restore();
    }
    speckle(c, R, 45, R => ({ x: lerp(-0.85, 0.85, R()) * r, y: lerp(0.12, 0.62, R()) * r }), R => `rgba(140,62,14,${0.14 + R() * 0.2})`, 0.008 * r, 0.018 * r);
    // its foot, baked a little darker, following the outline
    const foot = a => ({ x: b.rx * Math.sin(a) * r, y: (b.cy + b.ry * Math.cos(a) - b.dip * (1 - this.lobe(a))) * r });
    const footLine = dy => { const run = []; for (let i = 0; i <= 40; i++) { const p = foot(lerp(-Math.PI / 2, Math.PI / 2, i / 40)); run.push({ x: p.x, y: p.y - dy * r }); } return run; };
    c.strokeStyle = 'rgba(130,60,14,0.3)'; c.lineWidth = 0.06 * r; strokePts(c, footLine(0.04));
    // the overhanging crimp casts a soft shadow onto the wall
    const rimFront = dy => { c.beginPath(); for (let i = 0; i <= 40; i++) { const t = lerp(-0.15, Math.PI + 0.15, i / 40); const x = Math.cos(t) * (M.rx + 0.03) * r, y = (M.cy + Math.sin(t) * M.ry + dy) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } };
    rimFront(0.15); c.strokeStyle = 'rgba(105,45,6,0.26)'; c.lineWidth = 0.12 * r; c.stroke();
    rimFront(0.13); c.strokeStyle = 'rgba(105,45,6,0.3)'; c.lineWidth = 0.06 * r; c.stroke();

    // ── one wave of the crimp: a broad, flat pinch of pastry, pale where it meets the lid, baked darker at its tip ──
    const lump = ([x, y, hl, hr, rot, t]) => {
      const nl = Math.hypot(Math.cos(t) * M.ry, Math.sin(t) * M.rx), nx = (Math.cos(t) * M.ry) / nl, ny = (Math.sin(t) * M.rx) / nl;   // outward
      x *= r; y *= r; hl *= r; hr *= r;
      ell(c, x + 0.01 * r, y + 0.03 * r, hl, hr, rot); c.fillStyle = 'rgba(115,50,8,0.32)'; c.fill();
      ell(c, x, y, hl, hr, rot);
      const gx = x - nx * hr * 0.9 - 0.02 * r, gy = y - ny * hr * 0.9 - 0.02 * r;
      c.fillStyle = rg(c, gx, gy, 0, gx, gy, Math.max(hl, hr * 2.2) * 1.05, [[0, '#fde6b2'], [0.35, '#f4c477'], [0.68, '#de9c4a'], [1, '#a45a1e']]);
      c.fill();
      // its tip, baked darker: a band along the outer edge
      c.fillStyle = lg(c, x - nx * hr, y - ny * hr, x + nx * hr, y + ny * hr, [[0, 'rgba(150,70,15,0)'], [0.5, 'rgba(150,70,15,0)'], [1, 'rgba(140,62,12,0.6)']]); c.fill();
      c.strokeStyle = 'rgba(130,60,12,0.6)'; c.lineWidth = 0.028 * r; c.stroke();
    };
    const lumps = this.lumps();
    const back = lumps.filter(l => Math.sin(l[5]) < -1e-6).sort((p, q) => Math.sin(p[5]) - Math.sin(q[5]));
    const front = lumps.filter(l => Math.sin(l[5]) >= -1e-6).sort((p, q) => Math.sin(p[5]) - Math.sin(q[5]));
    back.forEach(lump);

    // ── the lid: a little puffed up, golden, brightest in the middle ──
    c.save(); c.translate(0, L.cy * r); c.scale(1, L.ry / L.rx);
    circ(c, 0, 0, L.rx * r); c.fillStyle = rg(c, -0.22 * r, -0.3 * r, 0, 0, 0, L.rx * r, [[0, '#f9d696'], [0.45, '#eeb466'], [0.8, '#da9440'], [1, '#c07a30']]); c.fill();
    c.restore();
    speckle(c, R, 30, R => { const a = R() * TAU, d = Math.sqrt(R()) * 0.9; return { x: Math.cos(a) * d * L.rx * r, y: (L.cy + Math.sin(a) * d * L.ry) * r }; }, R => `rgba(165,85,25,${0.12 + R() * 0.18})`, 0.008 * r, 0.016 * r);

    // ── icing sugar: a generous soft dusting on the lid ──
    for (const [x, y, s, a] of [[-0.12, -0.24, 0.34, 0.34], [0.24, -0.18, 0.28, 0.3], [-0.45, -0.16, 0.22, 0.3], [0.5, -0.24, 0.2, 0.26], [0.02, -0.34, 0.24, 0.3]]) {
      c.save(); c.translate(x * r, y * r); c.scale(1, 0.5);
      c.fillStyle = rg(c, 0, 0, 0, 0, 0, s * r, [[0, `rgba(255,255,255,${a})`], [0.55, `rgba(255,255,255,${a * 0.5})`], [1, 'rgba(255,255,255,0)']]); circ(c, 0, 0, s * r); c.fill();
      c.restore();
    }
    speckle(c, R, 140, R => { const a = R() * TAU, d = Math.sqrt(R()) * 0.95; return { x: Math.cos(a) * d * L.rx * r, y: (L.cy + Math.sin(a) * d * L.ry) * r }; }, R => `rgba(255,255,255,${0.5 + R() * 0.45})`, 0.006 * r, 0.013 * r);

    // ── three short, curved steam slits cut into the lid, off-centre, glossy red fruit filling showing in them ──
    for (const [x, y, rot, len] of this.slits) {
      const S = new Path2D(), hl = len / 2, wd = 0.12, bend = 0.04;
      S.moveTo(-hl, 0); S.quadraticCurveTo(0, -wd - bend, hl, 0); S.quadraticCurveTo(0, wd - bend, -hl, 0); S.closePath();
      const M2 = new DOMMatrix().translate(x * r, y * r).scale(r, r * 0.55).rotate(rot), P = new Path2D(); P.addPath(S, M2);
      c.save(); c.translate(0, 0.012 * r); c.strokeStyle = 'rgba(150,70,15,0.4)'; c.lineWidth = 0.05 * r; c.stroke(P); c.restore();   // the lid dips a little round the cut
      c.fillStyle = rg(c, (x - 0.03) * r, (y - 0.015) * r, 0, x * r, y * r, hl * r, [[0, '#c23a2e'], [0.5, '#8e1a18'], [1, '#5a0c0c']]); c.fill(P);
      c.save(); c.clip(P);   // the far wall of the cut: the thickness of the lid, lit
      const wall = new Path2D(); wall.rect(-2 * r, -2 * r, 4 * r, 4 * r); wall.addPath(P, new DOMMatrix().translate(0, 0.012 * r));
      c.fillStyle = '#f2be6c'; c.fill(wall, 'evenodd');
      c.restore();
      c.strokeStyle = 'rgba(120,52,12,0.8)'; c.lineWidth = 0.022 * r; c.stroke(P);
      ell(c, (x - 0.02) * r, (y + 0.008) * r, 0.03 * r, 0.01 * r, rot * Math.PI / 180 * 0.55); c.fillStyle = 'rgba(255,225,215,0.9)'; c.fill();   // syrupy gloss
    }

    // ── a little holly sprig ──
    this.holly(c, r, 0.5, -0.36, 0.2);

    // ── the crimped rim in front of the lid ──
    // the pinches between two waves of the crimp, along the front
    const pinches = [];
    lumps.forEach((p, i) => {
      const q = lumps[(i + 1) % lumps.length], t = (p[5] + q[5]) / 2 + (Math.abs(q[5] - p[5]) > Math.PI ? Math.PI : 0);
      if (Math.sin(t) < 0.05) return;
      const nl = Math.hypot(Math.cos(t) * M.ry, Math.sin(t) * M.rx);
      pinches.push({ i, x: Math.cos(t) * M.rx, y: M.cy + Math.sin(t) * M.ry, nx: (Math.cos(t) * M.ry) / nl, ny: (Math.sin(t) * M.rx) / nl });
    });
    front.forEach(lump);
    for (const { i, x, y, nx, ny } of pinches) {
      // a short crease pressed in by a fingertip
      c.strokeStyle = 'rgba(115,50,8,0.6)'; c.lineWidth = 0.032 * r;
      c.beginPath(); c.moveTo((x - nx * 0.03) * r, (y - ny * 0.03) * r); c.lineTo((x + nx * 0.08) * r, (y + ny * 0.08) * r); c.stroke();
      if (i !== 0 && i !== lumps.length - 2) continue;
      // at two of the pinches the filling has bubbled up between crimp and lid: glossy red fruit filling seeping into the gap
      const px = -ny, py = nx, ix = x - nx * 0.06, iy = y - ny * 0.06;
      c.beginPath(); c.moveTo((ix + px * 0.035) * r, (iy + py * 0.035) * r); c.lineTo((x + nx * 0.05) * r, (y + ny * 0.05) * r); c.lineTo((ix - px * 0.035) * r, (iy - py * 0.035) * r); c.closePath();
      c.fillStyle = '#6e1010'; c.fill();
      c.save(); c.translate(ix * r, iy * r); c.scale(1, 0.62);
      blobPath(c, 0.006 * r, 0.02 * r, 0.05 * r, R, 7, 0.3); c.fillStyle = 'rgba(90,30,5,0.35)'; c.fill();
      blobPath(c, 0, 0, 0.05 * r, R, 7, 0.3); c.fillStyle = rg(c, -0.015 * r, -0.015 * r, 0, 0, 0, 0.05 * r, [[0, '#c23a2e'], [0.6, '#8e1a18'], [1, '#5a0c0c']]); c.fill();
      c.restore();
      ell(c, (ix - 0.016) * r, (iy - 0.01) * r, 0.016 * r, 0.007 * r, -0.2); c.fillStyle = 'rgba(255,232,210,0.9)'; c.fill();
    }
    // sugar caught on the tops of the crimps
    for (const [x, y, ax, ay] of lumps) {
      speckle(c, R, 7, R => ({ x: (x + (R() - 0.5) * ax * 1.3) * r, y: (y - ay * lerp(0.3, 0.85, R())) * r }), R => `rgba(255,255,255,${0.45 + R() * 0.4})`, 0.005 * r, 0.01 * r);
    }

    // ── volume: the engine's soft shading, but along the pie's own outline ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(F);
    c.shadowColor = 'rgba(90,40,0,0.36)'; c.shadowBlur = r * 0.3 * pr; c.shadowOffsetX = -r * 0.08 * pr; c.shadowOffsetY = -r * 0.12 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-3 * r, -3 * r, 6 * r, 6 * r);
    c.restore();
    c.restore();   // the pie clip
  },
  // a holly sprig lying on the lid: two spiky leaves and three berries; (x, y) and size s in units of r
  holly(c, r, x, y, s) {
    c.save(); c.translate(x * r, y * r);
    const leaf = (ang, len, wid) => {
      c.save(); c.scale(1, 0.62); c.rotate(ang);
      const k = 3, wf = t => wid * Math.pow(Math.sin(Math.PI * t), 0.7);
      c.beginPath(); c.moveTo(0, 0);
      for (let i = 1; i <= k + 1; i++) { const t0 = (i - 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(len * tm, -wf(tm) * 0.55, len * t1, i <= k ? -wf(t1) : 0); }
      for (let i = k; i >= 0; i--) { const t0 = (i + 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(len * tm, wf(tm) * 0.55, len * t1, i > 0 ? wf(t1) : 0); }
      c.closePath();
      c.save(); c.translate(0.01 * r, 0.04 * r); c.fillStyle = 'rgba(90,40,5,0.35)'; c.fill(); c.restore();
      c.fillStyle = lg(c, 0, -wid, 0, wid, [[0, '#56c872'], [0.5, '#25903f'], [1, '#125526']]); c.fill();
      c.strokeStyle = '#0b3517'; c.lineWidth = 0.03 * r; c.stroke();
      c.strokeStyle = 'rgba(205,255,205,0.75)'; c.lineWidth = 0.025 * r; c.beginPath(); c.moveTo(len * 0.1, 0); c.quadraticCurveTo(len * 0.5, -wid * 0.1, len * 0.85, 0); c.stroke();
      c.restore();
    };
    leaf(Math.PI + 0.25, 1.2 * s * r, 0.42 * s * r);
    leaf(-0.25, 1.2 * s * r, 0.42 * s * r);
    for (const [dx, dy] of [[-0.24, 0.02], [0.24, 0.03], [0, -0.16]]) {
      const bx = dx * s * r, by = dy * s * r, q = 0.27 * s * r;
      circ(c, bx + 0.01 * r, by + 0.02 * r, q); c.fillStyle = 'rgba(60,10,5,0.4)'; c.fill();
      circ(c, bx, by, q); c.fillStyle = rg(c, bx - q * 0.35, by - q * 0.4, 0, bx, by, q, [[0, '#ff8080'], [0.5, '#e01f38'], [1, '#8a0619']]); c.fill();
      c.strokeStyle = '#540310'; c.lineWidth = 0.025 * r; c.stroke();
      circ(c, bx - q * 0.35, by - q * 0.38, q * 0.3); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    }
    c.restore();
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

// 7 ─ BUNDT CAKE (a fluted Gugelhupf seen from the side, a little from above: golden-brown ridges, white icing drips, the hole on top)
FESTIVE_TIERS[7] = {
  key: 'bundt', name: 'Bundt Cake', r: 56, outline: '#5a2c0e',
  // No drawing scale (k = 1): the cake is 15 % smaller in area than the classic Cherry Pie (8,355 against 9,790) and a
  // little squat, so that it looks smaller than the Stollen it merges into (the classic ladder shrinks at that step).
  // Gingerbread Man → Bundt Cake → Stollen → Yule Log grow by the same 15 % in area each.
  // The cake is a fluted solid of revolution, painted from its own little 3D model: the profile (radius, height) runs
  // from the foot of the cake over its shoulder to the rim of the hole (units of r); n rounded ridges all round, amp
  // deep; seen from elev (radians) above the horizon; Y0 moves the picture down so that its middle is near 0.
  prof: [[1, 0], [1, 0.095], [0.96, 0.3], [0.88, 0.49], [0.76, 0.636], [0.6, 0.731], [0.44, 0.765], [0.32, 0.752], [0.22, 0.714]],
  n: 12, amp: 0.11, elev: 0.45, Y0: 0.265,
  // icing: where it ends on the profile (0 foot … 1 hole) and its drips down the ridges: [ridge (0 = front), length]
  ice: 0.6, drips: [[-3, 0.16], [-2, 0.32], [-1, 0.2], [0, 0.08], [1, 0.28], [2, 0.15], [3, 0.24]],
  face: { x: 0, y: 0.365, s: 0.34 },
  crumbs: ['#d99a4a', '#ffffff', '#8a4a1c', '#e8334a', '#2f9a55'],
  // The collision outline is the convex hull of the cake; the ridges scallop the painted cake a little inside it, so
  // paint() clips to the cake itself and shades along its outline.
  noShade: true,
  // a ridge: 1 on its crest, 0 in the groove between two ridges (rounded crests, sharp grooves)
  lobe(ph) { const u = ph * this.n / TAU + 0.5, t = u - Math.floor(u) - 0.5; return Math.sqrt(Math.max(0, 1 - 4 * t * t)); },
  // the profile, densely: radius, height, outward normal, ridge depth — per row from the foot (s = 0) to the hole (s = 1)
  rows() {
    if (this._rows) return this._rows;
    const sm = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    const P = spline(this.prof.map(([x, y]) => ({ x, y })), 8), m = P.length, out = [];
    for (let i = 0; i < m; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(m - 1, i + 1)], tr = b.x - a.x, tz = b.y - a.y, tl = Math.hypot(tr, tz) || 1, s = i / (m - 1);
      out.push({ s, rho: P[i].x, z: P[i].y, nr: tz / tl, nz: -tr / tl, A: this.amp * (1 - sm(0.7, 1, s)) });
    }
    return (this._rows = out);
  },
  // a point of the surface at profile position s (0 … 1) and angle ph (0 = facing us): 3D (x right, y toward us, z up),
  // its place in the picture (X, Y, units of r) and its distance toward us
  at(s, ph) {
    const rows = this.rows(), f = clamp(s, 0, 1) * (rows.length - 1), i = Math.min(rows.length - 2, Math.floor(f)), t = f - i, a = rows[i], b = rows[i + 1];
    const cr = this.lobe(ph), A = lerp(a.A, b.A, t) * cr;
    const rho = lerp(a.rho, b.rho, t) + A * lerp(a.nr, b.nr, t), z = lerp(a.z, b.z, t) + A * lerp(a.nz, b.nz, t);
    const x = rho * Math.sin(ph), y = rho * Math.cos(ph), ce = Math.cos(this.elev), se = Math.sin(this.elev);
    return { x, y, z, X: x, Y: -z * ce + y * se + this.Y0, d: y * ce + z * se, c: cr, s };
  },
  // the outline of the cake, from a dense sampling of its surface: highest and lowest point, column by column
  contour(r) {
    if (this._c && this._c.r === r) return this._c.pts;
    if (!this._unit) {
      const NB = 300, W = 1.3, NS = 60, NP = 1440, lo = new Array(NB + 1).fill(Infinity), hi = new Array(NB + 1).fill(-Infinity);
      let x0 = Infinity, x1 = -Infinity;
      for (let i = 0; i <= NS; i++) for (let j = 0; j < NP; j++) {
        const p = this.at(i / NS, (j / NP) * TAU), k = Math.round(((p.X + W) / (2 * W)) * NB);
        if (p.Y < lo[k]) lo[k] = p.Y; if (p.Y > hi[k]) hi[k] = p.Y; if (p.X < x0) x0 = p.X; if (p.X > x1) x1 = p.X;
      }
      const top = [], bot = [];
      for (let k = 0; k <= NB; k++) if (lo[k] <= hi[k]) { const x = clamp(lerp(-W, W, k / NB), x0, x1); top.push({ x, y: lo[k] }); bot.push({ x, y: hi[k] }); }
      this._unit = top.concat(bot.reverse());
    }
    const pts = this._unit.map(p => ({ x: p.x * r, y: p.y * r }));
    this._c = { r, pts, path: pathFromPts(new Path2D(), pts) };
    return pts;
  },
  shape(r) { return [this.contour(r)]; },   // one convex part: the engine takes the hull of the cake's outline
  figurePath(r) { this.contour(r); return this._c.path; },
  outlineFn(c, path, r, ow) { const F = this.figurePath(r); c.save(); c.clip(F); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(F); c.restore(); },
  // The cake takes a few dozen milliseconds to paint, and the game paints it twice at the same size (plain, then golden
  // when one turns up), so the last painting is kept and reused when the same canvas transform asks for it again.
  paint(c, r, R, T, pr = 1) {
    const m = c.getTransform(), cv = c.canvas, key = [m.a, m.b, m.c, m.d, m.e, m.f, cv.width, cv.height, r].join();
    if (!this._pc || this._pc.key !== key) {
      const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
      const o = off.getContext('2d'); o.setTransform(m.a, m.b, m.c, m.d, m.e, m.f); this.paintCake(o, r, R, pr);
      this._pc = { key, off };
    }
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(this._pc.off, 0, 0); c.restore();
  },
  paintCake(c, r, R, pr) {
    const F = this.figurePath(r), ce = Math.cos(this.elev), se = Math.sin(this.elev);
    const nrm = v => { const l = Math.hypot(...v) || 1; return v.map(q => q / l); };
    const V = [0, ce, se], Lt = nrm([-0.5, 0.42, 0.78]), H = nrm([Lt[0] + V[0], Lt[1] + V[1], Lt[2] + V[2]]);
    const ramp = stops => { const S = stops.map(([o, h]) => [o, hexRgb(h)]); return t => { let k = 0; while (k < S.length - 2 && t > S[k + 1][0]) k++; const [o0, c0] = S[k], [o1, c1] = S[k + 1], f = clamp((t - o0) / (o1 - o0), 0, 1); return `rgb(${c0.map((v, j) => Math.round(lerp(v, c1[j], f))).join(',')})`; }; };
    const CAKE = ramp([[0, '#4a2008'], [0.26, '#86451a'], [0.48, '#b8702e'], [0.68, '#d8984c'], [0.85, '#eebd76'], [1, '#fde3ae']]);
    const ICE = ramp([[0, '#9d96b2'], [0.35, '#cdc9db'], [0.62, '#eceaf3'], [0.82, '#fbfaff'], [1, '#ffffff']]);
    c.lineCap = 'round'; c.lineJoin = 'round';

    // ── the surface in thin slices all round (one per angle step), back to front; each slice is lit by its own slant
    //    and shaded smoothly along its length. The slices make up the cake's outline themselves, so they are painted
    //    without a clip (a few hundred fills: that keeps them cheap) ──
    const NS = 48, NP = this.n * 16, grid = [];
    for (let i = 0; i <= NS; i++) { const row = []; for (let j = 0; j <= NP; j++) row.push(this.at(i / NS, (j / NP) * TAU - Math.PI)); grid.push(row); }
    const runs = [];
    for (let j = 0; j < NP; j++) {
      let run = null, dir = 0;
      const close = () => { if (run) { run.depth /= run.rows.length; runs.push(run); } run = null; dir = 0; };
      for (let i = 0; i < NS; i++) {
        const a = grid[i][j], b = grid[i][j + 1], d = grid[i + 1][j], e = grid[i + 1][j + 1];
        const ds = [(d.x + e.x - a.x - b.x) / 2, (d.y + e.y - a.y - b.y) / 2, (d.z + e.z - a.z - b.z) / 2];
        const dp = [(b.x + e.x - a.x - d.x) / 2, (b.y + e.y - a.y - d.y) / 2, (b.z + e.z - a.z - d.z) / 2];
        const nv = nrm([ds[1] * dp[2] - ds[2] * dp[1], ds[2] * dp[0] - ds[0] * dp[2], ds[0] * dp[1] - ds[1] * dp[0]]);
        if (nv[0] * V[0] + nv[1] * V[1] + nv[2] * V[2] < -0.05) { close(); continue; }
        const sd = Math.sign(d.Y + e.Y - a.Y - b.Y) || dir;   // a slice runs one way up the picture: split it where it turns
        if (run && dir && sd !== dir) close();
        if (!run) run = { rows: [], depth: 0 };
        dir = sd;
        run.rows.push({ a, b, d, e, s: (a.s + d.s) / 2, cr: (a.c + b.c + d.c + e.c) / 4,
          dif: Math.max(0, nv[0] * Lt[0] + nv[1] * Lt[1] + nv[2] * Lt[2]), sp: Math.pow(Math.max(0, nv[0] * H[0] + nv[1] * H[1] + nv[2] * H[2]), 28) });
        run.depth += (a.d + b.d + d.d + e.d) / 4;
      }
      close();
    }
    runs.sort((p, q) => p.depth - q.depth);
    // one slice, widened by half a device pixel on each side so that neighbours overlap and no seam shows
    const gw = 0.5 / pr;
    const wide = (p, q, s) => { const dx = q.X - p.X, dy = q.Y - p.Y, l = Math.hypot(dx, dy) || 1; return [p.X * r + s * dx / l * gw, p.Y * r + s * dy / l * gw]; };
    const slice = (run, col) => {
      const Q = run.rows, A = Q[0], B = Q[Q.length - 1];
      const x0 = (A.a.X + A.b.X) / 2 * r, y0 = (A.a.Y + A.b.Y) / 2 * r, x1 = (B.d.X + B.e.X) / 2 * r, y1 = (B.d.Y + B.e.Y) / 2 * r, L2 = (x1 - x0) ** 2 + (y1 - y0) ** 2 || 1;
      const g = c.createLinearGradient(x0, y0, x1, y1);
      for (let k = 0; k < Q.length; k += (k + 4 < Q.length ? 4 : Math.max(1, Q.length - 1 - k))) { const q = Q[k], mx = (q.a.X + q.b.X + q.d.X + q.e.X) / 4 * r, my = (q.a.Y + q.b.Y + q.d.Y + q.e.Y) / 4 * r; g.addColorStop(clamp(((mx - x0) * (x1 - x0) + (my - y0) * (y1 - y0)) / L2, 0, 1), col(q)); }
      c.beginPath(); c.moveTo(...wide(A.a, A.b, -1));
      for (const q of Q) c.lineTo(...wide(q.d, q.e, -1));
      for (let i = Q.length - 1; i >= 0; i--) c.lineTo(...wide(Q[i].e, Q[i].d, -1));
      c.lineTo(...wide(A.b, A.a, -1)); c.closePath();
      c.fillStyle = g; c.fill();
    };
    for (const run of runs) slice(run, q => CAKE(clamp((0.14 + 0.86 * q.dif + 0.3 * q.sp) * lerp(0.72, 1, Math.sqrt(q.cr)), 0, 1)));
    c.save(); c.clip(F);
    // a baked crumb texture on the cake
    speckle(c, R, 90, R => ({ x: lerp(-1.05, 1.05, R()) * r, y: lerp(-0.4, 0.8, R()) * r }), R => (R() < 0.6 ? `rgba(110,50,10,${0.12 + R() * 0.18})` : `rgba(255,225,170,${0.12 + R() * 0.18})`), 0.008 * r, 0.018 * r);
    // contact shadow at the foot
    c.fillStyle = lg(c, 0, (this.Y0 + 0.2) * r, 0, (this.Y0 + 0.5) * r, [[0, 'rgba(70,28,2,0)'], [1, 'rgba(70,28,2,0.45)']]);
    c.fillRect(-2 * r, (this.Y0 + 0.2) * r, 4 * r, r);

    // ── icing: poured over the top, running down the ridges ──
    const smin = (a, b, k = 30) => -Math.log(Math.exp(-k * a) + Math.exp(-k * b)) / k;
    const sIce = ph => {
      let s = this.ice + 0.015 * Math.sin(3 * ph + 1);
      for (const [k, len] of this.drips) { const t = (ph - (k * TAU) / this.n) / ((0.4 * TAU) / this.n); if (Math.abs(t) < 1) s = smin(s, this.ice - len * Math.pow(1 - t * t, 0.3)); }
      return s;
    };
    const edge = [];
    for (let i = 0; i <= 480; i++) { const ph = lerp(-Math.PI / 2, Math.PI / 2, i / 480), p = this.at(sIce(ph), ph); edge.push({ x: p.X * r, y: p.Y * r }); }
    const e0 = edge[0], e1 = edge[edge.length - 1];
    const iceP = new Path2D(); iceP.moveTo(e0.x - 0.5 * r, e0.y); edge.forEach(p => iceP.lineTo(p.x, p.y)); iceP.lineTo(e1.x + 0.5 * r, e1.y); iceP.lineTo(2 * r, -3 * r); iceP.lineTo(-2 * r, -3 * r); iceP.closePath();
    // its shadow on the cake
    c.save(); c.translate(0.012 * r, 0.035 * r); c.strokeStyle = 'rgba(55,22,2,0.32)'; c.lineWidth = 0.06 * r; strokePts(c, edge); c.restore();
    c.restore();   // the cake clip: the icing slices need only their own
    c.save(); c.clip(iceP);
    for (const run of runs) if (run.rows[run.rows.length - 1].s > 0.12) slice(run, q => ICE(clamp(0.42 + 0.6 * q.dif + 0.55 * q.sp, 0, 1)));
    c.restore();
    c.save(); c.clip(F);
    c.save(); c.clip(iceP);
    // the thick edge: a cool shade just inside it, a bright rim above that
    c.strokeStyle = 'rgba(130,125,165,0.4)'; c.lineWidth = 0.07 * r; strokePts(c, edge);
    c.save(); c.translate(-0.008 * r, -0.04 * r); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.03 * r; strokePts(c, edge); c.restore();
    c.restore();
    // glossy highlights on the drips
    for (const [k, len] of this.drips) {
      const ph = (k * TAU) / this.n - 0.06; if (Math.abs(ph) > 1.3 || len < 0.12) continue;
      const p = this.at(this.ice - len * 0.75, ph); ell(c, (p.X - 0.02) * r, p.Y * r, 0.022 * r, 0.05 * r); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
    }

    // ── the hole in the middle ──
    const hole = []; for (let i = 0; i < 72; i++) { const p = this.at(1, (i / 72) * TAU); hole.push({ x: p.X * r, y: p.Y * r }); }
    const H0 = pathFromPts(new Path2D(), hole);
    c.fillStyle = '#2a1205'; c.fill(H0);
    c.save(); c.clip(H0);   // its far inner wall, lit, going down into the dark
    const dz = 0.16 * ce * r, sh = new Path2D(); sh.rect(-2 * r, -3 * r, 4 * r, 6 * r); pathFromPts(sh, hole.map(p => ({ x: p.x, y: p.y + dz })));
    c.fillStyle = lg(c, 0, Math.min(...hole.map(p => p.y)), 0, Math.max(...hole.map(p => p.y)), [[0, '#b0732e'], [0.5, '#6b3510'], [1, '#2a1205']]); c.fill(sh, 'evenodd');
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.035 * r; c.beginPath();
    for (let i = 0; i <= 24; i++) { const p = this.at(1, lerp(-1.35, 1.35, i / 24)); c.lineTo(p.X * r, (p.Y + 0.012) * r); }
    c.stroke();

    // ── a holly sprig on top ──
    { const p = this.at(0.78, 0.75); this.holly(c, r, p.X, p.Y - 0.02, 0.24); }

    // ── volume: soft shading along the cake's own outline ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(F);
    c.shadowColor = 'rgba(70,28,0,0.34)'; c.shadowBlur = r * 0.28 * pr; c.shadowOffsetX = -r * 0.07 * pr; c.shadowOffsetY = -r * 0.11 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.restore();   // the cake clip
  },
  // a holly sprig: two spiky leaves and three berries; (x, y) and size s in units of r
  holly(c, r, x, y, s) {
    c.save(); c.translate(x * r, y * r);
    const leaf = (ang, len, wid) => {
      c.save(); c.scale(1, 0.7); c.rotate(ang);
      const k = 3, wf = t => wid * Math.pow(Math.sin(Math.PI * t), 0.7);
      c.beginPath(); c.moveTo(0, 0);
      for (let i = 1; i <= k + 1; i++) { const t0 = (i - 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(len * tm, -wf(tm) * 0.55, len * t1, i <= k ? -wf(t1) : 0); }
      for (let i = k; i >= 0; i--) { const t0 = (i + 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(len * tm, wf(tm) * 0.55, len * t1, i > 0 ? wf(t1) : 0); }
      c.closePath();
      c.save(); c.translate(0.01 * r, 0.04 * r); c.fillStyle = 'rgba(60,50,70,0.3)'; c.fill(); c.restore();
      c.fillStyle = lg(c, 0, -wid, 0, wid, [[0, '#56c872'], [0.5, '#25903f'], [1, '#125526']]); c.fill();
      c.strokeStyle = '#0b3517'; c.lineWidth = 0.03 * r; c.stroke();
      c.strokeStyle = 'rgba(205,255,205,0.75)'; c.lineWidth = 0.022 * r; c.beginPath(); c.moveTo(len * 0.1, 0); c.quadraticCurveTo(len * 0.5, -wid * 0.1, len * 0.85, 0); c.stroke();
      c.restore();
    };
    leaf(Math.PI + 0.3, 1.2 * s * r, 0.42 * s * r);
    leaf(-0.3, 1.2 * s * r, 0.42 * s * r);
    for (const [dx, dy] of [[-0.24, 0.02], [0.24, 0.03], [0, -0.17]]) {
      const bx = dx * s * r, by = dy * s * r, q = 0.27 * s * r;
      circ(c, bx + 0.01 * r, by + 0.02 * r, q); c.fillStyle = 'rgba(60,10,5,0.4)'; c.fill();
      circ(c, bx, by, q); c.fillStyle = rg(c, bx - q * 0.35, by - q * 0.4, 0, bx, by, q, [[0, '#ff8080'], [0.5, '#e01f38'], [1, '#8a0619']]); c.fill();
      c.strokeStyle = '#540310'; c.lineWidth = 0.025 * r; c.stroke();
      circ(c, bx - q * 0.35, by - q * 0.38, q * 0.3); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
    }
    c.restore();
  },
};

// 8 ─ STOLLEN (powdered-sugar Stollen loaf — the classic Bread's collision shape, drawn 1.11 × as big)
FESTIVE_TIERS[8] = {
  key: 'stollen', name: 'Stollen', r: 64, outline: '#5a3010',
  k: 1.11,   // 23 % more area than the Bread (9,610): bigger than the Bundt Cake before it, smaller than the Yule Log after it
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

// 9 ─ YULE LOG (a chocolate Swiss roll dressed as a log: glossy glaze, a fine icing drizzle, cream spiral, cream rosettes on top)
FESTIVE_TIERS[9] = {
  key: 'yulelog', name: 'Yule Log', r: 72, outline: '#5a2c12',
  k: 1.031,   // drawing scale: the collision area (the hull of the cake) equals the classic Black Forest cake's
  // the roll in units of its drawing radius: axis height cy, half height b; the near cut end (left) and the far rounded
  // end (right) are ellipses a wide, centred at xl and xr
  log: { cy: 0.06, b: 0.53, xl: -0.64, xr: 0.64, a: 0.32 },
  // whipped-cream rosettes piped along the top: [centre x, topping ('berry' | 'holly')]; their size, and how far their
  // centre sits below the top of the roll (they make the scalloped top edge of the outline)
  rosettes: [[-0.32, 'berry'], [0, 'holly'], [0.32, 'berry']], rose: { rx: 0.21, ry: 0.2, lift: 0.075 },
  // a drizzle of fine icing lines across the roll, all leaning the same way: [x where it crosses the middle, where it
  // starts below the top, where it ends above (+) or past (-) the bottom, ends in a drip] (units of r); none crosses
  // the face
  drizzle: [[-0.3, 0.14, 0.02, 0], [-0.22, 0.2, 0.2, 1], [-0.13, 0.12, -0.05, 0], [-0.09, 0.17, 0.1, 0], [0.34, 0.15, 0.7, 0],
    [0.1, 0.72, -0.05, 0], [0.54, 0.13, 0.05, 0], [0.62, 0.19, 0.18, 1], [0.72, 0.12, -0.05, 0], [0.8, 0.16, 0.12, 0],
    [0.9, 0.14, -0.05, 0], [0.97, 0.2, 0.15, 0]],
  face: { x: 0.2, y: -0.01, s: 0.36 },
  crumbs: ['#8a4c2a', '#d9a060', '#fbefd8', '#ffffff', '#e8334a'],
  // The collision outline is the convex hull of the roll and its rosettes; the shallow slivers between and beside the
  // rosettes stay unpainted, so paint() clips to the cake itself and shades along its outline.
  noShade: true,
  // the outline (every vertical line crosses it in one piece): top and bottom edge, x by x
  contour(r) {
    if (this._c && this._c.r === r) return this._c.pts;
    const G = this.log, Q = this.rose, top = G.cy - G.b;
    const E = (cx, cy, rx, ry) => x => { const u = (x - cx) / rx; if (Math.abs(u) > 1) return null; const d = ry * Math.sqrt(1 - u * u); return [cy - d, cy + d]; };
    const rect = x => (x >= G.xl && x <= G.xr ? [top, G.cy + G.b] : null);
    const parts = [E(G.xl, G.cy, G.a, G.b), rect, E(G.xr, G.cy, G.a, G.b), ...this.rosettes.map(([x]) => E(x, top + Q.lift, Q.rx, Q.ry))];
    const X1 = G.xr + G.a, n = 360, tp = [], bt = [];
    for (let i = 0; i <= n; i++) {
      const x = -X1 * Math.cos((i / n) * Math.PI); let a = Infinity, z = -Infinity;
      for (const p of parts) { const s = p(x); if (s) { if (s[0] < a) a = s[0]; if (s[1] > z) z = s[1]; } }
      if (a <= z) { tp.push({ x: x * r, y: a * r }); bt.push({ x: x * r, y: z * r }); }
    }
    const pts = tp.concat(bt.reverse());
    this._c = { r, pts, path: pathFromPts(new Path2D(), pts) };
    return pts;
  },
  shape(r) { return [this.contour(r)]; },   // one convex part: the engine takes the hull of the outline
  figurePath(r) { this.contour(r); return this._c.path; },
  outlineFn(c, path, r, ow) { const F = this.figurePath(r); c.save(); c.clip(F); c.lineWidth = ow * 2; c.strokeStyle = this.outline; c.stroke(F); c.restore(); },
  paint(c, r, R, T, pr = 1) {
    const F = this.figurePath(r), G = this.log, Q = this.rose, top = G.cy - G.b, bot = G.cy + G.b;
    c.save(); c.clip(F);
    c.lineCap = 'round'; c.lineJoin = 'round';
    const glow = (x, y, rx, ry, col, a) => {   // a soft elliptical light or shade (units of r)
      c.save(); c.translate(x * r, y * r); c.scale(1, ry / rx);
      c.fillStyle = rg(c, 0, 0, 0, 0, 0, rx * r, [[0, `rgba(${col},${a})`], [1, `rgba(${col},0)`]]); circ(c, 0, 0, rx * r); c.fill();
      c.restore();
    };

    // ── smooth, glossy chocolate glaze poured over the roll: warm, one soft broad highlight, warm shade below ──
    c.fillStyle = lg(c, 0, top * r, 0, bot * r, [[0, '#a8683e'], [0.3, '#8e5030'], [0.65, '#713a20'], [1, '#532814']]);
    c.fillRect(-2 * r, -2 * r, 4 * r, 4 * r);
    glow(0.1, top + 0.27, 0.8, 0.15, '255,214,176', 0.42);     // the soft broad highlight of the glaze
    glow(0.1, bot - 0.05, 0.9, 0.13, '60,24,8', 0.35);           // warm shade underneath
    glow(G.xr + 0.12, G.cy, 0.3, 0.5, '60,24,8', 0.28);          // the far end turning away
    glow(this.face.x, this.face.y + 0.02, 0.24, 0.17, '176,112,70', 0.5);   // a calm, lighter spot where the face sits
    // a light dusting of icing sugar on top
    speckle(c, R, 70, R => { const x = lerp(G.xl, G.xr + 0.25, R()); return { x: x * r, y: (top + 0.04 + Math.pow(R(), 2) * 0.4) * r }; }, R => `rgba(255,252,245,${0.4 + R() * 0.5})`, 0.007 * r, 0.014 * r);

    // ── a drizzle of fine, soft ivory icing lines across the roll, all leaning the same way, uneven, a drip here and there ──
    {
      const lean = 0.42, w = 0.03 * r, lines = [], drips = [];
      this.drizzle.forEach(([x0, s0, e0, dr], k) => {
        const y0 = top + s0, y1 = bot - e0, run = [];
        for (let y = y0; y <= y1 + 1e-6; y += 0.02) run.push({ x: (x0 + lean * y + 0.008 * Math.sin(y * 14 + k * 1.9)) * r, y: y * r });
        lines.push(run);
        if (dr) drips.push(run[run.length - 1]);
      });
      const drip = (p, s) => { c.beginPath(); c.moveTo(p.x - w * 0.5 * s, p.y); c.quadraticCurveTo(p.x - w * 0.75 * s, p.y + w * 1.6 * s, p.x, p.y + w * 1.9 * s); c.quadraticCurveTo(p.x + w * 0.75 * s, p.y + w * 1.6 * s, p.x + w * 0.5 * s, p.y); c.closePath(); };
      c.save(); c.translate(0.006 * r, 0.014 * r);   // a faint shadow on the glaze
      c.strokeStyle = 'rgba(40,15,4,0.3)'; c.lineWidth = w * 1.2; for (const l of lines) strokePts(c, l);
      for (const p of drips) { drip(p, 1.1); c.fillStyle = 'rgba(40,15,4,0.3)'; c.fill(); }
      c.restore();
      c.strokeStyle = '#efe0c8'; c.lineWidth = w; for (const l of lines) strokePts(c, l);
      for (const p of drips) { drip(p, 1); c.fillStyle = '#efe0c8'; c.fill(); }
      c.save(); c.translate(-0.004 * r, -0.006 * r); c.strokeStyle = 'rgba(255,250,240,0.85)'; c.lineWidth = w * 0.45; for (const l of lines) strokePts(c, l); c.restore();
    }

    // ── whipped-cream rosettes piped along the top, each with a berry or a holly leaf ──
    for (const [x, kind] of this.rosettes) this.rosette(c, r, x, top + Q.lift, kind);

    // ── the near cut end: a chocolate Swiss roll in section, cocoa sponge rolled round thick white cream, in its glaze ──
    c.save(); c.translate(G.xl * r, G.cy * r); c.scale(G.a * r, G.b * r);   // a unit circle, seen at a slant
    circ(c, 0, 0, 1); c.fillStyle = lg(c, 0, -1, 0, 1, [[0, '#7a3e20'], [0.5, '#5e2c14'], [1, '#48200e']]); c.fill();   // the glaze coat, cut through
    circ(c, 0.02, 0, 0.82); c.fillStyle = rg(c, -0.25, -0.3, 0, 0.02, 0, 0.85, [[0, '#a8683e'], [0.6, '#91542f'], [1, '#7a4224']]); c.fill();   // cocoa sponge
    c.save(); circ(c, 0.02, 0, 0.82); c.clip();
    speckle(c, R, 80, R => { const a = R() * TAU, d = Math.sqrt(R()) * 0.8; return { x: 0.02 + Math.cos(a) * d, y: Math.sin(a) * d }; }, R => (R() < 0.6 ? `rgba(80,38,16,${0.3 + R() * 0.25})` : `rgba(200,140,95,${0.35 + R() * 0.3})`), 0.025, 0.05);   // a soft, porous crumb
    c.restore();
    // the cream: one and a half turns, thick, white-ivory, a little warm shade on its lower edge
    const spiral = []; for (let t = 0; t <= 3 * Math.PI + 1e-6; t += 0.05) { const q = 0.08 + (t / (3 * Math.PI)) * 0.52; spiral.push({ x: 0.02 + Math.cos(t + 2.3) * q, y: Math.sin(t + 2.3) * q }); }
    c.save(); c.translate(0.012, 0.03); c.strokeStyle = 'rgba(60,26,10,0.45)'; c.lineWidth = 0.25; strokePts(c, spiral); c.restore();
    c.strokeStyle = '#fbf3e4'; c.lineWidth = 0.24; strokePts(c, spiral);
    circ(c, 0.02 + Math.cos(2.3) * 0.08, Math.sin(2.3) * 0.08, 0.13); c.fillStyle = '#fbf3e4'; c.fill();
    c.save(); c.translate(-0.02, -0.035); c.strokeStyle = 'rgba(255,255,252,0.85)'; c.lineWidth = 0.08; strokePts(c, spiral.slice(10, -8)); c.restore();
    // the cut face turned toward the light: brighter top left, a soft warm shade bottom right
    c.fillStyle = rg(c, -0.3, -0.4, 0, -0.05, -0.05, 1.05, [[0, 'rgba(255,236,200,0.18)'], [0.55, 'rgba(255,236,200,0)'], [0.85, 'rgba(90,40,10,0.08)'], [1, 'rgba(90,40,10,0.3)']]);
    circ(c, 0, 0, 1); c.fill();
    c.restore();
    // a soft sheen on the coat's rim, and sugar caught on top of it
    c.strokeStyle = 'rgba(240,200,160,0.55)'; c.lineWidth = 0.03 * r; c.beginPath(); c.ellipse((G.xl + 0.005) * r, G.cy * r, (G.a - 0.035) * r, (G.b - 0.04) * r, 0, Math.PI * 1.0, Math.PI * 1.45); c.stroke();
    c.save(); c.beginPath(); c.ellipse(G.xl * r, G.cy * r, G.a * r, G.b * r, 0, 0, TAU); c.clip();
    c.beginPath(); c.moveTo((G.xl - G.a) * r, (top - 0.1) * r);
    for (let x = -1; x <= 1.0001; x += 0.05) c.lineTo((G.xl + x * G.a) * r, (G.cy - G.b * Math.sqrt(Math.max(0, 1 - x * x)) + (0.06 + 0.02 * Math.sin(x * 7)) * Math.max(0, 1 - (x / 0.8) ** 2)) * r);
    c.lineTo((G.xl + G.a) * r, (top - 0.1) * r); c.closePath(); c.fillStyle = '#fffaf2'; c.fill();
    c.restore();

    // ── volume: soft shading along the cake's own outline ──
    c.save();
    const frame = new Path2D(); frame.rect(-4 * r, -4 * r, 8 * r, 8 * r); frame.addPath(F);
    c.shadowColor = 'rgba(70,28,0,0.36)'; c.shadowBlur = r * 0.28 * pr; c.shadowOffsetX = -r * 0.07 * pr; c.shadowOffsetY = -r * 0.11 * pr;
    c.fillStyle = '#000'; c.fill(frame, 'evenodd');
    c.restore();
    c.save(); c.globalCompositeOperation = 'soft-light';
    c.fillStyle = rg(c, -0.4 * r, -0.5 * r, 0, -0.2 * r, -0.3 * r, r * 1.1, [[0, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(-3 * r, -3 * r, 6 * r, 6 * r);
    c.restore();
    c.restore();   // the cake clip
  },
  // one piped whipped-cream rosette sitting on the roll at (x, y), units of r, topped with a berry or a holly leaf
  rosette(c, r, x, y, kind) {
    const Q = this.rose;
    const h = Q.ry;   // the rosette's height above its centre
    c.save(); c.translate(0.012 * r, 0.03 * r); ell(c, x * r, (y + 0.3 * h) * r, Q.rx * r, h * 0.62 * r); c.fillStyle = 'rgba(90,40,12,0.3)'; c.fill(); c.restore();
    const puff = (px, py, rx, ry) => {
      ell(c, px * r, (py + 0.014) * r, rx * r, ry * r); c.fillStyle = 'rgba(205,180,150,0.7)'; c.fill();
      ell(c, px * r, py * r, rx * r, ry * r); c.fillStyle = rg(c, (px - rx * 0.35) * r, (py - ry * 0.55) * r, 0, px * r, py * r, rx * 1.05 * r, [[0, '#fffdf8'], [0.6, '#fbf3e6'], [1, '#ecdcc4']]); c.fill();
    };
    puff(x, y + 0.26 * h, Q.rx * 0.98, h * 0.56);
    puff(x + 0.005, y - 0.12 * h, Q.rx * 0.74, h * 0.46);
    puff(x + 0.01, y - 0.48 * h, Q.rx * 0.44, h * 0.34);
    c.strokeStyle = 'rgba(190,160,125,0.6)'; c.lineWidth = 0.02 * r;   // the piped swirl winding up to the top
    c.beginPath();
    for (let t = 0; t <= 2.2 * Math.PI; t += 0.1) { const f = 1 - t / (2.6 * Math.PI); c.lineTo((x + 0.01 + Math.cos(t + 0.4) * Q.rx * 0.8 * f) * r, (y + 0.3 * h - t * 0.1 * h + Math.sin(t + 0.4) * h * 0.4 * f) * r); }
    c.stroke();
    if (kind === 'holly') {   // a little holly leaf tucked into the cream, and one berry
      c.save(); c.translate((x - 0.05) * r, (y - 0.36 * h) * r); c.rotate(-0.25);
      const L = 0.16 * r, W = 0.055 * r, k = 3, wf = t => W * Math.pow(Math.sin(Math.PI * t), 0.7);
      c.beginPath(); c.moveTo(-L / 2, 0);
      for (let i = 1; i <= k + 1; i++) { const t0 = (i - 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(-L / 2 + L * tm, -wf(tm) * 0.55, -L / 2 + L * t1, i <= k ? -wf(t1) : 0); }
      for (let i = k; i >= 0; i--) { const t0 = (i + 1) / (k + 1), t1 = i / (k + 1), tm = (t0 + t1) / 2; c.quadraticCurveTo(-L / 2 + L * tm, wf(tm) * 0.55, -L / 2 + L * t1, i > 0 ? wf(t1) : 0); }
      c.closePath();
      c.fillStyle = lg(c, 0, -W, 0, W, [[0, '#56c872'], [0.5, '#25903f'], [1, '#125526']]); c.fill();
      c.strokeStyle = '#0b3517'; c.lineWidth = 0.022 * r; c.stroke();
      c.restore();
    }
    const s = 0.05 * r, bx = (x + (kind === 'holly' ? 0.05 : 0.015)) * r, by = (y - h + 0.06) * r;
    circ(c, bx + 0.008 * r, by + 0.016 * r, s); c.fillStyle = 'rgba(80,10,10,0.35)'; c.fill();
    circ(c, bx, by, s); c.fillStyle = rg(c, bx - s * 0.35, by - s * 0.4, 0, bx, by, s, [[0, '#ff8a8a'], [0.5, '#e01f38'], [1, '#8a0619']]); c.fill();
    c.strokeStyle = '#6a0814'; c.lineWidth = 0.02 * r; c.stroke();
    circ(c, bx - s * 0.35, by - s * 0.38, s * 0.3); c.fillStyle = 'rgba(255,255,255,0.92)'; c.fill();
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
