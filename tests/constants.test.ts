import { describe, it, expect, beforeEach } from "vitest";
import { CITIES, BELGRADE, cityName, PRECIP_THRESHOLD_MM } from "../src/constants";
import { setCurrentLang } from "../src/state";

beforeEach(function () {
  localStorage.clear();
  setCurrentLang("sr");
});

describe("CITIES / BELGRADE", function () {
  it("has 6 cities with Belgrade at index 0", function () {
    expect(CITIES.length).toBe(6);
    expect(CITIES[0].key).toBe("belgrade");
    expect(CITIES[0].lat).toBe(44.8176);
    expect(CITIES[0].lon).toBe(20.4633);
    expect(CITIES[0].names.sr).toBe("Beograd");
    expect(CITIES[0].names.en).toBe("Belgrade");
  });
  it("BELGRADE descriptor points at CITIES[0]", function () {
    expect(BELGRADE).toEqual({ type: "city", cityIndex: 0 });
  });
});

describe("cityName", function () {
  it("returns the active-language name", function () {
    setCurrentLang("sr");
    expect(cityName(CITIES[0])).toBe("Beograd");
    setCurrentLang("en");
    expect(cityName(CITIES[0])).toBe("Belgrade");
  });
  it("falls back to English when the active name is missing", function () {
    setCurrentLang("sr");
    var city = { key: "x", names: { en: "OnlyEnglish" }, lat: 0, lon: 0 } as any;
    expect(cityName(city)).toBe("OnlyEnglish");
  });
  it("returns empty string when names are absent", function () {
    var city = { key: "x", names: undefined, lat: 0, lon: 0 } as any;
    expect(cityName(city)).toBe("");
  });
});

describe("PRECIP_THRESHOLD_MM", function () {
  it("is 0.1", function () {
    expect(PRECIP_THRESHOLD_MM).toBe(0.1);
  });
});
