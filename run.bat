@echo off
setlocal
echo ===================================================
echo     IKS Manuscript Management - Runner
echo ===================================================

:: Setup directories
set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend
set ENV_LOCAL=%FRONTEND_DIR%\.env.local
set ENV_DISABLED=%FRONTEND_DIR%\.env.local.disabled

echo.
echo Select Environment:
echo [1] Production (Uses .env - api.ikskochi.org)
echo [2] Testing (Uses .env.local - localhost)
echo.
set /p CHOICE="Enter selection (1 or 2): "

if "%CHOICE%"=="1" (
    echo.
    echo Setting up for PRODUCTION...
    if exist "%ENV_LOCAL%" (
        echo Disabling .env.local to use .env defaults...
        move /y "%ENV_LOCAL%" "%ENV_DISABLED%" >nul
    ) else (
        echo .env.local already disabled or missing. Using .env defaults.
    )
) else if "%CHOICE%"=="2" (
    echo.
    echo Setting up for TESTING...
    if exist "%ENV_DISABLED%" (
        echo Enabling .env.local...
        move /y "%ENV_DISABLED%" "%ENV_LOCAL%" >nul
    )
    if not exist "%ENV_LOCAL%" (
        echo [WARNING] .env.local not found! Creating default for localhost...
        echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > "%ENV_LOCAL%"
    )
) else (
    echo Invalid selection. Exiting.
    pause
    exit /b 1
)

echo.
echo [1/4] Install Dependencies & Build Backend...
cd "%BACKEND_DIR%"
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Install Dependencies & Build Frontend...
cd "%FRONTEND_DIR%"
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Starting Services...
echo.

:: Start Backend (in a new window) on port 5000
echo Starting Backend on Port 5000...
start "IKS Backend (Port 5000)" cmd /k "cd "%BACKEND_DIR%" && npm run start"

:: Wait a moment for backend to initialize
timeout /t 5 >nul

:: Start Frontend (in a new window) on port 3000
echo Starting Frontend on Port 3000...
start "IKS Frontend (Port 3000)" cmd /k "cd "%FRONTEND_DIR%" && npm run start"

echo.
echo ===================================================
echo   System Running!
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.
echo   Close the opened windows to stop the servers.
echo ===================================================
pause
