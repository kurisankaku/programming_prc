"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import useSWR from "swr";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import type { AuthSessionResult } from "@/types/auth-session-result";

const SESSION_KEY = "auth/session";

/**
 * SWR 版。ページ単位の寿命はこのフック単体では作れないので、
 * PageScopedSwrCache とセットで使います。
 */
export function useSwrAuthSession(): AuthSessionResult {
  const { data, isLoading, error, mutate } = useSWR<AuthSession>(
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
    error,
    isSignedIn: Boolean(data?.tokens),
    refresh,
  };
}

/** うまくいかない方式。キーにパスを含めても、キャッシュは global に残り続けます。 */
export function useSwrAuthSessionByPath(): AuthSessionResult {
  const pathname = usePathname();

  const { data, isLoading, error, mutate } = useSWR<AuthSession>(
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
    error,
    isSignedIn: Boolean(data?.tokens),
    refresh,
  };
}
