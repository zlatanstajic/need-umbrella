import { MetInstantDetails, MetTimeseriesEntry, Slot } from "./types";
import { STRINGS, t, tf } from "./strings";
import { currentLang, compareMode, secondaryLocation } from "./state";
import { degreesToCompass, hourText } from "./util";
import { PRECIP_THRESHOLD_MM } from "./constants";
import { primarySlot, secondarySlot } from "./dom";

// Map a MET symbol_code to an emoji. Strips _day/_night/_polartwilight.
// Emoji are language-independent. The base-code set below MUST stay in sync
// with the cond label set in STRINGS[lang].cond (see describe()).
export function symbolToEmoji(code: string | undefined): string {
  if (!code) { return "❓"; }
  var base = code
    .replace(/_day$/, "")
    .replace(/_night$/, "")
    .replace(/_polartwilight$/, "");

  var map: Record<string, string> = {
    clearsky: "☀️",
    fair: "🌤️",
    partlycloudy: "⛅",
    cloudy: "☁️",
    fog: "🌫️",

    lightrain: "🌦️",
    rain: "🌧️",
    heavyrain: "🌧️",
    lightrainshowers: "🌦️",
    rainshowers: "🌦️",
    heavyrainshowers: "🌧️",

    lightsleet: "🌨️",
    sleet: "🌨️",
    heavysleet: "🌨️",
    lightsleetshowers: "🌨️",
    sleetshowers: "🌨️",
    heavysleetshowers: "🌨️",
    lightssleetshowers: "🌨️",

    lightsnow: "🌨️",
    snow: "❄️",
    heavysnow: "❄️",
    lightsnowshowers: "🌨️",
    snowshowers: "🌨️",
    heavysnowshowers: "❄️",
    lightssnowshowers: "🌨️",

    lightrainandthunder: "⛈️",
    rainandthunder: "⛈️",
    heavyrainandthunder: "⛈️",
    lightrainshowersandthunder: "⛈️",
    rainshowersandthunder: "⛈️",
    heavyrainshowersandthunder: "⛈️",
    lightsleetandthunder: "⛈️",
    sleetandthunder: "⛈️",
    heavysleetandthunder: "⛈️",
    lightsleetshowersandthunder: "⛈️",
    sleetshowersandthunder: "⛈️",
    heavysleetshowersandthunder: "⛈️",
    lightssleetshowersandthunder: "⛈️",
    lightsnowandthunder: "⛈️",
    snowandthunder: "⛈️",
    heavysnowandthunder: "⛈️",
    lightsnowshowersandthunder: "⛈️",
    snowshowersandthunder: "⛈️",
    heavysnowshowersandthunder: "⛈️",
    lightssnowshowersandthunder: "⛈️"
  };

  // Documented fallback for any unmatched code.
  return map[base] || "🌡️";
}

// Map a MET base code to a readable description in the active language.
// Labels come from STRINGS[currentLang].cond; the base-code set there MUST
// stay in sync with symbolToEmoji. Unmatched codes fall back to the
// localized "Current conditions" string.
export function describe(code: string | undefined): string {
  var labels = ((STRINGS[currentLang] && STRINGS[currentLang].cond) || {}) as Record<string, string>;
  if (!code) { return t("condFallback"); }
  var base = code
    .replace(/_day$/, "")
    .replace(/_night$/, "")
    .replace(/_polartwilight$/, "");

  return labels[base] || t("condFallback");
}

// ---- Current conditions render -----------------------------------------
// Writes into the given slot's current-conditions / tile nodes.
export function renderCurrent(ts: MetTimeseriesEntry, name: string, slot: Slot): void {
  var details: MetInstantDetails = ts.data.instant.details || {};

  // symbol_code: prefer next_1_hours, fall back to 6h then 12h.
  var symbol: string | undefined = "";
  if (ts.data.next_1_hours && ts.data.next_1_hours.summary) {
    symbol = ts.data.next_1_hours.summary.symbol_code;
  } else if (ts.data.next_6_hours && ts.data.next_6_hours.summary) {
    symbol = ts.data.next_6_hours.summary.symbol_code;
  } else if (ts.data.next_12_hours && ts.data.next_12_hours.summary) {
    symbol = ts.data.next_12_hours.summary.symbol_code;
  }

  slot.badge.textContent = name;
  if (slot.chartLabel) { slot.chartLabel.textContent = name; }
  slot.emoji.textContent = symbolToEmoji(symbol);
  slot.desc.textContent = describe(symbol);

  var temp = details.air_temperature;
  slot.temp.textContent = (temp === undefined ? "--" : Math.round(temp)) + "°C";

  if (slot.feels) {
    if (details.air_temperature === undefined) {
      slot.feels.textContent = tf("feelsLike", "--");
    } else {
      var ta = details.air_temperature;
      var rh = details.relative_humidity || 0;
      var ws = details.wind_speed || 0;
      var e = (rh / 100) * 6.105 * Math.exp(17.27 * ta / (237.7 + ta));
      var at = ta + 0.33 * e - 0.70 * ws - 4.00;
      slot.feels.textContent = tf("feelsLike", Math.round(at));
    }
  }

  var humidity = details.relative_humidity;
  slot.humidity.textContent = (humidity === undefined ? "--" : Math.round(humidity)) + "%";

  var windSpeed = details.wind_speed;
  var windDir = details.wind_from_direction;
  var windText = (windSpeed === undefined ? "--" : windSpeed.toFixed(1)) + " m/s";
  if (windDir !== undefined) {
    windText += " " + degreesToCompass(windDir);
  }
  slot.wind.textContent = windText;

  var pressure = details.air_pressure_at_sea_level;
  slot.pressure.textContent = (pressure === undefined ? "--" : Math.round(pressure)) + " hPa";

  var cloud = details.cloud_area_fraction;
  slot.cloud.textContent = (cloud === undefined ? "--" : Math.round(cloud)) + "%";
}

