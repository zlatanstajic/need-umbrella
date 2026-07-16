import { LocationDescriptor, MetResponse, NominatimResult, SavedEntry } from "./types";
import { store } from "./store";
import {
  currentLang, setCurrentLang,
  currentLocation, setCurrentLocation,
  compareMode, setCompareMode,
  secondaryLocation, setSecondaryLocation,
  forecastMode,
  setRainThresholdOn, setRainThresholdMm,
  syncingScroll, setSyncingScroll
} from "./state";
import {
  el,
  elBadge, elError, elLoading, elWeather,
  primarySlot, secondarySlot,
  showOnly, showNotice, clearNotice
} from "./dom";
import { t, tf } from "./strings";
import { CITIES, BELGRADE, cityName, RAIN_THRESHOLD_DEFAULT } from "./constants";
import { round4, validLatLon } from "./util";
import { reverseGeocode } from "./geo";
import {
  badgeFor, coordsFor, metUrl,
  saveLocation, loadSavedLocation,
  parseDescriptor,
  saveCompareState, loadCompareState,
  readSavedLocations, writeSavedLocations, savedNameFor
} from "./location";
import { renderCurrent, renderPrecip, updateHeaderTitle } from "./render";
import {
  renderDaily,
  forecastToggle, readForecastMode, applyForecastMode
} from "./forecast";
import { exportData, handleImportFile } from "./data";
import { clampThreshold, readRainThreshold, saveRainThreshold } from "./threshold";

// ---- Linked chart scroll (compare mode) ---------------------------------
// When comparing, scrolling one rain chart scrolls the other in lockstep.
// syncingScroll guards against the echo (setting scrollLeft fires "scroll").
function linkChartScroll(source: HTMLElement, target: HTMLElement): void {
  source.addEventListener("scroll", function () {
    if (syncingScroll) { return; }
    if (!compareMode) { return; }
    setSyncingScroll(true);
    target.scrollLeft = source.scrollLeft;
    setSyncingScroll(false);
  });
}
linkChartScroll(primarySlot.chart, secondarySlot.chart);
linkChartScroll(secondarySlot.chart, primarySlot.chart);

function loadWeather(loc: LocationDescriptor): void {
  setCurrentLocation(loc);
  saveLocation(loc);
  refreshCityOptions();
  refreshSaveState();
  var c = coordsFor(loc);
  var lat = c.lat;
  var lon = c.lon;

  showOnly(elLoading);

  fetch(metUrl(lat, lon))
    .then(function (res) {
      if (!res.ok) {
        throw new Error(tf("httpError", res.status));
      }
      return res.json();
    })
    .then(function (data: MetResponse) {
      var timeseries = data &&
        data.properties &&
        data.properties.timeseries;

      if (!timeseries || !timeseries.length) {
        throw new Error(t("noData"));
      }

      renderCurrent(timeseries[0], badgeFor(loc), primarySlot);
      renderPrecip(timeseries, primarySlot);
      // Stash for the daily view so toggling forecast on re-renders without a
      // refetch; render now when forecast mode is already on.
      primarySlot.timeseries = timeseries;
      if (forecastMode) { renderDaily(timeseries, primarySlot); }
      showOnly(elWeather);

      // GPS / manual: resolve a readable place name and swap it into the
      // badge. Guard on object identity so a stale lookup can't clobber a
      // newer location. Keep the coord badge on any failure. A saved custom
      // title (already set by badgeFor) takes precedence — skip geocoding.
      if ((loc.type === "gps" || loc.type === "manual") && !savedNameFor(lat, lon)) {
        reverseGeocode(lat, lon)
          .then(function (place) {
            if (place && currentLocation === loc) {
              elBadge.textContent = place;
              if (primarySlot.chartLabel) { primarySlot.chartLabel.textContent = place; }
              if (forecastMode) { renderDaily(primarySlot.timeseries!, primarySlot); }
            }
          })
          .catch(function () { /* keep coord badge */ });
      }
    })
    .catch(function (err: Error) {
      elError.textContent = t("errorPrefix") + err.message;
      showOnly(elError);
    });
}

