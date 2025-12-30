# WSL Game Server ネットワーク設定スクリプト
# PowerShellを管理者権限で実行してください

Write-Host "WSL Game Server ネットワーク設定を開始します..." -ForegroundColor Green

# ポート番号
$CLIENT_PORT = 5173
$SERVER_PORT = 3000

# 既存のポートフォワーディングを削除
Write-Host "既存のポートフォワーディングを削除中..." -ForegroundColor Yellow
netsh interface portproxy delete v4tov4 listenport=$CLIENT_PORT listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=$SERVER_PORT listenaddress=0.0.0.0 2>$null

# WSLのIPアドレスを取得
Write-Host "WSLのIPアドレスを取得中..." -ForegroundColor Yellow
$wslIp = (wsl hostname -I).Trim()
if (-not $wslIp) {
    Write-Host "エラー: WSLのIPアドレスを取得できませんでした" -ForegroundColor Red
    Write-Host "WSLが起動しているか確認してください: wsl" -ForegroundColor Yellow
    exit 1
}
Write-Host "WSL IP: $wslIp" -ForegroundColor Cyan

# ポートフォワーディングを設定
Write-Host "ポートフォワーディングを設定中..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenport=$CLIENT_PORT listenaddress=0.0.0.0 connectport=$CLIENT_PORT connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=$SERVER_PORT listenaddress=0.0.0.0 connectport=$SERVER_PORT connectaddress=$wslIp

# ファイアウォールルールを追加
Write-Host "ファイアウォールルールを追加中..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "WSL Game Server" -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "WSL Game Server" -Direction Inbound -LocalPort $CLIENT_PORT,$SERVER_PORT -Protocol TCP -Action Allow | Out-Null

# WindowsホストのIPアドレスを取得
$hostIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress

Write-Host "`n設定完了!" -ForegroundColor Green
Write-Host "WSL IP: $wslIp" -ForegroundColor Cyan
Write-Host "Windows Host IP: $hostIp" -ForegroundColor Cyan
Write-Host "`nスマホから以下のURLにアクセスしてください:" -ForegroundColor Yellow
Write-Host "http://$hostIp:$CLIENT_PORT" -ForegroundColor White
Write-Host "`nポートフォワーディング設定を確認:" -ForegroundColor Yellow
netsh interface portproxy show all

Write-Host "`n設定を削除する場合は以下を実行:" -ForegroundColor Gray
Write-Host "netsh interface portproxy delete v4tov4 listenport=$CLIENT_PORT listenaddress=0.0.0.0" -ForegroundColor Gray
Write-Host "netsh interface portproxy delete v4tov4 listenport=$SERVER_PORT listenaddress=0.0.0.0" -ForegroundColor Gray
Write-Host "Remove-NetFirewallRule -DisplayName 'WSL Game Server'" -ForegroundColor Gray
