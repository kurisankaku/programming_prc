import type { CognitoJwtPayload, JWT } from "@/lib/amplify-mock/types";

/** base64url を UTF-8 文字列に戻す。 */
function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 本物の aws-amplify/auth の decodeJWT と同じ役割。署名は検証しない。 */
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
