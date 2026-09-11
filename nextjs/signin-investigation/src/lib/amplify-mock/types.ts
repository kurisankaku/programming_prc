/**
 * aws-amplify/auth の型に合わせた最小構成。
 * 本物へ差し替えるときは、この形のまま import 先だけ変えられます。
 */

export type CognitoJwtPayload = {
  sub: string;
  exp: number;
  iat: number;
  token_use: "access" | "id";
  email?: string;
  "cognito:username"?: string;
};

/** 本物の JWT と同じく、文字列化と復号済みペイロードの両方を持ちます。 */
export type JWT = {
  toString: () => string;
  payload: CognitoJwtPayload;
};

export type AuthTokens = {
  accessToken: JWT;
  idToken?: JWT;
};

/**
 * 未ログインでも例外にはならず、tokens が undefined の空セッションが返ります。
 * ログイン判定は `session.tokens !== undefined` で行ってください。
 */
export type AuthSession = {
  tokens?: AuthTokens;
  userSub?: string;
  identityId?: string;
};

export type FetchAuthSessionOptions = {
  forceRefresh?: boolean;
};

export type SignInInput = {
  username: string;
  password: string;
};

export type SignInOutput = {
  isSignedIn: boolean;
  nextStep: { signInStep: "DONE" };
};

export type AuthUser = {
  userId: string;
  username: string;
};

/** 本物の AuthError と同じく、name で種類を見分けます。 */
export class AuthError extends Error {
  constructor(
    public override readonly name: string,
    message: string,
  ) {
    super(message);
  }
}
