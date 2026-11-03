# BF1942 WEB — Project Outpost

Independent reverse-engineering research project exploring whether the **original PC game Battlefield 1942 (2002)** can run in a modern browser, with Android touch devices as a primary target.

**Current status: PRE-ALPHA / NOT PLAYABLE.** The site, local RFA directory reader and touch-layout editor are available. There is no ported game engine, rendered original map, AI, sound, gameplay or multiplayer yet. RFA parsing has synthetic tests but still needs validation against user-provided archives.

## Available now

- Mobile-first Russian project page for GitHub Pages.
- External reference link to the [Battlefield 1942: World War II Anthology page on My Abandonware](https://www.myabandonware.com/game/battlefield-1942-world-war-ii-anthology-p1y). The project does not host, mirror or endorse the legality of third-party downloads; check your local law and use a copy you are entitled to use.
- Browser capability checks: WebAssembly, WebGL 2, WebGPU adapter and cross-origin isolation for WASM threads.
- Local-only `.rfa` / `.con` file selection; RFA directory formats **1.0 and 1.1**, embedded filename search and bounded input checks.
- Text preview for **uncompressed** `.con` / `.inc` / `.txt` / `.cfg` entries (512 KiB cap). **LZO-compressed archive data is not yet extracted.**
- JSON report of local file metadata and RFA paths. The files themselves are not uploaded.
- Touch HUD layout editor with separate infantry and vehicle layouts. Controls can be dragged with touch or mouse, moved with keyboard arrows, resized, made more/less transparent, saved in local browser storage, reset and exported as JSON.
- Synthetic, non-proprietary parser tests: `node --test tests/rfa.test.mjs`.

## Important touch-control limitation

The HUD editor is currently a **layout configurator and preview**, not live gameplay input. It does not control a running Battlefield session because the browser game engine has not been ported. The saved layout format is a foundation for the future in-game HUD integration.

## GitHub Pages

1. Repository: [Rokiru/bf1942-web](https://github.com/Rokiru/bf1942-web).
2. In **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/(root)`.
3. After GitHub Pages reports a successful deployment, open [https://rokiru.github.io/bf1942-web/](https://rokiru.github.io/bf1942-web/).
4. Keep original game files outside this public repository.

The project page is static and does not require a paid server. A future multiplayer service would require separate infrastructure.

## Current development

The site and touch HUD configurator are prototypes. Next: validate RFA parsing with locally selected archives and expand local extraction/preview. Then inspect the original map's resource formats and test rendering on Android. No game engine or playable port exists yet.

## Rights and safety

Battlefield 1942 and its associated assets are owned by their respective rights holders. This independent fan/research project is not affiliated with or endorsed by EA or DICE. **Do not commit, upload, bundle or mirror proprietary game executables, `.rfa` archives, maps, music, video, sounds, textures, models or game code.** Only test with files you are legally entitled to use. Private experimentation does not automatically authorize redistribution. Review the licences of all third-party code before using it.
