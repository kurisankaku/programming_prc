"use client";

import { useContext } from "react";
import { AuthSessionContext } from "@/providers/auth-session-provider";
import type { AuthSessionResult } from "@/types/auth-session-result";

/**
 * 認証状態の取得口。
 * どこから何度呼んでも、ページごとに一度きりの取得結果を共有します。
 */
export function useAuthSession(): AuthSessionResult {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession は AuthSessionProvider の内側で呼んでください。");
  }

  return value;
}

/** ID トークンから現在のユーザーを取り出します。 */
export function useCurrentUser() {
  const { session, isLoading, error } = useAuthSession();
  const payload = session?.tokens?.idToken?.payload;

  return {
    isLoading,
    error,
    user: payload ? { userId: payload.sub, email: payload.email ?? "" } : null,
  };
}
