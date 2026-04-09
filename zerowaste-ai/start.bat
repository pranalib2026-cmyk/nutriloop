@echo off
setlocal
title ZeroWaste AI — Startup
color 0A

echo.
echo  =========================================
echo    ZeroWaste AI — Starting Application
echo  =========================================
echo.

:: ── 1. Check Node.js ──
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do echo  [OK] Node.js version: %%v

:: ── 2. Check .env files ──
if not exist "server\.env" (
    color 0E
    echo  [WARN] server\.env is missing!
    echo  Copy server\.env.example to server\.env and fill in your values.
    pause
    exit /b 1
)

if not exist "client\.env" (
    color 0E
    echo  [WARN] client\.env is missing!
    echo  Copy client\.env.example to client\.env and fill in your values.
    pause
    exit /b 1
)

echo  [OK] Environment files found

:: ── 3. Check node_modules ──
if not exist "node_modules" (
    echo  [INFO] Root node_modules missing. Running npm install...
    call npm install
)

if not exist "server\node_modules" (
    echo  [INFO] Server node_modules missing. Running npm install...
    cd server && call npm install && cd ..
)

if not exist "client\node_modules" (
    echo  [INFO] Client node_modules missing. Running npm install...
    cd client && call npm install && cd ..
)

echo  [OK] All dependencies installed

:: ── 4. Start everything ──
echo.
echo  Starting services...
echo    Backend  → http://localhost:5000
echo    Frontend → http://localhost:5173
echo.
echo  Press Ctrl+C to stop all services.
echo  =========================================
echo.

call npm run dev

endlocal
