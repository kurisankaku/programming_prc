import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";

/** ブラウザ側の Service Worker。サーバーから読み込まないでください。 */
export const worker = setupWorker(...handlers);
