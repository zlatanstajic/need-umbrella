import { describe, it, expect } from "vitest";
import { LatestRequestCoordinator } from "../src/weather-request";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

function deferred<T>(): Deferred<T> {
  var resolve!: (value: T) => void;
  var reject!: (reason: Error) => void;
  var promise = new Promise<T>(function (resolvePromise, rejectPromise) {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise: promise, resolve: resolve, reject: reject };
}

function observe<T>(
  coordinator: LatestRequestCoordinator,
  token: number,
  operation: Promise<T>,
  successes: T[],
  errors: string[]
): Promise<void> {
  return operation.then(function (value) {
    coordinator.runIfCurrent(token, function () { successes.push(value); });
  }).catch(function (error: Error) {
    coordinator.runIfCurrent(token, function () { errors.push(error.message); });
  });
}

describe("latest weather request coordination", function () {
  it.each(["primary", "secondary"])(
    "suppresses stale success and error callbacks for the %s slot",
    async function () {
      var coordinator = new LatestRequestCoordinator();
      var successes: string[] = [];
      var errors: string[] = [];
      var oldSuccess = deferred<string>();
      var oldSuccessDone = observe(coordinator, coordinator.begin(), oldSuccess.promise, successes, errors);
      var newestSuccess = deferred<string>();
      var newestSuccessDone = observe(coordinator, coordinator.begin(), newestSuccess.promise, successes, errors);

      newestSuccess.resolve("new");
      await newestSuccessDone;
      oldSuccess.resolve("old");
      await oldSuccessDone;

      var oldError = deferred<string>();
      var oldErrorDone = observe(coordinator, coordinator.begin(), oldError.promise, successes, errors);
      var newestError = deferred<string>();
      var newestErrorDone = observe(coordinator, coordinator.begin(), newestError.promise, successes, errors);
      oldError.reject(new Error("old error"));
      await oldErrorDone;
      newestError.reject(new Error("new error"));
      await newestErrorDone;

      expect(successes).toEqual(["new"]);
      expect(errors).toEqual(["new error"]);
    }
  );

  it("ignores an older success before or after the newest success", async function () {
    var coordinator = new LatestRequestCoordinator();
    var successes: string[] = [];
    var errors: string[] = [];
    var oldRequest = deferred<string>();
    var oldDone = observe(coordinator, coordinator.begin(), oldRequest.promise, successes, errors);
    var newRequest = deferred<string>();
    var newDone = observe(coordinator, coordinator.begin(), newRequest.promise, successes, errors);

    oldRequest.resolve("old");
    await oldDone;
    expect(successes).toEqual([]);

    newRequest.resolve("new");
    await newDone;
    expect(successes).toEqual(["new"]);
    expect(errors).toEqual([]);
  });

  it("ignores an older success released after the newest request completes", async function () {
    var coordinator = new LatestRequestCoordinator();
    var successes: string[] = [];
    var errors: string[] = [];
    var oldRequest = deferred<string>();
    var oldDone = observe(coordinator, coordinator.begin(), oldRequest.promise, successes, errors);
    var newRequest = deferred<string>();
    var newDone = observe(coordinator, coordinator.begin(), newRequest.promise, successes, errors);

    newRequest.resolve("new");
    await newDone;
    oldRequest.resolve("old");
    await oldDone;

    expect(successes).toEqual(["new"]);
    expect(errors).toEqual([]);
  });

  it("ignores stale errors but delivers the newest error", async function () {
    var coordinator = new LatestRequestCoordinator();
    var successes: string[] = [];
    var errors: string[] = [];
    var oldRequest = deferred<string>();
    var oldDone = observe(coordinator, coordinator.begin(), oldRequest.promise, successes, errors);
    var newRequest = deferred<string>();
    var newDone = observe(coordinator, coordinator.begin(), newRequest.promise, successes, errors);

    oldRequest.reject(new Error("old error"));
    await oldDone;
    newRequest.reject(new Error("new error"));
    await newDone;

    expect(successes).toEqual([]);
    expect(errors).toEqual(["new error"]);
  });

  it("invalidates repeated loads even when their descriptor is reused", function () {
    var coordinator = new LatestRequestCoordinator();
    var descriptor = { type: "city", cityIndex: 0 };
    function load(_descriptor: typeof descriptor): number {
      return coordinator.begin();
    }
    var first = load(descriptor);
    var second = load(descriptor);

    expect(coordinator.isCurrent(first)).toBe(false);
    expect(coordinator.isCurrent(second)).toBe(true);
  });

  it("keeps primary and secondary request identities independent", function () {
    var primary = new LatestRequestCoordinator();
    var secondary = new LatestRequestCoordinator();
    var primaryToken = primary.begin();
    var secondaryToken = secondary.begin();

    primary.begin();

    expect(primary.isCurrent(primaryToken)).toBe(false);
    expect(secondary.isCurrent(secondaryToken)).toBe(true);
  });

  it.each(["rejected fetch", "HTTP error", "no weather data"])(
    "keeps established content for a same-coordinate background %s",
    function (message) {
      var coordinator = new LatestRequestCoordinator();
      var token = coordinator.begin();
      var visibleWeather = "established weather";
      var visibleClock = "09:05";

      var applied = coordinator.runErrorIfCurrent(token, true, function () {
        visibleWeather = message;
        visibleClock = "";
      });

      expect(applied).toBe(false);
      expect(visibleWeather).toBe("established weather");
      expect(visibleClock).toBe("09:05");
    }
  );

  it("applies a newest foreground error normally", function () {
    var coordinator = new LatestRequestCoordinator();
    var token = coordinator.begin();
    var error = "";

    expect(coordinator.runErrorIfCurrent(token, false, function () {
      error = "offline";
    })).toBe(true);
    expect(error).toBe("offline");
  });
});
