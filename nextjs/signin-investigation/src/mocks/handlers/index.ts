import { authHandlers } from "@/mocks/handlers/auth";
import { productHandlers } from "@/mocks/handlers/products";

export const handlers = [...authHandlers, ...productHandlers];
