import type { AuthSession } from "@/lib/amplify-mock/types";

/** 認証状態を返すフックの共通シグネチャ。 */
export type AuthSessionResult = {
  session: AuthSession | null;
  /** 取得中のあいだ true。初回も取り直しも同じ。 */
  isLoading: boolean;
  error: unknown;
  isSignedIn: boolean;
  /** キャッシュを捨てて取り直す。 */
  refresh: () => Promise<void>;
};
