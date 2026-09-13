/**
 * モック通信の起動。本物の API に繋いだら
 * .env の NEXT_PUBLIC_API_MOCKING を disabled にしてください。
 */
export const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

let startPromise: Promise<void> | null = null;

/** 何度呼んでも Service Worker の起動は一度だけです。 */
export function enableMocking(): Promise<void> {
  if (typeof window === "undefined" || !isMockingEnabled) {
    return Promise.resolve();
  }

  startPromise ??= import("@/mocks/browser").then(({ worker }) =>
    worker.start({ onUnhandledRequest: "bypass" }).then(() => undefined),
  );

  return startPromise;
}
