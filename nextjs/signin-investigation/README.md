# 工具 Kōgu — Next.js の認証状態キャッシュ検証

`fetchAuthSession()` を**どこから何回呼んでも困らない**形にするための検証プロジェクト。
架空の道具屋のカタログサイトを題材に、zustand / SWR / axios / MSW を組み合わせている。

実サーバーは無く、通信はすべて MSW が受ける。Cognito も自前のモックで置き換えてある。

## 構成

| 項目 | バージョン | 役割 |
| --- | --- | --- |
| Next.js | 16.3.5 | App Router / Turbopack |
| React | 19.2.8 | |
| TypeScript | 5 系（strict） | |
| Tailwind CSS | 4 系 | `@theme` でトークン定義 |
| zustand | 5 系 | 絞り込み条件のストア |
| SWR | 2 系 | リクエストのキャッシュ |
| axios | 1 系 | HTTP クライアント |
| MSW | 2 系（devDependency） | モックの通信 |
| モック Amplify | 自前 | Cognito の代わり（`src/lib/amplify-mock`） |

`next.config.ts` は空のままで、`create-next-app` の既定構成から変えていない。

## 主題：認証状態をページ単位でキャッシュする

要件は 2 つの寿命の混在。

| 取得するもの | 載せる先 | 寿命 |
| --- | --- | --- |
| 商品一覧・お知らせなど | SWR（グローバル） | ページをまたいで保持 |
| **ログイン状態** | **Context（`AuthSessionProvider`）** | **そのページを離れるまで** |

単一のキャッシュ機構では分離できないため、認証だけ SWR から外している。理由は後述。

```
どのコンポーネント・どのフックからでも
  useAuthSession()  →  { session, isLoading, error, isSignedIn, refresh }
       └─ AuthSessionContext（読むだけ。取得はしない）
            └─ PageAuthSession（key={pathname} でページごとに作り直される）
                 └─ マウント時に 1 回だけ fetchAuthSession()
                      └─ axios GET /api/auth/session
                           └─ MSW
```

### 成り立っている性質

| 性質 | 仕組み |
| --- | --- |
| 親から props で引き継がなくてよい | 状態は Context 経由。ネストの深さは無関係 |
| 呼び出し側が何箇所あっても通信は 1 回 | 取得するのは Provider だけ。呼び出し側は Context を読む |
| 取得後に増えた呼び出し側は通信ゼロ | すでに Context に結果がある |
| ページを離れると破棄される | `key={pathname}` で `PageAuthSession` ごと作り直される |

`AuthSessionProvider` は共通レイアウトに置き、ヘッダーも含めて囲んでいる。
`key` を渡すために `AuthSessionProvider`（パスを読む）と `PageAuthSession`（状態を持つ）に
分かれている。`key` は自分自身には付けられないため、この分割は省けない。

### 開発時は通信が 2 回になる

React StrictMode が effect を 2 回走らせるため、開発ビルドではマウント時の取得が 2 回飛ぶ。
本番ビルドでは 1 回。**開発時だけ効くガードは意図的に置いていない**（本番で実行されない
コードを残さない方針）。

### ネストしたカスタムフックから使う

`useAuthSession()` は**フック**なので `useEffect` の中では呼べない。
フック本体の先頭で呼び、`useEffect` ではその結果を使う。

```ts
function useMyHook() {
  const { session, isLoading, isSignedIn } = useAuthSession(); // ← ここで呼ぶ

  useEffect(() => {
    if (isLoading) return; // 確定前は null
    doSomething(session);
  }, [isLoading, isSignedIn, session]);
}
```

`isLoading` は初回も取り直しも同じく `true` になる。取り直し中も `session` は消えないので、
「値はあるが取得中」を区別したければ `session !== null && isLoading` で判定する。

### 副作用として受け入れていること

ヘッダーも境界の内側にあるため、**ページを移動するたびにヘッダーの認証表示も一度
「確認中」に戻る**。ページ単位でキャッシュを捨てる以上は避けられない。

## なぜ SWR ではないのか

`/swr-session` に 3 方式を並べて比較してある（`?only=a` / `?only=b` / `?only=own` で 1 つずつ計測できる）。

| 方式 | 結果 |
| --- | --- |
| SWR・キーにパスを含める | **要件を満たさない**。未ログインで訪れたパスに戻ると、古い「未ログイン」を `isLoading: false` のまま描画する |
| SWR・ページごとに新しいキャッシュ | 要件は満たす。ただし境界は React のサブツリー単位なので、認証を囲むと商品一覧も一緒にページ単位になる |
| Context（採用） | 要件を満たし、他のキャッシュに影響しない |

SWR のキャッシュ境界は `<SWRConfig value={{ provider: () => new Map() }}>` で作る。
設定（fetcher など）は親からマージされるが、**キャッシュだけが別**になる。
`/swr-session?only=boundary` で、同じキーが境界の内外で別物になることを確認できる。

## 商品一覧のデータの流れ

```
ProductList（Client Component）
  └─ zustand ─ 絞り込み条件（検索語・分類・在庫）
       └─ SWR キー "/products?q=…&category=…"
            └─ fetcher ─ axios（baseURL: /api）
                 └─ GET /api/products
                      └─ MSW がブラウザで受けて応答
```

- **絞り込みはサーバー側（= MSW ハンドラ）で行う。** 条件がそのまま SWR のキーになるので、
  一度見た条件に戻ればキャッシュから即座に描画され、再取得は裏で走る。
