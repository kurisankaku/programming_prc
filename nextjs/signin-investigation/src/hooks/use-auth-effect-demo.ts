"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  emptyEffectLog,
  recordEffectRun,
  useAuthProbeStore,
  type EffectLog,
} from "@/stores/auth-probe-store";

/**
 * 3 段目（最深部）。宣言的な書き方。
 *
 * useAuthSession() はフックなので、必ずここ（フック本体の先頭）で呼びます。
 * useEffect の中では、その「結果」を使います。
 */
function useAuthSettledEffect(): EffectLog {
  const { session, isLoading, isSignedIn } = useAuthSession();

  useEffect(() => {
    // 確定するまでは何もしません。ここを忘れると null を掴みます。
    if (isLoading) return;

    recordEffectRun("settled", isSignedIn ? (session?.userSub ?? "") : "未ログイン");
  }, [isLoading, isSignedIn, session]);

  return useAuthProbeStore((state) => state.effectLogs.settled ?? emptyEffectLog);
}

/**
 * 3 段目（最深部）。命令的な書き方。
 *
 * useEffect の中で認証状態そのものが欲しいときは、getAuthSession() を await します。
 * 取得済みなら通信は起きず、解決済みの Promise がそのまま返ります。
 */
function useAuthAwaitEffect(): EffectLog {
  const { getAuthSession } = useAuthSession();

  useEffect(() => {
    let active = true;

    getAuthSession()
      .then((session) => {
        if (active) recordEffectRun("awaited", session.userSub ?? "未ログイン");
      })
      .catch(() => {
        if (active) recordEffectRun("awaited", "取得に失敗");
      });

    return () => {
      active = false;
    };
  }, [getAuthSession]);

  return useAuthProbeStore((state) => state.effectLogs.awaited ?? emptyEffectLog);
}

/** 2 段目。ただ 3 段目を呼ぶだけです。 */
function useAuthAudit() {
  return {
    settled: useAuthSettledEffect(),
    awaited: useAuthAwaitEffect(),
  };
}

/** 1 段目。コンポーネントが呼ぶのはこれだけで、props は何も渡しません。 */
export function useAuthBadge() {
  return useAuthAudit();
}
