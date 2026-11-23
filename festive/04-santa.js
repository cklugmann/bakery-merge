'use strict';
// 4 ─ CHOCOLATE SANTA (a foil-wrapped chocolate Santa; one soft convex bell shape)
FESTIVE_TIERS[4] = {
  key: 'santa', name: 'Chocolate Santa', plural: 'Chocolate Santas', r: 39, outline: '#9a2232',
  k: 0.7643,   // drawn 0.76 × its nominal r: a compact bell fills its box far better than the classic Croissant's crescent — the collision area is the same
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
