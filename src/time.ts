import tzLookup from "tz-lookup";
import { Lang } from "./types";
import { round4 } from "./util";

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

export interface LocationTime {
  timeZone: string;
  time: string;
  locationDate: DateParts;
  browserDate: DateParts;
  dateLabel: string | null;
}

export interface TimeTarget {
  timeBox?: HTMLElement;
  timeValue?: HTMLElement;
  timeDate?: HTMLElement;
  timeZone?: string;
  timeLat?: number;
  timeLon?: number;
}

var LOCALES: Record<Lang, string> = {
  sr: "sr-Latn-RS",
  en: "en-GB"
};

export function normalizeShowLocationTime(value: unknown): boolean {
  return typeof value === "boolean" ? value : true;
}

function numericPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  var match = parts.filter(function (part) { return part.type === type; })[0];
  if (!match) { throw new Error("Missing date part"); }
  return Number(match.value);
}

function dateParts(instant: Date, timeZone?: string): DateParts {
  var options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  };
  if (timeZone) { options.timeZone = timeZone; }
  var parts = new Intl.DateTimeFormat("en-CA-u-ca-gregory", options).formatToParts(instant);
  return {
    year: numericPart(parts, "year"),
    month: numericPart(parts, "month"),
    day: numericPart(parts, "day")
  };
}

function sameDate(a: DateParts, b: DateParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function resolveTimeZone(lat: number, lon: number): string | null {
  if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  try {
    return tzLookup(lat, lon);
  } catch (e) {
    return null;
  }
}

export function formatTimeInZone(timeZone: string, instant: Date, lang: Lang, browserTimeZone?: string): LocationTime | null {
  try {
    var locale = LOCALES[lang] + "-u-ca-gregory-hc-h23";
    var locationDate = dateParts(instant, timeZone);
    var browserDate = dateParts(instant, browserTimeZone);
    var time = new Intl.DateTimeFormat(locale, {
      timeZone: timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(instant);
    var dateLabel = sameDate(locationDate, browserDate) ? null :
      new Intl.DateTimeFormat(locale, {
        timeZone: timeZone,
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(instant);
    return {
      timeZone: timeZone,
      time: time,
      locationDate: locationDate,
      browserDate: browserDate,
      dateLabel: dateLabel
    };
  } catch (e) {
    return null;
  }
}

export function locationTime(lat: number, lon: number, instant: Date, lang: Lang, browserTimeZone?: string): LocationTime | null {
  var timeZone = resolveTimeZone(lat, lon);
  return timeZone ? formatTimeInZone(timeZone, instant, lang, browserTimeZone) : null;
}

export function targetCoordinatesMatch(target: TimeTarget, lat: number, lon: number): boolean {
  return !!target.timeZone &&
    target.timeLat === round4(lat) &&
    target.timeLon === round4(lon);
}

export function resetTimeTarget(target: TimeTarget): void {
  target.timeZone = undefined;
  target.timeLat = undefined;
  target.timeLon = undefined;
  if (target.timeBox) { target.timeBox.classList.add("hidden"); }
  if (target.timeValue) { target.timeValue.textContent = ""; }
  if (target.timeDate) {
    target.timeDate.textContent = "";
    target.timeDate.classList.add("hidden");
  }
}

export function setTargetCoordinates(target: TimeTarget, lat: number, lon: number): boolean {
  var normalizedLat = round4(lat);
  var normalizedLon = round4(lon);
  var zone = resolveTimeZone(normalizedLat, normalizedLon);
  if (!zone) {
    resetTimeTarget(target);
    return false;
  }
  target.timeZone = zone;
  target.timeLat = normalizedLat;
  target.timeLon = normalizedLon;
  return true;
}

export function renderTimeTarget(target: TimeTarget, instant: Date, lang: Lang): boolean {
  if (!target.timeBox || !target.timeValue || !target.timeDate) { return false; }
  var formatted = target.timeZone ? formatTimeInZone(target.timeZone, instant, lang) : null;
  if (!formatted) {
    target.timeBox.classList.add("hidden");
    target.timeValue.textContent = "";
    target.timeDate.textContent = "";
    return false;
  }
  target.timeValue.textContent = formatted.time;
  target.timeDate.textContent = formatted.dateLabel || "";
  target.timeDate.classList.toggle("hidden", !formatted.dateLabel);
  target.timeBox.classList.remove("hidden");
  return true;
}

export class LocationTimeUpdater {
  private timer: number | null = null;
  private targets: () => TimeTarget[];
  private lang: () => Lang;
  private now: () => Date;

  constructor(targets: () => TimeTarget[], lang: () => Lang, now?: () => Date) {
    this.targets = targets;
    this.lang = lang;
    this.now = now || function () { return new Date(); };
  }

  refresh(): void {
    var instant = this.now();
    var lang = this.lang();
    this.targets().forEach(function (target) {
      renderTimeTarget(target, instant, lang);
    });
  }

  start(): void {
    this.refresh();
    if (this.timer !== null) { return; }
    this.schedule();
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  isRunning(): boolean {
    return this.timer !== null;
  }

  private schedule(): void {
    var self = this;
    var delay = 1000 - (this.now().getTime() % 1000);
    this.timer = window.setTimeout(function () {
      self.timer = null;
      self.refresh();
      self.schedule();
    }, delay);
  }
}
