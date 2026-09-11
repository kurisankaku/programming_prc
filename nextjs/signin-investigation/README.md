# 工具 Kōgu — Next.js サンプル SPA

Next.js の App Router 標準構成で作った 3 ページのサンプルです。
架空の道具屋のカタログサイトを題材にしています。

## 構成

| 項目 | 内容 |
| --- | --- |
| Next.js | 16.3.5（App Router / Turbopack） |
| React | 19.2.8 |
| TypeScript | 5 系（strict） |
| Tailwind CSS | 4 系（`@theme` でトークン定義） |
| Lint | ESLint 9 + `eslint-config-next` |

`create-next-app` の既定構成そのままです。`next.config.ts` は空のまま変更していません。
ページ遷移は `next/link` によるクライアントサイド遷移、フィルタ等の状態は
`"use client"` のコンポーネントが持ちます。

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
│   ├── layout.tsx          # フォント・メタデータ・ヘッダー/フッター
│   ├── globals.css         # Tailwind v4 のテーマトークン
│   ├── page.tsx
│   ├── products/page.tsx
│   ├── about/page.tsx
│   └── not-found.tsx
├── components/
│   ├── site-header.tsx     # "use client"（usePathname でアクティブ表示）
│   ├── site-footer.tsx
│   ├── product-card.tsx    # サーバーコンポーネント
│   └── product-list.tsx    # "use client"（検索・絞り込みの状態）
└── data/
    └── products.ts         # サンプルデータと型
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
