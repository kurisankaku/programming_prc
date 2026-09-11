import { apiClient } from "@/lib/api-client";

/** SWR の既定フェッチャー。通信は axios が担当します。 */
export const fetcher = <T>(url: string): Promise<T> =>
  apiClient.get<T>(url).then((response) => response.data);
