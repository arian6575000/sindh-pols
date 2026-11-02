# SINDH POLE RUNNER — "Road Bani, Pole Nahi Hata!"
Created by Qayyum Bhatti. Pure HTML/CSS/vanilla JS, Canvas 2D, no build step.

**Run locally:** `python3 -m http.server 8080` then open http://localhost:8080 (service workers need localhost or HTTPS).
**Deploy:** upload the folder as-is to Vercel (`vercel.json` included), Netlify, or Cloudflare Pages (no build command, output dir = root). All three serve HTTPS.
**Install (Android Chrome):** open the site → menu ⋮ → Install app (or tap the in-game "Install app" button). Works offline after first load.
**Controls:** swipe left/right = lane, up = jump, down = slide, double-tap = jump (uses Emergency Jump in air). Desktop: arrow keys / Space, P or Esc = pause.
**Music:** a synthesized Sindhi-scale placeholder plays by default. To use your own authorized track (e.g. Aly Khan), save it as `assets/audio/music.mp3` (compressed, looped automatically). Bump `V` in `service-worker.js` when you change files.
**Saves:** localStorage (best score, coins, distance, characters, audio settings).
