/**
 * Cognito がトークンを置く場所に相当します。
 * 本物も localStorage を既定の保存先にしています。
 */
const STORAGE_KEY = "CognitoIdentityServiceProvider.mock.tokens";

export type StoredTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

export function readTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export function writeTokens(tokens: StoredTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
