import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";

export type SessionLoader = {
  /** 何度呼んでも、最初の 1 回が作った Promise を返します。 */
  load: () => Promise<AuthSession>;
  /** 次の load() で取り直させます。 */
  reset: () => void;
};

/**
 * 取得を 1 回に抑えるだけの入れ物。React には依存しません。
 *
 * 共有するのが「結果」ではなく「取得そのもの」なので、まだ解決していなくても
 * 2 人目以降を同じ Promise に相乗りさせられます。
 */
export function createSessionLoader(): SessionLoader {
  let pending: Promise<AuthSession> | null = null;

  return {
    load: () => (pending ??= fetchAuthSession()),
    reset: () => {
      pending = null;
    },
  };
}
