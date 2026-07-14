    "use strict";

    // ---- i18n: dictionary and language state --------------------------------
    // All user-facing strings live here, keyed by language code ("sr" = Serbian
    // in Latin script, "en" = English). Entries that need runtime values are
    // function-valued (string concatenation only, no template literals) to keep
    // the pre-ES6 style. describe() condition labels live under STRINGS[lang].cond.
    var STRINGS = {
      sr: {
        title: "Treba li kišobran? — Vremenska prognoza",
        headerTitle: "Treba li kišobran? ☔",
        headerRain: "Treba vam kišobran ☔",
        headerDry: "Ostavite kišobran 🌤️",
        headerSubtitle: "Trenutno vreme i prognoza kiše za narednih 24h",
        settingsTitle: "Podešavanja",
        settingsOpen: "Podešavanja",
        settingsClose: "Zatvori",
        languageLabel: "Jezik",
        tabGps: "📍 GPS",
        tabCity: "🏙️ Grad",
        selectorSection: "Izbor lokacije",
        selectorVisLabel: "Prikaži izbor lokacije",
        compareLabel: "Uporedi dve lokacije",
        compareSecondHeading: "Druga lokacija",
        forecastLabel: "Prognoza za 7 dana",
        dataLabel: "Podaci",
        exportBtn: "Izvezi",
        importBtn: "Uvezi",
        importInvalid: "Neispravna datoteka. Podaci nisu promenjeni.",
        importOk: "Podaci su uvezeni.",
        gpsBtn: "📍 Koristi moju lokaciju",
        saveLocation: "Sačuvaj lokaciju",
        removeLocation: "Ukloni lokaciju",
        editLocation: "Izmeni naziv",
        editTitle: "Naziv lokacije",
        editPlaceholder: "Unesite naziv",
        renameSave: "Sačuvaj",
        renameCancel: "Otkaži",
        locationSaved: "Lokacija sačuvana.",
        tabSearch: "🔍 Pretraga",
        searchPlaceholder: "Unesite naziv mesta",
        searchBtn: "Traži",
        searchNoResults: "Nema rezultata.",
        searchError: "Pretraga nije uspela.",
        cityCustom: "📍 Prilagođena lokacija",
        next24: "Narednih 24 sata",
        next7: "Narednih 7 dana",
        today: "Danas",
        days: ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
        tileHumidity: "Vlažnost",
        tileWind: "Vetar",
        tilePressure: "Pritisak",
        tileCloud: "Oblačnost",
        footerData: "Podaci o vremenu sa",
        footerLicensed: ", licencirani pod",
        footerSource: "Izvor na GitHub-u",
        loading: "Učitavanje prognoze…",
        errorPrefix: "Učitavanje prognoze nije uspelo: ",
        httpError: function (status) { return "Vremenski servis je vratio HTTP " + status; },
        noData: "Nema dostupne prognoze za ovu lokaciju.",
        geoUnavailable: "Geolokacija nije dostupna — prikazujem Beograd.",
        geoDenied: "Pristup lokaciji odbijen ili nedostupan — prikazujem Beograd.",
        rainSummary: function (start, stop, total) { return "(" + start + "–" + stop + ", " + total + ")"; },
        rainBanner: function (totalText) { return "☔ Očekuje se kiša — " + totalText + " u narednih 24h. Ponesite kišobran!"; },
        dryBanner: function (totalText) { return "🌤️ Nema značajne kiše — očekuje se " + totalText + " u narednih 24h."; },
        myLocation: function (lat, lon) { return "Moja lokacija (" + lat + ", " + lon + ")"; },
        feelsLike: function (v) { return "Oseća se kao " + v + "°C"; },
        condFallback: "Trenutni uslovi",
        cond: {
          clearsky: "Vedro",
          fair: "Pretežno vedro",
          partlycloudy: "Delimično oblačno",
          cloudy: "Oblačno",
          fog: "Magla",

          lightrain: "Slaba kiša",
          rain: "Kiša",
          heavyrain: "Jaka kiša",
          lightrainshowers: "Slabi pljuskovi",
          rainshowers: "Pljuskovi",
          heavyrainshowers: "Jaki pljuskovi",

          lightsleet: "Slaba susnežica",
          sleet: "Susnežica",
          heavysleet: "Jaka susnežica",
          lightsleetshowers: "Slabi pljuskovi susnežice",
          sleetshowers: "Pljuskovi susnežice",
          heavysleetshowers: "Jaki pljuskovi susnežice",
          lightssleetshowers: "Slabi pljuskovi susnežice",

          lightsnow: "Slab sneg",
          snow: "Sneg",
          heavysnow: "Jak sneg",
          lightsnowshowers: "Slabi snežni pljuskovi",
          snowshowers: "Snežni pljuskovi",
          heavysnowshowers: "Jaki snežni pljuskovi",
          lightssnowshowers: "Slabi snežni pljuskovi",

          lightrainandthunder: "Slaba kiša i grmljavina",
          rainandthunder: "Kiša i grmljavina",
          heavyrainandthunder: "Jaka kiša i grmljavina",
          lightrainshowersandthunder: "Slabi pljuskovi i grmljavina",
          rainshowersandthunder: "Pljuskovi i grmljavina",
          heavyrainshowersandthunder: "Jaki pljuskovi i grmljavina",
          lightsleetandthunder: "Slaba susnežica i grmljavina",
          sleetandthunder: "Susnežica i grmljavina",
          heavysleetandthunder: "Jaka susnežica i grmljavina",
          lightsleetshowersandthunder: "Slabi pljuskovi susnežice i grmljavina",
          sleetshowersandthunder: "Pljuskovi susnežice i grmljavina",
          heavysleetshowersandthunder: "Jaki pljuskovi susnežice i grmljavina",
          lightssleetshowersandthunder: "Slabi pljuskovi susnežice i grmljavina",
          lightsnowandthunder: "Slab sneg i grmljavina",
          snowandthunder: "Sneg i grmljavina",
          heavysnowandthunder: "Jak sneg i grmljavina",
          lightsnowshowersandthunder: "Slabi snežni pljuskovi i grmljavina",
          snowshowersandthunder: "Snežni pljuskovi i grmljavina",
          heavysnowshowersandthunder: "Jaki snežni pljuskovi i grmljavina",
          lightssnowshowersandthunder: "Slabi snežni pljuskovi i grmljavina"
        }
      },
      en: {
        title: "Need Umbrella? — Weather",
        headerTitle: "Need Umbrella? ☔",
        headerRain: "You need an umbrella ☔",
        headerDry: "Leave umbrella 🌤️",
        headerSubtitle: "Live weather and 24-hour rain outlook",
        settingsTitle: "Settings",
        settingsOpen: "Settings",
        settingsClose: "Close",
        languageLabel: "Language",
        tabGps: "📍 GPS",
        tabCity: "🏙️ City",
        selectorSection: "Choose location",
        selectorVisLabel: "Show location selector",
        compareLabel: "Compare two locations",
        compareSecondHeading: "Second location",
        forecastLabel: "7-day forecast",
        dataLabel: "Data",
        exportBtn: "Export",
        importBtn: "Import",
        importInvalid: "Invalid file. Your data was not changed.",
        importOk: "Data imported.",
        gpsBtn: "📍 Use my location",
        saveLocation: "Save location",
        removeLocation: "Remove location",
        editLocation: "Edit name",
        editTitle: "Location name",
        editPlaceholder: "Enter a name",
        renameSave: "Save",
        renameCancel: "Cancel",
        locationSaved: "Location saved.",
        tabSearch: "🔍 Search",
        searchPlaceholder: "Enter a place name",
        searchBtn: "Search",
        searchNoResults: "No results found.",
        searchError: "Search failed.",
        cityCustom: "📍 Custom location",
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
        loading: "Loading weather…",
        errorPrefix: "Could not load weather: ",
        httpError: function (status) { return "Weather service returned HTTP " + status; },
        noData: "No forecast data available for this location.",
        geoUnavailable: "Geolocation unavailable — showing Belgrade instead.",
        geoDenied: "Location access denied or unavailable — showing Belgrade instead.",
        rainSummary: function (start, stop, total) { return "(" + start + "–" + stop + ", " + total + ")"; },
        rainBanner: function (totalText) { return "☔ Rain expected — " + totalText + " over the next 24h. Take an umbrella!"; },
        dryBanner: function (totalText) { return "🌤️ No significant rain — " + totalText + " expected over the next 24h."; },
        myLocation: function (lat, lon) { return "My location (" + lat + ", " + lon + ")"; },
        feelsLike: function (v) { return "Feels like " + v + "°C"; },
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

    // ---- Consolidated storage ----------------------------------------------
    // All persisted state lives in one localStorage key as a single JSON blob
    // whose sub-keys are lang / loc / geo / saved / selectorCollapsed /
    // compare / forecast, read and written through the `store` accessor.
    var STORE_KEY = "nu:data";

    // Read the whole blob; returns {} on absent / parse failure / any throw.
    function loadStore() {
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
    function saveStore(obj) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(obj));
      } catch (e) {
        /* ignore */
      }
    }

    // Read-modify-write accessors for individual sub-keys of the blob.
    var store = {
      get: function (subKey, fallback) {
        var obj = loadStore();
        if (Object.prototype.hasOwnProperty.call(obj, subKey)) {
          return obj[subKey];
        }
        return fallback;
      },
      set: function (subKey, value) {
        var obj = loadStore();
        obj[subKey] = value;
        saveStore(obj);
      }
    };

    var currentLang = (function () {
      var saved = store.get("lang", "sr");
      return (saved === "sr" || saved === "en") ? saved : "sr";
    })();

    // Look up a plain string for the active language; fall back to the key.
    function t(key) {
      var bundle = STRINGS[currentLang] || {};
      if (Object.prototype.hasOwnProperty.call(bundle, key)) {
        return bundle[key];
      }
      return key;
    }

    // Look up a function-valued string and call it with the given args; fall
    // back to the key if missing or not callable.
    function tf(key) {
      var bundle = STRINGS[currentLang] || {};
      var entry = bundle[key];
      if (typeof entry === "function") {
        var args = Array.prototype.slice.call(arguments, 1);
        return entry.apply(null, args);
      }
      return key;
    }

    // ---- Constants ----------------------------------------------------------
    // City display names carry localized variants ({ sr, en }); only lat/lon
    // are sent to MET. The badge and dropdown labels follow the active language.
    var CITIES = [
      { key: "belgrade", names: { sr: "Beograd", en: "Belgrade" }, lat: 44.8176, lon: 20.4633 },
      { key: "novisad", names: { sr: "Novi Sad", en: "Novi Sad" }, lat: 45.2671, lon: 19.8335 },
      { key: "kragujevac", names: { sr: "Kragujevac", en: "Kragujevac" }, lat: 44.0128, lon: 20.9114 },
      { key: "nis", names: { sr: "Niš", en: "Nis" }, lat: 43.3209, lon: 21.8954 },
      { key: "pozarevac", names: { sr: "Požarevac", en: "Pozarevac" }, lat: 44.6212, lon: 21.1867 },
      { key: "jagodina", names: { sr: "Jagodina", en: "Jagodina" }, lat: 43.9772, lon: 21.2611 }
    ];

    // Default-load / GPS-fallback location descriptor (Belgrade is CITIES[0]).
    var BELGRADE = { type: "city", cityIndex: 0 };

    // Resolve a city's display name in the active language.
    function cityName(city) {
      return (city.names && city.names[currentLang]) || (city.names && city.names.en) || "";
    }

    var PRECIP_THRESHOLD_MM = 0.1;

    // ---- DOM references -----------------------------------------------------
    var elLoading = document.getElementById("loading");
    var elError = document.getElementById("error");
    var elWeather = document.getElementById("weather");
    var elNotice = document.getElementById("notice");
    var elBadge = document.getElementById("location-badge");
    var elEmoji = document.getElementById("cur-emoji");
    var elTemp = document.getElementById("cur-temp");
    var elDesc = document.getElementById("cur-desc");
    var elHumidity = document.getElementById("tile-humidity");
    var elWind = document.getElementById("tile-wind");
    var elPressure = document.getElementById("tile-pressure");
    var elCloud = document.getElementById("tile-cloud");
    var elPrecipBanner = document.getElementById("precip-banner");
    var elChart = document.getElementById("chart");

    // A "slot" bundles the render-target nodes for one location so renderCurrent
    // and renderPrecip can write into either the primary set (above) or a
    // secondary compare set without depending on the module-level singletons.
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
      feels: document.getElementById("cur-feels"),
      forecastList: document.getElementById("forecast-list"),
      forecastLabel: document.getElementById("forecast-label-a")
    };

    // The secondary (compare) slot mirrors primarySlot's shape for the slot-B nodes.
    var secondarySlot = {
      badge: document.getElementById("b-location-badge"),
      emoji: document.getElementById("b-cur-emoji"),
      temp: document.getElementById("b-cur-temp"),
      desc: document.getElementById("b-cur-desc"),
      humidity: document.getElementById("b-tile-humidity"),
      wind: document.getElementById("b-tile-wind"),
      pressure: document.getElementById("b-tile-pressure"),
      cloud: document.getElementById("b-tile-cloud"),
      precipBanner: document.getElementById("b-precip-banner"),
      chart: document.getElementById("b-chart"),
      chartLabel: document.getElementById("chart-label-b"),
      summary: document.getElementById("rain-summary-b"),
      feels: document.getElementById("b-cur-feels"),
      forecastList: document.getElementById("forecast-list-b"),
      forecastLabel: document.getElementById("forecast-label-b")
    };

    // ---- Linked chart scroll (compare mode) ---------------------------------
    // When comparing, scrolling one rain chart scrolls the other in lockstep.
    // syncingScroll guards against the echo (setting scrollLeft fires "scroll").
    var syncingScroll = false;
    function linkChartScroll(source, target) {
      source.addEventListener("scroll", function () {
        if (syncingScroll) { return; }
        if (!compareMode) { return; }
        syncingScroll = true;
        target.scrollLeft = source.scrollLeft;
        syncingScroll = false;
      });
    }
    linkChartScroll(primarySlot.chart, secondarySlot.chart);
    linkChartScroll(secondarySlot.chart, primarySlot.chart);

    // ---- State toggling -----------------------------------------------------
    function showOnly(el) {
      elLoading.classList.add("hidden");
      elError.classList.add("hidden");
      elWeather.classList.add("hidden");
      el.classList.remove("hidden");
    }

    function showNotice(message) {
      elNotice.textContent = message;
      elNotice.classList.remove("hidden");
    }

    function clearNotice() {
      elNotice.textContent = "";
      elNotice.classList.add("hidden");
    }

    // ---- Helpers ------------------------------------------------------------
    function round4(n) {
      return Math.round(n * 10000) / 10000;
    }

    // Zero-padded "HH:00" label for a millisecond timestamp.
    function hourText(ms) {
      var h = new Date(ms).getHours();
      return (h < 10 ? "0" + h : h) + ":00";
    }

    // Convert wind-from-direction in degrees to a 16-point compass label.
    function degreesToCompass(deg) {
      var points = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
      ];
      var idx = Math.round(deg / 22.5) % 16;
      if (idx < 0) { idx += 16; }
      return points[idx];
    }

    // Map a MET symbol_code to an emoji. Strips _day/_night/_polartwilight.
    // Emoji are language-independent. The base-code set below MUST stay in sync
    // with the cond label set in STRINGS[lang].cond (see describe()).
    function symbolToEmoji(code) {
      if (!code) { return "❓"; }
      var base = code
        .replace(/_day$/, "")
        .replace(/_night$/, "")
        .replace(/_polartwilight$/, "");

      var map = {
        clearsky: "☀️",
        fair: "🌤️",
        partlycloudy: "⛅",
        cloudy: "☁️",
        fog: "🌫️",

        lightrain: "🌦️",
        rain: "🌧️",
        heavyrain: "🌧️",
        lightrainshowers: "🌦️",
        rainshowers: "🌦️",
        heavyrainshowers: "🌧️",

        lightsleet: "🌨️",
        sleet: "🌨️",
        heavysleet: "🌨️",
        lightsleetshowers: "🌨️",
        sleetshowers: "🌨️",
        heavysleetshowers: "🌨️",
        lightssleetshowers: "🌨️",

        lightsnow: "🌨️",
        snow: "❄️",
        heavysnow: "❄️",
        lightsnowshowers: "🌨️",
        snowshowers: "🌨️",
        heavysnowshowers: "❄️",
        lightssnowshowers: "🌨️",

        lightrainandthunder: "⛈️",
        rainandthunder: "⛈️",
        heavyrainandthunder: "⛈️",
        lightrainshowersandthunder: "⛈️",
        rainshowersandthunder: "⛈️",
        heavyrainshowersandthunder: "⛈️",
        lightsleetandthunder: "⛈️",
        sleetandthunder: "⛈️",
        heavysleetandthunder: "⛈️",
        lightsleetshowersandthunder: "⛈️",
        sleetshowersandthunder: "⛈️",
        heavysleetshowersandthunder: "⛈️",
        lightssleetshowersandthunder: "⛈️",
        lightsnowandthunder: "⛈️",
        snowandthunder: "⛈️",
        heavysnowandthunder: "⛈️",
        lightsnowshowersandthunder: "⛈️",
        snowshowersandthunder: "⛈️",
        heavysnowshowersandthunder: "⛈️",
        lightssnowshowersandthunder: "⛈️"
      };

      // Documented fallback for any unmatched code.
      return map[base] || "🌡️";
    }

    // Map a MET base code to a readable description in the active language.
    // Labels come from STRINGS[currentLang].cond; the base-code set there MUST
    // stay in sync with symbolToEmoji. Unmatched codes fall back to the
    // localized "Current conditions" string.
    function describe(code) {
      var labels = (STRINGS[currentLang] && STRINGS[currentLang].cond) || {};
      if (!code) { return t("condFallback"); }
      var base = code
        .replace(/_day$/, "")
        .replace(/_night$/, "")
        .replace(/_polartwilight$/, "");

      return labels[base] || t("condFallback");
    }

    // ---- Current conditions render -----------------------------------------
    // Writes into the given slot's current-conditions / tile nodes.
    function renderCurrent(ts, name, slot) {
      var details = ts.data.instant.details || {};

      // symbol_code: prefer next_1_hours, fall back to 6h then 12h.
      var symbol = "";
      if (ts.data.next_1_hours && ts.data.next_1_hours.summary) {
        symbol = ts.data.next_1_hours.summary.symbol_code;
      } else if (ts.data.next_6_hours && ts.data.next_6_hours.summary) {
        symbol = ts.data.next_6_hours.summary.symbol_code;
      } else if (ts.data.next_12_hours && ts.data.next_12_hours.summary) {
        symbol = ts.data.next_12_hours.summary.symbol_code;
      }

      slot.badge.textContent = name;
      if (slot.chartLabel) { slot.chartLabel.textContent = name; }
      slot.emoji.textContent = symbolToEmoji(symbol);
      slot.desc.textContent = describe(symbol);

      var temp = details.air_temperature;
      slot.temp.textContent = (temp === undefined ? "--" : Math.round(temp)) + "°C";

      if (slot.feels) {
        if (details.air_temperature === undefined) {
          slot.feels.textContent = tf("feelsLike", "--");
        } else {
          var ta = details.air_temperature;
          var rh = details.relative_humidity || 0;
          var ws = details.wind_speed || 0;
          var e = (rh / 100) * 6.105 * Math.exp(17.27 * ta / (237.7 + ta));
          var at = ta + 0.33 * e - 0.70 * ws - 4.00;
          slot.feels.textContent = tf("feelsLike", Math.round(at));
        }
      }

      var humidity = details.relative_humidity;
      slot.humidity.textContent = (humidity === undefined ? "--" : Math.round(humidity)) + "%";

      var windSpeed = details.wind_speed;
      var windDir = details.wind_from_direction;
      var windText = (windSpeed === undefined ? "--" : windSpeed.toFixed(1)) + " m/s";
      if (windDir !== undefined) {
        windText += " " + degreesToCompass(windDir);
      }
      slot.wind.textContent = windText;

      var pressure = details.air_pressure_at_sea_level;
      slot.pressure.textContent = (pressure === undefined ? "--" : Math.round(pressure)) + " hPa";

      var cloud = details.cloud_area_fraction;
      slot.cloud.textContent = (cloud === undefined ? "--" : Math.round(cloud)) + "%";
    }

    // Set the page <title> and #header-title to the rain ("need umbrella") or
    // dry message. The umbrella message wins when the primary will rain, or — in
    // compare mode — when EITHER location will rain.
    function updateHeaderTitle() {
      var rain = primarySlot.isRain;
      if (compareMode && secondaryLocation) {
        rain = rain || secondarySlot.isRain;
      }
      var headerTitle = document.getElementById("header-title");
      var dynamicTitle = t(rain ? "headerRain" : "headerDry");
      if (headerTitle) { headerTitle.textContent = dynamicTitle; }
      document.title = dynamicTitle;
    }

    // ---- 24-hour precipitation ----------------------------------------------
    // Writes into the given slot's precip banner / chart nodes, records the
    // slot's rain verdict on `slot.isRain`, then recomputes the header title.
    function renderPrecip(timeseries, slot) {
      // Floor to the start of the current hour so the current-hour entry
      // (timeseries[0], whose time is the top of this hour) is included.
      var now = new Date();
      now.setMinutes(0, 0, 0);
      now = now.getTime();
      var horizon = now + 24 * 60 * 60 * 1000;

      var hours = [];
      var total = 0;

      for (var i = 0; i < timeseries.length; i++) {
        var entry = timeseries[i];
        var entryTime = new Date(entry.time).getTime();
        if (entryTime < now || entryTime > horizon) { continue; }

        // Entries near the boundary may lack next_1_hours -> treat as 0.
        var amount = 0;
        if (
          entry.data &&
          entry.data.next_1_hours &&
          entry.data.next_1_hours.details &&
          typeof entry.data.next_1_hours.details.precipitation_amount === "number"
        ) {
          amount = entry.data.next_1_hours.details.precipitation_amount;
        }

        total += amount;
        hours.push({ time: entryTime, amount: amount });
      }

      // Banner.
      slot.precipBanner.classList.remove("rain", "dry");
      var totalText = total.toFixed(1) + " mm";
      var isRain = total >= PRECIP_THRESHOLD_MM;
      if (isRain) {
        slot.precipBanner.classList.add("rain");
        slot.precipBanner.textContent = tf("rainBanner", totalText);
      } else {
        slot.precipBanner.classList.add("dry");
        slot.precipBanner.textContent = tf("dryBanner", totalText);
      }

      // Rain-window summary: first hour at/above the threshold starts the window,
      // the first dry hour after that stops it (when rain FIRST stops, not last).
      // Divergence is intentional: isRain uses the 24h TOTAL >= threshold, but the
      // window uses PER-HOUR >= threshold, so a rainy banner with only sub-threshold
      // hours (no concentrated rainy hour) shows no window — summary stays blank.
      if (slot.summary) {
        var startTime = null;
        var stopTime = null;
        var windowTotal = 0;
        for (var w = 0; w < hours.length; w++) {
          if (hours[w].amount >= PRECIP_THRESHOLD_MM) {
            if (startTime === null) { startTime = hours[w].time; }
            stopTime = hours[w].time + 60 * 60 * 1000;
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

      // Remember this slot's rain verdict, then recompute the header. In compare
      // mode the umbrella message wins when EITHER location will rain.
      slot.isRain = isRain;
      updateHeaderTitle();

      // Bar chart, DOM methods only.
      while (slot.chart.firstChild) {
        slot.chart.removeChild(slot.chart.firstChild);
      }

      var maxAmount = 0;
      for (var j = 0; j < hours.length; j++) {
        if (hours[j].amount > maxAmount) { maxAmount = hours[j].amount; }
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
        var heightPct = maxAmount > 0 ? (hour.amount / maxAmount) * 100 : 0;
        bar.style.height = heightPct + "%";
        col.appendChild(bar);

        var hourLabel = document.createElement("div");
        hourLabel.className = "bar-hour";
        hourLabel.textContent = hourText(hour.time);
        col.appendChild(hourLabel);

        slot.chart.appendChild(col);
      }
    }

    // ---- 7-day forecast -----------------------------------------------------
    // Bucket the already-fetched compact timeseries into up to 7 local calendar
    // days (row 0 = today, partial). Per bucket track min/max instant temperature
    // and total precipitation, plus a representative symbol_code. Precip prefers
    // next_1_hours per entry and falls back to next_6_hours only when next_1_hours
    // is absent — hourly-region entries (1h-spaced, next_1_hours) and coarse-region
    // entries (6h-spaced, next_6_hours) then tile each day.
    // Known bounded approximation: next_6_hours windows are UTC-aligned while
    // buckets are local calendar days, so in any non-UTC timezone a 6h block can
    // straddle local midnight yet have its full total attributed to a single day.
    // This skews the daily precip total at every day boundary within the 6-hourly
    // region (not just the hourly->6-hourly transition day), and the transition
    // boundary can additionally overlap or gap against the last summed
    // next_1_hours hour. Each is at most a few hours' precip. Accepted as-is.
    function dailyBuckets(timeseries) {
      var todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      var todayMs = todayStart.getTime();

      var order = [];
      var map = {};

      for (var i = 0; i < timeseries.length; i++) {
        var entry = timeseries[i];
        var d = new Date(entry.time);
        if (d.getTime() < todayMs) { continue; }

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

        // Prefer next_1_hours, fall back to next_6_hours (never both).
        var block = (entry.data && entry.data.next_1_hours) ||
          (entry.data && entry.data.next_6_hours);
        if (block && block.details && typeof block.details.precipitation_amount === "number") {
          bucket.precip += block.details.precipitation_amount;
        }

        // Representative symbol: the summary carried by the entry nearest local 12:00.
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

    // Render up to 7 day rows into the given slot's forecast list, DOM methods
    // only. Row 0 uses the localized "today" label; later rows use the
    // localized short weekday.
    function renderDaily(timeseries, slot) {
      var list = slot.forecastList;
      if (!list) { return; }
      // Mirror the chart's per-slot location label so the forecast rows are
      // attributable in compare mode.
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
        dow.textContent = (i === 0)
          ? t("today")
          : ((dayNames && dayNames[b.date.getDay()]) || "");
        row.appendChild(dow);

        var emoji = document.createElement("span");
        emoji.className = "forecast-emoji";
        emoji.textContent = b.symbol ? symbolToEmoji(b.symbol) : "";
        row.appendChild(emoji);

        var desc = document.createElement("span");
        desc.className = "forecast-desc";
        // Empty symbol => no symbol_code in this bucket; leave blank rather than
        // calling describe("") which yields the present-tense "Current conditions".
        desc.textContent = b.symbol ? describe(b.symbol) : "";
        row.appendChild(desc);

        var temp = document.createElement("span");
        temp.className = "forecast-temp";
        var hi = (b.max === null) ? "--" : Math.round(b.max);
        var lo = (b.min === null) ? "--" : Math.round(b.min);
        temp.textContent = hi + "°C / " + lo + "°C";
        row.appendChild(temp);

        var precip = document.createElement("span");
        precip.className = "forecast-precip";
        precip.textContent = b.precip.toFixed(1) + " mm";
        row.appendChild(precip);

        list.appendChild(row);
      }
    }

    // ---- Location tracking --------------------------------------------------
    // The currently displayed location, kept so setLanguage() can re-fetch the
    // same place and so the badge can be recomposed in the active language.
    // Shape: { type: "city", cityIndex } | { type: "gps", lat, lon }
    //      | { type: "manual", lat, lon }
    var currentLocation = null;

    // Compare mode is session-only — never persisted. When on, a second selector
    // and a second render slot become active. secondaryLocation is the slot-B
    // descriptor (null until a slot-B location is chosen).
    var compareMode = false;
    var secondaryLocation = null;

    // 7-day forecast mode. Persisted, off by default. Slot B's forecast rows
    // render alongside slot A whenever compare mode is also on.
    var forecastMode = false;

    // Compose the location badge text for a descriptor in the active language.
    function badgeFor(loc) {
      if (!loc) { return ""; }
      if (loc.type === "city") {
        var city = CITIES[loc.cityIndex];
        return city ? cityName(city) : "";
      }
      // A saved custom title for these coords wins over coords / geocoding.
      var custom = savedNameFor(loc.lat, loc.lon);
      if (custom) { return custom; }
      if (loc.type === "gps") {
        return tf("myLocation", loc.lat, loc.lon);
      }
      // manual: numeric coordinates are language-neutral.
      return loc.lat + ", " + loc.lon;
    }

    // Persistent cache of resolved place names, keyed by "lang|lat|lon" so each
    // language's labels are stored separately. Read/written as one JSON object.
    function readGeoCache() {
      var obj = store.get("geo", {});
      return (obj && typeof obj === "object") ? obj : {};
    }

    function writeGeoCache(cache) {
      store.set("geo", cache);
    }

    // Reverse-geocode coords to a localized place name via BigDataCloud's
    // free, key-less, browser-CORS client endpoint. Resolves to "" on miss.
    // Cached results are reused so identical coords never re-fetch.
    function reverseGeocode(lat, lon) {
      var lang = currentLang === "sr" ? "sr" : "en";
      var key = lang + "|" + lat + "|" + lon;
      var cache = readGeoCache();
      if (Object.prototype.hasOwnProperty.call(cache, key)) {
        return Promise.resolve(cache[key]);
      }
      var url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
        lat + "&longitude=" + lon + "&localityLanguage=" + lang;
      return fetch(url)
        .then(function (res) {
          if (!res.ok) { throw new Error("geo " + res.status); }
          return res.json();
        })
        .then(function (d) {
          var parts = [];
          var place = d.city || d.locality || d.principalSubdivision;
          if (place) { parts.push(place); }
          if (d.countryName) { parts.push(d.countryName); }
          var name = parts.join(", ");
          var latest = readGeoCache();
          latest[key] = name;
          writeGeoCache(latest);
          return name;
        });
    }

    // ---- Core load path -----------------------------------------------------
    // True when lat/lon are numbers within geographic bounds.
    function validLatLon(lat, lon) {
      return typeof lat === "number" && typeof lon === "number" &&
        lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    // Persist a location descriptor so the last pick reloads next visit.
    function saveLocation(loc) {
      store.set("loc", loc);
    }

    // Validate a parsed location descriptor; returns a clean copy or null.
    function parseDescriptor(loc) {
      if (!loc || typeof loc !== "object") { return null; }
      if (loc.type === "city") {
        if (typeof loc.cityIndex === "number" && CITIES[loc.cityIndex]) {
          return { type: "city", cityIndex: loc.cityIndex };
        }
        return null;
      }
      if (loc.type === "gps" || loc.type === "manual") {
        if (validLatLon(loc.lat, loc.lon)) {
          return { type: loc.type, lat: loc.lat, lon: loc.lon };
        }
        return null;
      }
      return null;
    }

    // Read and validate a stored descriptor; null if absent/malformed.
    function loadSavedLocation() {
      return parseDescriptor(store.get("loc", null));
    }

    // Persist the compare-mode state (on/off + slot-B descriptor) so a
    // comparison is restored next visit.
    function saveCompareState() {
      store.set("compare", {
        on: compareMode,
        loc: secondaryLocation
      });
    }

    // Read and validate the stored compare state; null if absent/malformed/off.
    function loadCompareState() {
      var state = store.get("compare", null);
      if (!state || typeof state !== "object" || !state.on) { return null; }
      var loc = parseDescriptor(state.loc);
      if (!loc) { return null; }
      return { on: true, loc: loc };
    }

    // ---- Saved (favorite) locations -----------------------------------------
    // A user-curated list of custom coordinates, persisted as a JSON array of
    // { lat, lon, name? } — `name` is an optional user title that overrides the
    // reverse-geocoded label. Rendered as clickable chips on the GPS tab.
    function readSavedLocations() {
      var list = store.get("saved", []);
      if (!Array.isArray(list)) { return []; }
      return list.filter(function (s) {
        return s && validLatLon(s.lat, s.lon);
      });
    }

    function writeSavedLocations(list) {
      store.set("saved", list);
    }

    // Custom title saved for these exact coords, or null. Coords are compared
    // round4'd to match how saved entries (and loadWeather) round them.
    function savedNameFor(lat, lon) {
      var rLat = round4(lat);
      var rLon = round4(lon);
      var match = readSavedLocations().filter(function (s) {
        return s.lat === rLat && s.lon === rLon && s.name;
      })[0];
      return match ? match.name : null;
    }

    // Resolve a descriptor's rounded coords (cities resolve via CITIES).
    function coordsFor(loc) {
      var coords = loc;
      if (loc.type === "city") {
        coords = CITIES[loc.cityIndex];
      }
      return { lat: round4(coords.lat), lon: round4(coords.lon) };
    }

    function metUrl(lat, lon) {
      var params = new URLSearchParams({ lat: lat, lon: lon });
      return "https://api.met.no/weatherapi/locationforecast/2.0/compact?" + params.toString();
    }

    function loadWeather(loc) {
      currentLocation = loc;
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
        .then(function (data) {
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
                  if (forecastMode) { renderDaily(primarySlot.timeseries, primarySlot); }
                }
              })
              .catch(function () { /* keep coord badge */ });
          }
        })
        .catch(function (err) {
          elError.textContent = t("errorPrefix") + err.message;
          showOnly(elError);
        });
    }

    // Load slot B into secondarySlot. Session-only: does not persist, does not
    // touch the city dropdown / save state, and does not drive the page title or
    // the loading/error state-swap (slot A owns the whole-view state). On error
    // the slot-B badge shows the message so slot A stays intact. Stale lookups
    // are guarded on secondaryLocation identity.
    function loadSecondary(loc) {
      secondaryLocation = loc;
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
        .then(function (data) {
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
                  if (forecastMode && compareMode) { renderDaily(secondarySlot.timeseries, secondarySlot); }
                }
              })
              .catch(function () { /* keep coord badge */ });
          }
        })
        .catch(function (err) {
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
    function wireTabs(container, panels) {
      var tabButtons = container.querySelectorAll(".tab-btn");
      Array.prototype.forEach.call(tabButtons, function (btn) {
        btn.addEventListener("click", function () {
          var tab = btn.getAttribute("data-tab");
          Array.prototype.forEach.call(tabButtons, function (b) {
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

    wireTabs(document.getElementById("selector-body"), {
      gps: document.getElementById("panel-gps"),
      city: document.getElementById("panel-city"),
      search: document.getElementById("panel-search")
    });

    wireTabs(document.getElementById("selector-body-b"), {
      gps: document.getElementById("b-panel-gps"),
      city: document.getElementById("b-panel-city"),
      search: document.getElementById("b-panel-search")
    });

    // GPS.
    document.getElementById("gps-btn").addEventListener("click", function () {
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
    document.getElementById("b-gps-btn").addEventListener("click", function () {
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
    var saveBtn = document.getElementById("save-btn");
    var saveSearchBtn = document.getElementById("save-search-btn");

    // Enable "Save location" only when the current location is a custom
    // coordinate (GPS or a search/saved pick); cities already live in the
    // dropdown.
    function refreshSaveState() {
      var custom = currentLocation && currentLocation.type !== "city";
      var lat = custom ? round4(currentLocation.lat) : null;
      var lon = custom ? round4(currentLocation.lon) : null;
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
    function renderSavedInto(listEl, onLoad) {
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
    var citySelect = document.getElementById("city-select");
    var citySelectB = document.getElementById("b-city-select");

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
          .then(function (results) {
            btnEl.disabled = false;
            if (!results || !results.length) {
              errEl.textContent = t("searchNoResults");
              errEl.classList.remove("hidden");
              return;
            }
            results.forEach(function (result) {
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
      inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { doSearch(); }
      });
    }

    makeSearch(
      document.getElementById("search-input"),
      document.getElementById("search-btn"),
      document.getElementById("search-error"),
      document.getElementById("search-results"),
      function (rLat, rLon) {
        loadWeather({ type: "manual", lat: rLat, lon: rLon });
      }
    );

    makeSearch(
      document.getElementById("b-search-input"),
      document.getElementById("b-search-btn"),
      document.getElementById("b-search-error"),
      document.getElementById("b-search-results"),
      function (rLat, rLon) {
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

    function setLanguage(lang) {
      if (lang !== "sr" && lang !== "en") { return; }
      currentLang = lang;
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
    var settingsOverlay = document.getElementById("settings-overlay");
    var settingsOpenBtn = document.getElementById("settings-open");
    var settingsCloseBtn = document.getElementById("settings-close");

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
    var dataExportBtn = document.getElementById("data-export-btn");

    // Download the whole nu:data blob as a pretty-printed JSON file. Degrades
    // quietly if storage or the download APIs are unavailable.
    function exportData() {
      try {
        var blob = loadStore();
        var json = JSON.stringify(blob, null, 2);
        var file = new Blob([json], { type: "application/json" });
        var url = URL.createObjectURL(file);
        var a = document.createElement("a");
        a.href = url;
        a.download = "need-umbrella-data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        /* ignore */
      }
    }

    dataExportBtn.addEventListener("click", exportData);

    var dataImportBtn = document.getElementById("data-import-btn");
    var dataImportInput = document.getElementById("data-import-input");

    // Validate a parsed import payload against the known nu:data shape, reusing
    // the app's existing read-side rules. Returns a clean blob, or null when the
    // input clearly isn't a usable nu:data object (not an object, or no known
    // sub-key survives validation). Unknown keys and individually-invalid
    // optional entries are dropped silently, matching the lenient read side.
    function validateImport(obj) {
      if (!obj || typeof obj !== "object" ||
          Object.prototype.toString.call(obj) !== "[object Object]") {
        return null;
      }
      var out = {};
      var sawKnownKey = false;

      if (Object.prototype.hasOwnProperty.call(obj, "lang")) {
        sawKnownKey = true;
        if (obj.lang === "sr" || obj.lang === "en") { out.lang = obj.lang; }
      }
      if (Object.prototype.hasOwnProperty.call(obj, "loc")) {
        sawKnownKey = true;
        var loc = parseDescriptor(obj.loc);
        if (loc) { out.loc = loc; }
      }
      if (Object.prototype.hasOwnProperty.call(obj, "geo")) {
        sawKnownKey = true;
        if (obj.geo && typeof obj.geo === "object" &&
            Object.prototype.toString.call(obj.geo) === "[object Object]") {
          out.geo = obj.geo;
        }
      }
      if (Object.prototype.hasOwnProperty.call(obj, "saved")) {
        sawKnownKey = true;
        if (Array.isArray(obj.saved)) {
          out.saved = obj.saved.filter(function (s) {
            return s && validLatLon(s.lat, s.lon);
          });
        }
      }
      if (Object.prototype.hasOwnProperty.call(obj, "selectorCollapsed")) {
        sawKnownKey = true;
        out.selectorCollapsed = !!obj.selectorCollapsed;
      }
      if (Object.prototype.hasOwnProperty.call(obj, "forecast")) {
        sawKnownKey = true;
        out.forecast = !!obj.forecast;
      }
      if (Object.prototype.hasOwnProperty.call(obj, "compare")) {
        sawKnownKey = true;
        var cmp = obj.compare;
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
    function handleImportFile(file) {
      var reader = new FileReader();
      reader.onload = function () {
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
    var renameOverlay = document.getElementById("rename-overlay");
    var renameForm = document.getElementById("rename-form");
    var renameInput = document.getElementById("rename-input");
    var renameCloseBtn = document.getElementById("rename-close");
    var renameCancelBtn = document.getElementById("rename-cancel");
    var renameTarget = null; // { lat, lon } of the chip being edited

    function openRename(item, currentLabel) {
      renameTarget = item;
      renameInput.value = item.name || currentLabel || "";
      renameOverlay.classList.remove("hidden");
    }

    function closeRename() {
      renameOverlay.classList.add("hidden");
      renameTarget = null;
    }

    renameForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!renameTarget) { closeRename(); return; }
      var next = renameInput.value.trim();
      var updated = readSavedLocations().map(function (s) {
        if (s.lat === renameTarget.lat && s.lon === renameTarget.lon) {
          var copy = { lat: s.lat, lon: s.lon };
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
    var elSelector = document.getElementById("selector-section");
    var selectorVisToggle = document.getElementById("selector-vis-toggle");

    // Default visible on first visit (sub-key absent → false → visible).
    function readSelectorCollapsed() {
      return store.get("selectorCollapsed", false) === true;
    }

    function applySelectorCollapsed(collapsed) {
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
    var compareToggle = document.getElementById("compare-toggle");
    var elSelectorB = document.getElementById("selector-section-b");
    var elCompareCards = document.getElementById("compare-cards");
    var elSlotCardB = document.getElementById("slot-card-b");

    // Pick a sensible default slot-B city distinct from the primary city, so
    // enabling compare with no slot-B pick yet shows two different places.
    function defaultSecondary() {
      var primaryIndex = (currentLocation && currentLocation.type === "city")
        ? currentLocation.cityIndex : -1;
      var index = (primaryIndex === 0 && CITIES.length > 1) ? 1 : 0;
      return { type: "city", cityIndex: index };
    }

    // Show or hide all slot-B chrome (selector, card, stacked-chart nodes,
    // per-chart labels) and switch the cards area to the two-column layout.
    function applyCompareMode(on) {
      compareMode = on;
      // Slot-B selector is visible iff compare is on AND the selector isn't
      // collapsed — never force it open when the user has collapsed the panel.
      elSelectorB.classList.toggle("hidden", !on || readSelectorCollapsed());
      elSlotCardB.classList.toggle("hidden", !on);
      elCompareCards.classList.toggle("compare-on", on);

      secondarySlot.precipBanner.classList.toggle("hidden", !on);
      secondarySlot.chart.classList.toggle("hidden", !on);
      if (secondarySlot.summary) { secondarySlot.summary.classList.toggle("hidden", !on); }
      primarySlot.chartLabel.classList.toggle("hidden", !on);
      secondarySlot.chartLabel.classList.toggle("hidden", !on);
      // Forecast per-slot labels/rows for slot B only make sense when both
      // compare and forecast are on; slot A's label follows compare alone
      // (mirrors chartLabel) so it only appears once there's a slot B to compare.
      primarySlot.forecastLabel.classList.toggle("hidden", !(on && forecastMode));
      secondarySlot.forecastList.classList.toggle("hidden", !(on && forecastMode));
      secondarySlot.forecastLabel.classList.toggle("hidden", !(on && forecastMode));

      if (compareToggle) { compareToggle.checked = on; }

      if (on) {
        // Ensure slot A's chart label reflects its current badge (renderCurrent
        // sets it, but the primary may have loaded before compare turned on).
        // Only seed from a resolved badge — skip the transient loading string or
        // an empty badge so a mid-load slot A doesn't stamp a stale label; the
        // next slot-A render then populates it.
        var badgeText = elBadge.textContent;
        if (badgeText && badgeText !== t("loading")) {
          primarySlot.chartLabel.textContent = badgeText;
        }
        if (!secondaryLocation) {
          secondaryLocation = defaultSecondary();
        }
        refreshCityOptionsB();
        loadSecondary(secondaryLocation);
      }
      // Recompute the header: turning compare off drops slot B from the verdict.
      updateHeaderTitle();
      saveCompareState();
    }

    compareToggle.addEventListener("change", function () {
      applyCompareMode(compareToggle.checked);
    });

    // ---- 7-day forecast mode (persisted) -------------------------------------
    var forecastToggle = document.getElementById("forecast-toggle");

    // Persisted off by default (sub-key absent → false → off).
    function readForecastMode() {
      return store.get("forecast", false) === true;
    }

    // Show/hide the forecast section, sync the checkbox, persist the state, and
    // render from each slot's stashed timeseries when turning on (slot B only
    // when compare mode is also active).
    function applyForecastMode(on) {
      forecastMode = on;
      var section = document.getElementById("forecast-section");
      if (section) { section.classList.toggle("hidden", !on); }
      if (forecastToggle) { forecastToggle.checked = on; }
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

    forecastToggle.addEventListener("change", function () {
      applyForecastMode(forecastToggle.checked);
    });

    // ---- Default load -------------------------------------------------------
    // Wrap a text/number input so a clear ("x") button overlays its right edge.
    // Visibility is driven purely by CSS (:placeholder-shown); this only wires the
    // click-to-clear. It does not focus or select the input.
    function attachClearButton(input) {
      var wrap = document.createElement("span");
      wrap.className = "input-wrap";
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "input-clear";
      btn.setAttribute("aria-label", "Clear");
      btn.textContent = "×";
      wrap.appendChild(btn);
      btn.addEventListener("click", function () {
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

    document.addEventListener("DOMContentLoaded", function () {
      markActiveLang();
      applyStaticStrings();
      attachClearButtons();
      renderSavedLocations();
      applySelectorCollapsed(readSelectorCollapsed());
      loadWeather(loadSavedLocation() || BELGRADE);
      // Restore a persisted comparison: seed slot B and re-enter compare mode.
      var compare = loadCompareState();
      if (compare) {
        secondaryLocation = compare.loc;
        applyCompareMode(true);
      }
      // Restore the persisted 7-day forecast toggle. The section unhides now; the
      // in-flight primary load renders into it on success (forecastMode is set).
      if (readForecastMode()) {
        applyForecastMode(true);
      }
    });
