# BF1942 WEB — Project Outpost

Independent research project exploring how to run the **original PC game Battlefield 1942 (2002)** in a modern web browser, with a focus on Android touch controls.

**State: Stage 0 / project foundation. This is not a playable port.** The site is a responsive project page with browser feature diagnostics and local game archive header checks. No game engine, rendering of original maps, AI, sound, gameplay, or multiplayer has been implemented yet.

## What's functional now

- Responsive Russian-language project home page, compatible with GitHub Pages.
- Browser diagnostics: WebAssembly, WebGL 2, WebGPU adapter, and cross-origin isolation for WASM threads.
- Local-only `.rfa`, `.con`, `.exe` file selection; file-size reporting and best-effort first-four-bytes RFA header check.
- Manifest download in JSON, containing only file names, sizes, and checks. No files are transmitted or uploaded.

## Publish on GitHub Pages (Android-friendly)

1. Sign in to GitHub and create a **public** repository, for example `bf1942-web`.
2. Tap **Add file → Upload files**; upload `index.html` and `README.md` from this starter package to the repository root. Commit to `main`.
3. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, branch `main`, folder `/(root)` and save.
4. When GitHub finishes publishing, the page should be available at `https://Rokiru.github.io/bf1942-web/`.
5. For development, keep game data outside the public repository.

No deployment workflow or paid server is required for the static project page.

## Long-term engineering targets

See [docs/ROADMAP.md](docs/ROADMAP.md) for the feasibility gates. Options to research include:

- Original PC executable analysis and game-version identification.
- Browser-compatible static recompilation **if feasible**, or a carefully scoped interoperable engine implementation if not; neither is accomplished yet.
- RFA reading (LZO), `.con` configs, terrain, meshes (`.sm`), DDS and other game formats.
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