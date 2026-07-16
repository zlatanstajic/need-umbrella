import { describe, it, expect, beforeEach } from "vitest";
import {
  clampThreshold,
  readRainThreshold,
  effectiveThreshold,
  saveRainThreshold
} from "../src/threshold";
import { setRainThresholdOn, setRainThresholdMm } from "../src/state";
import { store } from "../src/store";
import {
  PRECIP_THRESHOLD_MM,
  RAIN_THRESHOLD_MIN,
  RAIN_THRESHOLD_MAX,
  RAIN_THRESHOLD_DEFAULT
} from "../src/constants";

beforeEach(function () {
  localStorage.clear();
  setRainThresholdOn(false);
  setRainThresholdMm(RAIN_THRESHOLD_DEFAULT);
});

describe("clampThreshold", function () {
  it("clamps below-min up to the minimum", function () {
    expect(clampThreshold(0)).toBe(RAIN_THRESHOLD_MIN);
    expect(clampThreshold(-5)).toBe(RAIN_THRESHOLD_MIN);
  });
  it("clamps above-max down to the maximum", function () {
    expect(clampThreshold(500)).toBe(RAIN_THRESHOLD_MAX);
  });
  it("leaves in-range values unchanged", function () {
    expect(clampThreshold(0.5)).toBe(0.5);
    expect(clampThreshold(12.3)).toBe(12.3);
    expect(clampThreshold(RAIN_THRESHOLD_MIN)).toBe(RAIN_THRESHOLD_MIN);
    expect(clampThreshold(RAIN_THRESHOLD_MAX)).toBe(RAIN_THRESHOLD_MAX);
  });
  it("maps NaN / non-finite to the default", function () {
    expect(clampThreshold(NaN)).toBe(RAIN_THRESHOLD_DEFAULT);
    expect(clampThreshold(Infinity)).toBe(RAIN_THRESHOLD_DEFAULT);
    expect(clampThreshold(-Infinity)).toBe(RAIN_THRESHOLD_DEFAULT);
    expect(clampThreshold(Number("abc") as number)).toBe(RAIN_THRESHOLD_DEFAULT);
  });
  it("clamps a genuine 0 (incl. Number('')) to the minimum, not the default", function () {
    expect(clampThreshold(0)).toBe(RAIN_THRESHOLD_MIN);
    expect(clampThreshold(Number(""))).toBe(RAIN_THRESHOLD_MIN);
  });
});

describe("effectiveThreshold", function () {
  it("returns the built-in baseline when off", function () {
    setRainThresholdOn(false);
    setRainThresholdMm(9);
    expect(effectiveThreshold()).toBe(PRECIP_THRESHOLD_MM);
  });
  it("returns the clamped mm when on", function () {
    setRainThresholdOn(true);
    setRainThresholdMm(3);
    expect(effectiveThreshold()).toBe(3);
    setRainThresholdMm(999);
    expect(effectiveThreshold()).toBe(RAIN_THRESHOLD_MAX);
  });
});

describe("readRainThreshold", function () {
  it("returns the disabled default when the sub-key is absent", function () {
    expect(readRainThreshold()).toEqual({ on: false, mm: RAIN_THRESHOLD_DEFAULT });
  });
  it("coerces on to a boolean and clamps mm", function () {
    store.set("rainThreshold", { on: 1 as unknown as boolean, mm: 999 });
    expect(readRainThreshold()).toEqual({ on: true, mm: RAIN_THRESHOLD_MAX });
  });
  it("maps a malformed mm to the default", function () {
    store.set("rainThreshold", { on: false, mm: "junk" as unknown as number });
    expect(readRainThreshold()).toEqual({ on: false, mm: RAIN_THRESHOLD_DEFAULT });
  });
  it("round-trips a saved value", function () {
    saveRainThreshold(true, 2.5);
    expect(readRainThreshold()).toEqual({ on: true, mm: 2.5 });
  });
  it("clamps mm when saving out-of-range", function () {
    saveRainThreshold(true, 0);
    expect(readRainThreshold()).toEqual({ on: true, mm: RAIN_THRESHOLD_MIN });
  });
});
