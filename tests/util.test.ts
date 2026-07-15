import { describe, it, expect } from "vitest";
import { round4, hourText, degreesToCompass, validLatLon } from "../src/util";

describe("round4", function () {
  it("rounds to four decimal places", function () {
    expect(round4(1.234567)).toBe(1.2346);
    expect(round4(1.23454)).toBe(1.2345);
    expect(round4(1.23455)).toBe(1.2346);
  });
  it("leaves shorter numbers unchanged", function () {
    expect(round4(44.8176)).toBe(44.8176);
    expect(round4(0)).toBe(0);
    expect(round4(-20.4633)).toBe(-20.4633);
  });
});

describe("hourText", function () {
  it("zero-pads single-digit local hours", function () {
    // Built via local constructor so it is 9am local regardless of CI TZ.
    var ms = new Date(2020, 0, 1, 9, 0, 0).getTime();
    expect(hourText(ms)).toBe("09:00");
  });
  it("does not pad double-digit local hours", function () {
    var ms = new Date(2020, 0, 1, 14, 30, 0).getTime();
    expect(hourText(ms)).toBe("14:00");
  });
  it("renders local midnight as 00:00", function () {
    var ms = new Date(2020, 0, 1, 0, 0, 0).getTime();
    expect(hourText(ms)).toBe("00:00");
  });
});

describe("degreesToCompass", function () {
  it("maps cardinal directions", function () {
    expect(degreesToCompass(0)).toBe("N");
    expect(degreesToCompass(90)).toBe("E");
    expect(degreesToCompass(180)).toBe("S");
    expect(degreesToCompass(270)).toBe("W");
  });
  it("maps an intercardinal point", function () {
    expect(degreesToCompass(45)).toBe("NE");
    expect(degreesToCompass(22.5)).toBe("NNE");
  });
  it("wraps 360 back to N", function () {
    expect(degreesToCompass(360)).toBe("N");
  });
  it("wraps negative degrees via the += 16 branch", function () {
    // -22.5 -> round -1 -> %16 = -1 -> +16 -> 15 -> NNW
    expect(degreesToCompass(-22.5)).toBe("NNW");
    expect(degreesToCompass(-90)).toBe("W");
  });
});

describe("validLatLon", function () {
  it("accepts in-range numeric coords", function () {
    expect(validLatLon(44.8176, 20.4633)).toBe(true);
    expect(validLatLon(-90, -180)).toBe(true);
    expect(validLatLon(90, 180)).toBe(true);
    expect(validLatLon(0, 0)).toBe(true);
  });
  it("rejects out-of-range coords", function () {
    expect(validLatLon(90.1, 0)).toBe(false);
    expect(validLatLon(-90.1, 0)).toBe(false);
    expect(validLatLon(0, 180.1)).toBe(false);
    expect(validLatLon(0, -180.1)).toBe(false);
  });
  it("rejects non-number types", function () {
    expect(validLatLon("44", 20)).toBe(false);
    expect(validLatLon(44, "20")).toBe(false);
    expect(validLatLon(null, undefined)).toBe(false);
    // NaN is typeof "number" but fails the range comparisons.
    expect(validLatLon(NaN, 0)).toBe(false);
  });
});
