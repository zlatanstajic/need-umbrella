import { Lang, LocationDescriptor } from "./types";
import { store } from "./store";

// ---- Mutable app state --------------------------------------------------
// Centralized here so every module reads the same live bindings. ES module
// live bindings mean importers see updates; reassignment must go through the
// setter functions below (an imported binding can't be assigned from outside
// its module). Behavior is identical to the former module-level `var`s.

export let currentLang: Lang = (function (): Lang {
  var saved = store.get("lang", "sr");
  return (saved === "sr" || saved === "en") ? saved : "sr";
})();
export function setCurrentLang(v: Lang): void { currentLang = v; }

// The currently displayed location, kept so setLanguage() can re-fetch the
// same place and so the badge can be recomposed in the active language.
export let currentLocation: LocationDescriptor | null = null;
export function setCurrentLocation(v: LocationDescriptor | null): void { currentLocation = v; }

// Compare mode: on/off + slot-B descriptor are persisted. secondaryLocation
// is the slot-B descriptor (null until a slot-B location is chosen).
export let compareMode = false;
export function setCompareMode(v: boolean): void { compareMode = v; }

export let secondaryLocation: LocationDescriptor | null = null;
export function setSecondaryLocation(v: LocationDescriptor | null): void { secondaryLocation = v; }

// 7-day forecast mode. Persisted, off by default. Slot B's forecast rows
// render alongside slot A whenever compare mode is also on.
export let forecastMode = false;
export function setForecastMode(v: boolean): void { forecastMode = v; }

// Guards against the echo when linked chart scrolling sets scrollLeft.
export let syncingScroll = false;
export function setSyncingScroll(v: boolean): void { syncingScroll = v; }

// User-configurable rain threshold. Initialized directly from store.get (NOT
// from threshold.readRainThreshold) so state stays below threshold in the
// import graph — threshold.effectiveThreshold() reads these live bindings.
// The default 0.5 is inlined here (rather than imported from constants) because
// constants.ts imports from state, so a state -> constants import would cycle.
export let rainThresholdOn = (function (): boolean {
  var raw = store.get("rainThreshold", { on: false, mm: 0.5 });
  return !!(raw && raw.on);
})();
export function setRainThresholdOn(v: boolean): void { rainThresholdOn = v; }

export let rainThresholdMm = (function (): number {
  var raw = store.get("rainThreshold", { on: false, mm: 0.5 });
  var mm = raw ? Number(raw.mm) : 0.5;
  return (typeof mm === "number" && isFinite(mm)) ? mm : 0.5;
})();
export function setRainThresholdMm(v: number): void { rainThresholdMm = v; }
