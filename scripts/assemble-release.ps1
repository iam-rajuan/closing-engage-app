$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$junctionPath = 'D:\ceapp'
$createdJunction = $false

try {
  if (Test-Path -LiteralPath $junctionPath) {
    throw "Path $junctionPath is already in use."
  }

  New-Item -ItemType Junction -Path $junctionPath -Target $projectRoot | Out-Null
  $createdJunction = $true
  Set-Location (Join-Path $junctionPath 'android')

  $env:NODE_ENV = 'production'
  & .\gradlew.bat assembleRelease
  exit $LASTEXITCODE
} finally {
  if ($createdJunction -and (Test-Path -LiteralPath $junctionPath)) {
    Set-Location $projectRoot
    cmd /c rmdir $junctionPath | Out-Null
  }
}
