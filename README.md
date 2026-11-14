# Daily Routine Tracker 3.3.0 — Neon Pulse

A mobile-first daily planning and study companion built with HTML, modern CSS, JavaScript and Capacitor. The Android APK is built by the existing GitHub Actions workflow.

## 3.3.0 visual redesign

- Replaced the accumulated, conflicting visual rules with one coherent design-token system.
- Introduced the Neon Pulse identity: midnight surfaces, electric cyan, ultraviolet and lime accents, ambient light, animated details and glass navigation.
- Rebuilt the Today welcome area with a live progress orbit and a more legible activity timeline.
- Added a dedicated workspace launcher for weekly planning, calendar, insights, goals, settings and backup.
- Restyled the first-run welcome, startup animation, focus timer, dialogs, inputs, timetable and AI workspace.
- Added Neon Pulse as the default theme and retained Aurora, Royal, Ocean, Sunset, Glass, Graphite, Dark and Pearl Light themes.
- Preserved existing routine data, prayer calculations, alarms, study timetable, focus blocking, countdowns and AI gateway logic.

## Project structure

- `index.html` — self-contained production interface and runtime.
- `styles.css` — matching design stylesheet reference.
- `app.js`, `prayer.js`, `enhancements.js` — corresponding JavaScript source sections.
- `worker/index.js` — optional secure OpenAI gateway.
- `done.yml` — existing GitHub Actions Android build workflow is kept in the repository.

## AI gateway

The app does not contain an OpenAI API key. Deploy `worker/index.js` as a Cloudflare Worker and store `OPENAI_API_KEY` as a Worker Secret. Configure `APP_VERSION=3.3.0` and `ALLOWED_ORIGINS=capacitor://localhost,http://localhost,https://localhost`, then save the Worker HTTPS URL in app Settings. Never put the API key in the app source or APK. API usage is billed separately from ChatGPT subscriptions.

## Build

The repository's existing GitHub Actions workflow builds the Android debug APK from the ZIP package.
