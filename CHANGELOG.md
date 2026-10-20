# Changelog

All notable changes to Bakery Merge. Versions follow `MAJOR.MINOR.PATCH`;
while the game is in alpha the major version stays `0`, a new **minor**
version marks a larger iteration and a **patch** marks fixes and tuning.
The current version is shown on the title and pause screens
(`VERSION` constant at the top of the script in `index.html`).

## 0.4.2 — The jackpot show & the golden bakery

- **Fixed: the jackpot felt like nothing happened.** Merging a **golden Wedding Cake with a
  Wedding Cake** has always been the game's *jackpot*: on purpose no new pastry appears — both
  cakes are cashed in for **+30,000 × stage multiplier** (on top of the regular ×10 golden-merge
  points, e.g. +41,100 at stage 1, +246,600 at stage 6), two giant cakes' worth of board space
  is freed and **10 merges** are credited toward the gate. But nothing in the game said so, and
  all it showed was a small "JACKPOT!" banner that the stage change cut short. Players who
  expected an item saw two cakes vanish and reported "no reward". The points are unchanged; the
  experience is new:
- **The jackpot show** (about four seconds, the floor waits for it): the cakes dissolve in a
  golden flash and the world drops into deep slow motion with a gentle camera push-in; a spotlight
  closes in with turning light rays; **J·A·C·K·P·O·T slams in letter by letter**, each on a rising
  chord tone; a ribbon says **BIG / SUPER / MEGA / ULTRA** from stage 3 / 5 / 7 / 10 on; a flute
  fanfare; the prize **rolls up slot-machine style** (the score in the HUD climbs with it) under a
  **firework finale**; **the whole bakery cheers** — every pastry smiles and hops in a wave rolling
  out from the merge point; a bell *DING* lands the counter; *YOUR FIRST JACKPOT!* / *NEW RECORD!*
  badges. Every sound cue follows the chord the waltz is on; the music ducks under the show.
- **The golden bakery — a reward that lasts.** Every jackpot of a run leaves the bakery a little
  more golden for the rest of that run, up to **level 3** (★ / ★★ / ★★★ next to the score):
  - *scenery:* warm golden light falls into every chamber (a bit more per level), sparkling motes
    drift up through it (more per level), the awning and the rails get gold trim, from level 2 soft
    sun rays sway down into the stage, rivets on the rails, and the HUD's gold trim spreads over
    all the chips, the ladder and the board.
  - *music:* the whole soundscape moves **up a semitone per level** — the waltz, your drop melody,
    the merge bells — and the waltz gains a layer per level: an octave harp double and a music-box
    twinkle on every bar (I), off-beat glockenspiel sparkle and an octave echo of the flute tune
    (II), a soft sustained bell chord under every change of harmony (III). The extra layers stay
    quiet, under the music slider like everything else.
  - It resets with every new run — it is this run's trophy.
