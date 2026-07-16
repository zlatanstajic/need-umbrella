import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { exportData, validateImport, handleImportFile } from "../src/data";
import { loadStore, saveStore, STORE_KEY } from "../src/store";

// A controllable FileReader stub: readAsText synchronously invokes onload
// (or onerror) so handleImportFile's async path is deterministic.
var readerMode: "load" | "error" | "throw" = "load";
var readerResult = "";

class FakeFileReader {
  public result: string | null = null;
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  readAsText(_file: unknown): void {
    if (readerMode === "throw") { throw new Error("read failed"); }
    if (readerMode === "error") { if (this.onerror) { this.onerror(); } return; }
    this.result = readerResult;
    if (this.onload) { this.onload(); }
  }
}

beforeEach(function () {
  localStorage.clear();
  readerMode = "load";
  readerResult = "";
  vi.stubGlobal("FileReader", FakeFileReader as unknown as typeof FileReader);
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(function () { return "blob:x"; }),
    revokeObjectURL: vi.fn()
  });
  vi.spyOn(window, "alert").mockImplementation(function () { /* noop */ });
  // jsdom's location.reload throws "Not implemented"; replace it.
  Object.defineProperty(window, "location", {
    value: Object.assign({}, window.location, { reload: vi.fn() }),
    writable: true,
    configurable: true
  });
});

afterEach(function () {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("exportData", function () {
  it("builds a blob URL, clicks a download anchor, and revokes the URL", function () {
    saveStore({ lang: "en" });
    var clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () { /* noop */ });
    exportData();
    expect((URL.createObjectURL as any)).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect((URL.revokeObjectURL as any)).toHaveBeenCalledTimes(1);
    // Anchor is removed after the click.
    expect(document.querySelector("a[download='nu-data.json']")).toBe(null);
  });
  it("degrades quietly when createObjectURL throws", function () {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(function () { throw new Error("no"); }),
      revokeObjectURL: vi.fn()
    });
    expect(function () { exportData(); }).not.toThrow();
  });
});

describe("validateImport", function () {
  it("returns null for non-plain-objects", function () {
    expect(validateImport(null)).toBe(null);
    expect(validateImport(42)).toBe(null);
    expect(validateImport([1, 2])).toBe(null);
    expect(validateImport("x")).toBe(null);
  });
  it("returns null when no known sub-key is present", function () {
    expect(validateImport({ bogus: 1 })).toBe(null);
  });
  it("keeps lang only when sr/en", function () {
    expect(validateImport({ lang: "en" })).toEqual({ lang: "en" });
    expect(validateImport({ lang: "fr" })).toEqual({});
  });
  it("validates loc via parseDescriptor", function () {
    expect(validateImport({ loc: { type: "city", cityIndex: 0 } })).toEqual({ loc: { type: "city", cityIndex: 0 } });
    expect(validateImport({ loc: { type: "gps", lat: 999, lon: 0 } })).toEqual({});
  });
  it("keeps geo only when a plain object", function () {
    expect(validateImport({ geo: { "a": "b" } })).toEqual({ geo: { "a": "b" } });
    expect(validateImport({ geo: [1] })).toEqual({});
  });
  it("filters saved by validLatLon", function () {
    expect(validateImport({ saved: [{ lat: 1, lon: 2 }, { lat: 999, lon: 0 }] }))
      .toEqual({ saved: [{ lat: 1, lon: 2 }] });
    expect(validateImport({ saved: "notarray" })).toEqual({});
  });
  it("coerces selectorCollapsed and forecast to booleans", function () {
    expect(validateImport({ selectorCollapsed: 1, forecast: 0 }))
      .toEqual({ selectorCollapsed: true, forecast: false });
  });
  it("keeps compare only with a valid slot-B descriptor", function () {
    expect(validateImport({ compare: { on: true, loc: { type: "gps", lat: 1, lon: 2 } } }))
      .toEqual({ compare: { on: true, loc: { type: "gps", lat: 1, lon: 2 } } });
    // Present key but invalid loc -> dropped, but still counts as sawKnownKey.
    expect(validateImport({ compare: { on: true, loc: { type: "gps", lat: 999, lon: 0 } } })).toEqual({});
    expect(validateImport({ compare: 42 })).toEqual({});
  });
  it("accepts rainThreshold, coercing on and clamping mm", function () {
    expect(validateImport({ rainThreshold: { on: 1, mm: 2.5 } }))
      .toEqual({ rainThreshold: { on: true, mm: 2.5 } });
    // Out-of-range mm clamps into [0.1, 100].
    expect(validateImport({ rainThreshold: { on: true, mm: 999 } }))
      .toEqual({ rainThreshold: { on: true, mm: 100 } });
    expect(validateImport({ rainThreshold: { on: false, mm: 0 } }))
      .toEqual({ rainThreshold: { on: false, mm: 0.1 } });
    // Malformed mm coerces to the default.
    expect(validateImport({ rainThreshold: { on: false, mm: "x" } }))
      .toEqual({ rainThreshold: { on: false, mm: 0.5 } });
  });
  it("drops a malformed rainThreshold but keeps other known keys", function () {
    expect(validateImport({ lang: "en", rainThreshold: 42 }))
      .toEqual({ lang: "en" });
    expect(validateImport({ lang: "en", rainThreshold: [1] }))
      .toEqual({ lang: "en" });
  });
  it("counts a sole rainThreshold key as a recognizable shape", function () {
    expect(validateImport({ rainThreshold: { on: true, mm: 1 } }))
      .toEqual({ rainThreshold: { on: true, mm: 1 } });
    // Present-but-malformed sole key still recognizes the shape (not null).
    expect(validateImport({ rainThreshold: 42 })).toEqual({});
  });
});

describe("handleImportFile", function () {
  var file = new File(["{}"], "x.json", { type: "application/json" });

  it("saves and reloads on a valid payload", function () {
    readerResult = JSON.stringify({ lang: "en" });
    handleImportFile(file);
    expect(loadStore()).toEqual({ lang: "en" });
    expect((window.location.reload as any)).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled();
  });
  it("alerts and leaves storage untouched on invalid JSON", function () {
    readerResult = "not json{";
    handleImportFile(file);
    expect(localStorage.getItem(STORE_KEY)).toBe(null);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect((window.location.reload as any)).not.toHaveBeenCalled();
  });
  it("alerts when the payload validates to null (no known keys)", function () {
    readerResult = JSON.stringify({ bogus: 1 });
    handleImportFile(file);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect((window.location.reload as any)).not.toHaveBeenCalled();
  });
  it("alerts on a read error", function () {
    readerMode = "error";
    handleImportFile(file);
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
  it("alerts when readAsText throws", function () {
    readerMode = "throw";
    handleImportFile(file);
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});
