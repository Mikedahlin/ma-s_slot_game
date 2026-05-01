param(
  [string]$OutputPath = ".lock/manifest.json"
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

function Normalize-RelPath {
  param([string]$AbsolutePath)
  $rel = Resolve-Path -Relative $AbsolutePath
  $rel = $rel -replace '^[./\\]+',''
  return ($rel -replace '\\','/')
}

$protectedRoots = @(
  "backend/src",
  "frontend/app",
  "frontend/components",
  "frontend/public"
)

$protectedFiles = @(
  "backend/package.json",
  "backend/tsconfig.json",
  "backend/.env.example",
  "frontend/package.json",
  "frontend/tsconfig.json",
  "frontend/next-env.d.ts"
)

$allFiles = New-Object System.Collections.Generic.List[System.IO.FileInfo]

foreach ($root in $protectedRoots) {
  if (Test-Path $root) {
    Get-ChildItem -Path $root -Recurse -File | ForEach-Object { [void]$allFiles.Add($_) }
  }
}

foreach ($file in $protectedFiles) {
  if (Test-Path $file) {
    [void]$allFiles.Add((Get-Item $file))
  }
}

$uniqueFiles = $allFiles |
  Sort-Object FullName -Unique |
  Sort-Object FullName

$manifestEntries = foreach ($file in $uniqueFiles) {
  $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash.ToLower()
  [PSCustomObject]@{
    path = Normalize-RelPath -AbsolutePath $file.FullName
    sha256 = $hash
    size = [int64]$file.Length
  }
}

$manifest = [PSCustomObject]@{
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  totalFiles = $manifestEntries.Count
  protectedRoots = $protectedRoots
  entries = $manifestEntries
}

$outputAbsolute = Join-Path $repoRoot $OutputPath
$outputDir = Split-Path -Parent $outputAbsolute
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $outputAbsolute -Encoding utf8
Write-Output "Lock manifest created: $outputAbsolute"
