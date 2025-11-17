# 麻雀理牌ゲーム PWA版

モバイルアプリとして動作する麻雀牌ソートゲームです。

## 特徴

- 📱 モバイル最適化（タッチ操作対応）
- 🎮 Progressive Web App（PWA）
- 📴 オフライン対応
- 🏠 ホーム画面に追加可能
- 🎨 レスポンシブデザイン

## ファイル構成

```
mahjong/
├── index.html           # メインHTMLファイル
├── style.css            # スタイルシート
├── app.js              # ゲームロジック
├── manifest.json       # PWAマニフェスト
├── service-worker.js   # Service Worker（オフライン対応）
├── icon-192.png        # アプリアイコン 192x192（要作成）
└── icon-512.png        # アプリアイコン 512x512（要作成）
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

1. 「ゲーム開始」ボタンをタップ
2. ランダムに配られた13枚の麻雀牌が表示される
3. 牌をタップして選択し、移動先をタップして移動
4. 同じ種類の牌をまとめて、各グループ内を数字順に並べる
5. 完成すると自動的に結果画面に遷移
6. スコア = 手数 × 時間（秒）で評価（低いほど優秀）

## ブラウザ対応

- Chrome/Edge (推奨)
- Safari (iOS 11.3+)
- Firefox
- Samsung Internet

## ライセンス

MIT License