// Load slot B into secondarySlot. Session-only: does not persist, does not
// touch the city dropdown / save state, and does not drive the page title or
// the loading/error state-swap (slot A owns the whole-view state). On error
// the slot-B badge shows the message so slot A stays intact. Stale lookups
// are guarded on secondaryLocation identity.
function loadSecondary(loc: LocationDescriptor): void {
  setSecondaryLocation(loc);
  saveCompareState();
  var c = coordsFor(loc);
  var lat = c.lat;
  var lon = c.lon;

  secondarySlot.badge.textContent = t("loading");

  fetch(metUrl(lat, lon))
    .then(function (res) {
      if (!res.ok) {
        throw new Error(tf("httpError", res.status));
      }
      return res.json();
    })
    .then(function (data: MetResponse) {
      if (secondaryLocation !== loc) { return; }
      var timeseries = data &&
        data.properties &&
        data.properties.timeseries;

      if (!timeseries || !timeseries.length) {
        throw new Error(t("noData"));
      }

      renderCurrent(timeseries[0], badgeFor(loc), secondarySlot);
      renderPrecip(timeseries, secondarySlot);
      // Stash for the daily view, same as the primary slot.
      secondarySlot.timeseries = timeseries;
      if (forecastMode && compareMode) { renderDaily(timeseries, secondarySlot); }

      if ((loc.type === "gps" || loc.type === "manual") && !savedNameFor(lat, lon)) {
        reverseGeocode(lat, lon)
          .then(function (place) {
            if (place && secondaryLocation === loc) {
              secondarySlot.badge.textContent = place;
              if (secondarySlot.chartLabel) { secondarySlot.chartLabel.textContent = place; }
              if (forecastMode && compareMode) { renderDaily(secondarySlot.timeseries!, secondarySlot); }
            }
          })
          .catch(function () { /* keep coord badge */ });
      }
    })
    .catch(function (err: Error) {
      if (secondaryLocation !== loc) { return; }
      secondarySlot.badge.textContent = t("errorPrefix") + err.message;
      if (secondarySlot.summary) { secondarySlot.summary.textContent = ""; }
    });
}

// ---- Location inputs ----------------------------------------------------
// Tabs.
// Wire tab-switching scoped to one selector body. `container` is the selector
// body whose `.tab-btn`s are toggled, and `panels` maps tab keys to that
// body's panels — so the two selectors switch tabs independently.
function wireTabs(container: HTMLElement, panels: Record<string, HTMLElement>): void {
  var tabButtons = container.querySelectorAll(".tab-btn");
  Array.prototype.forEach.call(tabButtons, function (btn: HTMLElement) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-tab");
      Array.prototype.forEach.call(tabButtons, function (b: HTMLElement) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      Object.keys(panels).forEach(function (key) {
        if (key === tab) {
          panels[key].classList.remove("hidden");
        } else {
          panels[key].classList.add("hidden");
        }
      });
    });
  });
}

wireTabs(el("selector-body"), {
  gps: el("panel-gps"),
  city: el("panel-city"),
  search: el("panel-search")
});

wireTabs(el("selector-body-b"), {
  gps: el("b-panel-gps"),
  city: el("b-panel-city"),
  search: el("b-panel-search")
});

// GPS.
el("gps-btn").addEventListener("click", function () {
  clearNotice();
  if (!navigator.geolocation) {
    showNotice(t("geoUnavailable"));
    loadWeather(BELGRADE);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var gLat = round4(pos.coords.latitude);
      var gLon = round4(pos.coords.longitude);
      loadWeather({ type: "gps", lat: gLat, lon: gLon });
    },
    function () {
      showNotice(t("geoDenied"));
      loadWeather(BELGRADE);
    },
    { timeout: 8000 }
  );
});

