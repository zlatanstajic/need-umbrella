# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page weather app for Serbia — current conditions + 24h rain outlook.
Everything lives in one self-contained [index.html](index.html): inline CSS,
vanilla ES5-style JS (`var`, `function`, no modules). **No build step, no
dependencies, no tests, no package.json.** Deployed via GitHub Pages
(`.nojekyll` present) at https://zlatanstajic.github.io/need-umbrella/.

## Develop / run

Open [index.html](index.html) in a browser, or serve locally:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

No lint/test/build commands exist. Changes are validated by loading in browser.

## Architecture

All logic in the `<script>` block of [index.html](index.html). Single data
source: MET Norway Locationforecast 2.0 **compact** endpoint
(`api.met.no/.../compact?lat=&lon=`). No API key.

Core flow: `loadWeather(lat, lon, name)` is the one entry point — rounds coords
to 4 decimals (`round4`), shows loading state, fetches, then calls
`renderCurrent(timeseries[0], name)` and `renderPrecip(timeseries)`.

UI is state-swapping, not a framework: `showOnly(el)` toggles `.hidden` across
the loading / error / weather sections. `showNotice`/`clearNotice` drive the
amber fallback banner.

Three location inputs all funnel into `loadWeather`:
- **GPS** — `navigator.geolocation`; any denial/error/unavailable falls back to
  `BELGRADE` constant with a notice.
- **City** — dropdown built from the `CITIES` array (index is the option value).
- **Manual** — lat/lon validated (`-90..90`, `-180..180`, numeric) before fetch.

Belgrade auto-loads on `DOMContentLoaded`.

## Conventions that matter when editing

- **MET symbol_code mapping**: `symbolToEmoji` and `describe` both strip
  `_day`/`_night`/`_polartwilight` suffixes, then look up a base code. Keep the
  two maps in sync. Unmatched codes fall back to `🌡️` / "Current conditions".
- **Precipitation window**: `renderPrecip` floors `now` to the top of the
  current hour so `timeseries[0]` is included, sums `next_1_hours` precip over
  the next 24h. Boundary entries may lack `next_1_hours` — treated as 0 mm.
  Rain banner triggers at `PRECIP_THRESHOLD_MM` (0.1).
- **Chart** is built with DOM methods only (`createElement`/`appendChild`), no
  innerHTML — preserve this; bar heights are percentages of the window max.
- Style is intentionally pre-ES6 (`var`, no arrow funcs, no template literals).
  Match it. CSS uses `:root` custom properties — reuse the existing vars.

Note: `.vscode/` is gitignored, so the committed VS Code color settings won't
appear in clones.
