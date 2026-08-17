export const TIMEOUTS = {
  pollingInterval: 500,
  short: 5_000,
  standard: 15_000,
  medium: 30_000,
  long: 45_000,
  asyncProcessing: 60_000,
  extendedWait: 90_000,
} as const;

/** Promise-based delay for polling loops (avoids playwright/no-wait-for-timeout). */
export function pollDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
