$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$androidRoot = Join-Path $projectRoot 'android'

function Remove-DirectoryIfPresent {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path
  )

  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
    Write-Host "Removed $Path"
  }
}

Push-Location $androidRoot
try {
  & .\gradlew --stop | Out-Host
} catch {
  Write-Warning "Failed to stop Gradle daemons: $($_.Exception.Message)"
} finally {
  Pop-Location
}

$projectPattern = [Regex]::Escape($projectRoot)
$processes = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq 'node.exe' -and $_.CommandLine -match $projectPattern
}

foreach ($process in $processes) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
    Write-Host "Stopped node PID=$($process.ProcessId)"
  } catch {
    Write-Warning "Failed to stop PID=$($process.ProcessId): $($_.Exception.Message)"
  }
}

$pathsToRemove = @(
  (Join-Path $projectRoot 'android\build'),
  (Join-Path $projectRoot 'android\app\build'),
  (Join-Path $projectRoot 'android\app\.cxx')
)

$androidArtifacts = Get-ChildItem (Join-Path $projectRoot 'node_modules') -Directory -Recurse -ErrorAction SilentlyContinue |
  Where-Object {
    (($_.Name -eq 'build' -or $_.Name -eq '.cxx') -and $_.Parent.Name -eq 'android') -or
    ($_.Name -eq 'build' -and $_.FullName -match '\\(expo-gradle-plugin|gradle-plugin)\\')
  } |
  Select-Object -ExpandProperty FullName

$pathsToRemove += $androidArtifacts

foreach ($path in $pathsToRemove | Sort-Object -Unique) {
  try {
    Remove-DirectoryIfPresent -Path $path
  } catch {
    Write-Warning "Failed to remove ${path}: $($_.Exception.Message)"
  }
}
