# Dash Runner — Design Document

A Subway-Surfers-style endless runner (模仿地铁跑酷同款), implemented in a single
HTML file with Canvas 2D. No frameworks, no build.

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

## 7. Possible extensions

- Sprite/skeletal character art and running animation frames
- Power-ups (magnet, jetpack, score multiplier, shield)
- Sound effects and music
- A real 3D version with Three.js (models, textured trains, a proper city)
- Missions / daily challenges and a coin shop
