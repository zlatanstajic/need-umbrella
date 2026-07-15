import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  symbolToEmoji,
  describe as describeCond,
  renderCurrent,
  renderPrecip,
  updateHeaderTitle
} from "../src/render";
import { STRINGS, t } from "../src/strings";
import { setCurrentLang, setCompareMode, setSecondaryLocation } from "../src/state";
import { primarySlot, secondarySlot } from "../src/dom";
import { MetTimeseriesEntry, Slot } from "../src/types";

function makeSlot(): Slot {
  return {
    badge: document.createElement("div"),
    emoji: document.createElement("div"),
    temp: document.createElement("div"),
    desc: document.createElement("div"),
    humidity: document.createElement("div"),
    wind: document.createElement("div"),
    pressure: document.createElement("div"),
    cloud: document.createElement("div"),
    precipBanner: document.createElement("div"),
    chart: document.createElement("div"),
    chartLabel: document.createElement("div"),
    summary: document.createElement("div"),
    feels: document.createElement("div"),
    forecastList: null,
    forecastLabel: null
  };
}

beforeEach(function () {
  localStorage.clear();
  setCurrentLang("sr");
  setCompareMode(false);
  setSecondaryLocation(null);
});

afterEach(function () {
  vi.useRealTimers();
});

describe("symbolToEmoji", function () {
  it("returns the question mark for empty/undefined", function () {
    expect(symbolToEmoji(undefined)).toBe("❓");
    expect(symbolToEmoji("")).toBe("❓");
  });
  it("maps a known base code", function () {
    expect(symbolToEmoji("clearsky")).toBe("☀️");
    expect(symbolToEmoji("rain")).toBe("🌧️");
  });
  it("strips _day/_night/_polartwilight suffixes", function () {
    expect(symbolToEmoji("clearsky_day")).toBe("☀️");
    expect(symbolToEmoji("partlycloudy_night")).toBe("⛅");
    expect(symbolToEmoji("fair_polartwilight")).toBe("🌤️");
  });
  it("falls back to the thermometer for unmatched codes", function () {
    expect(symbolToEmoji("nonsense_code")).toBe("🌡️");
  });
});

describe("describe", function () {
  it("returns the localized fallback for undefined", function () {
    setCurrentLang("en");
    expect(describeCond(undefined)).toBe(t("condFallback"));
  });
  it("maps a known base code in the active language", function () {
    setCurrentLang("en");
    expect(describeCond("clearsky")).toBe("Clear sky");
    setCurrentLang("sr");
    expect(describeCond("clearsky")).toBe("Vedro");
  });
  it("strips suffixes before lookup", function () {
    setCurrentLang("en");
    expect(describeCond("rain_day")).toBe("Rain");
  });
  it("falls back to the localized 'current conditions' for unmatched codes", function () {
    setCurrentLang("en");
    expect(describeCond("nonsense_code")).toBe(t("condFallback"));
  });
});

// Cross-map sync: every base code the app localizes (STRINGS.en.cond keys)
// must resolve to a non-fallback emoji, and the two bundles' cond key sets
// must match. Guards the "keep symbolToEmoji in sync with cond" convention.
describe("symbol/cond sync", function () {
  it("every cond base code has a non-fallback emoji", function () {
    var codes = Object.keys(STRINGS.en.cond as Record<string, string>);
    expect(codes.length).toBeGreaterThan(0);
    codes.forEach(function (code) {
      expect(symbolToEmoji(code)).not.toBe("🌡️");
    });
  });
  it("sr.cond and en.cond expose the same base codes", function () {
    var sr = Object.keys(STRINGS.sr.cond as Record<string, string>).sort();
    var en = Object.keys(STRINGS.en.cond as Record<string, string>).sort();
    expect(sr).toEqual(en);
  });
});

describe("renderCurrent", function () {
  it("fills every tile from the instant details", function () {
    setCurrentLang("en");
    var slot = makeSlot();
    var ts: MetTimeseriesEntry = {
      time: "2026-01-15T12:00:00Z",
      data: {
        instant: {
          details: {
            air_temperature: 12.4,
            relative_humidity: 60,
            wind_speed: 3.25,
            wind_from_direction: 90,
            air_pressure_at_sea_level: 1013.6,
            cloud_area_fraction: 40.2
          }
        },
        next_1_hours: { summary: { symbol_code: "rain_day" } }
      }
    };
    renderCurrent(ts, "Somewhere", slot);
    expect(slot.badge.textContent).toBe("Somewhere");
    expect(slot.chartLabel!.textContent).toBe("Somewhere");
    expect(slot.emoji.textContent).toBe("🌧️");
    expect(slot.desc.textContent).toBe("Rain");
    expect(slot.temp.textContent).toBe("12°C");
    expect(slot.humidity.textContent).toBe("60%");
    expect(slot.wind.textContent).toBe("3.3 m/s E");
    expect(slot.pressure.textContent).toBe("1014 hPa");
    expect(slot.cloud.textContent).toBe("40%");
    // Feels-like formula ran and produced a value.
    expect(slot.feels!.textContent).toMatch(/Feels like -?\d+°C/);
  });

  it("renders -- placeholders when details are absent and reads 6h/12h symbol", function () {
    setCurrentLang("en");
    var slot = makeSlot();
    var ts: MetTimeseriesEntry = {
      time: "2026-01-15T12:00:00Z",
      data: {
        instant: { details: {} },
        next_6_hours: { summary: { symbol_code: "cloudy" } }
      }
    };
    renderCurrent(ts, "X", slot);
    expect(slot.temp.textContent).toBe("--°C");
    expect(slot.humidity.textContent).toBe("--%");
    expect(slot.wind.textContent).toBe("-- m/s");
    expect(slot.pressure.textContent).toBe("-- hPa");
    expect(slot.cloud.textContent).toBe("--%");
    expect(slot.feels!.textContent).toBe("Feels like --°C");
    expect(slot.emoji.textContent).toBe("☁️");

    // 12h fallback when neither 1h nor 6h carry a summary.
    var ts12: MetTimeseriesEntry = {
      time: "2026-01-15T12:00:00Z",
      data: { instant: { details: {} }, next_12_hours: { summary: { symbol_code: "fair" } } }
    };
    renderCurrent(ts12, "Y", slot);
    expect(slot.emoji.textContent).toBe("🌤️");
  });
});