// Slot-B GPS: funnels into loadSecondary instead of loadWeather. On
// unavailable/denied GPS, fall back to Belgrade for slot B with a notice.
el("b-gps-btn").addEventListener("click", function () {
  clearNotice();
  if (!navigator.geolocation) {
    showNotice(t("geoUnavailable"));
    loadSecondary(BELGRADE);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var gLat = round4(pos.coords.latitude);
      var gLon = round4(pos.coords.longitude);
      loadSecondary({ type: "gps", lat: gLat, lon: gLon });
    },
    function () {
      showNotice(t("geoDenied"));
      loadSecondary(BELGRADE);
    },
    { timeout: 8000 }
  );
});

// Saved locations (favorites) on the GPS tab.
var savedList = document.getElementById("saved-list");
var savedListB = document.getElementById("b-saved-list");
var saveBtn = document.getElementById("save-btn") as HTMLButtonElement | null;
var saveSearchBtn = document.getElementById("save-search-btn") as HTMLButtonElement | null;

// Enable "Save location" only when the current location is a custom
// coordinate (GPS or a search/saved pick); cities already live in the
// dropdown.
function refreshSaveState(): void {
  var custom = !!(currentLocation && currentLocation.type !== "city");
  var coord = currentLocation as { lat: number; lon: number } | null;
  var lat = custom ? round4(coord!.lat) : null;
  var lon = custom ? round4(coord!.lon) : null;
  var already = custom && readSavedLocations().some(function (s) {
    return s.lat === lat && s.lon === lon;
  });
  var disabled = !custom || already;
  if (saveBtn) { saveBtn.disabled = disabled; }
  if (saveSearchBtn) { saveSearchBtn.disabled = disabled; }
}

// Build the saved-location chips into a target list element. Each chip loads
// its coords on click via the supplied onLoad callback (slot A uses
// loadWeather, slot B uses loadSecondary), and carries a ✎ to rename and a ✕
// to remove it. A user `name` is shown as-is; otherwise the label
// reverse-geocodes (cached → instant).
function renderSavedInto(listEl: HTMLElement | null, onLoad: (item: SavedEntry) => void): void {
  if (!listEl) { return; }
  var list = readSavedLocations();
  while (listEl.firstChild) {
    listEl.removeChild(listEl.firstChild);
  }
  list.forEach(function (item) {
    var chip = document.createElement("div");
    chip.className = "saved-chip";

    var load = document.createElement("button");
    load.type = "button";
    load.className = "saved-chip-load";
    if (item.name) {
      load.textContent = item.name;
    } else {
      load.textContent = item.lat + ", " + item.lon;
      reverseGeocode(item.lat, item.lon)
        .then(function (place) { if (place) { load.textContent = place; } })
        .catch(function () { /* keep coord label */ });
    }
    load.addEventListener("click", function () {
      onLoad(item);
    });

    var edit = document.createElement("button");
    edit.type = "button";
    edit.className = "saved-chip-edit";
    edit.textContent = "✎";
    edit.setAttribute("aria-label", t("editLocation"));
    edit.addEventListener("click", function () {
      openRename(item, load.textContent);
    });

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "saved-chip-remove";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", t("removeLocation"));
    remove.addEventListener("click", function () {
      var next = readSavedLocations().filter(function (s) {
        return !(s.lat === item.lat && s.lon === item.lon);
      });
      writeSavedLocations(next);
      renderSavedLocations();
      refreshSaveState();
    });

    chip.appendChild(load);
    chip.appendChild(edit);
    chip.appendChild(remove);
    listEl.appendChild(chip);
  });
}

// Render the saved-location chips into both slot-A and slot-B GPS panels.
// Slot-A chips load into the primary view (loadWeather); slot-B chips load
// into the comparison view (loadSecondary).
function renderSavedLocations() {
  renderSavedInto(savedList, function (item) {
    clearNotice();
    loadWeather({ type: "manual", lat: item.lat, lon: item.lon });
  });
  renderSavedInto(savedListB, function (item) {
    clearNotice();
    loadSecondary({ type: "manual", lat: item.lat, lon: item.lon });
  });
}

