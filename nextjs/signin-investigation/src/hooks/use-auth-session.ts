"use client";

import { useContext } from "react";
import { AuthSessionContext } from "@/providers/auth-session-provider";
import type { AuthSessionResult } from "@/types/auth-session-result";

/**
 * 認証状態の取得口。
 *
 * どのコンポーネント・どのフックから、何度呼んでも構いません。
 * 親から状態を受け取る必要はなく、ネストの深さも関係ありません。
 * 実際の取得はページごとに一度だけで、2 人目以降はその結果を共有します。
 */
export function useAuthSession(): AuthSessionResult {
  const value = useContext(AuthSessionContext);

  if (!value) {
    throw new Error("useAuthSession は AuthSessionProvider の内側で呼んでください。");
  }

  return value;
}

/**
 * useAuthSession を内側で呼ぶだけのフック。
 * フックがネストしても、呼び出し側は何も引き渡さなくて済むことの例です。
 */
export function useCurrentUser() {
  const { session, isLoading, error } = useAuthSession();
  const payload = session?.tokens?.idToken?.payload;

  return {
    isLoading,
    error,
    user: payload ? { userId: payload.sub, email: payload.email ?? "" } : null,
  };
}
