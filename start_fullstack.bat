@echo off
echo ====================================
echo AI Prompt2CV Builder - Full Stack Startup
echo ====================================
echo.
echo This will start both backend and frontend servers
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "cd /d "%~dp0" && python -m backend.main"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close this window or press any key to exit...
pause >nul