- 検索語は 250ms デバウンスしてからキーに反映する。
- `keepPreviousData` を有効にしているため、条件を変えても前の結果を薄く残したまま更新する。
  骨組み（スケルトン）が出るのは、まだ一度も結果が無い初回だけ。
- トップページの「今月の道具」はあえてサーバー側描画のままにしてある。

## モック通信

実サーバーが無いので、`/api/*` はすべて MSW が受ける。

- 有効・無効は `.env` の `NEXT_PUBLIC_API_MOCKING` で切り替える（既定は `enabled`）。
- ブラウザ側のみのモック。Service Worker の起動を待ってから最初の取得を行うため、
  `useMocksReady()` が `true` になるまで SWR のキーは `null` にしている。
- `public/mockServiceWorker.js` は `npx msw init public/ --save` が生成したもの。手で編集しない。

> **本物の API に繋いだら** `NEXT_PUBLIC_API_MOCKING=disabled` にして、`src/mocks/` と
> `src/data/products.ts` を外す。有効なまま公開すると、本番でもモックが応答する。

### モック Amplify

`src/lib/amplify-mock/` が `aws-amplify/auth` の代わり。型と戻り値を本物に寄せてある。

- `fetchAuthSession(options?)` — 未ログインでも例外にせず `tokens: undefined` を返す
- `signIn({ username, password })` / `signOut()` / `getCurrentUser()`
- トークンは署名のない偽 JWT。`localStorage` に置く（本物と同じ保存先）

> **本物との違い**：本物は有効なトークンが手元にあれば通信しないが、こちらは呼び出し回数を
> Network タブで数えられるよう、呼ばれるたびに必ず 1 往復する。

本物へ差し替えるときは `@/lib/amplify-mock/auth` を `aws-amplify/auth` に置き換え、
`src/lib/amplify-mock/` と `src/mocks/` を外す。Provider とフックは変更不要。

`usePathname()` を使っているのは `AuthSessionProvider` の 1 行だけなので、
Next.js App Router 以外へ持ち出す場合もそこだけ差し替えればよい。

### モックのアカウント

| メールアドレス | パスワード |
| --- | --- |
| kogu@example.com | Passw0rd! |
| guest@example.com | Guest123! |

## ページ

| ルート | ファイル | 内容 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | トップ。ヒーロー、三つの約束、注目の道具 |
| `/products` | `src/app/products/page.tsx` | 一覧。検索・分類・在庫での絞り込み |
| `/about` | `src/app/about/page.tsx` | 工房紹介と店舗案内 |
| `/signin` | `src/app/signin/page.tsx` | モック Cognito へのログイン |
| `/session` | `src/app/session/page.tsx` | 認証状態の確認。入れ子と後発マウントの実演 |
| `/swr-session` | `src/app/swr-session/page.tsx` | SWR 3 方式の比較 |
| （404） | `src/app/not-found.tsx` | 見つからないページ |

## ディレクトリ

```
src/
├── app/                         # 上表のルート。layout.tsx に Provider を置く
├── components/
│   ├── site-header.tsx          # 現在地の下線と認証表示
│   ├── header-auth.tsx          # ログイン導線 / ログアウト
│   ├── product-card.tsx         # Server Component
│   ├── product-list.tsx         # zustand + SWR
│   ├── signin-form.tsx
│   ├── session-lab.tsx          # /session の中身
│   ├── swr-session-lab.tsx      # /swr-session の 3 方式比較
│   └── swr-boundary-demo.tsx    # SWR のキャッシュ境界の確認
├── hooks/
│   ├── use-auth-session.ts      # 認証状態の取得口（useCurrentUser も同居）
│   ├── use-swr-auth-session.ts  # 比較用の SWR 版
│   ├── use-debounced-value.ts
│   └── use-mocks-ready.ts       # Service Worker の起動待ち
├── lib/
│   ├── amplify-mock/            # aws-amplify/auth の代役
│   ├── api-client.ts            # axios インスタンスとエラーメッセージ変換
│   └── fetcher.ts               # SWR の既定フェッチャー
├── mocks/
│   ├── handlers/                # products / auth
│   ├── users.ts                 # モックのユーザープール
│   ├── fake-jwt.ts              # 署名なし JWT の発行
│   ├── browser.ts               # setupWorker
│   └── enable-mocking.ts        # 起動は一度だけ
├── providers/
│   ├── auth-session-provider.tsx  # ページ単位のキャッシュ境界と取得
│   ├── swr-provider.tsx           # SWRConfig（fetcher / keepPreviousData）
│   └── page-scoped-swr-cache.tsx  # 比較用。配下だけ独立したキャッシュ
├── stores/
│   └── product-filter-store.ts  # zustand + SWR キーの組み立て
├── types/
│   ├── auth-session-result.ts   # useAuthSession が返す型
│   └── product.ts
└── data/
    └── products.ts              # サンプルデータ（MSW とトップのみが読む）
```

認証まわりを別プロジェクトへ持ち出すなら、必要なのは
`providers/auth-session-provider.tsx` / `hooks/use-auth-session.ts` /
`types/auth-session-result.ts` の 3 つ。

## 開発

```bash
npm run dev     # http://localhost:3000
npm run build   # 本番ビルド（7 ルートすべて静的プリレンダリング）
npm run lint
```

## デザイントークン

色と書体は `src/app/globals.css` の `@theme` に集約している。
`paper` / `ink` / `graphite` / `rule` / `blueprint` / `brass` の 6 色と、
本文用 Archivo（日本語は OS の標準ゴシックにフォールバック）、
仕様表示用 IBM Plex Mono の 2 書体。
