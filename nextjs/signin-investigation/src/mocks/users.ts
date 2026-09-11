/** モックの Cognito ユーザープール。実験用の固定アカウントです。 */
export type MockUser = {
  sub: string;
  username: string;
  password: string;
  email: string;
  displayName: string;
};

export const mockUsers: MockUser[] = [
  {
    sub: "4f1c0b62-5a3d-4c81-9f27-08e1a2d3b7c4",
    username: "kogu@example.com",
    password: "Passw0rd!",
    email: "kogu@example.com",
    displayName: "西陣 花子",
  },
  {
    sub: "a93e7d10-2f65-4b8a-8d43-1c6e5f90a2b7",
    username: "guest@example.com",
    password: "Guest123!",
    email: "guest@example.com",
    displayName: "見学 太郎",
  },
];

export const findUserByCredentials = (username: string, password: string) =>
  mockUsers.find((user) => user.username === username && user.password === password);

/** 実物のリフレッシュトークンは不透明な文字列ですが、ここは引けるようにしてあります。 */
export const toRefreshToken = (user: MockUser) => `mock-refresh.${user.sub}`;

export const findUserByRefreshToken = (refreshToken: string | null) =>
  mockUsers.find((user) => toRefreshToken(user) === refreshToken);
