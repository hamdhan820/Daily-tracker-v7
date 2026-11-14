# Daily Routine Tracker 3.3 — UI/UX research and design rationale

## Reference-product analysis

This redesign studies interaction patterns from established productivity products without copying their branding, artwork or exact screens.

- **Tiimo** — visual scheduling, colour-coded activity identity and visual focus timers. Reference: https://www.tiimoapp.com/
- **Structured** — a day represented as one readable timeline instead of a collection of unrelated task panels. Reference: https://apps.apple.com/us/app/structured-daily-planner-todo/id1499198946
- **Sunsama** — deliberate daily planning, timeboxing, focus mode and progress review. Reference: https://www.sunsama.com/daily-planning
- **Linear** — strong information hierarchy, consistent navigation, restrained use of accent colour and predictable interface behaviour. Reference: https://linear.app/now/behind-the-latest-design-refresh
- **Things 3** — clear task grouping, readable typography and low-friction task actions. Reference: https://culturedcode.com/things/

## Original design direction: Neon Pulse

The app now uses a midnight interface with electric cyan, ultraviolet and lime accents. The glow is reserved for important controls and active states; ordinary content stays readable and calm. This avoids turning every surface into a glowing box.

### Screen identities

- **Today:** command-centre welcome, live completion orbit, next-prayer strip and a continuous time-based activity rail.
- **Study:** a dedicated weekly timetable, subject-coloured blocks, study actions and exam planning.
- **Prayer:** a quieter prayer-centred screen with next-prayer timing, location/method controls and daily prayer schedule.
- **AI:** a focused study-assistant workspace with quick prompts, research toggle, conversation stream and a persistent composer.
- **Focus:** an immersive timer cockpit with a luminous circular timer, progress line, ambient sound and optional research access.
- **More:** a workspace launcher for weekly planning, calendar, insights, goals, settings and backup.

## Design and engineering principles

1. One semantic token system controls the background, text, muted text, surfaces, accents, borders and status colours across every theme.
2. The default Neon Pulse theme is dark; Aurora, Royal, Ocean, Sunset, Glass, Graphite, Dark and Pearl Light remain available.
3. Timetable entries use a shared timeline rail and status markers instead of repeated floating cards.
4. Motion is brief and purposeful: screen entrance, ambient background drift, focus-ring rotation and active-state feedback. Reduced-motion preferences are respected.
5. Controls retain visible labels, focus outlines and touch-sized targets. The layout adapts to narrow Android screens.
6. Existing data, prayer calculations, alarm integration, study planning, focus blocking, countdowns and the secure AI gateway are retained.
