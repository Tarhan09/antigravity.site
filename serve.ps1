# VaultSpace — PowerShell HTTP Server
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1

$port    = 8765
$rootDir = $PSScriptRoot
$prefix  = "http://*:$port/"

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.webp' = 'image/webp'
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "🚀 VaultSpace sunucusu çalışıyor: $prefix" -ForegroundColor Green
Write-Host "   Durdurmak için Ctrl+C basin." -ForegroundColor DarkGray

try {
    while ($listener.IsListening) {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response

        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq '/' -or $urlPath -eq '') { $urlPath = '/index.html' }

        $filePath = Join-Path $rootDir ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext     = [System.IO.Path]::GetExtension($filePath)
            $ct      = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
            $bytes   = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType   = $ct
            $resp.ContentLength64 = $bytes.Length
            $resp.StatusCode    = 200
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $resp.StatusCode = 404
            $body = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $resp.OutputStream.Write($body, 0, $body.Length)
        }
        $resp.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