// Set the page <title> and #header-title to the rain ("need umbrella") or
// dry message. The umbrella message wins when the primary will rain, or — in
// compare mode — when EITHER location will rain.
export function updateHeaderTitle() {
  var rain = primarySlot.isRain;
  if (compareMode && secondaryLocation) {
    rain = rain || secondarySlot.isRain;
  }
  var headerTitle = document.getElementById("header-title");
  var dynamicTitle = t(rain ? "headerRain" : "headerDry");
  if (headerTitle) { headerTitle.textContent = dynamicTitle; }
  document.title = dynamicTitle;
}

// ---- 24-hour precipitation ----------------------------------------------
// Writes into the given slot's precip banner / chart nodes, records the
// slot's rain verdict on `slot.isRain`, then recomputes the header title.
export function renderPrecip(timeseries: MetTimeseriesEntry[], slot: Slot): void {
  // Floor to the start of the current hour so the current-hour entry
  // (timeseries[0], whose time is the top of this hour) is included.
  var nowDate = new Date();
  nowDate.setMinutes(0, 0, 0);
  var now = nowDate.getTime();
  var horizon = now + 24 * 60 * 60 * 1000;

  var hours: { time: number; amount: number }[] = [];
  var total = 0;

  for (var i = 0; i < timeseries.length; i++) {
    var entry = timeseries[i];
    var entryTime = new Date(entry.time).getTime();
    if (entryTime < now || entryTime > horizon) { continue; }

    // Entries near the boundary may lack next_1_hours -> treat as 0.
    var amount = 0;
    if (
      entry.data &&
      entry.data.next_1_hours &&
      entry.data.next_1_hours.details &&
      typeof entry.data.next_1_hours.details.precipitation_amount === "number"
    ) {
      amount = entry.data.next_1_hours.details.precipitation_amount;
    }

    total += amount;
    hours.push({ time: entryTime, amount: amount });
  }

  // Banner.
  slot.precipBanner.classList.remove("rain", "dry");
  var totalText = total.toFixed(1) + " mm";
  var isRain = total >= PRECIP_THRESHOLD_MM;
  if (isRain) {
    slot.precipBanner.classList.add("rain");
    slot.precipBanner.textContent = tf("rainBanner", totalText);
  } else {
    slot.precipBanner.classList.add("dry");
    slot.precipBanner.textContent = tf("dryBanner", totalText);
  }

  // Rain-window summary: first hour at/above the threshold starts the window,
  // the first dry hour after that stops it (when rain FIRST stops, not last).
  // Divergence is intentional: isRain uses the 24h TOTAL >= threshold, but the
  // window uses PER-HOUR >= threshold, so a rainy banner with only sub-threshold
  // hours (no concentrated rainy hour) shows no window — summary stays blank.
  if (slot.summary) {
    var startTime: number | null = null;
    var stopTime: number | null = null;
    var windowTotal = 0;
    for (var w = 0; w < hours.length; w++) {
      if (hours[w].amount >= PRECIP_THRESHOLD_MM) {
        if (startTime === null) { startTime = hours[w].time; }
        stopTime = hours[w].time + 60 * 60 * 1000;
        windowTotal += hours[w].amount;
      } else if (startTime !== null) {
        break;
      }
    }
    if (isRain && startTime !== null) {
      slot.summary.textContent = tf("rainSummary", hourText(startTime), hourText(stopTime as number), windowTotal.toFixed(1) + " mm");
    } else {
      slot.summary.textContent = "";
    }
  }

  // Remember this slot's rain verdict, then recompute the header. In compare
  // mode the umbrella message wins when EITHER location will rain.
  slot.isRain = isRain;
  updateHeaderTitle();

  // Bar chart, DOM methods only.
  while (slot.chart.firstChild) {
    slot.chart.removeChild(slot.chart.firstChild);
  }

  var maxAmount = 0;
  for (var j = 0; j < hours.length; j++) {
    if (hours[j].amount > maxAmount) { maxAmount = hours[j].amount; }
  }

  for (var k = 0; k < hours.length; k++) {
    var hour = hours[k];

    var col = document.createElement("div");
    col.className = "bar-col";

    var amountLabel = document.createElement("div");
    amountLabel.className = "bar-amount";
    amountLabel.textContent = hour.amount > 0 ? hour.amount.toFixed(1) : "";
    col.appendChild(amountLabel);

    var bar = document.createElement("div");
    bar.className = "bar";
    var heightPct = maxAmount > 0 ? (hour.amount / maxAmount) * 100 : 0;
    bar.style.height = heightPct + "%";
    col.appendChild(bar);

    var hourLabel = document.createElement("div");
    hourLabel.className = "bar-hour";
    hourLabel.textContent = hourText(hour.time);
    col.appendChild(hourLabel);

    slot.chart.appendChild(col);
  }
}