if (saveBtn) { saveBtn.addEventListener("click", function () {
  if (!currentLocation || currentLocation.type === "city") { return; }
  var lat = round4(currentLocation.lat);
  var lon = round4(currentLocation.lon);
  var list = readSavedLocations();
  var exists = list.some(function (s) {
    return s.lat === lat && s.lon === lon;
  });
  if (!exists) {
    list.push({ lat: lat, lon: lon });
    writeSavedLocations(list);
    renderSavedLocations();
  }
  refreshSaveState();
  showNotice(t("locationSaved"));
}); }

if (saveSearchBtn) {
  saveSearchBtn.addEventListener("click", function () {
    if (!currentLocation || currentLocation.type === "city") { return; }
    var lat = round4(currentLocation.lat);
    var lon = round4(currentLocation.lon);
    var list = readSavedLocations();
    var exists = list.some(function (s) {
      return s.lat === lat && s.lon === lon;
    });
    if (!exists) {
      list.push({ lat: lat, lon: lon });
      writeSavedLocations(list);
      renderSavedLocations();
    }
    refreshSaveState();
    showNotice(t("locationSaved"));
  });
}

// City dropdown.
var citySelect = el<HTMLSelectElement>("city-select");
var citySelectB = el<HTMLSelectElement>("b-city-select");

// (Re)build dropdown option labels from the active-language display name,
// preserving the selected index. Called on load and on language change.
function refreshCityOptions() {
  var selected = citySelect.value;
  while (citySelect.firstChild) {
    citySelect.removeChild(citySelect.firstChild);
  }
  // When the displayed location isn't a dropdown city (GPS / manual),
  // prepend a disabled placeholder entry and select it.
  var isCustom = currentLocation && currentLocation.type !== "city";
  if (isCustom) {
    var ph = document.createElement("option");
    ph.value = "";
    ph.textContent = t("cityCustom");
    ph.disabled = true;
    citySelect.appendChild(ph);
  }
  CITIES.forEach(function (city, index) {
    var opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = cityName(city);
    citySelect.appendChild(opt);
  });
  if (currentLocation && currentLocation.type === "city") {
    citySelect.value = String(currentLocation.cityIndex);
  } else if (isCustom) {
    citySelect.value = "";
  } else if (selected !== "") {
    citySelect.value = selected;
  }

  refreshCityOptionsB();
}

// Slot-B dropdown: mirrors the active-language labels and reflects
// secondaryLocation when it is a dropdown city; otherwise a disabled
// placeholder. No coupling to slot A's currentLocation.
function refreshCityOptionsB() {
  var selectedB = citySelectB.value;
  while (citySelectB.firstChild) {
    citySelectB.removeChild(citySelectB.firstChild);
  }
  var isCustomB = secondaryLocation && secondaryLocation.type !== "city";
  if (isCustomB || !secondaryLocation) {
    var phB = document.createElement("option");
    phB.value = "";
    phB.textContent = t("cityCustom");
    phB.disabled = true;
    citySelectB.appendChild(phB);
  }
  CITIES.forEach(function (city, index) {
    var opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = cityName(city);
    citySelectB.appendChild(opt);
  });
  if (secondaryLocation && secondaryLocation.type === "city") {
    citySelectB.value = String(secondaryLocation.cityIndex);
  } else if (isCustomB || !secondaryLocation) {
    citySelectB.value = "";
  } else if (selectedB !== "") {
    citySelectB.value = selectedB;
  }
}

citySelect.addEventListener("change", function () {
  clearNotice();
  var index = parseInt(citySelect.value, 10);
  if (CITIES[index]) {
    loadWeather({ type: "city", cityIndex: index });
  }
});

citySelectB.addEventListener("change", function () {
  clearNotice();
  var index = parseInt(citySelectB.value, 10);
  if (CITIES[index]) {
    loadSecondary({ type: "city", cityIndex: index });
  }
});

