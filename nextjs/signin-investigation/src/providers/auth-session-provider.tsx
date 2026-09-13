"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode } from "react";
import { usePageScopedSession } from "@/hooks/use-page-scoped-session";
import type { AuthSessionResult } from "@/types/auth-session-result";

export const AuthSessionContext = createContext<AuthSessionResult | null>(null);

/**
 * 認証状態のキャッシュ境界。
 * パスが変わると key が変わり、PageAuthSession ごと作り直されて結果が破棄されます。
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <PageAuthSession key={pathname}>{children}</PageAuthSession>;
}

function PageAuthSession({ children }: { children: ReactNode }) {
  const value = usePageScopedSession();

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
