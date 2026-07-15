import { StoreData, StoreKey } from "./types";

// ---- Consolidated storage ----------------------------------------------
// All persisted state lives in one localStorage key as a single JSON blob
// whose sub-keys are lang / loc / geo / saved / selectorCollapsed /
// compare / forecast, read and written through the `store` accessor.
export var STORE_KEY = "nu:data";

// Read the whole blob; returns {} on absent / parse failure / any throw.
export function loadStore(): StoreData {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) { return {}; }
    var obj = JSON.parse(raw);
    return (obj && typeof obj === "object") ? obj : {};
  } catch (e) {
    return {};
  }
}

// Write the whole blob; no-op on any throw.
export function saveStore(obj: StoreData): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  } catch (e) {
    /* ignore */
  }
}

// Read-modify-write accessors for individual sub-keys of the blob. `get`
// returns the stored value for the key when present, otherwise the caller's
// fallback — so the result type is the key's type widened by the fallback's.
export var store = {
  get: function <K extends StoreKey, F>(subKey: K, fallback: F): NonNullable<StoreData[K]> | F {
    var obj = loadStore();
    if (Object.prototype.hasOwnProperty.call(obj, subKey)) {
      return obj[subKey] as NonNullable<StoreData[K]>;
    }
    return fallback;
  },
  set: function <K extends StoreKey>(subKey: K, value: StoreData[K]): void {
    var obj = loadStore();
    obj[subKey] = value;
    saveStore(obj);
  }
};
