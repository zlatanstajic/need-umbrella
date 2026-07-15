import { describe, it, expect, beforeEach } from "vitest";
import {
  badgeFor,
  saveLocation,
  parseDescriptor,
  loadSavedLocation,
  saveCompareState,
  loadCompareState,
  readSavedLocations,
  writeSavedLocations,
  savedNameFor,
  coordsFor,
  metUrl
} from "../src/location";
import { store } from "../src/store";
import { setCurrentLang, setCompareMode, setSecondaryLocation } from "../src/state";

beforeEach(function () {
  localStorage.clear();
  setCurrentLang("sr");
  setCompareMode(false);
  setSecondaryLocation(null);
});

describe("badgeFor", function () {
  it("returns '' for null", function () {
    expect(badgeFor(null)).toBe("");
  });
  it("returns the localized city name for a city descriptor", function () {
    setCurrentLang("en");
    expect(badgeFor({ type: "city", cityIndex: 0 })).toBe("Belgrade");
  });
  it("returns '' for a bad city index", function () {
    expect(badgeFor({ type: "city", cityIndex: 999 })).toBe("");
  });
  it("returns the localized my-location string for gps", function () {
    setCurrentLang("en");
    expect(badgeFor({ type: "gps", lat: 1, lon: 2 })).toBe("My location (1, 2)");
  });
  it("returns coordinates for manual", function () {
    expect(badgeFor({ type: "manual", lat: 1.5, lon: 2.5 })).toBe("1.5, 2.5");
  });
  it("a saved name wins over coordinates/geocoding", function () {
    writeSavedLocations([{ lat: 1, lon: 2, name: "Home" }]);
    expect(badgeFor({ type: "gps", lat: 1, lon: 2 })).toBe("Home");
    expect(badgeFor({ type: "manual", lat: 1, lon: 2 })).toBe("Home");
  });
});

describe("saveLocation / loadSavedLocation", function () {
  it("round-trips a valid descriptor", function () {
    saveLocation({ type: "gps", lat: 10, lon: 20 });
    expect(loadSavedLocation()).toEqual({ type: "gps", lat: 10, lon: 20 });
  });
  it("returns null when nothing is stored", function () {
    expect(loadSavedLocation()).toBe(null);
  });
  it("returns null when the stored descriptor is malformed", function () {
    store.set("loc", { type: "gps", lat: 999, lon: 0 });
    expect(loadSavedLocation()).toBe(null);
  });
});

describe("parseDescriptor", function () {
  it("returns null for non-objects", function () {
    expect(parseDescriptor(null)).toBe(null);
    expect(parseDescriptor(42)).toBe(null);
    expect(parseDescriptor("x")).toBe(null);
  });
  it("accepts a valid city descriptor", function () {
    expect(parseDescriptor({ type: "city", cityIndex: 1 })).toEqual({ type: "city", cityIndex: 1 });
  });
  it("rejects a city with a non-numeric or out-of-range index", function () {
    expect(parseDescriptor({ type: "city", cityIndex: "1" })).toBe(null);
    expect(parseDescriptor({ type: "city", cityIndex: 999 })).toBe(null);
  });
  it("accepts valid gps and manual descriptors", function () {
    expect(parseDescriptor({ type: "gps", lat: 1, lon: 2 })).toEqual({ type: "gps", lat: 1, lon: 2 });
    expect(parseDescriptor({ type: "manual", lat: 1, lon: 2 })).toEqual({ type: "manual", lat: 1, lon: 2 });
  });
  it("rejects gps/manual with invalid coords", function () {
    expect(parseDescriptor({ type: "gps", lat: 999, lon: 2 })).toBe(null);
  });
  it("rejects unknown types", function () {
    expect(parseDescriptor({ type: "unknown" })).toBe(null);
  });
});

describe("saveCompareState / loadCompareState", function () {
  it("persists state read from state.ts and reloads it", function () {
    setCompareMode(true);
    setSecondaryLocation({ type: "gps", lat: 5, lon: 6 });
    saveCompareState();
    expect(store.get("compare", null)).toEqual({ on: true, loc: { type: "gps", lat: 5, lon: 6 } });
    expect(loadCompareState()).toEqual({ on: true, loc: { type: "gps", lat: 5, lon: 6 } });
  });
  it("returns null when compare is absent", function () {
    expect(loadCompareState()).toBe(null);
  });
  it("returns null when compare is off", function () {
    store.set("compare", { on: false, loc: { type: "gps", lat: 5, lon: 6 } });
    expect(loadCompareState()).toBe(null);
  });
  it("returns null when the stored slot-B descriptor is invalid", function () {
    store.set("compare", { on: true, loc: { type: "gps", lat: 999, lon: 0 } } as any);
    expect(loadCompareState()).toBe(null);
  });
  it("returns null when the stored state is not an object", function () {
    store.set("compare", 42 as any);
    expect(loadCompareState()).toBe(null);
  });
});

describe("readSavedLocations / writeSavedLocations", function () {
  it("returns [] when nothing is stored", function () {
    expect(readSavedLocations()).toEqual([]);
  });
  it("returns [] when the stored value is not an array", function () {
    store.set("saved", { not: "array" } as any);
    expect(readSavedLocations()).toEqual([]);
  });
  it("filters out entries with invalid coords", function () {
    writeSavedLocations([
      { lat: 1, lon: 2 },
      { lat: 999, lon: 0 } as any,
      { lat: 3, lon: 4, name: "N" }
    ]);
    expect(readSavedLocations()).toEqual([
      { lat: 1, lon: 2 },
      { lat: 3, lon: 4, name: "N" }
    ]);
  });
});

describe("savedNameFor", function () {
  it("returns the name of a matching saved entry (rounded coords)", function () {
    // Saved entries carry round4'd coords; savedNameFor round4's the lookup
    // args before comparing, so unrounded lookup coords still match.
    writeSavedLocations([{ lat: 1.2346, lon: 2.3457, name: "Home" }]);
    expect(savedNameFor(1.23456789, 2.34567123)).toBe("Home");
  });
  it("returns null when no entry matches", function () {
    writeSavedLocations([{ lat: 1, lon: 2, name: "Home" }]);
    expect(savedNameFor(9, 9)).toBe(null);
  });
  it("returns null when the matching entry has no name", function () {
    writeSavedLocations([{ lat: 1, lon: 2 }]);
    expect(savedNameFor(1, 2)).toBe(null);
  });
});

describe("coordsFor", function () {
  it("resolves a city descriptor via CITIES", function () {
    expect(coordsFor({ type: "city", cityIndex: 0 })).toEqual({ lat: 44.8176, lon: 20.4633 });
  });
  it("rounds gps/manual coords to 4 decimals", function () {
    expect(coordsFor({ type: "gps", lat: 1.234567, lon: 2.345678 })).toEqual({ lat: 1.2346, lon: 2.3457 });
  });
});

describe("metUrl", function () {
  it("builds the compact endpoint with encoded params", function () {
    expect(metUrl(1.5, -2.5)).toBe(
      "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=1.5&lon=-2.5"
    );
  });
});
