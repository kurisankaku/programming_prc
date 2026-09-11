"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";

/**
 * 版B の下ごしらえ。
 *
 * SWRConfig に provider を渡すと、その配下だけ独立したキャッシュになります。
 * key={pathname} を付けているので、パスが変わるたびに新しい Map が作られ、
 * 以前のページのキャッシュは引き継がれません。
 */
export function PageScopedSwrCache({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SWRConfig key={pathname} value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );
}
