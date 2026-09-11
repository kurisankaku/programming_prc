# 工具 Kōgu — Next.js サンプル SPA

Next.js の App Router 標準構成で作った 3 ページのサンプルです。
架空の道具屋のカタログサイトを題材に、zustand / SWR / axios / MSW を組み合わせています。

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

`next.config.ts` は空のままで、`create-next-app` の既定構成から変えていません。

## データの流れ

```
ProductList（Client Component）
  └─ zustand ─ 絞り込み条件（検索語・分類・在庫）
       └─ SWR キー "/products?q=…&category=…"
            └─ fetcher ─ axios（baseURL: /api）
                 └─ GET /api/products
                      └─ MSW がブラウザで受けて応答（実サーバーなし）
```

- **絞り込みはサーバー側（= MSW ハンドラ）で行います。** 条件がそのまま SWR のキーになるので、
  一度見た条件に戻ればキャッシュから即座に描画され、再取得は裏で走ります。
- 検索語は 250ms デバウンスしてからキーに反映します（1 文字ごとに取得が走りません）。
- `keepPreviousData` を有効にしているため、条件を変えても前の結果を薄く残したまま更新します。
  骨組み（スケルトン）が出るのは、まだ一度も結果が無い初回だけです。
- トップページの「今月の道具」はあえてサーバー側描画のままにしてあります。
  すべてをクライアント取得にする必要はない、という対比です。

## モック通信について

このサンプルには実サーバーがないので、`/api/products` は MSW が受けます。

- 有効・無効は `.env` の `NEXT_PUBLIC_API_MOCKING` で切り替えます（既定は `enabled`）。
- ブラウザ側のみのモックです。Service Worker の起動を待ってから最初の取得を行うため、
  `useMocksReady()` が `true` になるまで SWR のキーは `null` にしています。
- `public/mockServiceWorker.js` は `npx msw init public/ --save` が生成したものです。手で編集しません。

> **本物の API に繋いだら** `NEXT_PUBLIC_API_MOCKING=disabled` にして、`src/mocks/` と
> `src/data/products.ts` を外してください。有効なまま公開すると、本番でもモックが応答します。

## 認証状態の扱い（このプロジェクトの主題）

`fetchAuthSession()` を**どこから何回呼んでも困らない**形にするための実験です。
呼び出し回数を減らすのではなく、**ページ単位で Promise を 1 つだけ共有**して解決しています。

```
どのコンポーネント・どのフックからでも
  useAuthSession()  →  { session, isLoading, error, isSignedIn, refresh }
       └─ AuthSessionProvider（ページのマウント単位で生存）
            └─ useRef に保持した Promise ← 2 人目以降は同じものに相乗り
                 └─ fetchAuthSession()  ← モック Amplify
                      └─ axios GET /api/auth/session
                           └─ MSW
```

### 成り立っている性質

| 性質 | 仕組み |
| --- | --- |
| 親から props で引き継がなくてよい | 状態は Context 経由。ネストの深さは無関係 |
| 同時に何箇所から呼ばれても通信は 1 回 | `pending` の Promise に相乗りする |
| 取得後に増えた呼び出し側は通信ゼロ | 解決済みの Promise がそのまま返る |
| ページを離れると破棄される | Promise は `useRef` にあり、アンマウントで消える |

`AuthSessionProvider` は共通レイアウトに置き、内部で `key={pathname}` を付けています。
パスが変わると境界ごと作り直されるため、キャッシュの寿命は「そのページがマウントされている間」です。

`/session` で実際の数値を確認できます。読み込み直後は
**「呼んでいる箇所 6 / 取得開始 1 / fetchAuthSession() 実行 1」**、
「呼び出し箇所を増やす」で 9 まで増やしても後ろ二つは 1 のままです。

### 副作用として受け入れていること

ヘッダーも境界の内側にあるため、**ページを移動するたびにヘッダーの認証表示も一度「確認中」に戻ります**。
ページ単位でキャッシュを捨てる以上は避けられない挙動です。ヘッダーだけ滑らかにしたい場合は、
境界の外側に別の保持先（前回の結果を覚えておく層）が必要になります。

### モック Amplify

`src/lib/amplify-mock/` が `aws-amplify/auth` の代わりです。型と戻り値を本物に寄せてあります。

- `fetchAuthSession(options?)` — 未ログインでも例外にせず `tokens: undefined` を返します
- `signIn({ username, password })` / `signOut()` / `getCurrentUser()`
- トークンは署名のない偽 JWT。`localStorage` に置きます（本物と同じ保存先）

> **本物との違い**：本物は有効なトークンが手元にあれば通信しませんが、こちらは実験を
> Network タブで数えられるよう、呼ばれるたびに必ず 1 往復します。
> つまり「通信回数 = fetchAuthSession() が実際に走った回数」です。

本物へ差し替えるときは `@/lib/amplify-mock/auth` を `aws-amplify/auth` に置き換え、
`src/lib/amplify-mock/` と `src/mocks/` を外してください。Provider とフックは変更不要です。

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
| `/session` | `src/app/session/page.tsx` | 認証状態の実験と計測 |
| （404） | `src/app/not-found.tsx` | 見つからないページ |

## ディレクトリ

```
src/
├── app/
│   ├── layout.tsx              # フォント・メタデータ・ヘッダー/フッター・SWR 設定
│   ├── globals.css             # Tailwind v4 のテーマトークン
│   ├── page.tsx / about / products / not-found
├── components/
│   ├── site-header.tsx         # "use client"（usePathname でアクティブ表示）
│   ├── site-footer.tsx
│   ├── product-card.tsx        # Server Component
│   └── product-list.tsx        # "use client"（zustand + SWR）
├── hooks/
│   ├── use-auth-session.ts     # 認証状態の取得口（useCurrentUser も同居）
│   ├── use-debounced-value.ts
│   └── use-mocks-ready.ts      # Service Worker の起動待ち
├── lib/
│   ├── amplify-mock/           # aws-amplify/auth の代役
│   ├── api-client.ts           # axios インスタンスとエラーメッセージ変換
│   └── fetcher.ts              # SWR の既定フェッチャー
├── mocks/
│   ├── handlers/               # products / auth
│   ├── users.ts                # モックのユーザープール
│   ├── fake-jwt.ts             # 署名なし JWT の発行
│   ├── browser.ts              # setupWorker
│   └── enable-mocking.ts       # 起動は一度だけ
├── providers/
│   ├── auth-session-provider.tsx  # ページ単位のキャッシュ境界
│   └── swr-provider.tsx        # SWRConfig（fetcher / keepPreviousData）
├── stores/
│   ├── auth-probe-store.ts     # 実験の計測（認証本体には無関係）
│   └── product-filter-store.ts # zustand + SWR キーの組み立て
├── types/
│   └── product.ts              # 型・定数（アプリ側が参照するのはここ）
└── data/
    └── products.ts             # サンプルデータ（MSW と トップのみが読む）
```

## 開発

```bash
npm run dev     # http://localhost:3000
npm run build   # 本番ビルド（4 ルートすべて静的プリレンダリング）
npm run lint
```

## デザイントークン

色と書体は `src/app/globals.css` の `@theme` に集約しています。
`paper` / `ink` / `graphite` / `rule` / `blueprint` / `brass` の 6 色と、
本文用 Archivo（日本語は OS の標準ゴシックにフォールバック）、
仕様表示用 IBM Plex Mono の 2 書体です。
