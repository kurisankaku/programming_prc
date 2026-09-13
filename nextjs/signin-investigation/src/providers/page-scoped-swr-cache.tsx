"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";

/**
 * 配下だけ独立したキャッシュにする。
 * key でパスごとに作り直されるので、前のページのキャッシュは引き継がない。
 */
export function PageScopedSwrCache({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SWRConfig key={pathname} value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}
