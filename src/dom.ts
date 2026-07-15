import { Slot } from "./types";

// Typed helper: getElementById returns HTMLElement|null; the app assumes its
// static markup exists, so cast to the requested element type. Pure typing —
// no runtime behavior change vs. a bare getElementById.
export function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as unknown as T;
}

// ---- DOM references -----------------------------------------------------
export var elLoading = el("loading");
export var elError = el("error");
export var elWeather = el("weather");
export var elNotice = el("notice");
export var elBadge = el("location-badge");
export var elEmoji = el("cur-emoji");
export var elTemp = el("cur-temp");
export var elDesc = el("cur-desc");
export var elHumidity = el("tile-humidity");
export var elWind = el("tile-wind");
export var elPressure = el("tile-pressure");
export var elCloud = el("tile-cloud");
export var elPrecipBanner = el("precip-banner");
export var elChart = el("chart");

// A "slot" bundles the render-target nodes for one location so renderCurrent
// and renderPrecip can write into either the primary set (above) or a
// secondary compare set without depending on the module-level singletons.
export var primarySlot: Slot = {
  badge: elBadge,
  emoji: elEmoji,
  temp: elTemp,
  desc: elDesc,
  humidity: elHumidity,
  wind: elWind,
  pressure: elPressure,
  cloud: elCloud,
  precipBanner: elPrecipBanner,
  chart: elChart,
  chartLabel: document.getElementById("chart-label-a"),
  summary: document.getElementById("rain-summary-a"),
  feels: document.getElementById("cur-feels"),
  forecastList: document.getElementById("forecast-list"),
  forecastLabel: document.getElementById("forecast-label-a")
};

// The secondary (compare) slot mirrors primarySlot's shape for the slot-B nodes.
export var secondarySlot: Slot = {
  badge: el("b-location-badge"),
  emoji: el("b-cur-emoji"),
  temp: el("b-cur-temp"),
  desc: el("b-cur-desc"),
  humidity: el("b-tile-humidity"),
  wind: el("b-tile-wind"),
  pressure: el("b-tile-pressure"),
  cloud: el("b-tile-cloud"),
  precipBanner: el("b-precip-banner"),
  chart: el("b-chart"),
  chartLabel: document.getElementById("chart-label-b"),
  summary: document.getElementById("rain-summary-b"),
  feels: document.getElementById("b-cur-feels"),
  forecastList: document.getElementById("forecast-list-b"),
  forecastLabel: document.getElementById("forecast-label-b")
};

// ---- State toggling -----------------------------------------------------
export function showOnly(target: HTMLElement): void {
  elLoading.classList.add("hidden");
  elError.classList.add("hidden");
  elWeather.classList.add("hidden");
  target.classList.remove("hidden");
}

export function showNotice(message: string): void {
  elNotice.textContent = message;
  elNotice.classList.remove("hidden");
}

export function clearNotice(): void {
  elNotice.textContent = "";
  elNotice.classList.add("hidden");
}
