"use strict";
(() => {
  // src/store.ts
  var STORE_KEY = "nu:data";
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        return {};
      }
      var obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
      return {};
    }
  }
  function saveStore(obj) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(obj));
    } catch (e) {
    }
  }
  var store = {
    get: function(subKey, fallback) {
      var obj = loadStore();
      if (Object.prototype.hasOwnProperty.call(obj, subKey)) {
        return obj[subKey];
      }
      return fallback;
    },
    set: function(subKey, value) {
      var obj = loadStore();
      obj[subKey] = value;
      saveStore(obj);
    }
  };

  // src/state.ts
  var currentLang = (function() {
    var saved = store.get("lang", "sr");
    return saved === "sr" || saved === "en" ? saved : "sr";
  })();
  function setCurrentLang(v) {
    currentLang = v;
  }
  var currentLocation = null;
  function setCurrentLocation(v) {
    currentLocation = v;
  }
  var compareMode = false;
  function setCompareMode(v) {
    compareMode = v;
  }
  var secondaryLocation = null;
  function setSecondaryLocation(v) {
    secondaryLocation = v;
  }
  var forecastMode = false;
  function setForecastMode(v) {
    forecastMode = v;
  }
  var syncingScroll = false;
  function setSyncingScroll(v) {
    syncingScroll = v;
  }
  var rainThresholdOn = (function() {
    var raw = store.get("rainThreshold", { on: false, mm: 0.5 });
    return !!(raw && raw.on);
  })();
  function setRainThresholdOn(v) {
    rainThresholdOn = v;
  }
  var rainThresholdMm = (function() {
    var raw = store.get("rainThreshold", { on: false, mm: 0.5 });
    var mm = raw ? Number(raw.mm) : 0.5;
    return typeof mm === "number" && isFinite(mm) ? mm : 0.5;
  })();
  function setRainThresholdMm(v) {
    rainThresholdMm = v;
  }

  // src/dom.ts
  function el(id) {
    return document.getElementById(id);
  }
  var elLoading = el("loading");
  var elError = el("error");
  var elWeather = el("weather");
  var elNotice = el("notice");
  var elBadge = el("location-badge");
  var elEmoji = el("cur-emoji");
  var elTemp = el("cur-temp");
  var elDesc = el("cur-desc");
  var elHumidity = el("tile-humidity");
  var elWind = el("tile-wind");
  var elPressure = el("tile-pressure");
  var elCloud = el("tile-cloud");
  var elPrecipBanner = el("precip-banner");
  var elChart = el("chart");
  var primarySlot = {
    badge: elBadge,
    emoji: elEmoji,
    temp: elTemp,
    desc: elDesc,
    humidity: elHumidity,
    wind: elWind,
    pressure: elPressure,
    cloud: elCloud,
    precipBanner: elPrecipBanner,
    chart: elChart,
    chartLabel: document.getElementById("chart-label-a"),
    summary: document.getElementById("rain-summary-a"),
    thresholdNote: document.getElementById("threshold-note-a"),
    feels: document.getElementById("cur-feels"),
    forecastList: document.getElementById("forecast-list"),
    forecastLabel: document.getElementById("forecast-label-a")
  };
  var secondarySlot = {
    badge: el("b-location-badge"),
    emoji: el("b-cur-emoji"),
    temp: el("b-cur-temp"),
    desc: el("b-cur-desc"),
    humidity: el("b-tile-humidity"),
    wind: el("b-tile-wind"),
    pressure: el("b-tile-pressure"),
    cloud: el("b-tile-cloud"),
    precipBanner: el("b-precip-banner"),
    chart: el("b-chart"),
    chartLabel: document.getElementById("chart-label-b"),
    summary: document.getElementById("rain-summary-b"),
    thresholdNote: document.getElementById("threshold-note-b"),
    feels: document.getElementById("b-cur-feels"),
    forecastList: document.getElementById("forecast-list-b"),
    forecastLabel: document.getElementById("forecast-label-b")
  };
  function showOnly(target) {
    elLoading.classList.add("hidden");
    elError.classList.add("hidden");
    elWeather.classList.add("hidden");
    target.classList.remove("hidden");
  }
  function showNotice(message) {
    elNotice.textContent = message;
    elNotice.classList.remove("hidden");
  }
  function clearNotice() {
    elNotice.textContent = "";
    elNotice.classList.add("hidden");
  }

  // src/strings.ts
  var STRINGS = {
    sr: {
      title: "Treba li ki\u0161obran? \u2014 Vremenska prognoza",
      headerTitle: "Treba li ki\u0161obran? \u2614",
      headerRain: "Treba vam ki\u0161obran \u2614",
      headerDry: "Ostavite ki\u0161obran \u{1F324}\uFE0F",
      headerSubtitle: "Trenutno vreme i prognoza ki\u0161e za narednih 24h",
      settingsTitle: "Pode\u0161avanja",
      settingsOpen: "Pode\u0161avanja",
      settingsClose: "Zatvori",
      languageLabel: "Jezik",
      tabGps: "\u{1F4CD} GPS",
      tabCity: "\u{1F3D9}\uFE0F Grad",
      selectorSection: "Izbor lokacije",
      selectorVisLabel: "Prika\u017Ei izbor lokacije",
      compareLabel: "Uporedi dve lokacije",
      compareSecondHeading: "Druga lokacija",
      forecastLabel: "Prognoza za 7 dana",
      rainThresholdLabel: "Prag za ki\u0161u (mm)",
      dataLabel: "Podaci",
      exportBtn: "Izvezi",
      importBtn: "Uvezi",
      importInvalid: "Neispravna datoteka. Podaci nisu promenjeni.",
      importOk: "Podaci su uvezeni.",
      gpsBtn: "\u{1F4CD} Koristi moju lokaciju",
      saveLocation: "Sa\u010Duvaj lokaciju",
      removeLocation: "Ukloni lokaciju",
      editLocation: "Izmeni naziv",
      editTitle: "Naziv lokacije",
      editPlaceholder: "Unesite naziv",
      renameSave: "Sa\u010Duvaj",
      renameCancel: "Otka\u017Ei",
      locationSaved: "Lokacija sa\u010Duvana.",
      tabSearch: "\u{1F50D} Pretraga",
      searchPlaceholder: "Unesite naziv mesta",
      searchBtn: "Tra\u017Ei",
      searchNoResults: "Nema rezultata.",
      searchError: "Pretraga nije uspela.",
      cityCustom: "\u{1F4CD} Prilago\u0111ena lokacija",
      next24: "Narednih 24 sata",
      next7: "Narednih 7 dana",
      today: "Danas",
      days: ["Ned", "Pon", "Uto", "Sre", "\u010Cet", "Pet", "Sub"],
      tileHumidity: "Vla\u017Enost",
      tileWind: "Vetar",
      tilePressure: "Pritisak",
      tileCloud: "Obla\u010Dnost",
      footerData: "Podaci o vremenu sa",
      footerLicensed: ", licencirani pod",
      footerSource: "Izvor na GitHub-u",
      loading: "U\u010Ditavanje prognoze\u2026",
      errorPrefix: "U\u010Ditavanje prognoze nije uspelo: ",
      httpError: function(status) {
        return "Vremenski servis je vratio HTTP " + status;
      },
      noData: "Nema dostupne prognoze za ovu lokaciju.",
      geoUnavailable: "Geolokacija nije dostupna \u2014 prikazujem Beograd.",
      geoDenied: "Pristup lokaciji odbijen ili nedostupan \u2014 prikazujem Beograd.",
      rainSummary: function(start, stop, total) {
        return "(" + start + "\u2013" + stop + ", " + total + ")";
      },
      rainBanner: function(totalText) {
        return "\u2614 O\u010Dekuje se ki\u0161a \u2014 " + totalText + " u narednih 24h. Ponesite ki\u0161obran!";
      },
      dryBanner: function(totalText) {
        return "\u{1F324}\uFE0F Nema zna\u010Dajne ki\u0161e \u2014 o\u010Dekuje se " + totalText + " u narednih 24h.";
      },
      thresholdIgnored: function(mmText) {
        return "\u24D8 Prag za ki\u0161u je uklju\u010Den \u2014 padavine ispod " + mmText + " se zanemaruju.";
      },
      myLocation: function(lat, lon) {
        return "Moja lokacija (" + lat + ", " + lon + ")";
      },
      feelsLike: function(v) {
        return "Ose\u0107a se kao " + v + "\xB0C";
      },
      condFallback: "Trenutni uslovi",
      cond: {
        clearsky: "Vedro",
        fair: "Prete\u017Eno vedro",
        partlycloudy: "Delimi\u010Dno obla\u010Dno",
        cloudy: "Obla\u010Dno",
        fog: "Magla",
        lightrain: "Slaba ki\u0161a",
        rain: "Ki\u0161a",
        heavyrain: "Jaka ki\u0161a",
        lightrainshowers: "Slabi pljuskovi",
        rainshowers: "Pljuskovi",
        heavyrainshowers: "Jaki pljuskovi",
        lightsleet: "Slaba susne\u017Eica",
        sleet: "Susne\u017Eica",
        heavysleet: "Jaka susne\u017Eica",
        lightsleetshowers: "Slabi pljuskovi susne\u017Eice",
        sleetshowers: "Pljuskovi susne\u017Eice",
        heavysleetshowers: "Jaki pljuskovi susne\u017Eice",
        lightssleetshowers: "Slabi pljuskovi susne\u017Eice",
        lightsnow: "Slab sneg",
        snow: "Sneg",
        heavysnow: "Jak sneg",
        lightsnowshowers: "Slabi sne\u017Eni pljuskovi",
        snowshowers: "Sne\u017Eni pljuskovi",
        heavysnowshowers: "Jaki sne\u017Eni pljuskovi",
        lightssnowshowers: "Slabi sne\u017Eni pljuskovi",
        lightrainandthunder: "Slaba ki\u0161a i grmljavina",
        rainandthunder: "Ki\u0161a i grmljavina",
        heavyrainandthunder: "Jaka ki\u0161a i grmljavina",
        lightrainshowersandthunder: "Slabi pljuskovi i grmljavina",
        rainshowersandthunder: "Pljuskovi i grmljavina",
        heavyrainshowersandthunder: "Jaki pljuskovi i grmljavina",
        lightsleetandthunder: "Slaba susne\u017Eica i grmljavina",
        sleetandthunder: "Susne\u017Eica i grmljavina",
        heavysleetandthunder: "Jaka susne\u017Eica i grmljavina",
        lightsleetshowersandthunder: "Slabi pljuskovi susne\u017Eice i grmljavina",
        sleetshowersandthunder: "Pljuskovi susne\u017Eice i grmljavina",
        heavysleetshowersandthunder: "Jaki pljuskovi susne\u017Eice i grmljavina",
        lightssleetshowersandthunder: "Slabi pljuskovi susne\u017Eice i grmljavina",
        lightsnowandthunder: "Slab sneg i grmljavina",
        snowandthunder: "Sneg i grmljavina",
        heavysnowandthunder: "Jak sneg i grmljavina",
        lightsnowshowersandthunder: "Slabi sne\u017Eni pljuskovi i grmljavina",
        snowshowersandthunder: "Sne\u017Eni pljuskovi i grmljavina",
        heavysnowshowersandthunder: "Jaki sne\u017Eni pljuskovi i grmljavina",
        lightssnowshowersandthunder: "Slabi sne\u017Eni pljuskovi i grmljavina"
      }
    },
    en: {
      title: "Need Umbrella? \u2014 Weather",
      headerTitle: "Need Umbrella? \u2614",
      headerRain: "You need an umbrella \u2614",
      headerDry: "Leave umbrella \u{1F324}\uFE0F",
      headerSubtitle: "Live weather and 24-hour rain outlook",
      settingsTitle: "Settings",
      settingsOpen: "Settings",
      settingsClose: "Close",
      languageLabel: "Language",
      tabGps: "\u{1F4CD} GPS",
      tabCity: "\u{1F3D9}\uFE0F City",
      selectorSection: "Choose location",
      selectorVisLabel: "Show location selector",
      compareLabel: "Compare two locations",
      compareSecondHeading: "Second location",
      forecastLabel: "7-day forecast",
      rainThresholdLabel: "Rain threshold (mm)",
      dataLabel: "Data",
      exportBtn: "Export",
      importBtn: "Import",
      importInvalid: "Invalid file. Your data was not changed.",
      importOk: "Data imported.",
      gpsBtn: "\u{1F4CD} Use my location",
      saveLocation: "Save location",
      removeLocation: "Remove location",
      editLocation: "Edit name",
      editTitle: "Location name",
      editPlaceholder: "Enter a name",
      renameSave: "Save",
      renameCancel: "Cancel",
      locationSaved: "Location saved.",
      tabSearch: "\u{1F50D} Search",
      searchPlaceholder: "Enter a place name",
      searchBtn: "Search",
      searchNoResults: "No results found.",
      searchError: "Search failed.",
      cityCustom: "\u{1F4CD} Custom location",
      next24: "Next 24 hours",
      next7: "Next 7 days",
      today: "Today",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      tileHumidity: "Humidity",
      tileWind: "Wind",
      tilePressure: "Pressure",
      tileCloud: "Cloud cover",
      footerData: "Weather data from",
      footerLicensed: ", licensed under",
      footerSource: "Source on GitHub",
      loading: "Loading weather\u2026",
      errorPrefix: "Could not load weather: ",
      httpError: function(status) {
        return "Weather service returned HTTP " + status;
      },
      noData: "No forecast data available for this location.",
      geoUnavailable: "Geolocation unavailable \u2014 showing Belgrade instead.",
      geoDenied: "Location access denied or unavailable \u2014 showing Belgrade instead.",
      rainSummary: function(start, stop, total) {
        return "(" + start + "\u2013" + stop + ", " + total + ")";
      },
      rainBanner: function(totalText) {
        return "\u2614 Rain expected \u2014 " + totalText + " over the next 24h. Take an umbrella!";
      },
      dryBanner: function(totalText) {
        return "\u{1F324}\uFE0F No significant rain \u2014 " + totalText + " expected over the next 24h.";
      },
      thresholdIgnored: function(mmText) {
        return "\u24D8 Rain threshold is on \u2014 precipitation below " + mmText + " is ignored.";
      },
      myLocation: function(lat, lon) {
        return "My location (" + lat + ", " + lon + ")";
      },
      feelsLike: function(v) {
        return "Feels like " + v + "\xB0C";
      },
      condFallback: "Current conditions",
      cond: {
        clearsky: "Clear sky",
        fair: "Fair",
        partlycloudy: "Partly cloudy",
        cloudy: "Cloudy",
        fog: "Fog",
        lightrain: "Light rain",
        rain: "Rain",
        heavyrain: "Heavy rain",
        lightrainshowers: "Light rain showers",
        rainshowers: "Rain showers",
        heavyrainshowers: "Heavy rain showers",
        lightsleet: "Light sleet",
        sleet: "Sleet",
        heavysleet: "Heavy sleet",
        lightsleetshowers: "Light sleet showers",
        sleetshowers: "Sleet showers",
        heavysleetshowers: "Heavy sleet showers",
        lightssleetshowers: "Light sleet showers",
        lightsnow: "Light snow",
        snow: "Snow",
        heavysnow: "Heavy snow",
        lightsnowshowers: "Light snow showers",
        snowshowers: "Snow showers",
        heavysnowshowers: "Heavy snow showers",
        lightssnowshowers: "Light snow showers",
        lightrainandthunder: "Light rain and thunder",
        rainandthunder: "Rain and thunder",
        heavyrainandthunder: "Heavy rain and thunder",
        lightrainshowersandthunder: "Light rain showers and thunder",
        rainshowersandthunder: "Rain showers and thunder",
        heavyrainshowersandthunder: "Heavy rain showers and thunder",
        lightsleetandthunder: "Light sleet and thunder",
        sleetandthunder: "Sleet and thunder",
        heavysleetandthunder: "Heavy sleet and thunder",
        lightsleetshowersandthunder: "Light sleet showers and thunder",
        sleetshowersandthunder: "Sleet showers and thunder",
        heavysleetshowersandthunder: "Heavy sleet showers and thunder",
        lightssleetshowersandthunder: "Light sleet showers and thunder",
        lightsnowandthunder: "Light snow and thunder",
        snowandthunder: "Snow and thunder",
        heavysnowandthunder: "Heavy snow and thunder",
        lightsnowshowersandthunder: "Light snow showers and thunder",
        snowshowersandthunder: "Snow showers and thunder",
        heavysnowshowersandthunder: "Heavy snow showers and thunder",
        lightssnowshowersandthunder: "Light snow showers and thunder"
      }
    }
  };
  function t(key) {
    var bundle = STRINGS[currentLang] || {};
    if (Object.prototype.hasOwnProperty.call(bundle, key)) {
      return bundle[key];
    }
    return key;
  }
  function tf(key, ...rest) {
    var bundle = STRINGS[currentLang] || {};
    var entry = bundle[key];
    if (typeof entry === "function") {
      var args = Array.prototype.slice.call(arguments, 1);
      return entry.apply(null, args);
    }
    return key;
  }

  // src/constants.ts
  var CITIES = [
    { key: "belgrade", names: { sr: "Beograd", en: "Belgrade" }, lat: 44.8176, lon: 20.4633 },
    { key: "novisad", names: { sr: "Novi Sad", en: "Novi Sad" }, lat: 45.2671, lon: 19.8335 },
    { key: "kragujevac", names: { sr: "Kragujevac", en: "Kragujevac" }, lat: 44.0128, lon: 20.9114 },
    { key: "nis", names: { sr: "Ni\u0161", en: "Nis" }, lat: 43.3209, lon: 21.8954 },
    { key: "pozarevac", names: { sr: "Po\u017Earevac", en: "Pozarevac" }, lat: 44.6212, lon: 21.1867 },
    { key: "jagodina", names: { sr: "Jagodina", en: "Jagodina" }, lat: 43.9772, lon: 21.2611 }
  ];
  var BELGRADE = { type: "city", cityIndex: 0 };
  function cityName(city) {
    return city.names && city.names[currentLang] || city.names && city.names.en || "";
  }
  var PRECIP_THRESHOLD_MM = 0.1;
  var RAIN_THRESHOLD_MIN = 0.1;
  var RAIN_THRESHOLD_MAX = 100;
  var RAIN_THRESHOLD_DEFAULT = 0.5;

  // src/util.ts
  function round4(n) {
    return Math.round(n * 1e4) / 1e4;
  }
  function hourText(ms) {
    var h = new Date(ms).getHours();
    return (h < 10 ? "0" + h : h) + ":00";
  }
  function degreesToCompass(deg) {
    var points = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW"
    ];
    var idx = Math.round(deg / 22.5) % 16;
    if (idx < 0) {
      idx += 16;
    }
    return points[idx];
  }
  function validLatLon(lat, lon) {
    return typeof lat === "number" && typeof lon === "number" && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  // src/geo.ts
  function readGeoCache() {
    var obj = store.get("geo", {});
    return obj && typeof obj === "object" ? obj : {};
  }
  function writeGeoCache(cache) {
    store.set("geo", cache);
  }
  function reverseGeocode(lat, lon) {
    var lang = currentLang === "sr" ? "sr" : "en";
    var key = lang + "|" + lat + "|" + lon;
    var cache = readGeoCache();
    if (Object.prototype.hasOwnProperty.call(cache, key)) {
      return Promise.resolve(cache[key]);
    }
    var url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=" + lang;
    return fetch(url).then(function(res) {
      if (!res.ok) {
        throw new Error("geo " + res.status);
      }
      return res.json();
    }).then(function(d) {
      var parts = [];
      var place = d.city || d.locality || d.principalSubdivision;
      if (place) {
        parts.push(place);
      }
      if (d.countryName) {
        parts.push(d.countryName);
      }
      var name = parts.join(", ");
      var latest = readGeoCache();
      latest[key] = name;
      writeGeoCache(latest);
      return name;
    });
  }

  // src/location.ts
  function badgeFor(loc) {
    if (!loc) {
      return "";
    }
    if (loc.type === "city") {
      var city = CITIES[loc.cityIndex];
      return city ? cityName(city) : "";
    }
    var custom = savedNameFor(loc.lat, loc.lon);
    if (custom) {
      return custom;
    }
    if (loc.type === "gps") {
      return tf("myLocation", loc.lat, loc.lon);
    }
    return loc.lat + ", " + loc.lon;
  }
  function saveLocation(loc) {
    store.set("loc", loc);
  }
  function parseDescriptor(loc) {
    if (!loc || typeof loc !== "object") {
      return null;
    }
    var d = loc;
    if (d.type === "city") {
      if (typeof d.cityIndex === "number" && CITIES[d.cityIndex]) {
        return { type: "city", cityIndex: d.cityIndex };
      }
      return null;
    }
    if (d.type === "gps" || d.type === "manual") {
      if (validLatLon(d.lat, d.lon)) {
        return { type: d.type, lat: d.lat, lon: d.lon };
      }
      return null;
    }
    return null;
  }
  function loadSavedLocation() {
    return parseDescriptor(store.get("loc", null));
  }
  function saveCompareState() {
    store.set("compare", {
      on: compareMode,
      loc: secondaryLocation
    });
  }
  function loadCompareState() {
    var state = store.get("compare", null);
    if (!state || typeof state !== "object" || !state.on) {
      return null;
    }
    var loc = parseDescriptor(state.loc);
    if (!loc) {
      return null;
    }
    return { on: true, loc };
  }
  function readSavedLocations() {
    var list = store.get("saved", []);
    if (!Array.isArray(list)) {
      return [];
    }
    return list.filter(function(s) {
      return s && validLatLon(s.lat, s.lon);
    });
  }
  function writeSavedLocations(list) {
    store.set("saved", list);
  }
  function savedNameFor(lat, lon) {
    var rLat = round4(lat);
    var rLon = round4(lon);
    var match = readSavedLocations().filter(function(s) {
      return s.lat === rLat && s.lon === rLon && s.name;
    })[0];
    return match ? match.name : null;
  }
  function coordsFor(loc) {
    var coords = loc.type === "city" ? CITIES[loc.cityIndex] : loc;
    return { lat: round4(coords.lat), lon: round4(coords.lon) };
  }
  function metUrl(lat, lon) {
    var params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    return "https://api.met.no/weatherapi/locationforecast/2.0/compact?" + params.toString();
  }

  // src/threshold.ts
  function clampThreshold(mm) {
    if (typeof mm !== "number" || !isFinite(mm)) {
      return RAIN_THRESHOLD_DEFAULT;
    }
    if (mm < RAIN_THRESHOLD_MIN) {
      return RAIN_THRESHOLD_MIN;
    }
    if (mm > RAIN_THRESHOLD_MAX) {
      return RAIN_THRESHOLD_MAX;
    }
    return mm;
  }
  function readRainThreshold() {
    var raw = store.get("rainThreshold", { on: false, mm: RAIN_THRESHOLD_DEFAULT });
    if (!raw) {
      return { on: false, mm: RAIN_THRESHOLD_DEFAULT };
    }
    return { on: !!raw.on, mm: clampThreshold(Number(raw.mm)) };
  }
  function effectiveThreshold() {
    return rainThresholdOn ? clampThreshold(rainThresholdMm) : PRECIP_THRESHOLD_MM;
  }
  function saveRainThreshold(on, mm) {
    store.set("rainThreshold", { on: !!on, mm: clampThreshold(mm) });
  }

  // src/render.ts
  function symbolToEmoji(code) {
    if (!code) {
      return "\u2753";
    }
    var base = code.replace(/_day$/, "").replace(/_night$/, "").replace(/_polartwilight$/, "");
    var map = {
      clearsky: "\u2600\uFE0F",
      fair: "\u{1F324}\uFE0F",
      partlycloudy: "\u26C5",
      cloudy: "\u2601\uFE0F",
      fog: "\u{1F32B}\uFE0F",
      lightrain: "\u{1F326}\uFE0F",
      rain: "\u{1F327}\uFE0F",
      heavyrain: "\u{1F327}\uFE0F",
      lightrainshowers: "\u{1F326}\uFE0F",
      rainshowers: "\u{1F326}\uFE0F",
      heavyrainshowers: "\u{1F327}\uFE0F",
      lightsleet: "\u{1F328}\uFE0F",
      sleet: "\u{1F328}\uFE0F",
      heavysleet: "\u{1F328}\uFE0F",
      lightsleetshowers: "\u{1F328}\uFE0F",
      sleetshowers: "\u{1F328}\uFE0F",
      heavysleetshowers: "\u{1F328}\uFE0F",
      lightssleetshowers: "\u{1F328}\uFE0F",
      lightsnow: "\u{1F328}\uFE0F",
      snow: "\u2744\uFE0F",
      heavysnow: "\u2744\uFE0F",
      lightsnowshowers: "\u{1F328}\uFE0F",
      snowshowers: "\u{1F328}\uFE0F",
      heavysnowshowers: "\u2744\uFE0F",
      lightssnowshowers: "\u{1F328}\uFE0F",
      lightrainandthunder: "\u26C8\uFE0F",
      rainandthunder: "\u26C8\uFE0F",
      heavyrainandthunder: "\u26C8\uFE0F",
      lightrainshowersandthunder: "\u26C8\uFE0F",
      rainshowersandthunder: "\u26C8\uFE0F",
      heavyrainshowersandthunder: "\u26C8\uFE0F",
      lightsleetandthunder: "\u26C8\uFE0F",
      sleetandthunder: "\u26C8\uFE0F",
      heavysleetandthunder: "\u26C8\uFE0F",
      lightsleetshowersandthunder: "\u26C8\uFE0F",
      sleetshowersandthunder: "\u26C8\uFE0F",
      heavysleetshowersandthunder: "\u26C8\uFE0F",
      lightssleetshowersandthunder: "\u26C8\uFE0F",
      lightsnowandthunder: "\u26C8\uFE0F",
      snowandthunder: "\u26C8\uFE0F",
      heavysnowandthunder: "\u26C8\uFE0F",
      lightsnowshowersandthunder: "\u26C8\uFE0F",
      snowshowersandthunder: "\u26C8\uFE0F",
      heavysnowshowersandthunder: "\u26C8\uFE0F",
      lightssnowshowersandthunder: "\u26C8\uFE0F"
    };
    return map[base] || "\u{1F321}\uFE0F";
  }
  function describe(code) {
    var labels = STRINGS[currentLang] && STRINGS[currentLang].cond || {};
    if (!code) {
      return t("condFallback");
    }
    var base = code.replace(/_day$/, "").replace(/_night$/, "").replace(/_polartwilight$/, "");
    return labels[base] || t("condFallback");
  }
  function renderCurrent(ts, name, slot) {
    var details = ts.data.instant.details || {};
    var symbol = "";
    if (ts.data.next_1_hours && ts.data.next_1_hours.summary) {
      symbol = ts.data.next_1_hours.summary.symbol_code;
    } else if (ts.data.next_6_hours && ts.data.next_6_hours.summary) {
      symbol = ts.data.next_6_hours.summary.symbol_code;
    } else if (ts.data.next_12_hours && ts.data.next_12_hours.summary) {
      symbol = ts.data.next_12_hours.summary.symbol_code;
    }
    slot.badge.textContent = name;
    if (slot.chartLabel) {
      slot.chartLabel.textContent = name;
    }
    slot.emoji.textContent = symbolToEmoji(symbol);
    slot.desc.textContent = describe(symbol);
    var temp = details.air_temperature;
    slot.temp.textContent = (temp === void 0 ? "--" : Math.round(temp)) + "\xB0C";
    if (slot.feels) {
      if (details.air_temperature === void 0) {
        slot.feels.textContent = tf("feelsLike", "--");
      } else {
        var ta = details.air_temperature;
        var rh = details.relative_humidity || 0;
        var ws = details.wind_speed || 0;
        var e = rh / 100 * 6.105 * Math.exp(17.27 * ta / (237.7 + ta));
        var at = ta + 0.33 * e - 0.7 * ws - 4;
        slot.feels.textContent = tf("feelsLike", Math.round(at));
      }
    }
    var humidity = details.relative_humidity;
    slot.humidity.textContent = (humidity === void 0 ? "--" : Math.round(humidity)) + "%";
    var windSpeed = details.wind_speed;
    var windDir = details.wind_from_direction;
    var windText = (windSpeed === void 0 ? "--" : windSpeed.toFixed(1)) + " m/s";
    if (windDir !== void 0) {
      windText += " " + degreesToCompass(windDir);
    }
    slot.wind.textContent = windText;
    var pressure = details.air_pressure_at_sea_level;
    slot.pressure.textContent = (pressure === void 0 ? "--" : Math.round(pressure)) + " hPa";
    var cloud = details.cloud_area_fraction;
    slot.cloud.textContent = (cloud === void 0 ? "--" : Math.round(cloud)) + "%";
  }
  function updateHeaderTitle() {
    var rain = primarySlot.isRain;
    if (compareMode && secondaryLocation) {
      rain = rain || secondarySlot.isRain;
    }
    var headerTitle = document.getElementById("header-title");
    var dynamicTitle = t(rain ? "headerRain" : "headerDry");
    if (headerTitle) {
      headerTitle.textContent = dynamicTitle;
    }
    document.title = dynamicTitle;
  }
  function renderPrecip(timeseries, slot) {
    var nowDate = /* @__PURE__ */ new Date();
    nowDate.setMinutes(0, 0, 0);
    var now = nowDate.getTime();
    var horizon = now + 24 * 60 * 60 * 1e3;
    var thr = effectiveThreshold();
    var hours = [];
    var total = 0;
    for (var i = 0; i < timeseries.length; i++) {
      var entry = timeseries[i];
      var entryTime = new Date(entry.time).getTime();
      if (entryTime < now || entryTime > horizon) {
        continue;
      }
      var amount = 0;
      if (entry.data && entry.data.next_1_hours && entry.data.next_1_hours.details && typeof entry.data.next_1_hours.details.precipitation_amount === "number") {
        amount = entry.data.next_1_hours.details.precipitation_amount;
      }
      total += amount;
      hours.push({ time: entryTime, amount });
    }
    slot.precipBanner.classList.remove("rain", "dry");
    var totalText = total.toFixed(1) + " mm";
    var isRain = total >= thr;
    if (isRain) {
      slot.precipBanner.classList.add("rain");
      slot.precipBanner.textContent = tf("rainBanner", totalText);
    } else {
      slot.precipBanner.classList.add("dry");
      slot.precipBanner.textContent = tf("dryBanner", totalText);
    }
    if (slot.summary) {
      var startTime = null;
      var stopTime = null;
      var windowTotal = 0;
      for (var w = 0; w < hours.length; w++) {
        if (hours[w].amount >= thr) {
          if (startTime === null) {
            startTime = hours[w].time;
          }
          stopTime = hours[w].time + 60 * 60 * 1e3;
          windowTotal += hours[w].amount;
        } else if (startTime !== null) {
          break;
        }
      }
      if (isRain && startTime !== null) {
        slot.summary.textContent = tf("rainSummary", hourText(startTime), hourText(stopTime), windowTotal.toFixed(1) + " mm");
      } else {
        slot.summary.textContent = "";
      }
    }
    if (slot.thresholdNote) {
      if (rainThresholdOn && !isRain && total >= PRECIP_THRESHOLD_MM) {
        slot.thresholdNote.textContent = tf("thresholdIgnored", thr.toFixed(1) + " mm");
        slot.thresholdNote.classList.remove("hidden");
      } else {
        slot.thresholdNote.textContent = "";
        slot.thresholdNote.classList.add("hidden");
      }
    }
    slot.isRain = isRain;
    updateHeaderTitle();
    while (slot.chart.firstChild) {
      slot.chart.removeChild(slot.chart.firstChild);
    }
    var maxAmount = 0;
    for (var j = 0; j < hours.length; j++) {
      if (hours[j].amount > maxAmount) {
        maxAmount = hours[j].amount;
      }
    }
    for (var k = 0; k < hours.length; k++) {
      var hour = hours[k];
      var col = document.createElement("div");
      col.className = "bar-col";
      var amountLabel = document.createElement("div");
      amountLabel.className = "bar-amount";
      amountLabel.textContent = hour.amount > 0 ? hour.amount.toFixed(1) : "";
      col.appendChild(amountLabel);
      var bar = document.createElement("div");
      bar.className = "bar";
      var heightPct = maxAmount > 0 ? hour.amount / maxAmount * 100 : 0;
      bar.style.height = heightPct + "%";
      col.appendChild(bar);
      var hourLabel = document.createElement("div");
      hourLabel.className = "bar-hour";
      hourLabel.textContent = hourText(hour.time);
      col.appendChild(hourLabel);
      slot.chart.appendChild(col);
    }
  }

  // src/forecast.ts
  function dailyBuckets(timeseries) {
    var todayStart = /* @__PURE__ */ new Date();
    todayStart.setHours(0, 0, 0, 0);
    var todayMs = todayStart.getTime();
    var order = [];
    var map = {};
    for (var i = 0; i < timeseries.length; i++) {
      var entry = timeseries[i];
      var d = new Date(entry.time);
      if (d.getTime() < todayMs) {
        continue;
      }
      var key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
      var bucket = map[key];
      if (!bucket) {
        bucket = {
          date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          min: null,
          max: null,
          precip: 0,
          symbol: "",
          bestDelta: Infinity
        };
        map[key] = bucket;
        order.push(key);
      }
      var det = entry.data && entry.data.instant && entry.data.instant.details;
      if (det && typeof det.air_temperature === "number") {
        if (bucket.min === null || det.air_temperature < bucket.min) {
          bucket.min = det.air_temperature;
        }
        if (bucket.max === null || det.air_temperature > bucket.max) {
          bucket.max = det.air_temperature;
        }
      }
      var block = entry.data && entry.data.next_1_hours || entry.data && entry.data.next_6_hours;
      if (block && block.details && typeof block.details.precipitation_amount === "number") {
        bucket.precip += block.details.precipitation_amount;
      }
      if (block && block.summary && block.summary.symbol_code) {
        var delta = Math.abs(d.getHours() - 12);
        if (delta < bucket.bestDelta) {
          bucket.bestDelta = delta;
          bucket.symbol = block.summary.symbol_code;
        }
      }
    }
    var days = [];
    for (var j = 0; j < order.length && j < 7; j++) {
      days.push(map[order[j]]);
    }
    return days;
  }
  function renderDaily(timeseries, slot) {
    var list = slot.forecastList;
    if (!list) {
      return;
    }
    if (slot.forecastLabel && slot.chartLabel) {
      slot.forecastLabel.textContent = slot.chartLabel.textContent;
    }
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    var buckets = dailyBuckets(timeseries);
    var dayNames = t("days");
    for (var i = 0; i < buckets.length; i++) {
      var b = buckets[i];
      var row = document.createElement("div");
      row.className = "forecast-day";
      var dow = document.createElement("span");
      dow.className = "forecast-dow";
      dow.textContent = i === 0 ? t("today") : dayNames && dayNames[b.date.getDay()] || "";
      row.appendChild(dow);
      var emoji = document.createElement("span");
      emoji.className = "forecast-emoji";
      emoji.textContent = b.symbol ? symbolToEmoji(b.symbol) : "";
      row.appendChild(emoji);
      var desc = document.createElement("span");
      desc.className = "forecast-desc";
      desc.textContent = b.symbol ? describe(b.symbol) : "";
      row.appendChild(desc);
      var temp = document.createElement("span");
      temp.className = "forecast-temp";
      var hi = b.max === null ? "--" : Math.round(b.max);
      var lo = b.min === null ? "--" : Math.round(b.min);
      temp.textContent = hi + "\xB0C / " + lo + "\xB0C";
      row.appendChild(temp);
      var precip = document.createElement("span");
      precip.className = "forecast-precip";
      precip.textContent = b.precip.toFixed(1) + " mm";
      row.appendChild(precip);
      list.appendChild(row);
    }
  }
  var forecastToggle = el("forecast-toggle");
  function readForecastMode() {
    return store.get("forecast", false) === true;
  }
  function applyForecastMode(on) {
    setForecastMode(on);
    var section = document.getElementById("forecast-section");
    if (section) {
      section.classList.toggle("hidden", !on);
    }
    if (forecastToggle) {
      forecastToggle.checked = on;
    }
    store.set("forecast", on);
    primarySlot.forecastLabel.classList.toggle("hidden", !(on && compareMode));
    secondarySlot.forecastList.classList.toggle("hidden", !(on && compareMode));
    secondarySlot.forecastLabel.classList.toggle("hidden", !(on && compareMode));
    if (on && primarySlot.timeseries) {
      renderDaily(primarySlot.timeseries, primarySlot);
    }
    if (on && compareMode && secondarySlot.timeseries) {
      renderDaily(secondarySlot.timeseries, secondarySlot);
    }
  }

  // src/data.ts
  function exportData() {
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
    }
  }
  function validateImport(obj) {
    if (!obj || typeof obj !== "object" || Object.prototype.toString.call(obj) !== "[object Object]") {
      return null;
    }
    var src = obj;
    var out = {};
    var sawKnownKey = false;
    if (Object.prototype.hasOwnProperty.call(src, "lang")) {
      sawKnownKey = true;
      if (src.lang === "sr" || src.lang === "en") {
        out.lang = src.lang;
      }
    }
    if (Object.prototype.hasOwnProperty.call(src, "loc")) {
      sawKnownKey = true;
      var loc = parseDescriptor(src.loc);
      if (loc) {
        out.loc = loc;
      }
    }
    if (Object.prototype.hasOwnProperty.call(src, "geo")) {
      sawKnownKey = true;
      if (src.geo && typeof src.geo === "object" && Object.prototype.toString.call(src.geo) === "[object Object]") {
        out.geo = src.geo;
      }
    }
    if (Object.prototype.hasOwnProperty.call(src, "saved")) {
      sawKnownKey = true;
      if (Array.isArray(src.saved)) {
        out.saved = src.saved.filter(function(s) {
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
      var cmp = src.compare;
      if (cmp && typeof cmp === "object") {
        var cmpLoc = parseDescriptor(cmp.loc);
        if (cmpLoc) {
          out.compare = { on: !!cmp.on, loc: cmpLoc };
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(src, "rainThreshold")) {
      sawKnownKey = true;
      var rt = src.rainThreshold;
      if (rt && typeof rt === "object" && Object.prototype.toString.call(rt) === "[object Object]") {
        out.rainThreshold = { on: !!rt.on, mm: clampThreshold(Number(rt.mm)) };
      }
    }
    if (!sawKnownKey) {
      return null;
    }
    return out;
  }
  function handleImportFile(file) {
    var reader = new FileReader();
    reader.onload = function() {
      var parsed = null;
      try {
        parsed = JSON.parse(reader.result);
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
      }
    };
    reader.onerror = function() {
      window.alert(t("importInvalid"));
    };
    try {
      reader.readAsText(file);
    } catch (e) {
      window.alert(t("importInvalid"));
    }
  }

  // src/app.ts
  function linkChartScroll(source, target) {
    source.addEventListener("scroll", function() {
      if (syncingScroll) {
        return;
      }
      if (!compareMode) {
        return;
      }
      setSyncingScroll(true);
      target.scrollLeft = source.scrollLeft;
      setSyncingScroll(false);
    });
  }
  linkChartScroll(primarySlot.chart, secondarySlot.chart);
  linkChartScroll(secondarySlot.chart, primarySlot.chart);
  function loadWeather(loc) {
    setCurrentLocation(loc);
    saveLocation(loc);
    refreshCityOptions();
    refreshSaveState();
    var c = coordsFor(loc);
    var lat = c.lat;
    var lon = c.lon;
    showOnly(elLoading);
    fetch(metUrl(lat, lon)).then(function(res) {
      if (!res.ok) {
        throw new Error(tf("httpError", res.status));
      }
      return res.json();
    }).then(function(data) {
      var timeseries = data && data.properties && data.properties.timeseries;
      if (!timeseries || !timeseries.length) {
        throw new Error(t("noData"));
      }
      renderCurrent(timeseries[0], badgeFor(loc), primarySlot);
      renderPrecip(timeseries, primarySlot);
      primarySlot.timeseries = timeseries;
      if (forecastMode) {
        renderDaily(timeseries, primarySlot);
      }
      showOnly(elWeather);
      if ((loc.type === "gps" || loc.type === "manual") && !savedNameFor(lat, lon)) {
        reverseGeocode(lat, lon).then(function(place) {
          if (place && currentLocation === loc) {
            elBadge.textContent = place;
            if (primarySlot.chartLabel) {
              primarySlot.chartLabel.textContent = place;
            }
            if (forecastMode) {
              renderDaily(primarySlot.timeseries, primarySlot);
            }
          }
        }).catch(function() {
        });
      }
    }).catch(function(err) {
      elError.textContent = t("errorPrefix") + err.message;
      showOnly(elError);
    });
  }
  function loadSecondary(loc) {
    setSecondaryLocation(loc);
    saveCompareState();
    var c = coordsFor(loc);
    var lat = c.lat;
    var lon = c.lon;
    secondarySlot.badge.textContent = t("loading");
    fetch(metUrl(lat, lon)).then(function(res) {
      if (!res.ok) {
        throw new Error(tf("httpError", res.status));
      }
      return res.json();
    }).then(function(data) {
      if (secondaryLocation !== loc) {
        return;
      }
      var timeseries = data && data.properties && data.properties.timeseries;
      if (!timeseries || !timeseries.length) {
        throw new Error(t("noData"));
      }
      renderCurrent(timeseries[0], badgeFor(loc), secondarySlot);
      renderPrecip(timeseries, secondarySlot);
      secondarySlot.timeseries = timeseries;
      if (forecastMode && compareMode) {
        renderDaily(timeseries, secondarySlot);
      }
      if ((loc.type === "gps" || loc.type === "manual") && !savedNameFor(lat, lon)) {
        reverseGeocode(lat, lon).then(function(place) {
          if (place && secondaryLocation === loc) {
            secondarySlot.badge.textContent = place;
            if (secondarySlot.chartLabel) {
              secondarySlot.chartLabel.textContent = place;
            }
            if (forecastMode && compareMode) {
              renderDaily(secondarySlot.timeseries, secondarySlot);
            }
          }
        }).catch(function() {
        });
      }
    }).catch(function(err) {
      if (secondaryLocation !== loc) {
        return;
      }
      secondarySlot.badge.textContent = t("errorPrefix") + err.message;
      if (secondarySlot.summary) {
        secondarySlot.summary.textContent = "";
      }
    });
  }
  function wireTabs(container, panels) {
    var tabButtons = container.querySelectorAll(".tab-btn");
    Array.prototype.forEach.call(tabButtons, function(btn) {
      btn.addEventListener("click", function() {
        var tab = btn.getAttribute("data-tab");
        Array.prototype.forEach.call(tabButtons, function(b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        Object.keys(panels).forEach(function(key) {
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
  el("gps-btn").addEventListener("click", function() {
    clearNotice();
    if (!navigator.geolocation) {
      showNotice(t("geoUnavailable"));
      loadWeather(BELGRADE);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var gLat = round4(pos.coords.latitude);
        var gLon = round4(pos.coords.longitude);
        loadWeather({ type: "gps", lat: gLat, lon: gLon });
      },
      function() {
        showNotice(t("geoDenied"));
        loadWeather(BELGRADE);
      },
      { timeout: 8e3 }
    );
  });
  el("b-gps-btn").addEventListener("click", function() {
    clearNotice();
    if (!navigator.geolocation) {
      showNotice(t("geoUnavailable"));
      loadSecondary(BELGRADE);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var gLat = round4(pos.coords.latitude);
        var gLon = round4(pos.coords.longitude);
        loadSecondary({ type: "gps", lat: gLat, lon: gLon });
      },
      function() {
        showNotice(t("geoDenied"));
        loadSecondary(BELGRADE);
      },
      { timeout: 8e3 }
    );
  });
  var savedList = document.getElementById("saved-list");
  var savedListB = document.getElementById("b-saved-list");
  var saveBtn = document.getElementById("save-btn");
  var saveSearchBtn = document.getElementById("save-search-btn");
  function refreshSaveState() {
    var custom = !!(currentLocation && currentLocation.type !== "city");
    var coord = currentLocation;
    var lat = custom ? round4(coord.lat) : null;
    var lon = custom ? round4(coord.lon) : null;
    var already = custom && readSavedLocations().some(function(s) {
      return s.lat === lat && s.lon === lon;
    });
    var disabled = !custom || already;
    if (saveBtn) {
      saveBtn.disabled = disabled;
    }
    if (saveSearchBtn) {
      saveSearchBtn.disabled = disabled;
    }
  }
  function renderSavedInto(listEl, onLoad) {
    if (!listEl) {
      return;
    }
    var list = readSavedLocations();
    while (listEl.firstChild) {
      listEl.removeChild(listEl.firstChild);
    }
    list.forEach(function(item) {
      var chip = document.createElement("div");
      chip.className = "saved-chip";
      var load = document.createElement("button");
      load.type = "button";
      load.className = "saved-chip-load";
      if (item.name) {
        load.textContent = item.name;
      } else {
        load.textContent = item.lat + ", " + item.lon;
        reverseGeocode(item.lat, item.lon).then(function(place) {
          if (place) {
            load.textContent = place;
          }
        }).catch(function() {
        });
      }
      load.addEventListener("click", function() {
        onLoad(item);
      });
      var edit = document.createElement("button");
      edit.type = "button";
      edit.className = "saved-chip-edit";
      edit.textContent = "\u270E";
      edit.setAttribute("aria-label", t("editLocation"));
      edit.addEventListener("click", function() {
        openRename(item, load.textContent);
      });
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "saved-chip-remove";
      remove.textContent = "\u2715";
      remove.setAttribute("aria-label", t("removeLocation"));
      remove.addEventListener("click", function() {
        var next = readSavedLocations().filter(function(s) {
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
  function renderSavedLocations() {
    renderSavedInto(savedList, function(item) {
      clearNotice();
      loadWeather({ type: "manual", lat: item.lat, lon: item.lon });
    });
    renderSavedInto(savedListB, function(item) {
      clearNotice();
      loadSecondary({ type: "manual", lat: item.lat, lon: item.lon });
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", function() {
      if (!currentLocation || currentLocation.type === "city") {
        return;
      }
      var lat = round4(currentLocation.lat);
      var lon = round4(currentLocation.lon);
      var list = readSavedLocations();
      var exists = list.some(function(s) {
        return s.lat === lat && s.lon === lon;
      });
      if (!exists) {
        list.push({ lat, lon });
        writeSavedLocations(list);
        renderSavedLocations();
      }
      refreshSaveState();
      showNotice(t("locationSaved"));
    });
  }
  if (saveSearchBtn) {
    saveSearchBtn.addEventListener("click", function() {
      if (!currentLocation || currentLocation.type === "city") {
        return;
      }
      var lat = round4(currentLocation.lat);
      var lon = round4(currentLocation.lon);
      var list = readSavedLocations();
      var exists = list.some(function(s) {
        return s.lat === lat && s.lon === lon;
      });
      if (!exists) {
        list.push({ lat, lon });
        writeSavedLocations(list);
        renderSavedLocations();
      }
      refreshSaveState();
      showNotice(t("locationSaved"));
    });
  }
  var citySelect = el("city-select");
  var citySelectB = el("b-city-select");
  function refreshCityOptions() {
    var selected = citySelect.value;
    while (citySelect.firstChild) {
      citySelect.removeChild(citySelect.firstChild);
    }
    var isCustom = currentLocation && currentLocation.type !== "city";
    if (isCustom) {
      var ph = document.createElement("option");
      ph.value = "";
      ph.textContent = t("cityCustom");
      ph.disabled = true;
      citySelect.appendChild(ph);
    }
    CITIES.forEach(function(city, index) {
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
    CITIES.forEach(function(city, index) {
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
  citySelect.addEventListener("change", function() {
    clearNotice();
    var index = parseInt(citySelect.value, 10);
    if (CITIES[index]) {
      loadWeather({ type: "city", cityIndex: index });
    }
  });
  citySelectB.addEventListener("change", function() {
    clearNotice();
    var index = parseInt(citySelectB.value, 10);
    if (CITIES[index]) {
      loadSecondary({ type: "city", cityIndex: index });
    }
  });
  function makeSearch(inputEl, btnEl, errEl, resultsEl, onPick) {
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
      if (!query) {
        return;
      }
      btnEl.disabled = true;
      var lang = currentLang === "sr" ? "sr" : "en";
      var params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "6",
        "accept-language": lang
      });
      var url = "https://nominatim.openstreetmap.org/search?" + params.toString();
      fetch(url).then(function(res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      }).then(function(results) {
        btnEl.disabled = false;
        if (!results || !results.length) {
          errEl.textContent = t("searchNoResults");
          errEl.classList.remove("hidden");
          return;
        }
        results.forEach(function(result) {
          var lat = parseFloat(result.lat);
          var lon = parseFloat(result.lon);
          if (!validLatLon(lat, lon)) {
            return;
          }
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "search-result-btn";
          btn.textContent = result.display_name;
          btn.addEventListener("click", function() {
            clearNotice();
            clearResults();
            errEl.textContent = "";
            onPick(round4(lat), round4(lon));
          });
          resultsEl.appendChild(btn);
        });
      }).catch(function() {
        btnEl.disabled = false;
        errEl.textContent = t("searchError");
        errEl.classList.remove("hidden");
      });
    }
    btnEl.addEventListener("click", doSearch);
    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        doSearch();
      }
    });
  }
  makeSearch(
    el("search-input"),
    el("search-btn"),
    el("search-error"),
    el("search-results"),
    function(rLat, rLon) {
      loadWeather({ type: "manual", lat: rLat, lon: rLon });
    }
  );
  makeSearch(
    el("b-search-input"),
    el("b-search-btn"),
    el("b-search-error"),
    el("b-search-results"),
    function(rLat, rLon) {
      loadSecondary({ type: "manual", lat: rLat, lon: rLon });
    }
  );
  var langButtons = document.querySelectorAll(".lang-btn");
  function applyStaticStrings() {
    document.documentElement.lang = currentLang;
    document.title = t("title");
    var textNodes = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(textNodes, function(node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    var phNodes = document.querySelectorAll("[data-i18n-placeholder]");
    Array.prototype.forEach.call(phNodes, function(node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
    Array.prototype.forEach.call(ariaNodes, function(node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    var loadingText = document.getElementById("loading-text");
    if (loadingText) {
      loadingText.textContent = t("loading");
    }
    refreshCityOptions();
  }
  function markActiveLang() {
    Array.prototype.forEach.call(langButtons, function(btn) {
      if (btn.getAttribute("data-lang") === currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  function setLanguage(lang) {
    if (lang !== "sr" && lang !== "en") {
      return;
    }
    setCurrentLang(lang);
    store.set("lang", lang);
    markActiveLang();
    applyStaticStrings();
    renderSavedLocations();
    if (currentLocation) {
      loadWeather(currentLocation);
    }
    if (forecastMode && primarySlot.timeseries) {
      renderDaily(primarySlot.timeseries, primarySlot);
    }
    if (compareMode && secondaryLocation) {
      loadSecondary(secondaryLocation);
    }
  }
  Array.prototype.forEach.call(langButtons, function(btn) {
    btn.addEventListener("click", function() {
      setLanguage(btn.getAttribute("data-lang"));
    });
  });
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
  settingsOverlay.addEventListener("click", function(e) {
    if (e.target === settingsOverlay) {
      closeSettings();
    }
  });
  var dataExportBtn = el("data-export-btn");
  dataExportBtn.addEventListener("click", exportData);
  var dataImportBtn = el("data-import-btn");
  var dataImportInput = el("data-import-input");
  dataImportBtn.addEventListener("click", function() {
    dataImportInput.click();
  });
  dataImportInput.addEventListener("change", function() {
    var file = dataImportInput.files && dataImportInput.files[0];
    if (file) {
      handleImportFile(file);
    }
    dataImportInput.value = "";
  });
  var renameOverlay = el("rename-overlay");
  var renameForm = el("rename-form");
  var renameInput = el("rename-input");
  var renameCloseBtn = el("rename-close");
  var renameCancelBtn = el("rename-cancel");
  var renameTarget = null;
  function openRename(item, currentLabel) {
    renameTarget = item;
    renameInput.value = item.name || currentLabel || "";
    renameOverlay.classList.remove("hidden");
  }
  function closeRename() {
    renameOverlay.classList.add("hidden");
    renameTarget = null;
  }
  renameForm.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!renameTarget) {
      closeRename();
      return;
    }
    var target = renameTarget;
    var next = renameInput.value.trim();
    var updated = readSavedLocations().map(function(s) {
      if (s.lat === target.lat && s.lon === target.lon) {
        var copy = { lat: s.lat, lon: s.lon };
        if (next) {
          copy.name = next;
        }
        return copy;
      }
      return s;
    });
    writeSavedLocations(updated);
    renderSavedLocations();
    if (currentLocation && (currentLocation.type === "gps" || currentLocation.type === "manual") && round4(currentLocation.lat) === renameTarget.lat && round4(currentLocation.lon) === renameTarget.lon) {
      if (next) {
        elBadge.textContent = next;
      } else {
        reverseGeocode(round4(currentLocation.lat), round4(currentLocation.lon)).then(function(place) {
          if (place) {
            elBadge.textContent = place;
          }
        }).catch(function() {
        });
      }
    }
    closeRename();
  });
  renameCloseBtn.addEventListener("click", closeRename);
  renameCancelBtn.addEventListener("click", closeRename);
  renameOverlay.addEventListener("click", function(e) {
    if (e.target === renameOverlay) {
      closeRename();
    }
  });
  document.addEventListener("keydown", function(e) {
    if (e.key !== "Escape") {
      return;
    }
    if (!renameOverlay.classList.contains("hidden")) {
      closeRename();
    } else if (!settingsOverlay.classList.contains("hidden")) {
      closeSettings();
    }
  });
  var elSelector = el("selector-section");
  var selectorVisToggle = el("selector-vis-toggle");
  function readSelectorCollapsed() {
    return store.get("selectorCollapsed", false) === true;
  }
  function applySelectorCollapsed(collapsed) {
    elSelector.classList.toggle("hidden", collapsed);
    if (elSelectorB) {
      elSelectorB.classList.toggle("hidden", collapsed || !compareMode);
    }
    if (selectorVisToggle) {
      selectorVisToggle.checked = !collapsed;
    }
  }
  selectorVisToggle.addEventListener("change", function() {
    var collapsed = !selectorVisToggle.checked;
    store.set("selectorCollapsed", collapsed);
    applySelectorCollapsed(collapsed);
  });
  var compareToggle = el("compare-toggle");
  var elSelectorB = el("selector-section-b");
  var elCompareCards = el("compare-cards");
  var elSlotCardB = el("slot-card-b");
  function defaultSecondary() {
    var primaryIndex = currentLocation && currentLocation.type === "city" ? currentLocation.cityIndex : -1;
    var index = primaryIndex === 0 && CITIES.length > 1 ? 1 : 0;
    return { type: "city", cityIndex: index };
  }
  function applyCompareMode(on) {
    setCompareMode(on);
    elSelectorB.classList.toggle("hidden", !on || readSelectorCollapsed());
    elSlotCardB.classList.toggle("hidden", !on);
    elCompareCards.classList.toggle("compare-on", on);
    secondarySlot.precipBanner.classList.toggle("hidden", !on);
    secondarySlot.chart.classList.toggle("hidden", !on);
    if (secondarySlot.summary) {
      secondarySlot.summary.classList.toggle("hidden", !on);
    }
    primarySlot.chartLabel.classList.toggle("hidden", !on);
    secondarySlot.chartLabel.classList.toggle("hidden", !on);
    primarySlot.forecastLabel.classList.toggle("hidden", !(on && forecastMode));
    secondarySlot.forecastList.classList.toggle("hidden", !(on && forecastMode));
    secondarySlot.forecastLabel.classList.toggle("hidden", !(on && forecastMode));
    if (compareToggle) {
      compareToggle.checked = on;
    }
    if (on) {
      var badgeText = elBadge.textContent;
      if (badgeText && badgeText !== t("loading")) {
        primarySlot.chartLabel.textContent = badgeText;
      }
      if (!secondaryLocation) {
        setSecondaryLocation(defaultSecondary());
      }
      refreshCityOptionsB();
      loadSecondary(secondaryLocation);
    }
    updateHeaderTitle();
    saveCompareState();
  }
  compareToggle.addEventListener("change", function() {
    applyCompareMode(compareToggle.checked);
  });
  forecastToggle.addEventListener("change", function() {
    applyForecastMode(forecastToggle.checked);
  });
  var rainThresholdToggle = el("rain-threshold-toggle");
  var rainThresholdInput = el("rain-threshold-input");
  function rerenderVerdicts() {
    if (primarySlot.timeseries) {
      renderPrecip(primarySlot.timeseries, primarySlot);
      if (forecastMode) {
        renderDaily(primarySlot.timeseries, primarySlot);
      }
    }
    if (compareMode && secondarySlot.timeseries) {
      renderPrecip(secondarySlot.timeseries, secondarySlot);
      if (forecastMode) {
        renderDaily(secondarySlot.timeseries, secondarySlot);
      }
    }
    updateHeaderTitle();
  }
  function applyRainThreshold() {
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
  function restoreRainThreshold() {
    var state = readRainThreshold();
    setRainThresholdOn(state.on);
    setRainThresholdMm(state.mm);
    rainThresholdToggle.checked = state.on;
    rainThresholdInput.value = String(state.mm);
  }
  function attachClearButton(input) {
    var wrap = document.createElement("span");
    wrap.className = "input-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "input-clear";
    btn.setAttribute("aria-label", "Clear");
    btn.textContent = "\xD7";
    wrap.appendChild(btn);
    btn.addEventListener("click", function() {
      input.value = "";
      var ev;
      try {
        ev = new Event("input", { bubbles: true });
      } catch (e) {
        ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
      }
      input.dispatchEvent(ev);
    });
  }
  function attachClearButtons() {
    var inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    var i;
    for (i = 0; i < inputs.length; i++) {
      attachClearButton(inputs[i]);
    }
  }
  document.addEventListener("DOMContentLoaded", function() {
    markActiveLang();
    applyStaticStrings();
    attachClearButtons();
    restoreRainThreshold();
    renderSavedLocations();
    applySelectorCollapsed(readSelectorCollapsed());
    loadWeather(loadSavedLocation() || BELGRADE);
    var compare = loadCompareState();
    if (compare) {
      setSecondaryLocation(compare.loc);
      applyCompareMode(true);
    }
    if (readForecastMode()) {
      applyForecastMode(true);
    }
  });
})();
