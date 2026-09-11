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

## ページ

| ルート | ファイル | 内容 |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | トップ。ヒーロー、三つの約束、注目の道具 |
| `/products` | `src/app/products/page.tsx` | 一覧。検索・分類・在庫での絞り込み |
| `/about` | `src/app/about/page.tsx` | 工房紹介と店舗案内 |
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
│   ├── use-debounced-value.ts
│   └── use-mocks-ready.ts      # Service Worker の起動待ち
├── lib/
│   ├── api-client.ts           # axios インスタンスとエラーメッセージ変換
│   └── fetcher.ts              # SWR の既定フェッチャー
├── mocks/
│   ├── handlers.ts             # GET /api/products（絞り込みもここ）
│   ├── browser.ts              # setupWorker
│   └── enable-mocking.ts       # 起動は一度だけ
├── providers/
│   └── swr-provider.tsx        # SWRConfig（fetcher / keepPreviousData）
├── stores/
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
