# Contributing to Need Umbrella? ☔

Thanks for considering a contribution! This file explains the recommended way to
propose changes so they can be reviewed and merged quickly.

## What this project is

A zero-dependency, single-page weather app. **Everything lives in one
self-contained [`index.html`](index.html)** — inline CSS and vanilla
JavaScript. There is **no build step, no dependencies, no tests, and no
`package.json`**. The app is deployed via GitHub Pages at
https://zlatanstajic.github.io/need-umbrella/.

Before contributing, skim [`CLAUDE.md`](CLAUDE.md) — it documents the
architecture (the single `loadWeather` entry point, location descriptors, the
slot-based compare mode, the `STRINGS` i18n dictionary, etc.) and the
conventions that matter when editing.

## Quick start

- Fork the repository and create a branch for your change (use `feature/` or
  `fix/` prefixes).
- Make focused, small changes directly in [`index.html`](index.html).
- Test your change by loading the page in a browser (see below).
- Open a Pull Request (PR) describing the change and link any related issue.

## Develop / run

There is nothing to install. Open [`index.html`](index.html) directly in a
browser, or serve it locally:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

A local server is recommended so browser geolocation and the external APIs
behave the same as in production.

## Testing your change

There are no automated tests, no lint, and no build. **Changes are validated by
loading the page in a browser and exercising the affected paths.** Before
opening a PR, manually verify:

- The four location inputs still work: **GPS**, **City** dropdown, **Manual**
  lat/lon, and free-text **Search**.
- **Both languages** render correctly — switch between Serbian (Latin) and
  English in the Settings modal.
- **Saved locations** (save / rename / remove chips) and **Compare mode**
  behave, and both persist across a reload (they use `localStorage`).
- The current-conditions card, the 24-hour precipitation banner, and the hourly
  bar chart all render.
- No errors appear in the browser console.

## Conventions that matter when editing

These are the rules most likely to trip up a contribution. The full list is in
[`CLAUDE.md`](CLAUDE.md).

- **i18n** — all user-facing strings live in the `STRINGS` dictionary
  (`STRINGS.sr` Latin / `STRINGS.en`). **Any new string must be added to both
  language bundles.** Static DOM nodes use `data-i18n` /
  `data-i18n-placeholder` hooks; dynamic strings are read via `t(key)` /
  `tf(key, ...)`. Deliberate non-localized exceptions exist (unit suffixes,
  compass abbreviations, footer proper nouns) — see `CLAUDE.md`.
- **Pre-ES6 style** — the JavaScript is intentionally written in an old-school
  style: `var` (no `let`/`const`), `function` declarations (no arrow
  functions), string concatenation (no template literals), and no ES modules.
  **Match the surrounding style.**
- **Chart is built with DOM methods only** (`createElement` / `appendChild`),
  never `innerHTML`. Preserve this.
- **CSS uses `:root` custom properties** — reuse the existing variables rather
  than hard-coding colors.
- **No new dependencies or build step.** A change that requires npm, a bundler,
  or a framework is out of scope for this project — open an issue to discuss
  first.

## Issues

- Open an issue to start a discussion for larger changes or new features.
- For bug reports, include steps to reproduce, the browser and OS, the location
  input used, and any relevant console output.

## Pull Requests

- Keep PRs small and scoped to a single purpose.
- Use clear titles and a detailed description. Reference the issue number when
  applicable (e.g. "Fixes #123").
- Describe how you tested the change, and include screenshots when it affects
  the UI.

## Commit messages

- Use concise messages describing the change. Example formats:
  - `fix: correct compass direction for due-west wind`
  - `feat: add cloud-cover detail tile`

## License and conduct

- By contributing you agree your contributions will be licensed under the
  repository's MIT License (see [`LICENSE`](LICENSE.md)).
- Be respectful in issues and PRs.

## Contact

If you need to reach the maintainer directly, use <contact@zlatanstajic.com>.

Thanks — we appreciate your help improving the app!
