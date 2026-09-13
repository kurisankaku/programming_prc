/** Cognito がトークンを置く場所に相当する。本物も既定は localStorage。 */
const STORAGE_KEY = "CognitoIdentityServiceProvider.mock.tokens";

export type StoredTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

/** 保存済みのトークン。無いか壊れていれば null。 */
export function readTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

/** トークンを保存する。 */
export function writeTokens(tokens: StoredTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/** 保存済みのトークンを捨てる。 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
