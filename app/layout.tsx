import type { Metadata } from "next";
import "@fontsource/yusei-magic/400.css";
import "@fontsource/yusei-magic/japanese-400.css";
import "@fontsource/hachi-maru-pop/400.css";
import "@fontsource/hachi-maru-pop/japanese-400.css";
import "@fontsource/gaegu/700.css";
import "@fontsource/gaegu/korean-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "韓国ごはん スケッチブック | 한식 스케치북",
  description: "クレヨンで描いた韓国料理の物語。スクロールでページをめくる GSAP アニメーションの練習サイト。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-hand antialiased">{children}</body>
    </html>
  );
}
