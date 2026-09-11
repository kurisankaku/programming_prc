"use client";

import { useEffect, useState } from "react";
import { enableMocking, isMockingEnabled } from "@/mocks/enable-mocking";

/**
 * Service Worker の起動を待ちます。これを待たずに取得すると
 * 最初のリクエストだけモックをすり抜けます。
 */
export function useMocksReady(): boolean {
  const [ready, setReady] = useState(!isMockingEnabled);

  useEffect(() => {
    if (!isMockingEnabled) return;

    let active = true;
    enableMocking().then(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return ready;
}
