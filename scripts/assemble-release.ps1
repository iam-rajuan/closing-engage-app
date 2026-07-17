$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mappedDrive = 'X:'
$mappedProjectRoot = "${mappedDrive}\"
$mapped = $false

try {
  if ($env:ALLOW_DEBUG_RELEASE_SIGNING -ne '1') {
    throw "assemble-release.ps1 is for local testing only. The generated Android release configuration still uses the debug keystore. Use EAS Build for production, or rerun with ALLOW_DEBUG_RELEASE_SIGNING=1 to acknowledge a non-production test build."
  }

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
