@echo off
setlocal

cd /d "%~dp0"

set "ROOT=%~dp0"
set "PYTHON=%ROOT%.venv\Scripts\python.exe"
set "COREPACK=%ProgramFiles%\nodejs\corepack.cmd"

if not exist "%COREPACK%" (
    echo ERROR: Node.js with Corepack is required.
    echo Install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "%PYTHON%" (
    echo Creating BannerOS Python environment...
    python -m venv "%ROOT%.venv"
    if errorlevel 1 (
        echo ERROR: Python 3.11+ is required.
        pause
        exit /b 1
    )
)

"%PYTHON%" -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo Installing API dependencies...
    "%PYTHON%" -m pip install -r "%ROOT%apps\api\requirements.txt"
    if errorlevel 1 (
        echo ERROR: Could not install API dependencies.
        pause
        exit /b 1
    )
)

echo Installing/checking frontend dependencies...
call "%COREPACK%" pnpm install --frozen-lockfile
if errorlevel 1 (
    echo ERROR: Node.js and Corepack are required.
    pause
    exit /b 1
)

echo Starting BannerOS API...
start "BannerOS API" /D "%ROOT%" "%PYTHON%" -m uvicorn apps.api.main:app --reload --port 8000

echo Starting BannerOS Desktop...
start "BannerOS Desktop" /D "%ROOT%" cmd /k "call "%COREPACK%" pnpm --dir apps/desktop dev"

echo.
echo BannerOS services started.
echo API:     http://127.0.0.1:8000/health
echo Desktop: http://127.0.0.1:5173
echo.
pause