// ---- Place-name search (Nominatim / OpenStreetMap) ----------------------
// A search instance bundles one selector's input/button/error/results nodes
// and the load callback that a picked result funnels into. The same machinery
// drives the primary selector (-> loadWeather) and slot B (-> loadSecondary).
function makeSearch(inputEl: HTMLInputElement, btnEl: HTMLButtonElement, errEl: HTMLElement, resultsEl: HTMLElement, onPick: (lat: number, lon: number) => void): void {
  function clearResults() {
    while (resultsEl.firstChild) {
      resultsEl.removeChild(resultsEl.firstChild);
    }
  }

  function doSearch() {
    var query = inputEl.value.trim();
    errEl.textContent = "";
    errEl.classList.add("hidden");
    clearResults();
    if (!query) { return; }

    btnEl.disabled = true;
    var lang = currentLang === "sr" ? "sr" : "en";
    var params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "6",
      "accept-language": lang
    });
    var url = "https://nominatim.openstreetmap.org/search?" + params.toString();

    fetch(url)
      .then(function (res) {
        if (!res.ok) { throw new Error("HTTP " + res.status); }
        return res.json();
      })
      .then(function (results: NominatimResult[]) {
        btnEl.disabled = false;
        if (!results || !results.length) {
          errEl.textContent = t("searchNoResults");
          errEl.classList.remove("hidden");
          return;
        }
        results.forEach(function (result: NominatimResult) {
          var lat = parseFloat(result.lat);
          var lon = parseFloat(result.lon);
          if (!validLatLon(lat, lon)) { return; }
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "search-result-btn";
          btn.textContent = result.display_name;
          btn.addEventListener("click", function () {
            clearNotice();
            clearResults();
            errEl.textContent = "";
            onPick(round4(lat), round4(lon));
          });
          resultsEl.appendChild(btn);
        });
      })
      .catch(function () {
        btnEl.disabled = false;
        errEl.textContent = t("searchError");
        errEl.classList.remove("hidden");
      });
  }

  btnEl.addEventListener("click", doSearch);
  inputEl.addEventListener("keydown", function (e: KeyboardEvent) {
    if (e.key === "Enter") { doSearch(); }
  });
}

makeSearch(
  el<HTMLInputElement>("search-input"),
  el<HTMLButtonElement>("search-btn"),
  el("search-error"),
  el("search-results"),
  function (rLat: number, rLon: number) {
    loadWeather({ type: "manual", lat: rLat, lon: rLon });
  }
);

makeSearch(
  el<HTMLInputElement>("b-search-input"),
  el<HTMLButtonElement>("b-search-btn"),
  el("b-search-error"),
  el("b-search-results"),
  function (rLat: number, rLon: number) {
    loadSecondary({ type: "manual", lat: rLat, lon: rLon });
  }
);

// ---- Static-string application & language switching ---------------------
var langButtons = document.querySelectorAll(".lang-btn");

// Apply every dictionary-driven static string to the DOM for currentLang.
function applyStaticStrings() {
  document.documentElement.lang = currentLang;
  document.title = t("title");

  var textNodes = document.querySelectorAll("[data-i18n]");
  Array.prototype.forEach.call(textNodes, function (node) {
    node.textContent = t(node.getAttribute("data-i18n"));
  });

  var phNodes = document.querySelectorAll("[data-i18n-placeholder]");
  Array.prototype.forEach.call(phNodes, function (node) {
    node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
  });

  var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
  Array.prototype.forEach.call(ariaNodes, function (node) {
    node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
  });

  var loadingText = document.getElementById("loading-text");
  if (loadingText) { loadingText.textContent = t("loading"); }

  refreshCityOptions();
}

