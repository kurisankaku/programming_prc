import { create } from "zustand";

/**
 * 実験を目で確かめるためだけの計測です。認証そのものには関与しません。
 */
type AuthProbeState = {
  /** useAuthSession() を呼んでいる、いまマウント中の箇所の数。 */
  consumers: number;
  /** このページで取得を開始した回数。読み込み直後は 1 になるはずです。 */
  loads: number;
  /** モック fetchAuthSession() が実際に走った回数。 */
  fetchCalls: number;
};

export const useAuthProbeStore = create<AuthProbeState>()(() => ({
  consumers: 0,
  loads: 0,
  fetchCalls: 0,
}));

/**
 * ページ単位の数え直し。
 * consumers は登録と解除で常に正しい値になるので、ここでは触りません。
 */
export function resetAuthCounters(): void {
  useAuthProbeStore.setState({ loads: 0, fetchCalls: 0 });
}

export function countLoad(): void {
  useAuthProbeStore.setState((state) => ({ loads: state.loads + 1 }));
}

export function countFetchAuthSession(): void {
  useAuthProbeStore.setState((state) => ({ fetchCalls: state.fetchCalls + 1 }));
}

/** 呼び出し側の登録。戻り値をそのまま useEffect の後始末に使います。 */
export function registerConsumer(): () => void {
  useAuthProbeStore.setState((state) => ({ consumers: state.consumers + 1 }));

  return () => {
    useAuthProbeStore.setState((state) => ({ consumers: state.consumers - 1 }));
  };
}
