# Need Umbrella? ☔

A zero-dependency, single-page weather app for anywhere in the world. It shows
current conditions and a 24-hour precipitation outlook so you know whether to
grab an umbrella, and it is bilingual (Serbian / English). Everything lives in
one self-contained `index.html` (inline CSS and vanilla JavaScript, no build
step).

**Live:** https://zlatanstajic.github.io/need-umbrella/

## Features

Current conditions (large temperature, weather emoji, description) plus detail
tiles for relative humidity, wind speed with 16-point compass direction, air
pressure, and cloud cover. After weather loads, the page title and header update
to reflect whether rain is expected. A 24-hour section sums hourly precipitation,
displays a rain / no-rain banner, and renders a scrollable hourly bar chart.

### Four ways to pick a location

1. **GPS** — uses your device location via the browser geolocation API. On
   denial, error, or unavailability it falls back to Belgrade with a notice.
2. **City** — a dropdown of six preset cities (Belgrade, Novi Sad, Kragujevac,
   Nis, Pozarevac, Jagodina) with verified coordinates, offered as a
   convenience shortcut. Option labels follow the active language.
3. **Manual** — enter latitude (-90..90) and longitude (-180..180); inputs are
   validated before any request and coordinates are rounded to 4 decimals.
4. **Search** — type a place name; results are fetched from the
   [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org/) geocoding
   API (up to 6 results) and displayed as clickable buttons.

The last-loaded location is saved to `localStorage` and restored on the next
visit; Belgrade is the fallback (and loads automatically on first visit).

### Saved locations

GPS, manual, and searched coordinates can be saved with a **Save location**
button (on the Manual and Search tabs). Saved entries appear as clickable chips
in the GPS tab — each loads instantly, can be renamed (✎) or removed (✕). A
custom name, when set, is shown verbatim and wins over reverse-geocoding;
otherwise the chip label is reverse-geocoded (and cached). The save button is
disabled when the current location is a preset city or already saved.

### Compare two cities

A **Compare** toggle in settings enables a side-by-side view of two locations.
The second slot has its own full set of GPS / City / Manual / Search inputs and
its own saved-location chips. The header rain indicator turns to "need
umbrella" when *either* location expects rain. The compare state (on/off plus
the second location) persists to `localStorage` and is restored on the next
visit.

### Settings

A gear button (⚙️) fixed in the top-right corner opens a settings modal
containing:

- **Language** — switch between Serbian (Latin script) and English. The
  first-ever visit defaults to Serbian; the choice is saved to `localStorage`
  and restored on later visits. Switching re-fetches the current location so
  all dynamic text reloads in the new language.
- **Show location selector** — a toggle to hide or reveal the entire location
  selector panel. The preference is persisted in `localStorage`.
- **Compare** — a toggle that enables the two-location comparison view (see
  below). The state is persisted in `localStorage`.

### Home screen install (iOS / Android)

The app can be saved to the home screen for an app-like experience:

- **iOS (Safari):** Share → Add to Home Screen. Launches full-screen without
  browser chrome, using the `apple-touch-icon.png` (180×180) as the icon.
- **Android (Chrome):** Menu → Add to Home Screen, or accept the install
  prompt. Uses the `theme-color` meta tag to tint the system UI.

## Data and attribution

Weather data from [MET Norway](https://www.met.no/) via the Locationforecast
2.0 compact API, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## License

MIT — see [LICENSE](LICENSE.md).
