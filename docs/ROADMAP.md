# BF1942 WEB — Technical feasibility & roadmap

**Goal:** Run the original Battlefield 1942 PC game faithfully in a modern browser, with Android touch controls. This is a reverse-engineering research project, not a remake. GitHub Pages hosts the static project page only; it cannot run a multiplayer game server.

## Stage 0 — Project foundation (done)

- Mobile-first project website and GitHub Pages layout.
- Browser capability diagnostics and local-only RFA inspection.
- External reference link to the selected Anthology page; no game files are hosted here.
- Accurate status: the game is not playable in this repository.

## Stage 0.5 — Touch interface prototype (editor available; gameplay integration pending)

- Implemented: separate infantry and vehicle HUD layouts.
- Implemented: touch/mouse dragging, keyboard nudging, size and opacity controls, local save, reset and JSON export.
- Pending: connect layout coordinates to the real in-game HUD after an engine/input layer exists.
- Do not present the preview as working game controls.

## Stage 1 — Read user-provided game files (PARTIAL)

**Success condition:** Browse a real user-provided `.rfa`; extract a `.con`; read map metadata; preview a permitted DDS from local files. No proprietary data is uploaded to this public repository.

- Implemented: RFA 1.0/1.1 directory listing, filenames, offsets, input bounds checks, synthetic regression tests and uncompressed CON text preview.
- Pending: validate against real user-owned archives; implement LZO1X extraction; inspect DDS textures and terrain.
- Research LZO1X decoding and archive/version precedence.
- Compare GPL-3.0 `librfa` and other references with a clean-room implementation; document licensing before reusing code.
- Run synthetic tests with `node --test tests/rfa.test.mjs`; never commit game archives.

## Stage 2 — Prove engine feasibility

**Success condition:** Render an authentic map frame from locally supplied original resources in an Android browser.

- Identify and document one supported PC executable and game version.
- Investigate static x86-to-WASM translation plus Win32/Direct3D compatibility, or an interoperable engine built to read the game's data. Neither is implemented.
- A map viewer or asset preview is not the original game and must not be described as playable.
- Check WebGPU, WebGL 2, WASM memory/thread limits and device performance. WASM threads require suitable cross-origin isolation.

## Stage 3 — Original gameplay

**Success condition:** Enter one original map and play the core mechanics in-browser.

- Soldier movement, collision, weapons, damage, spawns, HUD and audio.
- Vehicle physics and seat transitions.
- Control points, tickets, scoring and original game rules.
- Integrate saved touch-layout profiles with the real input/HUD layer.

## Stage 4 — Complete experience

**Success condition:** Support original modes/maps, bots, equipment, saved preferences and mobile controls with acceptable performance.

- Multiplayer requires separate server software and hosting, not GitHub Pages.
- Compare gameplay with the original and document unsupported features honestly.

## Strict project rules

- Never commit EA/DICE proprietary files, executables, archives, maps, textures, sound, music or game code.
- Work only with user-provided files they have permission to use.
- Respect all third-party open-source licences; do not copy GPL code without meeting its terms.
- Mark milestones complete only after the implementation genuinely works and has been tested.
