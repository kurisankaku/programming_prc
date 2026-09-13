import { apiClient } from "@/lib/api-client";
import { decodeJWT } from "@/lib/amplify-mock/jwt";
import { clearTokens, readTokens, writeTokens } from "@/lib/amplify-mock/token-store";
import {
  AuthError,
  type AuthSession,
  type AuthUser,
  type FetchAuthSessionOptions,
  type SignInInput,
  type SignInOutput,
} from "@/lib/amplify-mock/types";
import { enableMocking } from "@/mocks/enable-mocking";
import axios from "axios";

type SessionResponse = {
  accessToken: string;
  idToken: string;
  userSub: string;
  identityId: string;
};

type SignInResponse = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

/**
 * 本物の fetchAuthSession() の代わり。
 * 本物は有効なトークンがあれば通信しないが、呼び出し回数を Network タブで
 * 数えられるよう、こちらは毎回 1 往復する。
 */
export async function fetchAuthSession(
  options: FetchAuthSessionOptions = {},
): Promise<AuthSession> {
  // モック専用。本物に差し替えるときはこの行ごと消える。
  await enableMocking();

  const stored = readTokens();

  // 未ログインは例外ではなく空のセッション。本物と同じ振る舞い。
  if (!stored) return {};

  try {
    const { data } = await apiClient.get<SessionResponse>("/auth/session", {
      headers: { Authorization: `Bearer ${stored.refreshToken}` },
      params: options.forceRefresh ? { forceRefresh: "true" } : undefined,
    });

    writeTokens({ ...stored, accessToken: data.accessToken, idToken: data.idToken });

    return {
      tokens: {
        accessToken: decodeJWT(data.accessToken),
        idToken: decodeJWT(data.idToken),
      },
      userSub: data.userSub,
      identityId: data.identityId,
    };
  } catch (error) {
    // 期限切れや取り消し済みのトークンは、捨てて未ログイン扱いに戻す。
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearTokens();
      return {};
    }
    throw error;
  }
}

/** 本物の signIn() の代わり。成功したらトークンを localStorage に置く。 */
export async function signIn({ username, password }: SignInInput): Promise<SignInOutput> {
  await enableMocking();

  try {
    const { data } = await apiClient.post<SignInResponse>("/auth/signin", { username, password });
    writeTokens(data);
    return { isSignedIn: true, nextStep: { signInStep: "DONE" } };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthError("NotAuthorizedException", "メールアドレスまたはパスワードが違います。");
    }
    throw error;
  }
}

/** 本物の signOut() の代わり。通信の成否によらず手元のトークンを捨てる。 */
export async function signOut(): Promise<void> {
  await enableMocking();

  try {
    await apiClient.post("/auth/signout");
  } finally {
    // 通信が失敗しても手元のトークンは必ず捨てる。
    clearTokens();
  }
}

/** 本物の getCurrentUser() の代わり。未ログインなら AuthError を投げる。 */
export async function getCurrentUser(): Promise<AuthUser> {
  const stored = readTokens();

  if (!stored) {
    throw new AuthError("UserUnAuthenticatedException", "ログインしていません。");
  }

  const { payload } = decodeJWT(stored.idToken);

  return {
    userId: payload.sub,
    username: payload["cognito:username"] ?? payload.sub,
  };
}