// Mark the toggle button matching currentLang as active.
function markActiveLang() {
  Array.prototype.forEach.call(langButtons, function (btn) {
    if (btn.getAttribute("data-lang") === currentLang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function setLanguage(lang: string | null): void {
  if (lang !== "sr" && lang !== "en") { return; }
  setCurrentLang(lang);
  store.set("lang", lang);
  markActiveLang();
  applyStaticStrings();
  // Re-render saved chips so their place names reload in the new language.
  renderSavedLocations();
  // Re-fetch the current location so dynamic strings (description, banner,
  // badge) reflect the new language.
  if (currentLocation) {
    loadWeather(currentLocation);
  }
  // Re-localize the forecast rows now from the stashed timeseries so the
  // day-of-week / "Today" labels switch language even if the refetch fails
  // (offline). loadWeather's success path also re-renders; this is harmless.
  if (forecastMode && primarySlot.timeseries) {
    renderDaily(primarySlot.timeseries, primarySlot);
  }
  // Slot B is independent of slot A's fetch outcome — reload it directly so
  // it refreshes even when the slot-A fetch errors. Loaded exactly once per
  // language switch (the slot-B call no longer rides slot A's success path).
  if (compareMode && secondaryLocation) {
    loadSecondary(secondaryLocation);
  }
}

Array.prototype.forEach.call(langButtons, function (btn) {
  btn.addEventListener("click", function () {
    setLanguage(btn.getAttribute("data-lang"));
  });
});

// ---- Settings modal -----------------------------------------------------
var settingsOverlay = el("settings-overlay");
var settingsOpenBtn = el("settings-open");
var settingsCloseBtn = el("settings-close");

function openSettings() {
  settingsOverlay.classList.remove("hidden");
}

function closeSettings() {
  settingsOverlay.classList.add("hidden");
}

settingsOpenBtn.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);

// Click on the backdrop (outside the dialog) closes the modal.
settingsOverlay.addEventListener("click", function (e) {
  if (e.target === settingsOverlay) { closeSettings(); }
});

// ---- Export / import persisted data -------------------------------------
var dataExportBtn = el("data-export-btn");

dataExportBtn.addEventListener("click", exportData);

var dataImportBtn = el("data-import-btn");
var dataImportInput = el<HTMLInputElement>("data-import-input");

dataImportBtn.addEventListener("click", function () {
  dataImportInput.click();
});

dataImportInput.addEventListener("change", function () {
  var file = dataImportInput.files && dataImportInput.files[0];
  if (file) { handleImportFile(file); }
  // Reset so re-selecting the same file re-fires "change".
  dataImportInput.value = "";
});

// ---- Rename saved-location modal ----------------------------------------
var renameOverlay = el("rename-overlay");
var renameForm = el("rename-form");
var renameInput = el<HTMLInputElement>("rename-input");
var renameCloseBtn = el("rename-close");
var renameCancelBtn = el("rename-cancel");
var renameTarget: SavedEntry | null = null; // the chip being edited

function openRename(item: SavedEntry, currentLabel: string | null): void {
  renameTarget = item;
  renameInput.value = item.name || currentLabel || "";
  renameOverlay.classList.remove("hidden");
}

function closeRename() {
  renameOverlay.classList.add("hidden");
  renameTarget = null;
}

renameForm.addEventListener("submit", function (e: Event) {
  e.preventDefault();
  if (!renameTarget) { closeRename(); return; }
  var target = renameTarget;
  var next = renameInput.value.trim();
  var updated = readSavedLocations().map(function (s): SavedEntry {
    if (s.lat === target.lat && s.lon === target.lon) {
      var copy: SavedEntry = { lat: s.lat, lon: s.lon };
      if (next) { copy.name = next; } // empty clears the custom title
      return copy;
    }
    return s;
  });
  writeSavedLocations(updated);
  renderSavedLocations();
  // If the renamed location is the one on screen, refresh its badge.
  if (currentLocation &&
      (currentLocation.type === "gps" || currentLocation.type === "manual") &&
      round4(currentLocation.lat) === renameTarget.lat &&
      round4(currentLocation.lon) === renameTarget.lon) {
    if (next) {
      elBadge.textContent = next;
    } else {
      reverseGeocode(round4(currentLocation.lat), round4(currentLocation.lon))
        .then(function (place) { if (place) { elBadge.textContent = place; } })
        .catch(function () { /* keep current badge */ });
    }
  }
  closeRename();
});

renameCloseBtn.addEventListener("click", closeRename);
renameCancelBtn.addEventListener("click", closeRename);
renameOverlay.addEventListener("click", function (e) {
  if (e.target === renameOverlay) { closeRename(); }
});

// Escape closes whichever modal is open.
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") { return; }
  if (!renameOverlay.classList.contains("hidden")) {
    closeRename();
  } else if (!settingsOverlay.classList.contains("hidden")) {
    closeSettings();
  }
});

// ---- Selector visibility (managed from settings) ------------------------
var elSelector = el("selector-section");
var selectorVisToggle = el<HTMLInputElement>("selector-vis-toggle");

// Default visible on first visit (sub-key absent → false → visible).
function readSelectorCollapsed() {
  return store.get("selectorCollapsed", false) === true;
}

function applySelectorCollapsed(collapsed: boolean): void {
  elSelector.classList.toggle("hidden", collapsed);
  // Slot-B selector is visible iff compare is on AND not collapsed.
  if (elSelectorB) {
    elSelectorB.classList.toggle("hidden", collapsed || !compareMode);
  }
  if (selectorVisToggle) {
    selectorVisToggle.checked = !collapsed;
  }
}

selectorVisToggle.addEventListener("change", function () {
  var collapsed = !selectorVisToggle.checked;
  store.set("selectorCollapsed", collapsed);
  applySelectorCollapsed(collapsed);
});

// ---- Compare mode (session-only; never persisted) -----------------------
var compareToggle = el<HTMLInputElement>("compare-toggle");
var elSelectorB = el("selector-section-b");
var elCompareCards = el("compare-cards");
var elSlotCardB = el("slot-card-b");

// Pick a sensible default slot-B city distinct from the primary city, so
// enabling compare with no slot-B pick yet shows two different places.
function defaultSecondary(): LocationDescriptor {
  var primaryIndex = (currentLocation && currentLocation.type === "city")
    ? currentLocation.cityIndex : -1;
  var index = (primaryIndex === 0 && CITIES.length > 1) ? 1 : 0;
  return { type: "city", cityIndex: index };
}

// Show or hide all slot-B chrome (selector, card, stacked-chart nodes,
// per-chart labels) and switch the cards area to the two-column layout.
function applyCompareMode(on: boolean): void {
  setCompareMode(on);
  // Slot-B selector is visible iff compare is on AND the selector isn't
  // collapsed — never force it open when the user has collapsed the panel.
  elSelectorB.classList.toggle("hidden", !on || readSelectorCollapsed());
  elSlotCardB.classList.toggle("hidden", !on);
  elCompareCards.classList.toggle("compare-on", on);

  secondarySlot.precipBanner.classList.toggle("hidden", !on);
  secondarySlot.chart.classList.toggle("hidden", !on);
  if (secondarySlot.summary) { secondarySlot.summary.classList.toggle("hidden", !on); }
  primarySlot.chartLabel!.classList.toggle("hidden", !on);
  secondarySlot.chartLabel!.classList.toggle("hidden", !on);
  // Forecast per-slot labels/rows for slot B only make sense when both
  // compare and forecast are on; slot A's label follows compare alone
  // (mirrors chartLabel) so it only appears once there's a slot B to compare.
  primarySlot.forecastLabel!.classList.toggle("hidden", !(on && forecastMode));
  secondarySlot.forecastList!.classList.toggle("hidden", !(on && forecastMode));
  secondarySlot.forecastLabel!.classList.toggle("hidden", !(on && forecastMode));

  if (compareToggle) { compareToggle.checked = on; }

  if (on) {
    // Ensure slot A's chart label reflects its current badge (renderCurrent
    // sets it, but the primary may have loaded before compare turned on).
    // Only seed from a resolved badge — skip the transient loading string or
    // an empty badge so a mid-load slot A doesn't stamp a stale label; the
    // next slot-A render then populates it.
    var badgeText = elBadge.textContent;
    if (badgeText && badgeText !== t("loading")) {
      primarySlot.chartLabel!.textContent = badgeText;
    }
    if (!secondaryLocation) {
      setSecondaryLocation(defaultSecondary());
    }
    refreshCityOptionsB();
    loadSecondary(secondaryLocation!);
  }
  // Recompute the header: turning compare off drops slot B from the verdict.
  updateHeaderTitle();
  saveCompareState();
}

compareToggle.addEventListener("change", function () {
  applyCompareMode(compareToggle.checked);
});

// ---- 7-day forecast mode (persisted) -------------------------------------
forecastToggle.addEventListener("change", function () {
  applyForecastMode(forecastToggle.checked);
});

// ---- Rain threshold (persisted) ------------------------------------------
var rainThresholdToggle = el<HTMLInputElement>("rain-threshold-toggle");
var rainThresholdInput = el<HTMLInputElement>("rain-threshold-input");

// Re-render every rain verdict from each slot's stashed timeseries, no refetch:
// only the effective threshold changed, so bars/amounts stay but verdicts flip.
function rerenderVerdicts(): void {
  if (primarySlot.timeseries) {
    renderPrecip(primarySlot.timeseries, primarySlot);
    if (forecastMode) { renderDaily(primarySlot.timeseries, primarySlot); }
  }
  if (compareMode && secondarySlot.timeseries) {
    renderPrecip(secondarySlot.timeseries, secondarySlot);
    if (forecastMode) { renderDaily(secondarySlot.timeseries, secondarySlot); }
  }
  updateHeaderTitle();
}

// Read the input, clamp it into range (empty/NaN -> default), push the clamped
// value back into state + the displayed field, persist, and re-render verdicts.
function applyRainThreshold(): void {
  // Treat a truly empty/cleared field as the default here, at the reading
  // boundary — NOT inside clampThreshold, where a genuine typed 0 must still
  // clamp to the minimum (0.1). Number("") is 0, which would otherwise clamp
  // to 0.1 and silently override a cleared field.
  var raw = rainThresholdInput.value.trim();
  var mm = clampThreshold(raw === "" ? RAIN_THRESHOLD_DEFAULT : Number(raw));
  var on = rainThresholdToggle.checked;
  setRainThresholdOn(on);
  setRainThresholdMm(mm);
  rainThresholdInput.value = String(mm);
  saveRainThreshold(on, mm);
  rerenderVerdicts();
}

rainThresholdToggle.addEventListener("change", applyRainThreshold);
rainThresholdInput.addEventListener("change", applyRainThreshold);

// Sync the toggle checkbox + numeric input to the persisted state on load, and
// push the same values through the state setters so the DOM, the live bindings,
// and the stored blob all agree before the first verdict renders.
function restoreRainThreshold(): void {
  var state = readRainThreshold();
  setRainThresholdOn(state.on);
  setRainThresholdMm(state.mm);
  rainThresholdToggle.checked = state.on;
  rainThresholdInput.value = String(state.mm);
}

// ---- Default load -------------------------------------------------------
// Wrap a text/number input so a clear ("x") button overlays its right edge.
// Visibility is driven purely by CSS (:placeholder-shown); this only wires the
// click-to-clear. It does not focus or select the input.
function attachClearButton(input: HTMLInputElement): void {
  var wrap = document.createElement("span");
  wrap.className = "input-wrap";
  input.parentNode!.insertBefore(wrap, input);
  wrap.appendChild(input);
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "input-clear";
  btn.setAttribute("aria-label", "Clear");
  btn.textContent = "×";
  wrap.appendChild(btn);
  btn.addEventListener("click", function () {
    input.value = "";
    var ev: Event;
    try {
      ev = new Event("input", { bubbles: true });
    } catch (e) {
      ev = document.createEvent("Event");
      ev.initEvent("input", true, false);
    }
    input.dispatchEvent(ev);
  });
}

function attachClearButtons(): void {
  var inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
  var i;
  for (i = 0; i < inputs.length; i++) {
    attachClearButton(inputs[i] as HTMLInputElement);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  markActiveLang();
  applyStaticStrings();
  attachClearButtons();
  restoreRainThreshold();
  renderSavedLocations();
  applySelectorCollapsed(readSelectorCollapsed());
  loadWeather(loadSavedLocation() || BELGRADE);
  // Restore a persisted comparison: seed slot B and re-enter compare mode.
  var compare = loadCompareState();
  if (compare) {
    setSecondaryLocation(compare.loc);
    applyCompareMode(true);
  }
  // Restore the persisted 7-day forecast toggle. The section unhides now; the
  // in-flight primary load renders into it on success (forecastMode is set).
  if (readForecastMode()) {
    applyForecastMode(true);
  }
});
