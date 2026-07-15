import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { STORE_KEY, loadStore, saveStore, store } from "../src/store";

beforeEach(function () {
  localStorage.clear();
});

afterEach(function () {
  vi.restoreAllMocks();
});

describe("STORE_KEY", function () {
  it("is nu:data", function () {
    expect(STORE_KEY).toBe("nu:data");
  });
});

describe("loadStore", function () {
  it("returns {} when absent", function () {
    expect(loadStore()).toEqual({});
  });
  it("returns {} on parse failure", function () {
    localStorage.setItem(STORE_KEY, "not json{");
    expect(loadStore()).toEqual({});
  });
  it("returns {} when parsed value is not an object", function () {
    localStorage.setItem(STORE_KEY, "42");
    expect(loadStore()).toEqual({});
  });
  it("returns the parsed object", function () {
    localStorage.setItem(STORE_KEY, JSON.stringify({ lang: "en" }));
    expect(loadStore()).toEqual({ lang: "en" });
  });
  it("returns {} when getItem throws", function () {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function () {
      throw new Error("boom");
    });
    expect(loadStore()).toEqual({});
  });
});

describe("saveStore", function () {
  it("writes the blob as JSON", function () {
    saveStore({ lang: "en" });
    expect(localStorage.getItem(STORE_KEY)).toBe(JSON.stringify({ lang: "en" }));
  });
  it("is a no-op when setItem throws", function () {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function () {
      throw new Error("quota");
    });
    expect(function () { saveStore({ lang: "en" }); }).not.toThrow();
  });
});

describe("store.get / store.set", function () {
  it("returns the fallback when the sub-key is absent", function () {
    expect(store.get("lang", "sr")).toBe("sr");
  });
  it("returns a stored falsy value rather than the fallback", function () {
    saveStore({ selectorCollapsed: false });
    expect(store.get("selectorCollapsed", true)).toBe(false);
    saveStore({ forecast: false });
    expect(store.get("forecast", true)).toBe(false);
  });
  it("returns a stored null rather than the fallback", function () {
    saveStore({ loc: null });
    expect(store.get("loc", { type: "city", cityIndex: 0 } as any)).toBe(null);
  });
  it("set is a read-modify-write preserving other sub-keys", function () {
    store.set("lang", "en");
    store.set("forecast", true);
    expect(loadStore()).toEqual({ lang: "en", forecast: true });
  });
});
