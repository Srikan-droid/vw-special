@echo off
cd /d "c:\VW Special"
echo Starting server at http://localhost:8080
echo Open that link in Chrome, then press Ctrl+C here to stop.
echo.
python -m http.server 8080
pause
