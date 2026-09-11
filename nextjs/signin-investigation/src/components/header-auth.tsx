"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { signOut } from "@/lib/amplify-mock/auth";

/**
 * ヘッダーの認証表示。
 * ページ内のどの呼び出しとも、同じ 1 回の取得結果を共有しています。
 */
export function HeaderAuth() {
  const { isLoading, isSignedIn, session, refresh } = useAuthSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <span className="font-mono text-[10px] uppercase tracking-widest text-graphite">確認中</span>;
  }

  if (!isSignedIn) {
    return (
      <Link
        href="/signin"
        className="border border-rule px-3 py-1.5 text-sm text-graphite transition-colors hover:border-brass hover:text-ink"
      >
        ログイン
      </Link>
    );
  }

  const email = session?.tokens?.idToken?.payload.email ?? "";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    await refresh();
    setIsSigningOut(false);
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden font-mono text-[10px] tracking-widest text-graphite sm:inline">
        {email}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="border border-rule px-3 py-1.5 text-sm text-graphite transition-colors hover:border-brass hover:text-ink disabled:opacity-50"
      >
        {isSigningOut ? "処理中" : "ログアウト"}
      </button>
    </div>
  );
}
