# BF1942 WEB — Project Outpost

Independent research project exploring how to run the **original PC game Battlefield 1942 (2002)** in a modern web browser, with a focus on Android touch controls.

**State: Stage 1 / partial RFA reader. NOT a playable game.** Browser-based archive directory listing implemented, but compatibility is tested only using synthetic `.rfa` files so far. No game engine, original map rendering, AI, sound, gameplay, or multiplayer is implemented.

## What's functional now

- Responsive Russian-language project home page, compatible with GitHub Pages.
- Browser diagnostics: WebAssembly, WebGL 2, WebGPU adapter, and cross-origin isolation for WASM threads.
- Local-only `.rfa` and `.con` file selection; supports RFA directory formats **1.0 and 1.1** and searches embedded filenames.
- Text preview for **uncompressed** `.con` / `.inc` / `.txt` / `.cfg` entries (512 KiB cap). **LZO-compressed entries are not yet extracted.**
- Metadata/report download as JSON. No local game files are transmitted or uploaded.
- Synthetic non-proprietary tests: `node --test tests/rfa.test.mjs`.

## Publish on GitHub Pages (Android-friendly)

1. This public repository is already created: [Rokiru/bf1942-web](https://github.com/Rokiru/bf1942-web).
2. Repo already includes `index.html`, `rfa.mjs`, `README.md`, and synthetic parser tests; no manual upload is needed.
3. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, branch `main`, folder `/(root)` and save.
4. Once GitHub Pages reports a successful deployment, open `https://rokiru.github.io/bf1942-web/`.
5. For development, keep game data outside the public repository.

No deployment workflow or paid server is required for the static project page.

## Long-term engineering targets

See [docs/ROADMAP.md](docs/ROADMAP.md) for the feasibility gates. Options to research include:

- Original PC executable analysis and game-version identification.
- Browser-compatible static recompilation **if feasible**, or a carefully scoped interoperable engine implementation if not; neither is accomplished yet.
- Full RFA LZO1X extraction, `.con` configs, terrain, meshes (`.sm`), DDS and other game formats.
- Rendering, gameplay simulation, vehicle physics, AI and audio, all checked against the original game.
- Touch controls, performance profiling, optional separate multiplayer server (GitHub Pages cannot host that server).

## Useful resources

- [RefractorForge](https://github.com/luccawulf/RefractorForge) — open-source map editor / archive format reference; **GPL-3.0**, not a browser game engine.
- [librfa](https://github.com/c0d3m4nc3r/librfa) — C library for RFA archives; **GPL-3.0**. GPL obligations apply if incorporating its code into this project.
- [Battlefield 1942 original game file layout](https://bfmods.com/mdt/Tutorials/Overview/Overview.html).
- [NFSU2 browser port](https://github.com/th0mk/nfsu2-web) — architectural reference, not an engine drop-in.

## Rights and safety

Battlefield 1942 and associated assets are the property of their respective rights holders. This is an independent fan/research project, not affiliated with or endorsed by EA or DICE. **Do not commit, upload, or bundle any proprietary game EXEs, `.rfa` archives, music, video, sounds, textures, or models.** Users must supply files from a copy they are permitted to use. Reverse engineering and distribution rules depend on your jurisdiction; private experimentation does not automatically authorize redistribution.

No license is applied to third-party code. Any future adoption of GPL-licensed code must comply with that project's terms.