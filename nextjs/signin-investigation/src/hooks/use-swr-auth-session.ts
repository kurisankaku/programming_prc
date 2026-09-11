"use client";

import { usePathname } from "next/navigation";
import useSWR from "swr";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";

export type SwrAuthSessionResult = {
  session: AuthSession | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
};

// 実験の変数を絞るため、共通設定（keepPreviousData など）は打ち消しておきます。
const options = { keepPreviousData: false, revalidateOnFocus: false } as const;

/**
 * 版A：キャッシュキーにページのパスを含める。
 * キャッシュは SWR の global なので、同じパスに戻ると前回の結果が残っています。
 */
export function useSwrAuthSessionByPath(): SwrAuthSessionResult {
  const pathname = usePathname();

  const { data, isLoading, isValidating, error } = useSWR<AuthSession>(
    ["auth/session", pathname],
    () => fetchAuthSession(),
    options,
  );

  return { session: data, isLoading, isValidating, error };
}

/**
 * 版B：キーは固定。キャッシュそのものを PageScopedSwrCache が
 * ページごとに作り直すので、毎回まっさらな状態から始まります。
 */
export function useSwrAuthSessionScoped(): SwrAuthSessionResult {
  const { data, isLoading, isValidating, error } = useSWR<AuthSession>(
    "auth/session",
    () => fetchAuthSession(),
    options,
  );

  return { session: data, isLoading, isValidating, error };
}
