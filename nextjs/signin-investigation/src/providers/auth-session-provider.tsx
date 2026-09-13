"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import type { AuthSessionResult } from "@/types/auth-session-result";

export const AuthSessionContext = createContext<AuthSessionResult | null>(null);

type State = {
  session: AuthSession | null;
  error: unknown;
  isLoading: boolean;
};

// マウントした時点で取りにいくので、最初から取得中です。
const initialState: State = { session: null, error: null, isLoading: true };

/** 成否をまとめて State に畳みます。返る Promise は reject しません。 */
async function settle(promise: Promise<AuthSession>): Promise<State> {
  try {
    return { session: await promise, error: null, isLoading: false };
  } catch (error) {
    return { session: null, error, isLoading: false };
  }
}

/**
 * 認証状態のキャッシュ境界。
 * パスが変わると key が変わり、PageAuthSession ごと作り直されて結果が破棄されます。
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <PageAuthSession key={pathname}>{children}</PageAuthSession>;
}

function PageAuthSession({ children }: { children: ReactNode }) {
  const [{ session, error, isLoading }, setState] = useState(initialState);

  useEffect(() => {
    settle(fetchAuthSession()).then(setState);
  }, []);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));

    setState(await settle(fetchAuthSession()));
  }, []);

  const value = useMemo<AuthSessionResult>(
    () => ({
      session,
      error,
      isLoading,
      isSignedIn: Boolean(session?.tokens),
      refresh,
    }),
    [session, error, isLoading, refresh],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
