$port = 5500
$root = (Get-Location).Path

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Serving $root at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
    }

    $filePath = Join-Path $root $requestPath

    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $extension = [System.IO.Path]::GetExtension($filePath)

        if ($mimeTypes.ContainsKey($extension)) {
            $context.Response.ContentType = $mimeTypes[$extension]
        } else {
            $context.Response.ContentType = "application/octet-stream"
        }

        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
        $message = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $context.Response.OutputStream.Write($message, 0, $message.Length)
    }

    $context.Response.OutputStream.Close()
}