import { SavedEntry, StoreData } from "./types";
import { loadStore, saveStore } from "./store";
import { t } from "./strings";
import { parseDescriptor } from "./location";
import { validLatLon } from "./util";

// ---- Export / import persisted data -------------------------------------
// Download the whole nu:data blob as a pretty-printed JSON file. Degrades
// quietly if storage or the download APIs are unavailable.
export function exportData() {
  try {
    var blob = loadStore();
    var json = JSON.stringify(blob, null, 2);
    var file = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(file);
    var a = document.createElement("a");
    a.href = url;
    a.download = "nu-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    /* ignore */
  }
}

// Validate a parsed import payload against the known nu:data shape, reusing
// the app's existing read-side rules. Returns a clean blob, or null when the
// input clearly isn't a usable nu:data object (not an object, or no known
// sub-key survives validation). Unknown keys and individually-invalid
// optional entries are dropped silently, matching the lenient read side.
export function validateImport(obj: unknown): StoreData | null {
  if (!obj || typeof obj !== "object" ||
      Object.prototype.toString.call(obj) !== "[object Object]") {
    return null;
  }
  var src = obj as Record<string, unknown>;
  var out: StoreData = {};
  var sawKnownKey = false;

  if (Object.prototype.hasOwnProperty.call(src, "lang")) {
    sawKnownKey = true;
    if (src.lang === "sr" || src.lang === "en") { out.lang = src.lang; }
  }
  if (Object.prototype.hasOwnProperty.call(src, "loc")) {
    sawKnownKey = true;
    var loc = parseDescriptor(src.loc);
    if (loc) { out.loc = loc; }
  }
  if (Object.prototype.hasOwnProperty.call(src, "geo")) {
    sawKnownKey = true;
    if (src.geo && typeof src.geo === "object" &&
        Object.prototype.toString.call(src.geo) === "[object Object]") {
      out.geo = src.geo as Record<string, string>;
    }
  }
  if (Object.prototype.hasOwnProperty.call(src, "saved")) {
    sawKnownKey = true;
    if (Array.isArray(src.saved)) {
      out.saved = src.saved.filter(function (s: SavedEntry) {
        return s && validLatLon(s.lat, s.lon);
      });
    }
  }
  if (Object.prototype.hasOwnProperty.call(src, "selectorCollapsed")) {
    sawKnownKey = true;
    out.selectorCollapsed = !!src.selectorCollapsed;
  }
  if (Object.prototype.hasOwnProperty.call(src, "forecast")) {
    sawKnownKey = true;
    out.forecast = !!src.forecast;
  }
  if (Object.prototype.hasOwnProperty.call(src, "compare")) {
    sawKnownKey = true;
    var cmp = src.compare as { on?: unknown; loc?: unknown } | null;
    if (cmp && typeof cmp === "object") {
      var cmpLoc = parseDescriptor(cmp.loc);
      if (cmpLoc) { out.compare = { on: !!cmp.on, loc: cmpLoc }; }
    }
  }

  // Reject payloads that carry no known sub-key at all — clearly not a
  // nu:data blob. (A known key that fails validation is dropped, but its
  // presence still counts as a recognizable shape.)
  if (!sawKnownKey) { return null; }
  return out;
}

// Read a user-picked JSON file, validate it, confirm, then replace nu:data
// and reload so all state re-renders. Invalid input leaves storage untouched.
export function handleImportFile(file: File): void {
  var reader = new FileReader();
  reader.onload = function () {
    var parsed: unknown = null;
    try {
      parsed = JSON.parse(reader.result as string);
    } catch (e) {
      parsed = null;
    }
    var validated = validateImport(parsed);
    if (!validated) {
      window.alert(t("importInvalid"));
      return;
    }
    try {
      saveStore(validated);
      window.location.reload();
    } catch (e) {
      /* ignore */
    }
  };
  reader.onerror = function () {
    window.alert(t("importInvalid"));
  };
  try {
    reader.readAsText(file);
  } catch (e) {
    window.alert(t("importInvalid"));
  }
}
