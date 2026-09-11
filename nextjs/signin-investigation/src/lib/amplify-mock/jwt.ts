import type { CognitoJwtPayload, JWT } from "@/lib/amplify-mock/types";

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 本物の aws-amplify/auth の decodeJWT と同じ役割です。署名は検証しません。 */
export function decodeJWT(token: string): JWT {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("JWT の形式が不正です。");
  }

  return {
    toString: () => token,
    payload: JSON.parse(fromBase64Url(payload)) as CognitoJwtPayload,
  };
}

/** アクセストークンが期限切れかどうか。 */
export function isExpired(token: JWT, now = Date.now()): boolean {
  return token.payload.exp * 1000 <= now;
}
