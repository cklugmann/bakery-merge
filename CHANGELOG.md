# Changelog

All notable changes to Bakery Merge. Versions follow `MAJOR.MINOR.PATCH`;
while the game is in alpha the major version stays `0`, a new **minor**
version marks a larger iteration and a **patch** marks fixes and tuning.
The current version is shown on the title and pause screens
(`VERSION` constant at the top of the script in `index.html`).

## 0.2.2 — Player feedback patch

- **Late tiers no longer jam the board.** Bread, Black Forest cake and Wedding Cake keep
  their characteristic side views (scored loaf with flour; cake with a slice cut out
  showing sponge, cream and cherries; three-tier wedding cake) but now have soft,
  rounded silhouettes — they tip, slide and roll instead of sealing off everything
  underneath them.
- **All pastries are ~7 % smaller**, leaving more room on the board for the big ones.
- **More fluid physics:** lower rotational inertia and friction — pastries roll, slide
  and settle instead of locking into place. (Bot test: average run length up from
  ~6.5 to ~10.7 minutes, Golden Cookie now reachable.)
- **Cinnamon rolls spawn** from stage 4 on (rarely at first); croissants from stage 3.
- **The pastry ladder resets every game:** it shows what you've baked *this* run;
  the title screen still shows everything you've ever made.
- **New, harmonious sound:** everything is tuned to one pentatonic scale, combos climb
  as a little melody, soft mallet tones with a light room reverb; the danger warning
  is a gentle heartbeat instead of a beep.
- **Fixed: sound could stop for good** (mainly iOS). The audio engine now revives itself
  after interruptions and can no longer get stuck at its voice limit.
- Version number shown on the title and pause screens.

## 0.2.1 — Mobile HUD fix

- The top bar can no longer overflow or overlap on phones (fluid layout, the score
  shrinks to fit, shorter gate label, sound toggle moves to the pause menu on
  narrow screens).
- Fredoka font is bundled locally (`vendor/fonts/`) — no Google Fonts dependency.
- Title card adapts to short screens.

## 0.2.0 — Redesign

- 11 hand-drawn pastries with exact-fit collision shapes, faces, golden variants.
- Underwatermelon-style pacing: gate counter, stage multipliers, stage-based spawn
  odds, combos, golden chain (gold merges with plain pastries for ×10) and jackpot.
- Stage transition with camera pull-back and soft landing (no more upward fling).
- Fixed-timestep physics, grow-in merges, robust merge detection.
- Sound, haptics, particles, sparkle/shimmer on golden pastries, best score.

## 0.1.x — Prototype

- Original drop-and-merge prototype (Matter.js) with falling-floor levels.
