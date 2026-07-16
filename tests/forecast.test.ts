import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { dailyBuckets, renderDaily, readForecastMode } from "../src/forecast";
import { store } from "../src/store";
import { MetTimeseriesEntry, Slot } from "../src/types";
import { t } from "../src/strings";
import { setCurrentLang } from "../src/state";

// Build a timeseries entry whose `time` is at the given LOCAL hour of the
// fixed clock day, so bucket keys are TZ-independent.
function entry(
  year: number, month: number, day: number, hour: number,
  opts: { temp?: number; p1?: number; p6?: number; symbol?: string } = {}
): MetTimeseriesEntry {
  var data: MetTimeseriesEntry["data"] = {
    instant: { details: opts.temp === undefined ? {} : { air_temperature: opts.temp } }
  };
  if (opts.p1 !== undefined || (opts.symbol !== undefined && opts.p6 === undefined)) {
    data.next_1_hours = {
      details: { precipitation_amount: opts.p1 === undefined ? 0 : opts.p1 },
      summary: opts.symbol === undefined ? undefined : { symbol_code: opts.symbol }
    };
  }
  if (opts.p6 !== undefined) {
    data.next_6_hours = {
      details: { precipitation_amount: opts.p6 },
      summary: opts.symbol === undefined ? undefined : { symbol_code: opts.symbol }
    };
  }
  return { time: new Date(year, month, day, hour, 0, 0).toISOString(), data: data };
}

beforeEach(function () {
  localStorage.clear();
  setCurrentLang("en");
  vi.useFakeTimers();
  // Local noon on 2026-01-15.
  vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0));
});

afterEach(function () {
  vi.useRealTimers();
});

describe("dailyBuckets", function () {
  it("groups entries from today onward into local-calendar-day buckets", function () {
    var ts = [
      entry(2026, 0, 15, 8, { temp: 5, p1: 0.2, symbol: "rain" }),
      entry(2026, 0, 15, 12, { temp: 9, p1: 0.3, symbol: "cloudy" }),
      entry(2026, 0, 16, 10, { temp: 1, p1: 0.1, symbol: "clearsky" })
    ];
    var buckets = dailyBuckets(ts);
    expect(buckets.length).toBe(2);
    expect(buckets[0].min).toBe(5);
    expect(buckets[0].max).toBe(9);
    expect(buckets[0].precip).toBeCloseTo(0.5, 5);
    // Representative symbol = entry nearest local noon (12:00) => "cloudy".
    expect(buckets[0].symbol).toBe("cloudy");
    expect(buckets[1].min).toBe(1);
  });

  it("skips entries before today 00:00", function () {
    var ts = [
      entry(2026, 0, 14, 10, { temp: 99, p1: 5 }),
      entry(2026, 0, 15, 10, { temp: 3, p1: 0.1 })
    ];
    var buckets = dailyBuckets(ts);
    expect(buckets.length).toBe(1);
    expect(buckets[0].max).toBe(3);
  });

  it("caps at 7 buckets", function () {
    var ts: MetTimeseriesEntry[] = [];
    for (var day = 15; day <= 25; day++) {
      ts.push(entry(2026, 0, day, 12, { temp: day, p1: 0 }));
    }
    expect(dailyBuckets(ts).length).toBe(7);
  });

  it("falls back to next_6_hours only when next_1_hours is absent", function () {
    var ts = [entry(2026, 0, 15, 9, { temp: 4, p6: 1.5, symbol: "rain" })];
    var buckets = dailyBuckets(ts);
    expect(buckets[0].precip).toBeCloseTo(1.5, 5);
    expect(buckets[0].symbol).toBe("rain");
  });

  it("prefers next_1_hours precip over next_6_hours (never both)", function () {
    // Entry carries both blocks; the || picks next_1_hours only.
    var e = entry(2026, 0, 15, 9, { temp: 4, p1: 0.4 });
    e.data.next_6_hours = { details: { precipitation_amount: 9.9 } };
    expect(dailyBuckets([e])[0].precip).toBeCloseTo(0.4, 5);
  });

  it("leaves min/max null and symbol '' when no data is present", function () {
    var e: MetTimeseriesEntry = {
      time: new Date(2026, 0, 15, 10, 0, 0).toISOString(),
      data: { instant: {} }
    };
    var b = dailyBuckets([e])[0];
    expect(b.min).toBe(null);
    expect(b.max).toBe(null);
    expect(b.symbol).toBe("");
    expect(b.precip).toBe(0);
  });

  // Regression sentinel for the documented timezone approximation: a
  // next_6_hours block near local midnight is attributed wholly to one local
  // calendar day (bounded, not exact). Asserts the KNOWN behavior only.
  it("attributes a full next_6_hours block to a single local day (tz sentinel)", function () {
    var ts = [
      entry(2026, 0, 15, 23, { temp: 2, p6: 3.0, symbol: "snow" })
    ];
    var buckets = dailyBuckets(ts);
    // The 23:00-local entry lands in the 2026-01-15 bucket; its whole 6h total
    // is counted there rather than split across the midnight boundary.
    expect(buckets.length).toBe(1);
    expect(buckets[0].precip).toBeCloseTo(3.0, 5);
  });
});