describe("renderPrecip", function () {
  // Build an entry at a whole-hour offset from a fixed "now".
  function tsEntry(baseMs: number, hourOffset: number, amount: number): MetTimeseriesEntry {
    return {
      time: new Date(baseMs + hourOffset * 3600000).toISOString(),
      data: {
        instant: { details: {} },
        next_1_hours: { details: { precipitation_amount: amount } }
      }
    };
  }

  it("sets the rain banner, summary window, and chart bars when rain exceeds threshold", function () {
    setCurrentLang("en");
    // Fix now at local top-of-hour.
    var now = new Date(2026, 0, 15, 10, 0, 0).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    var slot = makeSlot();
    // Pre-populate the chart so the clear-loop (removeChild) runs.
    slot.chart.appendChild(document.createElement("div"));
    var ts = [
      tsEntry(now, 0, 0),
      tsEntry(now, 1, 0.5),
      tsEntry(now, 2, 0.3),
      tsEntry(now, 3, 0)
    ];
    renderPrecip(ts, slot);
    expect(slot.precipBanner.classList.contains("rain")).toBe(true);
    expect(slot.precipBanner.textContent).toContain("0.8 mm");
    expect(slot.isRain).toBe(true);
    // Window: 11:00 start -> first dry hour 13:00 stop, 0.8 mm.
    expect(slot.summary!.textContent).toBe("(11:00–13:00, 0.8 mm)");
    // One bar column per in-window hour.
    expect(slot.chart.querySelectorAll(".bar-col").length).toBe(4);
  });

  it("sets the dry banner and blank summary when below threshold", function () {
    setCurrentLang("en");
    var now = new Date(2026, 0, 15, 10, 0, 0).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    var slot = makeSlot();
    var ts = [tsEntry(now, 0, 0), tsEntry(now, 1, 0)];
    renderPrecip(ts, slot);
    expect(slot.precipBanner.classList.contains("dry")).toBe(true);
    expect(slot.isRain).toBe(false);
    expect(slot.summary!.textContent).toBe("");
  });

  it("ignores entries outside the 24h window and missing next_1_hours (treated as 0)", function () {
    setCurrentLang("en");
    var now = new Date(2026, 0, 15, 10, 0, 0).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    var slot = makeSlot();
    var past: MetTimeseriesEntry = {
      time: new Date(now - 3600000).toISOString(),
      data: { instant: { details: {} }, next_1_hours: { details: { precipitation_amount: 9 } } }
    };
    var beyond = tsEntry(now, 30, 9);
    var noBlock: MetTimeseriesEntry = {
      time: new Date(now + 3600000).toISOString(),
      data: { instant: { details: {} } }
    };
    renderPrecip([past, noBlock, beyond], slot);
    // Only the in-window no-block entry counts, as 0 mm.
    expect(slot.isRain).toBe(false);
    expect(slot.chart.querySelectorAll(".bar-col").length).toBe(1);
  });
});

describe("updateHeaderTitle", function () {
  function withHeader(fn: () => void): void {
    var h = document.createElement("div");
    h.id = "header-title";
    document.body.appendChild(h);
    try { fn(); } finally { document.body.removeChild(h); }
  }

  beforeEach(function () {
    // updateHeaderTitle reads the module singleton slots' isRain verdicts.
    primarySlot.isRain = false;
    secondarySlot.isRain = false;
    setCompareMode(false);
    setSecondaryLocation(null);
  });

  it("shows the rain title when the primary slot will rain", function () {
    setCurrentLang("en");
    primarySlot.isRain = true;
    withHeader(function () {
      updateHeaderTitle();
      expect(document.title).toBe(t("headerRain"));
      expect(document.getElementById("header-title")!.textContent).toBe(t("headerRain"));
    });
  });

  it("in compare mode the umbrella wins when EITHER slot will rain", function () {
    setCurrentLang("en");
    setCompareMode(true);
    setSecondaryLocation({ type: "gps", lat: 1, lon: 2 });
    primarySlot.isRain = false;
    secondarySlot.isRain = true;
    withHeader(function () {
      updateHeaderTitle();
      expect(document.title).toBe(t("headerRain"));
    });
  });

  it("shows the dry title when neither slot will rain", function () {
    setCurrentLang("en");
    withHeader(function () {
      updateHeaderTitle();
      expect(document.title).toBe(t("headerDry"));
    });
  });
});
