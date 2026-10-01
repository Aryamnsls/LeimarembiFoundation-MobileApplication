@echo off
title Leimarembi Foundation - Push to GitHub
color 0A
cd /d D:\LeimarembiFoundation-MobileApplication

echo ======================================================================
echo   LEIMAREMBI FOUNDATION - UPLOADING MOBILE APP TO GITHUB
echo ======================================================================
echo.
echo Target Repository: https://github.com/Aryamnsls/LeimarembiFoundation-MobileApplication
echo.
echo A GitHub sign-in window will open in your browser.
echo Please click "Sign in with your browser" and "Authorize".
echo.
echo Uploading now...
echo.

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo   SUCCESS! ALL MOBILE APP FILES UPLOADED SUCCESSFULLY TO GITHUB!
    echo ======================================================================
    echo.
    echo Refresh this page in your browser right now:
    echo https://github.com/Aryamnsls/LeimarembiFoundation-MobileApplication
    echo.
) else (
    echo ======================================================================
    echo   Push did not complete. If prompted, please authorize GitHub.
    echo ======================================================================
)
echo.
pause
