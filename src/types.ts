// ---- Domain types -------------------------------------------------------
// These model only the fields the code actually reads.
export type Lang = "sr" | "en";

// A location the app can display. Cities are indices into CITIES; GPS and
// manual picks carry rounded coordinates. Matches parseDescriptor/loadWeather.
export type LocationDescriptor =
  | { type: "city"; cityIndex: number }
  | { type: "gps"; lat: number; lon: number }
  | { type: "manual"; lat: number; lon: number };

// A user-saved favorite coordinate with an optional custom title.
export interface SavedEntry {
  lat: number;
  lon: number;
  name?: string;
}

// Persisted compare state: on/off plus the slot-B descriptor (null until set).
export interface CompareState {
  on: boolean;
  loc: LocationDescriptor | null;
}

// Persisted rain-threshold state: on/off plus the user cutoff in mm. When on,
// rain <= mm is treated as "no rain" across every verdict; when off the app
// uses the built-in PRECIP_THRESHOLD_MM (0.1) baseline.
export interface RainThresholdState {
  on: boolean;
  mm: number;
}

// The single nu:data blob. Every sub-key is optional (a fresh user has none)
// and read/written through the `store` accessor.
export interface StoreData {
  lang?: Lang;
  loc?: LocationDescriptor | null;
  geo?: Record<string, string>;
  saved?: SavedEntry[];
  selectorCollapsed?: boolean;
  compare?: CompareState;
  forecast?: boolean;
  rainThreshold?: RainThresholdState;
}
export type StoreKey = keyof StoreData;

// MET Locationforecast 2.0 compact response — only the touched fields.
export interface MetInstantDetails {
  air_temperature?: number;
  relative_humidity?: number;
  wind_speed?: number;
  wind_from_direction?: number;
  air_pressure_at_sea_level?: number;
  cloud_area_fraction?: number;
}
export interface MetForecastBlock {
  summary?: { symbol_code?: string };
  details?: { precipitation_amount?: number };
}
export interface MetTimeseriesEntry {
  time: string;
  data: {
    instant: { details?: MetInstantDetails };
    next_1_hours?: MetForecastBlock;
    next_6_hours?: MetForecastBlock;
    next_12_hours?: MetForecastBlock;
  };
}
export interface MetResponse {
  properties?: { timeseries?: MetTimeseriesEntry[] };
}

// BigDataCloud reverse-geocode response — only the touched fields.
export interface GeoResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

// Nominatim search result — only the touched fields.
export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

// A city entry in CITIES.
export interface City {
  key: string;
  names: { sr: string; en: string };
  lat: number;
  lon: number;
}

// One language bundle in STRINGS: plain strings, function-valued strings
// (tf), the condition-label map (cond), and the weekday array (days).
export type LangEntry = string | string[] | ((...args: any[]) => string) | Record<string, string>;
export type LangBundle = { [key: string]: LangEntry };

// A render slot bundles the DOM nodes for one location plus its rain verdict
// and stashed timeseries. Nodes may be absent in the DOM, so they are nullable
// except the ones the code treats as always-present (badge/emoji/... /chart).
export interface Slot {
  badge: HTMLElement;
  emoji: HTMLElement;
  temp: HTMLElement;
  desc: HTMLElement;
  humidity: HTMLElement;
  wind: HTMLElement;
  pressure: HTMLElement;
  cloud: HTMLElement;
  precipBanner: HTMLElement;
  chart: HTMLElement;
  chartLabel: HTMLElement | null;
  summary: HTMLElement | null;
  thresholdNote: HTMLElement | null;
  feels: HTMLElement | null;
  forecastList: HTMLElement | null;
  forecastLabel: HTMLElement | null;
  isRain?: boolean;
  timeseries?: MetTimeseriesEntry[];
}

// A daily forecast bucket produced by dailyBuckets().
export interface DailyBucket {
  date: Date;
  min: number | null;
  max: number | null;
  precip: number;
  symbol: string;
  bestDelta: number;
}
