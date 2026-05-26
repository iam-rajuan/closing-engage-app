$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mappedDrive = 'X:'
$mappedProjectRoot = "${mappedDrive}\"
$mapped = $false

try {
  $existingMapping = (cmd /c subst) -match "^${mappedDrive}\\s*=>"
  if ($existingMapping) {
    throw "Drive $mappedDrive is already mapped."
  }

  cmd /c subst $mappedDrive $projectRoot | Out-Null
  $mapped = $true
  Set-Location (Join-Path $mappedProjectRoot 'android')

  $env:NODE_ENV = 'production'
  & .\gradlew.bat assembleRelease
  exit $LASTEXITCODE
} finally {
  if ($mapped) {
    Set-Location $projectRoot
    cmd /c subst $mappedDrive /D | Out-Null
  }
}
