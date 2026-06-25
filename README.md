# Need Umbrella? ☔

A zero-dependency, single-page weather app for Serbia. It shows current
conditions and a 24-hour precipitation outlook so you know whether to grab an
umbrella. Everything lives in one self-contained `index.html` (inline CSS and
vanilla JavaScript, no build step).

**Live:** https://zlatanstajic.github.io/need-umbrella/

## Features

Current conditions (large temperature, weather emoji, description) plus detail
tiles for relative humidity, wind speed with 16-point compass direction, air
pressure, and cloud cover. A 24-hour section sums hourly precipitation,
displays a rain / no-rain banner, and renders a scrollable hourly bar chart.

### Three ways to pick a location

1. **GPS** — uses your device location via the browser geolocation API. On
   denial, error, or unavailability it falls back to Belgrade with a notice.
2. **City** — a dropdown of six Serbian cities (Belgrade, Novi Sad, Kragujevac,
   Nis, Pozarevac, Jagodina) with verified coordinates.
3. **Manual** — enter latitude (-90..90) and longitude (-180..180); inputs are
   validated before any request and coordinates are rounded to 4 decimals.

Belgrade loads automatically on first visit.

## Data and attribution

Weather data from [MET Norway](https://www.met.no/) via the Locationforecast
2.0 compact API, licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## License

MIT — see [LICENSE](LICENSE.md).
