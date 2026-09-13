import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";

/** ブラウザ側の Service Worker。サーバーからは読み込まない。 */
export const worker = setupWorker(...handlers);
