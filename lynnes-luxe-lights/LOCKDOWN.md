# Lockdown Mode (Codex-Proof Guardrails)

This project is frozen with an integrity manifest and optional read-only file lock.

## 1) Create/freshen trusted baseline

From project root (`lynnes-luxe-lights`):

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\create-lock-manifest.ps1
```

This writes `.lock/manifest.json` with SHA-256 hashes.

## 2) Verify no one changed protected files

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\verify-lock-manifest.ps1
```

- PASS: build is unchanged
- FAIL: shows missing/changed/new files

## 3) Hard lock files (read-only)

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lock-files.ps1
```

## 4) Unlock when you intentionally want edits

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\unlock-files.ps1
```

## Protected areas

- `backend/src`
- `frontend/app`
- `frontend/components`
- `frontend/public`
- Core config files (package/tsconfig/env example)
