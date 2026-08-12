# 資産形成シミュレーター

通貨・開始日が異なる複数の投資を自由に追加し、複利計算による将来の資産推移をまとめてグラフと数値で試算するWebアプリ。

**対象ユーザー**：投資はしているが将来が不安な人、難しい知識なしに簡単に試算・可視化したい人、海外の投資をしている人（外貨建て投資を含めて資産全体を把握したい層）。

Section 1-0 課題2（1つ目のToDoリストWebアプリとはテーマ・用途を変えたオリジナルアプリ）として開発。詳細な要件定義は [docs/requirements.md](docs/requirements.md)、開発の進め方・作業ログは [docs/progress-log.md](docs/progress-log.md) を参照。

## 技術スタック

- Next.js (App Router, TypeScript)
- Tailwind CSS v4
- Recharts（グラフ表示）

## セットアップ

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと確認できます。

## ビルド

```bash
npm run build
```

## デプロイ

Vercelにデプロイ済み: https://asset-growth-simulator-mu.vercel.app
`master`ブランチへのpushで自動再デプロイされる。
