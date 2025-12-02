# OGP画像について

このフォルダには、SNSプレビュー用のOGP画像を配置してください。

## 必要なファイル

- **ogp.png** (1200x630推奨)
  - SNS（Twitter、LINE、Discordなど）でURLを共有した際に表示される画像

## OGP画像の生成方法

### 方法1: generate-ogp.html を使用（推奨）

1. `generate-ogp.html` をブラウザで開く
2. OGP画像が自動生成されます
3. 「OGP画像をダウンロード」ボタンをクリックして保存
4. ダウンロードした `ogp.png` を `public/` フォルダに配置

### 方法2: ogp.svg から変換

1. `ogp.svg` を画像編集ソフトで開く
2. 1200x630のサイズにリサイズ
3. PNG形式で保存

### 方法3: オンラインツールを使用

- [OGP画像ジェネレーター](https://og-image.vercel.app/)
- [Canva](https://www.canva.com/) などで1200x630の画像を作成

## デザイン仕様

- **サイズ**: 1200x630px（推奨）
- **背景色**: 紺色グラデーション（#0f172a → #1e293b）
- **テキスト色**: 金色（#fbbf24）とスレート100（#cbd5e1）
- **内容**:
  - タイトル: 「やさしい国家運営ゲーム」
  - サブタイトル: 「ノヴァリア王国シミュレーション」
  - メーターアイコン: 💰（物価）、👥（失業率）、🏠（生活）、💎（国庫）
  - フッター: 「教育用政策シミュレーションゲーム」

## 動作確認

OGP画像を配置したら、以下のツールで確認してください：

1. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
2. **LINE**: URLを貼り付けてプレビューを確認
3. **Discord**: URLを貼り付けてプレビューを確認
4. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/

## 注意事項

- OGP画像は公開URLからアクセス可能である必要があります
- Vercelにデプロイ後、完全なURL（`https://your-domain.vercel.app/ogp.png`）でアクセスできることを確認してください
- `index.html` の `og:url` と `og:image` は実際のデプロイURLに更新してください

