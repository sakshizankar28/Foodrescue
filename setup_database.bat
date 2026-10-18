@echo off
title FoodRescue - Database Setup
echo ========================================================
echo   FoodRescue MySQL Database Setup (MySQL 8.0)
echo ========================================================
echo.
echo This script will execute database\database.sql to create
echo the foodrescue_db database and its 3 core tables.
echo.

set /p DBPASS="Enter your MySQL root password: "

echo.
echo Running database\database.sql...
if "%DBPASS%"=="" (
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root < "%~dp0database\database.sql"
) else (
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"%DBPASS%" < "%~dp0database\database.sql"
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] foodrescue_db and all tables created successfully!
    echo ========================================================
    echo.
    echo Tables created:
    echo   1. users
    echo   2. food_listings
    echo   3. food_requests
    echo.
) else (
    echo.
    echo [FAILED] Could not connect to MySQL. Please check your password.
)
pause
