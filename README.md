This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Pages で公開する

main ブランチに push すると、GitHub Actions（.github/workflows/deploy.yml）が静的書き出し（out/）を GitHub Pages に公開します。

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする（最初の1回だけ）
2. main に push する（または Actions タブから **Deploy Next.js site to Pages** を手動実行）
3. 公開URLは https://<ユーザー名>.github.io/<リポジトリ名>/ （Actions の deploy ジョブにも表示される）

- 無料で使えるのは公開（Public）リポジトリ。非公開リポジトリは有料プランが必要
- basePath は actions/configure-pages がリポジトリ名から決め、環境変数 PAGES_BASE_PATH で next.config.ts に渡す
- ローカル確認：npm run dev。公開と同じ形で確認するなら PAGES_BASE_PATH=/<リポジトリ名> npm run build のあと out/ を /<リポジトリ名>/ 配下で配信する
- 社内ネットワークで npm が証明書エラーになる場合は、NODE_OPTIONS=--use-system-ca を付けて実行する
