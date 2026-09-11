import type { CognitoJwtPayload } from "@/lib/amplify-mock/types";
import type { MockUser } from "@/mocks/users";

/** アクセストークンの寿命。期限切れの挙動を試せるよう短めにしてあります。 */
export const ACCESS_TOKEN_TTL_SECONDS = 5 * 60;

function toBase64Url(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 署名しない偽の JWT。形だけ本物に似せてあります。 */
export function signFakeJwt(payload: CognitoJwtPayload): string {
  const header = { alg: "none", typ: "JWT", kid: "mock" };
  return `${toBase64Url(header)}.${toBase64Url(payload)}.mock-signature`;
}

export function issueTokens(user: MockUser, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + ACCESS_TOKEN_TTL_SECONDS;

  const base = { sub: user.sub, iat: issuedAt, exp: expiresAt } as const;

  return {
    accessToken: signFakeJwt({ ...base, token_use: "access", "cognito:username": user.username }),
    idToken: signFakeJwt({
      ...base,
      token_use: "id",
      email: user.email,
      "cognito:username": user.username,
    }),
  };
}
