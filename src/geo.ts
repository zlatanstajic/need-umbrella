import { GeoResponse } from "./types";
import { store } from "./store";
import { currentLang } from "./state";

// Persistent cache of resolved place names, keyed by "lang|lat|lon" so each
// language's labels are stored separately. Read/written as one JSON object.
export function readGeoCache(): Record<string, string> {
  var obj = store.get("geo", {} as Record<string, string>);
  return (obj && typeof obj === "object") ? obj : {};
}

export function writeGeoCache(cache: Record<string, string>): void {
  store.set("geo", cache);
}

// Reverse-geocode coords to a localized place name via BigDataCloud's
// free, key-less, browser-CORS client endpoint. Resolves to "" on miss.
// Cached results are reused so identical coords never re-fetch.
export function reverseGeocode(lat: number, lon: number): Promise<string> {
  var lang = currentLang === "sr" ? "sr" : "en";
  var key = lang + "|" + lat + "|" + lon;
  var cache = readGeoCache();
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return Promise.resolve(cache[key]);
  }
  var url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
    lat + "&longitude=" + lon + "&localityLanguage=" + lang;
  return fetch(url)
    .then(function (res) {
      if (!res.ok) { throw new Error("geo " + res.status); }
      return res.json();
    })
    .then(function (d: GeoResponse) {
      var parts = [];
      var place = d.city || d.locality || d.principalSubdivision;
      if (place) { parts.push(place); }
      if (d.countryName) { parts.push(d.countryName); }
      var name = parts.join(", ");
      var latest = readGeoCache();
      latest[key] = name;
      writeGeoCache(latest);
      return name;
    });
}
