@echo off
title SuperCalcee
setlocal

:: Change to the project root (the folder containing this bat file)
cd /d "%~dp0"

echo.
echo ========================================
echo   SuperCalcee is starting...
echo ========================================
echo.

:: Activate Python virtual environment
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Could not activate virtual environment.
    echo Please run install.bat first to set up the application.
    echo.
    pause
    exit /b 1
)

:: Launch Python API in background (production mode — no VITE_DEV_SERVER_URL)
echo [1/2] Starting Python API...
start "" /B venv\Scripts\python.exe src_python\api.py

:: Wait for the API to initialise
timeout /t 3 /nobreak >nul

:: Launch Electron with the built dist (production mode)
echo [2/2] Launching Electron...
src_electron\node_modules\.bin\electron.cmd src_electron\main.cjs

if errorlevel 1 (
    echo.
    echo ERROR: Electron exited with an error.
    echo Check that the frontend was built (run install.bat if unsure).
    echo.
    pause
)

endlocal
