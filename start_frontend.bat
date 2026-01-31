@echo off
echo ====================================
echo AI Prompt2CV Builder - Frontend Setup
echo ====================================
echo.

cd frontend

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ====================================
echo Setup complete!
echo ====================================
echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:3000
echo Make sure the backend is running at: http://localhost:8000
echo.

call npm run dev

pause
