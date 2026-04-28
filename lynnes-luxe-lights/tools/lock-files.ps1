$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$paths = @(
  "backend/src",
  "frontend/app",
  "frontend/components",
  "frontend/public",
  "backend/package.json",
  "backend/tsconfig.json",
  "backend/.env.example",
  "frontend/package.json",
  "frontend/tsconfig.json",
  "frontend/next-env.d.ts"
)

$count = 0
foreach ($path in $paths) {
  if (-not (Test-Path $path)) { continue }

  $item = Get-Item $path
  if ($item.PSIsContainer) {
    Get-ChildItem -Path $path -Recurse -File | ForEach-Object {
      $_.IsReadOnly = $true
      $count++
    }
  } else {
    $item.IsReadOnly = $true
    $count++
  }
}

Write-Output "Locked $count files (read-only)."
