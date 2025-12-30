# Windows + WSL 設定ガイド

## スマホからWSLサーバーにアクセスする方法

WSL2では、デフォルト設定では外部デバイス（スマホなど）からWSLのIPアドレスに直接アクセスできません。
以下のいずれかの方法で設定してください。

## 方法1: WSL2のネットワークモードを変更（推奨）

WSL2のネットワークを「ミラーモード」に変更すると、Windowsホストと同じIPアドレスを使用できるようになります。

### 手順

1. **Windowsホームディレクトリに `.wslconfig` ファイルを作成・編集**
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

4. **WindowsホストのIPアドレスを確認**
   ```powershell
   ipconfig
   ```
   - `イーサネット アダプター` または `Wi-Fi アダプター` の `IPv4 アドレス` を確認
   - 例: `192.168.1.100`

5. **クライアント側の設定を確認**
   - サーバー起動時に表示されるIPアドレスがWindowsホストのIPアドレスになります
   - QRコードに表示されるURLも自動的に更新されます

### メリット
- 設定が簡単
- WindowsホストのIPアドレスを使用するため、スマホから直接アクセス可能
- ファイアウォール設定が不要な場合が多い

### デメリット
- WSL2の再起動が必要
- 一部のネットワーク設定が変更される可能性がある

---

## 方法2: Windows側でポートフォワーディングを設定

WSLのIPアドレスをそのまま使用したい場合、Windows側でポートフォワーディングを設定します。

### 手順

1. **WSLのIPアドレスを確認**
   ```bash
   # WSL内で実行
   ip addr show eth0 | grep "inet "
   ```
   - 例: `172.19.71.27`

2. **PowerShellを管理者権限で開く**

3. **ポートフォワーディングを設定**
   ```powershell
   # クライアント用ポート（5173）のフォワーディング
   netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=172.19.71.27

   # サーバー用ポート（3000）のフォワーディング
   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.19.71.27
   ```

4. **Windowsファイアウォールでポートを開放**
   ```powershell
   # クライアント用ポート
   New-NetFirewallRule -DisplayName "WSL Client Port" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

   # サーバー用ポート
   New-NetFirewallRule -DisplayName "WSL Server Port" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

5. **設定を確認**
   ```powershell
   netsh interface portproxy show all
   ```

6. **WindowsホストのIPアドレスを確認**
   ```powershell
   ipconfig
   ```
   - このIPアドレス（例: `192.168.1.100`）でスマホからアクセス

### ポートフォワーディングの削除（必要に応じて）
```powershell
# すべてのポートフォワーディングを削除
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
```

### メリット
- WSLの再起動が不要
- 既存のWSL設定を変更しない

### デメリット
- WSLのIPアドレスが変更された場合、再設定が必要
- ファイアウォール設定が必要

---

## 方法3: Windowsファイアウォールのみ設定（方法1使用時）

`.wslconfig` で `networkingMode=mirrored` を設定した場合でも、ファイアウォールでブロックされる場合があります。

### 手順

1. **Windowsセキュリティを開く**
   - 設定 > プライバシーとセキュリティ > Windowsセキュリティ > ファイアウォールとネットワーク保護

2. **詳細設定を開く**
   - 「詳細設定」をクリック

3. **受信の規則を追加**
   - 「受信の規則」> 「新しい規則」
   - 「ポート」を選択 > 「次へ」
   - 「TCP」を選択、特定のローカルポート: `5173,3000` > 「次へ」
   - 「接続を許可する」> 「次へ」
   - すべてのプロファイルにチェック > 「次へ」
   - 名前: 「WSL Game Server」> 「完了」

または、PowerShellで実行:
```powershell
New-NetFirewallRule -DisplayName "WSL Game Server" -Direction Inbound -LocalPort 5173,3000 -Protocol TCP -Action Allow
```

---

## 動作確認

### 1. サーバーとクライアントを起動
```bash
pnpm dev
```

### 2. サーバー起動時のログを確認
```
Server running on port 3000
WSL IP Address: 172.19.71.27  (または Windows IP: 192.168.1.100)
Client URL: http://172.19.71.27:5173  (または http://192.168.1.100:5173)
```

### 3. PCのブラウザで確認
- `http://localhost:5173` にアクセス
- ホーム画面が表示され、QRコードとIPアドレスが表示されることを確認

### 4. スマホから確認
- スマホとPCが同じWi-Fiネットワークに接続されていることを確認
- スマホのブラウザで `http://<表示されたIPアドレス>:5173` にアクセス
- または、QRコードを読み取ってアクセス

### 5. 接続エラーが発生する場合
- Windowsファイアウォールの設定を確認
- 同じWi-Fiネットワークに接続されているか確認
- ルーターの設定でポートがブロックされていないか確認

---

## トラブルシューティング

### WSLのIPアドレスが取得できない
```bash
# WSL内で実行
ip addr show eth0
```
- `inet` で始まる行のIPアドレスを確認

### ポートが使用中
```bash
# WSL内で実行
ss -tlnp | grep 3000
ss -tlnp | grep 5173
```

### WindowsホストのIPアドレスを確認
```powershell
# PowerShellで実行
ipconfig | findstr IPv4
```

### 接続テスト
```bash
# スマホからアクセスできない場合、PCのブラウザで直接IPアドレスにアクセスしてテスト
# 例: http://192.168.1.100:5173
```

---

## 推奨設定

**開発環境**: 方法1（`.wslconfig` で `networkingMode=mirrored`）を推奨
- 設定が簡単
- 自動的にWindowsホストのIPアドレスを使用
- ファイアウォール設定のみで対応可能

**本番環境**: 適切なネットワーク設定とセキュリティ設定を実施

