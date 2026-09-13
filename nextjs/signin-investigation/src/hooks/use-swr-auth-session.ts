"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import type { AuthSessionResult } from "@/types/auth-session-result";

const SESSION_KEY = "auth/session";

/**
 * SWR 版。Context 版と同じ AuthSessionResult を返します。
 *
 * ページ単位の寿命は、このフック単体では作れません。
 * PageScopedSwrCache（SWRConfig の provider を差し替える層）とセットで使います。
 */
export function useSwrAuthSession(): AuthSessionResult {
  const { data, isLoading, isValidating, error, mutate } = useSWR<AuthSession>(
    SESSION_KEY,
    () => fetchAuthSession(),
    { keepPreviousData: false, revalidateOnFocus: false },
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    session: data ?? null,
    isLoading,
    isRefreshing: isValidating && data !== undefined,
    error,
    isSignedIn: Boolean(data?.tokens),
    refresh,
  };
}

/**
 * 比較実験のための、うまくいかない方式。
 * キャッシュキーにパスを含めても、キャッシュ自体は SWR の global に残り続けます。
 */
export function useSwrAuthSessionByPath(): AuthSessionResult {
  const pathname = usePathname();

  const { data, isLoading, isValidating, error, mutate } = useSWR<AuthSession>(
    [SESSION_KEY, pathname],
    () => fetchAuthSession(),
    { keepPreviousData: false, revalidateOnFocus: false },
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    session: data ?? null,
    isLoading,
    isRefreshing: isValidating && data !== undefined,
    error,
    isSignedIn: Boolean(data?.tokens),
    refresh,
  };
}
