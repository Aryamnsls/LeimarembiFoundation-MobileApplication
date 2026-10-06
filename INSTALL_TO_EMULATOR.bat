@echo off
title Install Mobile App to Emulator
color 0A
set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
set APK="D:\LF\mobile\android\app\build\outputs\apk\debug\app-debug.apk"

echo ======================================================================
echo   INSTALLING LEIMAREMBI FOUNDATION TO ANDROID EMULATOR
echo ======================================================================
echo.
echo Checking for active emulator...
%ADB% devices
echo.
echo Installing APK to your running emulator...
%ADB% install -r %APK%
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo   SUCCESS! App (com.anonymous.mobile) installed on your emulator!
    echo   Now go to your 'RUN_APP' terminal and press 'a' to open it.
    echo ======================================================================
) else (
    echo.
    echo [NOTE] If installation failed, make sure your Android Emulator is running.
    echo Alternatively, drag & drop the APK file onto your emulator screen:
    echo %APK%
)
echo.
pause
