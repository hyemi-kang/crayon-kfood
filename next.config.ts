import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的書き出し（GitHub Pages で配信できるよう、ビルド結果を out/ に HTML/CSS/JS として出力する）
  output: "export",
  // プロジェクトページは https://<ユーザー名>.github.io/<リポジトリ名>/ で配信される。
  // GitHub Actions では actions/configure-pages が出力する base_path をこの環境変数で受け取る。
  // ローカル（dev / build）では未設定なので、ふつうに / で動く。
  basePath: process.env.PAGES_BASE_PATH,
};

export default nextConfig;
