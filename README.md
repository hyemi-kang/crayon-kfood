# 韓国ごはん スケッチブック（food-ad）

韓国料理を紹介する、GSAP アニメーションの練習用サイトです。サイト全体が 1 冊のクレヨン画のスケッチブックになっていて、スクロールでページがめくれ、絵が描き進みます。

- 表紙 → ビビンバ → トッポッキ → サムギョプサル → おえかき診断 → ご連絡
- おえかき診断: クレヨンで絵を描くと、色・形・味のキーワードから近い韓国料理を提案（端末内で判定。外部には送信しません）
- ご連絡: 送信すると紙を破って折り、紙飛行機にして飛ばす演出（入力内容は送信・保存しません）

> 練習用サイトです。ご連絡フォームには本物の個人情報を入力しないでください。

## 技術スタック

Next.js 16（App Router）/ React 19 / TypeScript / Tailwind CSS v4 / GSAP（ScrollTrigger・DrawSVG・MorphSVG・MotionPath・SplitText）/ Lenis / perfect-freehand

## 開発

```bash
# 社内ネットワークで npm が証明書エラーになる場合は先に設定
export NODE_OPTIONS=--use-system-ca   # PowerShell: $env:NODE_OPTIONS="--use-system-ca"

npm ci
npm run dev      # http://localhost:3000
npm run lint
npm run build    # 静的書き出し → out/
```

## ドキュメント

| ファイル | 内容 |
|---|---|
| [docs/01_要件定義書.md](docs/01_要件定義書.md) | 目的、機能要件、非機能要件、個人情報の扱い |
| [docs/02_画面仕様書.md](docs/02_画面仕様書.md) | 画面構成、スクロール挙動、各ページの仕様 |
| [docs/03_技術仕様書.md](docs/03_技術仕様書.md) | 技術スタック、構成、設計方針 |
| [docs/04_開発環境・運用手順書.md](docs/04_開発環境・運用手順書.md) | セットアップ、公開手順、確認項目 |
| [docs/05_データ定義書.md](docs/05_データ定義書.md) | 色パレット、味キーワード、料理 14 種、スコア計算 |
| [docs/06_アニメーション設計書.md](docs/06_アニメーション設計書.md) | タイムライン構成、プラグイン、送信演出 |

## GitHub Pages で公開する

main ブランチに push すると、GitHub Actions（`.github/workflows/deploy.yml`）が静的書き出し（`out/`）を GitHub Pages に公開します。

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする（最初の 1 回だけ）
2. main に push する（または Actions タブから **Deploy Next.js site to Pages** を手動実行）
3. 公開 URL は `https://<ユーザー名>.github.io/<リポジトリ名>/`（Actions の deploy ジョブにも表示されます）

- 無料で使えるのは公開（Public）リポジトリです。非公開リポジトリは有料プランが必要です
- basePath は `actions/configure-pages` がリポジトリ名から決め、環境変数 `PAGES_BASE_PATH` で `next.config.ts` に渡します
- 公開と同じ形での確認: `PAGES_BASE_PATH=/<リポジトリ名> npm run build` のあと、`out/` を `/<リポジトリ名>/` 配下で配信します
