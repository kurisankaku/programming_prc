import { HttpResponse, delay, http } from "msw";
import { issueTokens } from "@/mocks/fake-jwt";
import { findUserByCredentials, findUserByRefreshToken, toRefreshToken } from "@/mocks/users";

/** Cognito への往復に見立てた待ち時間。 */
const NETWORK_DELAY_MS = 400;

const bearer = (request: Request) =>
  request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? null;

export const authHandlers = [
  http.post("/api/auth/signin", async ({ request }) => {
    await delay(NETWORK_DELAY_MS);

    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };
    const user = findUserByCredentials(username, password);

    if (!user) {
      return HttpResponse.json(
        { message: "Incorrect username or password." },
        { status: 401 },
      );
    }

    return HttpResponse.json({ ...issueTokens(user), refreshToken: toRefreshToken(user) });
  }),

  http.get("/api/auth/session", async ({ request }) => {
    await delay(NETWORK_DELAY_MS);

    const user = findUserByRefreshToken(bearer(request));

    if (!user) {
      return HttpResponse.json({ message: "Refresh token is not valid." }, { status: 401 });
    }

    // 毎回その場でトークンを発行し直します（= Cognito のリフレッシュ相当）。
    return HttpResponse.json({
      ...issueTokens(user),
      userSub: user.sub,
      identityId: `ap-northeast-1:${user.sub}`,
    });
  }),

  http.post("/api/auth/signout", async () => {
    await delay(NETWORK_DELAY_MS / 2);
    return new HttpResponse(null, { status: 204 });
  }),
];
