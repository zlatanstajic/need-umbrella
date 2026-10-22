import { City, LocationDescriptor } from "./types";
import { currentLang } from "./state";

// ---- Constants ----------------------------------------------------------
// City display names carry localized variants ({ sr, en }); only lat/lon
// are sent to MET. The badge and dropdown labels follow the active language.
export var CITIES: City[] = [
  { key: "belgrade", names: { sr: "Beograd", en: "Belgrade" }, lat: 44.8176, lon: 20.4633 },
  { key: "novisad", names: { sr: "Novi Sad", en: "Novi Sad" }, lat: 45.2671, lon: 19.8335 },
  { key: "kragujevac", names: { sr: "Kragujevac", en: "Kragujevac" }, lat: 44.0128, lon: 20.9114 },
  { key: "nis", names: { sr: "Niš", en: "Nis" }, lat: 43.3209, lon: 21.8954 },
  { key: "pozarevac", names: { sr: "Požarevac", en: "Pozarevac" }, lat: 44.6212, lon: 21.1867 },
  { key: "jagodina", names: { sr: "Jagodina", en: "Jagodina" }, lat: 43.9772, lon: 21.2611 },
  { key: "krusevac", names: { sr: "Kruševac", en: "Krusevac" }, lat: 43.5800, lon: 21.3339 },
  { key: "cacak", names: { sr: "Čačak", en: "Cacak" }, lat: 43.8914, lon: 20.3497 },
  { key: "uzice", names: { sr: "Užice", en: "Uzice" }, lat: 43.8556, lon: 19.8425 },
  { key: "kraljevo", names: { sr: "Kraljevo", en: "Kraljevo" }, lat: 43.7231, lon: 20.6875 }
];

// Default-load / GPS-fallback location descriptor (Belgrade is CITIES[0]).
export var BELGRADE: LocationDescriptor = { type: "city", cityIndex: 0 };

// Resolve a city's display name in the active language.
export function cityName(city: City): string {
  return (city.names && city.names[currentLang]) || (city.names && city.names.en) || "";
}

export var PRECIP_THRESHOLD_MM = 0.1;

// User-configurable rain-threshold bounds (see src/threshold.ts). The default
// applies on first visit / when the numeric field is cleared; the min matches
// the built-in baseline so a user can never lower the cutoff below it.
export var RAIN_THRESHOLD_MIN = 0.1;
export var RAIN_THRESHOLD_MAX = 100;
export var RAIN_THRESHOLD_DEFAULT = 0.5;
