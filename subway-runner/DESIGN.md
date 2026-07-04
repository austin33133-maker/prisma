# Dash Runner — Design Document

A Subway-Surfers-style endless runner (模仿地铁跑酷同款). Ships in two
self-contained builds: a **2D Canvas** version (`index.html`, sections 1–6 below)
and a **3D Three.js** version (`index-3d.html`, section 7). No build step.

## 1. Goal

Recreate the core loop of an endless lane runner: sprint down a track that scrolls
toward the camera, dodge obstacles by switching lanes / jumping / sliding, collect
coins, and survive as long as possible while the game speeds up.

## 2. Rendering — fake 3D on a 2D canvas

There is no real 3D engine. Every object lives in a simple world space and is
projected to the screen with a one-point perspective:

```
world:  x = horizontal lane offset (px @ z=0)
        y = height above the ground (px @ z=0)
        z = depth (0 = at the camera plane, larger = farther away)

scale(z)      = 1 / (1 + z * ZFACTOR)
screenX       = W/2 + x * scale
screenY       = HORIZON + (GROUND_Y - HORIZON) * scale - y * scale
```

Near objects (`z→0`) are full size at the bottom of the screen; far objects
(`z` large) shrink toward the horizon at the vanishing point. Lanes therefore
converge as they recede, giving depth.

Obstacles and the player are drawn as **projected boxes**: the 8 corners of each
box are projected individually and the visible faces (front, top, two sides) are
filled as quads with light/dark shading for a chunky 3D look. Everything is drawn
**far-to-near** (painter's algorithm) so nearer objects overlap correctly.

Motion is sold with moving **sleepers** (ties) that scroll toward the camera, a
parallax skyline, and screen-shake on death.

## 3. World & movement

The player is fixed at the camera plane (`z = 0`); the world moves instead. Each
frame every obstacle/coin has its `z` decreased by `speed * dt`. When an object's
depth crosses the player plane it is resolved (collision or pickup) and later
recycled once it passes behind the camera.

- **Lanes**: three lanes at `x ∈ {-1, 0, 1} * LANE_PX`. Lane changes lerp the
  player's `x` toward the target for a smooth slide.
- **Jump**: an impulse velocity with constant gravity integration.
- **Slide**: a timed low-profile state; sliding out of a jump fast-drops.

## 4. Obstacles & fairness

Obstacles spawn in rows at the far plane. Each row blocks one or two lanes and
**always leaves at least one lane free**, so the game is never unfair.

| Type    | Avoid by        | Collision rule at the player plane        |
|---------|-----------------|-------------------------------------------|
| Train   | switching lanes | hit if in the same lane (tall & long)     |
| Barrier | jumping         | safe only if airborne (`y > threshold`)   |
| Beam    | sliding         | safe only while sliding                   |

Coins spawn as a run of 4–7 in a free lane, sometimes in an arc that rises into
the air so the player must jump to collect them.

## 5. Difficulty curve

```
speed = baseSpeed + distance * 0.0018      // faster over time
gap   = max(2.6, 4.6 - distance * 0.0009)  // rows spawn closer together
score += speed * dt * 3.2  (+ coins)
```

Both the scroll speed and the obstacle density increase with distance, so the run
gets progressively harder. Best score persists in `localStorage`.

## 6. Structure of `index.html`

One file, a single IIFE:

- **Projection** — `project()`, `projScale()`
- **State & reset** — player, obstacles, coins, score
- **Spawning** — `spawnRow()` with the always-one-free-lane rule
- **Input** — keyboard + touch/swipe → `moveLane / jump / slide`
- **Update** — motion, spawning, collision, pickups, difficulty
- **Render** — background, track, boxes, coins, player, HUD
- **Loop** — `requestAnimationFrame` with a clamped `dt`

A tiny `window.__dash` hook (state/score/coins/inputs) exists purely to allow
automated smoke-testing in a headless browser.

## 7. The 3D version (`index-3d.html`)

A second, flagship build renders the same game as **real 3D with Three.js**
(r150 UMD, bundled locally as `three.min.js` so `file://` works offline). It
keeps the world-moves-toward-the-camera model but in true 3D space:

- **Scene**: perspective camera trailing the runner, hemisphere + directional
  lights, fog, a scrolling `CanvasTexture` track, side rails, and a pool of
  recycling city buildings for parallax depth.
- **Character**: an articulated blocky runner (torso, head, cap, two arms, two
  legs on pivots). A run cycle swings the limbs via `sin(phase)`; jumping tucks
  the legs, sliding rotates the whole body back. **Four skins** (color sets)
  are selectable on the menu and persisted.
- **Power-up system** — floating orbs grant a timed effect:
  - **Magnet**: lerps nearby coins toward the player and auto-collects them.
  - **Jetpack**: raises the player above the track; obstacle collisions are
    skipped and coins auto-collect for the duration.
  - **Shield**: consumes one otherwise-fatal hit, with brief invulnerability.
  - **Score ×2**: doubles score and coin value while active.
  Remaining time is shown as HUD countdown bars.
- **Audio** — a small Web Audio engine synthesizes all sound (no files): jump,
  coin, power-up arpeggio, and crash SFX, plus a looping bass/blip music
  sequencer. Mutable via `M` / a button, persisted in `localStorage`.

Collision, spawning (always one free lane) and difficulty scaling mirror the 2D
version. A `window.__dash3d` hook exists for headless WebGL smoke-testing.

## 8. Possible extensions

- Sprite/skeletal character art with texture maps
- More power-ups (double-jump, coin bomb) and a coin shop to unlock skins
- Missions / daily challenges and online leaderboards
- Real shadow mapping and post-processing (bloom on coins/power-ups)
