"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

/** SWR の既定設定。フェッチャーをここで一度だけ渡します。 */
export function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
