# SINDH POLE RUNNER — "Road Bani, Pole Nahi Hata!"
Created by Qayyum Bhatti. Pure HTML/CSS/vanilla JS, Canvas 2D, no build step.

**Run locally:** `python3 -m http.server 8080` then open http://localhost:8080 (service workers need localhost or HTTPS).
**Deploy:** upload the folder as-is to Vercel (`vercel.json` included), Netlify, or Cloudflare Pages (no build command, output dir = root). All three serve HTTPS.
**Install (Android Chrome):** open the site → menu ⋮ → Install app (or tap the in-game "Install app" button). Works offline after first load.
**Controls:** swipe left/right = lane, up = jump, down = slide, double-tap = jump (uses Emergency Jump in air). Desktop: arrow keys / Space, P or Esc = pause.
**Music:** a synthesized Sindhi-scale placeholder plays by default. To use your own authorized track (e.g. Aly Khan), it is already at `assets/audio/music.mp3` (decoded and looped seamlessly via Web Audio); replace that file to change it. Bump `V` in `service-worker.js` when you change files.
**Saves:** localStorage (best score, coins, distance, characters, audio settings).

## Updated driving controls and satire events

- Mobile on-screen LEFT / RIGHT buttons and keyboard ArrowLeft/ArrowRight (A/D) steer the car.
- Jump and slide input actions have been removed from the driving controls.
- Political/comedy slogans now trigger from collision categories (pole, pothole, banner, wires, traffic, severe crash), not from a random timer.
- This repository is a Canvas 2D perspective PWA. The update improves the existing renderer and gameplay; it does **not** claim to introduce true 3D vehicle models or a 3D physics engine.
