# Local OX Game (Tic-Tac-Toe)

ローカルネットワーク内で対戦可能なリアルタイム○×ゲーム（三目並べ）です。
PCでルームを作成し、QRコードを読み取ることでスマホから参加できます。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 特徴

- **リアルタイム対戦**: Socket.ioを使用した低遅延な同期
- **簡単接続**: QRコードを読み取るだけでルーム参加（アプリインストール不要）
- **観戦モード**: ホストPC（ルーム作成者）は観戦者としてゲーム進行を表示可能
- **クロスプラットフォーム**: PCブラウザとスマホブラウザで動作

## 技術スタック

- **Monorepo**: pnpm workspaces
- **Client**: React, Vite, Tailwind CSS v3
- **Server**: Node.js, Socket.io, TypeScript
- **Shared**: 共通型定義・ロジック

## 開発環境のセットアップ

### 前提条件

- Node.js (v18以上)
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 共通モジュールのビルド
pnpm --filter @local-ox-game/shared run build
```

### 起動

```bash
pnpm dev
```
- Client: http://localhost:5173
- Server: http://localhost:3000

## 遊び方

1. **PC**: `http://localhost:5173` を開き、「Enter Room as Host」をクリックします。
2. **スマホ**: PC画面に表示されたQRコードを読み取ります（またはIPアドレスにアクセス）。
3. **スマホ**: 表示されたルームIDを入力して「Join」します。
4. 2人参加するとゲームが開始されます。

## WSL2での使用について

Windows (WSL2) 環境でホストする場合、スマホからアクセスするにはネットワーク設定が必要です。

### 設定手順

1. **Windowsホームディレクトリに `.wslconfig` ファイルを作成**
   - パス: `C:\Users\<ユーザー名>\.wslconfig`
   - ファイルが存在しない場合は新規作成

2. **以下の内容を記述**
   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

3. **WSLを再起動**
   ```powershell
   # PowerShellを管理者権限で実行
   wsl --shutdown
   wsl
   ```

4. **WindowsホストのIPアドレスを確認（必要に応じて）**
   ```powershell
   ipconfig
   ```
   - `イーサネット アダプター` または `Wi-Fi アダプター` の `IPv4 アドレス` を確認
   - サーバー起動時に表示されるIPアドレスがWindowsホストのIPアドレスになります

5. **ファイアウォールでポートを開放（必要に応じて）**
   ```powershell
   # PowerShellを管理者権限で実行
   New-NetFirewallRule -DisplayName "WSL Game Server" -Direction Inbound -LocalPort 5173,3000 -Protocol TCP -Action Allow
   ```

これで、スマホからWindowsホストのIPアドレスでアクセスできるようになります。

### トラブルシューティング

- **接続できない場合**: 同じWi-Fiネットワークに接続されているか確認してください
- **ファイアウォールでブロックされる場合**: 上記の手順5でポートを開放してください

## ライセンス

MIT
