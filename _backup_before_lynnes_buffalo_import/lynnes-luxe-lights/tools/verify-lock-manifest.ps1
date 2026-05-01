param(
  [string]$ManifestPath = ".lock/manifest.json"
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

function Normalize-RelPath {
  param([string]$AbsolutePath)
  $rel = Resolve-Path -Relative $AbsolutePath
  $rel = $rel -replace '^[./\\]+',''
  return ($rel -replace '\\','/')
}

if (-not (Test-Path $ManifestPath)) {
  Write-Error "Manifest not found: $ManifestPath"
  exit 1
}

$manifest = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json

$expected = @{}
foreach ($entry in $manifest.entries) {
  $expected[$entry.path] = $entry.sha256
}

$currentFiles = New-Object System.Collections.Generic.List[string]
foreach ($root in $manifest.protectedRoots) {
  if (Test-Path $root) {
    Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
      $rel = Normalize-RelPath -AbsolutePath $_.FullName
      [void]$currentFiles.Add($rel)
    }
  }
}

# include standalone protected files from manifest even if outside roots
foreach ($path in $expected.Keys) {
  if (-not ($currentFiles -contains $path) -and (Test-Path $path)) {
    [void]$currentFiles.Add($path)
  }
}

$currentSet = $currentFiles | Sort-Object -Unique

$missing = @()
$changed = @()
$newFiles = @()

foreach ($path in $expected.Keys) {
  if (-not (Test-Path $path)) {
    $missing += $path
    continue
  }

  $hash = (Get-FileHash -Path $path -Algorithm SHA256).Hash.ToLower()
  if ($hash -ne $expected[$path]) {
    $changed += $path
  }
}

foreach ($path in $currentSet) {
  if (-not $expected.ContainsKey($path)) {
    $newFiles += $path
  }
}

if ($missing.Count -eq 0 -and $changed.Count -eq 0 -and $newFiles.Count -eq 0) {
  Write-Output "Lock verify PASS: all protected files match manifest."
  exit 0
}

Write-Output "Lock verify FAIL"
if ($missing.Count -gt 0) {
  Write-Output "Missing files:"
  $missing | ForEach-Object { Write-Output " - $_" }
}
if ($changed.Count -gt 0) {
  Write-Output "Changed files:"
  $changed | ForEach-Object { Write-Output " - $_" }
}
if ($newFiles.Count -gt 0) {
  Write-Output "Unexpected new files:"
  $newFiles | ForEach-Object { Write-Output " - $_" }
}

exit 1
