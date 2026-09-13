import type { AuthSession } from "@/lib/amplify-mock/types";

/** 認証状態を返すフックの共通シグネチャ。Context 版と SWR 版の両方がこれを満たします。 */
export type AuthSessionResult = {
  session: AuthSession | null;
  /** まだ結果が無いときだけ true。 */
  isLoading: boolean;
  /** 結果はあるが、裏で取り直しているとき true。 */
  isRefreshing: boolean;
  error: unknown;
  isSignedIn: boolean;
  /** キャッシュを捨てて取り直します。 */
  refresh: () => Promise<void>;
};
