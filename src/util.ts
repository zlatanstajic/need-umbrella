// ---- Pure helpers -------------------------------------------------------
export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// Zero-padded "HH:00" label for a millisecond timestamp.
export function hourText(ms: number): string {
  var h = new Date(ms).getHours();
  return (h < 10 ? "0" + h : h) + ":00";
}

// Convert wind-from-direction in degrees to a 16-point compass label.
export function degreesToCompass(deg: number): string {
  var points = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  var idx = Math.round(deg / 22.5) % 16;
  if (idx < 0) { idx += 16; }
  return points[idx];
}

// True when lat/lon are numbers within geographic bounds.
export function validLatLon(lat: unknown, lon: unknown): boolean {
  return typeof lat === "number" && typeof lon === "number" &&
    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
