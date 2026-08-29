import { describe, it, expect, afterEach, vi } from "vitest";
import {
  LocationTimeUpdater,
  formatTimeInZone,
  locationTime,
  normalizeShowLocationTime,
  renderTimeTarget,
  resetTimeTarget,
  resolveTimeZone,
  setTargetCoordinates,
  targetCoordinatesMatch,
  TimeTarget
} from "../src/time";

function target(): TimeTarget {
  return {
    timeBox: document.createElement("div"),
    timeValue: document.createElement("time"),
    timeDate: document.createElement("div")
  };
}

afterEach(function () {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("coordinate time zones", function () {
  it("uses enabled as the default and accepts only strict booleans", function () {
    expect(normalizeShowLocationTime(undefined)).toBe(true);
    expect(normalizeShowLocationTime("false")).toBe(true);
    expect(normalizeShowLocationTime(0)).toBe(true);
    expect(normalizeShowLocationTime(false)).toBe(false);
    expect(normalizeShowLocationTime(true)).toBe(true);
  });
  it("resolves normal and half-hour-offset locations", function () {
    expect(resolveTimeZone(44.7866, 20.4489)).toBe("Europe/Belgrade");
    expect(resolveTimeZone(28.6139, 77.209)).toBe("Asia/Kolkata");
  });

  it("rejects invalid coordinates without throwing", function () {
    expect(resolveTimeZone(91, 0)).toBe(null);
    expect(resolveTimeZone(0, Infinity)).toBe(null);
  });
});

describe("formatTimeInZone", function () {
  it("returns zero-padded 24-hour time and suppresses a same-day date", function () {
    var result = formatTimeInZone("Europe/Belgrade", new Date("2025-01-15T08:05:00Z"), "en", "Europe/Belgrade");
    expect(result).toMatchObject({ time: "09:05:00", dateLabel: null });
    expect(result!.locationDate).toEqual({ year: 2025, month: 1, day: 15 });
    expect(result!.browserDate).toEqual(result!.locationDate);
    expect(formatTimeInZone("UTC", new Date("2025-01-15T00:05:00Z"), "en", "UTC")!.time).toBe("00:05:00");
  });

  it("formats positive, negative, and half-hour offsets", function () {
    var instant = new Date("2025-01-15T00:05:00Z");
    expect(formatTimeInZone("Pacific/Auckland", instant, "en", "UTC")!.time).toBe("13:05:00");
    expect(formatTimeInZone("America/New_York", instant, "en", "UTC")!.time).toBe("19:05:00");
    expect(formatTimeInZone("Asia/Kolkata", instant, "en", "UTC")!.time).toBe("05:35:00");
  });

  it("shows previous and next dates in the active locale", function () {
    var instant = new Date("2025-01-01T01:30:00Z");
    var previous = formatTimeInZone("America/Los_Angeles", instant, "en", "UTC")!;
    var next = formatTimeInZone("Pacific/Auckland", new Date("2025-01-01T12:30:00Z"), "sr", "UTC")!;
    expect(previous.locationDate).toEqual({ year: 2024, month: 12, day: 31 });
    expect(previous.dateLabel).toContain("31 Dec 2024");
    expect(next.locationDate).toEqual({ year: 2025, month: 1, day: 2 });
    expect(next.dateLabel).toMatch(/2\. jan 2025/i);
  });

  it("formats fresh instants correctly across daylight-saving changes", function () {
    expect(formatTimeInZone("America/New_York", new Date("2025-03-09T06:59:00Z"), "en", "UTC")!.time).toBe("01:59:00");
    expect(formatTimeInZone("America/New_York", new Date("2025-03-09T07:00:00Z"), "en", "UTC")!.time).toBe("03:00:00");
  });

  it("returns null when Intl formatting fails", function () {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(function () {
      throw new RangeError("unsupported");
    } as any);
    expect(formatTimeInZone("UTC", new Date(), "en")).toBe(null);
  });

  it("combines coordinate lookup and formatting", function () {
    expect(locationTime(44.7866, 20.4489, new Date("2025-01-15T08:05:00Z"), "en", "UTC")!.time).toBe("09:05:00");
    expect(locationTime(999, 0, new Date(), "en")).toBe(null);
  });
});

describe("time targets and updater", function () {
  it("stores normalized coordinates and recognizes the same target", function () {
    var item = target();
    expect(setTargetCoordinates(item, 44.78664, 20.44894)).toBe(true);
    expect(item).toMatchObject({
      timeZone: "Europe/Belgrade",
      timeLat: 44.7866,
      timeLon: 20.4489
    });
    expect(targetCoordinatesMatch(item, 44.78661, 20.44891)).toBe(true);
    expect(targetCoordinatesMatch(item, 44.8, 20.4489)).toBe(false);
  });

  it("clears zone, coordinates, and rendered content for a changed target", function () {
    var item = target();
    setTargetCoordinates(item, 44.7866, 20.4489);
    expect(renderTimeTarget(item, new Date("2025-01-15T08:05:00Z"), "en")).toBe(true);
    expect(item.timeValue!.textContent).toBe("09:05:00");

    resetTimeTarget(item);

    expect(item.timeZone).toBe(undefined);
    expect(item.timeLat).toBe(undefined);
    expect(item.timeLon).toBe(undefined);
    expect(item.timeValue!.textContent).toBe("");
    expect(item.timeDate!.textContent).toBe("");
    expect(item.timeBox!.classList.contains("hidden")).toBe(true);
  });

  it("cannot leave mismatched metadata after failed lookup and can be replaced", function () {
    var item = target();
    setTargetCoordinates(item, 44.7866, 20.4489);

    expect(setTargetCoordinates(item, 999, 0)).toBe(false);
    expect(item.timeZone).toBe(undefined);
    expect(item.timeLat).toBe(undefined);
    expect(item.timeLon).toBe(undefined);
    expect(targetCoordinatesMatch(item, 44.7866, 20.4489)).toBe(false);

    expect(setTargetCoordinates(item, 28.6139, 77.209)).toBe(true);
    expect(item).toMatchObject({
      timeZone: "Asia/Kolkata",
      timeLat: 28.6139,
      timeLon: 77.209
    });
  });

  it("uses one second-aligned timer, refreshes, and cleans it up", function () {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T08:05:30.250Z"));
    var item = target();
    item.timeZone = "UTC";
    var updater = new LocationTimeUpdater(function () { return [item]; }, function () { return "en"; });
    var timeoutSpy = vi.spyOn(window, "setTimeout");

    updater.start();
    updater.start();
    expect(item.timeValue!.textContent).toBe("08:05:30");
    expect(timeoutSpy).toHaveBeenCalledTimes(1);
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 750);

    vi.advanceTimersByTime(750);
    expect(item.timeValue!.textContent).toBe("08:05:31");
    expect(timeoutSpy).toHaveBeenCalledTimes(2);
    expect(updater.isRunning()).toBe(true);

    vi.setSystemTime(new Date("2025-01-15T08:09:12Z"));
    updater.refresh();
    expect(item.timeValue!.textContent).toBe("08:09:12");

    updater.stop();
    expect(updater.isRunning()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(item.timeValue!.textContent).toBe("08:09:12");
  });
});
