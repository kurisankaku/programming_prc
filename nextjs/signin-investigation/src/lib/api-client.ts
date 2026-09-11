import axios from "axios";

/**
 * アプリ内から叩く HTTP クライアント。
 * baseURL を "/api" にしているので、呼び出し側は "/products" のような相対パスを渡します。
 */
export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/** axios のエラーを、画面に出せる日本語のメッセージに均します。 */
export function toMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "予期しないエラーが起きました。";
  }
  if (error.code === "ECONNABORTED") {
    return "通信がタイムアウトしました。";
  }
  const status = error.response?.status;
  if (status === 404) {
    return "データの取得先が見つかりません。";
  }
  if (status && status >= 500) {
    return "サーバー側でエラーが起きています。";
  }
  return "データを取得できませんでした。";
}
