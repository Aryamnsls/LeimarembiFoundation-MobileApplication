@echo off
title Leimarembi Foundation Mobile Suite
color 0B
cd /d D:\LeimarembiFoundation-MobileApplication

echo ======================================================================
echo   LEIMAREMBI FOUNDATION - OFFICIAL MOBILE APPLICATION
echo ======================================================================
echo.
echo Starting mobile server...
echo.
echo   [a] Press 'a' to launch on your active Android Emulator (Pixel 9 Pro)
echo   [w] Press 'w' to launch mobile preview in your Web Browser
echo   [r] Press 'r' to reload the app
echo.
echo ======================================================================
echo.

npx expo start
pause
