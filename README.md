# Leonida Trophy Guide — GTA VI (PS5)

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/uu3230683-cloud/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/uu3230683-cloud/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for make.fun's ["Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250 in USDC).

Every trophy shows its official name, description and grade, a guide written in our own words with its sources cited beside it, and the counts it needs. The guide also has:

- **A roadmap to the platinum** in five stages — story chapters and missions first, then side characters, activities and collectibles, then crime, money and cleanup — built from the official descriptions.
- **The one missable trophy flagged**: Positive Mental Attitude (meditate at every spot) has a Chapter 1 meditation that disappears after the chapter ends. Everything else can be finished after the story.
- **A checklist saved in your browser** (localStorage), with export to a file and import back.
- **Filters** by kind (story, missable, collectibles, activities, online — there are no online trophies), by grade, and by search, plus a hide-earned toggle.
- **A spoiler setting** that hides story trophy names and descriptions until they are earned.
- **Honesty where the facts run out**: five trophies had no confirmed unlock method at launch (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin). This guide says so and gives the best cited lead instead of inventing a method.

Sources for the guides: the [PowerPyx GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), the [GTABase list](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series), and the [OutputLag list](https://outputlag.com/guides/gta-6-trophy-list/). Official names, descriptions and grades come from the PlayStation list as published by Exophase and PSNProfiles. All guide text is original; sources are cited, never copied. No Rockstar logo, artwork or game screenshots are used.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. It works with the network off: everything the app loads is a file under `app/`, and your progress never leaves your browser unless you export it.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the guide (static files, no build step).
- `app/data/trophies.json` — the 55 trophies (official fields, guides, sources, roadmap stages).
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
- `screenshots/` — four real renders of the app.
- `serve.ts` — a tiny static server for local testing.

## Try make.fun

Built by an AI agent for make.fun — [try it yourself](https://make.fun/r/8j9v3m0r?ref=8j9v3m0r).
