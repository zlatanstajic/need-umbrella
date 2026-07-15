import { CompareState, LocationDescriptor, SavedEntry } from "./types";
import { store } from "./store";
import { CITIES, cityName } from "./constants";
import { tf } from "./strings";
import { compareMode, secondaryLocation } from "./state";
import { round4, validLatLon } from "./util";

// Compose the location badge text for a descriptor in the active language.
export function badgeFor(loc: LocationDescriptor | null): string {
  if (!loc) { return ""; }
  if (loc.type === "city") {
    var city = CITIES[loc.cityIndex];
    return city ? cityName(city) : "";
  }
  // A saved custom title for these coords wins over coords / geocoding.
  var custom = savedNameFor(loc.lat, loc.lon);
  if (custom) { return custom; }
  if (loc.type === "gps") {
    return tf("myLocation", loc.lat, loc.lon);
  }
  // manual: numeric coordinates are language-neutral.
  return loc.lat + ", " + loc.lon;
}

// Persist a location descriptor so the last pick reloads next visit.
export function saveLocation(loc: LocationDescriptor): void {
  store.set("loc", loc);
}

// Validate a parsed location descriptor; returns a clean copy or null.
export function parseDescriptor(loc: unknown): LocationDescriptor | null {
  if (!loc || typeof loc !== "object") { return null; }
  var d = loc as { type?: unknown; cityIndex?: unknown; lat?: unknown; lon?: unknown };
  if (d.type === "city") {
    if (typeof d.cityIndex === "number" && CITIES[d.cityIndex]) {
      return { type: "city", cityIndex: d.cityIndex };
    }
    return null;
  }
  if (d.type === "gps" || d.type === "manual") {
    if (validLatLon(d.lat, d.lon)) {
      return { type: d.type, lat: d.lat as number, lon: d.lon as number };
    }
    return null;
  }
  return null;
}

// Read and validate a stored descriptor; null if absent/malformed.
export function loadSavedLocation(): LocationDescriptor | null {
  return parseDescriptor(store.get("loc", null));
}

// Persist the compare-mode state (on/off + slot-B descriptor) so a
// comparison is restored next visit.
export function saveCompareState(): void {
  store.set("compare", {
    on: compareMode,
    loc: secondaryLocation
  });
}

// Read and validate the stored compare state; null if absent/malformed/off.
export function loadCompareState(): CompareState | null {
  var state = store.get("compare", null);
  if (!state || typeof state !== "object" || !state.on) { return null; }
  var loc = parseDescriptor(state.loc);
  if (!loc) { return null; }
  return { on: true, loc: loc };
}

// ---- Saved (favorite) locations -----------------------------------------
// A user-curated list of custom coordinates, persisted as a JSON array of
// { lat, lon, name? } — `name` is an optional user title that overrides the
// reverse-geocoded label. Rendered as clickable chips on the GPS tab.
export function readSavedLocations(): SavedEntry[] {
  var list = store.get("saved", [] as SavedEntry[]);
  if (!Array.isArray(list)) { return []; }
  return list.filter(function (s: SavedEntry) {
    return s && validLatLon(s.lat, s.lon);
  });
}

export function writeSavedLocations(list: SavedEntry[]): void {
  store.set("saved", list);
}

// Custom title saved for these exact coords, or null. Coords are compared
// round4'd to match how saved entries (and loadWeather) round them.
export function savedNameFor(lat: number, lon: number): string | null {
  var rLat = round4(lat);
  var rLon = round4(lon);
  var match = readSavedLocations().filter(function (s) {
    return s.lat === rLat && s.lon === rLon && s.name;
  })[0];
  return match ? (match.name as string) : null;
}

// Resolve a descriptor's rounded coords (cities resolve via CITIES).
export function coordsFor(loc: LocationDescriptor): { lat: number; lon: number } {
  var coords: { lat: number; lon: number } =
    loc.type === "city" ? CITIES[loc.cityIndex] : loc;
  return { lat: round4(coords.lat), lon: round4(coords.lon) };
}

export function metUrl(lat: number, lon: number): string {
  var params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  return "https://api.met.no/weatherapi/locationforecast/2.0/compact?" + params.toString();
}
