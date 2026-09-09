param(
  [string]$TunnelUrl = "https://directors-image-unwrap-namely.trycloudflare.com",
  [string]$BackendUrl = "http://localhost:4000",
  [string]$CloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe",
  [string]$Workspace = "D:\ngo-donation-system1",
  [int]$IntervalSeconds = 60
)

$ErrorActionPreference = "Continue"
$tmpDir = Join-Path $Workspace "tmp"
$logPath = Join-Path $tmpDir "cloudflared-watchdog.log"
$urlPath = Join-Path $tmpDir "cloudflared-current-url.txt"
$stdoutPath = Join-Path $tmpDir "cloudflared-watchdog.stdout.log"
$stderrPath = Join-Path $tmpDir "cloudflared-watchdog.stderr.log"

New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

function Write-WatchLog {
  param([string]$Message)
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -Path $logPath -Value "[$stamp] $Message"
}

function Test-JsonHealth {
  param([string]$Url)
  try {
    $result = Invoke-RestMethod -Uri "$Url/api/health" -TimeoutSec 20
    return $result.status -eq "ok"
  } catch {
    return $false
  }
}

function Get-TunnelProcess {
  Get-Process cloudflared -ErrorAction SilentlyContinue | Select-Object -First 1
}

function Start-QuickTunnel {
  if (-not (Test-Path -LiteralPath $CloudflaredPath)) {
    Write-WatchLog "cloudflared executable missing at $CloudflaredPath"
    return $null
  }

  Write-WatchLog "Starting cloudflared quick tunnel for $BackendUrl"
  $process = Start-Process `
    -FilePath $CloudflaredPath `
    -ArgumentList @("tunnel", "--url", $BackendUrl) `
    -WorkingDirectory $Workspace `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

  $deadline = (Get-Date).AddSeconds(45)
  $newUrl = $null
  while ((Get-Date) -lt $deadline -and -not $newUrl) {
    Start-Sleep -Seconds 3
    $combined = ""
    if (Test-Path -LiteralPath $stdoutPath) { $combined += Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $stderrPath) { $combined += Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue }
    $match = [regex]::Match($combined, "https://[a-z0-9-]+\.trycloudflare\.com")
    if ($match.Success) { $newUrl = $match.Value }
  }

  if ($newUrl) {
    Set-Content -Path $urlPath -Value $newUrl
    Write-WatchLog "Tunnel is live at $newUrl"
    return $newUrl
  }

  Write-WatchLog "cloudflared started as PID $($process.Id), but no tunnel URL was detected yet"
  return $null
}

Set-Content -Path $urlPath -Value $TunnelUrl
Write-WatchLog "Watchdog started. Current tunnel: $TunnelUrl"

$failures = 0
while ($true) {
  $backendOk = Test-JsonHealth -Url $BackendUrl
  $tunnelOk = Test-JsonHealth -Url $TunnelUrl
  $process = Get-TunnelProcess

  if ($backendOk -and $tunnelOk -and $process) {
    $failures = 0
    Write-WatchLog "OK tunnel=$TunnelUrl pid=$($process.Id)"
  } else {
    $failures += 1
    $pidText = if ($process) { $process.Id } else { "none" }
    Write-WatchLog "WARN backendOk=$backendOk tunnelOk=$tunnelOk cloudflaredPid=$pidText failure=$failures"
  }

  if ($failures -ge 3) {
    $processes = Get-Process cloudflared -ErrorAction SilentlyContinue
    foreach ($p in $processes) {
      try {
        Stop-Process -Id $p.Id -Force -ErrorAction Stop
        Write-WatchLog "Stopped unhealthy cloudflared PID $($p.Id)"
      } catch {
        Write-WatchLog "Could not stop cloudflared PID $($p.Id): $($_.Exception.Message)"
      }
    }

    $replacementUrl = Start-QuickTunnel
    if ($replacementUrl) {
      $TunnelUrl = $replacementUrl
      Write-WatchLog "IMPORTANT: ClickPesa webhooks must be updated if the tunnel URL changed."
    }
    $failures = 0
  }

  Start-Sleep -Seconds $IntervalSeconds
}
