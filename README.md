# 資産形成シミュレーター

初期投資額・毎月の積立額・想定年利率・積立年数を入力すると、複利計算による将来の資産推移をグラフと数値で試算するWebアプリ。

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

Vercelへのデプロイを予定（未実施）。
