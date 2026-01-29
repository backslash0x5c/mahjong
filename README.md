# 麻雀理牌ゲーム PWA版

モバイルアプリとして動作する麻雀牌ソートゲームです。\\
[Play Now](https://backslash0x5c.github.io/mahjong/)

## 特徴

- 📱 モバイル最適化（タッチ操作対応）
- 🖱️ デスクトップ対応（マウスドラッグ＆ドロップ）
- 🎮 Progressive Web App（PWA）
- 📴 オフライン対応
- 🏠 ホーム画面に追加可能
- 🎨 レスポンシブデザイン
- 💾 ゲーム結果の自動保存（localStorage）
- 📊 プレイ履歴・統計情報の表示
- 🔗 SNSシェア機能（Twitter/X, LINE）
- 🖼️ 実際の麻雀牌画像を使用

## ファイル構成

```
mahjong/
├── index.html           # メインHTMLファイル
├── style.css            # スタイルシート
├── app.js              # ゲームロジック
├── manifest.json       # PWAマニフェスト
├── service-worker.js   # Service Worker（オフライン対応）
├── generate_tiles.py   # SVG画像生成スクリプト（参考用）
├── icon-192.png        # アプリアイコン 192x192（要作成）
├── icon-512.png        # アプリアイコン 512x512（要作成）
└── image/              # 麻雀牌画像ディレクトリ
    ├── man1-9.png      # 萬子 1-9
    ├── pin1-9.png      # 筒子 1-9
    ├── sou1-9.png      # 索子 1-9
    └── ji1-7.png       # 字牌 1-7（東南西北白發中）
```

## ローカルでのテスト方法

### 方法1: Python HTTPサーバー

```bash
cd /home/user/mahjong
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く

### 方法2: Node.js http-server

```bash
npx http-server -p 8000
```

### 方法3: PHP内蔵サーバー

```bash
php -S localhost:8000
```

## モバイルでのテスト

1. ローカルサーバーを起動
2. 同じネットワーク上のモバイルデバイスから `http://[PCのIPアドレス]:8000` にアクセス
3. Chromeの場合、設定メニューから「ホーム画面に追加」を選択してPWAとしてインストール可能

## デプロイ方法

### GitHub Pagesでのデプロイ（推奨）

1. GitHubリポジトリにプッシュ
2. Settings → Pages → Source で `main` ブランチを選択
3. `https://[username].github.io/mahjong/` でアクセス可能

### Netlifyでのデプロイ

1. [Netlify](https://netlify.com)にログイン
2. 「New site from Git」を選択
3. リポジトリを接続
4. デプロイ完了後、URLが発行される

### Vercelでのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. 「Import Project」を選択
3. リポジトリを接続
4. デプロイ完了後、URLが発行される

## アイコン画像の作成

PWAとして完全に機能させるには、以下のアイコンが必要です：

- `icon-192.png` (192x192ピクセル)
- `icon-512.png` (512x512ピクセル)

### アイコン作成方法

1. **オンラインツール**: [favicon.io](https://favicon.io) や [realfavicongenerator.net](https://realfavicongenerator.net)
2. **デザインツール**: Figma, Canva, Photoshopなど
3. **テキストベース**: 麻雀牌の絵文字（🀄）を使用した簡単なアイコン

### 一時的なアイコン作成スクリプト

HTMLで麻雀牌絵文字を使った簡単なアイコンを作成する場合：

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;background:#2c5f2d;display:flex;align-items:center;justify-content:center;width:512px;height:512px;">
    <div style="font-size:300px;">🀄</div>
</body>
</html>
```

ブラウザでこのHTMLを開き、スクリーンショットを撮ってリサイズすることで簡易的なアイコンを作成できます。

## ゲームの遊び方

### 基本ルール

1. 「ゲーム開始」ボタンをクリック/タップ
2. ランダムに配られた13枚の麻雀牌が表示される
3. 牌をドラッグ＆ドロップで並び替え
   - **デスクトップ**: マウスでドラッグ＆ドロップ
   - **モバイル**: タッチでドラッグ＆ドロップ
   - ドロップ位置は黄色い縦線で表示
4. 同じ種類の牌をまとめて、各グループ内を数字順に並べる
5. 牌種の順序は自由（萬子→筒子→索子→字牌の順でなくてもOK）
6. 完成すると自動的に結果画面に遷移
7. スコア = 手数 × 時間（秒）で評価（低いほど優秀）

### 履歴・統計機能

- スタート画面の「履歴を見る」ボタンから過去のプレイ記録を確認
- 総プレイ回数、ベストスコア、平均手数・時間を表示
- 最大50件の履歴を自動保存

### SNSシェア

- 結果画面の「結果をシェア」ボタンで成績をシェア
- モバイル: Web Share API（各種SNSアプリに対応）
- デスクトップ: Twitter/Xの投稿画面を開く

## ブラウザ対応

- Chrome/Edge (推奨)
- Safari (iOS 11.3+)
- Firefox
- Samsung Internet

## クレジット

### 麻雀牌画像

このゲームで使用している麻雀牌の画像は、[麻雀豆腐](https://majandofu.com/)様から提供いただいたものを使用しています。

- 萬子（マンズ）1-9
- 筒子（ピンズ）1-9
- 索子（ソーズ）1-9
- 字牌（ジハイ）東南西北白發中

画像の利用に際しては、麻雀豆腐様の利用規約に従っています。

## ライセンス

MIT License

**注意**: 麻雀牌画像は麻雀豆腐様に著作権があります。画像を再利用する場合は、麻雀豆腐様の利用規約をご確認ください。
