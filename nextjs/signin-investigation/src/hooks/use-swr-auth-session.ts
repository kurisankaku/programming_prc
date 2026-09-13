"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
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
  const { cache } = useSWRConfig();

  const { data, isLoading, isValidating, error, mutate } = useSWR<AuthSession>(
    SESSION_KEY,
    () => fetchAuthSession(),
    { keepPreviousData: false, revalidateOnFocus: false },
  );

  /**
   * 命令的な取得。SWR には「進行中の取得に相乗りする」公開 API が無いため、
   * キャッシュを直接覗き、無ければ mutate() で取りにいきます。
   * 初回取得の最中に呼ばれると、mutate() が二本目の通信を始めます。
   */
  const getAuthSession = useCallback(async (): Promise<AuthSession> => {
    const cached = cache.get(SESSION_KEY)?.data as AuthSession | undefined;
    if (cached) return cached;

    return (await mutate()) ?? {};
  }, [cache, mutate]);

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    session: data ?? null,
    isLoading,
    isRefreshing: isValidating && data !== undefined,
    error,
    isSignedIn: Boolean(data?.tokens),
    getAuthSession,
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
    getAuthSession: async () => (await mutate()) ?? {},
    refresh,
  };
}
