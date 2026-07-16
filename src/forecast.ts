import { DailyBucket, MetTimeseriesEntry, Slot } from "./types";
import { t } from "./strings";
import { store } from "./store";
import { compareMode, forecastMode, setForecastMode } from "./state";
import { el } from "./dom";
import { primarySlot, secondarySlot } from "./dom";
import { symbolToEmoji, describe } from "./render";

// ---- 7-day forecast -----------------------------------------------------
// Bucket the already-fetched compact timeseries into up to 7 local calendar
// days (row 0 = today, partial). Per bucket track min/max instant temperature
// and total precipitation, plus a representative symbol_code. Precip prefers
// next_1_hours per entry and falls back to next_6_hours only when next_1_hours
// is absent — hourly-region entries (1h-spaced, next_1_hours) and coarse-region
// entries (6h-spaced, next_6_hours) then tile each day.
// Known bounded approximation: next_6_hours windows are UTC-aligned while
// buckets are local calendar days, so in any non-UTC timezone a 6h block can
// straddle local midnight yet have its full total attributed to a single day.
// This skews the daily precip total at every day boundary within the 6-hourly
// region (not just the hourly->6-hourly transition day), and the transition
// boundary can additionally overlap or gap against the last summed
// next_1_hours hour. Each is at most a few hours' precip. Accepted as-is.
export function dailyBuckets(timeseries: MetTimeseriesEntry[]): DailyBucket[] {
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayMs = todayStart.getTime();

  var order: string[] = [];
  var map: Record<string, DailyBucket> = {};

  for (var i = 0; i < timeseries.length; i++) {
    var entry = timeseries[i];
    var d = new Date(entry.time);
    if (d.getTime() < todayMs) { continue; }

    var key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    var bucket = map[key];
    if (!bucket) {
      bucket = {
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        min: null,
        max: null,
        precip: 0,
        symbol: "",
        bestDelta: Infinity
      };
      map[key] = bucket;
      order.push(key);
    }

    var det = entry.data && entry.data.instant && entry.data.instant.details;
    if (det && typeof det.air_temperature === "number") {
      if (bucket.min === null || det.air_temperature < bucket.min) {
        bucket.min = det.air_temperature;
      }
      if (bucket.max === null || det.air_temperature > bucket.max) {
        bucket.max = det.air_temperature;
      }
    }

    // Prefer next_1_hours, fall back to next_6_hours (never both).
    var block = (entry.data && entry.data.next_1_hours) ||
      (entry.data && entry.data.next_6_hours);
    if (block && block.details && typeof block.details.precipitation_amount === "number") {
      bucket.precip += block.details.precipitation_amount;
    }

    // Representative symbol: the summary carried by the entry nearest local 12:00.
    if (block && block.summary && block.summary.symbol_code) {
      var delta = Math.abs(d.getHours() - 12);
      if (delta < bucket.bestDelta) {
        bucket.bestDelta = delta;
        bucket.symbol = block.summary.symbol_code;
      }
    }
  }

  var days = [];
  for (var j = 0; j < order.length && j < 7; j++) {
    days.push(map[order[j]]);
  }
  return days;
}

// Render up to 7 day rows into the given slot's forecast list, DOM methods
// only. Row 0 uses the localized "today" label; later rows use the
// localized short weekday.
export function renderDaily(timeseries: MetTimeseriesEntry[], slot: Slot): void {
  var list = slot.forecastList;
  if (!list) { return; }
  // Mirror the chart's per-slot location label so the forecast rows are
  // attributable in compare mode.
  if (slot.forecastLabel && slot.chartLabel) {
    slot.forecastLabel.textContent = slot.chartLabel.textContent;
  }
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  var buckets = dailyBuckets(timeseries);
  var dayNames = t("days");

  for (var i = 0; i < buckets.length; i++) {
    var b = buckets[i];

    var row = document.createElement("div");
    row.className = "forecast-day";

    var dow = document.createElement("span");
    dow.className = "forecast-dow";
    dow.textContent = (i === 0)
      ? t("today")
      : ((dayNames && dayNames[b.date.getDay()]) || "");
    row.appendChild(dow);

    var emoji = document.createElement("span");
    emoji.className = "forecast-emoji";
    emoji.textContent = b.symbol ? symbolToEmoji(b.symbol) : "";
    row.appendChild(emoji);

    var desc = document.createElement("span");
    desc.className = "forecast-desc";
    // Empty symbol => no symbol_code in this bucket; leave blank rather than
    // calling describe("") which yields the present-tense "Current conditions".
    desc.textContent = b.symbol ? describe(b.symbol) : "";
    row.appendChild(desc);

    var temp = document.createElement("span");
    temp.className = "forecast-temp";
    var hi = (b.max === null) ? "--" : Math.round(b.max);
    var lo = (b.min === null) ? "--" : Math.round(b.min);
    temp.textContent = hi + "°C / " + lo + "°C";
    row.appendChild(temp);

    var precip = document.createElement("span");
    precip.className = "forecast-precip";
    // The forecast row carries no dry/wet verdict today — it prints only the
    // real mm total plus the symbol/description (which come from symbol_code,
    // not precip). Per the resolved design decision, the rain-threshold feature
    // leaves the forecast visuals untouched: effectiveThreshold() is applied
    // only where a verdict already exists (banner/isRain/header, per-hour
    // window). No dry/wet class is added here.
    precip.textContent = b.precip.toFixed(1) + " mm";
    row.appendChild(precip);

    list.appendChild(row);
  }
}

// ---- 7-day forecast mode (persisted) -------------------------------------
export var forecastToggle = el<HTMLInputElement>("forecast-toggle");

// Persisted off by default (sub-key absent → false → off).
export function readForecastMode() {
  return store.get("forecast", false) === true;
}

// Show/hide the forecast section, sync the checkbox, persist the state, and
// render from each slot's stashed timeseries when turning on (slot B only
// when compare mode is also active).
export function applyForecastMode(on: boolean): void {
  setForecastMode(on);
  var section = document.getElementById("forecast-section");
  if (section) { section.classList.toggle("hidden", !on); }
  if (forecastToggle) { forecastToggle.checked = on; }
  store.set("forecast", on);
  primarySlot.forecastLabel!.classList.toggle("hidden", !(on && compareMode));
  secondarySlot.forecastList!.classList.toggle("hidden", !(on && compareMode));
  secondarySlot.forecastLabel!.classList.toggle("hidden", !(on && compareMode));
  if (on && primarySlot.timeseries) {
    renderDaily(primarySlot.timeseries, primarySlot);
  }
  if (on && compareMode && secondarySlot.timeseries) {
    renderDaily(secondarySlot.timeseries, secondarySlot);
  }
}
