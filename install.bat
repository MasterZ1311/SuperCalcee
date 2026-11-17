@echo off
setlocal enabledelayedexpansion
title SuperCalcee Installer

echo.
echo ======================================================
echo   SuperCalcee Installer
echo ======================================================
echo.

:: -------------------------------------------------------
:: [1/7] CHECK PYTHON 3.9+
:: -------------------------------------------------------
echo [1/7] Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Python is not installed or not in PATH.
    echo   Please install Python 3.9+ from: https://python.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set "PY_VER=%%v"
for /f "tokens=1,2 delims=." %%a in ("!PY_VER!") do (
    set "PY_MAJOR=%%a"
    set "PY_MINOR=%%b"
)
if !PY_MAJOR! LSS 3 (
    echo   ERROR: Python 3.9+ required. Found Python !PY_VER!
    echo   Download from: https://python.org
    pause
    exit /b 1
)
if !PY_MAJOR! EQU 3 (
    if !PY_MINOR! LSS 9 (
        echo   ERROR: Python 3.9+ required. Found Python !PY_VER!
        echo   Download from: https://python.org
        pause
        exit /b 1
    )
)
echo   OK: Python !PY_VER! found.

:: -------------------------------------------------------
:: [2/7] CHECK NODE.JS 18+
:: -------------------------------------------------------
echo [2/7] Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Node.js is not installed or not in PATH.
    echo   Please install Node.js 18+ from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "delims=v" %%v in ('node --version') do set "NODE_VER=%%v"
for /f "tokens=1 delims=." %%a in ("!NODE_VER!") do set "NODE_MAJOR=%%a"
if !NODE_MAJOR! LSS 18 (
    echo   ERROR: Node.js 18+ required. Found Node v!NODE_VER!
    echo   Download from: https://nodejs.org
    pause
    exit /b 1
)
echo   OK: Node.js v!NODE_VER! found.

:: -------------------------------------------------------
:: [3/7] CHECK NPM
:: -------------------------------------------------------
echo [3/7] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: npm is not available. Please reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
)
for /f %%v in ('npm --version') do set "NPM_VER=%%v"
echo   OK: npm v!NPM_VER! found.

:: -------------------------------------------------------
:: [4/7] CREATE PYTHON VENV
:: -------------------------------------------------------
echo [4/7] Setting up Python virtual environment...
if exist "venv\" (
    echo   OK: venv already exists, skipping creation.
) else (
    python -m venv venv
    if errorlevel 1 (
        echo   ERROR: Failed to create Python virtual environment.
        pause
        exit /b 1
    )
    echo   OK: Virtual environment created.
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo   ERROR: Failed to activate virtual environment.
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: [5/7] INSTALL PYTHON DEPENDENCIES
:: -------------------------------------------------------
echo [5/7] Installing Python dependencies...
pip install -r src_python\requirements.txt --quiet
if errorlevel 1 (
    echo   ERROR: Failed to install Python dependencies.
    echo   Check src_python\requirements.txt and your internet connection.
    pause
    exit /b 1
)
echo   OK: Python dependencies installed.

:: -------------------------------------------------------
:: [6/7] INSTALL NODE.JS DEPENDENCIES & BUILD ARCHIVES
:: -------------------------------------------------------
echo [6/7] Installing Node.js dependencies and generating formula pack archives...
npm install --prefix src_electron --silent
if errorlevel 1 (
    echo   ERROR: Failed to install Node.js dependencies.
    echo   Check src_electron\package.json and your internet connection.
    pause
    exit /b 1
)
python src_python\build_packs_archive.py
if errorlevel 1 (
    echo   WARNING: Could not generate formula pack archives automatically.
)
echo   OK: Dependencies and offline archives ready.

:: -------------------------------------------------------
:: [7/7] BUILD FRONTEND
:: -------------------------------------------------------
echo [7/7] Building frontend...
npm run build --prefix src_electron
if errorlevel 1 (
    echo   ERROR: Frontend build failed.
    echo   Check src_electron\ for build errors.
    pause
    exit /b 1
)
echo   OK: Frontend built successfully.

:: -------------------------------------------------------
:: WRITE launch.bat
:: -------------------------------------------------------
echo.
echo Writing launch.bat...

set "PROJ_DIR=%~dp0"
:: Remove trailing backslash
if "!PROJ_DIR:~-1!"=="\" set "PROJ_DIR=!PROJ_DIR:~0,-1!"

(
    echo @echo off
    echo title SuperCalcee
    echo setlocal
    echo cd /d "!PROJ_DIR!"
    echo echo.
    echo echo ========================================
    echo echo   SuperCalcee is starting...
    echo echo ========================================
    echo echo.
    echo call venv\Scripts\activate.bat
    echo if errorlevel 1 ^(
    echo     echo ERROR: Could not activate virtual environment. Run install.bat first.
    echo     pause
    echo     exit /b 1
    echo ^)
    echo echo [1/2] Starting Python API...
    echo start "" /B venv\Scripts\python.exe src_python\api.py
    echo timeout /t 3 /nobreak ^>nul
    echo echo [2/2] Launching Electron...
    echo src_electron\node_modules\.bin\electron.cmd src_electron\main.cjs
    echo if errorlevel 1 ^(
    echo     echo.
    echo     echo ERROR: Electron exited with an error.
    echo     echo Check that the frontend was built ^(run install.bat if unsure^).
    echo     echo.
    echo     pause
    echo ^)
    echo endlocal
) > launch.bat

if errorlevel 1 (
    echo   ERROR: Failed to write launch.bat
    pause
    exit /b 1
)
echo   OK: launch.bat created.

:: -------------------------------------------------------
:: CREATE DESKTOP SHORTCUT
:: -------------------------------------------------------
echo Creating Desktop shortcut...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $sc = $ws.CreateShortcut($desktop + '\SuperCalcee.lnk'); $sc.TargetPath = '!PROJ_DIR!\launch.bat'; $sc.WorkingDirectory = '!PROJ_DIR!'; $sc.Description = 'Launch SuperCalcee'; $sc.IconLocation = '%SystemRoot%\System32\SHELL32.dll,41'; $sc.Save()"

if errorlevel 1 (
    echo   WARNING: Could not create Desktop shortcut. You can run launch.bat manually.
) else (
    echo   OK: Desktop shortcut created.
)

:: -------------------------------------------------------
:: SUCCESS
:: -------------------------------------------------------
echo.
echo ======================================================
echo   Installation Complete!
echo ======================================================
echo.
echo To launch SuperCalcee:
echo   - Double-click launch.bat in this folder, or
echo   - Use the SuperCalcee shortcut on your Desktop.
echo.
pause
endlocal
