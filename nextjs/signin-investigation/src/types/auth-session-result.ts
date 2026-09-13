import type { AuthSession } from "@/lib/amplify-mock/types";

/**
 * 認証状態を返すフックの共通シグネチャ。
 * Context 版と SWR 版の両方がこの型を満たすので、呼び出し側は差し替えられます。
 */
export type AuthSessionResult = {
  session: AuthSession | null;
  /** まだ一度も結果が無いときだけ true。SWR の isLoading と同じ意味です。 */
  isLoading: boolean;
  /** 手元に結果はあるが、裏で取り直しているとき true。SWR の isValidating 相当。 */
  isRefreshing: boolean;
  error: unknown;
  isSignedIn: boolean;
  /** キャッシュを捨てて取り直します。ログイン直後などに使います。 */
  refresh: () => Promise<void>;
};
