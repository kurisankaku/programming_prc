import { create } from "zustand";

/**
 * 実験を目で確かめるためだけの計測です。認証そのものには関与しません。
 */
export type EffectLog = {
  /** この effect が走った回数。 */
  runs: number;
  /** 走ったときに見えていた値。 */
  entries: string[];
};

export const emptyEffectLog: EffectLog = { runs: 0, entries: [] };

type AuthProbeState = {
  /** useAuthSession() を呼んでいる、いまマウント中の箇所の数。 */
  consumers: number;
  /** モック fetchAuthSession() が実際に走った回数。 */
  fetchCalls: number;
  /** ネストしたフックの useEffect が、いつ何を見たか。 */
  effectLogs: Record<string, EffectLog>;
};

export const useAuthProbeStore = create<AuthProbeState>()(() => ({
  consumers: 0,
  fetchCalls: 0,
  effectLogs: {},
}));

/**
 * ページ単位の数え直し。
 * consumers は登録と解除で常に正しい値になるので、ここでは触りません。
 */
export function resetAuthCounters(): void {
  useAuthProbeStore.setState({ fetchCalls: 0, effectLogs: {} });
}

/** ネストしたフックの effect が走ったことを記録します。 */
export function recordEffectRun(key: string, entry: string): void {
  useAuthProbeStore.setState((state) => {
    const current = state.effectLogs[key] ?? emptyEffectLog;

    return {
      effectLogs: {
        ...state.effectLogs,
        [key]: { runs: current.runs + 1, entries: [...current.entries, entry] },
      },
    };
  });
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
