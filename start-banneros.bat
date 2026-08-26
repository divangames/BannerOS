@echo off
setlocal

cd /d "%~dp0"

echo Starting BannerOS API...
start "BannerOS API" cmd /k "python -m uvicorn apps.api.main:app --reload --port 8000"

echo Starting BannerOS Desktop...
start "BannerOS Desktop" cmd /k "pnpm --dir apps/desktop dev"

echo.
echo BannerOS services started.
echo API:     http://127.0.0.1:8000/health
echo Desktop: http://127.0.0.1:5173
echo.
pause
