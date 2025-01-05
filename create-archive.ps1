# 定义要压缩的文件和文件夹名称
$filesToZip = @(
    "doc",
    "dist",
    "i18n",
    "node_modules",
    "package.json",
    "static",
    "source",
    "README.md",
    "README-CN.md",
    "README.zh.md",
    "README.en.md",
    "logo.jpg"
)

# 定义压缩文件的名称
$zipFileName = "web-zip-bundle.zip"

# 创建临时文件夹
$tempFolder = Join-Path -Path $env:TEMP -ChildPath ([System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# 复制要压缩的文件和文件夹到临时文件夹
foreach ($item in $filesToZip) {
    if (Test-Path $item) {
        $destination = Join-Path -Path $tempFolder -ChildPath $item
        if ((Get-Item $item).PsIsContainer) {
            Copy-Item -Path $item -Destination $destination -Recurse
        } else {
            $destDir = Split-Path -Path $destination
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir | Out-Null
            }
            Copy-Item -Path $item -Destination $destination
        }
    } else {
        Write-Host "Can't find the：$item"
    }
}

# # 压缩临时文件夹中的内容
# Compress-Archive -Path (Join-Path $tempFolder '*') -DestinationPath $zipFileName -Force

# 使用 7-Zip 壓縮臨時文件夾中的內容
$7zipPath = "C:\Program Files\7-Zip\7z.exe" # 7-Zip 的安裝路徑
if (Test-Path $7zipPath) {
    & $7zipPath a -tzip $zipFileName "$tempFolder\*" -mx=9 -mmt -r | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Compressed Complete!: $zipFileName"
    } else {
        Write-Host "Compressed Failed, Error Code: $LASTEXITCODE"
    }
}

# 删除临时文件夹
Remove-Item -Path $tempFolder -Recurse -Force

Write-Host "Mission Complete: $zipFileName"