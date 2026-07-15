import { describe, it, expect, beforeEach } from "vitest";
import { STRINGS, t, tf } from "../src/strings";
import { setCurrentLang } from "../src/state";

beforeEach(function () {
  localStorage.clear();
  setCurrentLang("sr");
});

describe("STRINGS parity", function () {
  it("sr and en have identical top-level keys", function () {
    var sr = Object.keys(STRINGS.sr).sort();
    var en = Object.keys(STRINGS.en).sort();
    expect(sr).toEqual(en);
  });
  it("sr.cond and en.cond have identical keys", function () {
    var sr = Object.keys(STRINGS.sr.cond as Record<string, string>).sort();
    var en = Object.keys(STRINGS.en.cond as Record<string, string>).sort();
    expect(sr).toEqual(en);
  });
  it("days is a 7-element array in both bundles", function () {
    expect((STRINGS.sr.days as string[]).length).toBe(7);
    expect((STRINGS.en.days as string[]).length).toBe(7);
  });
});

describe("t", function () {
  it("returns the active-language plain string", function () {
    setCurrentLang("sr");
    expect(t("today")).toBe("Danas");
    setCurrentLang("en");
    expect(t("today")).toBe("Today");
  });
  it("returns array-valued entries (days)", function () {
    setCurrentLang("en");
    expect(t("days")[1]).toBe("Mon");
  });
  it("returns the key itself when missing", function () {
    expect(t("no_such_key")).toBe("no_such_key");
  });
});

describe("tf", function () {
  it("calls function-valued entries with args", function () {
    setCurrentLang("en");
    expect(tf("httpError", 503)).toBe("Weather service returned HTTP 503");
    expect(tf("myLocation", 1, 2)).toBe("My location (1, 2)");
    expect(tf("feelsLike", 20)).toBe("Feels like 20°C");
    expect(tf("rainSummary", "09:00", "11:00", "1.2 mm")).toBe("(09:00–11:00, 1.2 mm)");
  });
  it("localizes every function entry (sr bodies)", function () {
    setCurrentLang("sr");
    expect(tf("myLocation", 1, 2)).toBe("Moja lokacija (1, 2)");
    expect(tf("httpError", 500)).toBe("Vremenski servis je vratio HTTP 500");
    expect(tf("rainSummary", "09:00", "11:00", "1.2 mm")).toBe("(09:00–11:00, 1.2 mm)");
    expect(tf("rainBanner", "1.0 mm")).toContain("Očekuje se kiša");
    expect(tf("dryBanner", "0.0 mm")).toContain("Nema značajne kiše");
    expect(tf("feelsLike", 5)).toBe("Oseća se kao 5°C");
  });
  it("returns the key when the entry is missing or not callable", function () {
    expect(tf("no_such_key", 1)).toBe("no_such_key");
    // `today` is a plain string, not callable.
    expect(tf("today")).toBe("today");
  });
});
