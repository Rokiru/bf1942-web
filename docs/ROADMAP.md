# BF1942 WEB — Technical feasibility & roadmap

**Goal:** Run the original Battlefield 1942 PC game faithfully in a browser, with touch controls on Android. This is a reverse-engineering research project; it is not a remake. GitHub Pages hosts only static files and cannot run a multiplayer game server.

## Stage 0 — Foundation (done)
- Responsive project website.
- Browser capability diagnostics and local-only RFA header inspection.
- Accurate status: not playable, no original game resources provided.

## Stage 1 — Read actual user-provided game files
**Success condition:** Browse entries in a real `.rfa` archive; extract a `.con` file; read map metadata; preview a permitted DDS from local user files. No game files are uploaded to the public repo.

- Validate RFA binary headers, tables, filenames, offsets and bounds.
- Research LZO1X decompression and version/archive precedence.
- Compare GPL-3.0 `librfa` and other references with a clean-room alternative; document licensing before reusing code.
- Test only with original synthetic fixtures in the repository.

## Stage 2 — Prove game engine feasibility
**Success condition:** Render an authentic map frame from locally supplied original resources on an Android browser.

- Determine and document one supported PC executable/version.
- Explore static x86-to-WASM translation plus Win32/Direct3D compatibility, or an interoperable engine built to read the game's data.
- A visual map renderer alone is NOT the original game and must never be presented as playable.
- Check WebGPU, WebGL 2, WASM memory/thread limits and phone performance. WASM threads require suitable cross-origin isolation.

## Stage 3 — Original gameplay
**Success condition:** Enter one original map and play its core mechanics in-browser.

- Soldier movement, collision, weapons, damage, spawns, HUD/audio.
- Vehicle physics and seat transitions.
- Control points, tickets, scoring and original game rules.

## Stage 4 — Complete experience
**Success condition:** Support original modes/maps, bots, equipment, saved preferences and mobile controls with acceptable performance.

- Multiplayer requires separate server software and hosting, not GitHub Pages.
- Compare gameplay against the original; document unsupported features honestly.

## Strict rules
- Never commit EA/DICE proprietary files, executables, archives, maps, textures, sound, music or game code.
- Work only with copies of data the user has permission to use.
- Preserve project independence; respect licenses of any third-party open-source code.
- Mark each milestone completed only when the implementation genuinely works in a browser.

## First Codex task
Work in this existing repo and implement **only Stage 1**: a real RFA archive directory reader for locally selected files, with safe bounds checking, clear errors and a small generated fixture/test. Investigate real file structure first; do not invent an RFA parser. Never commit actual EA/DICE assets. Keep the existing site layout working on Android. Report what was implemented, what's untested, and what's still missing. Avoid unnecessary repeated test runs, UI screenshots and unrelated refactors to save usage limits.
