$ErrorActionPreference = 'Stop'

$aar = 'C:\Users\iam-rajuan\.gradle\caches\modules-2\files-2.1\com.facebook.react\react-android\0.86.0\8af60308e3dd4065fe58e0d724624439c16c031b\react-android-0.86.0-debug.aar'
$tmpRoot = 'D:\VS_CODE\1. sparktech\closing-engage\closing-engage-app\android\tmp-react-android-aar'
$tmpZip = "$tmpRoot.zip"
$transformHeader = 'C:\Users\iam-rajuan\.gradle\caches\9.3.1\transforms\e34c881ac1b85a96a13850d4b3e5bd50\workspace\transformed\react-android-0.86.0-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h'

function Patch-Header([string]$path) {
  $text = Get-Content -LiteralPath $path -Raw

  if ($text -notmatch '#include <cstdio>') {
    $text = $text.Replace("#include <array>`r`n", "#include <array>`r`n#include <cstdio>`r`n")
    $text = $text.Replace("#include <array>`n", "#include <array>`n#include <cstdio>`n")
  }

  $broken = 'return std::format("{}%", dimension.value);'
  $fixed = "char buffer[256];`r`n      std::snprintf(buffer, sizeof(buffer), `"%.9g%%`", dimension.value);`r`n      return buffer;"
  $text = $text.Replace($broken, $fixed)

  Set-Content -LiteralPath $path -Value $text -NoNewline
}

if (Test-Path $tmpRoot) {
  Remove-Item -LiteralPath $tmpRoot -Recurse -Force
}

if (Test-Path $tmpZip) {
  Remove-Item -LiteralPath $tmpZip -Force
}

Copy-Item -LiteralPath $aar -Destination $tmpZip -Force
Expand-Archive -LiteralPath $tmpZip -DestinationPath $tmpRoot -Force

$header = Join-Path $tmpRoot 'prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h'
Patch-Header $header

Remove-Item -LiteralPath $tmpZip -Force
Compress-Archive -Path (Join-Path $tmpRoot '*') -DestinationPath $tmpZip -CompressionLevel Optimal
Move-Item -LiteralPath $tmpZip -Destination $aar -Force

if (Test-Path $transformHeader) {
  Patch-Header $transformHeader
}

Write-Output 'PATCHED_REACT_ANDROID_AAR_AND_TRANSFORM'