- **Jackpots are recorded where you can see them:** a gold *Jackpots* tile on the game-over screen
  (count and this run's biggest, only when you hit one) and a lifetime tally with your biggest
  jackpot under *Best* on the title screen.
- **The game explains it now:** the title screen says *Golden Wedding Cake + Wedding Cake =
  JACKPOT — both cakes cash in for a huge bonus, and your bakery turns golden*; making a golden
  Wedding Cake gets its own banner (*Merge it with a Wedding Cake for the JACKPOT*), and making a
  plain one while a golden one is on the board says *Touch it to your golden one for the JACKPOT!*
- The scoring specials are documented in one place in the code (`GOLD_BONUS`, `JACKPOT_BONUS`,
  `JACKPOT_HOLD` next to `GOLD_MULT`); the show lives in `Jackpot`, the lasting part in
  `applyGold` / `Sfx.setGold` / `body[data-gold]`.

## 0.4.1 — Bakery Merge again

- **The game is called *Bakery Merge* again** — on the title screen, in the side panel
  on wide screens, in the browser tab, on the home screen and in link previews.
- Kept from 0.4.0: the subtitle *“Sweet magic, one drop at a time”*, the cupcake app
  icon and the loading text.

## 0.4.0 — Fairycake Falls

- **Bakery Merge is now *Fairycake Falls*.** The new name shows on the title screen,
  in the side panel on wide screens, in the browser tab and on the loading screen.
- **New subtitle:** *“Sweet magic, one drop at a time”* (replaces the technical
  “Drop · merge · fall deeper”).
- **App icon:** the game's own little fairy cake with a sparkle, drawn from the same
  sprite code as in the game. It appears in the browser tab (`icons/favicon-64.png`,
  `icons/icon-192.png`) and as the home-screen icon on iPhone/iPad
  (`icons/apple-touch-icon.png`).
- Page description and share title for links (`description`, `og:title`).
- Nothing changes for players' progress: best score, discovered pastries and sound
  settings carry over (the storage keys stay the same).

## 0.3.2 — Volume sliders

- **Separate sliders for Effects and Music** — in the pause menu and via
  *Sound & music* on the title screen. They work the same with touch (tap anywhere on
  the bar to jump, drag), mouse and keyboard (arrow keys ±5 %, Shift ±10 %, Home/End),
  snap to 5 % steps, preview the effect level with a little chime while you drag, and
  are remembered on the device.
- **Better default balance:** Effects 80 %, Music 50 %. The sliders follow a perceptual
  curve (50 % ≈ half as loud), and the defaults keep the music a calm bed about 10 dB
  below the effects — clearly audible, never competing. With both at 100 % the music
  comes up to ~2 dB below the effects; nothing clips.
- **M** still mutes everything (moving a slider unmutes), **N** toggles the music
  between off and its last level. Old "music off" / "sound off" choices carry over.

## 0.3.1 — An enchanted, sunnier soundtrack

- **The music is cheerful and enchanted now** (it sounded like an indie horror game).
  The low, slowly swelling drone and the random music-box notes in a long, dark hall
  are gone. Instead, in the spirit of Ghibli/Disney harp folk:
  - a gentle **3/4 waltz** of flowing **harp arpeggios** over a bouncy pizzicato bass,
  - a little **flute tune** every other round (so it never wears out),
  - **glockenspiel and celesta sparkles** whenever the harmony changes,
  - classic "magic" harmony: bright major with secondary dominants and a wistful
    minor-iv before it resolves (C – A7 – Dm – G7 – C – E7 – F – Fm → C).
- Everything follows the waltz's chords: your quick taps still play a music-box melody
  on top of the accompaniment; merges and combos ring in the same harmony.
- Brighter mix: shorter, airy room sound, no rumble below ~110 Hz, nothing in the low
  register anymore (sound energy below 250 Hz down from ~50 % to ~10 %).
- Friendlier cues: the danger warning is an oven-timer *tick-tock*, landing is a little
  marimba "ta-da", game over ends on a warm major chord instead of a sad descent.

## 0.3.0 — The magic bakery

- **New stage transition: fairy-dust drift.** When the gate opens, a spell catches the
  falling pastries: the pile loosens into a slowly sinking cloud, carried by a gentle,
  swirling air current — a new random one every stage. Big pastries sink first, small
  ones float down after them. The board gets genuinely reshuffled, pastries can merge on
  the way down, and small pieces stuck under big ones get a second chance.
- **New soundscape — "a fairy in a magical bakery":** celesta, music-box and harp tones
  in a soft hall. Everything follows one slow chord progression: every drop plays the
  next note of a music-box tune (tap quickly and a melody appears), merges ring chord
  tones and combos climb as arpeggios, the gate opens with a harp glissando.
- **Ambient music:** soft pads and rare music-box twinkles. Toggle it separately in the
  pause menu (*Music: on/off*, key **N**); **M** still mutes everything.
- **Fixed: sound gone after switching apps on mobile.** Leaving the app now pauses the
  game, and the audio engine is rebuilt from scratch on the next tap. The same recovery
  kicks in after interruptions while playing (calls, Siri, other apps taking audio).
- The stage banner sits higher, so it no longer covers the falling pastries.

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
