@echo off
echo =========================================
echo    Starting ZeroWaste AI Services...
echo =========================================

echo 1. Starting Backend Server (Port 3001)...
start "ZeroWaste Backend" cmd /c "cd server && npm run dev"

echo 2. Starting React Frontend (Port 5173)...
start "ZeroWaste Frontend" cmd /c "cd client && npm run dev"

echo 3. Starting AI Microservice (Port 5001)...
start "ZeroWaste AI Service" cmd /c "cd ai-service && .\venv\Scripts\activate && python app.py"

echo.
echo All services have been launched in separate windows!
echo You can safely close this script window.
pause
