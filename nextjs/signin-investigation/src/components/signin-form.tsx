"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { signIn } from "@/lib/amplify-mock/auth";
import { AuthError } from "@/lib/amplify-mock/types";
import { mockUsers } from "@/mocks/users";

/** モック Cognito へのログインフォーム。成功したら実験ページへ送る。 */
export function SignInForm() {
  const [username, setUsername] = useState(mockUsers[0].username);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refresh } = useAuthSession();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({ username, password });
      // 遷移先でページが作り直されるので、そこで新しい認証状態を取り直す。
      await refresh();
      router.push("/session");
    } catch (error) {
      setMessage(
        error instanceof AuthError ? error.message : "ログインできませんでした。",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-md">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
          メールアドレス
        </span>
        <input
          type="email"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          className="mt-2 w-full border border-rule bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
      </label>

      <label className="mt-6 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-graphite">
          パスワード
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full border border-rule bg-white px-4 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
      </label>

      {message && (
        <p role="alert" className="mt-6 border-l-2 border-brass bg-paper-sunk px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full border border-blueprint bg-blueprint px-6 py-3 text-sm text-paper transition-colors hover:bg-blueprint-deep disabled:opacity-60"
      >
        {isSubmitting ? "確認しています" : "ログイン"}
      </button>

      <div className="mt-8 border border-dashed border-rule p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Mock accounts
        </p>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          モックのユーザープールです。実在のアカウントではありません。
        </p>
        <dl className="mt-4 font-mono text-[11px]">
          {mockUsers.map((user) => (
            <div key={user.sub} className="flex justify-between gap-4 py-0.5">
              <dt className="text-graphite">{user.username}</dt>
              <dd>{user.password}</dd>
            </div>
          ))}
        </dl>
      </div>
    </form>
  );
}