describe("renderDaily", function () {
  function makeSlot(): Slot {
    var list = document.createElement("div");
    var chartLabel = document.createElement("div");
    chartLabel.textContent = "Somewhere";
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
      chartLabel: chartLabel,
      summary: null,
      thresholdNote: null,
      feels: null,
      forecastList: list,
      forecastLabel: document.createElement("div")
    };
  }

  it("labels row 0 with the localized 'today' string and later rows with weekday", function () {
    var slot = makeSlot();
    var ts = [
      entry(2026, 0, 15, 12, { temp: 5, p1: 0.5, symbol: "rain" }),
      entry(2026, 0, 16, 12, { temp: 3, p1: 0.0, symbol: "clearsky" })
    ];
    renderDaily(ts, slot);
    var rows = slot.forecastList!.querySelectorAll(".forecast-day");
    expect(rows.length).toBe(2);
    expect(rows[0].querySelector(".forecast-dow")!.textContent).toBe(t("today"));
    // 2026-01-16 is a Friday -> days[5].
    expect(rows[1].querySelector(".forecast-dow")!.textContent).toBe((t("days") as string[])[5]);
    // Populated cells for the first bucket.
    expect(rows[0].querySelector(".forecast-emoji")!.textContent).not.toBe("");
    expect(rows[0].querySelector(".forecast-desc")!.textContent).not.toBe("");
    expect(rows[0].querySelector(".forecast-precip")!.textContent).toBe("0.5 mm");
    // The forecast label mirrors the chart label (compare-mode attribution).
    expect(slot.forecastLabel!.textContent).toBe(slot.chartLabel!.textContent);
  });

  it("blanks emoji and desc cells for a bucket with no symbol", function () {
    var slot = makeSlot();
    var e: MetTimeseriesEntry = {
      time: new Date(2026, 0, 15, 10, 0, 0).toISOString(),
      data: { instant: {} }
    };
    renderDaily([e], slot);
    var row = slot.forecastList!.querySelector(".forecast-day")!;
    expect(row.querySelector(".forecast-emoji")!.textContent).toBe("");
    expect(row.querySelector(".forecast-desc")!.textContent).toBe("");
    // Missing temps render as "--".
    expect(row.querySelector(".forecast-temp")!.textContent).toBe("--°C / --°C");
  });

  it("returns early when the slot has no forecastList", function () {
    var slot = makeSlot();
    slot.forecastList = null;
    expect(function () { renderDaily([], slot); }).not.toThrow();
  });
});

describe("readForecastMode", function () {
  it("is false when the sub-key is absent", function () {
    expect(readForecastMode()).toBe(false);
  });
  it("is true only when the stored value is strictly true", function () {
    store.set("forecast", true);
    expect(readForecastMode()).toBe(true);
    store.set("forecast", false);
    expect(readForecastMode()).toBe(false);
  });
});
