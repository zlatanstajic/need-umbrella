import { RainThresholdState } from "./types";
import {
  PRECIP_THRESHOLD_MM,
  RAIN_THRESHOLD_MIN,
  RAIN_THRESHOLD_MAX,
  RAIN_THRESHOLD_DEFAULT
} from "./constants";
import { store } from "./store";
import { rainThresholdOn, rainThresholdMm } from "./state";

// ---- User-configurable rain threshold -----------------------------------
// A single helper (effectiveThreshold) is the ONLY place the enabled/disabled
// decision lives: every rain verdict (24h banner / isRain / header, per-hour
// window summary, 7-day forecast dry reading) routes its comparison through it,
// so raising the cutoff flips only verdicts — the real mm bars/amounts never
// change. Placement in the acyclic graph: this module depends on constants /
// store / state only, sitting at the strings/constants/geo layer; state.ts
// initializes its bindings straight from store.get (not from here) to avoid a
// state -> threshold -> state cycle.

// Coerce a numeric mm value into the usable range. Non-finite / NaN input (a
// cleared numeric field) becomes the default rather than clamping NaN, so the
// read path never feeds NaN into a comparison.
export function clampThreshold(mm: number): number {
  if (typeof mm !== "number" || !isFinite(mm)) { return RAIN_THRESHOLD_DEFAULT; }
  if (mm < RAIN_THRESHOLD_MIN) { return RAIN_THRESHOLD_MIN; }
  if (mm > RAIN_THRESHOLD_MAX) { return RAIN_THRESHOLD_MAX; }
  return mm;
}

// Read the persisted sub-key, coercing `on` to a real boolean and `mm` through
// clampThreshold. Absent sub-key returns the disabled default.
export function readRainThreshold(): RainThresholdState {
  var raw = store.get("rainThreshold", { on: false, mm: RAIN_THRESHOLD_DEFAULT });
  if (!raw) { return { on: false, mm: RAIN_THRESHOLD_DEFAULT }; }
  return { on: !!raw.on, mm: clampThreshold(Number(raw.mm)) };
}

// The one comparison cutoff. Reads the live state bindings so a toggle change
// takes effect without a refetch. Off => the built-in 0.1 baseline.
export function effectiveThreshold(): number {
  return rainThresholdOn ? clampThreshold(rainThresholdMm) : PRECIP_THRESHOLD_MM;
}

// Persist the validated state.
export function saveRainThreshold(on: boolean, mm: number): void {
  store.set("rainThreshold", { on: !!on, mm: clampThreshold(mm) });
}
