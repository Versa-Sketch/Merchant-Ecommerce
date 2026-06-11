// Toggle this to switch every module between mock fixture data and the real API.
export const USE_FIXTURES = false;

/** Simulates network latency for fixture services. */
export function fixtureDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
