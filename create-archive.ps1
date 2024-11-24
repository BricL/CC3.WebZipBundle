# 定义要压缩的文件和文件夹名称
$filesToZip = @(
    "dist",
    "i18n",
    "node_modules",
    "package.json",
    "static",
    "source",
    "README.md",
    "README-CN.md",
    "README.zh.md",
    "README.en.md"
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
        Write-Host "未找到：$item"
    }
}

# 压缩临时文件夹中的内容
Compress-Archive -Path (Join-Path $tempFolder '*') -DestinationPath $zipFileName -Force

# 删除临时文件夹
Remove-Item -Path $tempFolder -Recurse -Force

Write-Host "压缩完成！压缩文件为：$zipFileName"