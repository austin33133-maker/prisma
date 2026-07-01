# DESIGN.md Library

Curated `DESIGN.md` design-system documents extracted from benchmark websites,
sourced from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(CC-licensed community collection).

Each folder holds one site's `DESIGN.md`: a plain-text design system (colors,
typography scale, component styling, layout rules) that an AI agent reads to
generate UI matching that site's visual language.

## How to use

Point an agent at one of these files:

> "Build a landing page using the design language in
> `.claude/design-md-library/linear.app/DESIGN.md`."

Pairs with the installed `design-md` / `extract-design-md` / `shadcn-ui` skills.

## Included (8 benchmark sites)

| Site | Vibe |
|------|------|
| linear.app | Near-black, lavender-blue accent, software-craft luxury |
| apple | Clean, spacious, product-hero scroll storytelling |
| stripe | Gradient fluid, developer-elegant |
| vercel | Monochrome, geometric, minimal high-contrast |
| notion | Warm, editorial, approachable |
| spotify | Bold, vibrant, content-forward dark |
| tesla | Cinematic, full-bleed, minimal automotive |
| figma | Playful, colorful, design-tool energy |

The full collection has 73 sites — pull more from the upstream repo as needed.
